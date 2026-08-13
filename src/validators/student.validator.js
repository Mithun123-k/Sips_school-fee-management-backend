const { body } = require("express-validator");

// =====================================================
// Allowed Values
// =====================================================

const ALLOWED_FEE_DISCOUNT_TYPES = [
  "NONE",
  "SIBLING",
  "RTE",
  "GIRL",
];

const ALLOWED_FEE_START_OPTIONS = [
  "ADMISSION_DATE",
  "NEXT_MONTH",
  "CUSTOM",
];

const ALLOWED_STUDENT_STATUSES = [
  "ACTIVE",
  "INACTIVE",
];

// =====================================================
// Common Fee Validation
// =====================================================

const feeNumberValidation = (
  field,
  label
) => {
  return body(field)
    .optional({
      values: "falsy",
    })
    .isFloat({
      min: 0,
    })
    .withMessage(
      `${label} must be a valid non-negative number`
    )
    .toFloat();
};

// =====================================================
// Common Protected Field Validation
// =====================================================

const protectedFieldValidation = (
  field,
  message
) => {
  return body(field)
    .not()
    .exists()
    .withMessage(message);
};

// =====================================================
// Create Student Validation
// =====================================================

const createStudentValidation = [
  // ---------------------------------------------------
  // Admission Number
  // ---------------------------------------------------

  // Admission number is generated automatically.

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
    .exists({
      values: "falsy",
    })
    .withMessage(
      "Student name is required"
    )
    .bail()
    .isString()
    .withMessage(
      "Student name must be a string"
    )
    .bail()
    .trim()
    .notEmpty()
    .withMessage(
      "Student name is required"
    ),

  // ---------------------------------------------------
  // Father Name
  // ---------------------------------------------------

  body("fatherName")
    .exists({
      values: "falsy",
    })
    .withMessage(
      "Father name is required"
    )
    .bail()
    .isString()
    .withMessage(
      "Father name must be a string"
    )
    .bail()
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
    .isString()
    .withMessage(
      "Mother name must be a string"
    )
    .bail()
    .trim(),

  // ---------------------------------------------------
  // Mobile
  // ---------------------------------------------------

  body("mobile")
    .exists({
      values: "falsy",
    })
    .withMessage(
      "Mobile number is required"
    )
    .bail()
    .isString()
    .withMessage(
      "Mobile number must be a string"
    )
    .bail()
    .trim()
    .notEmpty()
    .withMessage(
      "Mobile number is required"
    )
    .bail()
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
    .isString()
    .withMessage(
      "Email must be a string"
    )
    .bail()
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
    .exists({
      values: "falsy",
    })
    .withMessage(
      "Class is required"
    )
    .bail()
    .isString()
    .withMessage(
      "Class must be a string"
    )
    .bail()
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
    .isString()
    .withMessage(
      "Section must be a string"
    )
    .bail()
    .trim(),

  // ---------------------------------------------------
  // Address
  // ---------------------------------------------------

  body("address")
    .optional({
      values: "falsy",
    })
    .isString()
    .withMessage(
      "Address must be a string"
    )
    .bail()
    .trim(),

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

  // ---------------------------------------------------
  // Fee Discount Type
  // ---------------------------------------------------

  body("feeDiscountType")
    .optional({
      values: "falsy",
    })
    .isIn(
      ALLOWED_FEE_DISCOUNT_TYPES
    )
    .withMessage(
      "Fee discount type must be NONE, SIBLING, RTE or GIRL"
    ),

  // ---------------------------------------------------
  // Fee Start Option
  // ---------------------------------------------------

  body("feeStartFrom")
    .optional({
      values: "falsy",
    })
    .isIn(
      ALLOWED_FEE_START_OPTIONS
    )
    .withMessage(
      "Invalid fee start option"
    ),

  // ---------------------------------------------------
  // Fee Start Date
  // ---------------------------------------------------

  body("feeStartDate")
    .if(
      body("feeStartFrom")
        .equals("CUSTOM")
    )
    .notEmpty()
    .withMessage(
      "Fee start date is required for CUSTOM option"
    ),

  body("feeStartDate")
    .optional({
      values: "falsy",
    })
    .isISO8601()
    .withMessage(
      "Invalid fee start date"
    ),

  // ===================================================
  // Fee Structure
  // ===================================================
  //
  // All fee heads store original amounts.
  // Student discount is applied separately by service.
  //
  // ===================================================

  feeNumberValidation(
    "admissionFee",
    "Admission fee"
  ),

  feeNumberValidation(
    "monthlyFee",
    "Monthly fee"
  ),

  body("hasBusFacility")
    .optional()
    .isBoolean()
    .withMessage(
      "Bus facility must be true or false"
    )
    .toBoolean(),

  body("busFee")
    .optional()
    .isFloat({
      min: 0,
    })
    .withMessage(
      "Bus fee must be a valid non-negative number"
    )
    .toFloat(),

  body().custom((_, { req }) => {
    const hasBusFacility =
      req.body.hasBusFacility === true;

    const busFee = Number(
      req.body.busFee || 0
    );

    if (
      hasBusFacility &&
      busFee <= 0
    ) {
      throw new Error(
        "Bus fee must be greater than zero when bus facility is enabled"
      );
    }

    if (
      !hasBusFacility &&
      busFee !== 0
    ) {
      throw new Error(
        "Bus fee must be zero when bus facility is disabled"
      );
    }

    return true;
  }),

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

  feeNumberValidation(
    "openingDue",
    "Opening due"
  ),

  // Kept for compatibility with the existing request.
  // The service recalculates totalFee from fee heads.
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
    .isString()
    .withMessage(
      "Admission number must be a string"
    )
    .bail()
    .trim(),

  // ---------------------------------------------------
  // Name
  // ---------------------------------------------------

  body("name")
    .optional()
    .isString()
    .withMessage(
      "Student name must be a string"
    )
    .bail()
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
    .isString()
    .withMessage(
      "Father name must be a string"
    )
    .bail()
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
    .isString()
    .withMessage(
      "Mother name must be a string"
    )
    .bail()
    .trim(),

  // ---------------------------------------------------
  // Mobile
  // ---------------------------------------------------

  body("mobile")
    .optional()
    .isString()
    .withMessage(
      "Mobile number must be a string"
    )
    .bail()
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
    .isString()
    .withMessage(
      "Email must be a string"
    )
    .bail()
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
  //
  // Class can only be changed through promote API so
  // that old/new fee snapshots remain safe.
  //
  // ---------------------------------------------------

  protectedFieldValidation(
    "className",
    "Use the student promotion API to change class"
  ),

  protectedFieldValidation(
    "classPromotionHistory",
    "Class promotion history cannot be changed directly"
  ),

  // ---------------------------------------------------
  // Section
  // ---------------------------------------------------

  body("section")
    .optional({
      values: "falsy",
    })
    .isString()
    .withMessage(
      "Section must be a string"
    )
    .bail()
    .trim(),

  // ---------------------------------------------------
  // Address
  // ---------------------------------------------------

  body("address")
    .optional({
      values: "falsy",
    })
    .isString()
    .withMessage(
      "Address must be a string"
    )
    .bail()
    .trim(),

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

  // ---------------------------------------------------
  // Student Status
  // ---------------------------------------------------

  body("status")
    .optional()
    .isIn(
      ALLOWED_STUDENT_STATUSES
    )
    .withMessage(
      "Status must be ACTIVE or INACTIVE"
    ),

  // ---------------------------------------------------
  // Fee Discount Type
  // ---------------------------------------------------

  body("feeDiscountType")
    .optional()
    .isIn(
      ALLOWED_FEE_DISCOUNT_TYPES
    )
    .withMessage(
      "Fee discount type must be NONE, SIBLING, RTE or GIRL"
    ),

  // ---------------------------------------------------
  // Fee Start Option
  // ---------------------------------------------------

  body("feeStartFrom")
    .optional()
    .isIn(
      ALLOWED_FEE_START_OPTIONS
    )
    .withMessage(
      "Invalid fee start option"
    ),

  // ---------------------------------------------------
  // Fee Start Date
  // ---------------------------------------------------

  body("feeStartDate")
    .optional({
      values: "falsy",
    })
    .isISO8601()
    .withMessage(
      "Invalid fee start date"
    ),

  // ===================================================
  // Fee Structure
  // ===================================================
  //
  // Admin can update individual fee heads and discount.
  // Service recalculates totalFee and dueFee safely.
  //
  // Admin cannot update openingDue, paidFee or dueFee.
  //
  // ===================================================

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

  protectedFieldValidation(
    "hasBusFacility",
    "Bus facility can only be set during student creation"
  ),

  protectedFieldValidation(
    "busFee",
    "Bus fee can only be set during student creation"
  ),

  protectedFieldValidation(
    "busFacilityHistory",
    "Bus facility history cannot be updated directly"
  ),

  protectedFieldValidation(
    "busFacilityStartEffectiveFrom",
    "Use the bus facility start API"
  ),

  protectedFieldValidation(
    "busFacilityStopEffectiveFrom",
    "Use the bus facility stop API"
  ),

  protectedFieldValidation(
    "busFacilityStoppedAt",
    "Use the bus facility stop API"
  ),

  protectedFieldValidation(
    "busFacilityStoppedBy",
    "Use the bus facility stop API"
  ),

  protectedFieldValidation(
    "busFeeRefunds",
    "Bus fee refunds cannot be updated directly"
  ),

  // Kept for compatibility with the existing request.
  // The service ignores the submitted value and
  // recalculates totalFee from fee heads.
  feeNumberValidation(
    "totalFee",
    "Total fee"
  ),

  // ===================================================
  // Prevent Opening Due Update
  // ===================================================

  protectedFieldValidation(
    "openingDue",
    "Opening due cannot be updated directly"
  ),

  // ===================================================
  // Prevent Paid Fee Update
  // ===================================================

  protectedFieldValidation(
    "paidFee",
    "Paid fee cannot be updated directly"
  ),

  // ===================================================
  // Prevent Due Fee Update
  // ===================================================

  protectedFieldValidation(
    "dueFee",
    "Due fee cannot be updated directly"
  ),

  // ===================================================
  // Prevent Student ID Change
  // ===================================================

  protectedFieldValidation(
    "studentId",
    "Student ID cannot be changed"
  ),

  // ===================================================
  // Prevent Delete Status Change
  // ===================================================

  protectedFieldValidation(
    "isDeleted",
    "Delete status cannot be changed directly"
  ),

  // ===================================================
  // Prevent CreatedBy Change
  // ===================================================

  protectedFieldValidation(
    "createdBy",
    "CreatedBy cannot be changed directly"
  ),

  // ===================================================
  // Prevent UpdatedBy Change
  // ===================================================

  protectedFieldValidation(
    "updatedBy",
    "UpdatedBy cannot be changed directly"
  ),

  // ===================================================
  // Prevent Late Fee Waiver Direct Update
  // ===================================================

  protectedFieldValidation(
    "lateFeeWaivers",
    "Late fee waivers cannot be updated directly"
  ),

  protectedFieldValidation(
    "lateFeeWaived",
    "Late fee waiver status cannot be updated directly"
  ),

  protectedFieldValidation(
    "lateFeeWaiverAmount",
    "Late fee waiver amount cannot be updated directly"
  ),

  protectedFieldValidation(
    "lateFeeWaiverReason",
    "Late fee waiver reason cannot be updated directly"
  ),
];

