# Codex Session Notes - 2026-06-22

This file records what was done in the data-feeding session so future work can continue without rediscovering the same details.

## User Goal

Two large work items were discussed:

1. Feed current student data from Excel sheets into the school management system.
2. Later onboard another school with its own domain, DB, PM2 process, nginx route, and themed frontend.

This session focused almost entirely on item 1: student data import.

## Repo Context Read

Files and areas inspected:

- `CLAUDE.md`
- `readme.md`
- `AWSreadme.md`
- `package.json`
- `src/config/database.js`
- `src/models/User.js`
- `src/models/Student.js`
- `src/models/Teacher.js`
- `src/models/Class.js`
- `src/models/index.js`
- `src/utils/seed.js`
- `src/utils/credentials.js`
- relevant migrations:
  - `001-create-users.js`
  - `004-create-students.js`
  - `036-add-student-extended-details.js`
  - `038-add-username-to-users.js`
- `prod_sql/01_classes.sql`
- `src/controllers/adminController.js`
- `src/routes/admin.js`

Important schema conclusions:

- `users.id` is an internal MySQL auto-increment primary key.
- `students.id` is also an internal MySQL auto-increment primary key.
- Excel `id` is treated as the school's admission number.
- Admission number is stored in `users.username`, because the login system uses `username`.
- `students.roll_number` is the class roll number and is only meaningful within a class/section.
- `students.user_id` links to `users.id`.
- `students.class_id` links to `classes.id`.
- Student default password uses the existing helper in `src/utils/credentials.js`:
  - birth year + first 4 alphabetic letters of name
  - example: `2021radh`
- Therefore a valid DOB is needed unless a custom password is supplied.

## Dependency Added

Installed Excel parser:

```bash
npm install xlsx
```

Files changed by install:

- `package.json`
- `package-lock.json`

NPM reported audit issues after install:

- `9 vulnerabilities`
- No `npm audit fix` was run, because that can change dependency versions and should be handled separately.

## Excel Files Processed

The importer is configured for these files:

- `C:/Users/shiks/Downloads/NUR ANKUR.xlsx`
- `C:/Users/shiks/Downloads/NUR PALLAV.xlsx`
- `C:/Users/shiks/Downloads/L.K.G CLASS.xlsx`
- `C:/Users/shiks/Downloads/Earth Class 1 Sant R.L.D. Public School.xlsx`
- `C:/Users/shiks/Downloads/Jupiter Class 1 Sant R.L.D. Public School.xlsx`
- `C:/Users/shiks/Downloads/student data 2nd Class EARTH.xlsx`
- `C:/Users/shiks/Downloads/student data 2nd Class - JUPITER.xlsx`
- `C:/Users/shiks/Downloads/6th class.xlsx`
- `C:/Users/shiks/Downloads/8th class.xlsx`

All workbooks were inspected using `xlsx`.

Observed sheet format:

- Most sheets contain DB-like columns:
  - `id`
  - `user_id`
  - `class_id`
  - `roll_number`
  - `date_of_birth`
  - `address`
  - `admission_date`
  - `status`
  - extended student fields such as Aadhaar, parent names, phone numbers, category, religion, city/state, etc.
- In these exports, `user_id` actually contains the student name.
- `id` is treated as admission number when present.
- `roll_number` is the class roll number.

## Important Admission Number Finding

Near the end of the session, the user pasted output like:

```text
137
vivan Kumar giri
2NDJUPITER035
```

This looked like:

- first value: internal DB `users.id`
- second value: student name
- third value: `users.username`

Clarification:

- The left number shown in that kind of query is likely the internal DB primary key, not the admission number.
- Admission number is stored in `users.username`.
- For 2nd Earth/Jupiter, the Excel `id` column is blank, so the importer generated usernames like `2NDJUPITER035`.
- There were numeric values in the Excel `admission_date` column, but after testing they were repeated and therefore are NOT safe admission numbers.
- A temporary idea to use numeric `admission_date` values as admission numbers was rejected because it produced many duplicate usernames.
- The final importer does NOT trust numeric `admission_date` values as admission numbers.

