const feeRepository =
  require("../repositories/fee.repository");

const studentRepository =
  require("../repositories/student.repository");

const pendingOnlinePaymentRepository =
  require("../repositories/pendingOnlinePayment.repository");

const razorpay =
  require("../config/razorpay");

const generateReceiptNo =
  require("../utils/generateReceiptNo");

// =====================================================
// Allowed Fee Heads
// =====================================================

const ALLOWED_FEE_HEADS = [
  "ADMISSION",
  "MONTHLY",
  "EXAM",
  "SPORT",
  "COMPUTER",
  "FUNCTION",
  "SMART_CLASS",
  "OTHER",
];

// =====================================================
// Allowed Payment Types
// =====================================================

const ALLOWED_PAYMENT_TYPES = [
  "REGULAR",
  "LUMP_SUM",
];

// =====================================================
// Allowed Student Discount Types
// =====================================================

const ALLOWED_DISCOUNT_TYPES = [
  "NONE",
  "SIBLING",
  "RTE",
  "GIRL",
];

// =====================================================
// Lump Sum Configuration
// =====================================================
//
// Lump Sum available:
//
// APRIL
// MAY
// JUNE
// JULY
// AUGUST
//
// =====================================================

const LUMP_SUM_START_MONTH = 3; // April
const LUMP_SUM_END_MONTH = 7;   // August

// Additional 10% discount
// on eligible monthly fee

const LUMP_SUM_MONTHLY_DISCOUNT = 0.10;

// =====================================================
// Validate Fee Head
// =====================================================

const validateFeeHead = (
  feeHead
) => {
  if (
    !ALLOWED_FEE_HEADS.includes(
      feeHead
    )
  ) {
    throw new Error(
      "Invalid fee head"
    );
  }

  return feeHead;
};

// =====================================================
// Validate Payment Type
// =====================================================

const validatePaymentType = (
  paymentType
) => {
  const finalPaymentType =
    paymentType || "REGULAR";

  if (
    !ALLOWED_PAYMENT_TYPES.includes(
      finalPaymentType
    )
  ) {
    throw new Error(
      "Invalid payment type"
    );
  }

  return finalPaymentType;
};

// =====================================================
// Validate Student Discount Type
// =====================================================

const validateFeeDiscountType = (
  feeDiscountType
) => {
  const finalDiscountType =
    feeDiscountType || "NONE";

  if (
    !ALLOWED_DISCOUNT_TYPES.includes(
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
// Validate Amount
// =====================================================

const validateAmount = (
  amount
) => {
  const paymentAmount =
    Number(amount);

  if (
    !Number.isFinite(
      paymentAmount
    ) ||
    paymentAmount <= 0
  ) {
    throw new Error(
      "Amount must be greater than zero"
    );
  }

  return Number(
    paymentAmount.toFixed(2)
  );
};

// =====================================================
// Normalize Payment Type
// =====================================================
//
// Backward compatibility:
//
// isLumpSum: true
//      -> LUMP_SUM
//
// isLumpSum: false
//      -> REGULAR
//
// paymentType has priority.
//
// =====================================================

const normalizePaymentType = (
  paymentType,
  isLumpSum
) => {
  if (
    paymentType !== undefined &&
    paymentType !== null
  ) {
    return validatePaymentType(
      paymentType
    );
  }

  if (
    isLumpSum === true ||
    isLumpSum === "true"
  ) {
    return "LUMP_SUM";
  }

  return "REGULAR";
};

// =====================================================
// Get Student
// =====================================================

const getStudent = async (
  studentId
) => {
  if (
    !studentId ||
    typeof studentId !== "string"
  ) {
    throw new Error(
      "Student ID is required"
    );
  }

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
    student.status !== "ACTIVE"
  ) {
    throw new Error(
      "Student is not active"
    );
  }

  validateFeeDiscountType(
    student.feeDiscountType
  );

  return student;
};

// =====================================================
// Validate Due Amount
// =====================================================

const validateDueAmount = (
  paymentAmount,
  dueFee
) => {
  const currentDueFee =
    Number(dueFee || 0);

  if (
    !Number.isFinite(
      currentDueFee
    ) ||
    currentDueFee < 0
  ) {
    throw new Error(
      "Invalid student due fee"
    );
  }

  if (
    paymentAmount >
    currentDueFee
  ) {
    throw new Error(
      `Amount cannot be greater than due fee. Due fee is ₹${currentDueFee}`
    );
  }

  return Number(
    currentDueFee.toFixed(2)
  );
};

// =====================================================
// Get Original Fee Head Amount
// =====================================================

const getOriginalFeeHeadAmount = (
  student,
  feeHead
) => {
  switch (feeHead) {
    case "ADMISSION":
      return Number(
        student.admissionFee || 0
      );

    case "MONTHLY":
      return Number(
        student.monthlyFee || 0
      );

    case "EXAM":
      return Number(
        student.examFee || 0
      );

    case "SPORT":
      return Number(
        student.sportFee || 0
      );

    case "COMPUTER":
      return Number(
        student.computerFee || 0
      );

    case "FUNCTION":
      return Number(
        student.functionFee || 0
      );

    case "SMART_CLASS":
      return Number(
        student.smartClassFee || 0
      );

    case "OTHER":
      return Number(
        student.otherCharges || 0
      );

    default:
      throw new Error(
        "Invalid fee head"
      );
  }
};

// =====================================================
// Get Effective Fee Head Amount
// =====================================================
//
// NONE:
// Normal fee
//
// SIBLING:
// Monthly fee 20% discount
//
// RTE:
// All fees 100% discount
//
// GIRL:
// Admission fee 50% discount
//
// =====================================================

const getEffectiveFeeHeadAmount = (
  student,
  feeHead
) => {
  validateFeeHead(
    feeHead
  );

  const discountType =
    validateFeeDiscountType(
      student.feeDiscountType
    );

  const originalAmount =
    getOriginalFeeHeadAmount(
      student,
      feeHead
    );

  if (
    !Number.isFinite(
      originalAmount
    ) ||
    originalAmount < 0
  ) {
    throw new Error(
      `Invalid ${feeHead} fee`
    );
  }

  // ---------------------------------------------------
  // RTE
  // ---------------------------------------------------

  if (
    discountType === "RTE"
  ) {
    return 0;
  }

  // ---------------------------------------------------
  // SIBLING
  // Monthly 20%
  // ---------------------------------------------------

  if (
    discountType === "SIBLING" &&
    feeHead === "MONTHLY"
  ) {
    return Number(
      (
        originalAmount * 0.8
      ).toFixed(2)
    );
  }

  // ---------------------------------------------------
  // GIRL
  // Admission 50%
  // ---------------------------------------------------

  if (
    discountType === "GIRL" &&
    feeHead === "ADMISSION"
  ) {
    return Number(
      (
        originalAmount * 0.5
      ).toFixed(2)
    );
  }

  return Number(
    originalAmount.toFixed(2)
  );
};

// =====================================================
// Get Normal Monthly Fee
// =====================================================

const getNormalMonthlyFee = (
  student
) => {
  const discountType =
    validateFeeDiscountType(
      student.feeDiscountType
    );

  const monthlyFee =
    Number(
      student.monthlyFee || 0
    );

  if (
    !Number.isFinite(
      monthlyFee
    ) ||
    monthlyFee < 0
  ) {
    throw new Error(
      "Invalid monthly fee"
    );
  }

  switch (
  discountType
  ) {
    case "SIBLING":
      return Number(
        (
          monthlyFee * 0.8
        ).toFixed(2)
      );

    case "RTE":
      return 0;

    case "GIRL":
      return Number(
        monthlyFee.toFixed(2)
      );

    case "NONE":
    default:
      return Number(
        monthlyFee.toFixed(2)
      );
  }
};

// =====================================================
// Check Lump Sum Availability
// =====================================================

const isLumpSumAvailable = (
  currentDate = new Date()
) => {
  const date =
    new Date(currentDate);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    throw new Error(
      "Invalid current date"
    );
  }

  const month =
    date.getMonth();

  return (
    month >=
    LUMP_SUM_START_MONTH &&
    month <=
    LUMP_SUM_END_MONTH
  );
};

// =====================================================
// Get Academic Year
// =====================================================
//
// April -> March
//
// =====================================================

const getAcademicYear = (
  currentDate = new Date()
) => {
  const date =
    new Date(currentDate);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    throw new Error(
      "Invalid current date"
    );
  }

  const year =
    date.getFullYear();

  const month =
    date.getMonth();

  if (
    month >=
    LUMP_SUM_START_MONTH
  ) {
    return {
      startYear: year,
      endYear: year + 1,
    };
  }

  return {
    startYear: year - 1,
    endYear: year,
  };
};

