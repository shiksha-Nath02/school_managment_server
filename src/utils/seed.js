// ============================================================
// SchoolDesk — Seed Script
// Creates: 1 Admin + 1 Teacher + 1 Student + 24 Classes
// Run: node src/utils/seed.js
// ============================================================

const bcrypt = require('bcryptjs');
const { sequelize, User, Student, Teacher, Class } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync all models (won't drop existing tables)
    await sequelize.sync();

    // ─────────────────────────────────────
    // 1. CLASSES (24 total: Class 1-12, Section A & B)
    // ─────────────────────────────────────
    const classesToCreate = [];
    for (let i = 1; i <= 12; i++) {
      classesToCreate.push({ class_name: String(i), section: 'A' });
      classesToCreate.push({ class_name: String(i), section: 'B' });
    }

    for (const cls of classesToCreate) {
      const existing = await Class.findOne({
        where: { class_name: cls.class_name, section: cls.section },
      });
      if (!existing) {
        await Class.create(cls);
      }
    }
    console.log('✅ 24 classes seeded');

    // ─────────────────────────────────────
    // 2. ADMIN USER
    // ─────────────────────────────────────
    const adminExists = await User.findOne({ where: { email: 'admin@school.com' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin User',
        email: 'admin@school.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+91 99999 00001',
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️  Admin user already exists, skipping');
    }

    // ─────────────────────────────────────
    // 3. TEACHER USER + TEACHER ROW
    // ─────────────────────────────────────
    const teacherExists = await User.findOne({ where: { email: 'teacher@school.com' } });
    if (!teacherExists) {
      const t = await sequelize.transaction();
      try {
        const hashedPassword = await bcrypt.hash('teacher123', 10);

        // Create user row
        const teacherUser = await User.create({
          name: 'Mrs. Priya Gupta',
          email: 'teacher@school.com',
          password: hashedPassword,
          role: 'teacher',
          phone: '+91 87654 32109',
        }, { transaction: t });

        // Find class 10-A to assign as class teacher
        const class10A = await Class.findOne({
          where: { class_name: '10', section: 'A' },
        });

        // Create teacher row linked to user
        await Teacher.create({
          user_id: teacherUser.id,
          subject: 'Mathematics',
          salary: 45000.00,
          joining_date: '2019-04-01',
        }, { transaction: t });

        // If class 10-A exists, assign this teacher as class teacher
        if (class10A) {
          const teacher = await Teacher.findOne({
            where: { user_id: teacherUser.id },
            transaction: t,
          });
          await class10A.update(
            { class_teacher_id: teacher.id },
            { transaction: t }
          );
        }

        await t.commit();
        console.log('✅ Teacher user created (Mrs. Priya Gupta)');
      } catch (err) {
        await t.rollback();
        throw err;
      }
    } else {
      console.log('ℹ️  Teacher user already exists, skipping');
    }

    // ─────────────────────────────────────
    // 4. STUDENT USER + STUDENT ROW
    // ─────────────────────────────────────
    const studentExists = await User.findOne({ where: { email: 'student@school.com' } });
    if (!studentExists) {
      const t = await sequelize.transaction();
      try {
        const hashedPassword = await bcrypt.hash('student123', 10);

        // Create user row
        const studentUser = await User.create({
          name: 'Rahul Sharma',
          email: 'student@school.com',
          password: hashedPassword,
          role: 'student',
          phone: '+91 98765 43210',
        }, { transaction: t });

        // Find class 10-A
        const class10A = await Class.findOne({
          where: { class_name: '10', section: 'A' },
        });

        // Create student row linked to user
        await Student.create({
          user_id: studentUser.id,
          class_id: class10A ? class10A.id : 1,
          roll_number: 14,
          date_of_birth: '2011-03-15',
          address: '12, Sector 5, Dwarka, New Delhi',
          admission_date: '2021-04-01',
        }, { transaction: t });

        await t.commit();
        console.log('✅ Student user created (Rahul Sharma)');
      } catch (err) {
        await t.rollback();
        throw err;
      }
    } else {
      console.log('ℹ️  Student user already exists, skipping');
    }

    // ─────────────────────────────────────
    // DONE
    // ─────────────────────────────────────
    console.log('\n🎉 Seed complete! Here are your login credentials:\n');
    console.log('┌──────────┬────────────────────────┬─────────────┐');
    console.log('│  Role    │  Email                 │  Password   │');
    console.log('├──────────┼────────────────────────┼─────────────┤');
    console.log('│  Admin   │  admin@school.com      │  admin123   │');
    console.log('│  Teacher │  teacher@school.com    │  teacher123 │');
    console.log('│  Student │  student@school.com    │  student123 │');
    console.log('└──────────┴────────────────────────┴─────────────┘');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seed();