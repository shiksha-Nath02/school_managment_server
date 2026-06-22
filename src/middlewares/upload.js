const multer = require('multer');

// In-memory storage: the file lands in req.file.buffer so we can compress it
// and PutObject to S3 without ever touching local disk.
const storage = multer.memoryStorage();

const LIMITS = { fileSize: 10 * 1024 * 1024 }; // 10MB

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const PDF_TYPE = 'application/pdf';

const filter = (allowed, label) => (req, file, cb) => {
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error(`Only ${label} files are allowed`), false);
};

// Student docs: images (compressed) or PDFs (size-capped).
const docUpload = multer({
  storage,
  limits: LIMITS,
  fileFilter: filter([...IMAGE_TYPES, PDF_TYPE], 'JPEG, PNG, and PDF'),
});

// Gallery: images only.
const imageUpload = multer({
  storage,
  limits: LIMITS,
  fileFilter: filter(IMAGE_TYPES, 'JPEG and PNG'),
});

// Circulars: PDF only.
const pdfUpload = multer({
  storage,
  limits: LIMITS,
  fileFilter: filter([PDF_TYPE], 'PDF'),
});

module.exports = docUpload;
module.exports.imageUpload = imageUpload;
module.exports.pdfUpload = pdfUpload;