// =====================================================
// Get Remaining Academic Months
// =====================================================
//
// Current month -> March
//
// August:
// August to March = 8 months
//
// =====================================================

// const getRemainingAcademicMonths = (
//   currentDate = new Date()
// ) => {
//   const today =
//     new Date(currentDate);

//   if (
//     Number.isNaN(
//       today.getTime()
//     )
//   ) {
//     throw new Error(
//       "Invalid current date"
//     );
//   }

//   const academicYear =
//     getAcademicYear(
//       today
//     );

//   const currentMonth =
//     today.getMonth();

//   const currentYear =
//     today.getFullYear();

//   const currentMonthDate =
//     new Date(
//       currentYear,
//       currentMonth,
//       1
//     );

//   const academicEndDate =
//     new Date(
//       academicYear.endYear,
//       2,
//       1
//     );

//   if (
//     currentMonthDate >
//     academicEndDate
//   ) {
//     return 0;
//   }

//   const months =
//     (
//       academicEndDate.getFullYear() -
//       currentMonthDate.getFullYear()
//     ) *
//     12 +
//     (
//       academicEndDate.getMonth() -
//       currentMonthDate.getMonth()
//     ) +
//     1;

//   return Math.max(
//     months,
//     0
//   );
// };

const getRemainingAcademicMonths = (
  student,
  currentDate = new Date()
) => {
  const today = new Date(currentDate);

  if (Number.isNaN(today.getTime())) {
    throw new Error("Invalid current date");
  }

  const feeStartDate = new Date(
    student.feeStartDate
  );

  if (Number.isNaN(feeStartDate.getTime())) {
    throw new Error("Invalid fee start date");
  }

  // =====================================
  // Academic Year
  // =====================================

  const academicYear =
    getAcademicYear(today);

  // =====================================
  // Academic Year Start
  // =====================================

  const academicStartDate = new Date(
    academicYear.startYear,
    3, // April
    1
  );

  // =====================================
  // Academic Year End
  // =====================================

  const academicEndDate = new Date(
    academicYear.endYear,
    2, // March
    1
  );

  // =====================================
  // Fee Start Month
  // =====================================

  const feeStartMonth = new Date(
    feeStartDate.getFullYear(),
    feeStartDate.getMonth(),
    1
  );

  // =====================================
  // Current Month
  // =====================================

  const currentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  // =====================================
  // Effective Start Month
  //
  // Future fee start:
  // use feeStartMonth
  //
  // Already started:
  // use current month
  // =====================================

  const effectiveStart =
    feeStartMonth > currentMonth
      ? feeStartMonth
      : currentMonth;

  // =====================================
  // Outside Academic Year
  // =====================================

  if (
    effectiveStart < academicStartDate ||
    effectiveStart > academicEndDate
  ) {
    return 0;
  }

  // =====================================
  // Calculate remaining months
  // =====================================

  const months =
    (
      academicEndDate.getFullYear() -
      effectiveStart.getFullYear()
    ) *
      12 +
    (
      academicEndDate.getMonth() -
      effectiveStart.getMonth()
    ) +
    1;

  return Math.max(
    months,
    0
  );
};

// =====================================================
// Calculate Lump Sum Monthly Fee
// =====================================================
//
// NONE:
// Normal monthly - extra 10%
//
// GIRL:
// Normal monthly - extra 10%
//
// SIBLING:
// Already 20% discount.
// No additional 10%.
//
// RTE:
// 0
//
// =====================================================

const calculateLumpSumMonthlyFee = (
  student
) => {
  const discountType =
    validateFeeDiscountType(
      student.feeDiscountType
    );

  const normalMonthlyFee =
    getNormalMonthlyFee(
      student
    );

  if (
    discountType === "RTE"
  ) {
    return 0;
  }

  if (
    discountType === "SIBLING"
  ) {
    return normalMonthlyFee;
  }

  return Number(
    (
      normalMonthlyFee *
      (
        1 -
        LUMP_SUM_MONTHLY_DISCOUNT
      )
    ).toFixed(2)
  );
};

