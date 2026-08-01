const express = require("express");

const router = express.Router();

const feeController = require("../controllers/fee.controller");

const auth = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const validate = require("../middleware/validation.middleware");

const {
  collectFeeValidation,
  onlineQRValidation,
} = require("../validators/fee.validator");

// ====================================
// Collect Fee
// ====================================

router.post(
  "/collect",
  auth,
  authorize("ADMIN", "RECEPTIONIST"),
  collectFeeValidation,
  validate,
  feeController.collectFee
);

// ====================================
// Online QR Create
// ====================================

router.post(
  "/online/create-qr",
  auth,
  authorize("ADMIN", "RECEPTIONIST"),
  onlineQRValidation,
  validate,
  feeController.createOnlineQR
);

// ====================================
// Online Payment Status
// ====================================

router.get(
  "/online/status/:qrId",
  auth,
  authorize("ADMIN", "RECEPTIONIST"),
  feeController.checkOnlinePayment
);

// ====================================
// Fee History
// ====================================

router.get(
  "/history/:studentId",
  auth,
  authorize("ADMIN", "RECEPTIONIST"),
  feeController.getFeeHistory
);

// ====================================
// Receipt
// ====================================

router.get(
  "/receipt/:id",
  auth,
  authorize("ADMIN", "RECEPTIONIST"),
  feeController.getReceipt
);

module.exports = router;