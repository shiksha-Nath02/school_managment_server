/**
 * SchoolDesk — Full Data Seed Script
 *
 * Creates:
 * - 8 Teachers (assigned as class teachers to classes 1-5)
 * - ~85 Students (10-15 per section across classes 1 to 5)
 *
 * Class structure:
 *   Class 1: Section A only       (12 students)
 *   Class 2: Sections A & B       (12 + 10 students)
 *   Class 3: Section A only       (14 students)
 *   Class 4: Sections A & B       (11 + 13 students)
 *   Class 5: Section A only       (13 students)
 *
 * Run: node src/utils/seedData.js
 * Note: Run AFTER the original seed.js (needs classes + admin to exist)
 */

const bcrypt = require('bcryptjs');
const { sequelize, User, Student, Teacher, Class } = require('../models');

// ─────────────────────────────────────────
// TEACHER DATA
// ─────────────────────────────────────────
const teacherData = [
  { name: 'Mrs. Sunita Sharma',   email: 'sunita.sharma@school.com',   subject: 'English',           salary: 42000, phone: '+91 98765 10001', joining: '2020-04-01', assignClass: '1', assignSection: 'A' },
  { name: 'Mr. Rajesh Kumar',     email: 'rajesh.kumar@school.com',    subject: 'Mathematics',        salary: 44000, phone: '+91 98765 10002', joining: '2019-07-15', assignClass: '2', assignSection: 'A' },
  { name: 'Mrs. Anita Verma',     email: 'anita.verma@school.com',     subject: 'Hindi',              salary: 40000, phone: '+91 98765 10003', joining: '2021-04-01', assignClass: '2', assignSection: 'B' },
  { name: 'Mr. Deepak Singh',     email: 'deepak.singh@school.com',    subject: 'Science',            salary: 45000, phone: '+91 98765 10004', joining: '2018-04-01', assignClass: '3', assignSection: 'A' },
  { name: 'Mrs. Kavita Joshi',    email: 'kavita.joshi@school.com',    subject: 'Social Studies',     salary: 43000, phone: '+91 98765 10005', joining: '2020-07-01', assignClass: '4', assignSection: 'A' },
  { name: 'Mr. Amit Pandey',      email: 'amit.pandey@school.com',     subject: 'English',            salary: 41000, phone: '+91 98765 10006', joining: '2022-04-01', assignClass: '4', assignSection: 'B' },
  { name: 'Mrs. Neha Gupta',      email: 'neha.gupta@school.com',      subject: 'Mathematics',        salary: 46000, phone: '+91 98765 10007', joining: '2017-04-01', assignClass: '5', assignSection: 'A' },
  { name: 'Mr. Vikram Tiwari',    email: 'vikram.tiwari@school.com',   subject: 'Physical Education', salary: 38000, phone: '+91 98765 10008', joining: '2021-07-15', assignClass: null, assignSection: null },
];