// =====================================================
// Get Normal One-Time Fees
// =====================================================

const getNormalOneTimeFees = (
  student
) => {
  const feeHeads = [
    "ADMISSION",
    "EXAM",
    "SPORT",
    "COMPUTER",
    "FUNCTION",
    "SMART_CLASS",
    "OTHER",
  ];

  return Number(
    feeHeads
      .reduce(
        (
          total,
          feeHead
        ) =>
          total +
          getEffectiveFeeHeadAmount(
            student,
            feeHead
          ),
        0
      )
      .toFixed(2)
  );
};

// =====================================================
// Get Paid Fee Head Amounts
// =====================================================

const getPaidFeeHeadAmounts = async (
  student
) => {
  const history =
    await feeRepository.getFeeHistory(
      student.studentId
    );

  const paid = {
    ADMISSION: 0,
    MONTHLY: 0,
    EXAM: 0,
    SPORT: 0,
    COMPUTER: 0,
    FUNCTION: 0,
    SMART_CLASS: 0,
    OTHER: 0,
  };

  for (
    const fee of history || []
  ) {
    if (
      fee.paymentStatus !==
      "SUCCESS"
    ) {
      continue;
    }

    if (
      !Object.prototype.hasOwnProperty.call(
        paid,
        fee.feeHead
      )
    ) {
      continue;
    }

    paid[fee.feeHead] +=
      Number(
        fee.amount || 0
      );
  }

  return paid;
};

// =====================================================
// Calculate Lump Sum Details
// =====================================================

// const calculateLumpSumDetails = async (
//   student,
//   currentDate = new Date()
// ) => {
//   const discountType =
//     validateFeeDiscountType(
//       student.feeDiscountType
//     );

//   // -------------------------------------------------
//   // Availability
//   // -------------------------------------------------

//   if (
//     !isLumpSumAvailable(
//       currentDate
//     )
//   ) {
//     throw new Error(
//       "Lump Sum discount is available only from April to August"
//     );
//   }

//   // -------------------------------------------------
//   // RTE
//   // -------------------------------------------------

//   if (
//     discountType === "RTE"
//   ) {
//     return {
//       eligible: false,

//       reason:
//         "RTE student already has 100% fee discount",

//       paymentType:
//         "LUMP_SUM",

//       discountType,

//       monthlyDiscountPercentage: 0,

//       remainingMonths: 0,

//       normalMonthlyFee: 0,

//       lumpSumMonthlyFee: 0,

//       remainingMonthlyAmount: 0,

//       remainingOneTimeFees: 0,

//       remainingAcademicFee: 0,

//       additionalDiscount: 0,

//       lumpSumAmount: 0,
//     };
//   }

//   // -------------------------------------------------
//   // Paid History
//   // -------------------------------------------------

//   const paid =
//     await getPaidFeeHeadAmounts(
//       student
//     );

//   // -------------------------------------------------
//   // Remaining Months
//   // -------------------------------------------------

//   const remainingMonths =
//     getRemainingAcademicMonths(
//       currentDate
//     );

//   // -------------------------------------------------
//   // Monthly Fee
//   // -------------------------------------------------

//   const normalMonthlyFee =
//     getNormalMonthlyFee(
//       student
//     );

//   const remainingMonthlyAmount =
//     Number(
//       (
//         normalMonthlyFee *
//         remainingMonths
//       ).toFixed(2)
//     );

//   // -------------------------------------------------
//   // One-Time Fees
//   // -------------------------------------------------

//   const oneTimeFees =
//     getNormalOneTimeFees(
//       student
//     );

//   const alreadyPaidOneTime =
//     Number(
//       paid.ADMISSION || 0
//     ) +
//     Number(
//       paid.EXAM || 0
//     ) +
//     Number(
//       paid.SPORT || 0
//     ) +
//     Number(
//       paid.COMPUTER || 0
//     ) +
//     Number(
//       paid.FUNCTION || 0
//     ) +
//     Number(
//       paid.SMART_CLASS || 0
//     ) +
//     Number(
//       paid.OTHER || 0
//     );

//   const remainingOneTimeFees =
//     Number(
//       Math.max(
//         oneTimeFees -
//         alreadyPaidOneTime,
//         0
//       ).toFixed(2)
//     );

//   // -------------------------------------------------
//   // Normal Remaining Academic Fee
//   // -------------------------------------------------

//   const remainingAcademicFee =
//     Number(
//       (
//         remainingMonthlyAmount +
//         remainingOneTimeFees
//       ).toFixed(2)
//     );

//   // -------------------------------------------------
//   // Lump Sum Monthly Fee
//   // -------------------------------------------------

//   const lumpSumMonthlyFee =
//     calculateLumpSumMonthlyFee(
//       student
//     );

//   const lumpSumMonthlyTotal =
//     Number(
//       (
//         lumpSumMonthlyFee *
//         remainingMonths
//       ).toFixed(2)
//     );

//   // -------------------------------------------------
//   // Additional Discount
//   // -------------------------------------------------

//   let additionalDiscount = 0;

//   if (
//     discountType === "NONE" ||
//     discountType === "GIRL"
//   ) {
//     additionalDiscount =
//       Number(
//         (
//           remainingMonthlyAmount *
//           LUMP_SUM_MONTHLY_DISCOUNT
//         ).toFixed(2)
//       );
//   }

//   // SIBLING:
//   // Already gets 20%.
//   // No extra lump sum discount.

//   if (
//     discountType === "SIBLING"
//   ) {
//     additionalDiscount = 0;
//   }

//   // -------------------------------------------------
//   // Final Lump Sum Amount
//   // -------------------------------------------------

//   const lumpSumAmount =
//     Number(
//       Math.max(
//         lumpSumMonthlyTotal +
//         remainingOneTimeFees,
//         0
//       ).toFixed(2)
//     );

//   // -------------------------------------------------
//   // Discount Percentage
//   // -------------------------------------------------

//   const monthlyDiscountPercentage =
//     discountType === "NONE" ||
//       discountType === "GIRL"
//       ? 10
//       : 0;

