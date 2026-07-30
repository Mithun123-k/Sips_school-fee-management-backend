const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const dashboardController = require("../controllers/dashboard.controller");

// ===============================
// Admin Dashboard
// ===============================

router.get(
  "/admin",
  auth,
  authorize("ADMIN"),
  dashboardController.getAdminDashboard
);

// ===============================
// Receptionist Dashboard
// ===============================

router.get(
  "/receptionist",
  auth,
  authorize("ADMIN", "RECEPTIONIST"),
  dashboardController.getReceptionistDashboard
);

// ===============================
// Recent Transactions
// ===============================

router.get(
  "/recent-transactions",
  auth,
  authorize("ADMIN"),
  dashboardController.getRecentTransactions
);

// ===============================
// Top Due Students
// ===============================

router.get(
  "/top-due-students",
  auth,
  authorize("ADMIN"),
  dashboardController.getTopDueStudents
);

// ===============================
// Monthly Collection
// ===============================

router.get(
  "/monthly-collection",
  auth,
  authorize("ADMIN"),
  dashboardController.getMonthlyCollection
);

// ===============================
// Payment Mode Summary
// ===============================

router.get(
  "/payment-mode",
  auth,
  authorize("ADMIN"),
  dashboardController.getPaymentModeSummary
);

// ===============================
// Class Wise Collection
// ===============================

router.get(
  "/class-wise-collection",
  auth,
  authorize("ADMIN"),
  dashboardController.getClassWiseCollection
);

module.exports = router;