// ─────────────────────────────────────────
// STUDENT DATA (grouped by class-section)
// ─────────────────────────────────────────
const studentData = {
  '1-A': [
    { name: 'Aadhya Mishra',     dob: '2019-03-15', phone: '+91 98100 20001' },
    { name: 'Vivaan Reddy',      dob: '2019-06-22', phone: '+91 98100 20002' },
    { name: 'Anaya Kapoor',      dob: '2019-01-10', phone: '+91 98100 20003' },
    { name: 'Arjun Nair',        dob: '2019-08-05', phone: '+91 98100 20004' },
    { name: 'Diya Saxena',       dob: '2019-11-18', phone: '+91 98100 20005' },
    { name: 'Kabir Mehta',       dob: '2019-04-30', phone: '+91 98100 20006' },
    { name: 'Ishita Rao',        dob: '2019-07-12', phone: '+91 98100 20007' },
    { name: 'Reyansh Jain',      dob: '2019-02-25', phone: '+91 98100 20008' },
    { name: 'Saanvi Thakur',     dob: '2019-09-08', phone: '+91 98100 20009' },
    { name: 'Aryan Choudhary',   dob: '2019-12-01', phone: '+91 98100 20010' },
    { name: 'Myra Bhatia',       dob: '2019-05-14', phone: '+91 98100 20011' },
    { name: 'Vihaan Agarwal',    dob: '2019-10-20', phone: '+91 98100 20012' },
  ],

  '2-A': [
    { name: 'Anika Srivastava',  dob: '2018-01-08', phone: '+91 98100 20013' },
    { name: 'Dev Malhotra',      dob: '2018-04-19', phone: '+91 98100 20014' },
    { name: 'Pari Chauhan',      dob: '2018-07-25', phone: '+91 98100 20015' },
    { name: 'Shaurya Bhatt',     dob: '2018-03-11', phone: '+91 98100 20016' },
    { name: 'Kiara Menon',       dob: '2018-06-02', phone: '+91 98100 20017' },
    { name: 'Advait Kulkarni',   dob: '2018-09-15', phone: '+91 98100 20018' },
    { name: 'Navya Iyer',        dob: '2018-12-28', phone: '+91 98100 20019' },
    { name: 'Rudra Tomar',       dob: '2018-02-14', phone: '+91 98100 20020' },
    { name: 'Aarohi Deshmukh',   dob: '2018-05-30', phone: '+91 98100 20021' },
    { name: 'Yash Khanna',       dob: '2018-08-07', phone: '+91 98100 20022' },
    { name: 'Trisha Pillai',     dob: '2018-11-19', phone: '+91 98100 20023' },
    { name: 'Dhruv Bansal',      dob: '2018-10-03', phone: '+91 98100 20024' },
  ],

  '2-B': [
    { name: 'Siya Rajput',       dob: '2018-02-20', phone: '+91 98100 20025' },
    { name: 'Atharv Saxena',     dob: '2018-05-11', phone: '+91 98100 20026' },
    { name: 'Riya Oberoi',       dob: '2018-08-03', phone: '+91 98100 20027' },
    { name: 'Kian Sethi',        dob: '2018-01-16', phone: '+91 98100 20028' },
    { name: 'Ahana Bhardwaj',    dob: '2018-04-28', phone: '+91 98100 20029' },
    { name: 'Pranav Grover',     dob: '2018-07-09', phone: '+91 98100 20030' },
    { name: 'Nisha Arora',       dob: '2018-10-22', phone: '+91 98100 20031' },
    { name: 'Arush Mittal',      dob: '2018-03-05', phone: '+91 98100 20032' },
    { name: 'Zara Khan',         dob: '2018-06-17', phone: '+91 98100 20033' },
    { name: 'Om Chandra',        dob: '2018-09-30', phone: '+91 98100 20034' },
  ],

  '3-A': [
    { name: 'Aavya Dubey',       dob: '2017-01-12', phone: '+91 98100 20035' },
    { name: 'Ishaan Rawat',      dob: '2017-04-23', phone: '+91 98100 20036' },
    { name: 'Misha Tandon',      dob: '2017-07-05', phone: '+91 98100 20037' },
    { name: 'Rohan Bhat',        dob: '2017-02-18', phone: '+91 98100 20038' },
    { name: 'Prisha Gulati',     dob: '2017-05-29', phone: '+91 98100 20039' },
    { name: 'Aarush Dutta',      dob: '2017-08-14', phone: '+91 98100 20040' },
    { name: 'Shanaya Kaul',      dob: '2017-11-26', phone: '+91 98100 20041' },
    { name: 'Ranbir Chopra',     dob: '2017-03-07', phone: '+91 98100 20042' },
    { name: 'Tara Sengupta',     dob: '2017-06-19', phone: '+91 98100 20043' },
    { name: 'Ayaan Luthra',      dob: '2017-09-01', phone: '+91 98100 20044' },
    { name: 'Meera Sinha',       dob: '2017-12-13', phone: '+91 98100 20045' },
    { name: 'Neil Wadhwa',       dob: '2017-04-04', phone: '+91 98100 20046' },
    { name: 'Sia Bajaj',         dob: '2017-07-16', phone: '+91 98100 20047' },
    { name: 'Parth Ahuja',       dob: '2017-10-28', phone: '+91 98100 20048' },
  ],

  '4-A': [
    { name: 'Aditi Pandey',      dob: '2016-01-22', phone: '+91 98100 20049' },
    { name: 'Veer Singhania',    dob: '2016-04-08', phone: '+91 98100 20050' },
    { name: 'Ira Mahajan',       dob: '2016-07-14', phone: '+91 98100 20051' },
    { name: 'Arnav Goyal',       dob: '2016-02-27', phone: '+91 98100 20052' },
    { name: 'Kavya Rathore',     dob: '2016-05-19', phone: '+91 98100 20053' },
    { name: 'Lakshay Dhawan',    dob: '2016-08-25', phone: '+91 98100 20054' },
    { name: 'Nandini Venkat',    dob: '2016-11-06', phone: '+91 98100 20055' },
    { name: 'Ritvik Sodhi',      dob: '2016-03-18', phone: '+91 98100 20056' },
    { name: 'Palak Bhargava',    dob: '2016-06-01', phone: '+91 98100 20057' },
    { name: 'Siddharth Rana',    dob: '2016-09-12', phone: '+91 98100 20058' },
    { name: 'Tanya Kohli',       dob: '2016-12-24', phone: '+91 98100 20059' },
  ],

  '4-B': [
    { name: 'Aarav Bedi',        dob: '2016-01-05', phone: '+91 98100 20060' },
    { name: 'Shreya Madan',      dob: '2016-04-17', phone: '+91 98100 20061' },
    { name: 'Ishan Kapoor',      dob: '2016-07-28', phone: '+91 98100 20062' },
    { name: 'Mahika Lal',        dob: '2016-02-09', phone: '+91 98100 20063' },
    { name: 'Dhruv Chawla',      dob: '2016-05-21', phone: '+91 98100 20064' },
    { name: 'Rashi Mukherjee',   dob: '2016-08-03', phone: '+91 98100 20065' },
    { name: 'Kabir Sahni',       dob: '2016-11-14', phone: '+91 98100 20066' },
    { name: 'Anvi Prasad',       dob: '2016-03-26', phone: '+91 98100 20067' },
    { name: 'Shivam Puri',       dob: '2016-06-08', phone: '+91 98100 20068' },
    { name: 'Naina Basu',        dob: '2016-09-20', phone: '+91 98100 20069' },
    { name: 'Yuvraj Khurana',    dob: '2016-12-02', phone: '+91 98100 20070' },
    { name: 'Aisha Johar',       dob: '2016-04-13', phone: '+91 98100 20071' },
    { name: 'Harsh Vohra',       dob: '2016-07-25', phone: '+91 98100 20072' },
  ],

  '5-A': [
    { name: 'Anushka Dixit',     dob: '2015-01-18', phone: '+91 98100 20073' },
    { name: 'Kartik Mehra',      dob: '2015-04-02', phone: '+91 98100 20074' },
    { name: 'Suhana Gill',       dob: '2015-07-13', phone: '+91 98100 20075' },
    { name: 'Aditya Bakshi',     dob: '2015-02-24', phone: '+91 98100 20076' },
    { name: 'Pihu Narayan',      dob: '2015-05-06', phone: '+91 98100 20077' },
    { name: 'Rehan Walia',       dob: '2015-08-18', phone: '+91 98100 20078' },
    { name: 'Jiya Saran',        dob: '2015-11-29', phone: '+91 98100 20079' },
    { name: 'Virat Chhabra',     dob: '2015-03-11', phone: '+91 98100 20080' },
    { name: 'Nidhi Talwar',      dob: '2015-06-23', phone: '+91 98100 20081' },
    { name: 'Krish Anand',       dob: '2015-09-04', phone: '+91 98100 20082' },
    { name: 'Divya Manchanda',   dob: '2015-12-16', phone: '+91 98100 20083' },
    { name: 'Sahil Batra',       dob: '2015-04-27', phone: '+91 98100 20084' },
    { name: 'Rhea Juneja',       dob: '2015-07-09', phone: '+91 98100 20085' },
  ],
};


