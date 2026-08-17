const express =
  require("express");

const router =
  express.Router();

const feeController =
  require("../controllers/fee.controller");

const auth =
  require("../middleware/auth.middleware");

const authorize =
  require("../middleware/role.middleware");

const validate =
  require("../middleware/validation.middleware");

const {
  collectFeeValidation,
  onlineQRValidation,
  monthlyFeeWaiverValidation,
} =
  require("../validators/fee.validator");




  router.post(
  "/calculate",
  feeController.calculateFee
);


router.post(
  "/late-fee/waive",

  auth,

  authorize("ADMIN"),

  feeController.waiveLateFee
);

router.delete(
  "/late-fee/waiver/:studentId/:month",

  auth,

  authorize("ADMIN"),

  feeController.revokeLateFeeWaiver
);

// =====================================================
// Global Monthly Fee Waiver
// ADMIN ONLY
// =====================================================
//
// POST /api/fees/monthly-fee/waive
//
// {
//   "academicYear": "2026-2027",
//   "months": ["MAY", "JUNE"],
//   "reason": "Summer vacation"
// }
//
// =====================================================

router.post(
  "/monthly-fee/waive",

  auth,

  authorize("ADMIN"),

  monthlyFeeWaiverValidation,

  validate,

  feeController
    .waiveMonthlyFeeForAllStudents
);


// =====================================================
// Collect CASH Fee
// ADMIN / RECEPTIONIST
// =====================================================
//
// POST /api/fees/collect
//
// Authentication required.
//
// =====================================================


router.post(
  "/collect",

  auth,

  authorize(
    "ADMIN",
    "RECEPTIONIST"
  ),

  collectFeeValidation,

  validate,

  feeController.collectFee
);

// =====================================================
// Create Online QR
// PUBLIC
// =====================================================
//
// POST /api/fees/online/create-qr
//
// No authentication required.
//
// =====================================================

router.post(
  "/online/create-qr",

  onlineQRValidation,

  validate,

  feeController.createOnlineQR
);

// =====================================================
// Check Online Payment Status
// PUBLIC
// =====================================================
//
// GET /api/fees/online/status/:qrId
//
// No authentication required.
//
// =====================================================

router.get(
  "/online/status/:qrId",

  feeController.checkOnlinePayment
);

// =====================================================
// Lump Sum Preview
// PUBLIC
// =====================================================
//
// GET /api/fees/lump-sum-preview/:studentId
//
// No authentication required.
//
// Used before showing Lump Sum payment.
//
// =====================================================

router.get(
  "/lump-sum-preview/:studentId",

  feeController.getLumpSumPreview
);

// =====================================================
// Fee History
// ADMIN / RECEPTIONIST
// =====================================================
//
// GET /api/fees/history/:studentId
//
// Authentication required.
//
// =====================================================

router.get(
  "/history",
  auth,
  feeController.getAllFeeHistory
);

router.get(
  "/history/:studentId",

  auth,

  authorize(
    "ADMIN",
    "RECEPTIONIST"
  ),

  feeController.getFeeHistory
);

// =====================================================
// Receipt Details
// ADMIN / RECEPTIONIST
// =====================================================
//
// GET /api/fees/receipt/:id
//
// Authentication required.
//
// =====================================================

router.get(
  "/receipt/:id",

  auth,

  authorize(
    "ADMIN",
    "RECEPTIONIST"
  ),

  feeController.getReceipt
);

// =====================================================
// Export
// =====================================================

module.exports = router;
