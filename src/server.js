// Pin the process to IST so date/time logic (attendance check-in, late
// detection, dashboard "today") is correct regardless of the host clock (EC2
// defaults to UTC). Must run before any Date is created.
process.env.TZ = process.env.TZ || "Asia/Kolkata";

require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./models");
const selfAttendanceSettings = require("./utils/selfAttendanceSettings");

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    // Restore persisted settings (e.g. the self-attendance toggle) from the DB.
    await selfAttendanceSettings.load();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
