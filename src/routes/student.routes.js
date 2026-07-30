const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const studentController = require("../controllers/student.controller");
const validate = require("../middleware/validation.middleware");
const { createStudentValidation, updateStudentValidation,} = require("../validators/student.validator");

router.get(
  "/test",
  auth,
  authorize("ADMIN"),
  (req, res) => {
    res.json({
      success: true,
      message: "Protected Route Working",
      user: req.user,
    });
  }
);






// Create Student
router.post(
  "/",
  auth,
  authorize("ADMIN", "RECEPTIONIST"),
  createStudentValidation,
  validate,
  studentController.createStudent
);

// Get All Students
router.get(
  "/",
  auth,
  authorize("ADMIN", "RECEPTIONIST"),
  studentController.getAllStudents
);

// Search Student
router.get(
  "/search/:search",
  auth,
  authorize("ADMIN", "RECEPTIONIST"),
  studentController.searchStudent
);

// Get Student By Id
router.get(
  "/:id",
  auth,
  authorize("ADMIN", "RECEPTIONIST"),
  studentController.getStudentById
);

// Update Student
router.put(
  "/:id",
  auth,
  authorize("ADMIN", "RECEPTIONIST"),
  updateStudentValidation,
  validate,
  studentController.updateStudent
);

// Delete Student
router.delete(
  "/:id",
  auth,
  authorize("ADMIN"),
  studentController.deleteStudent
);

module.exports = router;

module.exports = router;