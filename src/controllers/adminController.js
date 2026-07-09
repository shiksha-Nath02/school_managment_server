const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Student, Teacher, Class, TeacherAttendance, Attendance, Mark, StudentFee, FeePayment, Inventory, InventoryTransaction, Session, Timetable, UniformTransaction, UniformItem, UniformTransactionItem, UniformPayment, BookTransaction, BookItem, BookPayment, AdmissionFee, sequelize } = require('../models');
const { saveBase64Image } = require('../utils/imageHelper');
const { publicUrl } = require('../utils/s3');
const { generateStudentPassword } = require('../utils/credentials');
const selfAttendanceSettings = require('../utils/selfAttendanceSettings');

const studentIncludes = [
  { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'is_active'] },
  { model: Class, as: 'class', attributes: ['id', 'class_name', 'section'] },
];

// All editable columns on the teachers table (everything except id/user_id/timestamps).
// addTeacher/updateTeacher copy any of these present in the request body, so the admin
// panel can save the full teacher profile, not just subject/salary/joining_date.
const TEACHER_FIELDS = [
  'subject', 'salary', 'joining_date',
  'date_of_birth', 'gender', 'aadhaar_number', 'blood_group', 'marital_status',
  'address', 'city', 'state', 'pincode', 'alternate_phone',
  'emergency_contact_name', 'emergency_contact_phone',
  'qualification', 'designation', 'department', 'experience_years',
  'employment_type', 'date_of_leaving',
  'pan_number', 'bank_account_number', 'bank_ifsc', 'bank_name',
];

// User columns the admin may edit on a teacher (login id = username = phone).
const pick = (src, keys) => keys.reduce((o, k) => {
  if (src[k] !== undefined) o[k] = src[k];
  return o;
}, {});

const LATE_THRESHOLD = { hour: 9, minute: 30 }; // 9:30 AM

// ─────────── HELPER ───────────
const formatRecord = (r) => ({
  id: r.id,
  teacherId: r.teacher_id,
  date: r.date,
  status: r.status,
  checkInTime: r.check_in_time,
  checkInImage: publicUrl(r.check_in_image),
  checkOutTime: r.check_out_time,
  checkOutImage: publicUrl(r.check_out_image),
  leaveType: r.leave_type,
  remarks: r.remarks,
  isVerified: r.is_verified || false,
  verifiedAt: r.verified_at || null,
});

// ─────────── STUDENTS ───────────
const addStudent = async (req, res) => {
  let t;
  try {
    const {
      name, username, email, phone, password, class_id, roll_number, date_of_birth, address, admission_date,
      aadhaar_number, blood_group, category, religion, nationality,
      city, state, pincode,
      father_name, father_phone, father_aadhaar,
      mother_name, mother_phone, mother_aadhaar,
      parents_pan, birth_certificate_number, ews_certificate_number,
      pen_number, apaar_id,
    } = req.body;
    if (!name || !username || !class_id || !roll_number)
      return res.status(400).json({ message: 'Name, username (admission number), class, and roll number are required' });

    if (await User.findOne({ where: { username } }))
      return res.status(409).json({ message: `Username (admission number) ${username} already exists` });

    if (email && await User.findOne({ where: { email } }))
      return res.status(409).json({ message: 'Email already registered' });

    if (!await Class.findByPk(class_id))
      return res.status(404).json({ message: 'Class not found' });

    if (await Student.findOne({ where: { class_id, roll_number } }))
      return res.status(409).json({ message: `Roll number ${roll_number} already exists in this class` });

    // Default password = birth year + first 4 letters of name (e.g. "2003shik").
    // A date_of_birth is required to derive it unless an explicit password is given.
    let plainPassword = password;
    if (!plainPassword) {
      if (!date_of_birth)
        return res.status(400).json({ message: 'date_of_birth is required to generate the default password' });
      plainPassword = generateStudentPassword(name, date_of_birth);
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    t = await sequelize.transaction();
    const user = await User.create({ name, username, email: email || null, password: hashedPassword, role: 'student', phone: phone || null }, { transaction: t });
    const student = await Student.create({
      user_id: user.id, class_id, roll_number,
      admission_number: username,
      date_of_birth: date_of_birth || null,
      address: address || null,
      admission_date: admission_date || new Date(),
      aadhaar_number: aadhaar_number || null,
      blood_group: blood_group || null,
      category: category || null,
      religion: religion || null,
      nationality: nationality || 'Indian',
      city: city || null,
      state: state || null,
      pincode: pincode || null,
      father_name: father_name || null,
      father_phone: father_phone || null,
      father_aadhaar: father_aadhaar || null,
      mother_name: mother_name || null,
      mother_phone: mother_phone || null,
      mother_aadhaar: mother_aadhaar || null,
      parents_pan: parents_pan || null,
      birth_certificate_number: birth_certificate_number || null,
      ews_certificate_number: ews_certificate_number || null,
      pen_number: pen_number || null,
      apaar_id: apaar_id || null,
    }, { transaction: t });

    // Give the new student a pending admission-fee row for the active session
    // (inherits the session's annual charge). New = not assumed paid.
    const activeSession = await Session.findOne({ where: { is_active: true }, transaction: t });
    if (activeSession) {
      await AdmissionFee.create({
        student_id: student.id,
        session_id: activeSession.id,
        annual_charge: parseFloat(activeSession.admission_fee) || 0,
        discount: 0,
        paid_amount: 0,
        assumed_paid: false,
      }, { transaction: t });
    }

    await t.commit();

    const fullStudent = await Student.findByPk(student.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Class, as: 'class', attributes: ['id', 'class_name', 'section'] },
      ],
    });
    res.status(201).json({ message: 'Student added successfully', student: fullStudent });
  } catch (error) {
    if (t) await t.rollback();
    console.error('Add student error:', error);
    res.status(500).json({ message: 'Failed to add student' });
  }
};

