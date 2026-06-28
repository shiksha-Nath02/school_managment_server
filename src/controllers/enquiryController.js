const { Op, fn, col, where } = require('sequelize');
const { Enquiry, Student, Teacher, User, Class } = require('../models');

const fmt = (e) => ({
  id:        e.id,
  type:      e.type,
  name:      e.name,
  email:     e.email,
  phone:     e.phone,
  detail:    e.detail,
  message:   e.message,
  status:    e.status,
  createdAt: e.created_at,
});

// ─── PUBLIC: submit an enquiry from the school website ────────────────────────
const submitEnquiry = async (req, res) => {
  try {
    const { type, name, email, phone, detail, message } = req.body;
    if (!['student', 'teacher'].includes(type)) return res.status(400).json({ message: 'type must be student or teacher' });
    if (!name || !String(name).trim()) return res.status(400).json({ message: 'Name is required' });
    if (!phone && !email) return res.status(400).json({ message: 'A phone or email is required' });

    const enquiry = await Enquiry.create({
      type,
      name: String(name).trim().slice(0, 150),
      email: email ? String(email).trim().slice(0, 150) : null,
      phone: phone ? String(phone).trim().slice(0, 20) : null,
      detail: detail ? String(detail).trim().slice(0, 150) : null,
      message: message ? String(message).trim().slice(0, 2000) : null,
    });
    res.status(201).json({ message: 'Enquiry submitted', id: enquiry.id });
  } catch (e) {
    console.error('Submit enquiry error:', e);
    res.status(500).json({ message: 'Failed to submit enquiry' });
  }
};

// ─── ADMIN: list / update / delete enquiries ──────────────────────────────────
const getEnquiries = async (req, res) => {
  try {
    const { type, status } = req.query;
    const w = {};
    if (type) w.type = type;
    if (status) w.status = status;
    const enquiries = await Enquiry.findAll({ where: w, order: [['created_at', 'DESC'], ['id', 'DESC']] });
    res.json({ enquiries: enquiries.map(fmt) });
  } catch (e) {
    console.error('Get enquiries error:', e);
    res.status(500).json({ message: 'Failed to fetch enquiries' });
  }
};

const updateEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByPk(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
    const { status } = req.body;
    if (status && !['new', 'contacted', 'closed'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    await enquiry.update({ status: status || enquiry.status });
    res.json({ message: 'Enquiry updated', enquiry: fmt(enquiry) });
  } catch (e) {
    res.status(500).json({ message: 'Failed to update enquiry' });
  }
};

const deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByPk(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
    await enquiry.destroy();
    res.json({ message: 'Enquiry deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete enquiry' });
  }
};

// ─── PUBLIC: today's birthdays (students + teachers) ──────────────────────────
const getTodayBirthdays = async (req, res) => {
  try {
    const now = new Date(); // server is pinned to IST
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const dobMatch = (column) => [
      where(fn('MONTH', col(column)), month),
      where(fn('DAY', col(column)), day),
    ];

    const [students, teachers] = await Promise.all([
      Student.findAll({
        where: { status: 'active', [Op.and]: dobMatch('date_of_birth') },
        include: [
          { model: User, as: 'user', attributes: ['name'], where: { is_active: true } },
          { model: Class, as: 'class', attributes: ['class_name', 'section'] },
        ],
      }),
      Teacher.findAll({
        where: { [Op.and]: dobMatch('Teacher.date_of_birth') },
        include: [{ model: User, as: 'user', attributes: ['name'], where: { is_active: true } }],
      }),
    ]);

    res.json({
      date: `${now.getFullYear()}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      students: students.map((s) => ({
        name: s.user?.name || null,
        className: s.class ? `${s.class.class_name}${s.class.section ? ` ${s.class.section}` : ''}` : null,
      })),
      teachers: teachers.map((t) => ({
        name: t.user?.name || null,
        subject: t.subject || null,
      })),
    });
  } catch (e) {
    console.error('Get birthdays error:', e);
    res.status(500).json({ message: 'Failed to fetch birthdays' });
  }
};

module.exports = { submitEnquiry, getEnquiries, updateEnquiry, deleteEnquiry, getTodayBirthdays };
