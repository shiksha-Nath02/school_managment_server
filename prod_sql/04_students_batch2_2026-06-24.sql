-- ============================================================
-- Sant RLD — Students batch 2 (2026-06-24)
-- Reconciled against live prod. DELETES + idempotent INSERTS.
-- Review the VERIFY csv before running. Run in Workbench vs sant_RLD.
-- ============================================================
USE sant_RLD;
SET SQL_SAFE_UPDATES = 0;
START TRANSACTION;

-- ---------- DELETIONS ----------
-- 1st Jupiter test/placeholder (1)
DELETE s FROM students s JOIN users u ON u.id = s.user_id WHERE u.role='student' AND u.username IN ('teststudent');
DELETE FROM users WHERE role='student' AND username IN ('teststudent');

-- 2nd Earth placeholder (27)
DELETE s FROM students s JOIN users u ON u.id = s.user_id WHERE u.role='student' AND u.username IN ('2NDEARTH001', '2NDEARTH002', '2NDEARTH003', '2NDEARTH004', '2NDEARTH005', '2NDEARTH006', '2NDEARTH007', '2NDEARTH008', '2NDEARTH009', '2NDEARTH010', '2NDEARTH011', '2NDEARTH012', '2NDEARTH013', '2NDEARTH015', '2NDEARTH016', '2NDEARTH017', '2NDEARTH019', '2NDEARTH020', '2NDEARTH021', '2NDEARTH022', '2NDEARTH024', '2NDEARTH025', '2NDEARTH026', '2NDEARTH027', '2NDEARTH028', '2NDEARTH029', '2NDEARTH030');
DELETE FROM users WHERE role='student' AND username IN ('2NDEARTH001', '2NDEARTH002', '2NDEARTH003', '2NDEARTH004', '2NDEARTH005', '2NDEARTH006', '2NDEARTH007', '2NDEARTH008', '2NDEARTH009', '2NDEARTH010', '2NDEARTH011', '2NDEARTH012', '2NDEARTH013', '2NDEARTH015', '2NDEARTH016', '2NDEARTH017', '2NDEARTH019', '2NDEARTH020', '2NDEARTH021', '2NDEARTH022', '2NDEARTH024', '2NDEARTH025', '2NDEARTH026', '2NDEARTH027', '2NDEARTH028', '2NDEARTH029', '2NDEARTH030');

-- 2nd Jupiter (delete all, re-add later) (35)
DELETE s FROM students s JOIN users u ON u.id = s.user_id WHERE u.role='student' AND u.username IN ('2NDJUPITER001', '2NDJUPITER002', '2NDJUPITER003', '2NDJUPITER004', '2NDJUPITER005', '2NDJUPITER006', '2NDJUPITER007', '2NDJUPITER008', '2NDJUPITER009', '2NDJUPITER010', '2NDJUPITER011', '2NDJUPITER012', '2NDJUPITER013', '2NDJUPITER014', '2NDJUPITER015', '2NDJUPITER016', '2NDJUPITER017', '2NDJUPITER018', '2NDJUPITER019', '2NDJUPITER020', '2NDJUPITER021', '2NDJUPITER022', '2NDJUPITER023', '2NDJUPITER024', '2NDJUPITER025', '2NDJUPITER026', '2NDJUPITER027', '2NDJUPITER028', '2NDJUPITER029', '2NDJUPITER030', '2NDJUPITER031', '2NDJUPITER032', '2NDJUPITER033', '2NDJUPITER034', '2NDJUPITER035');
DELETE FROM users WHERE role='student' AND username IN ('2NDJUPITER001', '2NDJUPITER002', '2NDJUPITER003', '2NDJUPITER004', '2NDJUPITER005', '2NDJUPITER006', '2NDJUPITER007', '2NDJUPITER008', '2NDJUPITER009', '2NDJUPITER010', '2NDJUPITER011', '2NDJUPITER012', '2NDJUPITER013', '2NDJUPITER014', '2NDJUPITER015', '2NDJUPITER016', '2NDJUPITER017', '2NDJUPITER018', '2NDJUPITER019', '2NDJUPITER020', '2NDJUPITER021', '2NDJUPITER022', '2NDJUPITER023', '2NDJUPITER024', '2NDJUPITER025', '2NDJUPITER026', '2NDJUPITER027', '2NDJUPITER028', '2NDJUPITER029', '2NDJUPITER030', '2NDJUPITER031', '2NDJUPITER032', '2NDJUPITER033', '2NDJUPITER034', '2NDJUPITER035');

