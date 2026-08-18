const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { User, Student, Teacher, Class, Attendance } = require('../models');
const TeacherAttendance = require('../models/TeacherAttendance');
const { saveBase64Image } = require('../utils/imageHelper');
const { publicUrl } = require('../utils/s3');
const { generateStudentPassword } = require('../utils/credentials');

const LATE_THRESHOLD = { hour: 9, minute: 30 };

// Student columns a class teacher may edit (mirrors the admin form, minus class_id —
// a teacher cannot move a student out of her own class).
const STUDENT_EDITABLE = [
  'roll_number', 'date_of_birth', 'address', 'admission_date', 'status',
  'aadhaar_number', 'blood_group', 'category', 'religion', 'nationality',
  'city', 'state', 'pincode',
  'father_name', 'father_phone', 'father_aadhaar',
  'mother_name', 'mother_phone', 'mother_aadhaar',
  'parents_pan', 'birth_certificate_number', 'ews_certificate_number',
  'pen_number', 'apaar_id',
];

const pick = (src, keys) => keys.reduce((o, k) => {
  if (src[k] !== undefined) o[k] = src[k];
  return o;
}, {});

// GET /api/teacher/classes
// Returns classes assigned to the logged-in teacher (via class_teacher_id)
const getMyClasses = async (req, res) => {
  try {
    // Find the teacher record linked to the logged-in user
    const teacher = await Teacher.findOne({
      where: { user_id: req.user.id },
    });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    const classes = await Class.findAll({
      where: { class_teacher_id: teacher.id },
      order: [['class_name', 'ASC'], ['section', 'ASC']],
    });

    res.json({ classes, teacherId: teacher.id });
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    res.status(500).json({ message: 'Server error fetching classes' });
  }
};

// GET /api/teacher/students/:classId
// Returns all students in a given class (for attendance marking)
const getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const students = await Student.findAll({
      where: { class_id: classId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'username', 'email', 'phone'],
        },
      ],
      order: [['roll_number', 'ASC']],
    });

    // Also get class info
    const classInfo = await Class.findByPk(classId);

    res.json({ students, classInfo });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error fetching students' });
  }
};

// PUT /api/teacher/students/:id
// A class teacher edits a student's profile. Allowed only when the superadmin has
// turned on this teacher's can_edit_students flag AND the student is in her own class.
const updateClassStudent = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const teacher = await Teacher.findOne({ where: { user_id: req.user.id } });
    if (!teacher) { await t.rollback(); return res.status(404).json({ message: 'Teacher profile not found' }); }

    if (!teacher.can_edit_students) {
      await t.rollback();
      return res.status(403).json({ message: 'You do not have permission to edit students. Ask an administrator to enable it.' });
    }

    const student = await Student.findByPk(req.params.id, { include: [{ model: User, as: 'user' }] });
    if (!student) { await t.rollback(); return res.status(404).json({ message: 'Student not found' }); }

    // The student must belong to a class this teacher is the class teacher of.
    const ownClass = await Class.findOne({ where: { id: student.class_id, class_teacher_id: teacher.id } });
    if (!ownClass) {
      await t.rollback();
      return res.status(403).json({ message: 'You can only edit students in your own class' });
    }

    const userUpdates = pick(req.body, ['name', 'email', 'phone']);
    const studentUpdates = pick(req.body, STUDENT_EDITABLE);

    // Admission number is the login username — keep both in sync when it changes,
    // checking the new value isn't already taken by another user.
    const { admission_number } = req.body;
    if (admission_number !== undefined && String(admission_number) !== String(student.admission_number || '')) {
      if (!String(admission_number).trim()) { await t.rollback(); return res.status(400).json({ message: 'Admission number cannot be empty' }); }
      const clash = await User.findOne({ where: { username: admission_number, id: { [Op.ne]: student.user_id } } });
      if (clash) { await t.rollback(); return res.status(409).json({ message: `Admission number ${admission_number} is already in use` }); }
      userUpdates.username = admission_number;
      studentUpdates.admission_number = admission_number;
    }

    // Guard the per-class unique roll number if it is being changed.
    if (studentUpdates.roll_number !== undefined && Number(studentUpdates.roll_number) !== student.roll_number) {
      const clash = await Student.findOne({
        where: { class_id: student.class_id, roll_number: studentUpdates.roll_number, id: { [Op.ne]: student.id } },
      });
      if (clash) { await t.rollback(); return res.status(409).json({ message: `Roll number ${studentUpdates.roll_number} already exists in this class` }); }
    }

    if (Object.keys(userUpdates).length) await student.user.update(userUpdates, { transaction: t });
    if (Object.keys(studentUpdates).length) await student.update(studentUpdates, { transaction: t });
    await t.commit();

    const updated = await Student.findByPk(student.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'username', 'email', 'phone'] },
        { model: Class, as: 'class', attributes: ['id', 'class_name', 'section'] },
      ],
    });
    res.json({ message: 'Student updated', student: updated });
  } catch (error) {
    await t.rollback();
    console.error('Update class student error:', error);
    res.status(500).json({ message: 'Failed to update student' });
  }
};