// =====================================================
// Start Or Restart Bus Facility Validation
// ADMIN ONLY
// =====================================================

const busFacilityStartValidation = [
  body("effectiveFrom")
    .exists({
      values: "falsy",
    })
    .withMessage(
      "Bus start effective date is required"
    )
    .bail()
    .isString()
    .withMessage(
      "Bus start effective date must be a string"
    )
    .bail()
    .trim()
    .matches(
      /^\d{4}-\d{2}-\d{2}$/
    )
    .withMessage(
      "Bus start effective date must be in YYYY-MM-DD format"
    ),

  body("busFee")
    .exists()
    .withMessage(
      "Bus fee is required"
    )
    .bail()
    .isFloat({
      gt: 0,
    })
    .withMessage(
      "Bus fee must be greater than zero"
    )
    .toFloat(),

  body("reason")
    .exists({
      values: "falsy",
    })
    .withMessage(
      "Bus start reason is required"
    )
    .bail()
    .isString()
    .withMessage(
      "Bus start reason must be a string"
    )
    .bail()
    .trim()
    .isLength({
      min: 3,
      max: 250,
    })
    .withMessage(
      "Bus start reason must contain 3 to 250 characters"
    ),

  protectedFieldValidation(
    "firstMonthBusFee",
    "First-month BUS fee is calculated by the server"
  ),

  protectedFieldValidation(
    "daysInStartMonth",
    "BUS proration days are calculated by the server"
  ),

  protectedFieldValidation(
    "chargeableDays",
    "BUS chargeable days are calculated by the server"
  ),

  protectedFieldValidation(
    "fullMonthlyFeeFrom",
    "Full monthly BUS fee date is calculated by the server"
  ),

  protectedFieldValidation(
    "firstMonthProrated",
    "BUS proration status is calculated by the server"
  ),

  protectedFieldValidation(
    "coveredByExistingLumpSum",
    "BUS lump-sum coverage is calculated by the server"
  ),
];

