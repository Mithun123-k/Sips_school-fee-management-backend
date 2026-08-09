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
} =
  require("../validators/fee.validator");




  router.post(
  "/calculate",
  feeController.calculateFee
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