const getStudents = async (req, res) => {
  try {
    const { class_id, search } = req.query;
    const where = {};
    if (class_id) where.class_id = parseInt(class_id, 10);
    const students = await Student.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'], ...(search ? { where: { name: { [Op.like]: `%${search}%` } } } : {}) },
        { model: Class, as: 'class', attributes: ['id', 'class_name', 'section'] },
      ],
      order: [['roll_number', 'ASC']],
    });
    res.json({ students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Class, as: 'class', attributes: ['id', 'class_name', 'section'] },
      ],
    });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ student });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student' });
  }
};

const updateStudent = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const student = await Student.findByPk(req.params.id, { include: [{ model: User, as: 'user' }] });
    if (!student) { await t.rollback(); return res.status(404).json({ message: 'Student not found' }); }

    const { name, email, phone, password, class_id, roll_number, date_of_birth, address, admission_date, admission_number } = req.body;

    if (email && email !== student.user.email && await User.findOne({ where: { email, id: { [Op.ne]: student.user_id } } })) {
      await t.rollback();
      return res.status(409).json({ message: 'Email already in use' });
    }

    // Admission number is the student's login username. Editing it keeps the two in
    // sync, so check the new value isn't already taken by another user.
    if (admission_number !== undefined && String(admission_number) !== String(student.admission_number || '')) {
      if (!String(admission_number).trim()) { await t.rollback(); return res.status(400).json({ message: 'Admission number cannot be empty' }); }
      const clash = await User.findOne({ where: { username: admission_number, id: { [Op.ne]: student.user_id } } });
      if (clash) { await t.rollback(); return res.status(409).json({ message: `Admission number ${admission_number} is already in use` }); }
    }
    if (class_id && roll_number) {
      const conflict = await Student.findOne({ where: { class_id, roll_number, id: { [Op.ne]: student.id } } });
      if (conflict) { await t.rollback(); return res.status(409).json({ message: `Roll number ${roll_number} already exists in this class` }); }
    }
    if (class_id && !await Class.findByPk(class_id)) {
      await t.rollback();
      return res.status(404).json({ message: 'Class not found' });
    }

    const userUpdates = {};
    if (name !== undefined) userUpdates.name = name;
    if (email !== undefined) userUpdates.email = email;
    if (phone !== undefined) userUpdates.phone = phone;
    if (password) userUpdates.password = await bcrypt.hash(password, 10);
    const admissionChanged = admission_number !== undefined && String(admission_number) !== String(student.admission_number || '');
    if (admissionChanged) userUpdates.username = admission_number;

    const studentUpdates = {};
    if (class_id !== undefined) studentUpdates.class_id = class_id;
    if (roll_number !== undefined) studentUpdates.roll_number = roll_number;
    if (date_of_birth !== undefined) studentUpdates.date_of_birth = date_of_birth;
    if (address !== undefined) studentUpdates.address = address;
    if (admission_date !== undefined) studentUpdates.admission_date = admission_date;
    if (admissionChanged) studentUpdates.admission_number = admission_number;

    const extendedFields = [
      'aadhaar_number', 'father_name', 'father_phone', 'father_aadhaar',
      'mother_name', 'mother_phone', 'mother_aadhaar', 'parents_pan',
      'category', 'religion', 'nationality', 'blood_group',
      'birth_certificate_number', 'ews_certificate_number',
      'pincode', 'city', 'state', 'status', 'pen_number', 'apaar_id',
    ];
    for (const field of extendedFields) {
      if (req.body[field] !== undefined) studentUpdates[field] = req.body[field] || null;
    }

    if (Object.keys(userUpdates).length) await student.user.update(userUpdates, { transaction: t });
    if (Object.keys(studentUpdates).length) await student.update(studentUpdates, { transaction: t });
    await t.commit();

    const updated = await Student.findByPk(student.id, { include: studentIncludes });
    res.json({ message: 'Student updated', student: updated });
  } catch (error) {
    await t.rollback();
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Failed to update student' });
  }
};

