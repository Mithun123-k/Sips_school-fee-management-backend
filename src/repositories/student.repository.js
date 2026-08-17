const Student = require("../models/Student");
const mongoose = require("mongoose");

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
    String(
      feeDiscountType || "NONE"
    )
      .trim()
      .toUpperCase();

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
  // admissionNo,
  name,
  fatherName,
  motherName,
  className
) => {
  const conditions = [];

  // if (admissionNo) {
  //   conditions.push({
  //     admissionNo:
  //       admissionNo.trim(),
  //   });
  // }

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
// Promote Student
// =====================================================

const promoteStudent = async (
  id,
  data = {}
) => {
  const finalClassName =
    String(
      data.className || ""
    ).trim();

  const finalSection =
    String(
      data.section || ""
    ).trim();

  const finalTotalFee =
    Number(
      data.totalFee || 0
    );

  const promotionDueAmount =
    Number(
      data.promotionDueAmount ?? 0
    );

  const promotion =
    data.promotion;

  const updatedBy =
    data.updatedBy;

  if (!finalClassName) {
    throw new Error(
      "Promoted class is required"
    );
  }

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
      promotionDueAmount
    ) ||
    promotionDueAmount < 0
  ) {
    throw new Error(
      "Promotion due amount must be a valid non-negative number"
    );
  }

  if (
    !promotion ||
    typeof promotion !==
      "object" ||
    Array.isArray(promotion)
  ) {
    throw new Error(
      "Promotion history data is required"
    );
  }

  const effectiveFrom =
    new Date(
      promotion.effectiveFrom
    );

  if (
    Number.isNaN(
      effectiveFrom.getTime()
    )
  ) {
    throw new Error(
      "Valid promotion effective date is required"
    );
  }

  if (!updatedBy) {
    throw new Error(
      "Promoting user is required"
    );
  }

  /*
   * केवल नई class की बाकी सात fees
   * normalize और update होंगी।
   *
   * admissionFee को जानबूझकर
   * यहां शामिल नहीं किया गया है।
   */
  const normalizedFees =
    normalizeFeeValues({
      admissionFee: 0,

      monthlyFee:
        data.monthlyFee,

      examFee:
        data.examFee,

      sportFee:
        data.sportFee,

      computerFee:
        data.computerFee,

      functionFee:
        data.functionFee,

      smartClassFee:
        data.smartClassFee,

      otherCharges:
        data.otherCharges,
    });

  const now =
    new Date();

  return await Student.findOneAndUpdate(
    {
      _id: id,

      isDeleted: false,

      status: "ACTIVE",

      classPromotionHistory: {
        $not: {
          $elemMatch: {
            effectiveFrom: {
              $gt: now,
            },
          },
        },
      },
    },
    {
      $set: {
        className:
          finalClassName,

        section:
          finalSection,

        /*
         * admissionFee यहां set नहीं होगी,
         * इसलिए student की पुरानी
         * admissionFee unchanged रहेगी।
         */

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

        totalFee:
          finalTotalFee,

        updatedBy,
      },

      /*
       * Admission fee छोड़कर बाकी नई fees
       * existing dueFee में add होंगी।
       */
      $inc: {
        dueFee:
          promotionDueAmount,
      },

      $push: {
        classPromotionHistory:
          promotion,
      },
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

const searchStudent = async (search) => {
  const value = search.trim();

  return await Student.find({
    isDeleted: false,
    status: "ACTIVE",

    $or: [
      { studentId: value },
      { mobile: value },
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
// Stop Bus Facility And Record Cash Refund
// =====================================================

const stopBusFacility = async ({
  studentId,
  busFacilityHistory,
  busFacilityStopEffectiveFrom,
  busFacilityStoppedAt,
  busFacilityStoppedBy,
  paidFee,
  refund = null,
}) => {
  const update = {
    $set: {
      hasBusFacility: false,
      busFee: 0,
      busFacilityHistory,
      busFacilityStartEffectiveFrom:
        null,
      busFacilityStopEffectiveFrom,
      busFacilityStoppedAt,
      busFacilityStoppedBy,
      paidFee:
        Number(paidFee.toFixed(2)),
      updatedBy:
        busFacilityStoppedBy,
    },
  };

  if (refund) {
    update.$push = {
      busFeeRefunds: refund,
    };
  }

  return await Student.findOneAndUpdate(
    {
      studentId,
      isDeleted: false,
      status: "ACTIVE",
      hasBusFacility: true,
    },
    update,
    {
      new: true,
      runValidators: true,
    }
  );
};

// =====================================================
// Start Or Restart Bus Facility
// =====================================================

const startBusFacility = async ({
  studentId,
  busFee,
  busFacilityStartEffectiveFrom,
  period,
  updatedBy,
}) => {
  return await Student.findOneAndUpdate(
    {
      studentId,
      isDeleted: false,
      status: "ACTIVE",
      hasBusFacility: false,
    },
    {
      $set: {
        hasBusFacility: true,
        busFee:
          Number(busFee.toFixed(2)),
        busFacilityStartEffectiveFrom,
        busFacilityStopEffectiveFrom:
          null,
        busFacilityStoppedAt: null,
        busFacilityStoppedBy: null,
        updatedBy,
      },
      $push: {
        busFacilityHistory: period,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

// =====================================================
// Get Bus Refund Receipt
// =====================================================

const getBusRefundReceipt = async (
  identifier
) => {
  const value =
    String(identifier || "").trim();

  if (!value) {
    return null;
  }

  const refundConditions = [
    {
      "busFeeRefunds.refundNo":
        value,
    },
  ];

  if (
    mongoose.isValidObjectId(
      value
    )
  ) {
    refundConditions.push({
      "busFeeRefunds._id": value,
    });
  }

  const student =
    await Student.findOne({
      isDeleted: false,
      $or: refundConditions,
    })
      .select(
        "studentId admissionNo name fatherName className section busFeeRefunds"
      )
      .populate(
        "busFeeRefunds.refundedBy",
        "name role"
      );

  if (!student) {
    return null;
  }

  const refund =
    student.busFeeRefunds.find(
      (entry) =>
        entry.refundNo === value ||
        String(entry._id) === value
    );

  if (!refund) {
    return null;
  }

  return {
    ...refund.toObject(),
    student: {
      _id: student._id,
      studentId:
        student.studentId,
      admissionNo:
        student.admissionNo,
      name: student.name,
      fatherName:
        student.fatherName,
      className:
        student.className,
      section: student.section,
    },
  };
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

  promoteStudent,

  deleteStudent,

  searchStudent,

  updateFee,

  updateDueFee,

  stopBusFacility,

  startBusFacility,

  getBusRefundReceipt,

  getStudentsByClass,

  updateStudentsFeeByClass,

  updateIndividualStudentFees,

  calculateDiscountedFees,

  calculateEffectiveFeeTotal,

  calculateStudentTotalFee,

  calculateStudentDueFee,

  normalizeDiscountType,
};
