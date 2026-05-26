# School Management System — Backend API

Node.js + Express REST API for managing a school. Covers students, teachers, attendance (with photo verification), timetables, classwork, marks, fees, and inventory (pantry, stationery, books, uniform).

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **ORM:** Sequelize 6
- **Database:** MySQL
- **Auth:** JWT (jsonwebtoken) + bcryptjs for password hashing
- **File storage:** Local disk (`uploads/attendance/`) for attendance photos

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env` at the project root

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=school_db
DB_DIALECT=mysql
JWT_SECRET=your_secret_key
PORT=5000
```

### 3. Run database migrations

```bash
npx sequelize-cli db:migrate
```

### 4. (Optional) Seed initial data

```bash
node src/utils/seed.js
```

### 5. Start the server

```bash
# Plain node
node src/server.js

# With auto-reload
npx nodemon src/server.js
```

Server runs on `http://localhost:5000` by default.

Uploaded attendance photos are served statically at `http://localhost:5000/uploads/...`

---

## Authentication

All login sessions use JWT tokens.

### Login

```
POST /api/auth/login
Body: { "email": "...", "password": "..." }
```

Returns a token valid for 7 days. Send it as a header on protected requests:

```
Authorization: Bearer <token>
```

### Get current user

```
GET /api/auth/me
```

**Notes:**
- Default student password (when added by admin): `student123`
- Default teacher password (when added by admin): `teacher123`
- Removed/deactivated users cannot log in.

---

## Roles

| Role | Description |
|------|-------------|
| `admin` | Full access — manages students, teachers, fees, inventory, attendance |
| `teacher` | Can mark student attendance, enter marks, manage classwork/timetable, view own attendance |
| `student` | Read-only — views own attendance, timetable, homework, results, fees |

---

## API Reference

All admin routes are under `/api/admin`, teacher routes under `/api/teacher`, and student routes under `/api/student`.

---

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/students` | List all students. Filter by `?class_id=` or search by `?search=name` |
| `POST` | `/api/admin/students` | Add a new student (creates user account + student profile) |
| `GET` | `/api/admin/students/:id` | Get a single student's details |
| `PUT` | `/api/admin/students/:id` | Update student info (name, email, class, roll number, address, etc.) |
| `DELETE` | `/api/admin/students/:id` | Soft-remove student — marks as `inactive`, blocks login |

**Add student body:**
```json
{
  "name": "Ravi Kumar",
  "email": "ravi@school.com",
  "phone": "9876543210",
  "password": "optional_custom_password",
  "class_id": 3,
  "roll_number": 12,
  "date_of_birth": "2010-04-15",
  "address": "123 Main St",
  "admission_date": "2024-06-01"
}
```

#### Student Profile Sub-routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/students/:id/attendance` | Monthly attendance breakdown for a student. Query: `?month=5&year=2026` |
| `GET` | `/api/admin/students/:id/marks` | All exam results grouped by exam type |
| `GET` | `/api/admin/students/:id/fees` | Complete fee history with paid/outstanding summary |
| `GET` | `/api/admin/students/:id/inventory` | Inventory items issued or sold to this student |

---

### Teachers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/teachers` | List all active teachers |
| `POST` | `/api/admin/teachers` | Add a new teacher (creates user account + teacher profile) |
| `PUT` | `/api/admin/teachers/:id` | Update teacher info (name, email, subject, salary, etc.) |
| `DELETE` | `/api/admin/teachers/:id` | Soft-remove teacher — blocks login, hides from listings |

**Add teacher body:**
```json
{
  "name": "Priya Sharma",
  "email": "priya@school.com",
  "phone": "9876500001",
  "password": "optional_custom_password",
  "subject": "Mathematics",
  "salary": 35000,
  "joining_date": "2023-07-01"
}
```

#### Teacher Profile Sub-routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/teachers/:id/attendance` | Monthly attendance history for a specific teacher. Query: `?month=5&year=2026` |
| `GET` | `/api/admin/teachers/:id/classes` | Homeroom classes + timetable periods taught by this teacher |

---

### Classes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/classes` | List all classes (id, class_name, section) |

---

### Teacher Attendance

Teachers check in/out via the admin panel with a camera photo capture. Admin can also optionally enable self check-in for a day so teachers can record attendance from their own devices.

