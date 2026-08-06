const studentRepository =
  require("../repositories/student.repository");

const feeRepository =
  require("../repositories/fee.repository");

const generateStudentId =
  require("../utils/generateStudentId");
const generateAdmissionNo = require("../utils/generateAdmission");

// =====================================================
// Constants
// =====================================================

const ALLOWED_FEE_DISCOUNT_TYPES = [
  "NONE",
  "SIBLING",
  "RTE",
  "GIRL",
];

const FEE_HEADS = [
  "admissionFee",
  "monthlyFee",
  "examFee",
  "sportFee",
  "computerFee",
  "functionFee",
  "smartClassFee",
  "otherCharges",
];

// =====================================================
// Calculate Fee Start Date
// =====================================================
//
// Production:
//
// Admission Date = 15 July
// Fee Start Date  = 01 August
//
// Test Mode:
//
// 1 minute = 1 month
//
// =====================================================

const calculateFeeStartDate = (
  admissionDate
) => {
  const date =
    new Date(admissionDate);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    throw new Error(
      "Invalid admission date"
    );
  }

  // ===================================================
  // TEST MODE
  // ===================================================

  if (
    process.env.TEST_FEE_MODE ===
    "true"
  ) {
    return new Date();
  }

  // ===================================================
  // PRODUCTION MODE
  // ===================================================

  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    1
  );
};

// =====================================================
// Validate Fee Discount Type
// =====================================================

const validateFeeDiscountType = (
  feeDiscountType
) => {
  const finalDiscountType =
    feeDiscountType || "NONE";

  if (
    !ALLOWED_FEE_DISCOUNT_TYPES.includes(
      finalDiscountType
    )
  ) {
    throw new Error(
      "Invalid fee discount type"
    );
  }

  return finalDiscountType;
};

// =====================================================
// Normalize Fee Value
// =====================================================

const normalizeFeeValue = (
  value,
  fieldName
) => {
  const amount =
    Number(value || 0);

  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new Error(
      `${fieldName} must be a valid non-negative number`
    );
  }

  return amount;
};

// =====================================================
// Validate All Fee Heads
// =====================================================

const validateFeeHeads = ({
  admissionFee = 0,
  monthlyFee = 0,
  examFee = 0,
  sportFee = 0,
  computerFee = 0,
  functionFee = 0,
  smartClassFee = 0,
  otherCharges = 0,
}) => {
  return {
    admissionFee:
      normalizeFeeValue(
        admissionFee,
        "Admission fee"
      ),

    monthlyFee:
      normalizeFeeValue(
        monthlyFee,
        "Monthly fee"
      ),

    examFee:
      normalizeFeeValue(
        examFee,
        "Exam fee"
      ),

    sportFee:
      normalizeFeeValue(
        sportFee,
        "Sport fee"
      ),

    computerFee:
      normalizeFeeValue(
        computerFee,
        "Computer fee"
      ),

    functionFee:
      normalizeFeeValue(
        functionFee,
        "Function fee"
      ),

    smartClassFee:
      normalizeFeeValue(
        smartClassFee,
        "Smart class fee"
      ),

    otherCharges:
      normalizeFeeValue(
        otherCharges,
        "Other charges"
      ),
  };
};

// =====================================================
// Calculate Discounted Fee Heads
// =====================================================
//
// SIBLING:
// Monthly Fee = 80%
//
// RTE:
// All fee heads = 0
//
// GIRL:
// Admission Fee = 50%
//
// =====================================================

const calculateDiscountedFeeHeads = (
  feeHeads,
  feeDiscountType
) => {
  const finalDiscountType =
    validateFeeDiscountType(
      feeDiscountType
    );

  const {
    admissionFee,
    monthlyFee,
    examFee,
    sportFee,
    computerFee,
    functionFee,
    smartClassFee,
    otherCharges,
  } = feeHeads;

  switch (
  finalDiscountType
  ) {
    // =================================================
    // SIBLING
    // =================================================

    case "SIBLING":
      return {
        admissionFee,

        monthlyFee:
          monthlyFee * 0.8,

        examFee,

        sportFee,

        computerFee,

        functionFee,

        smartClassFee,

        otherCharges,
      };

    // =================================================
    // RTE
    // =================================================

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

    // =================================================
    // GIRL
    // =================================================

    case "GIRL":
      return {
        admissionFee:
          admissionFee * 0.5,

        monthlyFee,

        examFee,

        sportFee,

        computerFee,

        functionFee,

        smartClassFee,

        otherCharges,
      };

    // =================================================
    // NONE
    // =================================================

    case "NONE":
    default:
      return {
        admissionFee,

        monthlyFee,

        examFee,

        sportFee,

        computerFee,

        functionFee,

        smartClassFee,

        otherCharges,
      };
  }
};

