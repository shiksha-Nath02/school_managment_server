# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Node.js/Express 5 REST API for a school management system. Uses Sequelize ORM with MySQL. JWT-based authentication with role-based authorization (admin, teacher, student).

## Commands

```bash
# Run server (no npm scripts configured)
node src/server.js

# Run with auto-reload
npx nodemon src/server.js

# Run Sequelize migrations
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo

# Seed the database
node src/utils/seed.js

# Install dependencies (bcryptjs, jsonwebtoken, cors are used but missing from package.json)
npm install
```

No test framework is configured.

## Environment Variables

Required in `.env` at project root:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — MySQL connection
- `DB_DIALECT` — defaults to `mysql`
- `JWT_SECRET` — signing key for JWT tokens
- `PORT` — defaults to 5000

## Architecture

**Pattern:** MVC-style with routes → middleware → controllers → models → MySQL

**Entry points:**
- `src/server.js` — boots dotenv, connects Sequelize, starts HTTP server
- `src/app.js` — Express app setup, mounts routes under `/api/auth` and `/api/admin`

**Key directories:**
- `src/models/` — Sequelize model definitions; `index.js` sets up associations
- `src/controllers/` — business logic (authController, adminController)
- `src/routes/` — Express routers
- `src/middlewares/auth.js` — `authenticate` (JWT verification) and `authorize(...roles)` (role guard)
- `src/migrations/` — numbered Sequelize migrations through **049** (users, classes, teachers, students, timetable, attendance, marks, fees, inventory, uniform, books, expenses, app_settings, staff, enquiries, etc.). Always add the next number; never edit an applied migration.
- `src/config/` — `config.js` (Sequelize CLI config), `database.js` (Sequelize instance)

**Route mounting (`app.js`):** `/api/auth` and `/api/public` are unauthenticated; everything under `/api/admin` is wrapped by `adminOnly = [authenticate, authorize("admin","superadmin")]`; `/api/teacher` and `/api/student` are guarded by their role. Do NOT add a second `authorize(...)` inside a route file mounted under `adminOnly` — it silently re-narrows the role (this caused a superadmin 403 on expenses). Role is applied once at the mount.

**Database conventions:**
- Underscored column names (`created_at`, `updated_at`)
- Timestamps enabled globally
- Logging disabled by default

**Model relationships:**
- User 1:1 Student, User 1:1 Teacher (students & teachers always get a `users` row for login)
- Class 1:Many Students; Teacher 1:Many Classes (as class_teacher)
- `Staff` (non-teaching staff) has **no** user/login — payroll only
- Uniform/Book transactions carry a nullable `student_id` FK (the sale links to a student)
- Salary payments are rows in `expenses` with a `teacher_id` OR `staff_id` payee + `gross_amount`/`deduction`

**Identity keys:** a student logs in with `users.username`, which mirrors `students.admission_number`. Editing the admission number syncs `users.username` (uniqueness-checked). The auto-increment `students.id` is an internal PK, NOT the admission number — never match one against the other.

**Auth flow:** Login returns a JWT (7-day expiry). Token sent as `Bearer <token>` in Authorization header. Passwords hashed with bcryptjs (10 rounds). Student default password = birth-year + first 4 letters of name (e.g. `2018arya`).

## Feature areas

- **Students / Teachers** — CRUD with full profiles; PEN number + APAAR ID on students; editable admission number (username sync); per-teacher `can_edit_students` flag lets a class teacher edit her own students.
- **Attendance** — student attendance (teacher-marked) + teacher self check-in with photo, gated by a per-day toggle persisted in `app_settings` (survives restarts; cache hydrated on boot via `selfAttendanceSettings.load()` in `server.js`).
- **Inventory / Uniform / Books** — items with stock + sales (transactions) with partial-payment dues; sales link to a student (`student_id`); students see them via `GET /api/student/purchases`.
- **Expenditure** — single `expenses` ledger; reasons: `stationary`, `pantry`, `inventory`, `salary`, `other`. **Salary** payments select a teacher/staff payee, prefill the configured salary, and store gross + deduction. Profit & Dashboard total ALL expense reasons (so salary/inventory count once — never double-enter salary elsewhere).
- **Fees** — sessions, monthly fees, payments, dues, profit report.
- **Public website APIs** (`/api/public`, unauthenticated) — `POST /enquiry` (prospective student/teacher) + admin Enquiries tab; `GET /birthdays` (today's student + teacher birthdays, IST).

## Multi-tenancy / deployment

Each school = its own MySQL DB + its own PM2 process on a different port, sharing one EC2 + one built frontend (themed by hostname). Live: `sant_RLD` (PM2 `sant-RLD`:5000) and `idealradiant` (PM2 `idealradiant`:5001). After merging schema changes, run `npx sequelize-cli db:migrate` in **each** backend dir (own `.env` → own DB) before `pm2 restart`. Full infra/secrets in `AWSreadme.md`; onboarding a school in `onboard.md`.

## Known Issues / Notes

- `bcryptjs`, `jsonwebtoken`, `cors` may need manual `npm install` if missing from package.json.
- No npm start/dev scripts; run `node src/server.js`.
- No automated test framework.
- `prod_sql/` (one-off data-load scripts) is git-ignored.
