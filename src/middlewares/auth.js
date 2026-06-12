const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Verifies the Bearer JWT, loads the user, and attaches it to req.user.
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findByPk(payload.id);
    if (!user || !user.is_active) {
      return res.status(401).json({ message: "Account not found or inactive" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authenticate error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Guards a route to one or more roles. Use after authenticate.
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: insufficient permissions" });
  }
  next();
};

module.exports = { authenticate, authorize };
