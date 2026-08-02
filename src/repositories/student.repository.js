const Student = require("../models/Student");

// =====================================================
// Create Student
// =====================================================

const createStudent = async (data) => {
  return await Student.create(data);
};

// =====================================================
// Find Duplicate Student
// =====================================================

const findByAdmissionNo = async (
  admissionNo,
  name,
  fatherName,
  motherName,
  className
) => {
  const conditions = [];

  // Admission number check
  if (admissionNo) {
    conditions.push({
      admissionNo: admissionNo.trim(),
    });
  }

  // Student identity check
  conditions.push({
    name: name?.trim(),
    fatherName: fatherName?.trim(),
    motherName: motherName?.trim() || "",
    className: className?.trim(),
  });

  return await Student.findOne({
    isDeleted: false,
    $or: conditions,
  });
};

// =====================================================
// Find By Student ID
// =====================================================

const findByStudentId = async (studentId) => {
  return await Student.findOne({
    studentId,
    isDeleted: false,
  });
};

// =====================================================
// Get All Students
// =====================================================

const getAllStudents = async () => {
  return await Student.find({
    isDeleted: false,
  }).sort({
    createdAt: -1,
  });
};

// =====================================================
// Get Student By Mongo ID
// =====================================================

const getStudentById = async (id) => {
  return await Student.findOne({
    _id: id,
    isDeleted: false,
  });
};

// =====================================================
// Update Student
// =====================================================