const removeStudent = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const student = await Student.findByPk(req.params.id, { include: [{ model: User, as: 'user' }] });
    if (!student) { await t.rollback(); return res.status(404).json({ message: 'Student not found' }); }
    if (student.status === 'inactive') { await t.rollback(); return res.status(400).json({ message: 'Student is already inactive' }); }

    await student.update({ status: 'inactive' }, { transaction: t });
    await student.user.update({ is_active: false }, { transaction: t });
    await t.commit();
    res.json({ message: 'Student removed (marked inactive)', studentId: student.id });
  } catch (error) {
    await t.rollback();
    console.error('Remove student error:', error);
    res.status(500).json({ message: 'Failed to remove student' });
  }
};

const getClasses = async (req, res) => {
  try {
    const classes = await Class.findAll({ attributes: ['id', 'class_name', 'section'], order: [['class_name', 'ASC'], ['section', 'ASC']] });
    res.json({ classes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch classes' });
  }
};

// ─────────── TEACHERS ───────────
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'username', 'email', 'phone', 'is_active'], where: { is_active: true } }],
      order: [['id', 'ASC']],
    });
    res.json({ teachers });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ message: 'Failed to fetch teachers' });
  }
};

const addTeacher = async (req, res) => {
  let t;
  try {
    const { name, username, email, phone, password, subject, salary, joining_date } = req.body;
    if (!name || !username || !password)
      return res.status(400).json({ message: 'name, username (teacher ID), and password are required' });

    if (await User.findOne({ where: { username } }))
      return res.status(409).json({ message: `Username (teacher ID) ${username} already exists` });

    if (email && await User.findOne({ where: { email } }))
      return res.status(409).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    t = await sequelize.transaction();
    const user = await User.create({ name, username, email: email || null, password: hashedPassword, role: 'teacher', phone: phone || null }, { transaction: t });
    const teacher = await Teacher.create({
      user_id: user.id,
      ...pick(req.body, TEACHER_FIELDS),
    }, { transaction: t });
    await t.commit();

    const full = await Teacher.findByPk(teacher.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'username', 'email', 'phone'] }],
    });
    res.status(201).json({ message: 'Teacher added successfully', teacher: full });
  } catch (error) {
    if (t) await t.rollback();
    console.error('Add teacher error:', error);
    res.status(500).json({ message: 'Failed to add teacher' });
  }
};

const updateTeacher = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const teacher = await Teacher.findByPk(req.params.id, { include: [{ model: User, as: 'user' }] });
    if (!teacher) { await t.rollback(); return res.status(404).json({ message: 'Teacher not found' }); }

    const { email, username, password } = req.body;

    if (email && email !== teacher.user.email && await User.findOne({ where: { email, id: { [Op.ne]: teacher.user_id } } })) {
      await t.rollback();
      return res.status(409).json({ message: 'Email already in use' });
    }
    if (username && username !== teacher.user.username && await User.findOne({ where: { username, id: { [Op.ne]: teacher.user_id } } })) {
      await t.rollback();
      return res.status(409).json({ message: 'Username (login ID) already in use' });
    }

    const userUpdates = pick(req.body, ['name', 'email', 'phone', 'username']);
    if (password) userUpdates.password = await bcrypt.hash(password, 10);

    const teacherUpdates = pick(req.body, TEACHER_FIELDS);

    if (Object.keys(userUpdates).length) await teacher.user.update(userUpdates, { transaction: t });
    if (Object.keys(teacherUpdates).length) await teacher.update(teacherUpdates, { transaction: t });
    await t.commit();

    const updated = await Teacher.findByPk(teacher.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'username', 'email', 'phone'] }],
    });
    res.json({ message: 'Teacher updated', teacher: updated });
  } catch (error) {
    await t.rollback();
    console.error('Update teacher error:', error);
    res.status(500).json({ message: 'Failed to update teacher' });
  }
};

