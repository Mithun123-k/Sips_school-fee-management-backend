const Student = require("../models/Student");

const createStudent = async (data) => {
  return await Student.create(data);
};

const findByMobile = async (mobile) => {
  return await Student.findOne({
    mobile,
    isDeleted: false,
  });
};

const findByStudentId = async (studentId) => {
  return await Student.findOne({
    studentId,
    isDeleted: false,
  });
};

const getAllStudents = async () => {
  return await Student.find({
    isDeleted: false,
  }).sort({
    createdAt: -1,
  });
};

const getStudentById = async (id) => {
  return await Student.findOne({
    _id: id,
    isDeleted: false,
  });
};

const updateStudent = async (id, data) => {
  return await Student.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};

const deleteStudent = async (id) => {
  return await Student.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
    },
    {
      new: true,
    }
  );
};

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

const updateFee = async (
  id,
  paidFee,
  dueFee
) => {

  return await Student.findByIdAndUpdate(
    id,
    {
      paidFee,
      dueFee,
    },
    {
      new: true,
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

