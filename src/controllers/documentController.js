const { Op } = require('sequelize');
const { StudentDocument, Student, User, Class, Teacher } = require('../models');
const { key, uploadBuffer, getPresignedUrl, deleteObject, PRIVATE_BUCKET } = require('../utils/s3');
const { compressImage } = require('../utils/imageCompress');

const DOC_TYPES = [
  'student_aadhaar', 'father_aadhaar', 'mother_aadhaar',
  'father_pan', 'mother_pan', 'birth_certificate', 'category_certificate',
];

const studentIncludes = [
  { model: User, as: 'user', attributes: ['name'] },
  { model: Class, as: 'class', attributes: ['class_name', 'section'] },
  { model: StudentDocument, as: 'documents' },
];

// Async: each doc gets a fresh presigned GET URL (private bucket, ~1h expiry).
const fmtDoc = async (d) => ({
  id: d.id,
  documentType: d.document_type,
  filePath: d.file_path, // the S3 key (kept for debug/back-compat)
  fileName: d.file_name,
  mimeType: d.mime_type,
  fileSize: d.file_size,
  uploadedAt: d.created_at,
  url: await getPresignedUrl(d.file_path),
});

const formatStudent = async (s) => ({
  id: s.id,
  name: s.user?.name,
  class: s.class ? `${s.class.class_name}-${s.class.section}` : null,
  class_id: s.class_id,
  roll_number: s.roll_number,
  documents: await Promise.all((s.documents || []).map(fmtDoc)),
});

// ── Admin: list all students + their docs ────────────────────────────────────
const getStudentDocs = async (req, res) => {
  try {
    const { class_id } = req.query;
    const where = { status: { [Op.ne]: 'inactive' } };
    if (class_id) where.class_id = parseInt(class_id, 10);

    const students = await Student.findAll({
      where,
      include: studentIncludes,
      order: [['class_id', 'ASC'], ['roll_number', 'ASC']],
    });

    res.json({ success: true, students: await Promise.all(students.map(formatStudent)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
};

// ── Shared upload logic ───────────────────────────────────────────────────────
const doUpload = async (req, res) => {
  const { studentId, docType } = req.params;

  if (!DOC_TYPES.includes(docType)) {
    return res.status(400).json({ success: false, message: 'Invalid document type' });
  }
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const student = await Student.findByPk(parseInt(studentId, 10));
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  // Compress images to JPEG; leave PDFs as-is (multer already caps size at 10MB).
  const isImage = req.file.mimetype.startsWith('image/');
  let body = req.file.buffer;
  let contentType = req.file.mimetype;
  let ext = req.file.originalname.split('.').pop().toLowerCase();
  if (isImage) {
    const compressed = await compressImage(req.file.buffer);
    body = compressed.buffer;
    contentType = compressed.contentType;
    ext = compressed.ext;
  }

  const objectKey = key('student-docs', `student_${studentId}_${docType}_${Date.now()}.${ext}`);
  await uploadBuffer({ bucket: PRIVATE_BUCKET, key: objectKey, body, contentType });

  // Delete old file for same type if it exists (S3 object + DB row).
  const existing = await StudentDocument.findOne({
    where: { student_id: studentId, document_type: docType },
  });
  if (existing) {
    try { await deleteObject({ bucket: PRIVATE_BUCKET, key: existing.file_path }); } catch (_) {}
    await existing.destroy();
  }

  const doc = await StudentDocument.create({
    student_id: parseInt(studentId, 10),
    document_type: docType,
    file_path: objectKey,
    file_name: req.file.originalname,
    file_size: body.length,
    mime_type: contentType,
    uploaded_by: req.user?.id || null,
  });

  res.json({ success: true, document: await fmtDoc(doc) });
};

// ── Admin: upload ─────────────────────────────────────────────────────────────
const uploadDocument = async (req, res) => {
  try {
    await doUpload(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to upload document' });
  }
};

// ── Admin: delete ─────────────────────────────────────────────────────────────
const deleteDocument = async (req, res) => {
  try {
    const doc = await StudentDocument.findByPk(req.params.docId);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    try { await deleteObject({ bucket: PRIVATE_BUCKET, key: doc.file_path }); } catch (_) {}
    await doc.destroy();

    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete document' });
  }
};

// ── Teacher: list students in teacher's classes ───────────────────────────────
const getTeacherStudentDocs = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({
      where: { user_id: req.user.id },
      include: [{ model: Class, as: 'classes', attributes: ['id'] }],
    });
    const classIds = (teacher?.classes || []).map((c) => c.id);
    if (!classIds.length) return res.json({ success: true, students: [] });

    const { class_id } = req.query;
    const classFilter = class_id && classIds.includes(parseInt(class_id, 10))
      ? parseInt(class_id, 10)
      : { [Op.in]: classIds };

    const students = await Student.findAll({
      where: { class_id: classFilter, status: { [Op.ne]: 'inactive' } },
      include: studentIncludes,
      order: [['class_id', 'ASC'], ['roll_number', 'ASC']],
    });

    res.json({ success: true, students: await Promise.all(students.map(formatStudent)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
};

// ── Teacher: upload (class-restricted) ───────────────────────────────────────
const teacherUploadDocument = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({
      where: { user_id: req.user.id },
      include: [{ model: Class, as: 'classes', attributes: ['id'] }],
    });
    const classIds = (teacher?.classes || []).map((c) => c.id);

    const student = await Student.findByPk(parseInt(req.params.studentId, 10));
    if (!student || !classIds.includes(student.class_id)) {
      return res.status(403).json({ success: false, message: 'Student is not in your class' });
    }

    await doUpload(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to upload document' });
  }
};

module.exports = {
  getStudentDocs, uploadDocument, deleteDocument,
  getTeacherStudentDocs, teacherUploadDocument,
};