// =====================================================
// Calculate Effective Fee Total
// =====================================================

const calculateEffectiveFeeTotal = (
  feeHeads,
  feeDiscountType
) => {
  const discountedFees =
    calculateDiscountedFeeHeads(
      feeHeads,
      feeDiscountType
    );

  return (
    discountedFees.admissionFee +
    discountedFees.monthlyFee +
    discountedFees.examFee +
    discountedFees.sportFee +
    discountedFees.computerFee +
    discountedFees.functionFee +
    discountedFees.smartClassFee +
    discountedFees.otherCharges
  );
};

// =====================================================
// Calculate Total Fee
// =====================================================

const calculateTotalFee = (
  feeHeads,
  openingDue,
  feeDiscountType
) => {
  const discountedFeeTotal =
    calculateEffectiveFeeTotal(
      feeHeads,
      feeDiscountType
    );

  const finalOpeningDue =
    normalizeFeeValue(
      openingDue,
      "Opening due"
    );

  return (
    discountedFeeTotal +
    finalOpeningDue
  );
};

// =====================================================
// Get Effective Monthly Fee
// =====================================================

const getEffectiveMonthlyFee = (
  student
) => {
  const discountType =
    validateFeeDiscountType(
      student.feeDiscountType
    );

  const monthlyFee =
    normalizeFeeValue(
      student.monthlyFee,
      "Monthly fee"
    );

  switch (
  discountType
  ) {
    case "SIBLING":
      return monthlyFee * 0.8;

    case "RTE":
      return 0;

    case "GIRL":
      return monthlyFee;

    case "NONE":
    default:
      return monthlyFee;
  }
};

// =====================================================
// Get Effective One-Time Fees
// =====================================================

const getEffectiveOneTimeFees = (
  student
) => {
  const feeHeads = {
    admissionFee:
      normalizeFeeValue(
        student.admissionFee,
        "Admission fee"
      ),

    monthlyFee:
      normalizeFeeValue(
        student.monthlyFee,
        "Monthly fee"
      ),

    examFee:
      normalizeFeeValue(
        student.examFee,
        "Exam fee"
      ),

    sportFee:
      normalizeFeeValue(
        student.sportFee,
        "Sport fee"
      ),

    computerFee:
      normalizeFeeValue(
        student.computerFee,
        "Computer fee"
      ),

    functionFee:
      normalizeFeeValue(
        student.functionFee,
        "Function fee"
      ),

    smartClassFee:
      normalizeFeeValue(
        student.smartClassFee,
        "Smart class fee"
      ),

    otherCharges:
      normalizeFeeValue(
        student.otherCharges,
        "Other charges"
      ),
  };

  const discounted =
    calculateDiscountedFeeHeads(
      feeHeads,
      student.feeDiscountType
    );

  return (
    discounted.admissionFee +
    discounted.examFee +
    discounted.sportFee +
    discounted.computerFee +
    discounted.functionFee +
    discounted.smartClassFee +
    discounted.otherCharges
  );
};

// =====================================================
// Calculate Accrued Months
// =====================================================

