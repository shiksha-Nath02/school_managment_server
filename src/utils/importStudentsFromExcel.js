const path = require('path');
const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { sequelize, User, Student, Class } = require('../models');
const { generateStudentPassword } = require('./credentials');

const FILES = [
  { label: 'Nursery Ankur', className: 'Nursery', section: 'Ankur', file: 'C:/Users/shiks/Downloads/NUR ANKUR.xlsx' },
  { label: 'Nursery Pallav', className: 'Nursery', section: 'Pallav', file: 'C:/Users/shiks/Downloads/NUR PALLAV.xlsx' },
  { label: 'LKG Ankur', className: 'LKG', section: 'Ankur', file: 'C:/Users/shiks/Downloads/L.K.G CLASS.xlsx' },
  { label: '1st Earth', className: '1st', section: 'Earth', file: 'C:/Users/shiks/Downloads/Earth Class 1 Sant R.L.D. Public School.xlsx' },
  { label: '1st Jupiter', className: '1st', section: 'Jupiter', file: 'C:/Users/shiks/Downloads/Jupiter Class 1 Sant R.L.D. Public School.xlsx' },
  { label: '2nd Earth', className: '2nd', section: 'Earth', file: 'C:/Users/shiks/Downloads/student data 2nd Class EARTH.xlsx' },
  { label: '2nd Jupiter', className: '2nd', section: 'Jupiter', file: 'C:/Users/shiks/Downloads/student data 2nd Class - JUPITER.xlsx' },
  { label: '6th Earth', className: '6th', section: 'Earth', file: 'C:/Users/shiks/Downloads/6th class.xlsx' },
  { label: '8th Earth', className: '8th', section: 'Earth', file: 'C:/Users/shiks/Downloads/8th class.xlsx' },
];

const DOB_OVERRIDES = new Map([
  ['Nursery Ankur|8|Radhya Rai', '2021-08-03'],
  ['LKG Ankur|8|vaishnavi', '2021-09-21'],
]);

const SKIP_ROWS = new Set([
  // Duplicate admission numbers. Add after confirming the correct admission number.
  'LKG Ankur|13|kaushal sharma',
  'LKG Ankur|15|Riyansh',
  '6th Earth|8|Deepa',
  '6th Earth|10|Yashika Taak',
]);

const SKIP_SOURCES = new Set([
  // Class 1 sheets do not currently include real admission numbers.
  '1st Earth',
  '1st Jupiter',
]);

const HEADER_NAMES = [
  'id', 'user_id', 'class_id', 'roll_number', 'date_of_birth', 'address',
  'admission_date', 'created_at', 'updated_at', 'status', 'aadhaar_number',
  'father_name', 'father_phone', 'father_aadhaar', 'mother_name', 'mother_phone',
  'mother_aadhaar', 'parents_pan', 'category', 'religion', 'nationality',
  'blood_group', 'birth_certificate_number', 'ews_certificate_number',
  'pincode', 'city', 'state',
];

const APPLY = process.argv.includes('--apply');
const WRITE_SQL = process.argv.includes('--sql');
const SQL_OUTPUT = path.resolve(__dirname, '../../prod_sql/02_students_from_excel.sql');

function cleanString(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).replace(/\s+/g, ' ').trim();
  if (!text || text.toUpperCase() === 'NULL') return null;
  return text;
}

function cleanDigits(value, maxLength) {
  const text = cleanString(value);
  if (!text) return null;
  const digits = text.replace(/\D/g, '');
  if (!digits || digits.length > maxLength) return null;
  return digits;
}

function normalizeCategory(value) {
  const text = cleanString(value);
  if (!text) return null;
  const normalized = text.toUpperCase().replace(/[^A-Z]/g, '');
  const map = {
    GENERAL: 'General',
    OBC: 'OBC',
    SC: 'SC',
    ST: 'ST',
    EWS: 'EWS',
  };
  return map[normalized] || null;
}

function formatDate(value) {
  if (value === null || value === undefined) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
  }

  const text = cleanString(value);
  if (!text) return null;

  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const dmy = text.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    let year = Number(dmy[3]);
    if (year < 100) year += year <= 30 ? 2000 : 1900;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function looksLikeAdmissionNumber(value) {
  const text = cleanString(value);
  return !!text && /^[A-Za-z0-9/-]+$/.test(text) && /\d/.test(text);
}