If real admission numbers for those students exist elsewhere, update the Excel/source mapping later and regenerate the SQL.

## Importer Created

Created:

```text
src/utils/importStudentsFromExcel.js
```

Purpose:

- Read the configured `.xlsx` files.
- Normalize student rows.
- Validate duplicate usernames and missing DOB.
- Map each row to existing `classes` by `class_name` + `section`.
- Generate `users` and `students` data.
- Default to preview mode so it cannot accidentally write data.
- Optionally write a MySQL Workbench SQL file.
- Optionally apply directly to the DB when explicitly run with `--apply`.

Commands:

Preview only:

```bash
node src/utils/importStudentsFromExcel.js
```

Generate Workbench SQL:

```bash
node src/utils/importStudentsFromExcel.js --sql
```

Direct DB import:

```bash
node src/utils/importStudentsFromExcel.js --apply
```

Important: direct `--apply` uses the current `.env` database. During this session local `.env` pointed to a dev DB with old generic classes like `1-A`, `2-B`, not the Sant RLD section names. Do not use `--apply` unless the `.env` points at the intended target DB and classes match.

## Generated SQL

Created/regenerated:

```text
prod_sql/02_students_from_excel.sql
```

This SQL:

- Runs inside a transaction.
- Inserts `users` first.
- Inserts linked `students` rows second.
- Uses `users.username` for admission number/login username.
- Uses hashed default passwords.
- Looks up `classes.id` with:
  - `class_name`
  - `section`
- Skips insert if an existing `users.username` is already present.

Run it in MySQL Workbench against the target production DB, after `prod_sql/01_classes.sql` has loaded the Sant RLD classes.

Full path:

```text
C:\Users\shiks\OneDrive\Desktop\school-management-system\school_managment_server\prod_sql\02_students_from_excel.sql
```

Workbench open path:

```text
File -> Open SQL Script -> Desktop -> school-management-system -> school_managment_server -> prod_sql -> 02_students_from_excel.sql
```

Before running:

```sql
USE sant_RLD;

SELECT id, class_name, section
FROM classes
ORDER BY id;
```

Expected classes should look like:

- `Nursery / Ankur`
- `Nursery / Pallav`
- `LKG / Ankur`
- `1st / Earth`
- `1st / Jupiter`
- `2nd / Earth`
- `2nd / Jupiter`
- `6th / Earth`
- `8th / Earth`

If the DB shows classes like `1 / A`, `1 / B`, etc., do not run this import there.

## Current Import Counts

Final preview after user decisions:

```text
Students parsed: 223
Students selected for import: 160
Students skipped by rule: 63
Existing usernames in local DB: 0
Duplicate usernames inside selected import files: 0
Rows missing class mapping in local dev DB: 160
Warnings in selected rows: 2
```

The `Rows missing class mapping: 160` result was from the local dev DB because its classes are old generic `1-A`, `2-B`, etc. This is expected locally. The generated SQL is meant for the DB with Sant RLD classes from `prod_sql/01_classes.sql`.

Selected import count by source:

```text
Nursery Ankur: 9
Nursery Pallav: 31
LKG Ankur: 29
2nd Earth: 30
2nd Jupiter: 35
6th Earth: 14
8th Earth: 12
Total: 160
```

## User Data Decisions Applied

DOB overrides added:

```text
Nursery Ankur | roll 8 | Radhya Rai -> 2021-08-03
LKG Ankur     | roll 8 | vaishnavi  -> 2021-09-21
```

Rows skipped for now due to duplicate admission number:

```text
LKG Ankur | roll 13 | kaushal sharma | admission no 1583
LKG Ankur | roll 15 | Riyansh        | admission no 1583
6th Earth | roll 8  | Deepa          | admission no 665
6th Earth | roll 10 | Yashika Taak   | admission no 665
```

