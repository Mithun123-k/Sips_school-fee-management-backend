const asyncHandler = require("../helpers/asyncHandler");
const sendResponse = require("../utils/response");

const dashboardService = require("../services/dashboard.service");

// =====================================
// Admin Dashboard
// =====================================

exports.getAdminDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getAdminDashboard();

  return sendResponse(
    res,
    200,
    true,
    "Admin dashboard fetched successfully",
    data
  );
});

// =====================================
// Receptionist Dashboard
// =====================================

exports.getReceptionistDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getReceptionistDashboard(
    req.user.id
  );

  return sendResponse(
    res,
    200,
    true,
    "Receptionist dashboard fetched successfully",
    data
  );
});

// =====================================
// Recent Transactions
// =====================================

exports.getRecentTransactions = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRecentTransactions();

  return sendResponse(
    res,
    200,
    true,
    "Recent transactions fetched successfully",
    data
  );
});

// =====================================
// Top Due Students
// =====================================

exports.getTopDueStudents = asyncHandler(async (req, res) => {
  const data = await dashboardService.getTopDueStudents();

  return sendResponse(
    res,
    200,
    true,
    "Top due students fetched successfully",
    data
  );
});

// =====================================
// Monthly Collection
// =====================================

exports.getMonthlyCollection = asyncHandler(async (req, res) => {
  const data = await dashboardService.getMonthlyCollection();

  return sendResponse(
    res,
    200,
    true,
    "Monthly collection fetched successfully",
    data
  );
});

// =====================================
// Payment Mode Summary
// =====================================

exports.getPaymentModeSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getPaymentModeSummary();

  return sendResponse(
    res,
    200,
    true,
    "Payment mode summary fetched successfully",
    data
  );
});

// =====================================
// Class Wise Collection
// =====================================

exports.getClassWiseCollection = asyncHandler(async (req, res) => {
  const data = await dashboardService.getClassWiseCollection();

  return sendResponse(
    res,
    200,
    true,
    "Class wise collection fetched successfully",
    data
  );
});