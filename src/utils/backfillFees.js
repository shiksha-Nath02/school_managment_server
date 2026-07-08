/**
 * One-time (idempotent) fee-ledger backfill.
 *
 * Materializes fee_payments "no payment received yet" rows for every active
 * student, up to AND INCLUDING the current month, so that pending balances and
 * defaulters show up on the dashboard without anyone having to record a payment.
 *
 * Safe to run more than once: ensureBilledUpTo is idempotent (it starts from
 * each student's latest existing ledger row and locks the student row), so a
 * second run bills nothing new.
 *
 * Usage:
 *   node src/utils/backfillFees.js
 */
require('dotenv').config();
const sequelize = require('../config/database');
const { Student } = require('../models');
const { ensureBilledUpTo } = require('./feeEngine');
const { Op } = require('sequelize');

// Current month/year in IST (server may run on UTC).
const currentBillingPeriod = () => {
  const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return { month: nowIST.getUTCMonth() + 1, year: nowIST.getUTCFullYear() };
};

(async () => {
  const { month, year } = currentBillingPeriod();
  console.log(`\nBackfilling fee ledger up to ${String(month).padStart(2, '0')}/${year} (IST)\n`);

  try {
    const students = await Student.findAll({
      where: { status: { [Op.in]: ['active', 'promoted'] } },
      attributes: ['id'],
      order: [['id', 'ASC']]
    });
    console.log(`Active/promoted students: ${students.length}`);

    let billed = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < students.length; i++) {
      const st = students[i];
      try {
        const created = await ensureBilledUpTo(st.id, month, year);
        if (created) billed++; else skipped++;
      } catch (err) {
        failed++;
        console.error(`  student ${st.id}: ${err.message}`);
      }
      if ((i + 1) % 50 === 0) console.log(`  ...processed ${i + 1}/${students.length}`);
    }

    console.log(`\nDone. New rows created for: ${billed} | already current: ${skipped} | failed: ${failed}`);
  } catch (err) {
    console.error('Backfill failed:', err.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
})();
