const { Op } = require('sequelize');
const {
  User, Student, Class, Attendance, Mark, FeePayment,
  UniformTransaction, UniformItem, UniformPayment,
  BookTransaction, BookItem, BookPayment,
} = require('../models');
const { calculateFine } = require('../utils/feeEngine');

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

// GET /api/student/profile
// Returns the logged-in student's personal info plus the headline stats
// (attendance %, last exam %, current fee dues) shown on the profile page.
const getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { user_id: req.user.id },
      include: [
        { model: Class, as: 'class' },
        { model: User, as: 'user', attributes: ['name', 'email', 'phone'] },
      ],
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // ── Attendance % for the current year ──────────────────────────────
    const currentYear = new Date().getFullYear();
    const attendanceRecords = await Attendance.findAll({
      where: {
        student_id: student.id,
        date: { [Op.between]: [`${currentYear}-01-01`, `${currentYear}-12-31`] },
      },
    });
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter((r) => r.status === 'present').length;
    const attendancePercentage =
      totalDays > 0 ? parseFloat(((presentDays / totalDays) * 100).toFixed(1)) : null;

    // ── Last exam % (most recently uploaded exam) ──────────────────────
    const allMarks = await Mark.findAll({
      where: { student_id: student.id },
      order: [['created_at', 'DESC']],
    });
    let lastExamPercentage = null;
    if (allMarks.length > 0) {
      const lastExamType = allMarks[0].exam_type;
      const examMarks = allMarks.filter(
        (m) => m.exam_type === lastExamType && !m.is_absent && m.marks_obtained !== null
      );
      const obtained = examMarks.reduce((sum, m) => sum + parseFloat(m.marks_obtained), 0);
      const max = examMarks.reduce((sum, m) => sum + m.max_marks, 0);
      lastExamPercentage = max > 0 ? Math.round((obtained / max) * 10000) / 100 : null;
    }

    // ── Current fee dues (last pending balance + dynamic fine) ─────────
    const lastFeeRow = await FeePayment.findOne({
      where: { student_id: student.id },
      order: [['billing_year', 'DESC'], ['billing_month', 'DESC'], ['id', 'DESC']],
    });
    const pending = lastFeeRow ? parseFloat(lastFeeRow.pending_after) : 0;
    const fineData = await calculateFine(student.id);
    const feeDues = pending + (fineData?.fine || 0);

    res.json({
      personal: {
        name: student.user?.name || null,
        roll_number: student.roll_number,
        class: student.class
          ? `${student.class.class_name}-${student.class.section}`
          : null,
        date_of_birth: student.date_of_birth,
        guardian_name: student.father_name || student.mother_name || null,
        contact: student.father_phone || student.mother_phone || student.user?.phone || null,
        address: student.address,
      },
      stats: {
        attendance_percentage: attendancePercentage,
        last_exam_percentage: lastExamPercentage,
        fee_dues: feeDues,
      },
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// GET /api/student/purchases
// The logged-in student's own uniform + book purchases with dues/payment history.
const getMyPurchases = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id }, attributes: ['id', 'admission_number'] });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const [uniformTxns, bookTxns] = await Promise.all([
      UniformTransaction.findAll({
        where: { student_id: student.id },
        include: [
          { model: UniformItem, as: 'item' },
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
      id:        t.id,
      type,
      date:      t.created_at,
      itemName:  type === 'uniform'
        ? `${t.item?.item_name || '—'}${t.item?.size ? ` (${t.item.size})` : ''}`
        : (t.item?.book_name || '—'),
      className: type === 'book' ? (t.item?.class_name || null) : null,
      subject:   type === 'book' ? (t.item?.subject || null) : null,
      quantity:  t.quantity,
      toBePaid:  parseFloat(t.to_be_paid),
      paid:      parseFloat(t.paid),
      left:      parseFloat(t.to_be_paid) - parseFloat(t.paid),
      payments:  (t.payments || []).map((p) => ({
        id: p.id, amountPaid: parseFloat(p.amount_paid), paymentDate: p.payment_date, remarks: p.remarks,
      })),
    });

    const transactions = [
      ...uniformTxns.map((t) => mapTxn(t, 'uniform')),
      ...bookTxns.map((t) => mapTxn(t, 'book')),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalSpent   = transactions.reduce((s, t) => s + t.paid, 0);
    const totalPending = transactions.reduce((s, t) => s + t.left, 0);

    res.json({ transactions, summary: { totalTransactions: transactions.length, totalSpent, totalPending } });
  } catch (e) {
    console.error('Get my purchases error:', e);
    res.status(500).json({ message: 'Failed to fetch purchases' });
  }
};

module.exports = {
  getMyAttendance,
  getAttendanceSummary,
  getMyProfile,
  getMyPurchases,
};