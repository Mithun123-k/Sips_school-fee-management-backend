const Student = require("../models/Student");

// ============================
// Create Student
// ============================

const createStudent = async (data) => {
  return await Student.create(data);
};

// ============================
// Find By Mobile
// ============================

const findByMobile = async (mobile) => {
  return await Student.findOne({
    mobile,
    isDeleted: false,
  });
};

// ============================
// Find By Student ID
// ============================

const findByStudentId = async (studentId) => {
  return await Student.findOne({
    studentId,
    isDeleted: false,
  });
};

// ============================
// Get All Students
// ============================

const getAllStudents = async () => {
  return await Student.find({
    isDeleted: false,
  }).sort({
    createdAt: -1,
  });
};

// ============================
// Get Student By ID
// ============================

const getStudentById = async (id) => {
  return await Student.findOne({
    _id: id,
    isDeleted: false,
  });
};

// ============================
// Update Student
// ============================

const updateStudent = async (id, data) => {
  return await Student.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};

// ============================
// Delete Student
// ============================

const deleteStudent = async (id) => {
  return await Student.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    {
      isDeleted: true,
    },
    {
      new: true,
    }
  );
};

// ============================
// Search Student
// ============================

const searchStudent = async (search) => {
  return await Student.findOne({
    isDeleted: false,
    $or: [
      {
        studentId: search,
      },
      {
        mobile: search,
      },
    ],
  });
};

// ============================
// Update Fee
// ============================

const updateFee = async (
  id,
  paidFee,
  dueFee
) => {
  return await Student.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    {
      paidFee,
      dueFee,
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

module.exports = {
  createStudent,
  findByMobile,
  findByStudentId,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  searchStudent,
  updateFee,
};