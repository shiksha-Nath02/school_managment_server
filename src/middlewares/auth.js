// Auth disabled for development — both middleware are no-ops
const authenticate = (req, res, next) => next();
const authorize = (...roles) => (req, res, next) => next();

module.exports = { authenticate, authorize };
