const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { User, Student, Teacher, Class, Attendance } = require('../models');

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
          attributes: ['id', 'name', 'email'],
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

// POST /api/teacher/attendance
// Body: { classId, date, records: [{ studentId, status }] }
const submitAttendance = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { classId, date, records } = req.body;

    // Validate input
    if (!classId || !date || !records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'classId, date, and records array are required' });
    }

    // Find teacher record
    const teacher = await Teacher.findOne({
      where: { user_id: req.user.id },
    });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

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
          { status: record.status, marked_by_teacher: teacher.id },
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
        marked_by_teacher: teacher.id,
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

    res.json({
      teacherId: teacher.id,
      records: records.map((r) => ({
        id: r.id,
        date: r.date,
        status: r.status,
        checkInTime: r.check_in_time,
        checkOutTime: r.check_out_time,
        leaveType: r.leave_type,
        remarks: r.remarks,
      })),
      todayRecord: todayRecord ? {
        id: todayRecord.id,
        date: todayRecord.date,
        status: todayRecord.status,
        checkInTime: todayRecord.check_in_time,
        checkOutTime: todayRecord.check_out_time,
        leaveType: todayRecord.leave_type,
        remarks: todayRecord.remarks,
      } : null,
    });
  } catch (error) {
    console.error('Get my attendance error:', error);
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
};

module.exports = {
  getMyClasses,
  getStudentsByClass,
  submitAttendance,
  getAttendanceByDate,
  getMyAttendanceRecords,
};