function admissionFromRow(row, classCode, rollNumber) {
  const id = cleanString(row.id);
  if (looksLikeAdmissionNumber(id)) return id;

  // Some exports put non-date numeric values under admission_date. These are
  // not trusted as admission numbers because they are repeated in the sheets.
  const misplacedAdmission = cleanString(row.admission_date);
  if (looksLikeAdmissionNumber(misplacedAdmission) && !formatDate(row.admission_date)) {
    return misplacedAdmission;
  }

  // Last resort for missing admission numbers. These are flagged in the preview.
  return `${classCode}${String(rollNumber).padStart(3, '0')}`;
}

function classCodeFor(config) {
  return `${config.className}${config.section}`.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function rowObject(header, values) {
  const row = {};
  header.forEach((key, index) => {
    row[key] = values[index] ?? null;
  });
  return row;
}

function readRows(config) {
  const workbook = XLSX.readFile(config.file, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, blankrows: false });
  const headerIndex = rawRows.findIndex((row) => row.some((cell) => cleanString(cell) === 'user_id'));
  if (headerIndex === -1) throw new Error(`Could not find header row in ${config.file}`);

  const header = rawRows[headerIndex].map((cell) => cleanString(cell));
  const missingHeaders = HEADER_NAMES.filter((name) => !header.includes(name));
  if (missingHeaders.length) {
    throw new Error(`${config.label} missing headers: ${missingHeaders.join(', ')}`);
  }

  return rawRows.slice(headerIndex + 1)
    .map((values) => rowObject(header, values))
    .filter((row) => cleanString(row.user_id));
}

function normalizeStudent(row, config, rowIndex) {
  const warnings = [];
  const name = cleanString(row.user_id);
  const rollNumber = Number(row.roll_number) || rowIndex + 1;
  if (!row.roll_number) warnings.push('missing roll_number; generated from row order');

  const overrideKey = `${config.label}|${rollNumber}|${name}`;
  const dateOfBirth = DOB_OVERRIDES.get(overrideKey) || formatDate(row.date_of_birth);
  if (!dateOfBirth) warnings.push('missing/invalid date_of_birth');

  const classCode = classCodeFor(config);
  const fallbackUsername = `${classCode}${String(rollNumber).padStart(3, '0')}`;
  const username = admissionFromRow(row, classCode, rollNumber);
  if (!looksLikeAdmissionNumber(row.id) && !looksLikeAdmissionNumber(row.admission_date)) {
    warnings.push(`missing admission number; generated username ${username}`);
  }

  const parentsPan = cleanString(row.parents_pan);
  if (parentsPan && parentsPan.length > 10) warnings.push('parents_pan too long; set to null');

  const category = normalizeCategory(row.category);
  if (cleanString(row.category) && !category) warnings.push(`invalid category "${cleanString(row.category)}"; set to null`);

  return {
    source: config.label,
    original_id: cleanString(row.id),
    original_admission_date: cleanString(row.admission_date),
    fallback_username: fallbackUsername,
    skipped: SKIP_SOURCES.has(config.label) || SKIP_ROWS.has(overrideKey),
    skip_reason: SKIP_SOURCES.has(config.label)
      ? 'source skipped until real admission numbers are available'
      : (SKIP_ROWS.has(overrideKey) ? 'row skipped until duplicate admission number is resolved' : null),
    name,
    username,
    className: config.className,
    section: config.section,
    roll_number: rollNumber,
    date_of_birth: dateOfBirth,
    address: cleanString(row.address),
    admission_date: null,
    status: 'active',
    aadhaar_number: cleanDigits(row.aadhaar_number, 12),
    father_name: cleanString(row.father_name),
    father_phone: cleanDigits(row.father_phone, 20),
    father_aadhaar: cleanDigits(row.father_aadhaar, 12),
    mother_name: cleanString(row.mother_name),
    mother_phone: cleanDigits(row.mother_phone, 20),
    mother_aadhaar: cleanDigits(row.mother_aadhaar, 12),
    parents_pan: parentsPan && parentsPan.length <= 10 ? parentsPan : null,
    category,
    religion: cleanString(row.religion),
    nationality: cleanString(row.nationality) || 'Indian',
    blood_group: cleanString(row.blood_group),
    birth_certificate_number: cleanString(row.birth_certificate_number),
    ews_certificate_number: cleanString(row.ews_certificate_number),
    pincode: cleanDigits(row.pincode, 10),
    city: cleanString(row.city),
    state: cleanString(row.state),
    phone: cleanDigits(row.father_phone, 20) || cleanDigits(row.mother_phone, 20),
    plain_password: dateOfBirth ? generateStudentPassword(name, dateOfBirth) : null,
    warnings,
  };
}

async function getClassMap() {
  const classes = await Class.findAll();
  const map = new Map();
  for (const cls of classes) {
    map.set(`${cls.class_name}||${cls.section}`, cls);
  }
  return map;
}