Sources skipped for now:

```text
1st Earth
1st Jupiter
```

Reason:

- Those Class 1 sheets did not have real admission numbers in `id`.
- User said not to put that data right now and it can be added later.

## Remaining Warnings in Selected Import

Two selected students still have no real admission number in Excel, so generated usernames are used:

```text
LKG Ankur | roll 31 | Divyanshi | username LKGANKUR031
8th Earth | roll 3  | Ansh      | username 8THEARTH003
```

These are included in the selected 160. If real admission numbers are found later, update these usernames in `users.username`.

## Production Run Guidance

Use Workbench for production import unless explicitly choosing direct Node import.

Recommended flow:

1. Connect Workbench to production RDS.
2. Select the target DB:

```sql
USE sant_RLD;
```

3. Confirm classes:

```sql
SELECT id, class_name, section
FROM classes
ORDER BY id;
```

4. Open and run:

```text
C:\Users\shiks\OneDrive\Desktop\school-management-system\school_managment_server\prod_sql\02_students_from_excel.sql
```

5. Verify:

```sql
SELECT COUNT(*) AS student_users
FROM users
WHERE role = 'student';

SELECT COUNT(*) AS student_profiles
FROM students;

SELECT c.class_name, c.section, COUNT(*) AS total
FROM students s
JOIN classes c ON c.id = s.class_id
GROUP BY c.id, c.class_name, c.section
ORDER BY c.id;
```

Expected new student insert count from the generated SQL is 160.

## If Production Already Has Rows from This SQL

Do not rerun the generated SQL blindly without checking.

Because the SQL skips existing `users.username`, rerunning is mostly guarded, but rows with changed/generated usernames could still need careful review.

Useful inspection query:

```sql
SELECT u.id AS db_user_id, u.name, u.username AS admission_or_login, s.roll_number, c.class_name, c.section
FROM users u
JOIN students s ON s.user_id = u.id
JOIN classes c ON c.id = s.class_id
WHERE u.role = 'student'
ORDER BY c.id, s.roll_number;
```

Interpretation:

- `db_user_id` is internal DB id.
- `admission_or_login` is the stored admission number/login username.
- If `admission_or_login` looks like `2NDJUPITER035`, that means no real admission number was available in the source sheet, so a generated username was used.

## New School Onboarding Notes From Docs

No implementation was done for onboarding another school in this session, but docs were read and architecture was summarized.

Current intended architecture:

- One backend codebase.
- One frontend codebase.
- One MySQL database per school on the same RDS instance.
- One PM2 process per school on a different port.
- nginx server block per school domain.
- Each domain proxies `/api` to that school process.
- Frontend calls relative `/api`.
- Frontend theme/content varies by `window.location.hostname`.

High-level onboarding flow:

1. Get domain and DNS access from GoDaddy.
2. Point `@` and `www` A records to EC2 public IP `43.205.99.209`.
3. Create a new RDS database for the school.
4. Create/copy `.env` for that school on EC2:
   - new `DB_NAME`
   - new `PORT`
   - new `S3_PREFIX`
   - new JWT secret if desired
5. Run migrations against that DB.
6. Load base classes/admin data.
7. Start a new PM2 process on a new port.
8. Add nginx server block for that domain and proxy `/api` to the new port.
9. Run certbot for HTTPS.
10. Add frontend theme/content config for the domain.

## Files Changed This Session

Tracked modifications:

- `package.json`
- `package-lock.json`

New files:

- `src/utils/importStudentsFromExcel.js`
- `prod_sql/02_students_from_excel.sql`
- `codex.md`

## Caution For Next Session

Do not treat Excel `admission_date` numeric values as admission numbers unless proven unique and confirmed by the school. In the 2nd-class sheets, those values repeated, so they were not safe as login usernames.

Do not confuse `users.id` with admission number. The real login/admission identifier is `users.username`.
