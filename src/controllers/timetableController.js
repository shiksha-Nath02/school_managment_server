const { Timetable, Class, Teacher, Student } = require('../models');

// GET /api/teacher/timetable/:classId
const getTimetable = async (req, res) => {
  try {
    const { classId } = req.params;

    const entries = await Timetable.findAll({
      where: { class_id: classId },
      order: [['day', 'ASC'], ['period', 'ASC']]
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timetable = {};

    days.forEach(day => {
      timetable[day] = [];
      for (let p = 1; p <= 8; p++) {
        const entry = entries.find(e => e.day === day && e.period === p);
        timetable[day].push({
          period: p,
          subject: entry ? entry.subject : '',
          teacher_id: entry ? entry.teacher_id : null,
          id: entry ? entry.id : null
        });
      }
    });

    res.json({ success: true, timetable });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch timetable' });
  }
};

// PUT /api/teacher/timetable/:classId
const updateTimetable = async (req, res) => {
  try {
    const { classId } = req.params;
    const { timetable } = req.body;

    if (!timetable || typeof timetable !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid timetable data' });
    }

    let teacherId = null;
    if (req.user && req.user.id) {
      const teacher = await Teacher.findOne({ where: { user_id: req.user.id } });
      if (teacher) teacherId = teacher.id;
    }

    const classRecord = await Class.findByPk(classId);
    if (!classRecord) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Fetch existing rows — we'll diff instead of delete-all + re-insert
    const existing = await Timetable.findAll({ where: { class_id: classId } });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const incomingIds = new Set(); // track which existing rows are still present

    for (const day of days) {
      if (!timetable[day] || !Array.isArray(timetable[day])) continue;

      for (const slot of timetable[day]) {
        const subject = slot.subject ? slot.subject.trim() : '';
        const existingRow = existing.find(e => e.day === day && e.period === slot.period);

        if (subject !== '') {
          if (existingRow) {
            incomingIds.add(existingRow.id);
            // Only write if something actually changed
            if (existingRow.subject !== subject) {
              await existingRow.update({ subject, teacher_id: teacherId });
            }
          } else {
            // New slot — insert
            await Timetable.create({
              class_id: parseInt(classId),
              day,
              period: slot.period,
              subject,
              teacher_id: teacherId
            });
          }
        } else if (existingRow) {
          // Subject cleared — delete that row
          await existingRow.destroy();
        }
      }
    }

    res.json({ success: true, message: 'Timetable updated successfully' });
  } catch (error) {
    console.error('Error updating timetable:', error);
    res.status(500).json({ success: false, message: 'Failed to update timetable' });
  }
};

// GET /api/student/timetable
const getStudentTimetable = async (req, res) => {
  try {
    const studentUserId = req.user?.id;

    const student = await Student.findOne({ where: { user_id: studentUserId } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const entries = await Timetable.findAll({
      where: { class_id: student.class_id },
      order: [['day', 'ASC'], ['period', 'ASC']]
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timetable = {};

    days.forEach(day => {
      timetable[day] = [];
      for (let p = 1; p <= 8; p++) {
        const entry = entries.find(e => e.day === day && e.period === p);
        timetable[day].push({
          period: p,
          subject: entry ? entry.subject : ''
        });
      }
    });

    res.json({ success: true, timetable });
  } catch (error) {
    console.error('Error fetching student timetable:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch timetable' });
  }
};

module.exports = { getTimetable, updateTimetable, getStudentTimetable };