//   return {
//     eligible: true,

//     paymentType:
//       "LUMP_SUM",

//     discountType,

//     monthlyDiscountPercentage,

//     remainingMonths,

//     normalMonthlyFee,

//     lumpSumMonthlyFee,

//     remainingMonthlyAmount,

//     remainingOneTimeFees,

//     remainingAcademicFee,

//     additionalDiscount,

//     lumpSumAmount,
//   };
// };


const calculateLumpSumDetails = async (
  student,
  currentDate = new Date()
) => {
  const discountType =
    validateFeeDiscountType(
      student.feeDiscountType
    );

  // -------------------------------------------------
  // Availability
  // -------------------------------------------------

  if (
    !isLumpSumAvailable(
      currentDate
    )
  ) {
    throw new Error(
      "Lump Sum discount is available only from April to August"
    );
  }

  // -------------------------------------------------
  // RTE
  // -------------------------------------------------

  if (
    discountType === "RTE"
  ) {
    return {
      eligible: false,

      reason:
        "RTE student already has 100% fee discount",

      paymentType:
        "LUMP_SUM",

      discountType,

      monthlyDiscountPercentage: 0,

      remainingMonths: 0,

      normalMonthlyFee: 0,

      lumpSumMonthlyFee: 0,

      remainingMonthlyAmount: 0,

      remainingOneTimeFees: 0,

      remainingAcademicFee: 0,

      additionalDiscount: 0,

      lumpSumAmount: 0,
    };
  }

  // -------------------------------------------------
  // Paid History
  // -------------------------------------------------

  const paid =
    await getPaidFeeHeadAmounts(
      student
    );

  // -------------------------------------------------
  // Fee Start Date
  // -------------------------------------------------

  const feeStartDate =
    student.feeStartDate
      ? new Date(
          student.feeStartDate
        )
      : null;

  if (
    !feeStartDate ||
    Number.isNaN(
      feeStartDate.getTime()
    )
  ) {
    return {
      eligible: false,

      reason:
        "Fee start date is not configured for this student",

      paymentType:
        "LUMP_SUM",

      discountType,

      monthlyDiscountPercentage: 0,

      remainingMonths: 0,

      normalMonthlyFee: 0,

      lumpSumMonthlyFee: 0,

      remainingMonthlyAmount: 0,

      remainingOneTimeFees: 0,

      remainingAcademicFee: 0,

      additionalDiscount: 0,

      lumpSumAmount: 0,
    };
  }

  // -------------------------------------------------
  // Academic Year
  //
  // April -> March
  // -------------------------------------------------

  const currentYear =
    currentDate.getFullYear();

  const currentMonth =
    currentDate.getMonth();

  const academicYearStartYear =
    currentMonth < 3
      ? currentYear - 1
      : currentYear;

  const academicYearStartDate =
    new Date(
      academicYearStartYear,
      3,
      1
    );

  const academicYearEnd =
    new Date(
      academicYearStartYear + 1,
      2,
      1
    );

  // -------------------------------------------------
  // Effective Fee Start
  // -------------------------------------------------

  const effectiveStartDate =
    feeStartDate >
    academicYearStartDate
      ? feeStartDate
      : academicYearStartDate;

  // -------------------------------------------------
  // Total Academic Months
  // -------------------------------------------------

  const totalAcademicMonths =
    (
      academicYearEnd.getFullYear() -
      effectiveStartDate.getFullYear()
    ) *
      12 +
    (
      academicYearEnd.getMonth() -
      effectiveStartDate.getMonth()
    ) +
    1;

  // -------------------------------------------------
  // Normal Monthly Fee
  // IMPORTANT:
  // Get ORIGINAL monthly fee.
  // Do NOT use discounted monthly fee here.
  // -------------------------------------------------

  const normalMonthlyFee =
    Number(
      student.monthlyFee || 0
    );

  // -------------------------------------------------
  // Already Paid Monthly Fee
  // -------------------------------------------------

  const monthlyPaid =
    Number(
      paid.MONTHLY || 0
    );

  // -------------------------------------------------
  // Already Paid Months
  // -------------------------------------------------

  const alreadyPaidMonths =
    normalMonthlyFee > 0
      ? Math.floor(
          monthlyPaid /
            normalMonthlyFee
        )
      : 0;

  // -------------------------------------------------
  // Remaining Months
  // -------------------------------------------------

  const remainingMonths =
    Math.max(
      totalAcademicMonths -
        alreadyPaidMonths,
      0
    );

  // -------------------------------------------------
  // Remaining Monthly Amount
  //
  // Example:
  // ₹1300 × 9 months
  // = ₹11,700
  //
  // NO DISCOUNT HERE
  // -------------------------------------------------

  const remainingMonthlyAmount =
    Number(
      (
        normalMonthlyFee *
        remainingMonths
      ).toFixed(2)
    );

  // -------------------------------------------------
  // One-Time Fees
  // -------------------------------------------------

  const oneTimeFees =
    getNormalOneTimeFees(
      student
    );

  const alreadyPaidOneTime =
    Number(
      paid.ADMISSION || 0
    ) +
    Number(
      paid.EXAM || 0
    ) +
    Number(
      paid.SPORT || 0
    ) +
    Number(
      paid.COMPUTER || 0
    ) +
    Number(
      paid.FUNCTION || 0
    ) +
    Number(
      paid.SMART_CLASS || 0
    ) +
    Number(
      paid.OTHER || 0
    );

  const remainingOneTimeFees =
    Number(
      Math.max(
        oneTimeFees -
          alreadyPaidOneTime,
        0
      ).toFixed(2)
    );

  // -------------------------------------------------
  // Normal Remaining Academic Fee
  // -------------------------------------------------

  const remainingAcademicFee =
    Number(
      (
        remainingMonthlyAmount +
        remainingOneTimeFees
      ).toFixed(2)
    );

  // -------------------------------------------------
  // Lump Sum Discount
  //
  // IMPORTANT:
  //
  // Discount is calculated ONCE
  // on the TOTAL remaining monthly fee.
  //
  // Example:
  //
  // ₹1300 × 9 = ₹11,700
  // 10% = ₹1,170
  // Final = ₹10,530
  //
  // NOT:
  // ₹1170 × 9
  // -------------------------------------------------

  let additionalDiscount = 0;

  if (
    discountType === "NONE" ||
    discountType === "GIRL"
  ) {
    additionalDiscount =
      Number(
        (
          remainingMonthlyAmount *
          LUMP_SUM_MONTHLY_DISCOUNT
        ).toFixed(2)
      );
  }

  // -------------------------------------------------
  // SIBLING
  //
  // Already gets 20% discount.
  // No additional Lump Sum discount.
  // -------------------------------------------------

  if (
    discountType === "SIBLING"
  ) {
    additionalDiscount = 0;
  }

  // -------------------------------------------------
  // Final Monthly Amount
  // -------------------------------------------------

  const discountedMonthlyAmount =
    Math.max(
      remainingMonthlyAmount -
        additionalDiscount,
      0
    );

  // -------------------------------------------------
  // Final Lump Sum Amount
  //
  // Monthly remaining amount after
  // one-time 10% discount
  // +
  // remaining one-time fees
  // -------------------------------------------------

  const lumpSumAmount =
    Number(
      Math.max(
        discountedMonthlyAmount +
          remainingOneTimeFees,
        0
      ).toFixed(2)
    );

  // -------------------------------------------------
  // Discount Percentage
  // -------------------------------------------------

  const monthlyDiscountPercentage =
    discountType === "NONE" ||
    discountType === "GIRL"
      ? 10
      : 0;

  // -------------------------------------------------
  // Response
  // -------------------------------------------------

  return {
    eligible: true,

    paymentType:
      "LUMP_SUM",

    discountType,

    monthlyDiscountPercentage,

    feeStartDate,

    totalAcademicMonths,

    alreadyPaidMonths,

    remainingMonths,

    normalMonthlyFee,

    remainingMonthlyAmount,

    remainingOneTimeFees,

    remainingAcademicFee,

    additionalDiscount,

    discountedMonthlyAmount,

    lumpSumAmount,
  };
};
// =====================================================
// Validate Lump Sum Payment
// =====================================================