const calculateAccruedMonths = (
  feeStartDate,
  currentDate = new Date()
) => {
  const start =
    new Date(feeStartDate);

  const current =
    new Date(currentDate);

  if (
    Number.isNaN(
      start.getTime()
    )
  ) {
    return 0;
  }

  if (
    Number.isNaN(
      current.getTime()
    )
  ) {
    throw new Error(
      "Invalid current date"
    );
  }

  // ===================================================
  // TEST MODE
  // 1 minute = 1 month
  // ===================================================

  if (
    process.env.TEST_FEE_MODE ===
    "true"
  ) {
    const elapsedMilliseconds =
      current.getTime() -
      start.getTime();

    if (
      elapsedMilliseconds <= 0
    ) {
      return 1;
    }

    const elapsedMinutes =
      Math.floor(
        elapsedMilliseconds /
        (60 * 1000)
      );

    return (
      Math.max(
        elapsedMinutes,
        0
      ) + 1
    );
  }

  // ===================================================
  // Production Mode
  // ===================================================

  const startYear =
    start.getFullYear();

  const startMonth =
    start.getMonth();

  const currentYear =
    current.getFullYear();

  const currentMonth =
    current.getMonth();

  if (
    current <
    new Date(
      startYear,
      startMonth,
      1
    )
  ) {
    return 0;
  }

  return (
    (currentYear - startYear) *
    12 +
    (currentMonth -
      startMonth) +
    1
  );
};

// =====================================================
// Get Academic Year End Date
// =====================================================
//
// Example:
//
// Fee Start = August 2026
// Academic Year End = March 31, 2027
//
// Fee Start = January 2027
// Academic Year End = March 31, 2027
//
// Fee Start = April 2027
// Academic Year End = March 31, 2028
//
// =====================================================

const getAcademicYearEndDate = (
  feeStartDate
) => {
  const start =
    new Date(feeStartDate);

  if (
    Number.isNaN(
      start.getTime()
    )
  ) {
    return null;
  }

  const startMonth =
    start.getMonth();

  const startYear =
    start.getFullYear();

  // ===================================================
  // April to December
  // Academic year ends next year March
  // ===================================================

  if (
    startMonth >= 3
  ) {
    return new Date(
      startYear + 1,
      2,
      31,
      23,
      59,
      59,
      999
    );
  }

  // ===================================================
  // January to March
  // Academic year ends same year March
  // ===================================================

  return new Date(
    startYear,
    2,
    31,
    23,
    59,
    59,
    999
  );
};

// =====================================================
// Check Successful Lump Sum Payment
// =====================================================
//
// IMPORTANT:
//
// If at least one successful LUMP_SUM payment exists,
// future monthly fee will NOT be generated for the
// remaining months of the current academic year.
//
// Example:
//
// Monthly Fee = ₹1500
//
// Student pays complete LUMP_SUM amount.
//
// Then:
//
// Current month due = normal
// Future months      = ₹0
// Until March        = ₹0
//
// =====================================================

const hasActiveLumpSumPayment = async (
  student,
  currentDate = new Date()
) => {
  if (!student) {
    return false;
  }

  // ===================================================
  // TEST MODE
  // ===================================================
  //
  // In test mode we still check actual successful
  // lump-sum payment records.
  //

  const payments =
    await feeRepository.getLumpSumPayments(
      student.studentId
    );

  if (
    !Array.isArray(payments) ||
    payments.length === 0
  ) {
    return false;
  }

  const academicYearEnd =
    getAcademicYearEndDate(
      student.feeStartDate ||
      student.admissionDate
    );

  if (!academicYearEnd) {
    return false;
  }

  const current =
    new Date(currentDate);

  // ===================================================
  // If academic year is already over,
  // old lump-sum payment should not affect
  // next academic year.
  // ===================================================

  if (
    current >
    academicYearEnd
  ) {
    return false;
  }

  // ===================================================
  // Find valid lump-sum payment
  // ===================================================

  return payments.some(
    (payment) => {
      const paymentDate =
        new Date(
          payment.paymentDate ||
          payment.createdAt
        );

      if (
        Number.isNaN(
          paymentDate.getTime()
        )
      ) {
        return false;
      }

      // Payment must belong to current
      // academic year.

      return (
        paymentDate <=
        current &&
        paymentDate <=
        academicYearEnd
      );
    }
  );
};

// =====================================================
// Calculate Current Due Fee
// =====================================================
//
// Normal:
//
// Opening Due
// +
// One-Time Fees
// +
// Accrued Monthly Fees
// -
// Paid Fee
//
// Lump Sum:
//
// After successful LUMP_SUM payment:
//
// Opening Due
// +
// One-Time Fees
// +
// Already accrued monthly fees
// -
// Paid Fee
//
// Future monthly fees = 0
//
// =====================================================

