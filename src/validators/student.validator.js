const { body } = require("express-validator");

// =====================================================
// Common Fee Validation
// =====================================================

const feeNumberValidation = (field, label) => {
  return body(field)
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      `${label} cannot be negative`
    )
    .toFloat();
};

// =====================================================
// Fee Fields
// =====================================================

const studentFeeValidations = [
  feeNumberValidation(
    "admissionFee",
    "Admission fee"
  ),

  feeNumberValidation(
    "monthlyFee",
    "Monthly fee"
  ),

  feeNumberValidation(
    "examFee",
    "Exam fee"
  ),

  feeNumberValidation(
    "sportFee",
    "Sport fee"
  ),

  feeNumberValidation(
    "computerFee",
    "Computer fee"
  ),

  feeNumberValidation(
    "functionFee",
    "Function fee"
  ),

  feeNumberValidation(
    "smartClassFee",
    "Smart class fee"
  ),

  feeNumberValidation(
    "otherCharges",
    "Other charges"
  ),
];

// =====================================================
// Create Student Validation
// =====================================================

const createStudentValidation = [
  // ---------------------------------------------------
  // Admission Number
  // ---------------------------------------------------

<<<<<<< HEAD
  body("admissionNo")
    .optional()
    .trim()
    .isString()
    .withMessage(
      "Admission number must be a string"
    ),
=======
  // body("admissionNo")
  //   .optional({
  //     values: "falsy",
  //   })
  //   .trim()
  //   .isString()
  //   .withMessage(
  //     "Admission number must be a string"
  //   ),
>>>>>>> production

  // ---------------------------------------------------
  // Name
  // ---------------------------------------------------

  body("name")
    .trim()
    .notEmpty()
    .withMessage(
      "Student name is required"
    ),

  // ---------------------------------------------------
  // Father Name
  // ---------------------------------------------------

  body("fatherName")
    .trim()
    .notEmpty()
    .withMessage(
      "Father name is required"
    ),

  // ---------------------------------------------------
  // Mother Name
  // ---------------------------------------------------

  body("motherName")
    .optional()
    .trim()
    .isString()
    .withMessage(
      "Mother name must be a string"
    ),

  // ---------------------------------------------------
  // Mobile
  // ---------------------------------------------------

  body("mobile")
    .trim()
    .notEmpty()
    .withMessage(
      "Mobile number is required"
    )
    .isMobilePhone("any")
    .withMessage(
      "Invalid mobile number"
    ),

  // ---------------------------------------------------
  // Email
  // ---------------------------------------------------

  body("email")
    .optional({
      values: "falsy",
    })
    .trim()
    .isEmail()
    .withMessage(
      "Invalid email address"
    )
    .normalizeEmail(),

  // ---------------------------------------------------
  // Gender
  // ---------------------------------------------------

  body("gender")
    .isIn([
      "MALE",
      "FEMALE",
      "OTHER",
    ])
    .withMessage(
      "Gender must be MALE, FEMALE or OTHER"
    ),

  // ---------------------------------------------------
  // DOB
  // ---------------------------------------------------

  body("dob")
    .optional({
      values: "falsy",
    })
    .isISO8601()
    .withMessage(
      "Invalid date of birth"
    ),

  // ---------------------------------------------------
  // Class
  // ---------------------------------------------------

  body("className")
    .trim()
    .notEmpty()
    .withMessage(
      "Class is required"
    ),

  // ---------------------------------------------------
  // Section
  // ---------------------------------------------------

  body("section")
    .optional()
    .trim()
    .isString()
    .withMessage(
      "Section must be a string"
    ),

  // ---------------------------------------------------
  // Address
  // ---------------------------------------------------

  body("address")
    .optional()
    .trim()
    .isString()
    .withMessage(
      "Address must be a string"
    ),

  // ---------------------------------------------------
  // Admission Date
  // ---------------------------------------------------

  body("admissionDate")
    .optional({
      values: "falsy",
    })
    .isISO8601()
    .withMessage(
      "Invalid admission date"
    ),

  // ===================================================
  // Opening Due
  // ===================================================

  feeNumberValidation(
    "openingDue",
    "Opening due"
  ),

  // ===================================================
  // Student Fee Heads
  // ===================================================

  ...studentFeeValidations,

  // ===================================================
  // Prevent Direct Total / Paid / Due
  // ===================================================

  body("totalFee")
    .not()
    .exists()
    .withMessage(
      "Total fee is calculated automatically"
    ),

  body("paidFee")
    .not()
    .exists()
    .withMessage(
      "Paid fee cannot be set during student creation"
    ),

  body("dueFee")
    .not()
    .exists()
    .withMessage(
      "Due fee is calculated automatically"
    ),

  // ---------------------------------------------------
  // Protected Fields
  // ---------------------------------------------------

  body("studentId")
    .not()
    .exists()
    .withMessage(
      "Student ID cannot be provided directly"
    ),

  body("isDeleted")
    .not()
    .exists()
    .withMessage(
      "Delete status cannot be changed directly"
    ),

  body("createdBy")
    .not()
    .exists()
    .withMessage(
      "CreatedBy cannot be provided directly"
    ),
];

