const router = require('express').Router();
const upload = require('../middlewares/upload');
const { getStudentDocs, uploadDocument, deleteDocument } = require('../controllers/documentController');

router.get('/student-docs', getStudentDocs);
router.post('/student-docs/:studentId/:docType', upload.single('file'), uploadDocument);
router.delete('/student-docs/:docId', deleteDocument);

module.exports = router;
