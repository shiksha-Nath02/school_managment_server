const path = require("path");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const feeRoutes = require("./routes/fees");
const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');
const inventoryRoutes = require('./routes/inventory');
const uniformRoutes = require('./routes/uniform');
const bookRoutes = require('./routes/books');
const expenseRoutes = require('./routes/expenses');
const documentRoutes = require('./routes/documents');
const { authenticate, authorize } = require('./middlewares/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // allow base64 image uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Routes
// /api/auth is public (login); everything else is gated by role.
app.use("/api/auth", authRoutes);

const adminOnly = [authenticate, authorize("admin")];
app.use("/api/admin", adminOnly, adminRoutes);
app.use("/api/admin", adminOnly, feeRoutes);
app.use("/api/admin", adminOnly, inventoryRoutes);
app.use("/api/admin", adminOnly, uniformRoutes);
app.use("/api/admin", adminOnly, bookRoutes);
app.use("/api/admin", adminOnly, expenseRoutes);
app.use("/api/admin", adminOnly, documentRoutes);
app.use('/api/teacher', authenticate, authorize("teacher"), teacherRoutes);
app.use('/api/student', authenticate, authorize("student"), studentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