// =====================================================
// Stop Bus Facility Validation
// ADMIN ONLY
// =====================================================

const createBusStopBaseValidation =
  () => [
    body("effectiveFrom")
      .exists({
        values: "falsy",
      })
      .withMessage(
        "Bus stop effective date is required"
      )
      .bail()
      .isString()
      .withMessage(
        "Bus stop effective date must be a string"
      )
      .bail()
      .trim()
      .matches(
        /^\d{4}-\d{2}-\d{2}$/
      )
      .withMessage(
        "Bus stop effective date must be in YYYY-MM-DD format"
      ),

    body("reason")
      .isString()
      .withMessage(
        "Bus stop reason must be a string"
      )
      .trim()
      .isLength({
        min: 3,
        max: 250,
      })
      .withMessage(
        "Bus stop reason must contain 3 to 250 characters"
      ),

    body("refundMode")
      .optional({
        values: "falsy",
      })
      .isString()
      .withMessage(
        "Refund mode must be a string"
      )
      .trim()
      .customSanitizer((value) =>
        value.toUpperCase()
      )
      .equals("CASH")
      .withMessage(
        "Bus fee refund mode must be CASH"
      ),

    protectedFieldValidation(
      "refundAmount",
      "Bus refund amount is calculated by the server"
    ),
  ];