const removeTeacher = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const teacher = await Teacher.findByPk(req.params.id, { include: [{ model: User, as: 'user' }] });
    if (!teacher) { await t.rollback(); return res.status(404).json({ message: 'Teacher not found' }); }
    if (!teacher.user.is_active) { await t.rollback(); return res.status(400).json({ message: 'Teacher is already inactive' }); }

    await teacher.user.update({ is_active: false }, { transaction: t });
    await t.commit();
    res.json({ message: 'Teacher removed (marked inactive)', teacherId: teacher.id });
  } catch (error) {
    await t.rollback();
    console.error('Remove teacher error:', error);
    res.status(500).json({ message: 'Failed to remove teacher' });
  }
};

// PUT /api/admin/teachers/:id/permissions  — SUPERADMIN ONLY (guarded in routes).
// Toggles whether this teacher may edit students in her own class.
const setTeacherPermissions = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const { can_edit_students } = req.body;
    if (typeof can_edit_students !== 'boolean')
      return res.status(400).json({ message: 'can_edit_students (true/false) is required' });

    await teacher.update({ can_edit_students });
    res.json({ message: 'Permissions updated', teacherId: teacher.id, can_edit_students: teacher.can_edit_students });
  } catch (error) {
    console.error('Set teacher permissions error:', error);
    res.status(500).json({ message: 'Failed to update permissions' });
  }
};

// ─────────── TEACHER ATTENDANCE — READ ───────────
const getTeacherAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date query param is required' });

    const records = await TeacherAttendance.findAll({
      where: { date },
      include: [{ model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: ['name'] }] }],
    });

    res.json({
      date,
      records: records.map((r) => ({
        ...formatRecord(r),
        teacherName: r.teacher?.user?.name || 'Unknown',
      })),
    });
  } catch (error) {
    console.error('Get teacher attendance error:', error);
    res.status(500).json({ message: 'Failed to fetch teacher attendance' });
  }
};

// ─────────── TEACHER ATTENDANCE — WRITE ───────────
const checkInTeacher = async (req, res) => {
  try {
    const { teacherId, image_base64 } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const checkInTime = new Date().toTimeString().slice(0, 8); // HH:MM:SS

    const existing = await TeacherAttendance.findOne({ where: { teacher_id: teacherId, date: today } });
    if (existing) {
      if (existing.check_in_time) return res.status(400).json({ message: 'Already checked in today' });
      return res.status(400).json({ message: `Already marked as ${existing.status}` });
    }

    const [h, m] = checkInTime.split(':').map(Number);
    const isLate = h > LATE_THRESHOLD.hour || (h === LATE_THRESHOLD.hour && m > LATE_THRESHOLD.minute);

    let imagePath = null;
    if (image_base64) {
      imagePath = await saveBase64Image(image_base64, `checkin_${teacherId}_${today}.jpg`);
    }

    const record = await TeacherAttendance.create({
      teacher_id: teacherId,
      date: today,
      status: isLate ? 'late' : 'present',
      check_in_time: checkInTime,
      check_in_image: imagePath,
      is_verified: false,
    });

    res.json({ message: `Checked in as ${record.status}`, record: formatRecord(record) });
  } catch (error) {
    console.error('Check in error:', error);
    res.status(500).json({ message: 'Failed to check in' });
  }
};

