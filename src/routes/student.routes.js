const express = require("express");

const router = express.Router();

const studentController =
  require("../controllers/student.controller");

const auth =
  require("../middleware/auth.middleware");

const authorize =
  require("../middleware/role.middleware");

const validate =
  require("../middleware/validation.middleware");

const {
  createStudentValidation,
  updateStudentValidation,
  promoteStudentValidation,
  busFacilityStartValidation,
  busFacilityStopPreviewValidation,
  busFacilityStopValidation,
} = require("../validators/student.validator");

// =====================================================
// PUBLIC
// Search Student For Fee Payment
// =====================================================
//
// Search by:
// - Student ID
// - Mobile Number
//
// Login is NOT required.
//
// Example:
// GET /api/students/search?search=STU1001
//
// =====================================================

router.get(
  "/search",
  studentController.searchStudent
);

// =====================================================
// CREATE STUDENT
// ADMIN ONLY
// =====================================================

router.post(
  "/",
  auth,
  authorize("ADMIN"),
  createStudentValidation,
  validate,
  studentController.createStudent
);

// =====================================================
// PROMOTE STUDENT
// ADMIN ONLY
// New class fee becomes effective from next fee period.
// =====================================================

router.post(
  "/promote",
  auth,
  authorize("ADMIN"),
  promoteStudentValidation,
  validate,
  studentController.promoteStudent
);

// =====================================================
// GET ALL STUDENTS
// ADMIN / RECEPTIONIST
// =====================================================

router.get(
  "/",
  auth,
  authorize(
    "ADMIN",
    "RECEPTIONIST"
  ),
  studentController.getAllStudents
);

// =====================================================
// BUS FACILITY STOP + CASH REFUND
// =====================================================

router.post(
  "/:studentId/bus-facility/start",
  auth,
  authorize("ADMIN"),
  busFacilityStartValidation,
  validate,
  studentController
    .startBusFacility
);

router.post(
  "/:studentId/bus-facility/stop-preview",
  auth,
  authorize("ADMIN"),
  busFacilityStopPreviewValidation,
  validate,
  studentController
    .previewBusFacilityCashRefund
);

router.post(
  "/:studentId/bus-facility/stop",
  auth,
  authorize("ADMIN"),
  busFacilityStopValidation,
  validate,
  studentController
    .stopBusFacilityWithCashRefund
);

router.get(
  "/:studentId/bus-fee-refunds",
  auth,
  authorize(
    "ADMIN",
    "RECEPTIONIST"
  ),
  studentController
    .getBusFeeRefundHistory
);

router.get(
  "/bus-fee-refunds/receipt/:identifier",
  auth,
  authorize(
    "ADMIN",
    "RECEPTIONIST"
  ),
  studentController
    .getBusFeeRefundReceipt
);

// =====================================================
// GET STUDENT BY MONGO ID
// ADMIN / RECEPTIONIST
// =====================================================

router.get(
  "/:id",
  // auth,
  // authorize(
  //   "ADMIN",
  //   "RECEPTIONIST"
  // ),
  studentController.getStudentById
);

// =====================================================
// UPDATE STUDENT
// ADMIN ONLY
// =====================================================

router.put(
  "/:id",
  auth,
  authorize("ADMIN"),
  updateStudentValidation,
  validate,
  studentController.updateStudent
);

// =====================================================
// DELETE STUDENT
// ADMIN ONLY
// =====================================================

router.delete(
  "/:id",
  auth,
  authorize("ADMIN"),
  studentController.deleteStudent
);

module.exports = router;