const calculateCurrentDueFee = async (
  student,
  currentDate = new Date()
) => {
  const discountType =
    validateFeeDiscountType(
      student.feeDiscountType
    );

  const openingDue =
    normalizeFeeValue(
      student.openingDue,
      "Opening due"
    );

  const paidFee =
    normalizeFeeValue(
      student.paidFee,
      "Paid fee"
    );

  // ===================================================
  // RTE
  // ===================================================

  if (
    discountType === "RTE"
  ) {
    return Math.max(
      openingDue -
      paidFee,
      0
    );
  }

  // ===================================================
  // One-Time Fees
  // ===================================================

  const oneTimeFees =
    getEffectiveOneTimeFees(
      student
    );

  // ===================================================
  // Monthly Fee
  // ===================================================

  const monthlyFee =
    getEffectiveMonthlyFee(
      student
    );

  // ===================================================
  // Accrued Months
  // ===================================================

  const accruedMonths =
    student.feeStartDate
      ? calculateAccruedMonths(
        student.feeStartDate,
        currentDate
      )
      : 0;

  // ===================================================
  // Check Lump Sum
  // ===================================================

  const lumpSumPaid =
    await hasActiveLumpSumPayment(
      student,
      currentDate
    );

  // ===================================================
  // Monthly Fee Calculation
  // ===================================================

  let accruedMonthlyFee = 0;

  if (
    lumpSumPaid
  ) {
    // ===============================================
    // IMPORTANT
    //
    // Successful lump-sum payment means future
    // monthly fees are already covered.
    //
    // We do NOT generate additional monthly fees.
    //
    // ===============================================

    accruedMonthlyFee =
      0;
  } else {
    accruedMonthlyFee =
      monthlyFee *
      accruedMonths;
  }

  // ===================================================
  // Total Earned Fee
  // ===================================================

  const totalEarnedFee =
    openingDue +
    oneTimeFees +
    accruedMonthlyFee;

  // ===================================================
  // Current Due
  // ===================================================

  return Math.max(
    totalEarnedFee -
    paidFee,
    0
  );
};

// =====================================================
// Update Dynamic Due Fee
// =====================================================

const refreshStudentDueFee = async (
  student,
  currentDate = new Date()
) => {
  const dueFee =
    await calculateCurrentDueFee(
      student,
      currentDate
    );

  const currentDue =
    Number(
      student.dueFee || 0
    );

  if (
    Number(
      currentDue.toFixed(2)
    ) ===
    Number(
      dueFee.toFixed(2)
    )
  ) {
    return student;
  }

  const updatedStudent =
    await studentRepository.updateFee(
      student._id,
      Number(
        student.paidFee || 0
      ),
      dueFee
    );

  return (
    updatedStudent ||
    student
  );
};

// =====================================================
// Get Student By Student ID
// =====================================================

const getActiveStudentByStudentId =
  async (
    studentId
  ) => {
    const student =
      await studentRepository.findByStudentId(
        studentId
      );

    if (!student) {
      throw new Error(
        "Student not found"
      );
    }

    if (
      student.status !==
      "ACTIVE"
    ) {
      throw new Error(
        "Student is not active"
      );
    }

    return student;
  };

// =====================================================
// Create Student
// ADMIN ONLY
// =====================================================

