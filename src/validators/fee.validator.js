const { body } = require("express-validator");

// ====================================
// Collect Fee Validation
// ====================================

const collectFeeValidation = [
  body("studentId")
    .trim()
    .notEmpty()
    .withMessage("Student ID is required"),

  body("amount")
    .isFloat({ gt: 0 })
    .withMessage(
      "Amount must be greater than zero"
    ),

  body("paymentMode")
    .isIn(["CASH", "ONLINE"])
    .withMessage(
      "Payment mode must be CASH or ONLINE"
    ),

  body("transactionId")
    .optional()
    .isString()
    .withMessage(
      "Transaction ID must be a string"
    ),

  body("remarks")
    .optional()
    .isString()
    .withMessage(
      "Remarks must be a string"
    ),
];

// ====================================
// Online QR Validation
// ====================================

const onlineQRValidation = [
  body("studentId")
    .trim()
    .notEmpty()
    .withMessage("Student ID is required"),

  body("amount")
    .isFloat({ gt: 0 })
    .withMessage(
      "Amount must be greater than zero"
    ),
];

module.exports = {
  collectFeeValidation,
  onlineQRValidation,
};