const { body } = require("express-validator");

// =====================================================
// Common Fee Validation
// =====================================================

const feeNumberValidation = (field, label) => {
  return body(field)
    .optional({
      values: "falsy",
    })
    .isFloat({
      min: 0,
    })
    .withMessage(
      `${label} cannot be negative`
    )
    .toFloat();
};

// =====================================================
// Create Student Validation
// =====================================================

const createStudentValidation = [
  // ---------------------------------------------------
  // Admission Number
  // ---------------------------------------------------

  // body("admissionNo")
  //   .optional({
  //     values: "falsy",
  //   })
  //   .trim()
  //   .isString()
  //   .withMessage(
  //     "Admission number must be a string"
  //   ),

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
    .optional({
      values: "falsy",
    })
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
    .optional({
      values: "falsy",
    })
    .trim()
    .isString()
    .withMessage(
      "Section must be a string"
    ),

  // ---------------------------------------------------
  // Address
  // ---------------------------------------------------

  body("address")
    .optional({
      values: "falsy",
    })
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

  body("feeStartFrom")
    .optional()
    .isIn([
      "ADMISSION_DATE",
      "NEXT_MONTH",
      "CUSTOM",
    ])
    .withMessage(
      "Invalid fee start option"
    ),

  // ===================================================
  // Fee Structure
  // ===================================================

  feeNumberValidation(
    "monthlyFee",
    "Monthly fee"
  ),

  feeNumberValidation(
    "openingDue",
    "Opening due"
  ),

  feeNumberValidation(
    "totalFee",
    "Total fee"
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
    .optional({
      values: "falsy",
    })
    .trim()
    .isString()
    .withMessage(
      "Admission number must be a string"
    ),

  // ---------------------------------------------------
  // Name
  // ---------------------------------------------------

  body("name")
    .optional({
      values: "falsy",
    })
    .trim()
    .notEmpty()
    .withMessage(
      "Student name cannot be empty"
    ),

  // ---------------------------------------------------
  // Father Name
  // ---------------------------------------------------

  body("fatherName")
    .optional({
      values: "falsy",
    })
    .trim()
    .notEmpty()
    .withMessage(
      "Father name cannot be empty"
    ),

  // ---------------------------------------------------
  // Mother Name
  // ---------------------------------------------------

  body("motherName")
    .optional({
      values: "falsy",
    })
    .trim()
    .isString()
    .withMessage(
      "Mother name must be a string"
    ),

  // ---------------------------------------------------
  // Mobile
  // ---------------------------------------------------

  body("mobile")
    .optional({
      values: "falsy",
    })
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
    .optional({
      values: "falsy",
    })
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
    .optional({
      values: "falsy",
    })
    .trim()
    .notEmpty()
    .withMessage(
      "Class cannot be empty"
    ),

  // ---------------------------------------------------
  // Section
  // ---------------------------------------------------

  body("section")
    .optional({
      values: "falsy",
    })
    .trim()
    .isString()
    .withMessage(
      "Section must be a string"
    ),

  // ---------------------------------------------------
  // Address
  // ---------------------------------------------------

  body("address")
    .optional({
      values: "falsy",
    })
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

  body("feeStartFrom")
    .optional()
    .isIn([
      "ADMISSION_DATE",
      "NEXT_MONTH",
    ])
    .withMessage(
      "Invalid fee start option"
    ),

  // ===================================================
  // Fee Structure
  // ===================================================
  //
  // Admin can update:
  // - monthlyFee
  // - totalFee
  //
  // Admin cannot update:
  // - openingDue
  // - paidFee
  // - dueFee
  //
  // ===================================================

  feeNumberValidation(
    "monthlyFee",
    "Monthly fee"
  ),

  feeNumberValidation(
    "totalFee",
    "Total fee"
  ),

  // ===================================================
  // Prevent Opening Due Update
  // ===================================================

  body("openingDue")
    .not()
    .exists()
    .withMessage(
      "Opening due cannot be updated directly"
    ),

  // ===================================================
  // Prevent Paid Fee Update
  // ===================================================

  body("paidFee")
    .not()
    .exists()
    .withMessage(
      "Paid fee cannot be updated directly"
    ),

  // ===================================================
  // Prevent Due Fee Update
  // ===================================================

  body("dueFee")
    .not()
    .exists()
    .withMessage(
      "Due fee cannot be updated directly"
    ),

  // ===================================================
  // Prevent Student ID Change
  // =====================================================

  body("studentId")
    .not()
    .exists()
    .withMessage(
      "Student ID cannot be changed"
    ),

  // ===================================================
  // Prevent Delete Status Change
  // ===================================================

  body("isDeleted")
    .not()
    .exists()
    .withMessage(
      "Delete status cannot be changed directly"
    ),

  // ===================================================
  // Prevent CreatedBy Change
  // ===================================================

  body("createdBy")
    .not()
    .exists()
    .withMessage(
      "CreatedBy cannot be changed directly"
    ),

  // ===================================================
  // Prevent UpdatedBy Change
  // ===================================================

  body("updatedBy")
    .not()
    .exists()
    .withMessage(
      "UpdatedBy cannot be changed directly"
    ),
];

// =====================================================
// Export
// =====================================================

module.exports = {
  createStudentValidation,
  updateStudentValidation,
};