// GET /api/teacher/profile
// Real profile + summary stats for the logged-in teacher (replaces hardcoded UI).
const getMyProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'username', 'email', 'phone', 'is_active'] }],
    });
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

    const classes = await Class.findAll({
      where: { class_teacher_id: teacher.id },
      order: [['class_name', 'ASC'], ['section', 'ASC']],
    });
    const classIds = classes.map((c) => c.id);
    const studentCount = classIds.length
      ? await Student.count({ where: { class_id: { [Op.in]: classIds } } })
      : 0;

    // Effective attendance % for the current calendar year.
    const year = new Date().getFullYear();
    const records = await TeacherAttendance.findAll({
      where: { teacher_id: teacher.id, date: { [Op.between]: [`${year}-01-01`, `${year}-12-31`] } },
      attributes: ['status'],
    });
    const effective = records.filter((r) => ['present', 'late', 'half_day', 'official_duty'].includes(r.status)).length;
    const attendancePct = records.length ? Math.round((effective / records.length) * 100) : null;

    res.json({
      teacher,
      classes: classes.map((c) => ({ id: c.id, className: c.class_name, section: c.section })),
      stats: {
        studentCount,
        classCount: classes.length,
        attendancePct,
        canEditStudents: teacher.can_edit_students,
      },
    });
  } catch (error) {
    console.error('Get teacher profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// POST /api/teacher/students
// A class teacher adds a new student to her OWN class. Gated by can_edit_students
// (the same superadmin toggle that enables editing). class_id must be a class this
// teacher is the class teacher of.
const addClassStudent = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const teacher = await Teacher.findOne({ where: { user_id: req.user.id } });
    if (!teacher) { await t.rollback(); return res.status(404).json({ message: 'Teacher profile not found' }); }
    if (!teacher.can_edit_students) {
      await t.rollback();
      return res.status(403).json({ message: 'You do not have permission to add students. Ask an administrator to enable it.' });
    }

    const { name, username, email, phone, password, class_id, roll_number, date_of_birth } = req.body;
    if (!name || !username || !class_id || !roll_number) {
      await t.rollback();
      return res.status(400).json({ message: 'Name, admission number, class, and roll number are required' });
    }

    // The class must be one this teacher is the class teacher of.
    const ownClass = await Class.findOne({ where: { id: class_id, class_teacher_id: teacher.id } });
    if (!ownClass) { await t.rollback(); return res.status(403).json({ message: 'You can only add students to your own class' }); }

    if (await User.findOne({ where: { username } })) {
      await t.rollback();
      return res.status(409).json({ message: `Admission number ${username} already exists` });
    }
    if (email && await User.findOne({ where: { email } })) {
      await t.rollback();
      return res.status(409).json({ message: 'Email already registered' });
    }
    if (await Student.findOne({ where: { class_id, roll_number } })) {
      await t.rollback();
      return res.status(409).json({ message: `Roll number ${roll_number} already exists in this class` });
    }

    // Default password = birth year + first 4 letters of name (needs a DOB).
    let plainPassword = password;
    if (!plainPassword) {
      if (!date_of_birth) { await t.rollback(); return res.status(400).json({ message: 'date_of_birth is required to generate the default password' }); }
      plainPassword = generateStudentPassword(name, date_of_birth);
    }
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await User.create(
      { name, username, email: email || null, password: hashedPassword, role: 'student', phone: phone || null },
      { transaction: t }
    );
    const student = await Student.create({
      user_id: user.id,
      class_id,
      admission_number: username,
      ...pick(req.body, STUDENT_EDITABLE),
      roll_number,
      date_of_birth: date_of_birth || null,
      status: 'active',
      nationality: req.body.nationality || 'Indian',
      admission_date: req.body.admission_date || new Date(),
    }, { transaction: t });
    await t.commit();

    const full = await Student.findByPk(student.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'username', 'email', 'phone'] },
        { model: Class, as: 'class', attributes: ['id', 'class_name', 'section'] },
      ],
    });
    res.status(201).json({ message: 'Student added', student: full });
  } catch (error) {
    await t.rollback();
    console.error('Add class student error:', error);
    res.status(500).json({ message: 'Failed to add student' });
  }
};