-- ---------- INSERTS ----------
-- 1st Earth / Roll 1 / Alok Singh / adm 1271
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1271' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Alok Singh', '1271', NULL, '$2b$10$acnCRe8k66Wo7ACzH55iueksGr.lnr1CNmU1pZAij/rHmXz4zohIG', 'student', '9868096295', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1271', 1, '2020-06-28', 'Pno - 37A Raksha Enclave Mohan Garden New Delhi - 59', CURDATE(), 'active', '583116601676', 'Mr.Janardan Singh', '9868096295', NULL, 'Mrs. Meena', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 2 / Aadvik / adm 1268
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1268' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Aadvik', '1268', NULL, '$2b$10$R17WK30/e9LMdFtrASRnGOxu.ofznb4GNllJlc56qjaMMtR7Z2u6u', 'student', '7838960277', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1268', 2, '2020-05-16', 'Hno- 132 , G- 10 Sainik Enclave .Sec 1 New Delhi- 59', CURDATE(), 'active', '924079013137', 'Mr.Gulsan Kumar', '7838960277', NULL, 'Mrs. Suman Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 3 / Kanika Kumari / adm 1266
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1266' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Kanika Kumari', '1266', NULL, '$2b$10$0E9DONWowcZtBWqUQBzMW.TNZ81IxEQGEguJN0LS7TximFiS/4.sW', 'student', '7532067557', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1266', 3, '2020-09-24', 'R-3 189 Bg-6 Raksha Enclave Mohan New Delhi', CURDATE(), 'active', '882413747094', 'Mr. Hari Om', '7532067557', NULL, 'Mrs. Sanju Kumari', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 4 / Vihaan Sharma / adm 1265
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1265' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Vihaan Sharma', '1265', NULL, '$2b$10$1m3cw9feqyb8BZKI5GYr3OD4C/1vXoYILFI1FQufici8p1EragYdK', 'student', '9871790984', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1265', 4, '2020-05-12', 'Hno. P 99 G 6 Raksha Enclave Mohan Garden New Delhi- 59', CURDATE(), 'active', '879019499516', 'Mr Vinay Sharma', '9871790984', NULL, 'Mrs Anju Sharma', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 5 / Shivani Sharma / adm 1264
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1264' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Shivani Sharma', '1264', NULL, '$2b$10$r3IGv9885q98yXcRAeiDD.pfloBuAANH96DvD.7gHDWA8nocNOBli', 'student', '7631474644', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1264', 5, '2020-05-27', 'Pno- 16 A G- 2 Sec -1 Sainik Enclave M.G New Delhi-59', CURDATE(), 'active', '401469283612', 'Mr. Mukesh Sharma', '7631474644', NULL, 'Mrs. Bebee Kumari', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 6 / Naksh Gupta / adm 1262
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1262' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Naksh Gupta', '1262', NULL, '$2b$10$yvAwHnfpK3i7uIKdyt3POO5EEUU5XHrdsKr5J8ia64HirZnirTKdW', 'student', '9625349449', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1262', 6, '2019-11-02', 'Hno.G-2/ 59 G-15 Mohan Garden New Delhi-59', CURDATE(), 'active', '322265978311', 'Mr. Gulshan Kumar Gupta', '9625349449', NULL, 'Mrs. Hina', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 7 / Jassu / adm 1259
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1259' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Jassu', '1259', NULL, '$2b$10$dL4fba383bsRoSXIJa7nXeMaLTLtRo6rmjRWB8vilu4vmzi.IlfXq', 'student', '8287750025', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1259', 7, '2020-10-24', 'Hno.64 G 1 Sec- 3 Mohan Garden New Delhi- 59', CURDATE(), 'active', '760962365894', 'Mr Jitender', '8287750025', NULL, 'Mrs. Poonam', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 8 / Aaisha / adm 1258
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1258' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Aaisha', '1258', NULL, '$2b$10$zCHzAr6obdL9EtivbkSDt.nRU7fFu3y/Lq9RY35SQqfbvxAdR3tv6', 'student', '9312493854', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1258', 8, '2020-05-01', 'Pno.Sec- 3 Sainik Enclave Mohan Garden New Delhi-59', CURDATE(), 'active', '738055054524', 'Mr. Furkan Ali', '9312493854', NULL, 'Mrs.Shabnam', NULL, NULL, NULL, 'General', 'Muslim', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 9 / Ridhi Kumari / adm 1257
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1257' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Ridhi Kumari', '1257', NULL, '$2b$10$Pkqvg.B4swLiSQB1EVg04uuxT.BgLW.trKIu40LzEcZ8VCUbmD.fW', 'student', '9955291536', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1257', 9, '2020-09-05', 'Hno.84/3 Defence Enclave Mohan Garden New Delhi-59', CURDATE(), 'active', '232153424526', 'Mr Rocky Kumar', '9955291536', NULL, 'Mrs Bharti', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 10 / Deborah / adm 1260
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1260' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Deborah', '1260', NULL, '$2b$10$NO4BJmh3JPM3ptijTG7C2.LVzzPK.6savLA3D81o9YOi0i230k3iG', 'student', '9871818377', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1260', 10, '2019-11-04', 'Hno. 126, G- 6 Sainik Vihar Mohan Garden New Delhi- 59', CURDATE(), 'active', '244937902703', 'Mr. Ramswaroop', '9871818377', NULL, 'Mrs. Sheela Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 11 / Anshu / adm 1273
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1273' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Anshu', '1273', NULL, '$2b$10$Z3II3Qi31bwv43qnGV6MweMer/i5CT2YAPODAfyxnHQXTTeItFhLi', 'student', '9711856623', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1273', 11, '2020-12-26', 'Pno.15 Sainik Enclave Mohan Garden New Delhi- 59', CURDATE(), 'active', '926797284570', 'Mr.Pradeep', '9711856623', NULL, 'Mrs Kumkum', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 12 / Madhav Kumar / adm 1274
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1274' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Madhav Kumar', '1274', NULL, '$2b$10$YCIs2YsiZaAGe2FMuRL.HOMGJ3jeHE2GdNlxenuLDlBgKvI3zoe0S', 'student', '8810210095', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1274', 12, '2020-02-06', 'Hno. 42 garden', CURDATE(), 'active', '455657375854', 'Mr. Anil Kumar yadav', '8810210095', NULL, 'Mrs. Lalita', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 13 / Vanya / adm 1275
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1275' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Vanya', '1275', NULL, '$2b$10$oIl23wMXs6NNpypyDISRI.J6v2fltafH8c6fcy4.vhhpsOL7FeydG', 'student', '9711118907', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1275', 13, '2020-01-07', 'Pno.16 G-9 sai enclave mohan garden new delhi- 59', CURDATE(), 'active', '734395983630', 'Mr. Jatin', '9711118907', NULL, 'Mrs. Seema', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 14 / Vivaan kumar / adm 1261
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1261' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Vivaan kumar', '1261', NULL, '$2b$10$/UYv8LZVtpd16y1drbU7T.1341oF9Gu/NGAjEWcUE0Sfd5uKvAv4m', 'student', '9971263284', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1261', 14, '2020-04-09', 'Pno.182 sainik enclave sec-3 G 12 mohan garden new delhi- 59', CURDATE(), 'active', '223135342588', 'Mr. Sikander Das', '9971263284', NULL, 'Mrs. Babita devi', NULL, NULL, '2304608555', 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 15 / Rishabh Choudhary / adm 1276
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1276' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Rishabh Choudhary', '1276', NULL, '$2b$10$zxNFqSC24xeIlbUWIk8Zz.AyvLiLR1IDz39tOlySvioEhGp8SxMFW', 'student', '8384005134', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1276', 15, '2020-03-15', 'Hno.135 A Mansa Ram Park D.K Mohan Garden New Delhi-59', CURDATE(), 'active', '853195196270', 'Mr. Parushram Choudhary', '8384005134', NULL, 'Mrs Kanchan Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 16 / Suryansh Babu / adm 1263
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1263' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Suryansh Babu', '1263', NULL, '$2b$10$Hwel36TfboELIm4VIUtbCOLWyMc0H00IcqJ9/w2dzmn2sgHszLZnC', 'student', '9334406727', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1263', 16, '2021-02-27', 'Plot.273 B Ground Floor G-1 Mohan Garden New Dehi -59', CURDATE(), 'active', '592493623270', 'Mr. Rakesh Kumar', '9334406727', NULL, 'Mrs. Chanchal Kum', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 17 / Tanishka Singh / adm 1270
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1270' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Tanishka Singh', '1270', NULL, '$2b$10$Zx/sHprV1uTX2aEb0Iry4O.QqmyCsD5tb2YnSyRkjDCXL1Ai2DU7K', 'student', '9350083236', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1270', 17, '2020-10-07', 'Hno.R-3A/25 Block-R Mohan Garden New Delhi-59', CURDATE(), 'active', '215764764177', 'Mr. Dilip', '9350083236', NULL, 'Mrs.Kumari Tara', NULL, NULL, NULL, NULL, 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 18 / Nisha / adm 1277
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1277' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Nisha', '1277', NULL, '$2b$10$SpIefZeiXUe2qfahZmc4heKK8BzMCaAMRZ9ElnCRy0rfsIUvRySfS', 'student', '8130358030', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1277', 18, '2020-03-11', 'Hno.A G/F G-2 Tilak Enclave', CURDATE(), 'active', '26375751379', 'Mr. Pappu', '8130358030', NULL, 'Mrs. Reena Kumari', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 19 / Tushar Saini / adm 1278
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1278' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Tushar Saini', '1278', NULL, '$2b$10$DWbWalZZym/U7uBUsJCIYupU5hrEtYQfL4OGMToJspJ.sKinUFNoG', 'student', '9911789480', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1278', 19, '2019-10-02', 'Pno-168 G-5Raksha Enclave Mohan Garden New Delhi-59', CURDATE(), 'active', '740434811367', 'Mr. Dharmendar', '9911789480', NULL, 'Mrs.Seema', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 20 / Daksh Kumar / adm 1269
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1269' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Daksh Kumar', '1269', NULL, '$2b$10$hL8UFHbJdWBmWwPbvbRTSOk1S3PO05MSUlK8Qx9ZaKzIBrcA3qprq', 'student', '9013435383', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1269', 20, '2021-01-20', 'Hno-120 Sainik Enclave Sec-1 Mohan Garden New Delhi-59', CURDATE(), 'active', '320512232787', 'Mr.Santosh Kumar', '9013435383', NULL, 'Mrs. Binita Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 21 / Ekansh / adm 1280
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1280' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Ekansh', '1280', NULL, '$2b$10$KLFo9XVdrjMbQ6SClbgeJu3CCbl5PhgSnaTlNSdyG/XfFKQvvtuH2', 'student', '8700225504', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1280', 21, '2020-04-07', 'Hno.61 A G-2 Sainik Enclave Sec-2 Mohan Garden New Delhi -59', CURDATE(), 'active', '615703458910', 'Mr.Deepak', '8700225504', NULL, 'Mrs. Shivani', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 22 / Garima Sharma / adm 1267
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1267' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Garima Sharma', '1267', NULL, '$2b$10$z0Oth/3cxzISK3HXrNEjIOWBoAN3kEW0knTj4.VYQAO8k44quRM3G', 'student', '9643689938', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1267', 22, '2020-11-21', 'Hno.39 Tagore Garden New Delhi-59', CURDATE(), 'active', '224844956867', 'Mr. Bhupendra Sarma', '9643689938', NULL, 'Mrs. Rakshita', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 23 / Payal / adm 5356
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='5356' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Payal', '5356', NULL, '$2b$10$Ey9BOPMilfsrfmKh7xJUCeiEKR9HdkSbrOm2arn5ePl4NvYunyOdu', 'student', '9773613632', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '5356', 23, '2019-08-20', 'Hno-58 G-1 Tilak Enclave Mohan Garden New Delhi-59', CURDATE(), 'active', '752302153069', 'Mr. Pintoo Kumar', '9773613632', NULL, 'Mrs. Priyanka Kum a', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 24 / Shaury / adm 1364
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1364' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Shaury', '1364', NULL, '$2b$10$XerRw8XSFh5e0H4lWDE6VOb1qAfEb5L7UoTSr2hU6674IA6AfYG6i', 'student', '9873731734', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1364', 24, '2020-12-31', 'P-141 Gbss School Mohan Garden New Delhi-59', CURDATE(), 'active', '419643687192', 'Mr.Manoj Kumar', '9873731734', NULL, 'Mrs. Pooja', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 25 / Piyush Kumar / adm 1357
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1357' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Piyush Kumar', '1357', NULL, '$2b$10$Vc86.ixnCiMvDGEpkp4r.Oet/ZcNvzW2i1wFPKwMqs3bMP9DNsy/O', 'student', '9625217894', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1357', 25, '2020-07-21', 'Sainik Vihar Mohan Garden Phase-2 G-8', CURDATE(), 'active', '368361287591', 'Mr. Rakesh Kumar', '9625217894', NULL, 'Mrs. Neetu', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 26 / Divyanshi Kumari / adm 1372
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1372' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Divyanshi Kumari', '1372', NULL, '$2b$10$1.alGH5dasVR5jEm8tA40enZcSVevEQV.HVPzprVaSCNAb9s6lnI2', 'student', '9319311604', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1372', 26, '2020-06-09', 'Hno. 4E Raksha Enclave Ext Part-2 Mohan Garden Uttam Nagar N.D-59', CURDATE(), 'active', '597342461911', 'Mr. Bheem Kumar', '9319311604', NULL, 'Mrs.Dhanju', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 27 / Pranshu Sharma / adm 1365
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1365' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Pranshu Sharma', '1365', NULL, '$2b$10$fVkxaC7BDiIHgkkWO9DQGuUSUat22Swxc0fNMtdoJ3mseuL1Tt7aW', 'student', '8178611338', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1365', 27, '2020-07-05', 'Hno. B 52 G-3 Sai Enclave Mohan Garden N.D -59', CURDATE(), 'active', '880477422175', 'Mr. Sunil kumar', '8178611338', NULL, 'Mrs. Laxmi Sharma', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 28 / Shaurya / adm 1374
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1374' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Shaurya', '1374', NULL, '$2b$10$TgvSwNZu.YWYAhJxsfEarOx6iDiKLEGQ8f.GTV6u5eTYCOqdbHbSy', 'student', '8512086920', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1374', 28, '2020-01-03', 'Hno. 72 Sainik Enclave G-2 Mohan Garden New Delhi-59', CURDATE(), 'active', '808980510513', 'Mr. Rajeev Kumar', '8512086920', NULL, 'Mrs. Poonam', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 29 / Nandini / adm 1379
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1379' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Nandini', '1379', NULL, '$2b$10$sUz5OwzwPGFsYl0LMAY.8uZYXqJQNia4ke0VAR6Lw9kdVckXnxf0K', 'student', '9958967187', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1379', 29, '2020-08-25', 'Hno. 2 E Ground Floor,Near Anna Chowk Enclave M.G N.D-59', CURDATE(), 'active', '960123039502', 'Mr. Pankaj Giri', '9958967187', NULL, 'Mrs. Ritu Kumari', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 30 / Kartik Gupta / adm 1366
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1366' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Kartik Gupta', '1366', NULL, '$2b$10$tNZW9mhVsW9A6a2bKWF5Ou/hHgaBK5imAP7a/EUYIqcAAB187E/ue', 'student', '9716248595', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1366', 30, '2019-12-22', 'Pno.19 A F Block Jain Road Mohan Garden N.D-59', CURDATE(), 'active', '834230663807', 'Late Shyam Lal Gupta', '9716248595', NULL, 'Mrs.Bharti Verma', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 31 / Shanvi / adm 1359
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1359' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Shanvi', '1359', NULL, '$2b$10$SB5hLFJ0S9v7eRnkK76CbONKPNEyOZZXGd1qzBKHsJYWaesEvkN2m', 'student', '8506880811', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1359', 31, '2019-07-05', 'Hno.F1 / 22 Mohan Garden New Delhi -59', CURDATE(), 'active', '724618601904', 'Mr. Ranjeet Singh', '8506880811', NULL, 'Mrs.Kajal', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 33 / Sana / adm 1348
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1348' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Sana', '1348', NULL, '$2b$10$vXfbx3D8vKcAgB/ptc3UW.S4aOBIg/tflWXXV2lKTwUV3/tG1ojB2', 'student', '9560076606', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1348', 33, '2020-06-12', 'Hno.A 43 Sainik Enclave Mohan Garden New Delhi -59', CURDATE(), 'active', '479829138227', 'Mr. Ram Babu', '9560076606', NULL, 'Mrs. Esha', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Earth / Roll 34 / Samreen / adm 1384
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1384' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Samreen', '1384', NULL, '$2b$10$ID87NbE8Hg5dQPJ08rclvO1TOCnhe4zF7qDDQ3PV8bpol0mtlb7He', 'student', '9015908563', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1384', 34, '2020-11-21', 'Hno.A 3 /29 Mohan Garden N.D-59', CURDATE(), 'active', '421940385849', 'Mr.Naji Bul Haque', '9015908563', NULL, 'Mrs.Meena Begum', NULL, NULL, NULL, 'General', 'Muslim', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 1 / Sarthak / adm 1078
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1078' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Sarthak', '1078', NULL, '$2b$10$doj5cM5Wk4Z.nQJwSR4pJuJrm/pMIfjgCbq6OR7V4lAZk37VEDBli', 'student', '9654561058', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1078', 1, '2020-04-30', 'A-96 Raksha Enc M.G N.D 59', CURDATE(), 'active', '329086124452', 'Mr Vivek Kumar', '9654561058', NULL, 'Mrs Jouli', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 2 / Arya Singh / adm 1072
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1072' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Arya Singh', '1072', NULL, '$2b$10$4MNxpwJEtwO6y5spQCBOHOQjdtm36XP825lB0SZhfPPKWTafhxNbK', 'student', '9810895200', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1072', 2, '2020-04-10', 'G-1 / H.N 110088 Block G/1 Sai Enc M.G N. D 59', CURDATE(), 'active', '493684028952', 'Mr Sandeep Singh', '9810895200', NULL, 'Mrs Priyanka Kuma', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 3 / Aayush kumar / adm 1351
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1351' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Aayush kumar', '1351', NULL, '$2b$10$EJj2Mo7AuWYpeWI1SqlrrOr9TcKLhESHF9RQWC0gaUm1cDDxRPuQu', 'student', '9540178584', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1351', 3, '2020-01-05', '#23,24 sainik enclave Gno -6 M.G ND 59', CURDATE(), 'active', '957656956336', 'mr arvind kumarv', '9540178584', NULL, 'mrs vidyawati', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 4 / Sumit / adm 1281
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1281' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Sumit', '1281', NULL, '$2b$10$mDo/4wQN.gPm9VUwPCPjvu/wdPwuNqXX4OW8ZTfjo/t/qmLjfi9d6', 'student', '8447001800', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1281', 4, '2019-10-10', '30 A Raksha Enc M.G N.D -59', CURDATE(), 'active', '700955735616', 'Mr Vinod', '8447001800', NULL, 'Mrs Monika', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 5 / Vivan / adm 1261
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1261' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Vivan', '1261', NULL, '$2b$10$txyEt33J8k5UHk2g4UAsS.zGvnv3Vnah29CFycAaeGHmzAu1h6HD6', 'student', '9205545112', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1261', 5, '2019-11-08', 'Sai Enc Gali Number 6 Mohan Garden Uttam Nagar New Delhi 59', CURDATE(), 'active', '628714663418', 'Mr Sikandar Mandal', '9205545112', NULL, 'Mrs Pinky Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 6 / Kirti Yadav / adm 1213
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1213' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Kirti Yadav', '1213', NULL, '$2b$10$ESiueI5n0dDUYIQp5isj1.S5vJndZ7rr2RQxOvwcjGjriIMihlIBK', 'student', '7347371916', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1213', 6, '2019-11-14', 'House Number 164 Enclave Near Nehru Chowk Shiv Mandir New Delhi 59', CURDATE(), 'active', '71028976048', 'Mr Vinod', '7347371916', NULL, 'Mrs Jai Laxmi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 7 / Shivansh Pandey / adm 1238
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1238' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Shivansh Pandey', '1238', NULL, '$2b$10$.1oNrTivYXQXSbGWnPbWXuhCWUymcP2q7kH0lrzGSUDGnLQPxD4xS', 'student', '8076480823', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1238', 7, '2020-09-06', 'Hn - 13/14 Block 13 Vikas Kunj Mohan Garden New Delhi 59', CURDATE(), 'active', '458861771686', 'Mr Sonu Pandey', '8076480823', NULL, 'Mrs Bhavna Pandey', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 9 / Anshika / adm 1249
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1249' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Anshika', '1249', NULL, '$2b$10$NOeFKDU8w9jV4oyydAEfs.NOtgAvuQBaDzwgpExN8YGZ3qH36mDG2', 'student', '9953102370', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1249', 9, '2020-10-05', 'HNO 96 saink enc Mohan garden New Delhi 59', CURDATE(), 'active', '512242052304', 'Mr Vinod Chauhan', '9953102370', NULL, 'Mrs Meena Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 10 / Divyanshi singh / adm 1240
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1240' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Divyanshi singh', '1240', NULL, '$2b$10$H9qH0NgLR4B7lgJ0HZvr1urMKHDJdPo.bAD9KDZujuonDfvNuC98W', 'student', '8920165433', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1240', 10, '2020-04-09', 'Pno.182 Sainik Enclave Sec-3 G-12 Mohan Garden New Delhi-59', CURDATE(), 'active', '223135342588', 'Mr sandeep kumar', '8920165433', NULL, 'Mrs sitara kushwah', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 11 / Annu / adm 1289
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1289' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Annu', '1289', NULL, '$2b$10$5nsNpR9Vz8nqxZeBdzzdX.ZxzCvHYqLA7ZwBs4eigle9ABj/o5GPu', 'student', '9871945617', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1289', 11, '2020-03-06', 'HNO 20 A Raksha enclave Mohan garden 59', CURDATE(), 'active', '360953669253', 'Mr Vijay Kumar', '9871945617', NULL, 'Mrs Shobha', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 13 / Rohan / adm 1346
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1346' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Rohan', '1346', NULL, '$2b$10$1Y/BmKXiHNUKDVCL0HOwAOU0/zNW0bmibeUrA1PVkAE0EWOLE.fpq', 'student', '8527035447', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1346', 13, '2018-11-07', 'Hn A / 4 Gno 3 Rakshan Enc M.G N.D 59', CURDATE(), 'active', NULL, 'Mr Rajesh Charan', '8527035447', NULL, 'Mrs Beena', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 15 / Harshita Negi / adm 1247
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1247' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Harshita Negi', '1247', NULL, '$2b$10$bXWoHa3b6WBwVi1maGYOGewK4HDkvHUiLWOnXa.bS1MOakLfEssX.', 'student', '6397566170', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1247', 15, '2020-09-13', 'HNo 15 Raksha enclave DK Mohan garden New Delhi 59', CURDATE(), 'active', '237269114064', 'Mr Ravinder Singh Negi', '6397566170', NULL, 'Mrs Yamini', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 17 / Dheeraj / adm 1379
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1379' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Dheeraj', '1379', NULL, '$2b$10$fXTY1NHBnh71OEri1HOz.uz8UcIZCABxrF5kDinH3J4UtvGzB33.i', 'student', '7065700117', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1379', 17, '2019-04-25', 'A 43 Vikas Kunj extension Vikas Nagar Mohan garden New Delhi 59', CURDATE(), 'active', NULL, 'Mr Naveen Kumar', '7065700117', NULL, 'Mrs Sitara Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 18 / Karthik Ray / adm 1526
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1526' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Karthik Ray', '1526', NULL, '$2b$10$YmW21nnFPWEYlDlYstlo4uy.mX4lWtJMgBvHmWyNuu7WzDgZ5brZC', 'student', '9582122725', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1526', 18, '2020-04-23', 'House number 20 Gali number 6 Sainik vihar phase 1 Mohan garden New Delhi 59', CURDATE(), 'active', '641956801124', 'Mr Vivekanand ray', '9582122725', NULL, 'Mrs Bhavna Ray', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 19 / aaradhya / adm 1509
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1509' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'aaradhya', '1509', NULL, '$2b$10$w/zQkU4hpvVER4l.1lIxIOka0QAjnLDqSs9sapVdY3qU8AXbXZA7a', 'student', '9716986850', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1509', 19, '2019-11-07', 'plot number 18 raksha enclave extension near star power gym Mohan garden New Delhi 59', CURDATE(), 'active', NULL, 'Mr Tej Bahadur', '9716986850', NULL, 'Mrs asha Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 20 / Navodit Singh Surya / adm 1233
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1233' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Navodit Singh Surya', '1233', NULL, '$2b$10$5omn6jnBRGjCwSebplR0oOU6FoDzHThob/nLHXXOPzgsNY4I9aKBS', 'student', '9311357153', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1233', 20, '2020-08-27', '187 Sainik Enc Sec 1 M.G New Delhi Laxmi Narayan Mandir Main Road', CURDATE(), 'active', '467906573395', 'Mr Pushkar Singh', '9311357153', NULL, 'Mrs Anita Singh', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 21 / Piyush Kumar / adm 1357
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1357' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Piyush Kumar', '1357', NULL, '$2b$10$XY/3TfPBQPTPWmFYpFUPne3uL8b/cce5YcuKM..423CeKXkG5vH.m', 'student', '8800633191', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1357', 21, '2019-12-11', '19/D Shubh Aarambh Sainik Enclave Mohan Garden New Delhi 59', CURDATE(), 'active', '913231305608', 'Mr Mishrilal Mehto', '8800633191', NULL, 'Mrs Savita', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 22 / Bhaumik Kashyap / adm 1317
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1317' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Bhaumik Kashyap', '1317', NULL, '$2b$10$/caWHg6ubWbLQzxUnunjUuzWUZ0z0RATAQk5nUNl614yRCODRNWKq', 'student', '9213558319', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1317', 22, '2020-05-01', 'Hno 15 Sainik In Clay Sector 3 Mohan Garden New Delhi 59', CURDATE(), 'active', '216062922832', 'Mr Bharat Kashyap', '9213558319', NULL, 'Mrs Indu Kashyap', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 24 / Shanaya Rajput / adm 1130
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1130' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Shanaya Rajput', '1130', NULL, '$2b$10$EewxeYiZCmGZazaB8QAibuqS6FPpSddKEFotF5vHi0ook744GL6HW', 'student', '9013249391', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1130', 24, '2020-02-29', 'house number 47 Raksha enclave Mohan garden New Delhi 59', CURDATE(), 'active', '508636059893', 'Mr Rahul Kumar', '9013249391', NULL, 'Mrs sweety Kumari', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 27 / Chirag Sharma / adm 1578
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1578' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Chirag Sharma', '1578', NULL, '$2b$10$vmqR9y/OfaYHDlI6y8GkweoA090wjumeQLCaVFVnzFDlXm/OSrbSC', 'student', '7982826155', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1578', 27, '2020-01-04', 'house number 6 Gali number 6 near santaarantee public School Mohan garden New Delhi 59', CURDATE(), 'active', '303884958789', 'Mr Saurabh Sharma', '7982826155', NULL, 'Mrs Komal', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 28 / navya / adm 1585
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1585' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'navya', '1585', NULL, '$2b$10$cdk4NsCpS6D/rplTa2BkEOhxCBj4/H0sdG.oAWcJ.zWAm8wic1a2K', 'student', '9654214982', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1585', 28, '2019-07-13', 'house number 108 Sainik enclave sector 1 Mohan garden Uttam Nagar New Delhi 59', CURDATE(), 'active', '793974531113', 'Mr Aditya Kumar', '9654214982', NULL, 'Mrs Ritu Kumari', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 1st Jupiter / Roll 29 / Smriti / adm 1592
SET @class_id := (SELECT id FROM classes WHERE class_name='1st' AND section='Jupiter' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1592' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Smriti', '1592', NULL, '$2b$10$aOGN.WZVaT8C9NwfLTUeXetk1cxYqKLZdWM8pFcjnvHqv4rQJjXi6', 'student', '8851025402', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1592', 29, '2020-01-03', 'b 302 Raksha enclave Mohan garden New Delhi 59', CURDATE(), 'active', '376693333922', 'Mr Gautam', '8851025402', NULL, 'Mrs Chanda Kumar', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 1 / Mannat / adm 1151
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1151' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Mannat', '1151', NULL, '$2b$10$HIxW7KDqGA07Lja11eczy.jXPPvl2BJqkNdW65IbmnkZFE4FHuQIy', 'student', '8920622471', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1151', 1, '2019-07-07', 'G.no-9h 128 Sainik Enclave', CURDATE(), 'active', '693751412551', 'Mr.Sokendra', '8920622471', NULL, 'Mrs.Gunjan', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 2 / Rupak / adm 1311
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1311' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Rupak', '1311', NULL, '$2b$10$/rdoR7UpDBMm7sUPaPzOEOYouiUQYw3hkyqVpbKwGXCx0LzfmU4DG', 'student', '7827943191', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1311', 2, '2019-08-22', 'H no-71Gali no 10 sai Enclave', CURDATE(), 'active', '9351466312', 'Mr.Raju shah', '7827943191', NULL, 'Mrs.Sanjana kuma', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 3 / Shivani kumari / adm 1304
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1304' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Shivani kumari', '1304', NULL, '$2b$10$NywVbZ3LAM2us91AThieHOCrM0NdS9YDyRB0xqLjE9ECEnhDccJKW', 'student', '7428668592', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1304', 3, '2011-01-01', 'H.no 66 Sainik Enclave sec-1 MG', CURDATE(), 'active', NULL, 'Mr.Ranjeet', '7428668592', NULL, 'Mrs.Rinku', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 4 / Utkarsh / adm 1062
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1062' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Utkarsh', '1062', NULL, '$2b$10$R7T3gVDqm.j2Ag7GZyi8TOYk2.5p81uyAqFMAbHwRddS5iVGRpa8W', 'student', '9654131692', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1062', 4, '2019-05-08', 'H.no66 sai Enclave MG sai Enclave New Delhi', CURDATE(), 'active', '348226537447', 'Mr.Vinod', '9654131692', NULL, 'Mrs.lalsa kumari', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 5 / Bajrangi Gupta / adm 1320
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1320' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Bajrangi Gupta', '1320', NULL, '$2b$10$X31by3sWSds7EV3mY9qEtuJWRQvnEihODOdGQlhk7FpIHPh2XM0lm', 'student', '9199046147', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1320', 5, '2019-08-17', 'H.no 154 gali no -7 MG New Delhi', CURDATE(), 'active', '233260863417', 'Mr.Pradeep kuma', '9199046147', NULL, 'Mrs.Pooja', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 6 / Ayank raj / adm 1312
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1312' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Ayank raj', '1312', NULL, '$2b$10$QHl94ZlPLU4fbySVITRPZOeUrrEFb1UBiW1P4jzLzgVMpjuhTwZqG', 'student', '773933776', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1312', 6, '2020-05-10', 'H.no 163 Raksha Enclave nehru chowk MG', CURDATE(), 'active', NULL, 'Mr.Amit kumar', '773933776', NULL, 'Mrs.sarita', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 7 / Prisha Sharma / adm 1153
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1153' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Prisha Sharma', '1153', NULL, '$2b$10$mzDpaRW943QwoCIy.Ikcxe3LP6agMIS0V2voXbR7ViwaZEPC3.S0G', 'student', '8285881213', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1153', 7, '2021-11-20', 'H.no 49 AG-6 Raksha Enclave New Delhi', CURDATE(), 'active', '274030295818', 'Mr.kundan sharm', '8285881213', NULL, 'Mrs.Pooja', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 8 / Aaradhya verma / adm 1332
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1332' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Aaradhya verma', '1332', NULL, '$2b$10$vLf.pGquKFfTHDYK9ZND1ugGHEFUucR1FazUTHatPck33SahOuNaG', 'student', '8595528149', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1332', 8, '2019-02-27', 'H.no 80 Sainik vihar', CURDATE(), 'active', '703724489565', 'mr.krishna kumar', '8595528149', NULL, 'Mrs.Nandani verm', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 9 / Shivagya prajapati / adm 1193
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1193' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Shivagya prajapati', '1193', NULL, '$2b$10$td/R7yUc5S5ihNAryW4Va.vGNKNqKi9k6PeX509IbYQ1Q1s.Ru2mu', 'student', '8168361839', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1193', 9, '2019-05-24', 'h.no 57 A4/3 gali no -5 sai enclave new Delhi', CURDATE(), 'active', '737743579569', 'Mr.shiv kumar', '8168361839', NULL, 'mrs.Pragya daksh', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 10 / Gauri Sharma / adm 1121
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1121' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Gauri Sharma', '1121', NULL, '$2b$10$Us9xD40/zSZtVuLAGrKZAuB.zwWApgqNImFgWvSNh4vV7AIcZwOKe', 'student', '8512864313', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1121', 10, '2019-04-01', 'h.no3a Raksha Enclave g no 6/1 MG New Delhi', CURDATE(), 'active', '491575366874', 'Mr Suresh', '8512864313', NULL, 'Mrs.sneh lata', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 11 / Vedika ranjan / adm 1159
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1159' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Vedika ranjan', '1159', NULL, '$2b$10$Vts2Y8MZvZ2fog.lieTpoOz31lMweA99MdpioEgY6VOPIaNq4oNYy', 'student', '9717525737', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1159', 11, '2019-07-05', 'H.nod-14 vikas kunj new Delhi', CURDATE(), 'active', '686821159535', 'Mr.Jai shankar', '9717525737', NULL, 'Mrs.Rinki', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 12 / Danish / adm 1164
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1164' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Danish', '1164', NULL, '$2b$10$h5dHkoXRq.zA6r.ntpTXwu2zRYbJd/C.mamwP3IF2GLFMSOHIA4RG', 'student', '9871581366', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1164', 12, '2018-12-27', 'H.no 18 gali no18 Sainik Enclave', CURDATE(), 'active', '459430511198', 'Md Usman', '9871581366', NULL, 'mrs.sanovar', NULL, NULL, NULL, 'General', 'muslim', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 13 / Ayush Kumar / adm 1529
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1529' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Ayush Kumar', '1529', NULL, '$2b$10$h9qfRmmm6L7LL7Ct9nJOD.y44NSR75CLD78K.arayYoi7Zumk54H2', 'student', '7838555553', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1529', 13, '2018-11-12', 'h.no242 gali no-8 Raksha Enclave New Delhi', CURDATE(), 'active', '639919619222', 'Mr.Nirdesh kuma', '7838555553', NULL, 'mrs.Manisha', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 15 / Jatrik / adm 1162
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1162' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Jatrik', '1162', NULL, '$2b$10$sLu.MkSXbhQSEfKShWrZd.8qOowEhaP/TrhiXBhmPGUEcCpCTjGyO', 'student', '8700387718', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1162', 15, '2018-08-24', 'P no sand- 06 Vikas Kunj New Delhi', CURDATE(), 'active', '344589676495', 'mr. Avinash', '8700387718', NULL, 'mrs.chetna', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 16 / Roshni / adm 1287
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1287' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Roshni', '1287', NULL, '$2b$10$t1tK2BhrZ0hXpASIgnvAEusn6lU92k9cV.YIQjDxaW5OEqLFm5oF.', 'student', '8130906778', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1287', 16, '2019-01-18', 'h.no 68/69 tilak enclave', CURDATE(), 'active', '268923084257', 'mr.fekan', '8130906778', NULL, 'mrs.sarita', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 17 / Hardik / adm 1073
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1073' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Hardik', '1073', NULL, '$2b$10$vYC.5TMxAWFeA8rlAmQAYuGQ.AO2ZZxvzwI80LlvBNvbWr0RtwNdy', 'student', '9716245905', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1073', 17, '2018-10-30', 'P no-203 sec-3 sai Enclave MG', CURDATE(), 'active', '856360527743', 'mr.deepak', '9716245905', NULL, 'mrs.Nisha', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 19 / Divya / adm 1184
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1184' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Divya', '1184', NULL, '$2b$10$ywuOCg2t5G9QQjbDiCHgXOm8fE9cbkirZ3KgPEciOJQuKAetXgM3W', 'student', '9582613409', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1184', 19, '2019-08-18', 'A-75Mohan garden G-6 Raksha Enclave New Delhi', CURDATE(), 'active', '889833330726', 'mr.vikram kumar', '9582613409', NULL, 'Mrs.Mala', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 20 / Rajni / adm 1149
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1149' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Rajni', '1149', NULL, '$2b$10$tWLN3tcif3lhhmiyePjerOOefU1Th0tYJJAmc8ZFJsiUMH6XTSY.6', 'student', '8920869210', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1149', 20, '2017-06-19', 'h.no 94 Sai vihar New Delhi', CURDATE(), 'active', '201611747944', 'Mr.dharmender', '8920869210', NULL, 'Mrs.Malti', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 21 / Devansh / adm 1306
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1306' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Devansh', '1306', NULL, '$2b$10$ZhrOoRVo/NvdWajL7AsK0uTDlDG/p0kQdSNHd2uYX1RErzMURuNzi', 'student', '9971302065', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1306', 21, '2018-10-23', 'h.no-274 Raksha Enclave gali no -2 sec-1 MG', CURDATE(), 'active', '840986589073', 'mr.santosh', '9971302065', NULL, 'Mrs.Rekha', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 22 / Md.Sufyan / adm 1097
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1097' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Md.Sufyan', '1097', NULL, '$2b$10$XVnwhT2IlBmD2Rz64Gpe7umIrwauFpjWl6l8SLe463KFkuhiKHRlW', 'student', '9718669382', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1097', 22, '2018-06-13', 'H no-25sakati vihar B-1 New Delhi', CURDATE(), 'active', '815139759357', 'Shamshod', '9718669382', NULL, 'Shahjaha khatoon', NULL, NULL, NULL, 'General', 'muslim', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 24 / shivansh / adm 1202
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1202' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'shivansh', '1202', NULL, '$2b$10$d/MtArOzgEwIxUmLRWntCepwsI/a/fG7Lm/l9wquxLuZO7Quzqs/C', 'student', '9350917984', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1202', 24, '2019-01-27', 'G.3hno-174 G no -3 sai Enclave New Delhi', CURDATE(), 'active', '324821287342', 'Mr.Manoj kumar', '9350917984', NULL, 'mrs.indrawati', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 25 / Abhishek Ranjan / adm 1114
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1114' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Abhishek Ranjan', '1114', NULL, '$2b$10$YEZpaVqc1bUTKetDDzjlQ.xs9kHpEG5T1IsIui4KpEN/i3I8PzPXi', 'student', '858595912', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1114', 25, '2019-08-30', 'H.no26/28/61a 3/2 Sainik Enclave New Delhi', CURDATE(), 'active', '608480290997', 'Mrs.Ayay Ranjan', '858595912', NULL, 'Mrs.Priyanka', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 26 / Vaishnavi Sharma / adm 1094
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1094' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Vaishnavi Sharma', '1094', NULL, '$2b$10$SoiUCLDDnVxjqS.O9qT5le7Gtvol.aF7Lx6RQ54Q7j0nmd7LJmaEC', 'student', '9968558439', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1094', 26, '2018-11-14', 'H.no15Asainik enclave Sec-3 New Delhi', CURDATE(), 'active', '720822697547', 'mr.Banwari', '9968558439', NULL, 'Mrs.sunita', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 27 / Aditya Rathore / adm 1587
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1587' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Aditya Rathore', '1587', NULL, '$2b$10$WkfGCJ8Uj3P/y5jhiFhs7OKWzau./0VVCHqGu1pOXIzQvMrX81g/O', 'student', '9650167567', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1587', 27, '2019-07-30', 'H.no 94 Sainik Enclave Part -3 New Delhi', CURDATE(), 'active', '813598324678', 'Mr.Anil Rathore', '9650167567', NULL, 'Mrs.Janki', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 28 / Hritik kumar / adm 1161
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1161' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Hritik kumar', '1161', NULL, '$2b$10$L/ccOdvzhO9AdKr1.Ebk3eXWbrVOx3qFRqTUtR.gDsMTUCTdP2nGW', 'student', '7982008565', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1161', 28, '2019-05-16', 'H.no 91 Sainik Enclave Part -3 New Delhi', CURDATE(), 'active', '456170596595', 'Mr.Ravi sharma', '7982008565', NULL, 'Mrs Raj Kumari', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 29 / Saksham / adm 1142
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1142' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Saksham', '1142', NULL, '$2b$10$vJhYog9kULceSEi5QYQLRefn12GZu4KuojhMTPKSQdTWFAhlemLHy', 'student', '8130540784', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1142', 29, '2018-09-23', 'H.no23 vikas kunj New Delhi', CURDATE(), 'active', '689982529992', 'Mr.Arun kumar', '8130540784', NULL, 'Mrs.Durga devi', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 2nd Earth / Roll 30 / Sarvesh kumar / adm 1179
SET @class_id := (SELECT id FROM classes WHERE class_name='2nd' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1179' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Sarvesh kumar', '1179', NULL, '$2b$10$2ijReCt9Mk4O3APn.10q3OEOAmuieZChnzyKIzU3cJWR8bQRlv3X6', 'student', '9910550833', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1179', 30, '2018-03-02', 'H.no66 gali no 11 Sainik Enclave', CURDATE(), 'active', NULL, 'Mr.Ananad kumar', '9910550833', NULL, 'Mrs Reena', NULL, NULL, NULL, 'General', 'hindu', 'Indian', NULL, NULL, NULL, '110059', 'DELHI', 'NEW DELHI', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 7th Earth / Roll 1 / Abhishek Tiwari / adm 904
SET @class_id := (SELECT id FROM classes WHERE class_name='7th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='904' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Abhishek Tiwari', '904', NULL, '$2b$10$RVgjmifoG45ht9/gt3HbAeMQkM6BofPOubwdd8Xy5E/p3TNDxS.sO', 'student', '8860209890', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '904', 1, '2014-08-29', '58/A Tilak Enclave Gali no-2 M.G', CURDATE(), 'active', '267008434036', 'Mr. Mintu Tiwari', '8860209890', NULL, 'Mrs. Puja Kumari', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 7th Earth / Roll 2 / Abhinav Istwal / adm 692
SET @class_id := (SELECT id FROM classes WHERE class_name='7th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='692' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Abhinav Istwal', '692', NULL, '$2b$10$IdCib9UENA1JCT9ommNib.apqi4tagdX6jwxjY2zg/Qcq4/k/3pvG', 'student', '9990654896', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '692', 2, '2014-01-03', '64/3G.n Defence Enclave part-2 M.G', CURDATE(), 'active', '824686939496', 'Mr. Bhuwaneshwar Prasad', '9990654896', NULL, 'Mrs. Beena Kumari', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 7th Earth / Roll 3 / Ansh Gupta / adm 617
SET @class_id := (SELECT id FROM classes WHERE class_name='7th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='617' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Ansh Gupta', '617', NULL, '$2b$10$2VSyjI67TVdXZ3LDbALMMOrKi.pQa/kQV80324H12Y/T/O9bFMI.G', 'student', '8383813217', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '617', 3, '2014-03-14', 'Plot no- 211 block 3 Sai enclave Gali no- 9, M.G', CURDATE(), 'active', '711112290634', 'Mr. Sanjay Gupta', '8383813217', NULL, 'Mrs. Manju Gupta', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 7th Earth / Roll 4 / Ankit Kumar / adm 489
SET @class_id := (SELECT id FROM classes WHERE class_name='7th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='489' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Ankit Kumar', '489', NULL, '$2b$10$8R0JdOVNtgNtQzqPeqDgYeMv.0yT6Yc4lY8wSU04FwDjChngVh5JO', 'student', '9310300622', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '489', 4, '2014-07-21', 'H.no-27/28 Ph-2 Sainik Enclave', CURDATE(), 'active', '430126003535', 'Mr. Tripurari Ram', '9310300622', NULL, 'Mrs. Kajal Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 7th Earth / Roll 5 / Chhaya / adm 509
SET @class_id := (SELECT id FROM classes WHERE class_name='7th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='509' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Chhaya', '509', NULL, '$2b$10$C3wiaT/KmJFxpqgdQeX/UupZtqs9Ki00OcbmjK.7/7Rw8SG2GVAAe', 'student', '9599323314', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '509', 5, '2013-11-13', 'H.no-28 Tilak Enclave Gali no. 3, M.G', CURDATE(), 'active', '68782107406', 'Mr. Kamal', '9599323314', NULL, 'Mrs. Sunita', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 7th Earth / Roll 6 / Hemant Kumar / adm 562
SET @class_id := (SELECT id FROM classes WHERE class_name='7th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='562' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Hemant Kumar', '562', NULL, '$2b$10$RahwdLCDuuAzuj5YTJoKm.TLXj/lG0hkqG6YVgnbPcUFT9.wRqv7i', 'student', '6350200190', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '562', 6, '2014-09-19', 'H.no-6/23 Raksha Enclave Extn M.G', CURDATE(), 'active', '748515140600', 'Mr. Harender Jha', '6350200190', NULL, 'Mrs. Laxmi Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 7th Earth / Roll 7 / Komal / adm 499
SET @class_id := (SELECT id FROM classes WHERE class_name='7th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='499' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Komal', '499', NULL, '$2b$10$vLfoBlCVnRHV40YwtK9txeSR7FnOzZ0e3QRSK.Ck2tIEF8kSpK2Oe', 'student', '9654611131', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '499', 7, '2014-04-05', 'H.no-46 Part-3 Gali no-1 Sainik Enclave Uttam Nagar DK M.G', CURDATE(), 'active', '832696701443', 'Mr. Dilip Kumar', '9654611131', NULL, 'Mrs. Anita Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 7th Earth / Roll 8 / Kush Sharma / adm 527
SET @class_id := (SELECT id FROM classes WHERE class_name='7th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='527' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Kush Sharma', '527', NULL, '$2b$10$g6pmHmIWMXidKcCZPCFf9.lkaz28fUOEzkit6v/pbv8p8iT1zx5LW', 'student', '7827887839', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '527', 8, '2013-08-14', 'Plot no-41 Gali no 7/3 sainik Vihar M.G', CURDATE(), 'active', '324660136993', 'Mr. Manoj Kumar Sharma', '7827887839', NULL, 'Mrs. Panwati', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 7th Earth / Roll 9 / Love Sharma / adm 528
SET @class_id := (SELECT id FROM classes WHERE class_name='7th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='528' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Love Sharma', '528', NULL, '$2b$10$Tu7Ij69qFYUxRhJ4/g0OHODjJEkricgV/Qph0O78Eqw9BcAv/u6we', 'student', '9540728034', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '528', 9, '2013-08-14', 'Plot no-41 Gali no 7/3 sainik Vihar M.G', CURDATE(), 'active', '712750762360', 'Mr. Manoj Kumar Sharma', '9540728034', NULL, 'Mrs. Panwati', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 7th Earth / Roll 10 / Lalit Gupta / adm 1126
SET @class_id := (SELECT id FROM classes WHERE class_name='7th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1126' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Lalit Gupta', '1126', NULL, '$2b$10$FpyJs./QzsvDNdz2z0BbVOQ3Bp2Inr1glByesojMivXORlfm2dIQG', 'student', '9650382103', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1126', 10, '2013-08-09', 'Plot no 46 Gali no-11 Deep enclave Part 1, Vikash Nagar', CURDATE(), 'active', NULL, 'Mr. Umesh Kumar Gupta', '9650382103', NULL, 'Mrs. Sheela Gupta', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 7th Earth / Roll 11 / Manjay Kumar / adm 566
SET @class_id := (SELECT id FROM classes WHERE class_name='7th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='566' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Manjay Kumar', '566', NULL, '$2b$10$./Qx81XxtaqoRMnRIT8MMOe8z1y1tz/wXX/1YiOU32c0.by4mwDuq', 'student', '9818204594', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '566', 11, '2014-02-03', 'H.no-30 Gali no 3, Raksha Enclave', CURDATE(), 'active', '639223354280', 'Mr. Dharmendra kumar', '9818204594', NULL, 'Mrs. Tunni Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 7th Earth / Roll 12 / Shyam Sharma / adm 498
SET @class_id := (SELECT id FROM classes WHERE class_name='7th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='498' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Shyam Sharma', '498', NULL, '$2b$10$kR4PHCCoVfY1BRPW62AbW.kAiGNTjP1Y10XlRjWX5ppLgLIR5iDiK', 'student', '7678634180', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '498', 12, '2013-12-14', 'H.no 4/2 Raksha Enclave Gali no 6 M.G', CURDATE(), 'active', '826770092333', 'Mr. Ashish Kumar Sharma', '7678634180', NULL, 'Mrs. Seema Sharma', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 7th Earth / Roll 13 / Soyam / adm 1236
SET @class_id := (SELECT id FROM classes WHERE class_name='7th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1236' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Soyam', '1236', NULL, '$2b$10$oxOpfk0BnMt9eqL9HzuL..FAV.3xAbp9pIyZiNZ7cMXmBT3CPJZgC', 'student', '9560397310', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1236', 13, '2012-09-19', 'Plot no. -29 G/F Gali no 4, Tilak Enclave M.g', CURDATE(), 'active', '872075115092', 'Mr. Badal', '9560397310', NULL, 'Mrs. Lalita', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 7th Earth / Roll 15 / Aakriti / adm 1395
SET @class_id := (SELECT id FROM classes WHERE class_name='7th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1395' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Aakriti', '1395', NULL, '$2b$10$5wXSit1FKeiYSfm.I/KhteFxDcUmRKc3toNtRLi2qlZMora1jgPdK', 'student', '9310300622', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1395', 15, '2016-10-05', 'H.no 50/a Sainik Vihar M.G', CURDATE(), 'active', '807779463165', 'Mr. Sharad Sharma', '9310300622', NULL, 'Mrs. Kalpna Sharma', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 7th Earth / Roll 16 / Rahul / adm 1440
SET @class_id := (SELECT id FROM classes WHERE class_name='7th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1440' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Rahul', '1440', NULL, '$2b$10$u.aCAryCZUCQMsnRU.rEp.pF1u2CCY9JOX6J6jIreVKukjP0qklIy', 'student', '8882681426', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1440', 16, '2012-12-17', 'H.no-33 to 37 Sainik Enclave Sec-5 M.G', CURDATE(), 'active', '232584079716', 'Mr. Akhilesh Pandit', '8882681426', NULL, 'Mrs. Munni Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 7th Earth / Roll 17 / Ragani Kumari / adm 1589
SET @class_id := (SELECT id FROM classes WHERE class_name='7th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1589' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Ragani Kumari', '1589', NULL, '$2b$10$/mLh6yuaWZd1yeAMai3mfeuLiVvj76Hda39uDzcBaOxjz3mIwXr5C', 'student', '9122227088', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1589', 17, '2011-06-30', '195-197 G-3 Gali no. 8 M.G', CURDATE(), 'active', '703067876645', 'Mr. Santosh Kumar Manjhi', '9122227088', NULL, 'Mrs. Soni Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 1 / kiyan yadav / adm 1293
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1293' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'kiyan yadav', '1293', NULL, '$2b$10$sWoHeXaW626GpcQl5jjJ1OI8VaXxCRzxQyGhJbjcizq1XpO1rCJU.', 'student', '9990488882', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1293', 1, '2021-02-22', 'HnoA-74,Gn-2 sainik enclave mohan garden', CURDATE(), 'active', '94745811', 'karan kumar', '9990488882', NULL, 'Shikha yadav', NULL, NULL, NULL, 'General', 'Hindu', 'indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 2 / Himani yadav / adm 1437
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1437' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Himani yadav', '1437', NULL, '$2b$10$ocHfpezJ2ec/cov6n07Liuf5ng9NlYLWvNZKE9n9MsSSBqMjprO/W', 'student', '9971544579', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1437', 2, '2021-09-05', 'Hno-26,Gno-2 Raksha enclave mohan garden', CURDATE(), 'active', '75467411', 'Rajeev Kumar', '9971544579', NULL, 'Pushpa Kumari', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 3 / kartik saxena / adm 1318
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1318' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'kartik saxena', '1318', NULL, '$2b$10$FzfmRMEeB.s0ISr1/omctODdrTr8wkMp5DhEpZU9YaaenL8YVGfoS', 'student', '8076663597', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1318', 3, '2021-12-29', 'Hno-9,Gno:-6 Raksha enclave part -2 mohan garden', CURDATE(), 'active', NULL, 'Anuraj Kumar', '8076663597', NULL, 'meera', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 4 / Tanveer kumar / adm 1461
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1461' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Tanveer kumar', '1461', NULL, '$2b$10$381stZtO3HIgmA2zTykQJuDWwQAktCHWYfCAAfyFCryYlPzRm2C/i', 'student', '8285561237', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1461', 4, '2020-12-05', 'Ground floor-14a sainik enclave sec-3 mohan garden', CURDATE(), 'active', '79673411', 'Anuj Kumar', '8285561237', NULL, 'Sonali kumari', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 5 / sohit / adm 1481
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1481' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'sohit', '1481', NULL, '$2b$10$qg8yPIj5nEtaDSXVbxty2u2TG1MrDvo9.PbzI/Fh2ppQbcoFxRUKm', 'student', '9582204714', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1481', 5, '2019-08-18', '19 first floor G-9 KHno-6/15 sainik enclave mohan garden', CURDATE(), 'active', '83602511', 'Prasant', '9582204714', NULL, 'Sonu', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 6 / kushal Singh / adm 1206
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1206' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'kushal Singh', '1206', NULL, '$2b$10$Zz.GUDskz.qkPK05mDActOh/KPtd5TOIsWVL5kuUul/yGurjxUnia', 'student', '8700848290', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1206', 6, '2021-02-11', 'Hno-38, Gn-1 sainik enclave mohan garden', CURDATE(), 'active', '98015511', 'manoj Kumar', '8700848290', NULL, 'kajal', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 7 / shreyansh / adm 1445
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1445' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'shreyansh', '1445', NULL, '$2b$10$0d8lSVVT9CPFzfZx.tAeju/YWPxvdJjqHQ7LiErdSivnosdqgr3fq', 'student', '8755480387', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1445', 7, '2020-09-18', 'Hno-64, G-5 Saini enclave mohan garden', CURDATE(), 'active', NULL, 'Gaurav chauhan', '8755480387', NULL, 'Preeti', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 8 / Urveen / adm 1513
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1513' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Urveen', '1513', NULL, '$2b$10$Ec6ZnTs3pLeyfONHaUsZUO0g4NHKcp1UkTBNLYKeXk7nkBYjfC6l6', 'student', '9211584593', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1513', 8, '2021-09-01', 'Hno-96 B, Gno-8 sainik enclave mohan garden', CURDATE(), 'active', '5915711', 'Raju Sharma', '9211584593', NULL, 'Anshu', NULL, NULL, NULL, 'General', 'Hindu', 'indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 9 / Tawinkal / adm 1443
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1443' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Tawinkal', '1443', NULL, '$2b$10$BRe.IiYt4ZqwnH6NyqeaE.p1KaX5sb02w8g2eSNGoCA.Aajwx/INW', 'student', '8447812197', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1443', 9, '2020-10-14', 'Pno-72 Gno-7 sainik vihar mohan garden', CURDATE(), 'active', '91615711', 'Pratap choudhary', '8447812197', NULL, 'kismati', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 10 / Riyansh / adm 1466
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1466' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Riyansh', '1466', NULL, '$2b$10$QTA/G0Ka1iYWV8CL2dRfkei.UyhZlhQGValA.ea9kCmEbMPgpVgeG', 'student', '8920919700', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1466', 10, '2019-12-06', 'Hno-92, Gno-9 mohan garden uttam nagar', CURDATE(), 'active', NULL, 'Anil Vishkarma', '8920919700', NULL, 'Aarti Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 11 / kanak kannaujia / adm 1441
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1441' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'kanak kannaujia', '1441', NULL, '$2b$10$9cfyTbvRmdguRoENYCakZeLMb.oWxnpyxpLmJ4MhmgPc3LPWODova', 'student', '9559966731', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1441', 11, '2020-09-01', 'Hno-28, Gno-3 sai enclave mohan garden', CURDATE(), 'active', NULL, 'Brijesh kumar', '9559966731', NULL, 'Dulari devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 12 / Rudransh / adm 1333
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1333' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Rudransh', '1333', NULL, '$2b$10$9jWBXb.FDYM.L20XB1y8nO5SyGqKRWOz5DNvq0pWDV7K6.GhALld2', 'student', '9818288260', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1333', 12, '2020-11-17', 'Hno-150, Gno-3 sainik enclave mohan garden', CURDATE(), 'active', '83522811', 'Raj Kumar', '9818288260', NULL, 'Durga', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 13 / Falak / adm 1386
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1386' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Falak', '1386', NULL, '$2b$10$ArdjaRnUv0l8LgbNQH7eoOKKtMgANy7wVkQj76VDzLMgUaeKcz5j6', 'student', '9205250747', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1386', 13, '2020-09-10', 'Hno- B-22 Raksha enclave extension part 2/3 Mohan garden', CURDATE(), 'active', '98099311', 'mohd. salam', '9205250747', NULL, 'Mariyam khatoon', NULL, NULL, NULL, 'General', 'muslim', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 14 / Samaira parveen / adm 1472
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1472' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Samaira parveen', '1472', NULL, '$2b$10$XA2aihzhPwJdDRhjeR2pMOTiXMr4Y4Bc1PP0AWl85GngRvSa/AEY.', 'student', '9625764802', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1472', 14, '2021-06-07', 'Hno- B-22 Raksha enclave extension part 2/3 Mohan garden', CURDATE(), 'active', '49457911', 'konan Hussain', '9625764802', NULL, 'Gojala parveen', NULL, NULL, NULL, 'General', 'Muslim', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 15 / Hardik sharma / adm 1095
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1095' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Hardik sharma', '1095', NULL, '$2b$10$gNhAbrmcyynvf/oCtf4bC.4xFtFV.frMOPlVAQLqyqQnzMZsRphIi', 'student', '9868902775', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1095', 15, '2020-07-20', 'Plot no- 6,7 Mohan garden uttam nagar West delhi', CURDATE(), 'active', '42409811', 'Dinesh Sharma', '9868902775', NULL, 'Preeti', NULL, NULL, NULL, 'General', 'Hindu', 'indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 16 / Piyush / adm 1393
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1393' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Piyush', '1393', NULL, '$2b$10$0aeTMoS97wR6gOBOlH3BRejRoROle1b.GoW0cyx2xNESo5qd7CUbC', 'student', '8920172071', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1393', 16, '2021-10-20', 'Hno-92/98, First floor, sainik enclave phase-3 mohan garden', CURDATE(), 'active', '37723311', 'Manik ram', '8920172071', NULL, 'Gunja kumari', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 18 / Anaysha / adm 1231
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1231' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Anaysha', '1231', NULL, '$2b$10$sjuFRpHFm6M0PAXYRhS9w.Kp474O.EOd2n5F82iDbFNMYt9b7dKNi', 'student', '9015915744', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1231', 18, '2021-03-06', 'B-31, sainik enclave sec-1 Gno-4 mohan garden', CURDATE(), 'active', '61079611', 'Rakesh kumar', '9015915744', NULL, 'Suman', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 19 / Rudra / adm 1279
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1279' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Rudra', '1279', NULL, '$2b$10$4n2iATcixIOGSBhi3V3zhO58Wuevr4OEsoaIQzvQgzEgu5p1HFJ8e', 'student', '8130441406', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1279', 19, '2021-03-03', 'Hno-85 Gno-8 sainik vihar mohan garden', CURDATE(), 'active', '88832711', 'Mr.Dharmender kumar', '8130441406', NULL, 'Priyanka', NULL, NULL, NULL, 'General', 'Hindu', 'indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 20 / Munnedra / adm 1302
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1302' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Munnedra', '1302', NULL, '$2b$10$vGRD/07Zd.LdcphxyD50MeeIT1o6Tevdxg1Lpf3nXD4plrHgFFB6e', 'student', '7838959733', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1302', 20, '2020-12-11', 'Hno-94, sainik enclave phase-2 mohan garden', CURDATE(), 'active', NULL, 'Dharmendra', '7838959733', NULL, 'Malti', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 21 / Divyanshi / adm 1579
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1579' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Divyanshi', '1579', NULL, '$2b$10$FInLTK2vWDDTLFzbP3Wp5.RZby2cfoOJRlUFPAkTd/KQI1Nttg2s6', 'student', '7011169191', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1579', 21, '2021-09-21', 'Hno-6, sainik enclave sector -3, near nehru chowk mohan garden', CURDATE(), 'active', '26661411', 'Hemant', '7011169191', NULL, 'Neetu', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 22 / Ansh / adm 1272
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1272' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Ansh', '1272', NULL, '$2b$10$QfCDFb3CRsXyEoayP5cP8OTEjdvopKo1PWy2K7plDQR30eMO73uoy', 'student', '9971494656', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1272', 22, '2020-11-26', 'B-31, Gno-4 Near himgiri mandir sainik enclave mohan garden', CURDATE(), 'active', '53896411', 'Praveen Kumar', '9971494656', NULL, 'Jyoti', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 23 / Apritanshu singh / adm 1580
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1580' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Apritanshu singh', '1580', NULL, '$2b$10$tj2ikZAU8uuLcMLwm9P4teTAMAOadbpmCOyyfDYcYGZfdYIK4YYCa', 'student', '9430095564', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1580', 23, '2019-10-23', NULL, CURDATE(), 'active', NULL, 'Sanjit Kumar', '9430095564', NULL, 'Awantika Singh', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 24 / Raghav / adm 1339
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1339' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Raghav', '1339', NULL, '$2b$10$BQLGXS8gheRwBZzDzp7sm.OX4Pp/2IRyrcGy7JE.BCs5HAxEcnR1K', 'student', '7838480435', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1339', 24, '2018-09-27', 'Hno-3 Gno-6 Raksha enclave mohan garden', CURDATE(), 'active', '28218511', 'Rajeev kumar', '7838480435', NULL, 'Rachna', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Lotus / Roll 25 / Vanya yadav / adm 1594
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Lotus' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1594' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Vanya yadav', '1594', NULL, '$2b$10$31lrVV8US63GoN9xVRQ6l.OfPBR.z.SQxsJ9XWNB47K87yvYD.uCq', 'student', '9717666183', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1594', 25, '2020-12-30', 'Hno- 114 Tilak enclave part-1 mohan garden uttam nagar', CURDATE(), 'active', NULL, 'Vijay kumar', '9717666183', NULL, 'Anjani kumari', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 1 / Anushka / adm 857
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='857' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Anushka', '857', NULL, '$2b$10$xW6X1l/IIOC3cprpuLEruu4HevtFhkr9kvUUWwXEwtPN6oGXonRem', 'student', '8860368242', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '857', 1, '2016-12-12', 'Plot no-29,Block R3B,Mohan Garden , New Delhi-59', CURDATE(), 'active', '531379527140', 'Mr. Avnish Kumar', '8860368242', NULL, 'Mrs. Reena', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 2 / Angel / adm 859
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='859' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Angel', '859', NULL, '$2b$10$8tBDEBblKhgCGHOUrE5.AOpurfS1ADgLt99cAlnPKoqxL65rhVT1W', 'student', '8929255816', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '859', 2, '2016-07-10', '31 Extention ,Part 2, Mohan Garden New Delhi-59', CURDATE(), 'active', '686270614649', 'Mr. Shiv Kumar', '8929255816', NULL, 'Mrs. Roopa', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 3 / Harshit Pandey / adm 883
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='883' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Harshit Pandey', '883', NULL, '$2b$10$KUZb2VDcxMzmR8KnFTtXFudH.paKOp4L8FXi8KzM0miSilIeNZTvu', 'student', '8851835823', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '883', 3, '2017-02-09', 'Hno-68,Gali no-11 Sainik Vihar, phase 3, Mohan Garden', CURDATE(), 'active', '965545188903', 'Mr. Vipin Pandey', '8851835823', NULL, 'Mrs. Komal Pandey', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 4 / Kavya / adm 884
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='884' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Kavya', '884', NULL, '$2b$10$2gykaRI76xf6fIMV/pWgyeKIReQFbhH62ruhfJhQG0kuuQ7i3SWaG', 'student', '9910454406', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '884', 4, '2016-07-31', '132. Block -17, Mohan Garden,Uttam Nagar,New Delhi-59', CURDATE(), 'active', '334468127956', 'Mr. Vinod Kumar', '9910454406', NULL, 'Mrs. Neeta Prasad', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 5 / Kanhaiya Singh / adm 851
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='851' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Kanhaiya Singh', '851', NULL, '$2b$10$esIB575PkJKGs28oPfFOd.KgZ1jNtyH8ccy9b/vD3UFJfW/9b6xxK', 'student', '9643781412', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '851', 5, '2015-08-12', 'Hno-51 Rama Park Road,Mohan Garden, New Delhi -59', CURDATE(), 'active', '652430361453', 'Mr. Rahul', '9643781412', NULL, 'Mrs. Laxmi Rawat', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 6 / Ansh Verma / adm 864
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='864' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Ansh Verma', '864', NULL, '$2b$10$Em/9d1PI3j4dAu6twpnbiuqoLlOKiaS8ABIxjc7SPriXnT6jtWMcS', 'student', '9891015877', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '864', 6, '2017-01-09', 'D-224, B/10-11, Mohan Garden, Uttam Nagar, New Delhi-59', CURDATE(), 'active', '665288927592', 'Mr. Mukesh Kumar Verma', '9891015877', NULL, 'Mrs. Mamata Soni', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 7 / Dev / adm 853
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='853' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Dev', '853', NULL, '$2b$10$W2o7m4PdSPXvBhRBHY2OeOKbEh/CbvaMKgaie.HCTEMjT0Gjb8a3y', 'student', '9312855128', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '853', 7, '2016-09-06', 'A-14 Vipin Garden , Mohan Garden,West New Delhi-59', CURDATE(), 'active', '869424952290', 'Mr. Rohit Paswan', '9312855128', NULL, 'Mrs. Neetu', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 8 / Karan Singh / adm 852
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='852' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Karan Singh', '852', NULL, '$2b$10$XlgbMu8vaa5Y/HlJ18VWW.Tp9J.W1axDYl.92PTSYAleMauvoGa2q', 'student', '9354506193', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '852', 8, '2015-06-12', 'Hno-125, Mohan Garden, New Delhi-59', CURDATE(), 'active', '344450874849', 'Mr. Banti', '9354506193', NULL, 'Mrs. Amrata', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 9 / Khushal / adm 882
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='882' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Khushal', '882', NULL, '$2b$10$EwO8SWIlOKPzffEhIxEAaeziHNSdQ829nJV.2xm5WN0RkLeQ3RE1a', 'student', '9315717589', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '882', 9, '2015-10-22', 'D-287 JJ colony, Raghubir nagar, Tagore Garden, Delhi', CURDATE(), 'active', '906989083823', 'Mt. Pawan Kumar', '9315717589', NULL, 'Mrs. Pawan Kumar', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 10 / Vansh / adm 874
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='874' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Vansh', '874', NULL, '$2b$10$Ffnx6YnkaUVgMRGf6ZA2m.0jO1tgASuKD4mPgL/GBH.B6BjoA4iGW', 'student', '9958123353', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '874', 10, '2016-07-02', 'K-1/85, Mohan Garden, Uttam Nagar,New Delhi-59', CURDATE(), 'active', '402738665571', 'Mr. Babneet Kumar', '9958123353', NULL, 'Mrs. Pooja Devi', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 11 / Chirag Gupta / adm 863
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='863' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Chirag Gupta', '863', NULL, '$2b$10$zK5uvYCj9tYJq0/nFXogeewv30EN94filmhSDMxU4stEyuwOxWZ1G', 'student', '9568519918', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '863', 11, '2017-02-14', 'Hno. P-22, Gali no-2,Near Police Station, Mohan Garden,New Delhi-59', CURDATE(), 'active', '821234369047', 'Mr. Neeraj Gupta', '9568519918', NULL, 'Mrs. Rita Gupta', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 12 / Md. Arsh / adm 888
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='888' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Md. Arsh', '888', NULL, '$2b$10$faJ9LM8jTVeph5zMS8ReueweaNY4mY0/1WdjbNyG07df6nnSwiVCm', 'student', '8851555936', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '888', 12, '2016-02-26', 'Hno-17, G-3, Sainik Enclave, Jilani Masjid, Mohan Garden,New Delhi-59', CURDATE(), 'active', '864969728190', 'Md. Mukim', '8851555936', NULL, 'Mrs. Hoseena Bano', NULL, NULL, NULL, 'EWS', 'muslim', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 13 / Ananya / adm 981
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='981' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Ananya', '981', NULL, '$2b$10$EVUCHAFI68w8pvLlO8Ez9uofX.i3tINdi.wrXKti1Rt5O./ZNG3Pe', 'student', '8130209124', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '981', 13, '2016-10-07', 'Hno-6/14, Galino-7,Star Power Gym, Raksha Enclave, Mohan Garden , New Delhi-59', CURDATE(), 'active', '860222696932', 'Mr. Vinay Kumar', '8130209124', NULL, 'Mrs. Kusum Lata', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 14 / Shrishti Kumari / adm 1045
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1045' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Shrishti Kumari', '1045', NULL, '$2b$10$DZoizwHNg/b0xDWl2B7SvuwaPXpLgmIDYhi1SlWm1fTulGMNvN7iK', 'student', '7982406942', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1045', 14, '2016-01-30', 'Hno-6 Sainik Enclave,Mohan Garden, New Delhi-59', CURDATE(), 'active', '364034450741', 'Mr . Pankaj Kumar Sahu', '7982406942', NULL, 'Mrs. Devshree Kumari', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 15 / Ansh Kumar Patel / adm 1315
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1315' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Ansh Kumar Patel', '1315', NULL, '$2b$10$iop4NYTaaAvYC6Til7jIzu0y3M4aLUu.9YiuP1azGZII7tmrduluu', 'student', NULL, 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1315', 15, '2016-01-31', 'Hno-95, Sainik Vihar-3, Vikas Nagar, West Delhi-59', CURDATE(), 'active', '614038713175', 'Mr. Mukesh Kumar Patel', NULL, NULL, 'Mrs. Pinki Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 16 / Viraj / adm 701
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='701' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Viraj', '701', NULL, '$2b$10$Vc6Pkede.O2Dmcb7aCb5L.bie6NY0Cmrb7ip4MGRo62IqC1dpPJYm', 'student', '9315699720', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '701', 16, '2012-02-07', 'Hno-7, R-3 A, 20/20, Galino-7, Raksha Enclave, Mohan Garden, New Delhi-59', CURDATE(), 'active', '423935977529', 'Mr. Ravi', '9315699720', NULL, 'Mrs. Rekha', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 17 / Varun Kumar Shaw / adm 812
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='812' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Varun Kumar Shaw', '812', NULL, '$2b$10$3WyTIljSLv.sK8vg4IAVv.MV4lSe15Loq8IJD9CbdYeqPcHbsRlR2', 'student', '8383026131', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '812', 17, '2014-06-10', 'Hno-3, Galino-6, Raksha Enclave, Extention, Mohan Garden', CURDATE(), 'active', '469193495429', 'Mr. Gulab Chandra Shaw', '8383026131', NULL, 'Mrs. Poonam Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 18 / Mayank Raj / adm 1059
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1059' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Mayank Raj', '1059', NULL, '$2b$10$rbEjYb.wJrmKnbZ2/4yUCOOtkEi0im2Xll9ZZdHqmtuAYNRYQAQwi', 'student', '7447761089', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1059', 18, '2016-09-03', '37D, Raksha Enclave,Nehru Chowk, Mohan Garden, New Delhi-59', CURDATE(), 'active', '593432018811', 'Mr. Manoj Kumar', '7447761089', NULL, 'Mrs. Nibha Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 19 / Aaradhya / adm 796
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='796' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Aaradhya', '796', NULL, '$2b$10$ZJf5kF7i/abs08u4TnYmt.M9uBDeeKf5BnZa6E6R/aUYupFdQMOb.', 'student', '7838028036', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '796', 19, '2016-04-07', 'R-3, A 20/20, Mohan Garden, New Delhi-59', CURDATE(), 'active', '540111340008', 'Mr. Jitendra Kumar Rathor', '7838028036', NULL, 'Mrs. Rajni', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 20 / Rudra / adm 826
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='826' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Rudra', '826', NULL, '$2b$10$5ZNYEienOEUop1Yu0Hg8ZOtWxXAb5KFWoFQsJn7nz/Vg4oDGjT/eu', 'student', '8368854059', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '826', 20, '2015-01-10', 'Hno-B-72, Galino-2, Sainik Enclave, Mohan Garden, New Delhi-59', CURDATE(), 'active', '751069880717', 'Mr. Rajeev Kumar', '8368854059', NULL, 'Mrs. Poonam', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 21 / Devanshi / adm 1214
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1214' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Devanshi', '1214', NULL, '$2b$10$VmgrRCl/AM.NyYTpprKnGeIiYNuWIx2lnl1PY949HfRyq8Eda3x7i', 'student', NULL, 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1214', 21, '2016-10-04', 'Plot no-40, Khno-17/1, Sainik Vihar,D.K. , Mohan Garden, West Delhi-59', CURDATE(), 'active', '358973092989', 'Mr. Jagvir Singh', NULL, NULL, 'Mrs. Anita Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 22 / Rudra / adm 1071
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1071' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Rudra', '1071', NULL, '$2b$10$pBquslk1zEyN7IMhwYzBHeqShhMMmuU1wAk9u.G2/jXAZ/gx9e2ea', 'student', '8810314372', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1071', 22, '2017-06-06', 'Hno- 165, Sainik Enclave, part-3,Mohan Garden,New Delhi-59', CURDATE(), 'active', '601390563201', 'Mr. Manoj', '8810314372', NULL, 'Mrs. Seema', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 24 / Aatif / adm 973
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='973' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Aatif', '973', NULL, '$2b$10$UoLcIaI2Y2QrUy0DGdTQ4uwIQW7yoQ8zKaAUA3GyNVRXBJzD78Lmm', 'student', '9720090186', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '973', 24, '2016-01-21', 'Plot no-10 or 24, Block R-5, Mohan Garden, New Delhi-59', CURDATE(), 'active', '841418081363', 'Mr. Sajid Saifi', '9720090186', NULL, 'Mrs. Ruksar', NULL, NULL, NULL, 'General', 'muslim', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 25 / Saharshnath Jha / adm 1250
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1250' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Saharshnath Jha', '1250', NULL, '$2b$10$QPL5qavTAXYwgoPbEwnqHuOGSxM4sIo.ztikuz2x9uyHmfPL2Da4m', 'student', '7011712693', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1250', 25, '2016-08-22', 'Plot no-139, Gali no-7,G-3 Block,Mohan Garden, New Delhi-59', CURDATE(), 'active', '463235671865', 'Mr. Sanjay Kumar Jha', '7011712693', NULL, 'Mrs. Aarya Jha', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 26 / Rabhiya / adm 805
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='805' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Rabhiya', '805', NULL, '$2b$10$WiAS1ph3Vrwi9zKGtXTSvONbhaUBpxRGfz2Q/wHCES0Cam4Y5v2J.', 'student', '9582122725', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '805', 26, '2015-11-10', '20 Phase -1, Sainik Vihar, Galino-6, Mohan Garden, Uttam Nagar,New Delhi-59', CURDATE(), 'active', '782959434711', 'Mr. Vivekanand Rai', '9582122725', NULL, 'Mrs. Bhawna Sharma', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 27 / Ansh Kumar Thakur / adm 930
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='930' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Ansh Kumar Thakur', '930', NULL, '$2b$10$PMI7fKLxDvAelWPEOUtnKOmKoa6nFSU1SZNNim.tBYLzwzU1Zw.z.', 'student', '9013435383', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '930', 27, '2017-10-05', 'Hno- 120, Galino-40, Sainik Enclave Sec-1, New Delhi-59', CURDATE(), 'active', NULL, 'Mr. Santosh Kumar Thakur', '9013435383', NULL, 'Mrs. Binita Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 28 / Aditya / adm 1335
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1335' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Aditya', '1335', NULL, '$2b$10$o74gIRWh4KHxiZcP5plRLu2vLI2W7qFP3EZp0Yl4ZsJIw02.uTQge', 'student', '9199363042', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1335', 28, '2014-12-10', 'Hno-23, Galino-7, Near Star Power Gym, New Delhi-59', CURDATE(), 'active', '924123764123', 'Mr. Amarnath Mahato', '9199363042', NULL, 'Mrs. Reena Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 29 / Asmita / adm 1124
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1124' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Asmita', '1124', NULL, '$2b$10$dVpxgVnYweNMWHx7Eed5r.o7XBAnkJ6K3V/Ed9FszMAgnzhAwS9.u', 'student', '9312013916', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1124', 29, '2014-02-26', 'Plot no-36A ,G/F, Gali no-5, Vikas Kunj, Mohan Garden, New Delhi-59', CURDATE(), 'active', '603643750021', 'Mr. Rajesh Kumar Sah', '9312013916', NULL, 'Mrs. Anita Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 30 / Ansh / adm 963
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='963' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Ansh', '963', NULL, '$2b$10$o/OqHv5GI/pAb0X7rM.UnuIp7G4kbX3mMNhGXFwk6wt55h/WC6Eve', 'student', NULL, 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '963', 30, '2014-05-08', 'Hno-25,P.B. , Mohan Garden, New Delhi-59', CURDATE(), 'active', '627614652226', 'Mr. Praveen Kumar', NULL, NULL, 'Mrs. Reeta', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 31 / Vihan / adm 1520
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1520' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Vihan', '1520', NULL, '$2b$10$ZnJNfesVPR8p12zaATIxB.Kr9Jc.tZqbHFvKoSDqoSNkqFviBbpC.', 'student', '9821311457', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1520', 31, '2016-05-28', 'Plot no-31, S EXTN, Mohan Garden, New Delhi-59', CURDATE(), 'active', '681037439756', 'Mr. Vijay Singh', '9821311457', NULL, 'Mrs. Sonia Kumari', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 32 / Juhi / adm 754
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='754' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Juhi', '754', NULL, '$2b$10$NwmKhOLcfF1QoHIaD8eRouBUdR.eilVMnhrrg4Wf47SyCqlpuRJxW', 'student', '9205545112', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '754', 32, '2016-07-11', 'Plot no-71, Block G-3, Sainik Enclave Mohan Garden,Uttam Nagar,New Delhi-59', CURDATE(), 'active', '429190279786', 'Mr. Sikandra Mandal', '9205545112', NULL, 'Mrs. Pinki Devi', NULL, NULL, NULL, 'General', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 33 / Ishika Chauhan / adm 866
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='866' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Ishika Chauhan', '866', NULL, '$2b$10$jsJoIYimDAjVGlaShUcYsesz0elZq7AqliblCmWoBmQfi1eceOXAG', 'student', NULL, 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '866', 33, '2022-04-28', '76/3 defence g.no-3 mohan garden', CURDATE(), 'active', '749565014912', 'mr. Ajay Chauhan', NULL, NULL, 'Mrs. neetu devi', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 34 / Lavanshika / adm 880
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='880' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Lavanshika', '880', NULL, '$2b$10$fjVPL.mqRWH1ijbAJX739OITkjvJAOT0nHTYHa84qIXzY0wtnP4jm', 'student', NULL, 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '880', 34, '2016-08-23', 'wz-97,tip om vihar phase -3', CURDATE(), 'active', '348898066815', 'Mr. mukesh', NULL, NULL, 'mrs. rekha', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 35 / satvik singh / adm 881
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='881' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'satvik singh', '881', NULL, '$2b$10$Egpq7Hn0qDuJYUIBjLyrwOIg7cyTQsx6ZSXI2I4tRRXZXw5U.sXP6', 'student', NULL, 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '881', 35, '2015-09-10', 'k-1/107 ext mohan garden', CURDATE(), 'active', '933218319495', 'mr. bablu singh', NULL, NULL, 'mrs. shobha devi', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 36 / Tushar sharma / adm 871
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='871' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Tushar sharma', '871', NULL, '$2b$10$FY8dJ5YwQicHGbgI2BLT2eBEN50ZsXNEivHSFA8K41hB5RVBSsI.6', 'student', NULL, 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '871', 36, '2015-07-20', 'h.no-k1/159g/f mohan garden new delhi', CURDATE(), 'active', '859017684601', 'Mr. nitin sharma', NULL, NULL, 'Mrs. Vandana', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- 5th Earth / Roll 37 / Zoya Rehman / adm 887
SET @class_id := (SELECT id FROM classes WHERE class_name='5th' AND section='Earth' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='887' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Zoya Rehman', '887', NULL, '$2b$10$/YGC4wbxVZU4upuSiQ289uOQqc/gLZ11IhOK1Kba4t0FYoePBYb7q', 'student', NULL, 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '887', 37, '2015-10-07', 'r4/10and 11g/f block r-4 mohan garden', CURDATE(), 'active', '509991420592', 'mr. Hafijul Rahman', NULL, NULL, 'Mrs. nahida khatoon', NULL, NULL, NULL, 'EWS', 'muslim', 'Indian', NULL, NULL, NULL, '110059', 'New Delhi', 'Delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 1 / Ifat / adm 1351
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1351' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Ifat', '1351', NULL, '$2b$10$UJb8YLGi8Cjc76HAPpYfZO.UvuBGP8mBdLNZOEYHKeu4mnzBje5MW', 'student', '9013295314', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1351', 1, '2021-02-20', 'Hno.167,sainik vihar mohan garden', CURDATE(), 'active', '86417711', 'mr.parvej ansari', '9013295314', NULL, 'mrs.Nishat bano', NULL, NULL, NULL, 'EWS', 'muslim', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 2 / Ronak / adm 1378
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1378' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Ronak', '1378', NULL, '$2b$10$y/0XDvdmk8XQM8DriGcWg.Suh6X7EOqrJhlH4gGUqf3YhBEX4JK2O', 'student', '7011307968', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1378', 2, '2021-02-19', 'Hno.61,vikas nagar ,vasai road', CURDATE(), 'active', '23468511', 'mr.pawan singh', '7011307968', NULL, 'mrs. poonam', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 3 / sabreen parveen / adm 1353
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1353' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'sabreen parveen', '1353', NULL, '$2b$10$0l7FAyEDDf2O1ronzuxj5u5dqI44RyIXt8CvThyQ0SeUKpL4QVthi', 'student', '9610547422', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1353', 3, '2021-09-25', 'Hno.158,159,gali no.7,sainik enclave, sec-2', CURDATE(), 'active', '86050838036', 'MD.hatim', '9610547422', NULL, 'mrs.shahzadi khatoon', NULL, NULL, NULL, 'EWS', 'muslim', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 4 / sanskar kumar / adm 1380
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1380' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'sanskar kumar', '1380', NULL, '$2b$10$zGCZFbM/IGsY9044hl2qxOKqkDg1KGIxO2rCE4NSDbwu0cEIMXRoC', 'student', '9319389291', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1380', 4, '2021-05-05', 'Hno.27/28,sainik vihar ,gali no.8,face-2', CURDATE(), 'active', '20269611', 'mr.mukesh kumar', '9319389291', NULL, 'mrs.Indu devi', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 5 / maanvi kumari / adm 1350
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1350' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'maanvi kumari', '1350', NULL, '$2b$10$xUNnIB2/XCCDRHJ396TBvuMtzqcDVScQlEniUN2kkz3iJrtc1iGTi', 'student', '8010113772', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1350', 5, '2021-12-24', 'Hno.52F, gali no.6,raksha enclave', CURDATE(), 'active', '44154811', 'mr.umesh prasad', '8010113772', NULL, 'mrs.phool kumari', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 6 / Ritik raj / adm 1369
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1369' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Ritik raj', '1369', NULL, '$2b$10$8sImDx2MCQLdprvsac7lIuCd2LbDwkX62jS.kIYOQHmD.rnr7vNoG', 'student', '8368259789', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1369', 6, '2021-11-04', 'Hno.175,B,S,block, mohan garden-59', CURDATE(), 'active', '67200811', 'mr.shyam kumar', '8368259789', NULL, 'mrs.kanchan kumari', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 7 / yash kumar / adm 1371
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1371' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'yash kumar', '1371', NULL, '$2b$10$Efi9J8LZqM6vGpjDcMpNtO0MSGVpcEAANzziY/ueYyEgW4iqjf1cG', 'student', '8920276481', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1371', 7, '2021-11-25', 'Hno.7,gali no.6,sec.2,sainik enclave', CURDATE(), 'active', '27940211', 'mr.raj kumar', '8920276481', NULL, 'mrs.mamta', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 8 / MD.aayan babu / adm 1354
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1354' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'MD.aayan babu', '1354', NULL, '$2b$10$z4/DurRkso/lFE7oxng/fOL6DaKtbiZZFWXQNJqZ7IEUlra5iuAGa', 'student', '9625606033', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1354', 8, '2020-10-16', 'A-71,sainik vihar,ansari chowko,mohan garden', CURDATE(), 'active', '23815311', 'MD.chhote', '9625606033', NULL, 'mrs.sahjeena khatun', NULL, NULL, NULL, 'EWS', 'Muslim', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 9 / keshav sharma / adm 1361
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1361' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'keshav sharma', '1361', NULL, '$2b$10$qjyaBFqRddmNylLjEBmBgONcmR4wBavqmz5v0Brq2g7tMMbLHrK4.', 'student', '9557752182', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1361', 9, '2021-09-02', 'Hno.16A,gali no.2 sainik enclave, sec-1', CURDATE(), 'active', '73209935450', 'mr.Ram avtar sharma', '9557752182', NULL, 'mrs.sonu', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 10 / Aakriti / adm 1355
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1355' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Aakriti', '1355', NULL, '$2b$10$XqAnNrlwxIbUy1pg.ikqJern2Zl0yxmzzaOoavu5oPN.gvZkQE3GW', 'student', '8851956630', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1355', 10, '2020-10-01', 'Hno.114,gali no.9,sainik enclave, sec-1, mohan garden', CURDATE(), 'active', '58490911', 'mr.kamlesh kumar', '8851956630', NULL, 'mrs.nutan', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 11 / Akanksha tiwari / adm 1360
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1360' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Akanksha tiwari', '1360', NULL, '$2b$10$amdKuPHWC4eR8oF8kidK7.plVvwhEjfyUq6L0BQXUAEErpx3/UaZu', 'student', '8076031365', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1360', 11, '2020-07-12', 'gali no.15,Hno.18B,sainik enclave', CURDATE(), 'active', '51888111', 'mr.sunil kumar', '8076031365', NULL, 'mrs.neetu tiwari', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 12 / somviya / adm 1383
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1383' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'somviya', '1383', NULL, '$2b$10$aJx.wp9R.1FKt8OyEWegOe5BLfqz/L2ESCKcgOBTGzGwKczm5du3.', 'student', '9625230728', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1383', 12, '2020-07-20', 'plot no.6,ground floor, sainik enclave,MG', CURDATE(), 'active', '52079111', 'mr.sunil kumar', '9625230728', NULL, 'mrs. baby', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 13 / Raghav / adm 1363
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1363' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Raghav', '1363', NULL, '$2b$10$9m1hH48MJfiqxQWQY.yN1.Mz61CQo3i9zG5f3ZwPSaGaljpSYLDbu', 'student', '9958630221', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1363', 13, '2021-12-22', 'Hno.21, gali no.1,tilak enclave part -1,', CURDATE(), 'active', '3283511', 'mr.chandra prakash', '9958630221', NULL, 'mrs. gaytri', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 14 / MD.aahil ansari / adm 1349
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1349' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'MD.aahil ansari', '1349', NULL, '$2b$10$KS6U2EriPsqOe253pEUmDOmeUPlMh0IGubMt/qd2MERZw9jWfbCoe', 'student', '8766391077', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1349', 14, '2021-11-15', 'B-18,gn-7, sainik enclave, sec-5', CURDATE(), 'active', '79691611', 'mr.Aalamgeer ansari', '8766391077', NULL, 'mrs.noor jahan', NULL, NULL, NULL, 'EWS', 'muslim', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 15 / Sahil ansari / adm 1362
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1362' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Sahil ansari', '1362', NULL, '$2b$10$2qQFez8zwYBy8mkJ1vmNju5h5FUDhLYEpdR711o8srHVuP6AViU9y', 'student', '7303020916', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1362', 15, '2021-12-28', 'Hno.38/5,gali no.3,sai,G-3, enclave', CURDATE(), 'active', '26167711', 'mr.salman ansari', '7303020916', NULL, 'mrs.ajmeri', NULL, NULL, NULL, 'EWS', 'Muslim', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 16 / Deepti dhangar / adm 1367
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1367' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Deepti dhangar', '1367', NULL, '$2b$10$fg6lMHmy.uQMbFXQDRRGM.OM7D2Y6rkKrRW62pa5jh6gfwcDyrnSa', 'student', '7530944386', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1367', 16, '2020-10-02', 'Hno.65,sainik enclave', CURDATE(), 'active', '30605811', 'mr.suneel kumar', '7530944386', NULL, 'mrs.pinki devi', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 17 / aditya kumar / adm 1550
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1550' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'aditya kumar', '1550', NULL, '$2b$10$WhmiZKuq/tzSIvlNC/nD/eRxuWTzsxS4v1thpu.XrHIIb.rH7caOi', 'student', '7367042123', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1550', 17, '2020-09-26', 'plot no.28D,block G-3, sai enclave', CURDATE(), 'active', '43849411', 'mr.chandan kumar', '7367042123', NULL, 'mrs.sarita kumari', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 18 / Jigyansh / adm 1556
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1556' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Jigyansh', '1556', NULL, '$2b$10$.FWQDAjPfqSxmUHrxWiuluqxv1q0SrgEh8UTdJgBnaSCgfP4O1tzK', 'student', '8285667039', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1556', 18, '2020-08-30', 'Hno.P177,mohan garden uttam nagar', CURDATE(), 'active', '51506311', 'mr.sanjeev kumar', '8285667039', NULL, 'mrs.KM monika', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 19 / kavya / adm 1551
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1551' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'kavya', '1551', NULL, '$2b$10$lgKzjN0Vn6sFKuZim6kg/uLQvAJzAto9Qp5faX7E/eAEda2LeU.Cm', 'student', '7011056664', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1551', 19, '2021-08-04', 'Hno.g-2/36/1,gali no.14,sai enclave, part 1 MGND -59', CURDATE(), 'active', '5054511', 'mr.chandan kumar sharma', '7011056664', NULL, 'mrs.madhu', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 20 / maryam parveen / adm 1557
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1557' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'maryam parveen', '1557', NULL, '$2b$10$91/YwjDiC/39THeeAI340OfcFdBQwWnAknrOACueTxNF/U7xxpJyy', 'student', '7210285910', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1557', 20, '2020-12-10', '87-G/F,block-R-3A20 mohon garden', CURDATE(), 'active', '34413211', 'mohammad sabir', '7210285910', NULL, 'mrs.Bahala parveen', NULL, NULL, NULL, 'EWS', 'muslim', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 21 / anisha / adm 1568
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1568' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'anisha', '1568', NULL, '$2b$10$Ggpn50PkiQ.if8eLBLoLbOr28ByUUKOuueAhU2xUdJVsmWbKo4ix2', 'student', '9625800391', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1568', 21, '2021-10-04', 'Block-3,Hno.-160,gali no.8, MGUN-59', CURDATE(), 'active', '72343911', 'mr.Brajesh kumar', '9625800391', NULL, 'mrs.manorama', NULL, NULL, NULL, 'EWS', 'muslim', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 22 / kunal / adm 1570
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1570' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'kunal', '1570', NULL, '$2b$10$k/FoxxLNOJqp0uP6zOosF.w6J6u2ATVAHMQ9CSBOpAbpqhIivrkSG', 'student', '9899094883', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1570', 22, '2021-06-11', '87-C,sainik enclave, sec-1,gno.8,MGUN-59', CURDATE(), 'active', '25440811', 'mr.santhosh shah', '9899094883', NULL, 'mrs.rekha', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 23 / nargis / adm 1569
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1569' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'nargis', '1569', NULL, '$2b$10$Pyk7yaIcHp8BPE.eygl3UeRgCPf7UUDm9iqTNW9OsGw.x/twc/WhK', 'student', '9911884879', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1569', 23, '2021-02-09', 'Hno 191Lextension,VIC,uttam nagar DKMG', CURDATE(), 'active', '42843811', 'mr.shahid alam', '9911884879', NULL, 'mrs.kanina khatoon', NULL, NULL, NULL, 'EWS', 'Muslim', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 24 / kayrav sharma / adm 1540
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1540' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'kayrav sharma', '1540', NULL, '$2b$10$pvwH39awWkRshsdbL8WiFOXliAc6uhP1qcDNe9P2vHtheYUNJu2eW', 'student', '7982374704', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1540', 24, '2022-11-22', 'Pno.235,gno.1 harsh garden, raksha enclave', CURDATE(), 'active', '4822211', 'mr.sonu sharma', '7982374704', NULL, 'mrs.kumari meena', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

-- UKG Rose / Roll 25 / krish pandit / adm 1576
SET @class_id := (SELECT id FROM classes WHERE class_name='UKG' AND section='Rose' LIMIT 1);
SET @existing_user_id := (SELECT id FROM users WHERE username='1576' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'krish pandit', '1576', NULL, '$2b$10$zmjWN3irjuJlKlXxVf9gC.Zey6WE5FOkN0VWzd6tgdck57tZtQdv.', 'student', '8527265772', 1, NOW(), NOW()
WHERE @class_id IS NOT NULL AND @existing_user_id IS NULL;
SET @user_id := COALESCE(@existing_user_id, LAST_INSERT_ID());
INSERT INTO students (user_id, class_id, admission_number, roll_number, date_of_birth, address, admission_date, status, aadhaar_number, father_name, father_phone, father_aadhaar, mother_name, mother_phone, mother_aadhaar, parents_pan, category, religion, nationality, blood_group, birth_certificate_number, ews_certificate_number, pincode, city, state, created_at, updated_at)
SELECT @user_id, @class_id, '1576', 25, '2020-10-15', 'KI/21A,DKMG, sani bajar road', CURDATE(), 'active', '97122411', 'mr.Dilip kumar', '8527265772', NULL, 'mrs.prabhawati', NULL, NULL, NULL, 'EWS', 'Hindu', 'Indian', NULL, NULL, NULL, '110059', 'Delhi', 'New delhi', NOW(), NOW()
WHERE @class_id IS NOT NULL AND @user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE user_id=@user_id);

COMMIT;
