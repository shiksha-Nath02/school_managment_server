const bcrypt = require("bcryptjs");
const { sequelize, User, Class } = require("../models");

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected for seeding...");

    // Create admin user if not exists
    const adminExists = await User.findOne({ where: { email: "admin@school.com" } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Admin",
        email: "admin@school.com",
        password: hashedPassword,
        role: "admin",
        phone: "9999999999",
      });
      console.log("Admin user created (admin@school.com / admin123)");
    } else {
      console.log("Admin user already exists");
    }

    // Create sample classes if none exist
    const classCount = await Class.count();
    if (classCount === 0) {
      const classes = [];
      for (let grade = 1; grade <= 12; grade++) {
        for (const section of ["A", "B"]) {
          classes.push({ class_name: `${grade}`, section });
        }
      }
      await Class.bulkCreate(classes);
      console.log(`Created ${classes.length} classes (1A-12B)`);
    } else {
      console.log(`${classCount} classes already exist`);
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