const validateLumpSumPayment =
  async (
    student,
    paymentAmount
  ) => {
    const details =
      await calculateLumpSumDetails(
        student
      );

    if (
      !details.eligible
    ) {
      throw new Error(
        details.reason ||
        "Student is not eligible for Lump Sum payment"
      );
    }

    const expectedAmount =
      Number(
        Number(
          details.lumpSumAmount
        ).toFixed(2)
      );

    const actualAmount =
      Number(
        Number(
          paymentAmount
        ).toFixed(2)
      );

    if (
      actualAmount !==
      expectedAmount
    ) {
      throw new Error(
        `Lump Sum payment amount must be ₹${expectedAmount}`
      );
    }

    return details;
  };

// =====================================================
// RTE Payment Protection
// =====================================================

const validateRTEPayment =
  (
    student,
    currentDueFee
  ) => {
    if (
      student.feeDiscountType ===
      "RTE" &&
      Number(
        student.openingDue || 0
      ) === 0 &&
      Number(
        currentDueFee || 0
      ) === 0
    ) {
      throw new Error(
        "No fee is payable for this RTE student"
      );
    }
  };

// =====================================================
// Build Fee Payment Data
// =====================================================

const buildFeePaymentData = ({
  receiptNo,
  student,
  feeHead,
  amount,
  paymentType,
  paymentMode,
  transactionId,
  remarks,
  collectedBy,
  lumpSumDetails,
}) => {
  const isLumpSum =
    paymentType ===
    "LUMP_SUM";

  return {
    receiptNo,

    student:
      student._id,

    studentId:
      student.studentId,

    feeHead,

    amount,

    paymentType,

    feeDiscountType:
      student.feeDiscountType ||
      "NONE",

    lumpSumDiscountPercent:
      isLumpSum
        ? Number(
          lumpSumDetails
            ?.monthlyDiscountPercentage ||
          0
        )
        : 0,

    lumpSumDiscountAmount:
      isLumpSum
        ? Number(
          lumpSumDetails
            ?.additionalDiscount ||
          0
        )
        : 0,

    paymentMode,

    paymentStatus:
      "SUCCESS",

    transactionId:
      transactionId || "",

    remarks:
      remarks || "",

    collectedBy:
      collectedBy || null,
  };
};

// =====================================================
// Update Student After Payment
// =====================================================

const updateStudentAfterPayment = async (
  student,
  paymentAmount,
  paymentType,
  currentDueFee,
  lumpSumDetails = null
) => {
  const currentPaidFee = Number(student.paidFee || 0);
  const amount = Number(paymentAmount);

  if (
    !Number.isFinite(currentPaidFee) ||
    currentPaidFee < 0
  ) {
    throw new Error(
      "Paid fee must be a valid non-negative number"
    );
  }

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error(
      "Payment amount must be a valid positive number"
    );
  }

  const paidFee =
    currentPaidFee + amount;

  let newDueFee;

  if (paymentType === "LUMP_SUM") {
    newDueFee = 0;
  } else {
    newDueFee = Math.max(
      Number(currentDueFee || 0) - amount,
      0
    );
  }

  const updateData = {
    paidFee: Number(paidFee.toFixed(2)),
    dueFee: Number(newDueFee.toFixed(2)),
  };

  // =====================================================
  // LUMP SUM FLAGS
  // =====================================================

  if (paymentType === "LUMP_SUM") {
    updateData.lumpSumPaid = true;

    // validateLumpSumPayment() se jo till date/details
    // aa raha hai usko preserve karo
    if (lumpSumDetails) {
      if (lumpSumDetails.paidTill) {
        updateData.lumpSumPaidTill =
          lumpSumDetails.paidTill;
      } else if (lumpSumDetails.lumpSumPaidTill) {
        updateData.lumpSumPaidTill =
          lumpSumDetails.lumpSumPaidTill;
      }

      if (
        lumpSumDetails.discountType
      ) {
        updateData.lumpSumDiscountType =
          lumpSumDetails.discountType;
      }

      if (
        lumpSumDetails.discountPercent !==
        undefined
      ) {
        updateData.lumpSumDiscountPercent =
          Number(
            lumpSumDetails.discountPercent
          );
      }

      if (
        lumpSumDetails.discountAmount !==
        undefined
      ) {
        updateData.lumpSumDiscountAmount =
          Number(
            lumpSumDetails.discountAmount
          );
      }
    }
  }


  const updatedStudent =
    await studentRepository.updateFee(
      student._id,
      updateData.paidFee,
      updateData.dueFee,
      paymentType === "LUMP_SUM"
        ? {
          lumpSumPaid: true,
          lumpSumPaidTill:
            updateData.lumpSumPaidTill,
          lumpSumDiscountType:
            updateData.lumpSumDiscountType,
          lumpSumDiscountPercent:
            updateData.lumpSumDiscountPercent,
          lumpSumDiscountAmount:
            updateData.lumpSumDiscountAmount,
        }
        : null
    );

  if (!updatedStudent) {
    throw new Error(
      "Failed to update student fee"
    );
  }

  return updatedStudent;
};

