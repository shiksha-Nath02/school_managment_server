const { Op } = require('sequelize');
const { User, Student, Class, Attendance } = require('../models');

// GET /api/student/attendance?month=3&year=2026
// Returns the logged-in student's attendance for a given month/year
const getMyAttendance = async (req, res) => {
  try {
    // Find student record for the logged-in user
    const student = await Student.findOne({
      where: { user_id: req.user.id },
      include: [
        { model: Class, as: 'class' },
        { model: User, as: 'user', attributes: ['name', 'email'] },
      ],
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const { month, year } = req.query;

    let whereClause = { student_id: student.id };

    if (month && year) {
      // Filter by specific month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of month
      whereClause.date = {
        [Op.between]: [
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
        ],
      };
    } else if (year) {
      // Filter by year
      whereClause.date = {
        [Op.between]: [`${year}-01-01`, `${year}-12-31`],
      };
    }

    const records = await Attendance.findAll({
      where: whereClause,
      order: [['date', 'ASC']],
    });

    // Calculate stats
    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === 'present').length;
    const absentDays = records.filter((r) => r.status === 'absent').length;
    const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    res.json({
      student: {
        id: student.id,
        name: student.user?.name,
        rollNumber: student.roll_number,
        className: student.class
          ? `${student.class.class_name}-${student.class.section}`
          : null,
      },
      stats: {
        totalDays,
        presentDays,
        absentDays,
        percentage: parseFloat(percentage),
      },
      records: records.map((r) => ({
        id: r.id,
        date: r.date,
        status: r.status,
      })),
    });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({ message: 'Server error fetching attendance' });
  }
};

// GET /api/student/attendance/summary
// Returns yearly summary with month-by-month breakdown
const getAttendanceSummary = async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { user_id: req.user.id },
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    const records = await Attendance.findAll({
      where: {
        student_id: student.id,
        date: {
          [Op.between]: [`${currentYear}-01-01`, `${currentYear}-12-31`],
        },
      },
      order: [['date', 'ASC']],
    });

    // Group by month
    const monthlyBreakdown = {};
    for (let m = 1; m <= 12; m++) {
      const monthRecords = records.filter((r) => {
        const d = new Date(r.date);
        return d.getMonth() + 1 === m;
      });
      if (monthRecords.length > 0) {
        const present = monthRecords.filter((r) => r.status === 'present').length;
        monthlyBreakdown[m] = {
          month: m,
          totalDays: monthRecords.length,
          present,
          absent: monthRecords.length - present,
          percentage: parseFloat(((present / monthRecords.length) * 100).toFixed(1)),
        };
      }
    }

    // Overall stats
    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === 'present').length;

    res.json({
      year: parseInt(currentYear),
      overall: {
        totalDays,
        presentDays,
        absentDays: totalDays - presentDays,
        percentage: totalDays > 0 ? parseFloat(((presentDays / totalDays) * 100).toFixed(1)) : 0,
      },
      monthlyBreakdown,
    });
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ message: 'Server error fetching summary' });
  }
};

module.exports = {
  getMyAttendance,
  getAttendanceSummary,
};