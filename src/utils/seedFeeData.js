/**
 * SchoolDesk — Fee System Seed Script
 *
 * Creates:
 * - 1 Active Session (2026-27, starting April 2026)
 * - StudentFee records for all students (class-wise fees)
 * - Sample fee payments for April (mix of paid, partial, unpaid)
 * - Sample payment_log entries (fees + some expenses)
 *
 * Run: node src/utils/seedFeeData.js
 * Note: Run AFTER seedData.js (needs students, teachers, classes to exist)
 */

const {
  sequelize,
  Student,
  User,
  Class,
  Session,
  StudentFee,
  FeePayment,
  PaymentLog,
} = require('../models');

// ─────────────────────────────────────────
// FEE CONFIGURATION BY CLASS
// ─────────────────────────────────────────
const classFees = {
  '1': 1500,
  '2': 1800,
  '3': 2000,
  '4': 2200,
  '5': 2500
};

const seedFeeData = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // ──────────────────────────
    // 1. CREATE SESSION
    // ──────────────────────────
    console.log('📅 Creating session...');

    let session = await Session.findOne({ where: { name: '2026-27' } });

    if (session) {
      console.log('  ℹ️  Session 2026-27 already exists, using it');
    } else {
      await Session.update({ is_active: false }, { where: {} });

      session = await Session.create({
        name: '2026-27',
        start_month: 4,
        start_year: 2026,
        end_month: 3,
        end_year: 2027,
        excluded_months: [],
        fine_enabled: true,
        fine_per_day: 5,
        grace_period_days: 10,
        is_active: true,
        created_by: 1
      });
      console.log('  ✅ Session 2026-27 created (April 2026 – March 2027)');
      console.log('     Fine: ₹5/day after 10 days grace');
    }

    // ──────────────────────────
    // 2. SET STUDENT FEES
    // ──────────────────────────
    console.log('\n💰 Setting student fees...');

    const students = await Student.findAll({
      include: [
        { model: User, as: 'user', attributes: ['name'] },
        { model: Class, as: 'class', attributes: ['class_name', 'section'] }
      ]
    });

    let feeCount = 0;

    for (const student of students) {
      const existing = await StudentFee.findOne({
        where: { student_id: student.id, session_id: session.id }
      });

      if (existing) continue;

      const className = student.class?.class_name || '1';
      const monthlyFee = classFees[className] || 2000;

      let discount = 0;
      let discountReason = null;

      if (student.id % 10 === 0) {
        discount = 200;
        discountReason = 'Sibling discount';
      }
      if (student.id % 20 === 0) {
        discount = 500;
        discountReason = 'Merit scholarship';
      }

      await StudentFee.create({
        student_id: student.id,
        session_id: session.id,
        monthly_fee: monthlyFee,
        discount,
        discount_reason: discountReason
      });

      feeCount++;
    }

    console.log(`  ✅ ${feeCount} student fee records created`);
    console.log('  Fee structure:');
    Object.entries(classFees).forEach(([cls, fee]) => {
      console.log(`     Class ${cls}: ₹${fee}/month`);
    });

    // ──────────────────────────
    // 3. SEED SAMPLE PAYMENTS (April 2026)
    // ──────────────────────────
    console.log('\n💳 Creating sample payments for April 2026...');

    await PaymentLog.destroy({ where: {}, truncate: true });
    await FeePayment.destroy({ where: {}, truncate: true });
    console.log('  🗑️  Cleared existing fee_payments and payment_log rows');

    {
      let paidFull = 0;
      let paidPartial = 0;
      let unpaid = 0;
      let receiptCounter = 1;

      for (const student of students) {
        const className = student.class?.class_name || '1';
        const monthlyFee = classFees[className] || 2000;

        const feeConfig = await StudentFee.findOne({
          where: { student_id: student.id, session_id: session.id }
        });
        const discount = feeConfig ? parseFloat(feeConfig.discount) : 0;
        const effectiveFee = monthlyFee - discount;

        const pattern = student.id % 5;

        if (pattern === 0) {
          // ~20% — Paid full in April
          const receiptNum = `REC-202627-${String(receiptCounter++).padStart(4, '0')}`;
          await FeePayment.create({
            student_id: student.id,
            billing_month: 4,
            billing_year: 2026,
            amount_paid: effectiveFee,
            fine_amount: 0,
            pending_after: 0,
            payment_date: '2026-04-05',
            payment_method: 'cash',
            receipt_number: receiptNum,
            is_system_generated: false,
            is_reversal: false,
            received_by: 1
          });

          await PaymentLog.create({
            type: 'fees',
            direction: 'income',
            amount: effectiveFee,
            date: '2026-04-05',
            description: `Fee payment by ${student.user?.name} (Class ${className}) — ${receiptNum}`,
            reference_type: 'fee_payments',
            recorded_by: 1
          });

          paidFull++;

        } else if (pattern === 1 || pattern === 2) {
          // ~40% — Paid partial in April
          const partialAmount = Math.round(effectiveFee * 0.5);
          const pending = effectiveFee - partialAmount;
          const receiptNum = `REC-202627-${String(receiptCounter++).padStart(4, '0')}`;
          const payDate = pattern === 1 ? '2026-04-08' : '2026-04-10';
          const method = pattern === 1 ? 'upi' : 'cash';

          await FeePayment.create({
            student_id: student.id,
            billing_month: 4,
            billing_year: 2026,
            amount_paid: partialAmount,
            fine_amount: 0,
            pending_after: pending,
            payment_date: payDate,
            payment_method: method,
            receipt_number: receiptNum,
            is_system_generated: false,
            is_reversal: false,
            received_by: 1
          });

          await PaymentLog.create({
            type: 'fees',
            direction: 'income',
            amount: partialAmount,
            date: payDate,
            description: `Fee payment by ${student.user?.name} (Class ${className}) — ${receiptNum}`,
            reference_type: 'fee_payments',
            recorded_by: 1
          });

          paidPartial++;

        } else {
          // ~40% — Unpaid (gap row for April)
          await FeePayment.create({
            student_id: student.id,
            billing_month: 4,
            billing_year: 2026,
            amount_paid: 0,
            fine_amount: 0,
            pending_after: effectiveFee,
            payment_date: null,
            payment_method: null,
            receipt_number: null,
            is_system_generated: true,
            is_reversal: false,
            remarks: 'Auto-generated: no payment received',
            received_by: null
          });

          unpaid++;
        }
      }

      console.log(`  ✅ Payments created:`);
      console.log(`     Full paid:    ${paidFull} students`);
      console.log(`     Partial paid: ${paidPartial} students`);
      console.log(`     Unpaid:       ${unpaid} students`);

      // ──────────────────────────
      // 4. SEED SOME EXPENSES
      // ──────────────────────────
      console.log('\n📊 Creating sample expenses...');

      const expenses = [
        { type: 'stationery',   amount: 3500,  date: '2026-04-02', desc: 'Purchased chalk, markers, and whiteboard pens' },
        { type: 'pantry',       amount: 2200,  date: '2026-04-03', desc: 'Monthly pantry supplies — tea, sugar, biscuits' },
        { type: 'maintenance',  amount: 5000,  date: '2026-04-05', desc: 'AC servicing for 4 classrooms' },
        { type: 'electricity',  amount: 12000, date: '2026-04-07', desc: 'Electricity bill — March 2026' },
        { type: 'salary',       amount: 42000, date: '2026-04-01', desc: 'Salary — Mrs. Sunita Sharma (English)' },
        { type: 'salary',       amount: 44000, date: '2026-04-01', desc: 'Salary — Mr. Rajesh Kumar (Mathematics)' },
        { type: 'salary',       amount: 40000, date: '2026-04-01', desc: 'Salary — Mrs. Anita Verma (Hindi)' },
        { type: 'salary',       amount: 45000, date: '2026-04-01', desc: 'Salary — Mr. Deepak Singh (Science)' },
        { type: 'books',        amount: 8500,  date: '2026-04-04', desc: 'NCERT textbooks bulk order — Class 3 & 4' },
        { type: 'uniform',      amount: 4000,  date: '2026-04-06', desc: 'Uniform fabric order — winter batch' },
      ];

      for (const exp of expenses) {
        await PaymentLog.create({
          type: exp.type,
          direction: 'expenditure',
          amount: exp.amount,
          date: exp.date,
          description: exp.desc,
          recorded_by: 1
        });
      }

      console.log(`  ✅ ${expenses.length} expense entries created`);

      await PaymentLog.create({
        type: 'fine',
        direction: 'income',
        amount: 150,
        date: '2026-04-09',
        description: 'Late fee fine — 3 students',
        recorded_by: 1
      });

      console.log('  ✅ 1 fine income entry created');
    }

    // ──────────────────────────
    // 5. SUMMARY
    // ──────────────────────────
    const sessionCount = await Session.count();
    const feeConfigCount = await StudentFee.count();
    const paymentCount = await FeePayment.count();
    const logCount = await PaymentLog.count();

    const totalIncome = await PaymentLog.sum('amount', { where: { direction: 'income' } }) || 0;
    const totalExpenditure = await PaymentLog.sum('amount', { where: { direction: 'expenditure' } }) || 0;

    console.log('\n════════════════════════════════════════');
    console.log('  FEE SEED COMPLETE — SUMMARY');
    console.log('════════════════════════════════════════');
    console.log(`  Sessions:          ${sessionCount}`);
    console.log(`  Fee configs:       ${feeConfigCount}`);
    console.log(`  Fee payments:      ${paymentCount}`);
    console.log(`  Payment log:       ${logCount}`);
    console.log(`  Total Income:      ₹${totalIncome.toLocaleString()}`);
    console.log(`  Total Expenditure: ₹${totalExpenditure.toLocaleString()}`);
    console.log(`  Profit:            ₹${(totalIncome - totalExpenditure).toLocaleString()}`);
    console.log('════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Fee seed failed:', error);
    process.exit(1);
  }
};

seedFeeData();