// =====================================================
// Collect CASH Fee
// =====================================================

const collectFee = async (
  body,
  userId
) => {
  const {
    studentId,
    feeHead,
    amount,
    paymentMode,
    paymentType,
    transactionId,
    remarks,
    isLumpSum,
  } = body;

  // ===================================================
  // Fee Head
  // ===================================================

  validateFeeHead(
    feeHead
  );

  // ===================================================
  // CASH Only
  // ===================================================

  if (
    paymentMode !==
    "CASH"
  ) {
    throw new Error(
      "Manual fee collection is only allowed for CASH payment"
    );
  }

  // ===================================================
  // Student
  // ===================================================

  const student =
    await getStudent(
      studentId
    );

  // ===================================================
  // Amount
  // ===================================================

  const paymentAmount =
    validateAmount(
      amount
    );

  // ===================================================
  // Payment Type
  // ===================================================

  const finalPaymentType =
    normalizePaymentType(
      paymentType,
      isLumpSum
    );

  // ===================================================
  // Current Due
  // ===================================================

  const currentDueFee =
    Number(
      student.dueFee || 0
    );

  // ===================================================
  // Regular Payment
  // ===================================================
  //
  // REGULAR payment must always
  // be within current due fee.
  //
  // If dueFee = 0:
  // payment will be rejected.
  //

  if (
    finalPaymentType ===
    "REGULAR"
  ) {
    validateDueAmount(
      paymentAmount,
      currentDueFee
    );
  }

  // ===================================================
  // RTE Protection
  // ===================================================

  validateRTEPayment(
    student,
    currentDueFee
  );

  // ===================================================
  // Lump Sum
  // ===================================================
  //
  // IMPORTANT:
  //
  // Lump Sum is NOT dependent on
  // currentDueFee.
  //
  // Even if:
  //
  // dueFee = 0
  //
  // Lump Sum can still be paid
  // if the student is eligible.
  //
  // validateLumpSumPayment()
  // checks the actual Lump Sum
  // amount and eligibility.
  //

  let lumpSumDetails =
    null;

  if (
    finalPaymentType ===
    "LUMP_SUM"
  ) {
    // =================================================
    // Already Paid Lump Sum Protection
    // =================================================

    if (student.lumpSumPaid === true) {
      const error = new Error(
        "Lump Sum payment has already been paid for this student"
      );

      error.statusCode = 400;

      throw error;
    }

    lumpSumDetails =
      await validateLumpSumPayment(
        student,
        paymentAmount
      );
  }

  // ===================================================
  // Effective Fee Head Amount
  // ===================================================

  const effectiveFeeHeadAmount =
    getEffectiveFeeHeadAmount(
      student,
      feeHead
    );

  // ===================================================
  // Receipt
  // ===================================================

  const receiptNo =
    await generateReceiptNo();

  // ===================================================
  // Remarks
  // ===================================================

  const finalRemarks =
    finalPaymentType ===
      "LUMP_SUM"
      ? (
        remarks
          ? `${remarks} | Lump Sum Payment`
          : "Lump Sum Academic Fee Payment"
      )
      : (
        remarks || ""
      );

  // ===================================================
  // Create Fee Data
  // ===================================================

  const feeData =
    buildFeePaymentData({
      receiptNo,

      student,

      feeHead,

      amount:
        paymentAmount,

      paymentType:
        finalPaymentType,

      paymentMode:
        "CASH",

      transactionId:
        transactionId || "",

      remarks:
        finalRemarks,

      collectedBy:
        userId,

      lumpSumDetails,
    });

  // ===================================================
  // Create Fee
  // ===================================================

  const fee =
    await feeRepository.createFee(
      feeData
    );

  // ===================================================
  // Update Student
  // ===================================================

  const updatedStudent =
    await updateStudentAfterPayment(
      student,
      paymentAmount,
      finalPaymentType,
      currentDueFee
    );

  // ===================================================
  // Return
  // ===================================================

  return {
    fee,

    student: {
      studentId:
        updatedStudent.studentId,

      name:
        updatedStudent.name,

      paidFee:
        updatedStudent.paidFee,

      dueFee:
        updatedStudent.dueFee,

      feeDiscountType:
        updatedStudent.feeDiscountType,

      feeHead,

      effectiveFeeHeadAmount,

      paymentType:
        finalPaymentType,

      lumpSumDetails:
        finalPaymentType ===
          "LUMP_SUM"
          ? lumpSumDetails
          : null,
    },
  };
};

// =====================================================
// Create Online QR
// =====================================================