async function preview(students, classMap) {
  const activeStudents = students.filter((student) => !student.skipped);
  const usernames = activeStudents.map((s) => s.username);
  const existingUsers = await User.findAll({
    where: { username: { [Op.in]: usernames } },
    attributes: ['username'],
  });
  const existingUsernames = new Set(existingUsers.map((u) => u.username));
  const seen = new Map();
  const duplicateUsernames = new Set();
  const duplicateDetails = [];
  for (const student of activeStudents) {
    if (seen.has(student.username)) {
      duplicateUsernames.add(student.username);
      duplicateDetails.push(seen.get(student.username), student);
    } else {
      seen.set(student.username, student);
    }
  }

  const bySource = {};
  let warningCount = 0;
  let missingClassCount = 0;
  let existingCount = 0;
  for (const student of activeStudents) {
    bySource[student.source] = (bySource[student.source] || 0) + 1;
    warningCount += student.warnings.length;
    if (!classMap.has(`${student.className}||${student.section}`)) missingClassCount += 1;
    if (existingUsernames.has(student.username)) existingCount += 1;
  }

  console.log(`Mode: ${APPLY ? 'APPLY' : 'PREVIEW ONLY'}`);
  console.log(`Students parsed: ${students.length}`);
  console.log(`Students selected for import: ${activeStudents.length}`);
  console.log(`Students skipped by rule: ${students.length - activeStudents.length}`);
  console.log(`Existing usernames in DB: ${existingCount}`);
  console.log(`Duplicate usernames inside files: ${duplicateUsernames.size}`);
  console.log(`Rows missing class mapping: ${missingClassCount}`);
  console.log(`Warnings: ${warningCount}`);
  console.log('');
  console.table(Object.entries(bySource).map(([source, count]) => ({ source, count })));

  const skippedRows = students
    .filter((student) => student.skipped)
    .map((student) => ({
      source: student.source,
      roll: student.roll_number,
      username: student.username,
      name: student.name,
      reason: student.skip_reason,
    }));
  if (skippedRows.length) {
    console.log('\nSkipped rows:');
    console.table(skippedRows);
  }

  const warningRows = activeStudents
    .filter((student) => student.warnings.length)
    .slice(0, 40)
    .map((student) => ({
      source: student.source,
      roll: student.roll_number,
      username: student.username,
      name: student.name,
      warnings: student.warnings.join('; '),
    }));

  if (warningRows.length) {
    console.log('\nFirst warning rows:');
    console.table(warningRows);
  }

  if (duplicateUsernames.size) {
    console.log('\nDuplicate usernames:', Array.from(duplicateUsernames).join(', '));
    console.table(duplicateDetails.map((student) => ({
      source: student.source,
      roll: student.roll_number,
      username: student.username,
      name: student.name,
    })));
  }

  return { activeStudents, existingUsernames, duplicateUsernames, missingClassCount };
}

async function applyImport(students, classMap, existingUsernames, duplicateUsernames) {
  if (duplicateUsernames.size) {
    throw new Error('Duplicate usernames exist inside the Excel files. Fix or change the generation rule before importing.');
  }

  let created = 0;
  let skipped = 0;
  const defaultAdmissionDate = new Date().toISOString().slice(0, 10);

  for (const student of students) {
    if (existingUsernames.has(student.username)) {
      skipped += 1;
      continue;
    }

    const cls = classMap.get(`${student.className}||${student.section}`);
    if (!cls) throw new Error(`Class not found: ${student.className} ${student.section}`);
    if (!student.date_of_birth) throw new Error(`DOB missing for ${student.source} roll ${student.roll_number} ${student.name}`);

    const hashedPassword = await bcrypt.hash(student.plain_password, 10);

    await sequelize.transaction(async (transaction) => {
      const user = await User.create({
        name: student.name,
        username: student.username,
        email: null,
        password: hashedPassword,
        role: 'student',
        phone: student.phone,
      }, { transaction });

      await Student.create({
        user_id: user.id,
        class_id: cls.id,
        roll_number: student.roll_number,
        date_of_birth: student.date_of_birth,
        address: student.address,
        admission_date: defaultAdmissionDate,
        status: student.status,
        aadhaar_number: student.aadhaar_number,
        father_name: student.father_name,
        father_phone: student.father_phone,
        father_aadhaar: student.father_aadhaar,
        mother_name: student.mother_name,
        mother_phone: student.mother_phone,
        mother_aadhaar: student.mother_aadhaar,
        parents_pan: student.parents_pan,
        category: student.category,
        religion: student.religion,
        nationality: student.nationality,
        blood_group: student.blood_group,
        birth_certificate_number: student.birth_certificate_number,
        ews_certificate_number: student.ews_certificate_number,
        pincode: student.pincode,
        city: student.city,
        state: student.state,
      }, { transaction });
    });

    created += 1;
  }

  console.log(`\nImport complete. Created: ${created}. Skipped existing: ${skipped}.`);
}

