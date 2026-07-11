const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false,
    // Allow a handful of concurrent connections so report endpoints that fan
    // out per-student work (dues, class-wise) aren't throttled to the default 5.
    pool: { max: 12, min: 0, acquire: 30000, idle: 10000 },
    define: {
      underscored: true,
      timestamps: true,
    },
  }
);

module.exports = sequelize;