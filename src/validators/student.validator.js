const { body } = require("express-validator");

// =======================================
// Create Student Validation
// =======================================

exports.createStudentValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Student name is required"),

  body("fatherName")
    .trim()
    .notEmpty()
    .withMessage("Father name is required"),

  body("mobile")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required")
    .isLength({ min: 10, max: 10 })
    .withMessage("Mobile number must be 10 digits"),

  body("gender")
    .notEmpty()
    .withMessage("Gender is required"),

  body("className")
    .notEmpty()
    .withMessage("Class is required"),

  // ============================
  // Monthly Fee
  // ============================

  body("monthlyFee")
    .notEmpty()
    .withMessage("Monthly fee is required")
    .isNumeric()
    .withMessage("Monthly fee must be numeric"),

  // ============================
  // Opening Due
  // Old student previous pending fee
  // ============================

  body("openingDue")
    .optional()
    .isNumeric()
    .withMessage("Opening due must be numeric"),

  // ============================
  // Total Fee
  // ============================

  body("totalFee")
    .notEmpty()
    .withMessage("Total fee is required")
    .isNumeric()
    .withMessage("Total fee must be numeric"),
];

// =======================================
// Update Student Validation
// =======================================

exports.updateStudentValidation = [
  body("name")
    .optional()
    .trim(),

  body("fatherName")
    .optional()
    .trim(),

  body("mobile")
    .optional()
    .isLength({ min: 10, max: 10 })
    .withMessage("Mobile number must be 10 digits"),

  body("monthlyFee")
    .optional()
    .isNumeric()
    .withMessage("Monthly fee must be numeric"),

  body("openingDue")
    .optional()
    .isNumeric()
    .withMessage("Opening due must be numeric"),

  body("totalFee")
    .optional()
    .isNumeric()
    .withMessage("Total fee must be numeric"),

  body("paidFee")
    .optional()
    .isNumeric()
    .withMessage("Paid fee must be numeric"),
];