const createStudent = async (
  body,
  userId
) => {
  const {
    // admissionNo,
    name,
    fatherName,
    motherName,
    mobile,
    email,
    gender,
    dob,
    className,
    section,
    address,
    admissionDate,

    admissionFee,
    monthlyFee,
    examFee,
    sportFee,
    computerFee,
    functionFee,
    smartClassFee,
    otherCharges,

    openingDue,

    feeDiscountType,
    

  } = body;

  // ===================================================
  // Duplicate Check
  // ===================================================

  const existingStudent =
    await studentRepository.findByAdmissionNo(
      // admissionNo,
      name,
      fatherName,
      motherName,
      className
    );

  if (
    existingStudent
  ) {
    // if (
    //   admissionNo &&
    //   existingStudent.admissionNo ===
    //   admissionNo
    // ) {
    //   throw new Error(
    //     "Student with this admission number already exists"
    //   );
    // }

    throw new Error(
      "Student with same name, father name, mother name and class already exists"
    );
  }

  // ===================================================
  // Generate Student ID
  // ===================================================

  const studentId =
    await generateStudentId();
    
    const admissionNo = await generateAdmissionNo();

  // ===================================================
  // Admission Date
  // ===================================================

  const finalAdmissionDate =
    admissionDate
      ? new Date(admissionDate)
      : new Date();

  if (
    Number.isNaN(
      finalAdmissionDate.getTime()
    )
  ) {
    throw new Error(
      "Invalid admission date"
    );
  }

  // ===================================================
  // Discount Type
  // ===================================================

  const finalFeeDiscountType =
    validateFeeDiscountType(
      feeDiscountType
    );

  // ===================================================
  // Fee Heads
  // ===================================================

  const feeHeads =
    validateFeeHeads({
      admissionFee,
      monthlyFee,
      examFee,
      sportFee,
      computerFee,
      functionFee,
      smartClassFee,
      otherCharges,
    });

  // ===================================================
  // Opening Due
  // ===================================================

  const finalOpeningDue =
    normalizeFeeValue(
      openingDue,
      "Opening due"
    );

  // ===================================================
  // Total Fee
  // ===================================================

  const totalFee =
    calculateTotalFee(
      feeHeads,
      finalOpeningDue,
      finalFeeDiscountType
    );

  // ===================================================
  // Initial Paid
  // ===================================================

  const paidFee = 0;

  // ===================================================
  // Initial Due
  // ===================================================

  const dueFee =
    finalOpeningDue;

  // ===================================================
  // Fee Start Date
  // ===================================================

  const feeStartDate =
    calculateFeeStartDate(
      finalAdmissionDate
    );

  // ===================================================
  // Create Student
  // ===================================================

  const student =
    await studentRepository.createStudent({
      studentId,

      admissionNo,

      name,

      fatherName,

      motherName:
        motherName || "",

      mobile,

      email:
        email || "",

      gender,

      dob:
        dob || null,

      className,

      section:
        section || "",

      address:
        address || "",

      admissionDate:
        finalAdmissionDate,

      feeDiscountType:
        finalFeeDiscountType,

      admissionFee:
        feeHeads.admissionFee,

      monthlyFee:
        feeHeads.monthlyFee,

      examFee:
        feeHeads.examFee,

      sportFee:
        feeHeads.sportFee,

      computerFee:
        feeHeads.computerFee,

      functionFee:
        feeHeads.functionFee,

      smartClassFee:
        feeHeads.smartClassFee,

      otherCharges:
        feeHeads.otherCharges,

      openingDue:
        finalOpeningDue,

      totalFee,

      paidFee,

      dueFee,

      feeStartDate,

      status:
        "ACTIVE",

      isDeleted:
        false,

      createdBy:
        userId,

      updatedBy:
        userId,
    });

  return student;
};

// =====================================================
// Get All Students
// =====================================================

const getAllStudents = async () => {
  const students =
    await studentRepository.getAllStudents();

  if (
    !Array.isArray(students)
  ) {
    return [];
  }

  const updatedStudents =
    await Promise.all(
      students.map(
        async (student) => {
          if (
            student.status !==
            "ACTIVE"
          ) {
            return student;
          }

          return await refreshStudentDueFee(
            student
          );
        }
      )
    );

  return updatedStudents;
};

// =====================================================
// Get Student By ID
// =====================================================

const getStudentById = async (
  id
) => {
  const student =
    await studentRepository.getStudentById(
      id
    );

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  if (
    student.status ===
    "ACTIVE"
  ) {
    return await refreshStudentDueFee(
      student
    );
  }

  return student;
};

// =====================================================
// Update Student
// ADMIN ONLY
// =====================================================