const busFacilityStopPreviewValidation =
  createBusStopBaseValidation();

const busFacilityStopValidation = [
  ...createBusStopBaseValidation(),

  body("confirmCashRefund")
    .exists()
    .withMessage(
      "Cash refund confirmation is required"
    )
    .bail()
    .isBoolean()
    .withMessage(
      "Cash refund confirmation must be true or false"
    )
    .toBoolean()
    .custom((value) => {
      if (value !== true) {
        throw new Error(
          "Cash refund confirmation must be true"
        );
      }

      return true;
    }),

  body("receivedBy")
    .optional({
      values: "falsy",
    })
    .isString()
    .withMessage(
      "Received by must be a string"
    )
    .trim()
    .isLength({
      min: 2,
      max: 100,
    })
    .withMessage(
      "Received by must contain 2 to 100 characters"
    ),

  body("remarks")
    .optional({
      values: "falsy",
    })
    .isString()
    .withMessage(
      "Remarks must be a string"
    )
    .trim()
    .isLength({
      max: 500,
    })
    .withMessage(
      "Remarks cannot exceed 500 characters"
    ),
];

// =====================================================
// Promote Student Validation
// ADMIN ONLY
// =====================================================
//
// Class and section change immediately.
// Promotion effective date is calculated by service:
//
// TEST_FEE_MODE=true
//   -> next fee period starts after 1 minute
//
// Production
//   -> next fee period starts on first day of next month
//
// =====================================================

const promoteStudentValidation = [
  body("studentId")
    .exists({
      values: "falsy",
    })
    .withMessage(
      "Student ID is required"
    )
    .bail()
    .isString()
    .withMessage(
      "Student ID must be a string"
    )
    .bail()
    .trim()
    .notEmpty()
    .withMessage(
      "Student ID is required"
    )
    .isLength({
      max: 100,
    })
    .withMessage(
      "Student ID cannot exceed 100 characters"
    ),

  body("toClass")
    .exists({
      values: "falsy",
    })
    .withMessage(
      "Promoted class is required"
    )
    .bail()
    .isString()
    .withMessage(
      "Promoted class must be a string"
    )
    .bail()
    .trim()
    .notEmpty()
    .withMessage(
      "Promoted class is required"
    )
    .isLength({
      max: 100,
    })
    .withMessage(
      "Promoted class cannot exceed 100 characters"
    ),

  body("section")
    .optional()
    .isString()
    .withMessage(
      "Section must be a string"
    )
    .bail()
    .trim()
    .isLength({
      max: 100,
    })
    .withMessage(
      "Section cannot exceed 100 characters"
    ),

  body("remarks")
    .optional({
      values: "falsy",
    })
    .isString()
    .withMessage(
      "Remarks must be a string"
    )
    .bail()
    .trim()
    .isLength({
      max: 500,
    })
    .withMessage(
      "Remarks cannot exceed 500 characters"
    ),

  protectedFieldValidation(
    "effectiveFrom",
    "Promotion fee effective date is set automatically"
  ),
];

// =====================================================
// Export
// =====================================================

module.exports = {
  createStudentValidation,
  updateStudentValidation,
  promoteStudentValidation,
  busFacilityStartValidation,
  busFacilityStopPreviewValidation,
  busFacilityStopValidation,
};
