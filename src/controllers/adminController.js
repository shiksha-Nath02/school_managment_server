const bcrypt = require("bcryptjs");
const { User, Student, Class, sequelize } = require("../models");

// POST /api/admin/students — Add a new student
const addStudent = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      name,
      email,
      phone,
      password,
      class_id,
      roll_number,
      date_of_birth,
      address,
      admission_date,
    } = req.body;

    // Validation
    if (!name || !email || !class_id || !roll_number) {
      return res.status(400).json({
        message: "Name, email, class, and roll number are required",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Check if class exists
    const classRecord = await Class.findByPk(class_id);
    if (!classRecord) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Check duplicate roll number in same class
    const existingRoll = await Student.findOne({
      where: { class_id, roll_number },
    });
    if (existingRoll) {
      return res.status(409).json({
        message: `Roll number ${roll_number} already exists in this class`,
      });
    }

    // Step 1: Create user with role = "student"
    // Default password: student's DOB (ddmmyyyy) or "student123"
    const defaultPassword = password || "student123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const user = await User.create(
      {
        name,
        email,
        password: hashedPassword,
        role: "student",
        phone: phone || null,
      },
      { transaction: t }
    );

    // Step 2: Create student record linked to user
    const student = await Student.create(
      {
        user_id: user.id,
        class_id,
        roll_number,
        date_of_birth: date_of_birth || null,
        address: address || null,
        admission_date: admission_date || new Date(),
      },
      { transaction: t }
    );

    // Commit both
    await t.commit();

    // Fetch complete student with associations
    const fullStudent = await Student.findByPk(student.id, {
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email", "phone"] },
        { model: Class, as: "class", attributes: ["id", "class_name", "section"] },
      ],
    });

    res.status(201).json({
      message: "Student added successfully",
      student: fullStudent,
    });
  } catch (error) {
    await t.rollback();
    console.error("Add student error:", error);
    res.status(500).json({ message: "Failed to add student" });
  }
};

// GET /api/admin/students — List all students
const getStudents = async (req, res) => {
  try {
    const { class_id, search } = req.query;

    const where = {};
    if (class_id) where.class_id = class_id;

    const students = await Student.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
          ...(search
            ? { where: { name: { [require("sequelize").Op.like]: `%${search}%` } } }
            : {}),
        },
        { model: Class, as: "class", attributes: ["id", "class_name", "section"] },
      ],
      order: [["roll_number", "ASC"]],
    });

    res.json({ students });
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

// GET /api/admin/students/:id — Get single student
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email", "phone"] },
        { model: Class, as: "class", attributes: ["id", "class_name", "section"] },
      ],
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ student });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch student" });
  }
};

// GET /api/admin/classes — List all classes (for dropdown)
const getClasses = async (req, res) => {
  try {
    const classes = await Class.findAll({
      attributes: ["id", "class_name", "section"],
      order: [["class_name", "ASC"], ["section", "ASC"]],
    });

    res.json({ classes });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch classes" });
  }
};

module.exports = { addStudent, getStudents, getStudentById, getClasses };
