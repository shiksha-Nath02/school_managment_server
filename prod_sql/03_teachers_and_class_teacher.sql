-- ============================================================
-- Sant RLD Public School — Production data load
-- Step 03: Teachers + class-teacher mapping
-- Run in MySQL Workbench against the PROD database (sant_RLD).
--
-- What this does:
--   1. Renames Nursery/UKG sections Ankur/Pallav -> Rose/Lotus
--      (students already linked stay linked — only the section label changes).
--   2. Creates 16 teacher accounts. Login username = phone number,
--      password = santrld@2026 (same bcrypt hash for all).
--   3. Sets class_teacher_id on each class so the teacher's portal
--      (GET /api/teacher/classes) shows her class + students automatically.
--
-- Idempotent: re-running skips usernames/teachers that already exist.
-- ============================================================

USE sant_RLD;

START TRANSACTION;

-- ── 1. Rename Nursery & UKG sections to Rose / Lotus ───────────────────────
-- (Ankur -> Rose, Pallav -> Lotus). LKG keeps its existing single section.
UPDATE classes SET section = 'Rose'  WHERE class_name = 'Nursery' AND section = 'Ankur';
UPDATE classes SET section = 'Lotus' WHERE class_name = 'Nursery' AND section = 'Pallav';
UPDATE classes SET section = 'Rose'  WHERE class_name = 'UKG'     AND section = 'Ankur';
UPDATE classes SET section = 'Lotus' WHERE class_name = 'UKG'     AND section = 'Pallav';

-- ── 2 + 3. Teachers + class_teacher mapping ────────────────────────────────
-- Shared password hash = bcrypt('santrld@2026')
SET @pw := '$2b$10$iCqHObekXLcjsFW2A4UKQOCdOWzUJiks1x6VrO.cbWp5P5BvCQyoa';

-- Reusable block per teacher:
--   • insert user (skip if username already exists)
--   • insert teacher profile (skip if already exists for that user)
--   • point the class's class_teacher_id at this teacher

-- 1) Nursery / Rose — Poonam Bisht
SET @u := (SELECT id FROM users WHERE username = '8383950208' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Poonam Bisht','8383950208',NULL,@pw,'teacher','8383950208',1,NOW(),NOW() WHERE @u IS NULL;
SET @u := COALESCE(@u, LAST_INSERT_ID());
INSERT INTO teachers (user_id, created_at, updated_at) SELECT @u,NOW(),NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = @u);
SET @t := (SELECT id FROM teachers WHERE user_id = @u LIMIT 1);
UPDATE classes SET class_teacher_id = @t WHERE class_name = 'Nursery' AND section = 'Rose';

-- 2) Nursery / Lotus — Archana
SET @u := (SELECT id FROM users WHERE username = '9315518129' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Archana','9315518129',NULL,@pw,'teacher','9315518129',1,NOW(),NOW() WHERE @u IS NULL;
SET @u := COALESCE(@u, LAST_INSERT_ID());
INSERT INTO teachers (user_id, created_at, updated_at) SELECT @u,NOW(),NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = @u);
SET @t := (SELECT id FROM teachers WHERE user_id = @u LIMIT 1);
UPDATE classes SET class_teacher_id = @t WHERE class_name = 'Nursery' AND section = 'Lotus';

-- 3) LKG — Komal Sharma
SET @u := (SELECT id FROM users WHERE username = '9654020897' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Komal Sharma','9654020897',NULL,@pw,'teacher','9654020897',1,NOW(),NOW() WHERE @u IS NULL;
SET @u := COALESCE(@u, LAST_INSERT_ID());
INSERT INTO teachers (user_id, created_at, updated_at) SELECT @u,NOW(),NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = @u);
SET @t := (SELECT id FROM teachers WHERE user_id = @u LIMIT 1);
UPDATE classes SET class_teacher_id = @t WHERE class_name = 'LKG';

-- 4) UKG / Rose — Shikha
SET @u := (SELECT id FROM users WHERE username = '8851842824' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Shikha','8851842824',NULL,@pw,'teacher','8851842824',1,NOW(),NOW() WHERE @u IS NULL;
SET @u := COALESCE(@u, LAST_INSERT_ID());
INSERT INTO teachers (user_id, created_at, updated_at) SELECT @u,NOW(),NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = @u);
SET @t := (SELECT id FROM teachers WHERE user_id = @u LIMIT 1);
UPDATE classes SET class_teacher_id = @t WHERE class_name = 'UKG' AND section = 'Rose';