function sqlQuote(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

async function writeSql(students, duplicateUsernames) {
  if (duplicateUsernames.size) {
    throw new Error('Cannot write SQL while duplicate usernames exist inside the Excel files.');
  }

  const activeStudents = students.filter((student) => !student.skipped);
  const invalidDob = activeStudents.filter((student) => !student.date_of_birth);
  if (invalidDob.length) {
    throw new Error(`Cannot write SQL while ${invalidDob.length} students have missing/invalid DOB.`);
  }

  const lines = [
    '-- ============================================================',
    '-- Sant RLD Public School - Students import from Excel',
    '-- Generated by: node src/utils/importStudentsFromExcel.js --sql',
    '-- Run in MySQL Workbench against the target school database.',
    '-- Requires classes to already exist with Sant RLD class_name/section values.',
    '-- ============================================================',
    '',
    'START TRANSACTION;',
    '',
  ];

  for (const student of activeStudents) {
    const hashedPassword = await bcrypt.hash(student.plain_password, 10);
    const marker = `${student.source} / Roll ${student.roll_number} / ${student.name}`;
    lines.push(`-- ${marker}`);
    lines.push('SET @class_id := (SELECT id FROM classes WHERE class_name = ' +
      `${sqlQuote(student.className)} AND section = ${sqlQuote(student.section)} LIMIT 1);`);
    lines.push("SET @existing_user_id := (SELECT id FROM users WHERE username = " +
      `${sqlQuote(student.username)} LIMIT 1);`);
    lines.push(`INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT ${sqlQuote(student.name)}, ${sqlQuote(student.username)}, NULL, ${sqlQuote(hashedPassword)}, 'student', ${sqlQuote(student.phone)}, 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;`);
    lines.push('SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());');
    lines.push(`INSERT INTO students (
  user_id, class_id, roll_number, date_of_birth, address, admission_date, status,
  aadhaar_number, father_name, father_phone, father_aadhaar,
  mother_name, mother_phone, mother_aadhaar, parents_pan,
  category, religion, nationality, blood_group,
  birth_certificate_number, ews_certificate_number, pincode, city, state,
  created_at, updated_at
)
SELECT
  @user_id, @class_id, ${student.roll_number}, ${sqlQuote(student.date_of_birth)}, ${sqlQuote(student.address)}, CURDATE(), 'active',
  ${sqlQuote(student.aadhaar_number)}, ${sqlQuote(student.father_name)}, ${sqlQuote(student.father_phone)}, ${sqlQuote(student.father_aadhaar)},
  ${sqlQuote(student.mother_name)}, ${sqlQuote(student.mother_phone)}, ${sqlQuote(student.mother_aadhaar)}, ${sqlQuote(student.parents_pan)},
  ${sqlQuote(student.category)}, ${sqlQuote(student.religion)}, ${sqlQuote(student.nationality)}, ${sqlQuote(student.blood_group)},
  ${sqlQuote(student.birth_certificate_number)}, ${sqlQuote(student.ews_certificate_number)}, ${sqlQuote(student.pincode)}, ${sqlQuote(student.city)}, ${sqlQuote(student.state)},
  NOW(), NOW()
WHERE @class_id IS NOT NULL
  AND @user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM students WHERE user_id = @user_id);`);
    lines.push('');
  }

  lines.push('COMMIT;');
  lines.push('');

  require('fs').writeFileSync(SQL_OUTPUT, lines.join('\n'));
  console.log(`\nSQL written to ${SQL_OUTPUT}`);
}

async function main() {
  await sequelize.authenticate();

  const students = FILES.flatMap((config) => {
    const rows = readRows(config);
    return rows.map((row, index) => normalizeStudent(row, config, index));
  });

  const classMap = await getClassMap();
  const result = await preview(students, classMap);

  if (!APPLY) {
    if (WRITE_SQL) await writeSql(students, result.duplicateUsernames);
    console.log('\nNo database rows were written. Run with --apply after reviewing the preview.');
    return;
  }

  if (result.missingClassCount > 0) {
    throw new Error('Some rows do not map to an existing class.');
  }

  await applyImport(result.activeStudents, classMap, result.existingUsernames, result.duplicateUsernames);
}

main()
  .catch((error) => {
    console.error(`Import failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
