const { ClassTask, Timetable, Teacher, Student, Class } = require('../models');
const { Op } = require('sequelize');

// GET /api/teacher/class-tasks/form-data/:classId?date=YYYY-MM-DD
const getFormData = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

    const timetableEntries = await Timetable.findAll({
      where: { class_id: classId, day: dayOfWeek },
      order: [['period', 'ASC']]
    });

    const formData = [];
    for (let p = 1; p <= 8; p++) {
      const entry = timetableEntries.find(e => e.period === p);
      formData.push({
        period: p,
        subject: entry ? entry.subject : '',
        classwork: '',
        homework: ''
      });
    }

    const existing = await ClassTask.findOne({
      where: { class_id: classId, date }
    });

    if (existing && existing.tasks_data) {
      const savedData = typeof existing.tasks_data === 'string'
        ? JSON.parse(existing.tasks_data)
        : existing.tasks_data;

      formData.forEach(slot => {
        const saved = savedData.find(s => s.period === slot.period);
        if (saved) {
          slot.subject = saved.subject || slot.subject;
          slot.classwork = saved.classwork || '';
          slot.homework = saved.homework || '';
        }
      });
    }

    res.json({ success: true, formData, dayOfWeek, date, isUpdate: !!existing });
  } catch (error) {
    console.error('Error fetching form data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch form data' });
  }
};

// POST /api/teacher/class-tasks
const saveClassTasks = async (req, res) => {
  try {
    const { classId, date, tasksData } = req.body;

    if (!classId || !date || !tasksData) {
      return res.status(400).json({ success: false, message: 'classId, date, and tasksData are required' });
    }

    let teacherId = null;
    if (req.user && req.user.id) {
      const teacher = await Teacher.findOne({ where: { user_id: req.user.id } });
      if (teacher) teacherId = teacher.id;
    }

    const existing = await ClassTask.findOne({
      where: { class_id: classId, date }
    });

    if (existing) {
      await existing.update({ tasks_data: tasksData, teacher_id: teacherId });
      res.json({ success: true, message: 'Classwork/homework updated successfully', data: existing });
    } else {
      const record = await ClassTask.create({
        class_id: classId,
        teacher_id: teacherId,
        date,
        tasks_data: tasksData
      });
      res.json({ success: true, message: 'Classwork/homework saved successfully', data: record });
    }
  } catch (error) {
    console.error('Error saving class tasks:', error);
    res.status(500).json({ success: false, message: 'Failed to save classwork/homework' });
  }
};

// GET /api/student/class-tasks?date=YYYY-MM-DD
const getStudentClassTasks = async (req, res) => {
  try {
    const { date } = req.query;
    const studentUserId = req.user?.id;

    const student = await Student.findOne({ where: { user_id: studentUserId } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const record = await ClassTask.findOne({
      where: { class_id: student.class_id, date }
    });

    if (!record) {
      return res.json({ success: true, tasksData: null, message: 'No classwork/homework uploaded for this date' });
    }

    const tasksData = typeof record.tasks_data === 'string'
      ? JSON.parse(record.tasks_data)
      : record.tasks_data;

    res.json({ success: true, tasksData, date: record.date, updatedAt: record.updated_at });
  } catch (error) {
    console.error('Error fetching student class tasks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch classwork/homework' });
  }
};

// GET /api/student/class-tasks/week?startDate=YYYY-MM-DD
const getStudentWeekTasks = async (req, res) => {
  try {
    const { startDate } = req.query;
    const studentUserId = req.user?.id;

    const student = await Student.findOne({ where: { user_id: studentUserId } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const start = new Date(startDate);
    const dates = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const records = await ClassTask.findAll({
      where: { class_id: student.class_id, date: { [Op.in]: dates } },
      order: [['date', 'ASC']]
    });

    const weekData = {};
    records.forEach(record => {
      const data = typeof record.tasks_data === 'string'
        ? JSON.parse(record.tasks_data)
        : record.tasks_data;
      weekData[record.date] = data;
    });

    res.json({ success: true, weekData, dates });
  } catch (error) {
    console.error('Error fetching week tasks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch week data' });
  }
};

module.exports = { getFormData, saveClassTasks, getStudentClassTasks, getStudentWeekTasks };
