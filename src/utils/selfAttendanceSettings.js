// In-memory per-day self-attendance toggle.
// Resets on server restart — that's fine, admin just re-enables if needed.
const settings = {};

function isEnabled(date) {
  return settings[date] === true;
}

function setEnabled(date, enabled) {
  settings[date] = Boolean(enabled);
}

module.exports = { isEnabled, setEnabled };