// POST /api/teacher/attendance  AND  POST /api/admin/student-attendance
// Body: { classId, date, records: [{ studentId, status }] }
// Works for both teachers and admins. When a class teacher marks it we record
// their teacher id in marked_by_teacher; an admin has no teachers row, so it is
// stored as null.
const submitAttendance = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { classId, date, records } = req.body;

    // Validate input
    if (!classId || !date || !records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'classId, date, and records array are required' });
    }

    // The uploader may be a class teacher (record their id) or an admin (null).
    const teacher = await Teacher.findOne({
      where: { user_id: req.user.id },
    });
    const markedBy = teacher ? teacher.id : null;

    // Check if attendance already exists for this class + date
    const existingAttendance = await Attendance.findOne({
      where: {
        class_id: classId,
        date: date,
      },
      transaction,
    });

    if (existingAttendance) {
      // Update existing attendance records
      for (const record of records) {
        await Attendance.update(
          { status: record.status, marked_by_teacher: markedBy },
          {
            where: {
              student_id: record.studentId,
              class_id: classId,
              date: date,
            },
            transaction,
          }
        );
      }
    } else {
      // Create new attendance records
      const attendanceData = records.map((record) => ({
        student_id: record.studentId,
        class_id: classId,
        date: date,
        status: record.status,
        marked_by_teacher: markedBy,
      }));

      await Attendance.bulkCreate(attendanceData, { transaction });
    }

    await transaction.commit();

    res.json({
      message: existingAttendance
        ? 'Attendance updated successfully'
        : 'Attendance submitted successfully',
      date,
      classId,
      totalStudents: records.length,
      present: records.filter((r) => r.status === 'present').length,
      absent: records.filter((r) => r.status === 'absent').length,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error submitting attendance:', error);
    res.status(500).json({ message: 'Server error submitting attendance' });
  }
};

// GET /api/teacher/attendance/:classId?date=YYYY-MM-DD
// Check if attendance is already marked for a class on a given date
const getAttendanceByDate = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date query parameter is required' });
    }

    const records = await Attendance.findAll({
      where: {
        class_id: classId,
        date: date,
      },
      include: [
        {
          model: Student,
          as: 'student',
          include: [{ model: User, as: 'user', attributes: ['name'] }],
        },
      ],
      order: [[{ model: Student, as: 'student' }, 'roll_number', 'ASC']],
    });

    res.json({
      date,
      classId,
      alreadyMarked: records.length > 0,
      records: records.map((r) => ({
        studentId: r.student_id,
        studentName: r.student?.user?.name || 'Unknown',
        rollNumber: r.student?.roll_number,
        status: r.status,
      })),
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error fetching attendance' });
  }
};

