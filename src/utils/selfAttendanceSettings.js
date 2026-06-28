// Per-day self-attendance toggle, persisted in the app_settings table so it
// survives server restarts. An in-memory cache keeps isEnabled()/setEnabled()
// synchronous for existing callers; the DB is hydrated on boot (load()) and
// written through on every change.

const KEY = 'self_attendance_days';
const cache = {}; // { 'YYYY-MM-DD': true }

// Hydrate the cache from the DB. Call once on server startup (after DB connect).
async function load() {
  try {
    const AppSetting = require('../models/AppSetting');
    const row = await AppSetting.findOne({ where: { setting_key: KEY } });
    if (row && row.setting_value) {
      const parsed = JSON.parse(row.setting_value);
      for (const k of Object.keys(cache)) delete cache[k];
      Object.assign(cache, parsed);
    }
  } catch (e) {
    console.error('Failed to load self-attendance settings:', e.message);
  }
}

function isEnabled(date) {
  return cache[date] === true;
}

function setEnabled(date, enabled) {
  cache[date] = Boolean(enabled);
  persist(); // fire-and-forget; cache is already updated for this request
}

async function persist() {
  try {
    const AppSetting = require('../models/AppSetting');
    await AppSetting.upsert({ setting_key: KEY, setting_value: JSON.stringify(cache) });
  } catch (e) {
    console.error('Failed to persist self-attendance settings:', e.message);
  }
}

module.exports = { isEnabled, setEnabled, load };
