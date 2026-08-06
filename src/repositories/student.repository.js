const Student = require("../models/Student");

// =====================================================
// Allowed Discount Types
// =====================================================

const ALLOWED_DISCOUNT_TYPES = [
  "NONE",
  "SIBLING",
  "RTE",
  "GIRL",
];

// =====================================================
// Normalize Discount Type
// =====================================================

const normalizeDiscountType = (
  feeDiscountType
) => {
  const discountType =
    feeDiscountType || "NONE";

  if (
    !ALLOWED_DISCOUNT_TYPES.includes(
      discountType
    )
  ) {
    throw new Error(
      "Invalid fee discount type"
    );
  }

  return discountType;
};

// =====================================================
// Normalize Fee Values
// =====================================================

const normalizeFeeValues = ({
  admissionFee = 0,
  monthlyFee = 0,
  examFee = 0,
  sportFee = 0,
  computerFee = 0,
  functionFee = 0,
  smartClassFee = 0,
  otherCharges = 0,
}) => {
  const fees = {
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
  };

  for (
    const [key, value]
    of Object.entries(fees)
  ) {
    if (
      !Number.isFinite(value)
    ) {
      throw new Error(
        `${key} must be a valid number`
      );
    }

    if (value < 0) {
      throw new Error(
        `${key} cannot be negative`
      );
    }
  }

  return fees;
};

// =====================================================
// Calculate Discounted Fee Heads
// =====================================================
//
// NONE
// No discount
//
// SIBLING
// Monthly 20%
//
// RTE
// All 100%
//
// GIRL
// Admission 50%
//
// =====================================================

const calculateDiscountedFees = (
  feeHeads,
  feeDiscountType = "NONE"
) => {
  const originalFees =
    normalizeFeeValues(
      feeHeads
    );

  const discountType =
    normalizeDiscountType(
      feeDiscountType
    );

  switch (discountType) {
    case "SIBLING":
      return {
        admissionFee:
          originalFees.admissionFee,

        monthlyFee:
          originalFees.monthlyFee *
          0.8,

        examFee:
          originalFees.examFee,

        sportFee:
          originalFees.sportFee,

        computerFee:
          originalFees.computerFee,

        functionFee:
          originalFees.functionFee,

        smartClassFee:
          originalFees.smartClassFee,

        otherCharges:
          originalFees.otherCharges,
      };

    case "RTE":
      return {
        admissionFee: 0,
        monthlyFee: 0,
        examFee: 0,
        sportFee: 0,
        computerFee: 0,
        functionFee: 0,
        smartClassFee: 0,
        otherCharges: 0,
      };

    case "GIRL":
      return {
        admissionFee:
          originalFees.admissionFee *
          0.5,

        monthlyFee:
          originalFees.monthlyFee,

        examFee:
          originalFees.examFee,

        sportFee:
          originalFees.sportFee,

        computerFee:
          originalFees.computerFee,

        functionFee:
          originalFees.functionFee,

        smartClassFee:
          originalFees.smartClassFee,

        otherCharges:
          originalFees.otherCharges,
      };

    case "NONE":
    default:
      return {
        ...originalFees,
      };
  }
};

// =====================================================
// Calculate Effective Fee Total
// =====================================================

const calculateEffectiveFeeTotal = (
  feeHeads,
  feeDiscountType = "NONE"
) => {
  const discountedFees =
    calculateDiscountedFees(
      feeHeads,
      feeDiscountType
    );

  const total =
    discountedFees.admissionFee +
    discountedFees.monthlyFee +
    discountedFees.examFee +
    discountedFees.sportFee +
    discountedFees.computerFee +
    discountedFees.functionFee +
    discountedFees.smartClassFee +
    discountedFees.otherCharges;

  return Number(
    total.toFixed(2)
  );
};

// =====================================================
// Calculate Student Total Fee
// =====================================================

const calculateStudentTotalFee = (
  feeHeads,
  openingDue = 0,
  feeDiscountType = "NONE"
) => {
  const effectiveFeeTotal =
    calculateEffectiveFeeTotal(
      feeHeads,
      feeDiscountType
    );

  const finalOpeningDue =
    Number(openingDue || 0);

  if (
    !Number.isFinite(
      finalOpeningDue
    ) ||
    finalOpeningDue < 0
  ) {
    throw new Error(
      "Opening due must be a valid non-negative number"
    );
  }

  return Number(
    Math.max(
      effectiveFeeTotal +
      finalOpeningDue,
      0
    ).toFixed(2)
  );
};

