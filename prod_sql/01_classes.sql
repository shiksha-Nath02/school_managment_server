-- ============================================================
-- Sant RLD Public School — Production data load
-- Step 01: Classes (16 classes / sections)
-- Run in MySQL Workbench against the PROD database.
-- class_teacher_id is left NULL; it gets assigned after teachers are loaded.
-- ============================================================

INSERT INTO classes (class_name, section, created_at, updated_at) VALUES
  ('Nursery', 'Ankur',   NOW(), NOW()),
  ('Nursery', 'Pallav',  NOW(), NOW()),
  ('LKG',     'Ankur',   NOW(), NOW()),
  ('UKG',     'Ankur',   NOW(), NOW()),
  ('UKG',     'Pallav',  NOW(), NOW()),
  ('1st',     'Earth',   NOW(), NOW()),
  ('1st',     'Jupiter', NOW(), NOW()),
  ('2nd',     'Earth',   NOW(), NOW()),
  ('2nd',     'Jupiter', NOW(), NOW()),
  ('3rd',     'Earth',   NOW(), NOW()),
  ('3rd',     'Jupiter', NOW(), NOW()),
  ('4th',     'Earth',   NOW(), NOW()),
  ('5th',     'Earth',   NOW(), NOW()),
  ('6th',     'Earth',   NOW(), NOW()),
  ('7th',     'Earth',   NOW(), NOW()),
  ('8th',     'Earth',   NOW(), NOW());

-- Verify
SELECT id, class_name, section, class_teacher_id FROM classes ORDER BY id;
