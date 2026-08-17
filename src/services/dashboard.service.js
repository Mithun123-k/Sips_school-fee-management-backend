const repository = require("../repositories/dashboard.repository");

// =====================================
// Admin Dashboard
// =====================================

exports.getAdminDashboard = async () => {
  return await repository.getAdminDashboard();
};

// =====================================
// Receptionist Dashboard
// =====================================

exports.getReceptionistDashboard = async (userId) => {
  return await repository.getReceptionistDashboard(userId);
};

// =====================================
// Recent Transactions
// =====================================

exports.getRecentTransactions = async () => {
  return await repository.recentTransactions();
};

// =====================================
// Top Due Students
// =====================================

exports.getTopDueStudents = async () => {
  return await repository.topDueStudents();
};

// =====================================
// Monthly Collection
// =====================================

exports.getMonthlyCollection = async () => {
  return await repository.monthlyCollection();
};

// =====================================
// Payment Mode Summary
// =====================================

exports.getPaymentModeSummary = async () => {
  return await repository.paymentModeSummary();
};

// =====================================
// Class Wise Collection
// =====================================

exports.getClassWiseCollection = async () => {
  return await repository.classWiseCollection();
};