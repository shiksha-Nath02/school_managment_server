const path = require("path");

// Load the environment file matching NODE_ENV. Production reads .env.production
// so prod credentials stay separate from local .env. dotenv does not override
// vars already present in the environment.
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env";
require("dotenv").config({ path: path.resolve(__dirname, "../../", envFile) });

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
  },
};