// =====================================================
// Update Student Validation
// =====================================================

const updateStudentValidation = [
  // ---------------------------------------------------
  // Admission Number
  // ---------------------------------------------------

  body("admissionNo")
    .optional()
    .trim()
    .isString()
    .withMessage(
      "Admission number must be a string"
    ),

  // ---------------------------------------------------
  // Name
  // ---------------------------------------------------

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage(
      "Student name cannot be empty"
    ),

  // ---------------------------------------------------
  // Father Name
  // ---------------------------------------------------

  body("fatherName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage(
      "Father name cannot be empty"
    ),

  // ---------------------------------------------------
  // Mother Name
  // ---------------------------------------------------

  body("motherName")
    .optional()
    .trim()
    .isString()
    .withMessage(
      "Mother name must be a string"
    ),

  // ---------------------------------------------------
  // Mobile
  // ---------------------------------------------------

  body("mobile")
    .optional()
    .trim()
    .isMobilePhone("any")
    .withMessage(
      "Invalid mobile number"
    ),

  // ---------------------------------------------------
  // Email
  // ---------------------------------------------------

  body("email")
    .optional({
      values: "falsy",
    })
    .trim()
    .isEmail()
    .withMessage(
      "Invalid email address"
    )
    .normalizeEmail(),

  // ---------------------------------------------------
  // Gender
  // ---------------------------------------------------

  body("gender")
    .optional()
    .isIn([
      "MALE",
      "FEMALE",
      "OTHER",
    ])
    .withMessage(
      "Gender must be MALE, FEMALE or OTHER"
    ),

  // ---------------------------------------------------
  // DOB
  // ---------------------------------------------------

  body("dob")
    .optional({
      values: "falsy",
    })
    .isISO8601()
    .withMessage(
      "Invalid date of birth"
    ),

  // ---------------------------------------------------
  // Class
  // ---------------------------------------------------

  body("className")
    .optional()
    .trim()
    .notEmpty()
    .withMessage(
      "Class cannot be empty"
    ),

  // ---------------------------------------------------
  // Section
  // ---------------------------------------------------

  body("section")
    .optional()
    .trim()
    .isString()
    .withMessage(
      "Section must be a string"
    ),

  // ---------------------------------------------------
  // Address
  // ---------------------------------------------------

  body("address")
    .optional()
    .trim()
    .isString()
    .withMessage(
      "Address must be a string"
    ),

  // ---------------------------------------------------
  // Admission Date
  // ---------------------------------------------------

  body("admissionDate")
    .optional({
      values: "falsy",
    })
    .isISO8601()
    .withMessage(
      "Invalid admission date"
    ),

  // ===================================================
  // Opening Due
  // ===================================================

  feeNumberValidation(
    "openingDue",
    "Opening due"
  ),

  // ===================================================
  // Student Fee Heads
  // ===================================================

  ...studentFeeValidations,

  // ===================================================
  // Protected Fee Fields
  // ===================================================

  body("totalFee")
    .not()
    .exists()
    .withMessage(
      "Total fee is calculated automatically"
    ),

  body("paidFee")
    .not()
    .exists()
    .withMessage(
      "Paid fee cannot be updated directly"
    ),

  body("dueFee")
    .not()
    .exists()
    .withMessage(
      "Due fee cannot be updated directly"
    ),

  // ===================================================
  // Protected Student Fields
  // ===================================================

  body("studentId")
    .not()
    .exists()
    .withMessage(
      "Student ID cannot be changed"
    ),

  body("isDeleted")
    .not()
    .exists()
    .withMessage(
      "Delete status cannot be changed directly"
    ),

  body("createdBy")
    .not()
    .exists()
    .withMessage(
      "CreatedBy cannot be changed directly"
    ),
];

// =====================================================
// Export
// =====================================================

module.exports = {
  createStudentValidation,
  updateStudentValidation,
};