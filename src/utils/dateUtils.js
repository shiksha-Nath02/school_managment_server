// =============================================================================
// DATE UTILITIES — business "today" in IST
// =============================================================================
// The schools run in India but the server clock may be UTC. Anything that means
// a *business* date ("today" for attendance, dashboards, etc.) must be computed
// in IST so it doesn't roll over at the wrong moment. (Row timestamps like
// created_at/updated_at stay UTC — those are managed by the DB, not this.)
//
// Mirrors the IST shift already used in feeController's currentMonthYear().
// =============================================================================

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// The moment `d`, shifted into IST wall-clock. Read its date parts with getUTC*.
function istDate(d = new Date()) {
  return new Date(d.getTime() + IST_OFFSET_MS);
}

// 'YYYY-MM-DD' for the given instant, in IST (defaults to now).
function istToday(d = new Date()) {
  const ist = istDate(d);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, '0');
  const day = String(ist.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Day of week in IST: 0 = Sunday … 6 = Saturday.
function istDayOfWeek(d = new Date()) {
  return istDate(d).getUTCDay();
}

module.exports = { istDate, istToday, istDayOfWeek };