// =====================================================
// Calculate Due Fee
// =====================================================

const calculateStudentDueFee = (
  totalFee,
  paidFee = 0
) => {
  const finalTotalFee =
    Number(totalFee || 0);

  const finalPaidFee =
    Number(paidFee || 0);

  if (
    !Number.isFinite(
      finalTotalFee
    ) ||
    finalTotalFee < 0
  ) {
    throw new Error(
      "Total fee must be a valid non-negative number"
    );
  }

  if (
    !Number.isFinite(
      finalPaidFee
    ) ||
    finalPaidFee < 0
  ) {
    throw new Error(
      "Paid fee must be a valid non-negative number"
    );
  }

  return Number(
    Math.max(
      finalTotalFee -
      finalPaidFee,
      0
    ).toFixed(2)
  );
};

// =====================================================
// Create Student
// =====================================================

const createStudent = async (
  data
) => {
  return await Student.create(
    data
  );
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

  if (admissionNo) {
    conditions.push({
      admissionNo:
        admissionNo.trim(),
    });
  }

  conditions.push({
    name:
      name?.trim(),

    fatherName:
      fatherName?.trim(),

    motherName:
      motherName?.trim() || "",

    className:
      className?.trim(),
  });

  return await Student.findOne({
    isDeleted: false,

    $or: conditions,
  });
};

// =====================================================
// Find By Student ID
// =====================================================

