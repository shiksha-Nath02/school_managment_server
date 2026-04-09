const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Student, Teacher, Class, TeacherAttendance, sequelize } = require('../models');

const LATE_THRESHOLD = { hour: 9, minute: 30 }; // 9:30 AM

// ─────────── HELPER ───────────
const formatRecord = (r) => ({
  id: r.id,
  teacherId: r.teacher_id,
  date: r.date,
  status: r.status,
  checkInTime: r.check_in_time,
  checkOutTime: r.check_out_time,
  leaveType: r.leave_type,
  remarks: r.remarks,
});

// ─────────── STUDENTS ───────────
const addStudent = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, email, phone, password, class_id, roll_number, date_of_birth, address, admission_date } = req.body;
    if (!name || !email || !class_id || !roll_number)
      return res.status(400).json({ message: 'Name, email, class, and roll number are required' });

    if (await User.findOne({ where: { email } }))
      return res.status(409).json({ message: 'Email already registered' });

    if (!await Class.findByPk(class_id))
      return res.status(404).json({ message: 'Class not found' });

    if (await Student.findOne({ where: { class_id, roll_number } }))
      return res.status(409).json({ message: `Roll number ${roll_number} already exists in this class` });

    const hashedPassword = await bcrypt.hash(password || 'student123', 10);
    const user = await User.create({ name, email, password: hashedPassword, role: 'student', phone: phone || null }, { transaction: t });
    const student = await Student.create({ user_id: user.id, class_id, roll_number, date_of_birth: date_of_birth || null, address: address || null, admission_date: admission_date || new Date() }, { transaction: t });
    await t.commit();

    const fullStudent = await Student.findByPk(student.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Class, as: 'class', attributes: ['id', 'class_name', 'section'] },
      ],
    });
    res.status(201).json({ message: 'Student added successfully', student: fullStudent });
  } catch (error) {
    await t.rollback();
    console.error('Add student error:', error);
    res.status(500).json({ message: 'Failed to add student' });
  }
};

const getStudents = async (req, res) => {
  try {
    const { class_id, search } = req.query;
    const where = {};
    if (class_id) where.class_id = class_id;
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
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }],
      order: [['id', 'ASC']],
    });
    res.json({ teachers });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ message: 'Failed to fetch teachers' });
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
    const { teacherId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const checkInTime = new Date().toTimeString().slice(0, 8); // HH:MM:SS

    const existing = await TeacherAttendance.findOne({ where: { teacher_id: teacherId, date: today } });
    if (existing) {
      if (existing.check_in_time) return res.status(400).json({ message: 'Already checked in today' });
      return res.status(400).json({ message: `Already marked as ${existing.status}` });
    }

    const [h, m] = checkInTime.split(':').map(Number);
    const isLate = h > LATE_THRESHOLD.hour || (h === LATE_THRESHOLD.hour && m > LATE_THRESHOLD.minute);

    const record = await TeacherAttendance.create({
      teacher_id: teacherId,
      date: today,
      status: isLate ? 'late' : 'present',
      check_in_time: checkInTime,
    });

    res.json({ message: `Checked in as ${record.status}`, record: formatRecord(record) });
  } catch (error) {
    console.error('Check in error:', error);
    res.status(500).json({ message: 'Failed to check in' });
  }
};

const checkOutTeacher = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const checkOutTime = new Date().toTimeString().slice(0, 8);

    const record = await TeacherAttendance.findOne({ where: { teacher_id: teacherId, date: today } });
    if (!record || !record.check_in_time) return res.status(400).json({ message: 'Teacher has not checked in yet' });
    if (record.check_out_time) return res.status(400).json({ message: 'Already checked out' });

    const [ciH, ciM] = record.check_in_time.split(':').map(Number);
    const [coH, coM] = checkOutTime.split(':').map(Number);
    const totalMinutes = (coH * 60 + coM) - (ciH * 60 + ciM);
    const newStatus = totalMinutes < 240 ? 'half_day' : record.status;

    await record.update({ check_out_time: checkOutTime, status: newStatus });
    res.json({ message: 'Checked out', record: formatRecord(record), halfDay: totalMinutes < 240 });
  } catch (error) {
    console.error('Check out error:', error);
    res.status(500).json({ message: 'Failed to check out' });
  }
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

module.exports = {
  addStudent, getStudents, getStudentById, getClasses,
  getAllTeachers,
  getTeacherAttendance, submitTeacherAttendance,
  checkInTeacher, checkOutTeacher, markTeacherStatus,
  updateTeacherAttendance, bulkMarkAbsent, getTeacherAttendanceSummary,
};
