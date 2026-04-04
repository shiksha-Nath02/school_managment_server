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
- `src/migrations/` — 14 numbered Sequelize migrations (users, classes, teachers, students, timetable, attendance, marks, fees, inventory, expenses, etc.)
- `src/config/` — `config.js` (Sequelize CLI config), `database.js` (Sequelize instance)

**Database conventions:**
- Underscored column names (`created_at`, `updated_at`)
- Timestamps enabled globally
- Logging disabled by default

**Model relationships:**
- User 1:1 Student, User 1:1 Teacher
- Class 1:Many Students
- Teacher 1:Many Classes (as class_teacher)

**Auth flow:** Login returns a JWT (7-day expiry). Token sent as `Bearer <token>` in Authorization header. Passwords hashed with bcryptjs (10 rounds).

## Known Issues

- `bcryptjs`, `jsonwebtoken`, and `cors` are imported in code but **not listed in package.json** — they must be installed manually
- `package.json` main field points to `index.js` which doesn't exist
- No npm start/dev scripts defined
- Only admin routes are implemented; teacher and student role routes are not yet built
