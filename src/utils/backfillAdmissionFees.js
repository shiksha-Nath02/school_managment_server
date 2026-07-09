/**
 * One-time (idempotent) admission-fee backfill for the ACTIVE session.
 *
 * Sets the session's annual admission charge, then gives every active/promoted
 * student an admission_fees row marked assumed_paid = true (i.e. treated as
 * already settled before tracking began — their April money — so it is NOT
 * counted in profit). New students added later start pending (assumed_paid=false).
 *
 * Safe to re-run: students that already have a row for the session are skipped.
 *
 * Usage:
 *   node src/utils/backfillAdmissionFees.js [annualCharge]
 *   e.g. node src/utils/backfillAdmissionFees.js 4000
 */
require('dotenv').config();
const sequelize = require('../config/database');
const { Session, Student, AdmissionFee } = require('../models');
const { Op } = require('sequelize');

const ANNUAL_CHARGE = parseFloat(process.argv[2]) || 4000;

(async () => {
  try {
    const session = await Session.findOne({ where: { is_active: true } });
    if (!session) { console.error('No active session found. Aborting.'); process.exitCode = 1; return; }

    // Set the session's annual admission charge (so new students inherit it).
    await session.update({ admission_fee: ANNUAL_CHARGE });
    console.log(`Active session: ${session.name} — admission charge set to ${ANNUAL_CHARGE}`);

    const students = await Student.findAll({
      where: { status: { [Op.in]: ['active', 'promoted'] } },
      attributes: ['id'],
      order: [['id', 'ASC']],
    });
    console.log(`Active/promoted students: ${students.length}`);

    let created = 0, skipped = 0;
    for (const st of students) {
      const [, wasCreated] = await AdmissionFee.findOrCreate({
        where: { student_id: st.id, session_id: session.id },
        defaults: {
          student_id: st.id,
          session_id: session.id,
          annual_charge: ANNUAL_CHARGE,
          discount: 0,
          paid_amount: 0,
          assumed_paid: true, // existing students: treated as paid before tracking
        },
      });
      if (wasCreated) created++; else skipped++;
    }

    console.log(`\nDone. Created (assumed paid): ${created} | already had a row: ${skipped}`);
  } catch (err) {
    console.error('Backfill failed:', err.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
})();
