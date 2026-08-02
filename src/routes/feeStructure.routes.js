const express = require("express");

const router = express.Router();

const feeStructureController =
  require("../controllers/feeStructure.controller");

const auth =
  require("../middleware/auth.middleware");

const authorize =
  require("../middleware/role.middleware");

const validate =
  require("../middleware/validation.middleware");

const {
  createFeeStructureValidation,
  updateFeeStructureValidation,
  updateIndividualStudentFeesValidation,
} = require("../validators/feeStructure.validator");

// =====================================================
// CREATE FEE STRUCTURE
// ADMIN ONLY
// =====================================================
//
// POST /api/fee-structures
//
// Example:
//
// {
//   "className": "5",
//   "admissionFee": 1000,
//   "monthlyFee": 1500,
//   "examFee": 500,
//   "sportFee": 200,
//   "computerFee": 300,
//   "functionFee": 200,
//   "smartClassFee": 300,
//   "otherCharges": 100
// }
//
// Create hone ke baad existing Class 5 students
// ki fee bhi automatically update hogi.
//

router.post(
  "/",

  auth,

  authorize("ADMIN"),

  createFeeStructureValidation,

  validate,

  feeStructureController
    .createFeeStructure
);

// =====================================================
// GET ALL FEE STRUCTURES
// ADMIN / RECEPTIONIST
// =====================================================
//
// GET /api/fee-structures
//

router.get(
  "/",

  auth,

  authorize(
    "ADMIN",
    "RECEPTIONIST"
  ),

  feeStructureController
    .getAllFeeStructures
);

// =====================================================
// GET FEE STRUCTURE BY CLASS
// ADMIN / RECEPTIONIST
// =====================================================
//
// IMPORTANT:
// /class/:className ko /:id se pehle rakha gaya hai.
//
// GET /api/fee-structures/class/5
//

router.get(
  "/class/:className",

  auth,

  authorize(
    "ADMIN",
    "RECEPTIONIST"
  ),

  feeStructureController
    .getFeeStructureByClass
);

// =====================================================
// UPDATE INDIVIDUAL STUDENT FEES
// ADMIN ONLY
// =====================================================
//
// IMPORTANT:
// Ye route FeeStructure ID use nahi karta.
// Ye Student ID use karta hai.
//
// PUT
// /api/fee-structures/student/:studentId
//
// Example:
//
// {
//   "monthlyFee": 1200,
//   "examFee": 500
// }
//
// Sirf selected student update hoga.
//

router.put(
  "/student/:studentId",

  auth,

  authorize("ADMIN"),

  updateIndividualStudentFeesValidation,

  validate,

  feeStructureController
    .updateIndividualStudentFees
);

// =====================================================
// GET FEE STRUCTURE BY ID
// ADMIN / RECEPTIONIST
// =====================================================
//
// GET /api/fee-structures/:id
//

router.get(
  "/:id",

  auth,

  authorize(
    "ADMIN",
    "RECEPTIONIST"
  ),

  feeStructureController
    .getFeeStructureById
);

// =====================================================
// UPDATE CLASS FEE STRUCTURE
// ADMIN ONLY
// =====================================================
//
// PUT /api/fee-structures/:id
//
// Example:
//
// {
//   "monthlyFee": 1800,
//   "examFee": 600
// }
//
// Is class ke saare active students ki fee
// automatically update hogi.
//
// Existing paidFee preserve rahega.
// openingDue preserve rahega.
// dueFee recalculate hoga.
//

router.put(
  "/:id",

  auth,

  authorize("ADMIN"),

  updateFeeStructureValidation,

  validate,

  feeStructureController
    .updateFeeStructure
);

// =====================================================
// DELETE FEE STRUCTURE
// ADMIN ONLY
// =====================================================
//
// DELETE /api/fee-structures/:id
//
// Soft delete.
//

router.delete(
  "/:id",

  auth,

  authorize("ADMIN"),

  feeStructureController
    .deleteFeeStructure
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;