const updateStudent = async (
  id,
  data
) => {
  return await Student.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    {
      $set: data,
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

// =====================================================
// Soft Delete Student
// =====================================================

const deleteStudent = async (id) => {
  return await Student.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    {
      $set: {
        isDeleted: true,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

// =====================================================
// Search Student
// =====================================================
//
// Public fee payment page.
//
// Search by:
// 1. Student ID
// 2. Mobile Number
//
// Only ACTIVE students are returned.
//

const searchStudent = async (search) => {
  const value = search.trim();

  return await Student.findOne({
    isDeleted: false,
    status: "ACTIVE",

    $or: [
      {
        studentId: value,
      },
      {
        mobile: value,
      },
    ],
  });
};

// =====================================================
// Update Paid Fee + Due Fee
// =====================================================
//
// Used after successful payment.
//
// DO NOT use this function for changing
// fee structure.
//

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
      $set: {
        paidFee: Number(paidFee),
        dueFee: Number(dueFee),
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

// =====================================================
// Update Due Fee
// =====================================================

const updateDueFee = async (
  id,
  dueFee
) => {
  return await Student.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    {
      $set: {
        dueFee: Number(dueFee),
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

// =====================================================
// Get Students By Class
// =====================================================
//
// Used when ADMIN updates fee structure
// for complete class.
//
// Example:
// Class 5
// → all Class 5 students
//

const getStudentsByClass = async (
  className
) => {
  return await Student.find({
    className: className.trim(),

    isDeleted: false,

    status: "ACTIVE",
  });
};

// =====================================================
// Update All Students Fee By Class
// =====================================================
//
// Applies class-wise fee structure to
// every student of that class.
//
// IMPORTANT:
// Existing paidFee is preserved.
//
// dueFee is recalculated:
//
// totalFee - paidFee
//
// OpeningDue is included in total.
//

const updateStudentsFeeByClass = async (
  className,
  feeData,
  updatedBy
) => {
  const {
    admissionFee,
    monthlyFee,
    examFee,
    sportFee,
    computerFee,
    functionFee,
    smartClassFee,
    otherCharges,
  } = feeData;

  // ===================================================
  // Calculate New Total Fee
  // ===================================================

  const feeTotal =
    Number(admissionFee || 0) +
    Number(monthlyFee || 0) +
    Number(examFee || 0) +
    Number(sportFee || 0) +
    Number(computerFee || 0) +
    Number(functionFee || 0) +
    Number(smartClassFee || 0) +
    Number(otherCharges || 0);

  // ===================================================
  // Get Students
  // ===================================================

  const students =
    await getStudentsByClass(
      className
    );

  // ===================================================
  // Update Each Student
  // ===================================================

  const updatedStudents = [];

  for (const student of students) {
    // Existing paid amount must not be lost
    const paidFee =
      Number(student.paidFee || 0);

    // Existing opening due must remain
    const openingDue =
      Number(student.openingDue || 0);

    // New total
    const totalFee =
      feeTotal + openingDue;

    // New due
    const dueFee =
      Math.max(
        totalFee - paidFee,
        0
      );

    const updatedStudent =
      await Student.findOneAndUpdate(
        {
          _id: student._id,
          isDeleted: false,
        },
        {
          $set: {
            admissionFee:
              Number(admissionFee || 0),

            monthlyFee:
              Number(monthlyFee || 0),

            examFee:
              Number(examFee || 0),

            sportFee:
              Number(sportFee || 0),

            computerFee:
              Number(computerFee || 0),

            functionFee:
              Number(functionFee || 0),

            smartClassFee:
              Number(smartClassFee || 0),

            otherCharges:
              Number(otherCharges || 0),

            totalFee,

            dueFee,

            updatedBy,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (updatedStudent) {
      updatedStudents.push(
        updatedStudent
      );
    }
  }

  return updatedStudents;
};

// =====================================================
// Update Individual Student Fee Heads
// =====================================================
//
// ADMIN can update one student's fee
// without changing the complete class.
//
// Example:
//
// Student Rahul
// Monthly Fee = 1500
//
// Admin changes:
// Monthly Fee = 1200
//
// Only Rahul is affected.
//

const updateIndividualStudentFees = async (
  studentId,
  feeData,
  updatedBy
) => {
  const student =
    await findByStudentId(
      studentId
    );

  if (!student) {
    return null;
  }

  // ===================================================
  // Current Fee Values
  // ===================================================

  const admissionFee =
    feeData.admissionFee !== undefined
      ? Number(feeData.admissionFee)
      : Number(student.admissionFee || 0);

  const monthlyFee =
    feeData.monthlyFee !== undefined
      ? Number(feeData.monthlyFee)
      : Number(student.monthlyFee || 0);

  const examFee =
    feeData.examFee !== undefined
      ? Number(feeData.examFee)
      : Number(student.examFee || 0);

  const sportFee =
    feeData.sportFee !== undefined
      ? Number(feeData.sportFee)
      : Number(student.sportFee || 0);

  const computerFee =
    feeData.computerFee !== undefined
      ? Number(feeData.computerFee)
      : Number(student.computerFee || 0);

  const functionFee =
    feeData.functionFee !== undefined
      ? Number(feeData.functionFee)
      : Number(student.functionFee || 0);

  const smartClassFee =
    feeData.smartClassFee !== undefined
      ? Number(
          feeData.smartClassFee
        )
      : Number(
          student.smartClassFee || 0
        );

  const otherCharges =
    feeData.otherCharges !== undefined
      ? Number(feeData.otherCharges)
      : Number(student.otherCharges || 0);

  // ===================================================
  // Calculate Total
  // ===================================================

  const feeTotal =
    admissionFee +
    monthlyFee +
    examFee +
    sportFee +
    computerFee +
    functionFee +
    smartClassFee +
    otherCharges;

  // ===================================================
  // Opening Due
  // ===================================================

  const openingDue =
    Number(student.openingDue || 0);

  const totalFee =
    feeTotal + openingDue;

  // ===================================================
  // Existing Paid Fee
  // ===================================================

  const paidFee =
    Number(student.paidFee || 0);

  // ===================================================
  // Calculate Due
  // ===================================================

  const dueFee =
    Math.max(
      totalFee - paidFee,
      0
    );

  // ===================================================
  // Update Student
  // ===================================================

  return await Student.findOneAndUpdate(
    {
      _id: student._id,
      isDeleted: false,
    },
    {
      $set: {
        admissionFee,

        monthlyFee,

        examFee,

        sportFee,

        computerFee,

        functionFee,

        smartClassFee,

        otherCharges,

        totalFee,

        dueFee,

        updatedBy,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

// =====================================================
// Export
// =====================================================

module.exports = {
  createStudent,

  findByAdmissionNo,

  findByStudentId,

  getAllStudents,

  getStudentById,

  updateStudent,

  deleteStudent,

  searchStudent,

  updateFee,

  updateDueFee,

  getStudentsByClass,

  updateStudentsFeeByClass,

  updateIndividualStudentFees,
};