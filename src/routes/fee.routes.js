const express = require("express");

const router = express.Router();

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
} = require("../validators/fee.validator");

// =====================================================
// Collect CASH Fee
// ADMIN / RECEPTIONIST
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
// Student can search student and create
// payment QR without login.
//

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
// Student can check payment status
// using QR ID.
//

router.get(
  "/online/status/:qrId",

  feeController.checkOnlinePayment
);

// =====================================================
// Fee History
// ADMIN / RECEPTIONIST
// =====================================================

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

router.get(
  "/receipt/:id",

  auth,

  authorize(
    "ADMIN",
    "RECEPTIONIST"
  ),

  feeController.getReceipt
);

module.exports = router;