// GET /api/teacher/my-attendance?month=4&year=2026
// Returns the logged-in teacher's own attendance records
const getMyAttendanceRecords = async (req, res) => {
  try {
    const { month, year } = req.query;
    const { Op } = require('sequelize');
    const TeacherAttendance = require('../models/TeacherAttendance');

    const teacher = await Teacher.findOne({ where: { user_id: req.user.id } });
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

    let whereClause = { teacher_id: teacher.id };

    if (month && year) {
      const mm = String(month).padStart(2, '0');
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      whereClause.date = {
        [Op.between]: [
          `${year}-${mm}-01`,
          `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
        ],
      };
    }

    const records = await TeacherAttendance.findAll({
      where: whereClause,
      order: [['date', 'DESC']],
    });

    const today = new Date().toISOString().split('T')[0];
    const todayRecord = records.find((r) => r.date === today) || null;

    const mapRecord = (r) => ({
      id: r.id, date: r.date, status: r.status,
      checkInTime: r.check_in_time, checkInImage: publicUrl(r.check_in_image),
      checkOutTime: r.check_out_time, checkOutImage: publicUrl(r.check_out_image),
      leaveType: r.leave_type, remarks: r.remarks,
      isVerified: r.is_verified || false,
    });

    res.json({
      teacherId: teacher.id,
      records: records.map(mapRecord),
      todayRecord: todayRecord ? mapRecord(todayRecord) : null,
    });
  } catch (error) {
    console.error('Get my attendance error:', error);
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
};

const selfCheckIn = async (req, res) => {
  try {
    const { image_base64 } = req.body;
    const teacher = await Teacher.findOne({ where: { user_id: req.user.id } });
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

    const today = new Date().toISOString().split('T')[0];
    const checkInTime = new Date().toTimeString().slice(0, 8);

    const existing = await TeacherAttendance.findOne({ where: { teacher_id: teacher.id, date: today } });
    if (existing?.check_in_time) return res.status(400).json({ message: 'Already checked in today' });

    const [h, m] = checkInTime.split(':').map(Number);
    const isLate = h > LATE_THRESHOLD.hour || (h === LATE_THRESHOLD.hour && m > LATE_THRESHOLD.minute);

    let imagePath = null;
    if (image_base64) {
      imagePath = await saveBase64Image(image_base64, `checkin_${teacher.id}_${Date.now()}.jpg`);
    }

    let record;
    if (existing) {
      await existing.update({ status: isLate ? 'late' : 'present', check_in_time: checkInTime, check_in_image: imagePath, is_verified: false });
      record = existing;
    } else {
      record = await TeacherAttendance.create({
        teacher_id: teacher.id, date: today,
        status: isLate ? 'late' : 'present',
        check_in_time: checkInTime, check_in_image: imagePath, is_verified: false,
      });
    }

    res.json({
      message: `Checked in as ${record.status}. Pending admin verification.`,
      record: {
        id: record.id, status: record.status,
        checkInTime: record.check_in_time, checkInImage: publicUrl(record.check_in_image),
        isVerified: record.is_verified,
      },
    });
  } catch (error) {
    console.error('Self check-in error:', error);
    res.status(500).json({ message: 'Failed to check in' });
  }
};

const selfCheckOut = async (req, res) => {
  try {
    const { image_base64 } = req.body;
    const teacher = await Teacher.findOne({ where: { user_id: req.user.id } });
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

    const today = new Date().toISOString().split('T')[0];
    const checkOutTime = new Date().toTimeString().slice(0, 8);

    const record = await TeacherAttendance.findOne({ where: { teacher_id: teacher.id, date: today } });
    if (!record?.check_in_time) return res.status(400).json({ message: 'You have not checked in today' });
    if (record.check_out_time) return res.status(400).json({ message: 'Already checked out today' });

    let imagePath = null;
    if (image_base64) {
      imagePath = await saveBase64Image(image_base64, `checkout_${teacher.id}_${Date.now()}.jpg`);
    }

    const [ciH, ciM] = record.check_in_time.split(':').map(Number);
    const [coH, coM] = checkOutTime.split(':').map(Number);
    const totalMinutes = (coH * 60 + coM) - (ciH * 60 + ciM);
    const newStatus = totalMinutes < 240 ? 'half_day' : record.status;

    await record.update({ check_out_time: checkOutTime, check_out_image: imagePath, status: newStatus, is_verified: false });

    res.json({
      message: `Checked out${totalMinutes < 240 ? ' — half day recorded' : ''}. Pending admin verification.`,
      record: {
        id: record.id, status: record.status,
        checkInTime: record.check_in_time, checkInImage: publicUrl(record.check_in_image),
        checkOutTime: record.check_out_time, checkOutImage: publicUrl(record.check_out_image),
        isVerified: record.is_verified,
      },
    });
  } catch (error) {
    console.error('Self check-out error:', error);
    res.status(500).json({ message: 'Failed to check out' });
  }
};

// GET /api/teacher/my-students?class_id=
// Returns full student records for the teacher's assigned class(es)
const getMyStudents = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ where: { user_id: req.user.id } });
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

    const teacherClasses = await Class.findAll({
      where: { class_teacher_id: teacher.id },
      order: [['class_name', 'ASC'], ['section', 'ASC']],
    });
    const classIds = teacherClasses.map((c) => c.id);
    if (!classIds.length) return res.json({ success: true, students: [], classes: [] });

    const { class_id } = req.query;
    const classFilter = class_id && classIds.includes(parseInt(class_id, 10))
      ? parseInt(class_id, 10)
      : { [Op.in]: classIds };

    const students = await Student.findAll({
      where: { class_id: classFilter },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Class, as: 'class', attributes: ['id', 'class_name', 'section'] },
      ],
      order: [['roll_number', 'ASC']],
    });

    res.json({ success: true, students, classes: teacherClasses, canEditStudents: teacher.can_edit_students });
  } catch (error) {
    console.error('getMyStudents error:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};

module.exports = {
  getMyClasses,
  getStudentsByClass,
  updateClassStudent,
  addClassStudent,
  getMyProfile,
  getMyStudents,
  submitAttendance,
  getAttendanceByDate,
  getMyAttendanceRecords,
  selfCheckIn,
  selfCheckOut,
};