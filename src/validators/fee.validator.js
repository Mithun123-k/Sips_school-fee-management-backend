const { body } = require("express-validator");

const {
  ACADEMIC_MONTHS,
} = require("../utils/monthlyFeeWaiver");

// =====================================================
// Allowed Fee Heads
// =====================================================

const ALLOWED_FEE_HEADS = [
  "ADMISSION",
  "MONTHLY",
  "BUS",
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
// Global Monthly Fee Waiver Validation
// ADMIN ONLY
// =====================================================

const monthlyFeeWaiverValidation = [
  body("academicYear")
    .isString()
    .withMessage(
      "Academic year must be a string"
    )
    .trim()
    .matches(/^\d{4}-\d{4}$/)
    .withMessage(
      "Academic year must be in YYYY-YYYY format"
    )
    .custom((value) => {
      const [startYear, endYear] =
        value
          .split("-")
          .map(Number);

      if (
        endYear !==
        startYear + 1
      ) {
        throw new Error(
          "Academic year end must be the next year"
        );
      }

      return true;
    }),

  body("months")
    .isArray({
      min: 1,
      max: 12,
    })
    .withMessage(
      "Months must contain between 1 and 12 values"
    ),

  body("months.*")
    .isString()
    .withMessage(
      "Each month must be a string"
    )
    .customSanitizer((value) =>
      String(value)
        .trim()
        .toUpperCase()
    )
    .isIn(ACADEMIC_MONTHS)
    .withMessage(
      "Invalid academic month"
    ),

  body("reason")
    .isString()
    .withMessage(
      "Waiver reason must be a string"
    )
    .trim()
    .isLength({
      min: 3,
      max: 250,
    })
    .withMessage(
      "Waiver reason must contain 3 to 250 characters"
    ),
];

// =====================================================
// Export
// =====================================================

module.exports = {
  ALLOWED_FEE_HEADS,
  ALLOWED_PAYMENT_TYPES,
  collectFeeValidation,
  onlineQRValidation,
  monthlyFeeWaiverValidation,
};
