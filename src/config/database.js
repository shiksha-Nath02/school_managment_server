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
    // Allow enough concurrent connections that report endpoints which fan out
    // per-student work (dues, class-wise) don't starve interactive writes like
    // bulk fee entry. `acquire` is generous so a busy pool waits rather than
    // throwing ConnectionAcquireTimeoutError and silently dropping a payment.
    pool: { max: 20, min: 0, acquire: 60000, idle: 10000 },
    // Auto-retry transient failures (pool-acquire timeouts, deadlocks, dropped
    // connections) instead of surfacing them as a hard error to the caller.
    retry: {
      max: 3,
      match: [
        /SequelizeConnectionAcquireTimeoutError/,
        /ConnectionAcquireTimeoutError/,
        /Deadlock/i,
        /ER_LOCK_DEADLOCK/,
        /ETIMEDOUT/,
        /ECONNRESET/,
        /PROTOCOL_CONNECTION_LOST/,
      ],
    },
    define: {
      underscored: true,
      timestamps: true,
    },
  }
);

module.exports = sequelize;