#### Admin-managed attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/teacher-attendance?date=YYYY-MM-DD` | Get all records for a date (includes photo URLs and verification status) |
| `POST` | `/api/admin/teacher-attendance/check-in` | Check in a teacher — captures photo, auto-detects late if after 9:30 AM |
| `POST` | `/api/admin/teacher-attendance/check-out` | Check out a teacher — captures photo, auto-detects half-day if under 4 hours |
| `POST` | `/api/admin/teacher-attendance/mark-status` | Manually mark absent / on leave / official duty (no photo required) |
| `POST` | `/api/admin/teacher-attendance/bulk-absent` | Mark all teachers without a record as absent for a date |
| `PUT` | `/api/admin/teacher-attendance/:id` | Edit an existing attendance record |
| `GET` | `/api/admin/teacher-attendance/summary?month=5&year=2026` | Monthly summary per teacher (present/absent/late/leave counts) |
| `POST` | `/api/admin/teacher-attendance/:id/verify` | Verify a teacher's photo-based attendance record |

**Check-in body:**
```json
{
  "teacherId": 3,
  "image_base64": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Check-out body:**
```json
{
  "teacherId": 3,
  "image_base64": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

`image_base64` is optional — admin can check in/out without a photo if the camera is unavailable.

**Record response shape:**
```json
{
  "id": 12,
  "teacherId": 3,
  "date": "2026-05-26",
  "status": "present",
  "checkInTime": "09:15:00",
  "checkInImage": "uploads/attendance/checkin_3_2026-05-26.jpg",
  "checkOutTime": "17:00:00",
  "checkOutImage": "uploads/attendance/checkout_3_2026-05-26.jpg",
  "isVerified": false,
  "verifiedAt": null
}
```

Photos are accessible at `http://localhost:5000/<checkInImage>`.

**Statuses:** `present`, `late`, `half_day`, `absent`, `on_leave`, `official_duty`

#### Self-attendance setting

Admin can toggle whether teachers are allowed to self-record on a given day. This setting resets on server restart (in-memory).

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/settings/self-attendance?date=YYYY-MM-DD` | Check whether self check-in is enabled for a date (defaults to today) |
| `POST` | `/api/admin/settings/self-attendance` | Enable or disable teacher self check-in for a date |

**Toggle body:**
```json
{
  "enabled": true,
  "date": "2026-05-26"
}
```

#### Teacher self check-in (when enabled by admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/teacher/self-checkin` | Teacher checks themselves in — blocked with 403 if self-attendance is not enabled today |
| `POST` | `/api/teacher/self-checkout` | Teacher checks themselves out — same gate |

Self check-in/out records are created with `is_verified: false` and appear in the admin panel for review and verification.

**Body (same for both):**
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

---

### Student Attendance (Teacher-side)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/teacher/attendance` | Submit attendance for a class on a date |
| `GET` | `/api/teacher/attendance/:classId?date=YYYY-MM-DD` | Check if attendance already submitted for a class |
| `GET` | `/api/teacher/my-attendance?month=5&year=2026` | Teacher views their own attendance history |

**Submit attendance body:**
```json
{
  "classId": 2,
  "date": "2026-05-26",
  "records": [
    { "studentId": 1, "status": "present" },
    { "studentId": 2, "status": "absent" }
  ]
}
```

**Student views own attendance:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/student/attendance?month=5&year=2026` | Monthly attendance records |
| `GET` | `/api/student/attendance/summary` | Full-year summary with monthly breakdown |

---

### Timetable

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/teacher/timetable/:classId` | Get class timetable (8 periods x Mon-Sat) |
| `PUT` | `/api/teacher/timetable/:classId` | Update timetable (only changed entries are saved) |
| `GET` | `/api/student/timetable` | Student views their own class timetable |

---

### Classwork & Homework

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/teacher/class-tasks/form-data/:classId?date=YYYY-MM-DD` | Get timetable subjects pre-filled for entry form |
| `POST` | `/api/teacher/class-tasks` | Save classwork/homework for the day |
| `GET` | `/api/student/class-tasks?date=YYYY-MM-DD` | Student views today's tasks |
| `GET` | `/api/student/class-tasks/week?startDate=YYYY-MM-DD` | Student views a full week of tasks |

---

### Marks & Results

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/teacher/marks/subjects/:classId` | List subjects for a class |
| `GET` | `/api/teacher/marks/exam-types/:classId` | List exam types with their subjects |
| `GET` | `/api/teacher/marks/:classId?exam_type=&subject=` | Get marks entered for a class |
| `POST` | `/api/teacher/marks` | Save/update marks (bulk upsert) |
| `GET` | `/api/student/results?exam_type=` | Student views own results with rank, percentile, grade, class average |

---

### Fee Sessions

A session represents an academic year. Each session defines which months fees are due and the fee amount per student.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/sessions` | List all sessions |
| `GET` | `/api/admin/sessions/active` | Get the currently active session |
| `GET` | `/api/admin/sessions/:id` | Get session details with student fee configs |
| `POST` | `/api/admin/sessions` | Create a new session |
| `PUT` | `/api/admin/sessions/:id/fees` | Update student fees for a session (triggers recalculation of pending dues) |
| `POST` | `/api/admin/sessions/:id/promote` | Promote students to the next class |

**Create session body:**
```json
{
  "name": "2025-2026",
  "start_month": 4,
  "start_year": 2025,
  "end_month": 3,
  "end_year": 2026,
  "excluded_months": ["12", "1"],
  "fine_enabled": true,
  "fine_per_day": 5,
  "grace_period_days": 10,
  "is_active": true,
  "default_monthly_fee": 1500
}
```

---

### Fee Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/fees/dues?class_id=&sort=` | Students with pending dues |
| `GET` | `/api/admin/fees/classwise?session_id=` | Class-wise fee collection report |
| `GET` | `/api/admin/fees/student/:id` | Complete fee history for a student |
| `POST` | `/api/admin/fees/pay` | Record a single payment (supports backdating, auto fine calculation) |
| `POST` | `/api/admin/fees/bulk-pay` | Record payments for multiple students at once |
| `POST` | `/api/admin/fees/reverse/:id` | Reverse a payment entry (creates a reversal record) |
| `GET` | `/api/student/fee-history` | Student views their own payment history |

**Key features of the fee engine:**
- Automatically calculates fine based on grace period and daily rate
- Supports backdated payments with chain recalculation
- Generates gap rows for skipped months
- Unique receipt numbers per session (e.g. `REC-2526-0001`)
- Reversals are tracked separately without deleting the original record

---

### Accounting / Payment Log

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/payment-log?type=&direction=&start_date=&end_date=` | View ledger entries |
| `POST` | `/api/admin/payment-log` | Add a manual ledger entry (e.g. salary paid, misc expense) |
| `GET` | `/api/admin/profit?month=&year=&session_id=` | Profit/loss report for a period |

---

### Inventory — Pantry, Stationery, Books, Uniform

Tracks stock levels for all physical items the school manages, with a full purchase/sale/distribution history. Stock-out transactions can be linked to a specific student.

**Categories:** `pantry` · `stationary` · `books` · `uniform`

#### Item Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/inventory` | List all items. Filter by `?category=pantry` |
| `POST` | `/api/admin/inventory` | Add a new item |
| `PUT` | `/api/admin/inventory/:id` | Update item name, category, price, or description |
| `DELETE` | `/api/admin/inventory/:id` | Delete an item |

**Add item body:**
```json
{
  "item_name": "A4 Notebook",
  "category": "stationary",
  "quantity": 50,
  "price": 35.00,
  "description": "200 pages, ruled"
}
```

#### Stock Movement

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/inventory/:id/stock-in` | Record a purchase — increases stock |
| `POST` | `/api/admin/inventory/:id/stock-out` | Record a sale or distribution — decreases stock |

**Stock-in body (purchase):**
```json
{
  "quantity": 100,
  "unit_price": 30.00,
  "reference_note": "Purchased from Sharma Stationery",
  "date": "2026-05-26"
}
```

**Stock-out body:**
```json
{
  "type": "sale",
  "quantity": 5,
  "unit_price": 35.00,
  "reference_note": "Sold to Ravi Kumar",
  "date": "2026-05-26",
  "student_id": 12
}
```

- `type` is `sale` (charged to someone) or `distribute` (given out free / internally)
- `student_id` is optional — links the transaction to a student for per-student purchase history
- Stock-out is blocked if quantity would go below zero

#### Transaction History & Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/inventory/:id/transactions` | Full stock history for one item |
| `GET` | `/api/admin/inventory/transactions` | All transactions. Filter by `?category=&type=&start_date=&end_date=` |
| `GET` | `/api/admin/inventory/report` | Stock report grouped by category with total inventory value |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Core accounts for admin, teacher, student. `is_active` flag used for soft removal |
| `teachers` | Teacher profile linked to user (subject, salary, joining date) |
| `students` | Student profile linked to user and class (roll number, DOB, address, status) |
| `classes` | Class definitions with section and assigned class teacher |
| `attendance` | Student daily attendance per class |
| `teacher_attendance` | Teacher check-in/out with photo paths (`check_in_image`, `check_out_image`), verification status (`is_verified`, `verified_at`), and leave records |
| `timetable` | Class timetable — 8 periods across Mon to Sat |
| `class_tasks` | Daily classwork/homework per class stored as JSON per period |
| `marks` | Exam marks per student per subject per exam type |
| `sessions` | Academic year sessions with fee configuration and billing months |
| `student_fees` | Monthly fee amount and discount per student per session |
| `fee_payments` | Payment transaction ledger with receipt numbers and reversal support |
| `payment_log` | General income/expenditure accounting ledger |
| `inventory` | Stock items categorised as pantry, stationery, books, or uniform |
| `inventory_transactions` | Purchase, sale, and distribution history per inventory item. `student_id` FK links stock-out entries to a specific student |

---

## Project Structure

```
src/
├── app.js                    # Express app — mounts all routes, serves /uploads statically
├── server.js                 # Entry point — starts HTTP server
├── config/
│   ├── database.js           # Sequelize instance
│   └── config.js             # Sequelize CLI config (reads .env)
├── migrations/               # 29 numbered migration files
│   ├── ...                   # (001–027) core schema
│   ├── 028-add-student-id-to-inventory-transactions.js
│   └── 029-add-photo-verify-to-teacher-attendance.js
├── models/
│   ├── index.js              # Loads all models and sets associations
│   ├── User.js
│   ├── Student.js
│   ├── Teacher.js
│   ├── Class.js
│   ├── Attendance.js
│   ├── TeacherAttendance.js  # Includes photo paths and verification fields
│   ├── Timetable.js
│   ├── ClassTask.js
│   ├── Mark.js
│   ├── Session.js
│   ├── StudentFee.js
│   ├── FeePayment.js
│   ├── PaymentLog.js
│   ├── Inventory.js
│   └── InventoryTransaction.js  # Includes student_id FK
├── controllers/
│   ├── authController.js
│   ├── adminController.js    # Students, teachers, teacher attendance + photo, profile sub-routes, self-attendance setting
│   ├── feeController.js      # Payments, dues, reports
│   ├── sessionController.js  # Academic sessions, student promotion
│   ├── teacherController.js  # Student attendance marking, teacher self check-in/out with photo
│   ├── studentController.js  # Student attendance views
│   ├── timetableController.js
│   ├── classTaskController.js
│   ├── marksController.js
│   └── inventoryController.js
├── routes/
│   ├── auth.js
│   ├── admin.js              # Includes /settings/self-attendance and profile sub-routes
│   ├── fees.js
│   ├── teacher.js            # Includes /self-checkin and /self-checkout (guarded by setting)
│   ├── student.js
│   └── inventory.js
├── middlewares/
│   └── auth.js               # JWT authenticate + role authorize
└── utils/
    ├── feeEngine.js          # Fee calculation, fine logic, gap generation
    ├── imageHelper.js        # Saves base64 images to uploads/attendance/
    ├── selfAttendanceSettings.js  # In-memory per-day self check-in toggle
    └── seed.js               # Database seeder

uploads/
└── attendance/               # Stored check-in/out JPEG photos (auto-created)
```

---

## Important Notes

- **Auth middleware is currently disabled** for development — all routes are open. Wire `authenticate` and `authorize` from `middlewares/auth.js` in each route file before going to production.
- The `/api/teacher` and `/api/student` route files temporarily inject the first user of that role from the DB as `req.user`. Replace this with real JWT middleware before going live.
- All **remove operations are soft deletes** — data is preserved for historical records (attendance, marks, fees) but the account is deactivated and the user cannot log in.
- **Self-attendance setting is in-memory** — it resets on server restart. Admin must re-enable it each day if needed. This is intentional; most days the admin manages check-in/out directly.
- **Photo upload limit** is set to 10 MB in `app.js` (`express.json({ limit: '10mb' })`). Base64 JPEGs at 640×480 are typically 40–80 KB.
- Migrations must be run in order. Never edit a migration file that has already been applied to the database — create a new one instead.
