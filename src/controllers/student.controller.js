const asyncHandler = require("../helpers/asyncHandler");

const sendResponse =
  require("../utils/response");

const studentService =
  require("../services/student.service");

// =====================================================
// Create Student
// ADMIN ONLY
// =====================================================

exports.createStudent = asyncHandler(
  async (req, res) => {
    const student =
      await studentService.createStudent(
        req.body,
        req.user.id
      );

    return sendResponse(
      res,
      201,
      true,
      "Student created successfully",
      student
    );
  }
);

// =====================================================
// Get All Students
// ADMIN / RECEPTIONIST
// =====================================================

exports.getAllStudents =
  asyncHandler(
    async (req, res) => {
      const students =
        await studentService.getAllStudents();

      return sendResponse(
        res,
        200,
        true,
        "Students fetched successfully",
        students
      );
    }
  );

// =====================================================
// Get Student By ID
// ADMIN / RECEPTIONIST
// =====================================================

exports.getStudentById =
  asyncHandler(
    async (req, res) => {
      const student =
        await studentService.getStudentById(
          req.params.id
        );

      return sendResponse(
        res,
        200,
        true,
        "Student fetched successfully",
        student
      );
    }
  );

// =====================================================
// Update Student
// ADMIN ONLY
// =====================================================

exports.updateStudent =
  asyncHandler(
    async (req, res) => {
      const student =
        await studentService.updateStudent(
          req.params.id,
          req.body,
          req.user.id
        );

      return sendResponse(
        res,
        200,
        true,
        "Student updated successfully",
        student
      );
    }
  );

// =====================================================
// Delete Student
// ADMIN ONLY
// =====================================================

exports.deleteStudent =
  asyncHandler(
    async (req, res) => {
      const student =
        await studentService.deleteStudent(
          req.params.id,
          req.user.id
        );

      return sendResponse(
        res,
        200,
        true,
        "Student deleted successfully",
        student
      );
    }
  );

// =====================================================
// Search Student For Payment
// PUBLIC
// =====================================================
//
// Student searches using:
// - Student ID
// - Mobile Number
//
// Only minimum required information should
// be returned by service.
//
// =====================================================

exports.searchStudent =
  asyncHandler(
    async (req, res) => {
      const student =
        await studentService.searchStudent(
          req.query.search
        );

      return sendResponse(
        res,
        200,
        true,
        "Student found successfully",
        student
      );
    }
  );

// =====================================================
// Promote Student
// ADMIN ONLY
// =====================================================
//
// Current class and section are updated immediately.
// New class fees become effective from the next
// configured fee period.
//
// The service handles:
// - Input and business-rule validation
// - Duplicate pending promotion protection
// - Fee structure lookup
// - Old and new fee snapshots
// - Atomic promotion history update
//
// =====================================================

exports.promoteStudent =
  asyncHandler(
    async (req, res) => {
      const result =
        await studentService.promoteStudent(
          req.body,
          req.user.id
        );

      return sendResponse(
        res,
        200,
        true,
        "Student promoted successfully",
        result
      );
    }
  );
