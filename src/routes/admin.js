const router = require("express").Router();
const { authenticate, authorize } = require("../middlewares/auth");
const {
  addStudent,
  getStudents,
  getStudentById,
  getClasses,
} = require("../controllers/adminController");

// All admin routes require auth + admin role
router.use(authenticate, authorize("admin"));

// Classes
router.get("/classes", getClasses);

// Students
router.post("/students", addStudent);
router.get("/students", getStudents);
router.get("/students/:id", getStudentById);

module.exports = router;