// ─────────────────────────────────────────
// MAIN SEED FUNCTION
// ─────────────────────────────────────────
const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected\n');

    const hashedPassword = await bcrypt.hash('teacher123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);

    // ──────────────────────────
    // 1. CREATE TEACHERS
    // ──────────────────────────
    console.log('Creating teachers...');
    const teacherMap = {};

    for (const t of teacherData) {
      const existingUser = await User.findOne({ where: { email: t.email } });
      if (existingUser) {
        console.log(`  ${t.name} already exists, skipping`);
        const existingTeacher = await Teacher.findOne({ where: { user_id: existingUser.id } });
        if (existingTeacher) teacherMap[t.email] = existingTeacher;
        continue;
      }

      const txn = await sequelize.transaction();
      try {
        const user = await User.create({
          name: t.name,
          email: t.email,
          password: hashedPassword,
          role: 'teacher',
          phone: t.phone,
        }, { transaction: txn });

        const teacher = await Teacher.create({
          user_id: user.id,
          subject: t.subject,
          salary: t.salary,
          joining_date: t.joining,
        }, { transaction: txn });

        if (t.assignClass && t.assignSection) {
          const cls = await Class.findOne({
            where: { class_name: t.assignClass, section: t.assignSection },
          });
          if (cls) {
            await cls.update({ class_teacher_id: teacher.id }, { transaction: txn });
          }
        }

        await txn.commit();
        teacherMap[t.email] = teacher;
        console.log(`  OK ${t.name} — ${t.subject}${t.assignClass ? ` (Class ${t.assignClass}-${t.assignSection})` : ''}`);
      } catch (err) {
        await txn.rollback();
        console.error(`  FAIL ${t.name}:`, err.message);
      }
    }

    console.log(`\nTeachers created: ${Object.keys(teacherMap).length}\n`);

    // ──────────────────────────
    // 2. CREATE STUDENTS
    // ──────────────────────────
    console.log('Creating students...');
    let totalStudents = 0;

    for (const [classSection, students] of Object.entries(studentData)) {
      const [className, section] = classSection.split('-');

      const cls = await Class.findOne({
        where: { class_name: className, section: section },
      });

      if (!cls) {
        console.error(`  Class ${className}-${section} not found! Run seed.js first.`);
        continue;
      }

      console.log(`\n  Class ${className}-${section} (${students.length} students):`);

      for (let i = 0; i < students.length; i++) {
        const s = students[i];
        const rollNumber = i + 1;

        const email = s.name.toLowerCase().replace(/\s+/g, '.') + '@school.com';

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          console.log(`    ${s.name} already exists, skipping`);
          continue;
        }

        const txn = await sequelize.transaction();
        try {
          const user = await User.create({
            name: s.name,
            email: email,
            password: studentPassword,
            role: 'student',
            phone: s.phone,
          }, { transaction: txn });

          await Student.create({
            user_id: user.id,
            class_id: cls.id,
            roll_number: rollNumber,
            date_of_birth: s.dob,
            address: `Dwarka, New Delhi`,
            admission_date: '2026-04-01',
          }, { transaction: txn });

          await txn.commit();
          totalStudents++;
          console.log(`    Roll ${String(rollNumber).padStart(2, '0')} — ${s.name} (${email})`);
        } catch (err) {
          await txn.rollback();
          console.error(`    FAIL ${s.name}:`, err.message);
        }
      }
    }

    // ──────────────────────────
    // 3. SUMMARY
    // ──────────────────────────
    console.log('\n════════════════════════════════════════');
    console.log('  SEED COMPLETE — SUMMARY');
    console.log('════════════════════════════════════════');

    const userCount = await User.count();
    const teacherCount = await Teacher.count();
    const studentCount = await Student.count();
    const classesWithTeachers = await Class.count({ where: { class_teacher_id: { [require('sequelize').Op.ne]: null } } });

    console.log(`  Users:              ${userCount}`);
    console.log(`  Teachers:           ${teacherCount}`);
    console.log(`  Students:           ${studentCount}`);
    console.log(`  Classes w/ teacher: ${classesWithTeachers}`);
    console.log('════════════════════════════════════════');

    console.log('\nClass Breakdown:');
    console.log('  Class 1-A:  12 students  (Mrs. Sunita Sharma — English)');
    console.log('  Class 2-A:  12 students  (Mr. Rajesh Kumar — Mathematics)');
    console.log('  Class 2-B:  10 students  (Mrs. Anita Verma — Hindi)');
    console.log('  Class 3-A:  14 students  (Mr. Deepak Singh — Science)');
    console.log('  Class 4-A:  11 students  (Mrs. Kavita Joshi — Social Studies)');
    console.log('  Class 4-B:  13 students  (Mr. Amit Pandey — English)');
    console.log('  Class 5-A:  13 students  (Mrs. Neha Gupta — Mathematics)');
    console.log('  + Mr. Vikram Tiwari (PE) — no class assigned\n');

    console.log('Login Credentials:');
    console.log('  All teachers: {firstname}.{lastname}@school.com / teacher123');
    console.log('  All students: {firstname}.{lastname}@school.com / student123');
    console.log('  Example: sunita.sharma@school.com / teacher123');
    console.log('  Example: aadhya.mishra@school.com / student123\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedData();
