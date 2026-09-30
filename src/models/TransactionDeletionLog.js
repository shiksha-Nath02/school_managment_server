const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Audit trail for hard-deleted ledger transactions. When a payment is deleted it
// is physically removed from its source table (e.g. fee_payments) — this row is the
// only surviving record of it: what it was, who deleted it (deleted_by), when
// (created_at) and why (reason). Surfaced read-only in the Transactions tab.
const TransactionDeletionLog = sequelize.define('TransactionDeletionLog', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  // What kind of ledger row was deleted, e.g. 'fee_payment'.
  source:       { type: DataTypes.STRING(40), allowNull: false },
  // The ledger id it corresponded to (e.g. 'fee_123'), for cross-reference.
  ledger_ref:   { type: DataTypes.STRING(64), allowNull: true },
  amount:       { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  // The original transaction's date (payment_date), not the deletion date.
  txn_date:     { type: DataTypes.DATEONLY, allowNull: true },
  // Human-readable snapshot of the deleted transaction (student, month, receipt…).
  description:  { type: DataTypes.TEXT, allowNull: true },
  student_id:   { type: DataTypes.INTEGER, allowNull: true },
  student_name: { type: DataTypes.STRING(150), allowNull: true },
  reason:       { type: DataTypes.TEXT, allowNull: true },
  deleted_by:   { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'transaction_deletion_logs',
  timestamps: true,   // created_at = when the deletion happened
  underscored: true,
});

module.exports = TransactionDeletionLog;