const createOnlineQR = async (
  body,
  userId = null
) => {
  const {
    studentId,
    feeHead,
    amount,
    paymentType,
    isLumpSum,
  } = body;

  // ===================================================
  // Fee Head
  // ===================================================

  validateFeeHead(
    feeHead
  );

  // ===================================================
  // Student
  // ===================================================

  const student =
    await getStudent(
      studentId
    );

  // ===================================================
  // Amount
  // ===================================================

  const paymentAmount =
    validateAmount(
      amount
    );

  // ===================================================
  // Payment Type
  // ===================================================

  const finalPaymentType =
    normalizePaymentType(
      paymentType,
      isLumpSum
    );

  // ===================================================
  // Current Due
  // ===================================================

  const currentDueFee =
    Number(
      student.dueFee || 0
    );

  // ===================================================
  // Regular Payment
  // ===================================================

  if (
    finalPaymentType ===
    "REGULAR"
  ) {
    validateDueAmount(
      paymentAmount,
      currentDueFee
    );
  }

  // ===================================================
  // RTE Protection
  // ===================================================

  validateRTEPayment(
    student,
    currentDueFee
  );


  // ===================================================
  // Lump Sum
  // ===================================================

  let lumpSumDetails = null;

  if (
    finalPaymentType ===
    "LUMP_SUM"
  ) {
    if (
      finalPaymentType ===
      "LUMP_SUM"
    ) {
      lumpSumDetails =
        await validateLumpSumPayment(
          student,
          paymentAmount
        );
    }


  }

  // ===================================================
  // Effective Fee Head
  // ===================================================

  const effectiveFeeHeadAmount =
    getEffectiveFeeHeadAmount(
      student,
      feeHead
    );

  // ===================================================
  // Razorpay Amount
  // ===================================================

  const razorpayAmount =
    Math.round(
      paymentAmount * 100
    );

  // ===================================================
  // Create Razorpay QR
  // ===================================================

  console.log("RAZORPAY KEY:", process.env.RAZORPAY_KEY_ID);
  console.log(
    "RAZORPAY SECRET EXISTS:",
    !!process.env.RAZORPAY_KEY_SECRET
  );

  console.log(
    "QR CODE OBJECT:",
    razorpay.qrCode
  );

  const qr =
    await razorpay.qrCode.create({
      type:
        "upi_qr",

      name:
        `School Fee ${student.studentId}`,

      usage:
        "single_use",

      fixed_amount:
        true,

      payment_amount:
        razorpayAmount,

      description:
        finalPaymentType ===
          "LUMP_SUM"
          ? `Lump Sum School Fee Payment - ${student.studentId}`
          : `${feeHead} Fee Payment - ${student.studentId}`,

      notes: {
        studentId:
          student.studentId,

        studentMongoId:
          student._id.toString(),

        feeHead,

        feeDiscountType:
          student.feeDiscountType ||
          "NONE",

        paymentType:
          finalPaymentType,
      },
    });

  // const qr = await razorpay.qrCode.create({
  //   type: "upi_qr",
  //   name: `School Fee ${student.studentId}`,
  //   usage: "single_use",
  //   fixed_amount: true,
  //   payment_amount: razorpayAmount,
  //   description: `School Fee Payment - ${student.studentId}`,
  // });

  // ===================================================
  // Save Pending Payment
  // ===================================================

  const pendingPayment =
    await pendingOnlinePaymentRepository
      .createPendingPayment({
        qrId:
          qr.id,

        student:
          student._id,

        studentId:
          student.studentId,

        feeHead,

        amount:
          paymentAmount,

        qrImageUrl:
          qr.image_url,

        createdBy:
          userId || null,

        status:
          "PENDING",

        paymentType:
          finalPaymentType,
      });

  // ===================================================
  // Return
  // ===================================================

  return {
    qrId:
      pendingPayment.qrId,

    studentId:
      pendingPayment.studentId,

    feeHead:
      pendingPayment.feeHead,

    amount:
      pendingPayment.amount,

    imageUrl:
      pendingPayment.qrImageUrl,

    status:
      "PENDING",

    paymentMode:
      "ONLINE",

    paymentStatus:
      "PENDING",

    feeDiscountType:
      student.feeDiscountType ||
      "NONE",

    paymentType:
      finalPaymentType,

    lumpSumDetails:
      finalPaymentType ===
        "LUMP_SUM"
        ? lumpSumDetails
        : null,
  };
};

// =====================================================
// Check Online Payment
// =====================================================