-- 5) UKG / Lotus — Kiran Gautam
SET @u := (SELECT id FROM users WHERE username = '8285498609' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Kiran Gautam','8285498609',NULL,@pw,'teacher','8285498609',1,NOW(),NOW() WHERE @u IS NULL;
SET @u := COALESCE(@u, LAST_INSERT_ID());
INSERT INTO teachers (user_id, created_at, updated_at) SELECT @u,NOW(),NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = @u);
SET @t := (SELECT id FROM teachers WHERE user_id = @u LIMIT 1);
UPDATE classes SET class_teacher_id = @t WHERE class_name = 'UKG' AND section = 'Lotus';

-- 6) 1st / Earth — Mamta Bhagel
SET @u := (SELECT id FROM users WHERE username = '9205404182' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Mamta Bhagel','9205404182',NULL,@pw,'teacher','9205404182',1,NOW(),NOW() WHERE @u IS NULL;
SET @u := COALESCE(@u, LAST_INSERT_ID());
INSERT INTO teachers (user_id, created_at, updated_at) SELECT @u,NOW(),NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = @u);
SET @t := (SELECT id FROM teachers WHERE user_id = @u LIMIT 1);
UPDATE classes SET class_teacher_id = @t WHERE class_name = '1st' AND section = 'Earth';

-- 7) 1st / Jupiter — Pooja Sinha
SET @u := (SELECT id FROM users WHERE username = '9815104540' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Pooja Sinha','9815104540',NULL,@pw,'teacher','9815104540',1,NOW(),NOW() WHERE @u IS NULL;
SET @u := COALESCE(@u, LAST_INSERT_ID());
INSERT INTO teachers (user_id, created_at, updated_at) SELECT @u,NOW(),NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = @u);
SET @t := (SELECT id FROM teachers WHERE user_id = @u LIMIT 1);
UPDATE classes SET class_teacher_id = @t WHERE class_name = '1st' AND section = 'Jupiter';

-- 8) 2nd / Earth — Renu Rani
SET @u := (SELECT id FROM users WHERE username = '7217870339' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Renu Rani','7217870339',NULL,@pw,'teacher','7217870339',1,NOW(),NOW() WHERE @u IS NULL;
SET @u := COALESCE(@u, LAST_INSERT_ID());
INSERT INTO teachers (user_id, created_at, updated_at) SELECT @u,NOW(),NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = @u);
SET @t := (SELECT id FROM teachers WHERE user_id = @u LIMIT 1);
UPDATE classes SET class_teacher_id = @t WHERE class_name = '2nd' AND section = 'Earth';

-- 9) 2nd / Jupiter — Shalu
SET @u := (SELECT id FROM users WHERE username = '8595306882' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Shalu','8595306882',NULL,@pw,'teacher','8595306882',1,NOW(),NOW() WHERE @u IS NULL;
SET @u := COALESCE(@u, LAST_INSERT_ID());
INSERT INTO teachers (user_id, created_at, updated_at) SELECT @u,NOW(),NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = @u);
SET @t := (SELECT id FROM teachers WHERE user_id = @u LIMIT 1);
UPDATE classes SET class_teacher_id = @t WHERE class_name = '2nd' AND section = 'Jupiter';

-- 10) 3rd / Earth — Deepa
SET @u := (SELECT id FROM users WHERE username = '8377931772' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Deepa','8377931772',NULL,@pw,'teacher','8377931772',1,NOW(),NOW() WHERE @u IS NULL;
SET @u := COALESCE(@u, LAST_INSERT_ID());
INSERT INTO teachers (user_id, created_at, updated_at) SELECT @u,NOW(),NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = @u);
SET @t := (SELECT id FROM teachers WHERE user_id = @u LIMIT 1);
UPDATE classes SET class_teacher_id = @t WHERE class_name = '3rd' AND section = 'Earth';

