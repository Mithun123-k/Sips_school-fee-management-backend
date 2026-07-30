const asyncHandler = require("../helpers/asyncHandler");
const sendResponse = require("../utils/response");

const studentService = require("../services/student.service");

// =======================================
// Create Student
// =======================================

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

// =======================================
// Get All Students
// =======================================

exports.getAllStudents = asyncHandler(async (req, res) => {

  console.log("🔥🔥🔥 GET ALL STUDENTS CONTROLLER REACHED");

  return res.status(200).json({
    success: true,
    message: "Controller is working",
    user: req.user
  });

});

// =======================================
// Get Student By Id
// =======================================

exports.getStudentById = asyncHandler(
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

// =======================================
// Search Student
// =======================================

exports.searchStudent = asyncHandler(
  async (req, res) => {

    const student =
      await studentService.searchStudent(
        req.params.search
      );

    return sendResponse(
      res,
      200,
      true,
      "Student found",
      student
    );

  }
);

// =======================================
// Update Student
// =======================================

exports.updateStudent = asyncHandler(
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

// =======================================
// Delete Student
// =======================================

exports.deleteStudent = asyncHandler(
  async (req, res) => {

    await studentService.deleteStudent(
      req.params.id
    );

    return sendResponse(
      res,
      200,
      true,
      "Student deleted successfully"
    );

  }
);