const checkOutTeacher = async (req, res) => {
  try {
    const { teacherId, image_base64 } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const checkOutTime = new Date().toTimeString().slice(0, 8);

    const record = await TeacherAttendance.findOne({ where: { teacher_id: teacherId, date: today } });
    if (!record || !record.check_in_time) return res.status(400).json({ message: 'Teacher has not checked in yet' });
    if (record.check_out_time) return res.status(400).json({ message: 'Already checked out' });

    const [ciH, ciM] = record.check_in_time.split(':').map(Number);
    const [coH, coM] = checkOutTime.split(':').map(Number);
    const totalMinutes = (coH * 60 + coM) - (ciH * 60 + ciM);
    const newStatus = totalMinutes < 240 ? 'half_day' : record.status;

    let imagePath = null;
    if (image_base64) {
      imagePath = await saveBase64Image(image_base64, `checkout_${teacherId}_${today}.jpg`);
    }

    await record.update({ check_out_time: checkOutTime, status: newStatus, check_out_image: imagePath });
    await record.reload();
    res.json({ message: 'Checked out', record: formatRecord(record), halfDay: totalMinutes < 240 });
  } catch (error) {
    console.error('Check out error:', error);
    res.status(500).json({ message: 'Failed to check out' });
  }
};

// ─────────── SELF-ATTENDANCE SETTINGS ───────────
const getSelfAttendanceSetting = (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const date = req.query.date || today;
  res.json({ date, enabled: selfAttendanceSettings.isEnabled(date) });
};

const toggleSelfAttendance = (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const date = req.body.date || today;
  const { enabled } = req.body;
  selfAttendanceSettings.setEnabled(date, enabled);
  res.json({ date, enabled: selfAttendanceSettings.isEnabled(date) });
};

const markTeacherStatus = async (req, res) => {
  try {
    const { teacherId, date, status, leaveType, remarks } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const [record, created] = await TeacherAttendance.findOrCreate({
      where: { teacher_id: teacherId, date: targetDate },
      defaults: { status, leave_type: leaveType || null, remarks: remarks || null },
    });

    if (!created) await record.update({ status, leave_type: leaveType || null, remarks: remarks || null });

    res.json({ message: 'Status updated', record: formatRecord(record) });
  } catch (error) {
    console.error('Mark status error:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

const updateTeacherAttendance = async (req, res) => {
  try {
    const record = await TeacherAttendance.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });

    const { status, checkInTime, checkOutTime, leaveType, remarks } = req.body;
    const updates = {};
    if (status !== undefined) updates.status = status;
    if (checkInTime !== undefined) updates.check_in_time = checkInTime || null;
    if (checkOutTime !== undefined) updates.check_out_time = checkOutTime || null;
    if (leaveType !== undefined) updates.leave_type = leaveType || null;
    if (remarks !== undefined) updates.remarks = remarks || null;

    await record.update(updates);
    res.json({ message: 'Record updated', record: formatRecord(record) });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Failed to update record' });
  }
};

const bulkMarkAbsent = async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const [teachers, existing] = await Promise.all([
      Teacher.findAll(),
      TeacherAttendance.findAll({ where: { date: targetDate } }),
    ]);

    const existingIds = new Set(existing.map((r) => r.teacher_id));
    const toMark = teachers.filter((t) => !existingIds.has(t.id));

    if (toMark.length === 0) return res.json({ message: 'All teachers already have records', count: 0 });

    await TeacherAttendance.bulkCreate(toMark.map((t) => ({ teacher_id: t.id, date: targetDate, status: 'absent' })));
    res.json({ message: `Marked ${toMark.length} teachers as absent`, count: toMark.length });
  } catch (error) {
    console.error('Bulk absent error:', error);
    res.status(500).json({ message: 'Failed to bulk mark absent' });
  }
};

const getTeacherAttendanceSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    const mm = String(monthNum).padStart(2, '0');
    const lastDay = new Date(yearNum, monthNum, 0).getDate();
    const startDate = `${yearNum}-${mm}-01`;
    const endDate = `${yearNum}-${mm}-${String(lastDay).padStart(2, '0')}`;

    const [teachers, records] = await Promise.all([
      Teacher.findAll({
        include: [{ model: User, as: 'user', attributes: ['name'] }],
        order: [['id', 'ASC']],
      }),
      TeacherAttendance.findAll({ where: { date: { [Op.between]: [startDate, endDate] } } }),
    ]);

    const summaryMap = {};
    for (const t of teachers) {
      summaryMap[t.id] = { teacherId: t.id, teacherName: t.user?.name || 'Unknown', subject: t.subject || '', present: 0, late: 0, half_day: 0, absent: 0, on_leave: 0, official_duty: 0, total: 0 };
    }
    for (const r of records) {
      if (summaryMap[r.teacher_id]) {
        summaryMap[r.teacher_id][r.status] = (summaryMap[r.teacher_id][r.status] || 0) + 1;
        summaryMap[r.teacher_id].total++;
      }
    }

    res.json({ summary: Object.values(summaryMap), month: monthNum, year: yearNum });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ message: 'Failed to fetch summary' });
  }
};