-- 11) 3rd / Jupiter — Pooja Shah
SET @u := (SELECT id FROM users WHERE username = '9718282384' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Pooja Shah','9718282384',NULL,@pw,'teacher','9718282384',1,NOW(),NOW() WHERE @u IS NULL;
SET @u := COALESCE(@u, LAST_INSERT_ID());
INSERT INTO teachers (user_id, created_at, updated_at) SELECT @u,NOW(),NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = @u);
SET @t := (SELECT id FROM teachers WHERE user_id = @u LIMIT 1);
UPDATE classes SET class_teacher_id = @t WHERE class_name = '3rd' AND section = 'Jupiter';

-- 12) 4th — Palak Singh
SET @u := (SELECT id FROM users WHERE username = '9718798705' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Palak Singh','9718798705',NULL,@pw,'teacher','9718798705',1,NOW(),NOW() WHERE @u IS NULL;
SET @u := COALESCE(@u, LAST_INSERT_ID());
INSERT INTO teachers (user_id, created_at, updated_at) SELECT @u,NOW(),NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = @u);
SET @t := (SELECT id FROM teachers WHERE user_id = @u LIMIT 1);
UPDATE classes SET class_teacher_id = @t WHERE class_name = '4th' AND section = 'Earth';

-- 13) 5th — Kanchan
SET @u := (SELECT id FROM users WHERE username = '9650773568' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Kanchan','9650773568',NULL,@pw,'teacher','9650773568',1,NOW(),NOW() WHERE @u IS NULL;
SET @u := COALESCE(@u, LAST_INSERT_ID());
INSERT INTO teachers (user_id, created_at, updated_at) SELECT @u,NOW(),NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = @u);
SET @t := (SELECT id FROM teachers WHERE user_id = @u LIMIT 1);
UPDATE classes SET class_teacher_id = @t WHERE class_name = '5th' AND section = 'Earth';

-- 14) 6th — Sonam
SET @u := (SELECT id FROM users WHERE username = '9717753792' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Sonam','9717753792',NULL,@pw,'teacher','9717753792',1,NOW(),NOW() WHERE @u IS NULL;
SET @u := COALESCE(@u, LAST_INSERT_ID());
INSERT INTO teachers (user_id, created_at, updated_at) SELECT @u,NOW(),NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = @u);
SET @t := (SELECT id FROM teachers WHERE user_id = @u LIMIT 1);
UPDATE classes SET class_teacher_id = @t WHERE class_name = '6th' AND section = 'Earth';

-- 15) 7th — Pooja
SET @u := (SELECT id FROM users WHERE username = '7531082086' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Pooja','7531082086',NULL,@pw,'teacher','7531082086',1,NOW(),NOW() WHERE @u IS NULL;
SET @u := COALESCE(@u, LAST_INSERT_ID());
INSERT INTO teachers (user_id, created_at, updated_at) SELECT @u,NOW(),NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = @u);
SET @t := (SELECT id FROM teachers WHERE user_id = @u LIMIT 1);
UPDATE classes SET class_teacher_id = @t WHERE class_name = '7th' AND section = 'Earth';

-- 16) 8th — Arpana Bhardwaj
SET @u := (SELECT id FROM users WHERE username = '8920464597' LIMIT 1);
INSERT INTO users (name, username, email, password, role, phone, is_active, created_at, updated_at)
SELECT 'Arpana Bhardwaj','8920464597',NULL,@pw,'teacher','8920464597',1,NOW(),NOW() WHERE @u IS NULL;
SET @u := COALESCE(@u, LAST_INSERT_ID());
INSERT INTO teachers (user_id, created_at, updated_at) SELECT @u,NOW(),NOW()
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE user_id = @u);
SET @t := (SELECT id FROM teachers WHERE user_id = @u LIMIT 1);
UPDATE classes SET class_teacher_id = @t WHERE class_name = '8th' AND section = 'Earth';

COMMIT;

-- ── Verify ─────────────────────────────────────────────────────────────────
SELECT COUNT(*) AS teacher_count FROM users WHERE role = 'teacher' AND is_active = 1;

SELECT c.class_name, c.section, u.name AS class_teacher, u.username AS login_phone
FROM classes c
LEFT JOIN teachers t ON t.id = c.class_teacher_id
LEFT JOIN users u    ON u.id = t.user_id
ORDER BY c.id;
