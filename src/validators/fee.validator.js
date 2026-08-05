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
// Allowed Payment Types
// =====================================================
//
// REGULAR
//   -> Normal fee payment
//
// LUMP_SUM
//   -> Full-year / remaining-year payment
//   -> Lump Sum eligibility will be checked
//      inside fee.service.js
//
// IMPORTANT:
// feeDiscountType is NOT accepted here.
// It comes from Student record.
//

const ALLOWED_PAYMENT_TYPES = [
  "REGULAR",
  "LUMP_SUM",
];

// =====================================================
// Collect CASH Fee Validation
// =====================================================

const collectFeeValidation = [
  // ---------------------------------------------------
  // Student ID
  // ---------------------------------------------------

  body("studentId")
    .trim()
    .notEmpty()
    .withMessage(
      "Student ID is required"
    ),

  // ---------------------------------------------------
  // Fee Head
  // ---------------------------------------------------

  body("feeHead")
    .trim()
    .notEmpty()
    .withMessage(
      "Fee head is required"
    )
    .isIn(ALLOWED_FEE_HEADS)
    .withMessage(
      "Invalid fee head"
    ),

  // ---------------------------------------------------
  // Amount
  // ---------------------------------------------------

  body("amount")
    .isFloat({ gt: 0 })
    .withMessage(
      "Amount must be greater than zero"
    ),

  // ---------------------------------------------------
  // Payment Mode
  // ---------------------------------------------------

  body("paymentMode")
    .equals("CASH")
    .withMessage(
      "Manual fee collection is only allowed for CASH payment"
    ),

  // ---------------------------------------------------
  // Payment Type
  // ---------------------------------------------------
  //
  // Optional for backward compatibility.
  //
  // If not provided:
  // REGULAR
  //
  // If LUMP_SUM:
  // fee.service.js will verify:
  // - current eligibility month
  // - student discount type
  // - remaining fee
  // - applicable 10% monthly discount
  //

  body("paymentType")
    .optional({
      values: "falsy",
    })
    .isIn(ALLOWED_PAYMENT_TYPES)
    .withMessage(
      "Invalid payment type"
    ),

  // ---------------------------------------------------
  // Transaction ID
  // ---------------------------------------------------

  body("transactionId")
    .optional({
      values: "falsy",
    })
    .isString()
    .trim()
    .withMessage(
      "Transaction ID must be a string"
    ),

  // ---------------------------------------------------
  // Remarks
  // ---------------------------------------------------

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
  // ---------------------------------------------------
  // Student ID
  // ---------------------------------------------------

  body("studentId")
    .trim()
    .notEmpty()
    .withMessage(
      "Student ID is required"
    ),

  // ---------------------------------------------------
  // Fee Head
  // ---------------------------------------------------

  body("feeHead")
    .trim()
    .notEmpty()
    .withMessage(
      "Fee head is required"
    )
    .isIn(ALLOWED_FEE_HEADS)
    .withMessage(
      "Invalid fee head"
    ),

  // ---------------------------------------------------
  // Amount
  // ---------------------------------------------------

  body("amount")
    .isFloat({ gt: 0 })
    .withMessage(
      "Amount must be greater than zero"
    ),

  // ---------------------------------------------------
  // Payment Type
  // ---------------------------------------------------
  //
  // Optional for backward compatibility.
  //
  // LUMP_SUM eligibility is NOT decided here.
  // It must be checked in fee.service.js because
  // service has access to:
  //
  // - Student discount type
  // - Current due
  // - Fee structure
  // - Current month
  // - Already paid fee
  //

  body("paymentType")
    .optional({
      values: "falsy",
    })
    .isIn(ALLOWED_PAYMENT_TYPES)
    .withMessage(
      "Invalid payment type"
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
};