// ─────────── STUDENT PROFILE — DETAIL ENDPOINTS ───────────

const getStudentAttendance = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const { year } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();

    const startDate = `${targetYear}-01-01`;
    const endDate = `${targetYear}-12-31`;

    const records = await Attendance.findAll({
      where: { student_id: student.id, date: { [Op.between]: [startDate, endDate] } },
      order: [['date', 'ASC']],
    });

    const monthlyBreakdown = {};
    for (let m = 1; m <= 12; m++) {
      monthlyBreakdown[m] = { present: 0, absent: 0, total: 0 };
    }

    let totalPresent = 0;
    let totalAbsent = 0;

    for (const r of records) {
      const month = new Date(r.date).getMonth() + 1;
      if (r.status === 'present') { monthlyBreakdown[month].present++; totalPresent++; }
      else { monthlyBreakdown[month].absent++; totalAbsent++; }
      monthlyBreakdown[month].total++;
    }

    const totalDays = totalPresent + totalAbsent;
    res.json({
      studentId: student.id,
      year: targetYear,
      totalDays,
      presentDays: totalPresent,
      absentDays: totalAbsent,
      percentage: totalDays ? Math.round((totalPresent / totalDays) * 100) : 0,
      monthlyBreakdown,
      records: records.map((r) => ({ date: r.date, status: r.status })),
    });
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
};

const getStudentMarks = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const marks = await Mark.findAll({
      where: { student_id: student.id },
      order: [['exam_type', 'ASC'], ['subject', 'ASC']],
    });

    // Group by exam_type
    const byExam = {};
    for (const m of marks) {
      if (!byExam[m.exam_type]) byExam[m.exam_type] = { examType: m.exam_type, subjects: [], totalObtained: 0, totalMax: 0 };
      const obtained = m.is_absent ? null : parseFloat(m.marks_obtained);
      byExam[m.exam_type].subjects.push({
        subject: m.subject,
        marksObtained: obtained,
        maxMarks: m.max_marks,
        isAbsent: m.is_absent,
        remark: m.remark,
        percentage: (!m.is_absent && obtained !== null) ? Math.round((obtained / m.max_marks) * 100) : null,
      });
      if (!m.is_absent && obtained !== null) {
        byExam[m.exam_type].totalObtained += obtained;
        byExam[m.exam_type].totalMax += m.max_marks;
      }
    }

    const exams = Object.values(byExam).map((e) => ({
      ...e,
      percentage: e.totalMax ? Math.round((e.totalObtained / e.totalMax) * 100) : null,
    }));

    res.json({ studentId: student.id, exams });
  } catch (error) {
    console.error('Get student marks error:', error);
    res.status(500).json({ message: 'Failed to fetch marks' });
  }
};

const getStudentFees = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const [feeConfigs, payments] = await Promise.all([
      StudentFee.findAll({
        where: { student_id: student.id },
        include: [{ model: Session, as: 'session', attributes: ['id', 'name', 'start_year', 'end_year'] }],
        order: [['id', 'DESC']],
      }),
      FeePayment.findAll({
        where: { student_id: student.id },
        order: [['billing_year', 'DESC'], ['billing_month', 'DESC']],
      }),
    ]);

    const totalPaid = payments
      .filter((p) => !p.is_reversal)
      .reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0);

    const totalPending = payments
      .filter((p) => !p.is_reversal)
      .reduce((sum, p) => sum + parseFloat(p.pending_after || 0), 0);

    // Latest pending_after is the true outstanding
    const latestPending = payments.length > 0 ? parseFloat(payments[0].pending_after || 0) : 0;

    res.json({
      studentId: student.id,
      feeConfigs,
      payments: payments.map((p) => ({
        id: p.id,
        billingMonth: p.billing_month,
        billingYear: p.billing_year,
        amountPaid: parseFloat(p.amount_paid),
        fineAmount: parseFloat(p.fine_amount),
        pendingAfter: parseFloat(p.pending_after),
        paymentDate: p.payment_date,
        paymentMethod: p.payment_method,
        receiptNumber: p.receipt_number,
        isReversal: p.is_reversal,
        remarks: p.remarks,
      })),
      summary: { totalPaid, latestPending },
    });
  } catch (error) {
    console.error('Get student fees error:', error);
    res.status(500).json({ message: 'Failed to fetch fees' });
  }
};

