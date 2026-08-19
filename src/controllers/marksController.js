const { Mark, Student, User, Class, Teacher, Timetable } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// ──────────────────────────────────────────────────
// GET SUBJECTS FOR A CLASS (from timetable)
// GET /api/teacher/marks/subjects/:classId
// ──────────────────────────────────────────────────
const getSubjectsForClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const entries = await Timetable.findAll({
      where: { class_id: classId },
      attributes: ['subject'],
      group: ['subject'],
      raw: true
    });

    const subjects = entries
      .map(e => e.subject)
      .filter(s => s && s.trim() !== '')
      .sort();

    res.json({ success: true, subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subjects' });
  }
};

// ──────────────────────────────────────────────────
// GET EXISTING MARKS (for upsert — pre-fill form)
// GET /api/teacher/marks/:classId?exam_type=&subject=
// ──────────────────────────────────────────────────
const getMarks = async (req, res) => {
  try {
    const { classId } = req.params;
    const { exam_type, subject } = req.query;

    if (!exam_type) {
      return res.status(400).json({ success: false, message: 'exam_type is required' });
    }

    const where = { class_id: classId, exam_type };
    if (subject) where.subject = subject;

    const marks = await Mark.findAll({
      where,
      include: [
        {
          model: Student,
          as: 'student',
          include: [{ model: User, as: 'user', attributes: ['name'] }]
        }
      ],
      order: [[{ model: Student, as: 'student' }, 'roll_number', 'ASC']]
    });

    const students = await Student.findAll({
      where: { class_id: classId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      order: [['roll_number', 'ASC']]
    });

    const subjects = subject ? [subject] : [...new Set(marks.map(m => m.subject))];

    const result = students.map(s => {
      const studentMarks = {};
      subjects.forEach(subj => {
        const existing = marks.find(m => m.student_id === s.id && m.subject === subj);
        studentMarks[subj] = existing ? {
          id: existing.id,
          marks_obtained: existing.marks_obtained,
          max_marks: existing.max_marks,
          is_absent: existing.is_absent,
          remark: existing.remark
        } : null;
      });

      return {
        student_id: s.id,
        roll_number: s.roll_number,
        admission_number: s.admission_number,
        name: s.user?.name || `Student ${s.id}`,
        marks: studentMarks
      };
    });

    const maxMarksMap = {};
    subjects.forEach(subj => {
      const entry = marks.find(m => m.subject === subj);
      maxMarksMap[subj] = entry ? entry.max_marks : null;
    });

    res.json({
      success: true,
      students: result,
      subjects,
      maxMarks: maxMarksMap,
      isUpdate: marks.length > 0
    });
  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch marks' });
  }
};

// ──────────────────────────────────────────────────
// SAVE / UPDATE MARKS (bulk upsert)
// POST /api/teacher/marks
// ──────────────────────────────────────────────────
const saveMarks = async (req, res) => {
  const txn = await sequelize.transaction();
  try {
    const { class_id, exam_type, marks_data } = req.body;

    if (!class_id || !exam_type || !marks_data || !marks_data.length) {
      await txn.rollback();
      return res.status(400).json({ success: false, message: 'class_id, exam_type, and marks_data are required' });
    }

    let teacherId = null;
    if (req.user && req.user.id) {
      const teacher = await Teacher.findOne({ where: { user_id: req.user.id } });
      if (teacher) teacherId = teacher.id;
    }

    let created = 0;
    let updated = 0;
    let deleted = 0;

    for (const entry of marks_data) {
      const { student_id, subject, max_marks, marks_obtained, is_absent, remark } = entry;

      if (!student_id || !subject) continue;

      const existing = await Mark.findOne({
        where: { student_id, subject, exam_type },
        transaction: txn
      });

      // A student has a real mark only if marked absent or a number was entered.
      // A blank field is NOT zero — it means "no mark". Never store 0 for a blank.
      const hasNumber =
        marks_obtained !== null && marks_obtained !== undefined && marks_obtained !== '';
      const meaningful = !!is_absent || hasNumber;

      if (!meaningful) {
        // Cleared / never entered → remove any existing row instead of saving a 0.
        if (existing) {
          await existing.destroy({ transaction: txn });
          deleted++;
        }
        continue;
      }

      // A real mark needs a max out of which it was scored.
      if (!max_marks) continue;

      const payload = {
        class_id,
        max_marks,
        marks_obtained: is_absent ? null : marks_obtained,
        is_absent: !!is_absent,
        remark: remark || null,
        uploaded_by: teacherId
      };

      if (existing) {
        await existing.update(payload, { transaction: txn });
        updated++;
      } else {
        await Mark.create(
          { student_id, subject, exam_type, ...payload },
          { transaction: txn }
        );
        created++;
      }
    }

    await txn.commit();
    const parts = [`${created} new`, `${updated} updated`];
    if (deleted) parts.push(`${deleted} cleared`);
    res.json({
      success: true,
      message: `Marks saved: ${parts.join(', ')}`,
      created,
      updated,
      deleted
    });
  } catch (error) {
    await txn.rollback();
    console.error('Error saving marks:', error);
    res.status(500).json({ success: false, message: 'Failed to save marks' });
  }
};

// ──────────────────────────────────────────────────
// DELETE MARKS (remove a whole exam+subject, or one student's mark)
// DELETE /api/teacher/marks
// body: { class_id, exam_type, subject, student_id? }
// ──────────────────────────────────────────────────
const deleteMarks = async (req, res) => {
  try {
    const { class_id, exam_type, subject, student_id } = req.body;

    if (!class_id || !exam_type || !subject) {
      return res.status(400).json({
        success: false,
        message: 'class_id, exam_type, and subject are required'
      });
    }

    const where = { class_id, exam_type, subject };
    if (student_id) where.student_id = student_id; // scope to one student if given

    const deleted = await Mark.destroy({ where });

    res.json({
      success: true,
      message: student_id
        ? (deleted ? 'Mark deleted' : 'No mark found to delete')
        : `Deleted ${deleted} mark${deleted === 1 ? '' : 's'} for ${subject} (${exam_type})`,
      deleted
    });
  } catch (error) {
    console.error('Error deleting marks:', error);
    res.status(500).json({ success: false, message: 'Failed to delete marks' });
  }
};

// ──────────────────────────────────────────────────
// STUDENT: GET OWN RESULTS
// GET /api/student/results?exam_type=
// ──────────────────────────────────────────────────
const getOwnResults = async (req, res) => {
  try {
    const studentUserId = req.user?.id;
    const { exam_type } = req.query;

    const student = await Student.findOne({
      where: { user_id: studentUserId },
      include: [{ model: Class, as: 'class' }]
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const where = { student_id: student.id };
    if (exam_type && exam_type !== 'all') where.exam_type = exam_type;

    const myMarks = await Mark.findAll({
      where,
      order: [['exam_type', 'ASC'], ['subject', 'ASC']]
    });

    if (myMarks.length === 0) {
      return res.json({
        success: true,
        marks: [],
        analytics: null,
        available_exams: [],
        message: 'No results found'
      });
    }

    const examTypes = [...new Set(myMarks.map(m => m.exam_type))];

    const classMarks = await Mark.findAll({
      where: {
        class_id: student.class_id,
        exam_type: { [Op.in]: examTypes },
        is_absent: false
      }
    });

    // Per-subject analytics
    const subjectAnalytics = {};
    myMarks.forEach(m => {
      const key = `${m.exam_type}__${m.subject}`;
      const classSubjectMarks = classMarks
        .filter(cm => cm.exam_type === m.exam_type && cm.subject === m.subject && cm.marks_obtained !== null)
        .map(cm => parseFloat(cm.marks_obtained));

      const classAvg = classSubjectMarks.length > 0
        ? classSubjectMarks.reduce((a, b) => a + b, 0) / classSubjectMarks.length
        : 0;

      subjectAnalytics[key] = {
        class_average: Math.round(classAvg * 100) / 100,
        class_highest: classSubjectMarks.length > 0 ? Math.max(...classSubjectMarks) : 0,
        class_lowest: classSubjectMarks.length > 0 ? Math.min(...classSubjectMarks) : 0,
        total_students: classSubjectMarks.length
      };
    });

    // Overall exam analytics
    const examAnalytics = {};

    for (const et of examTypes) {
      const examClassMarks = classMarks.filter(cm => cm.exam_type === et);

      const studentTotals = {};
      examClassMarks.forEach(cm => {
        if (!studentTotals[cm.student_id]) {
          studentTotals[cm.student_id] = { obtained: 0, max: 0 };
        }
        studentTotals[cm.student_id].obtained += parseFloat(cm.marks_obtained || 0);
        studentTotals[cm.student_id].max += cm.max_marks;
      });

      const allTotals = Object.values(studentTotals).map(t => t.obtained);
      allTotals.sort((a, b) => b - a);

      const myExamMarks = myMarks.filter(m => m.exam_type === et && !m.is_absent);
      const myTotal = myExamMarks.reduce((sum, m) => sum + parseFloat(m.marks_obtained || 0), 0);
      const myMaxTotal = myExamMarks.reduce((sum, m) => sum + m.max_marks, 0);

      const rank = allTotals.indexOf(myTotal) + 1;
      const totalStudents = allTotals.length;
      const belowMe = allTotals.filter(t => t < myTotal).length;
      const percentile = totalStudents > 0 ? Math.round((belowMe / totalStudents) * 100) : 0;

      const classAvgTotal = allTotals.length > 0
        ? allTotals.reduce((a, b) => a + b, 0) / allTotals.length
        : 0;

      const areasToImprove = [];
      myExamMarks.forEach(m => {
        const key = `${et}__${m.subject}`;
        const sa = subjectAnalytics[key];
        if (sa && parseFloat(m.marks_obtained) < sa.class_average) {
          areasToImprove.push({
            subject: m.subject,
            your_marks: parseFloat(m.marks_obtained),
            class_average: sa.class_average,
            max_marks: m.max_marks
          });
        }
      });

      examAnalytics[et] = {
        rank,
        total_students: totalStudents,
        percentile,
        your_total: myTotal,
        your_max_total: myMaxTotal,
        your_percentage: myMaxTotal > 0 ? Math.round((myTotal / myMaxTotal) * 10000) / 100 : 0,
        class_average_total: Math.round(classAvgTotal * 100) / 100,
        class_highest_total: allTotals.length > 0 ? Math.max(...allTotals) : 0,
        class_lowest_total: allTotals.length > 0 ? Math.min(...allTotals) : 0,
        areas_to_improve: areasToImprove
      };
    }

    const getGrade = (percentage) => {
      if (percentage >= 90) return 'A+';
      if (percentage >= 80) return 'A';
      if (percentage >= 70) return 'B+';
      if (percentage >= 60) return 'B';
      if (percentage >= 50) return 'C';
      if (percentage >= 40) return 'D';
      return 'F';
    };

    const marksWithAnalytics = myMarks.map(m => {
      const percentage = m.is_absent ? null
        : (m.max_marks > 0 ? (parseFloat(m.marks_obtained) / m.max_marks) * 100 : 0);
      const key = `${m.exam_type}__${m.subject}`;

      return {
        id: m.id,
        subject: m.subject,
        exam_type: m.exam_type,
        max_marks: m.max_marks,
        marks_obtained: m.is_absent ? null : parseFloat(m.marks_obtained),
        is_absent: m.is_absent,
        remark: m.remark,
        percentage: percentage !== null ? Math.round(percentage * 100) / 100 : null,
        grade: percentage !== null ? getGrade(percentage) : 'AB',
        subject_analytics: subjectAnalytics[key] || null
      };
    });

    const allExamTypes = await Mark.findAll({
      where: { student_id: student.id },
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('exam_type')), 'exam_type']],
      raw: true
    });

    res.json({
      success: true,
      marks: marksWithAnalytics,
      exam_analytics: examAnalytics,
      available_exams: allExamTypes.map(e => e.exam_type),
      student: {
        name: student.user?.name,
        class_name: student.class ? `${student.class.class_name}-${student.class.section}` : ''
      }
    });
  } catch (error) {
    console.error('Error fetching own results:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch results' });
  }
};

// ──────────────────────────────────────────────────
// GET EXAM TYPES THAT EXIST FOR A CLASS
// GET /api/teacher/marks/exam-types/:classId
// ──────────────────────────────────────────────────
const getExamTypes = async (req, res) => {
  try {
    const { classId } = req.params;

    // Get all (exam_type, subject) combos that have marks for this class
    const rows = await Mark.findAll({
      where: { class_id: classId },
      attributes: ['exam_type', 'subject'],
      group: ['exam_type', 'subject'],
      raw: true
    });

    // Group subjects under each exam_type
    const grouped = {};
    rows.forEach(r => {
      if (!grouped[r.exam_type]) grouped[r.exam_type] = [];
      grouped[r.exam_type].push(r.subject);
    });

    const examTypes = Object.entries(grouped).map(([exam_type, subjects]) => ({
      exam_type,
      subjects: subjects.sort()
    }));

    res.json({ success: true, examTypes });
  } catch (error) {
    console.error('Error fetching exam types:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch exam types' });
  }
};

module.exports = {
  getSubjectsForClass,
  getMarks,
  saveMarks,
  deleteMarks,
  getOwnResults,
  getExamTypes
};
