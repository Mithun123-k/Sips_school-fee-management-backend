const { body } = require("express-validator");

// =====================================================
// Allowed Fee Heads
// =====================================================

const ALLOWED_FEE_HEADS = [
  "ADMISSION",
  "MONTHLY",
  "EXAM",
  "SPORT",
  "COMPUTER",
  "FUNCTION",
  "SMART_CLASS",
  "OTHER",
  "LATE_FEE",
  "OPENING_DUE",
  "ALL",
];

// =====================================================
// Allowed Payment Types
// =====================================================

const ALLOWED_PAYMENT_TYPES = [
  "REGULAR",
  "LUMP_SUM",
];

// =====================================================
// Common Fee Head Validation
// =====================================================

const validateFeeHead = body("feeHead")
  .notEmpty()
  .withMessage("Fee head is required")
  .isString()
  .withMessage("Fee head must be a string")
  .trim()
  .customSanitizer((value) =>
    value.toUpperCase()
  )
  .isIn(ALLOWED_FEE_HEADS)
  .withMessage("Invalid fee head");

// =====================================================
// Collect CASH Fee Validation
// =====================================================

const collectFeeValidation = [
  body("studentId")
    .trim()
    .notEmpty()
    .withMessage("Student ID is required"),

  validateFeeHead,

  body("amount")
    .isFloat({ gt: 0 })
    .withMessage(
      "Amount must be greater than zero"
    ),

  body("paymentMode")
    .equals("CASH")
    .withMessage(
      "Manual fee collection is only allowed for CASH payment"
    ),

  body("paymentType")
    .optional({
      values: "falsy",
    })
    .isIn(ALLOWED_PAYMENT_TYPES)
    .withMessage("Invalid payment type"),

  body("transactionId")
    .optional({
      values: "falsy",
    })
    .isString()
    .trim()
    .withMessage(
      "Transaction ID must be a string"
    ),

  body("remarks")
    .optional({
      values: "falsy",
    })
    .isString()
    .trim()
    .withMessage(
      "Remarks must be a string"
    ),
];

// =====================================================
// Online QR Validation
// =====================================================

const onlineQRValidation = [
  body("studentId")
    .trim()
    .notEmpty()
    .withMessage("Student ID is required"),

  validateFeeHead,

  body("amount")
    .isFloat({ gt: 0 })
    .withMessage(
      "Amount must be greater than zero"
    ),

  body("paymentType")
    .optional({
      values: "falsy",
    })
    .isIn(ALLOWED_PAYMENT_TYPES)
    .withMessage("Invalid payment type"),
];

// =====================================================
// Export
// =====================================================

module.exports = {
  ALLOWED_FEE_HEADS,
  ALLOWED_PAYMENT_TYPES,
  collectFeeValidation,
  onlineQRValidation,
};