// GET /api/admin/student-lookup?admission_number=1151
// Used by the uniform/book sell forms to auto-fill student details.
const lookupStudent = async (req, res) => {
  try {
    const { admission_number } = req.query;
    if (!admission_number) return res.status(400).json({ message: 'admission_number is required' });
    const student = await Student.findOne({
      where: { admission_number },
      include: [
        { model: User, as: 'user', attributes: ['name', 'phone'] },
        { model: Class, as: 'class', attributes: ['class_name', 'section'] },
      ],
    });
    if (!student) return res.json({ student: null });
    res.json({
      student: {
        id:              student.id,
        admissionNumber: student.admission_number,
        name:            student.user?.name || null,
        fatherName:      student.father_name || null,
        fatherPhone:     student.father_phone || null,
        className:       student.class ? `${student.class.class_name} ${student.class.section}` : null,
      },
    });
  } catch (e) {
    console.error('Student lookup error:', e);
    res.status(500).json({ message: 'Lookup failed' });
  }
};

const getStudentInventory = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const [uniformTxns, bookTxns] = await Promise.all([
      UniformTransaction.findAll({
        where: { student_id: student.id },
        include: [
          { model: UniformItem, as: 'item' },
          { model: UniformTransactionItem, as: 'items', include: [{ model: UniformItem, as: 'item' }] },
          { model: UniformPayment, as: 'payments', order: [['payment_date', 'ASC']] },
        ],
        order: [['created_at', 'DESC']],
      }),
      BookTransaction.findAll({
        where: { student_id: student.id },
        include: [
          { model: BookItem, as: 'item' },
          { model: BookPayment, as: 'payments', order: [['payment_date', 'ASC']] },
        ],
        order: [['created_at', 'DESC']],
      }),
    ]);

    const mapTxn = (t, type) => ({
      id:          t.id,
      type,
      date:        t.created_at,
      itemName:    type === 'uniform'
        ? (t.items && t.items.length > 0
            ? t.items.map((li) => `${li.item?.item_name || '—'}${li.item?.size ? ` (${li.item.size})` : ''}${li.quantity > 1 ? ` ×${li.quantity}` : ''}`).join(', ')
            : `${t.item?.item_name || '—'} (${t.item?.size || '—'})`)
        : (t.item?.book_name || '—'),
      className:   type === 'book'    ? (t.item?.class_name || null) : null,
      subject:     type === 'book'    ? (t.item?.subject    || null) : null,
      quantity:    t.quantity,
      toBePaid:    parseFloat(t.to_be_paid),
      paid:        parseFloat(t.paid),
      left:        parseFloat(t.to_be_paid) - parseFloat(t.paid),
      payments:    (t.payments || []).map((p) => ({
        id:          p.id,
        amountPaid:  parseFloat(p.amount_paid),
        paymentDate: p.payment_date,
        remarks:     p.remarks,
      })),
    });

    const transactions = [
      ...uniformTxns.map((t) => mapTxn(t, 'uniform')),
      ...bookTxns.map((t) => mapTxn(t, 'book')),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalSpent   = transactions.reduce((s, t) => s + t.paid,     0);
    const totalPending = transactions.reduce((s, t) => s + t.left,     0);

    res.json({
      studentId:       student.id,
      admissionNumber: student.admission_number,
      transactions,
      summary: { totalTransactions: transactions.length, totalSpent, totalPending },
    });
  } catch (error) {
    console.error('Get student inventory error:', error);
    res.status(500).json({ message: 'Failed to fetch inventory' });
  }
};

// Keep old bulk submit for backward compat
const submitTeacherAttendance = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { date, attendance } = req.body;
    if (!date || !Array.isArray(attendance) || attendance.length === 0)
      return res.status(400).json({ message: 'date and attendance array are required' });

    for (const entry of attendance) {
      const [record, created] = await TeacherAttendance.findOrCreate({ where: { teacher_id: entry.teacherId, date }, defaults: { status: entry.status }, transaction: t });
      if (!created) await record.update({ status: entry.status }, { transaction: t });
    }
    await t.commit();
    res.json({ message: 'Attendance saved', present: attendance.filter((e) => e.status === 'present').length, absent: attendance.filter((e) => e.status === 'absent').length });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Failed to save attendance' });
  }
};

// ─────────── TEACHER ATTENDANCE — VERIFY ───────────