const updateStudent = async (
  id,
  body,
  userId
) => {
  const student =
    await studentRepository.getStudentById(
      id
    );

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  // ===================================================
  // Protected Fields
  // ===================================================

  const {
    paidFee,
    dueFee,
    totalFee,
    studentId,
    isDeleted,
    createdBy,
    ...updateData
  } = body;

  delete updateData.paidFee;
  delete updateData.dueFee;
  delete updateData.totalFee;
  delete updateData.openingDue;
  delete updateData.studentId;
  delete updateData.isDeleted;
  delete updateData.createdBy;

  // ===================================================
  // Discount Validation
  // ===================================================

  if (
    updateData.feeDiscountType !==
    undefined
  ) {
    updateData.feeDiscountType =
      validateFeeDiscountType(
        updateData.feeDiscountType
      );
  }

  // ===================================================
  // Admission Date
  // ===================================================

  if (
    updateData.admissionDate !==
    undefined
  ) {
    const newAdmissionDate =
      new Date(
        updateData.admissionDate
      );

    if (
      Number.isNaN(
        newAdmissionDate.getTime()
      )
    ) {
      throw new Error(
        "Invalid admission date"
      );
    }

    updateData.admissionDate =
      newAdmissionDate;

    updateData.feeStartDate =
      calculateFeeStartDate(
        newAdmissionDate
      );
  }

  // ===================================================
  // Current Fee Heads
  // ===================================================

  const currentFeeHeads = {
    admissionFee:
      Number(
        student.admissionFee || 0
      ),

    monthlyFee:
      Number(
        student.monthlyFee || 0
      ),

    examFee:
      Number(
        student.examFee || 0
      ),

    sportFee:
      Number(
        student.sportFee || 0
      ),

    computerFee:
      Number(
        student.computerFee || 0
      ),

    functionFee:
      Number(
        student.functionFee || 0
      ),

    smartClassFee:
      Number(
        student.smartClassFee || 0
      ),

    otherCharges:
      Number(
        student.otherCharges || 0
      ),
  };

  // ===================================================
  // Check Fee Fields Updated
  // ===================================================

  const feeFieldsUpdated =
    FEE_HEADS.some(
      (field) =>
        updateData[field] !==
        undefined
    );

  // ===================================================
  // Updated Fee Heads
  // ===================================================

  const updatedFeeHeads =
    validateFeeHeads({
      admissionFee:
        updateData.admissionFee !==
          undefined
          ? updateData.admissionFee
          : currentFeeHeads.admissionFee,

      monthlyFee:
        updateData.monthlyFee !==
          undefined
          ? updateData.monthlyFee
          : currentFeeHeads.monthlyFee,

      examFee:
        updateData.examFee !==
          undefined
          ? updateData.examFee
          : currentFeeHeads.examFee,

      sportFee:
        updateData.sportFee !==
          undefined
          ? updateData.sportFee
          : currentFeeHeads.sportFee,

      computerFee:
        updateData.computerFee !==
          undefined
          ? updateData.computerFee
          : currentFeeHeads.computerFee,

      functionFee:
        updateData.functionFee !==
          undefined
          ? updateData.functionFee
          : currentFeeHeads.functionFee,

      smartClassFee:
        updateData.smartClassFee !==
          undefined
          ? updateData.smartClassFee
          : currentFeeHeads.smartClassFee,

      otherCharges:
        updateData.otherCharges !==
          undefined
          ? updateData.otherCharges
          : currentFeeHeads.otherCharges,
    });

  // ===================================================
  // Save Updated Fee Heads
  // ===================================================

  if (
    feeFieldsUpdated
  ) {
    updateData.admissionFee =
      updatedFeeHeads.admissionFee;

    updateData.monthlyFee =
      updatedFeeHeads.monthlyFee;

    updateData.examFee =
      updatedFeeHeads.examFee;

    updateData.sportFee =
      updatedFeeHeads.sportFee;

    updateData.computerFee =
      updatedFeeHeads.computerFee;

    updateData.functionFee =
      updatedFeeHeads.functionFee;

    updateData.smartClassFee =
      updatedFeeHeads.smartClassFee;

    updateData.otherCharges =
      updatedFeeHeads.otherCharges;
  }

  // ===================================================
  // Final Discount Type
  // ===================================================

  const finalDiscountType =
    updateData.feeDiscountType !==
      undefined
      ? updateData.feeDiscountType
      : student.feeDiscountType ||
      "NONE";

  // ===================================================
  // Recalculate Total Fee
  // ===================================================

  if (
    feeFieldsUpdated ||
    updateData.feeDiscountType !==
    undefined
  ) {
    const finalOpeningDue =
      Number(
        student.openingDue || 0
      );

    updateData.totalFee =
      calculateTotalFee(
        updatedFeeHeads,
        finalOpeningDue,
        finalDiscountType
      );
  }

  // ===================================================
  // Duplicate Check
  // ===================================================

  const name =
    updateData.name ??
    student.name;

  const fatherName =
    updateData.fatherName ??
    student.fatherName;

  const motherName =
    updateData.motherName ??
    student.motherName;

  const className =
    updateData.className ??
    student.className;

  const admissionNo =
    updateData.admissionNo ??
    student.admissionNo;

  const existingStudent =
    await studentRepository.findByAdmissionNo(
      admissionNo,
      name,
      fatherName,
      motherName,
      className
    );

  if (
    existingStudent &&
    existingStudent._id.toString() !==
    student._id.toString()
  ) {
    throw new Error(
      "Another student with same details already exists"
    );
  }

  // ===================================================
  // Updated By
  // ===================================================

  updateData.updatedBy =
    userId;

  // ===================================================
  // Update Student
  // ===================================================

  const updatedStudent =
    await studentRepository.updateStudent(
      id,
      updateData
    );

  if (!updatedStudent) {
    throw new Error(
      "Student update failed"
    );
  }

  // ===================================================
  // Refresh Due
  // ===================================================

  return await refreshStudentDueFee(
    updatedStudent
  );
};

