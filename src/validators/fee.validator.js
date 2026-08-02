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
];

// =====================================================
// Collect CASH Fee Validation
// =====================================================

const collectFeeValidation = [
  // ------------------------------
  // Student ID
  // ------------------------------

  body("studentId")
    .trim()
    .notEmpty()
    .withMessage("Student ID is required"),

  // ------------------------------
  // Fee Head
  // ------------------------------

  body("feeHead")
    .trim()
    .notEmpty()
    .withMessage("Fee head is required")
    .isIn(ALLOWED_FEE_HEADS)
    .withMessage("Invalid fee head"),

  // ------------------------------
  // Amount
  // ------------------------------

  body("amount")
    .isFloat({ gt: 0 })
    .withMessage(
      "Amount must be greater than zero"
    ),

  // ------------------------------
  // Payment Mode
  // ------------------------------

  body("paymentMode")
    .equals("CASH")
    .withMessage(
      "Manual fee collection is only allowed for CASH payment"
    ),

  // ------------------------------
  // Transaction ID
  // ------------------------------

  body("transactionId")
    .optional({
      values: "falsy",
    })
    .isString()
    .trim()
    .withMessage(
      "Transaction ID must be a string"
    ),

  // ------------------------------
  // Remarks
  // ------------------------------

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
  // ------------------------------
  // Student ID
  // ------------------------------

  body("studentId")
    .trim()
    .notEmpty()
    .withMessage("Student ID is required"),

  // ------------------------------
  // Fee Head
  // ------------------------------

  body("feeHead")
    .trim()
    .notEmpty()
    .withMessage("Fee head is required")
    .isIn(ALLOWED_FEE_HEADS)
    .withMessage("Invalid fee head"),

  // ------------------------------
  // Amount
  // ------------------------------

  body("amount")
    .isFloat({ gt: 0 })
    .withMessage(
      "Amount must be greater than zero"
    ),
];

// =====================================================
// Export
// =====================================================

module.exports = {
  ALLOWED_FEE_HEADS,
  collectFeeValidation,
  onlineQRValidation,
};