const findByStudentId = async (
  studentId
) => {
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

const getStudentById = async (
  id
) => {
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

const deleteStudent = async (
  id
) => {
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

const searchStudent = async (
  search
) => {
  const value =
    search.trim();

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

const updateFee = async (
  id,
  paidFee,
  dueFee,
  lumpSumData = null
) => {
  const finalPaidFee =
    Number(paidFee);

  const finalDueFee =
    Number(dueFee);

  if (
    !Number.isFinite(
      finalPaidFee
    ) ||
    finalPaidFee < 0
  ) {
    throw new Error(
      "Paid fee must be a valid non-negative number"
    );
  }

  if (
    !Number.isFinite(
      finalDueFee
    ) ||
    finalDueFee < 0
  ) {
    throw new Error(
      "Due fee must be a valid non-negative number"
    );
  }

  return await Student.findOneAndUpdate(
    {
      _id: id,

      isDeleted: false,
    },
    {
      $set: {
        paidFee: finalPaidFee,
        dueFee: finalDueFee,

        ...(lumpSumData
          ? {
            lumpSumPaid: lumpSumData.lumpSumPaid,
            lumpSumPaidTill:
              lumpSumData.lumpSumPaidTill,
            lumpSumDiscountType:
              lumpSumData.lumpSumDiscountType,
            lumpSumDiscountPercent:
              lumpSumData.lumpSumDiscountPercent,
            lumpSumDiscountAmount:
              lumpSumData.lumpSumDiscountAmount,
          }
          : {}),
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
  const finalDueFee =
    Number(dueFee);

  if (
    !Number.isFinite(
      finalDueFee
    ) ||
    finalDueFee < 0
  ) {
    throw new Error(
      "Due fee must be a valid non-negative number"
    );
  }

  return await Student.findOneAndUpdate(
    {
      _id: id,

      isDeleted: false,
    },
    {
      $set: {
        dueFee:
          finalDueFee,
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

const getStudentsByClass = async (
  className
) => {
  return await Student.find({
    className:
      className.trim(),

    isDeleted: false,

    status: "ACTIVE",
  });
};

// =====================================================
// Update All Students Fee By Class
// =====================================================

const updateStudentsFeeByClass =
  async (
    className,
    feeData,
    updatedBy
  ) => {
    const normalizedFees =
      normalizeFeeValues({
        admissionFee:
          feeData.admissionFee,

        monthlyFee:
          feeData.monthlyFee,

        examFee:
          feeData.examFee,

        sportFee:
          feeData.sportFee,

        computerFee:
          feeData.computerFee,

        functionFee:
          feeData.functionFee,

        smartClassFee:
          feeData.smartClassFee,

        otherCharges:
          feeData.otherCharges,
      });

    const students =
      await getStudentsByClass(
        className
      );

    const updatedStudents = [];

    for (
      const student of students
    ) {
      const paidFee =
        Number(
          student.paidFee || 0
        );

      const openingDue =
        Number(
          student.openingDue || 0
        );

      const feeDiscountType =
        normalizeDiscountType(
          student.feeDiscountType
        );

      const totalFee =
        calculateStudentTotalFee(
          normalizedFees,
          openingDue,
          feeDiscountType
        );

      const dueFee =
        calculateStudentDueFee(
          totalFee,
          paidFee
        );

      const updatedStudent =
        await Student.findOneAndUpdate(
          {
            _id:
              student._id,

            isDeleted:
              false,
          },
          {
            $set: {
              admissionFee:
                normalizedFees.admissionFee,

              monthlyFee:
                normalizedFees.monthlyFee,

              examFee:
                normalizedFees.examFee,

              sportFee:
                normalizedFees.sportFee,

              computerFee:
                normalizedFees.computerFee,

              functionFee:
                normalizedFees.functionFee,

              smartClassFee:
                normalizedFees.smartClassFee,

              otherCharges:
                normalizedFees.otherCharges,

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

const updateIndividualStudentFees =
  async (
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

    const admissionFee =
      feeData.admissionFee !==
        undefined
        ? Number(
          feeData.admissionFee
        )
        : Number(
          student.admissionFee || 0
        );

    const monthlyFee =
      feeData.monthlyFee !==
        undefined
        ? Number(
          feeData.monthlyFee
        )
        : Number(
          student.monthlyFee || 0
        );

    const examFee =
      feeData.examFee !==
        undefined
        ? Number(
          feeData.examFee
        )
        : Number(
          student.examFee || 0
        );

    const sportFee =
      feeData.sportFee !==
        undefined
        ? Number(
          feeData.sportFee
        )
        : Number(
          student.sportFee || 0
        );

    const computerFee =
      feeData.computerFee !==
        undefined
        ? Number(
          feeData.computerFee
        )
        : Number(
          student.computerFee || 0
        );

    const functionFee =
      feeData.functionFee !==
        undefined
        ? Number(
          feeData.functionFee
        )
        : Number(
          student.functionFee || 0
        );

    const smartClassFee =
      feeData.smartClassFee !==
        undefined
        ? Number(
          feeData.smartClassFee
        )
        : Number(
          student.smartClassFee || 0
        );

    const otherCharges =
      feeData.otherCharges !==
        undefined
        ? Number(
          feeData.otherCharges
        )
        : Number(
          student.otherCharges || 0
        );

    const normalizedFees =
      normalizeFeeValues({
        admissionFee,

        monthlyFee,

        examFee,

        sportFee,

        computerFee,

        functionFee,

        smartClassFee,

        otherCharges,
      });

    const feeDiscountType =
      normalizeDiscountType(
        student.feeDiscountType
      );

    const openingDue =
      Number(
        student.openingDue || 0
      );

    const totalFee =
      calculateStudentTotalFee(
        normalizedFees,
        openingDue,
        feeDiscountType
      );

    const paidFee =
      Number(
        student.paidFee || 0
      );

    const dueFee =
      calculateStudentDueFee(
        totalFee,
        paidFee
      );

    return await Student.findOneAndUpdate(
      {
        _id:
          student._id,

        isDeleted:
          false,
      },
      {
        $set: {
          admissionFee:
            normalizedFees.admissionFee,

          monthlyFee:
            normalizedFees.monthlyFee,

          examFee:
            normalizedFees.examFee,

          sportFee:
            normalizedFees.sportFee,

          computerFee:
            normalizedFees.computerFee,

          functionFee:
            normalizedFees.functionFee,

          smartClassFee:
            normalizedFees.smartClassFee,

          otherCharges:
            normalizedFees.otherCharges,

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

  calculateDiscountedFees,

  calculateEffectiveFeeTotal,

  calculateStudentTotalFee,

  calculateStudentDueFee,

  normalizeDiscountType,
};