// =====================================================
// Delete Student
// ADMIN ONLY
// =====================================================

const deleteStudent = async (
  id,
  userId
) => {
  const student =
    await studentRepository.getStudentById(
      id
    );

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  const deletedStudent =
    await studentRepository.deleteStudent(
      id
    );

  if (!deletedStudent) {
    throw new Error(
      "Student delete failed"
    );
  }

  return deletedStudent;
};

// =====================================================
// Search Student For Payment
// PUBLIC
// =====================================================

const searchStudent = async (
  search
) => {
  if (
    !search ||
    typeof search !==
    "string" ||
    !search.trim()
  ) {
    throw new Error(
      "Student ID or mobile number is required"
    );
  }

  const cleanSearch =
    search.trim();

  const student =
    await studentRepository.searchStudent(
      cleanSearch
    );

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  if (
    student.status !==
    "ACTIVE"
  ) {
    throw new Error(
      "Student account is inactive"
    );
  }

  // ===================================================
  // Refresh Due
  // ===================================================

  const updatedStudent =
    await refreshStudentDueFee(
      student
    );

  // ===================================================
  // Public Payment Response
  // ===================================================

  return {
    studentId:
      updatedStudent.studentId,

    name:
      updatedStudent.name,

    fatherName:
      updatedStudent.fatherName,
    motherName:
      updatedStudent.motherName,

    admissionNo:
      updatedStudent.admissionNo,

    mobile:
      updatedStudent.mobile,

    email:
      updatedStudent.email,

    gender:
      updatedStudent.gender,

    dob:
      updatedStudent.dob,

    className:
      updatedStudent.className,

    section:
      updatedStudent.section,

    monthlyFee:
      Number(
        updatedStudent.monthlyFee ||
        0
      ),

    feeDiscountType:
      updatedStudent.feeDiscountType ||
      "NONE",

    dueFee:
      Number(
        updatedStudent.dueFee ||
        0
      ),

    status:
      updatedStudent.status,
  };
};

// =====================================================
// Get Current Due Fee
// =====================================================

const getCurrentDueFee = async (
  student
) => {
  return await calculateCurrentDueFee(
    student
  );
};

// =====================================================
// Export
// =====================================================

module.exports = {
  createStudent,

  getAllStudents,

  getStudentById,

  updateStudent,

  deleteStudent,

  searchStudent,

  calculateFeeStartDate,

  validateFeeDiscountType,

  calculateDiscountedFeeHeads,

  calculateEffectiveFeeTotal,

  calculateTotalFee,

  getEffectiveMonthlyFee,

  getEffectiveOneTimeFees,

  calculateAccruedMonths,

  getAcademicYearEndDate,

  hasActiveLumpSumPayment,

  calculateCurrentDueFee,

  getCurrentDueFee,
};