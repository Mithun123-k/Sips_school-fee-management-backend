const { body } = require("express-validator");

// =====================================================
// Fee Fields
// =====================================================

const FEE_FIELDS = [
  "admissionFee",
  "monthlyFee",
  "examFee",
  "sportFee",
  "computerFee",
  "functionFee",
  "smartClassFee",
  "otherCharges",
];

// =====================================================
// Fee Validation Helper
// =====================================================

const feeValidation = (field, label) => {
  return body(field)
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      `${label} cannot be negative`
    )
    .toFloat();
};

// =====================================================
// Create Fee Structure Validation
// =====================================================

const createFeeStructureValidation = [
  // Class
  body("className")
    .trim()
    .notEmpty()
    .withMessage(
      "Class name is required"
    )
    .isString()
    .withMessage(
      "Class name must be a string"
    ),

  // Fee Heads
  feeValidation(
    "admissionFee",
    "Admission fee"
  ),

  feeValidation(
    "monthlyFee",
    "Monthly fee"
  ),

  feeValidation(
    "examFee",
    "Exam fee"
  ),

  feeValidation(
    "sportFee",
    "Sport fee"
  ),

  feeValidation(
    "computerFee",
    "Computer fee"
  ),

  feeValidation(
    "functionFee",
    "Function fee"
  ),

  feeValidation(
    "smartClassFee",
    "Smart class fee"
  ),

  feeValidation(
    "otherCharges",
    "Other charges"
  ),
];

// =====================================================
// Update Fee Structure Validation
// =====================================================
//
// Partial update allowed.
//
// Example:
//
// {
//   "monthlyFee": 1500
// }
//
// Baaki fee heads old values rahenge.
//

const updateFeeStructureValidation = [
  // Class
  body("className")
    .optional()
    .trim()
    .isString()
    .withMessage(
      "Class name must be a string"
    )
    .notEmpty()
    .withMessage(
      "Class name cannot be empty"
    ),

  // Fee Heads
  feeValidation(
    "admissionFee",
    "Admission fee"
  ),

  feeValidation(
    "monthlyFee",
    "Monthly fee"
  ),

  feeValidation(
    "examFee",
    "Exam fee"
  ),

  feeValidation(
    "sportFee",
    "Sport fee"
  ),

  feeValidation(
    "computerFee",
    "Computer fee"
  ),

  feeValidation(
    "functionFee",
    "Function fee"
  ),

  feeValidation(
    "smartClassFee",
    "Smart class fee"
  ),

  feeValidation(
    "otherCharges",
    "Other charges"
  ),

  // Protected fields
  body("createdBy")
    .not()
    .exists()
    .withMessage(
      "CreatedBy cannot be changed"
    ),

  body("updatedBy")
    .not()
    .exists()
    .withMessage(
      "UpdatedBy cannot be changed directly"
    ),

  body("isActive")
    .not()
    .exists()
    .withMessage(
      "Active status cannot be changed directly"
    ),
];

// =====================================================
// Individual Student Fee Validation
// =====================================================
//
// Example:
//
// {
//   "monthlyFee": 1200,
//   "examFee": 500
// }
//
// Sirf selected student ki fee change hogi.
//

const updateIndividualStudentFeesValidation = [
  feeValidation(
    "admissionFee",
    "Admission fee"
  ),

  feeValidation(
    "monthlyFee",
    "Monthly fee"
  ),

  feeValidation(
    "examFee",
    "Exam fee"
  ),

  feeValidation(
    "sportFee",
    "Sport fee"
  ),

  feeValidation(
    "computerFee",
    "Computer fee"
  ),

  feeValidation(
    "functionFee",
    "Function fee"
  ),

  feeValidation(
    "smartClassFee",
    "Smart class fee"
  ),

  feeValidation(
    "otherCharges",
    "Other charges"
  ),

  // Protected payment fields
  body("paidFee")
    .not()
    .exists()
    .withMessage(
      "Paid fee cannot be updated here"
    ),

  body("dueFee")
    .not()
    .exists()
    .withMessage(
      "Due fee cannot be updated here"
    ),

  body("totalFee")
    .not()
    .exists()
    .withMessage(
      "Total fee cannot be updated directly"
    ),

  body("openingDue")
    .not()
    .exists()
    .withMessage(
      "Opening due cannot be updated here"
    ),

  body("studentId")
    .not()
    .exists()
    .withMessage(
      "Student ID cannot be changed"
    ),

  body("createdBy")
    .not()
    .exists()
    .withMessage(
      "CreatedBy cannot be changed"
    ),

  body("updatedBy")
    .not()
    .exists()
    .withMessage(
      "UpdatedBy cannot be changed"
    ),
];

// =====================================================
// Export
// =====================================================

module.exports = {
  createFeeStructureValidation,

  updateFeeStructureValidation,

  updateIndividualStudentFeesValidation,
};