const verifyTeacherAttendance = async (req, res) => {
  try {
    const record = await TeacherAttendance.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });

    await record.update({ is_verified: true, verified_at: new Date() });
    res.json({ message: 'Attendance verified', record: formatRecord(record) });
  } catch (error) {
    console.error('Verify attendance error:', error);
    res.status(500).json({ message: 'Failed to verify attendance' });
  }
};

// ─────────── TEACHER PROFILE — DETAIL ENDPOINTS ───────────

const getTeacherAttendanceById = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const { year } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();
    const startDate = `${targetYear}-01-01`;
    const endDate = `${targetYear}-12-31`;

    const records = await TeacherAttendance.findAll({
      where: { teacher_id: teacher.id, date: { [Op.between]: [startDate, endDate] } },
      order: [['date', 'ASC']],
    });

    const monthlyBreakdown = {};
    for (let m = 1; m <= 12; m++) {
      monthlyBreakdown[m] = { present: 0, late: 0, half_day: 0, absent: 0, on_leave: 0, official_duty: 0, total: 0 };
    }

    let counts = { present: 0, late: 0, half_day: 0, absent: 0, on_leave: 0, official_duty: 0 };

    for (const r of records) {
      const month = new Date(r.date).getMonth() + 1;
      const s = r.status;
      if (monthlyBreakdown[month][s] !== undefined) monthlyBreakdown[month][s]++;
      if (counts[s] !== undefined) counts[s]++;
      monthlyBreakdown[month].total++;
    }

    const totalDays = records.length;
    const effectivePresent = counts.present + counts.late + counts.half_day + counts.official_duty;

    res.json({
      teacherId: teacher.id,
      year: targetYear,
      totalDays,
      counts,
      percentage: totalDays ? Math.round((effectivePresent / totalDays) * 100) : 0,
      monthlyBreakdown,
    });
  } catch (error) {
    console.error('Get teacher attendance error:', error);
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
};

const getTeacherClassesById = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }],
    });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    // Classes where this teacher is the class teacher
    const homeClasses = await Class.findAll({
      where: { class_teacher_id: teacher.id },
      attributes: ['id', 'class_name', 'section'],
      include: [{ model: Student, as: 'students', attributes: ['id'] }],
    });

    // Timetable entries (unique class+subject combos this teacher teaches)
    const timetableEntries = await Timetable.findAll({
      where: { teacher_id: teacher.id },
      include: [{ model: Class, as: 'class', attributes: ['id', 'class_name', 'section'] }],
      order: [['class_id', 'ASC'], ['day', 'ASC'], ['period', 'ASC']],
    });

    // Group timetable by class
    const timetableByClass = {};
    for (const entry of timetableEntries) {
      const classId = entry.class_id;
      if (!timetableByClass[classId]) {
        timetableByClass[classId] = {
          classId,
          className: entry.class ? `Class ${entry.class.class_name} ${entry.class.section}` : '—',
          periods: [],
        };
      }
      timetableByClass[classId].periods.push({
        day: entry.day,
        period: entry.period,
        subject: entry.subject,
      });
    }

    res.json({
      teacherId: teacher.id,
      homeClasses: homeClasses.map((c) => ({
        id: c.id,
        className: `Class ${c.class_name} ${c.section}`,
        studentCount: c.students?.length || 0,
      })),
      timetableClasses: Object.values(timetableByClass),
    });
  } catch (error) {
    console.error('Get teacher classes error:', error);
    res.status(500).json({ message: 'Failed to fetch classes' });
  }
};

// PUT /api/admin/users/:userId/reset-password
// Super admin sets a new password for any user without knowing the old one.
// (Route is gated to superadmin in routes/admin.js.)
const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: `Password reset for ${user.name}` });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  resetUserPassword,
  addStudent, getStudents, getStudentById, updateStudent, removeStudent, getClasses,
  getStudentAttendance, getStudentMarks, getStudentFees, getStudentInventory, lookupStudent,
  getTeacherAttendanceById, getTeacherClassesById,
  verifyTeacherAttendance,
  getAllTeachers, addTeacher, updateTeacher, removeTeacher, setTeacherPermissions,
  getTeacherAttendance, submitTeacherAttendance,
  checkInTeacher, checkOutTeacher, markTeacherStatus,
  updateTeacherAttendance, bulkMarkAbsent, getTeacherAttendanceSummary,
  getSelfAttendanceSetting, toggleSelfAttendance,
};