const checkOnlinePayment =
  async (
    qrId,
    userId = null
  ) => {
    // =================================================
    // Pending Payment
    // =================================================

    const pendingPayment =
      await pendingOnlinePaymentRepository
        .findByQrId(
          qrId
        );

    if (
      !pendingPayment
    ) {
      throw new Error(
        "Online payment request not found"
      );
    }

    // =================================================
    // Already Success
    // =================================================

    if (
      pendingPayment.status ===
      "SUCCESS"
    ) {
      const existingFee =
        pendingPayment.paymentId
          ? await feeRepository
            .findByTransactionId(
              pendingPayment.paymentId
            )
          : null;

      return {
        paid: true,

        status:
          "SUCCESS",

        qrId,

        paymentId:
          pendingPayment.paymentId,

        fee:
          existingFee,

        paymentType:
          pendingPayment.paymentType ||
          "REGULAR",
      };
    }

    // =================================================
    // Fetch Razorpay Payments
    // =================================================

    const response =
      await razorpay.qrCode
        .fetchPayments(
          qrId
        );

    const payments =
      response.items || [];

    // =================================================
    // Find Captured Payment
    // =================================================

    const successfulPayment =
      payments.find(
        (payment) =>
          payment.status ===
          "captured"
      );

    // =================================================
    // Still Pending
    // =================================================

    if (
      !successfulPayment
    ) {
      return {
        paid: false,

        status:
          "PENDING",

        qrId,

        feeHead:
          pendingPayment.feeHead,

        amount:
          pendingPayment.amount,

        paymentType:
          pendingPayment.paymentType ||
          "REGULAR",
      };
    }

    // =================================================
    // Payment Amount
    // =================================================

    const paidAmount =
      Number(
        successfulPayment.amount
      ) / 100;

    const pendingAmount =
      Number(
        pendingPayment.amount
      );

    // =================================================
    // Amount Check
    // =================================================

    if (
      Number(
        paidAmount.toFixed(2)
      ) !==
      Number(
        pendingAmount.toFixed(2)
      )
    ) {
      throw new Error(
        "Payment amount mismatch"
      );
    }

    // =================================================
    // Duplicate Protection
    // =================================================

    const existingFee =
      await feeRepository
        .findByTransactionId(
          successfulPayment.id
        );

    if (
      existingFee
    ) {
      await pendingOnlinePaymentRepository
        .markPaymentSuccess(
          qrId,
          successfulPayment.id
        );

      return {
        paid: true,

        status:
          "SUCCESS",

        qrId,

        paymentId:
          successfulPayment.id,

        receiptNo:
          existingFee.receiptNo,

        fee:
          existingFee,

        paymentType:
          pendingPayment.paymentType ||
          "REGULAR",
      };
    }

    // =================================================
    // Student
    // =================================================

    const student =
      await getStudent(
        pendingPayment.studentId
      );

    // =================================================
    // Current Due
    // =================================================

    const currentDueFee =
      Number(
        student.dueFee || 0
      );

    if (
      !Number.isFinite(
        currentDueFee
      ) ||
      currentDueFee < 0
    ) {
      throw new Error(
        "Invalid student due fee"
      );
    }

    // =================================================
    // Payment Type
    // =================================================

    const finalPaymentType =
      validatePaymentType(
        pendingPayment.paymentType ||
        "REGULAR"
      );

    // =================================================
    // Regular Payment
    // =================================================

    if (
      finalPaymentType ===
      "REGULAR"
    ) {
      validateDueAmount(
        paidAmount,
        currentDueFee
      );
    }

    // =================================================
    // RTE Protection
    // =================================================

    validateRTEPayment(
      student,
      currentDueFee
    );

    // =================================================
    // Lump Sum
    // =================================================

    let lumpSumDetails = null;

    if (
      finalPaymentType ===
      "LUMP_SUM"
    ) {
      // If current due is 0,
      // Lump Sum payment is not allowed.
      if (currentDueFee <= 0) {
        const error = new Error(
          "Amount cannot be greater than due fee. Due fee is ₹0"
        );

        error.statusCode = 400;

        throw error;
      }

      lumpSumDetails =
        await validateLumpSumPayment(
          student,
          paidAmount
        );
    }

    // =================================================
    // Receipt
    // =================================================

    const receiptNo =
      await generateReceiptNo();

    // =================================================
    // Discount Information
    // =================================================

    const lumpSumDiscountPercent =
      finalPaymentType ===
        "LUMP_SUM"
        ? Number(
          lumpSumDetails
            ?.monthlyDiscountPercentage ||
          0
        )
        : 0;

    const lumpSumDiscountAmount =
      finalPaymentType ===
        "LUMP_SUM"
        ? Number(
          lumpSumDetails
            ?.additionalDiscount ||
          0
        )
        : 0;

    // =================================================
    // Remarks
    // =================================================

    const finalRemarks =
      finalPaymentType ===
        "LUMP_SUM"
        ? "Online UPI QR Lump Sum Academic Fee Payment"
        : "Online UPI QR Payment";

    // =================================================
    // Create Fee
    // =================================================

    const fee =
      await feeRepository.createFee({
        receiptNo,

        student:
          student._id,

        studentId:
          student.studentId,

        feeHead:
          pendingPayment.feeHead,

        amount:
          Number(
            paidAmount.toFixed(2)
          ),

        paymentType:
          finalPaymentType,

        feeDiscountType:
          student.feeDiscountType ||
          "NONE",

        lumpSumDiscountPercent,

        lumpSumDiscountAmount,

        paymentMode:
          "ONLINE",

        paymentStatus:
          "SUCCESS",

        transactionId:
          successfulPayment.id,

        remarks:
          finalRemarks,

        collectedBy:
          userId || null,
      });

    // =================================================
    // Update Student
    // =================================================

    const updatedStudent =
      await updateStudentAfterPayment(
        student,
        paidAmount,
        finalPaymentType,
        currentDueFee
      );

    // =================================================
    // Mark Pending Success
    // =================================================

    await pendingOnlinePaymentRepository
      .markPaymentSuccess(
        qrId,
        successfulPayment.id
      );

    // =================================================
    // Return Success
    // =================================================

    return {
      paid: true,

      status:
        "SUCCESS",

      qrId,

      paymentId:
        successfulPayment.id,

      receiptNo,

      fee,

      student: {
        studentId:
          updatedStudent.studentId,

        name:
          updatedStudent.name,

        feeHead:
          pendingPayment.feeHead,

        paidFee:
          updatedStudent.paidFee,

        dueFee:
          updatedStudent.dueFee,

        feeDiscountType:
          updatedStudent.feeDiscountType ||
          "NONE",

        paymentType:
          finalPaymentType,

        lumpSumDetails:
          finalPaymentType ===
            "LUMP_SUM"
            ? lumpSumDetails
            : null,
      },
    };
  };

// =====================================================
// Get Lump Sum Preview
// =====================================================

const getLumpSumPreview =
  async (
    studentId
  ) => {
    const student =
      await getStudent(
        studentId
      );

    const details =
      await calculateLumpSumDetails(
        student
      );

    return {
      studentId:
        student.studentId,

      name:
        student.name,

      feeDiscountType:
        student.feeDiscountType ||
        "NONE",

      paymentType:
        "LUMP_SUM",

      ...details,
    };
  };

// =====================================================
// Fee History
// =====================================================

const getFeeHistory =
  async (
    studentId
  ) => {
    if (
      !studentId ||
      typeof studentId !==
      "string"
    ) {
      throw new Error(
        "Student ID is required"
      );
    }

    const student =
      await studentRepository
        .findByStudentId(
          studentId
        );

    if (!student) {
      throw new Error(
        "Student not found"
      );
    }

    return await feeRepository
      .getFeeHistory(
        student.studentId
      );
  };

// =====================================================
// Receipt Details
// =====================================================

const getReceipt = async (
  id
) => {
  if (!id) {
    throw new Error(
      "Receipt ID is required"
    );
  }

  const receipt =
    await feeRepository
      .getReceipt(
        id
      );

  if (!receipt) {
    throw new Error(
      "Receipt not found"
    );
  }

  return receipt;
};



const getAllFeeHistory = async () => {
  return await feeRepository.getAllFeeHistory();
};

// =====================================================
// Export
// =====================================================




module.exports = {
  collectFee,

  createOnlineQR,

  checkOnlinePayment,

  getFeeHistory,

  getReceipt,

  getLumpSumPreview,

  validateFeeHead,

  validatePaymentType,

  validateFeeDiscountType,

  validateAmount,

  validateDueAmount,

  getEffectiveFeeHeadAmount,

  getNormalMonthlyFee,

  calculateLumpSumMonthlyFee,

  calculateLumpSumDetails,

  validateLumpSumPayment,

  isLumpSumAvailable,

  getRemainingAcademicMonths,

  getAcademicYear,

  normalizePaymentType,

  getOriginalFeeHeadAmount,
  getAllFeeHistory,
};