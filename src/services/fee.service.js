const feeRepository =
  require("../repositories/fee.repository");

const studentRepository =
  require("../repositories/student.repository");

const pendingOnlinePaymentRepository =
  require("../repositories/pendingOnlinePayment.repository");

const monthlyFeeWaiverRepository =
  require("../repositories/monthlyFeeWaiver.repository");

const razorpay =
  require("../config/razorpay");

const generateReceiptNo =
  require("../utils/generateReceiptNo");

const {
  calculateMonthlyFee,
  calculateMonthWiseLateFee,
} = require("../utils/calculateStudentFee");

const {
  getFeeSnapshotForDate,
  calculateAccruedMonthlyFee,
} = require("../utils/studentPromotionFee");

const {
  calculateAccruedBusFee,
  getBusFacilityPeriods,
} = require("../utils/calculateBusFee");

const {
  normalizeAcademicYear,
  normalizeAcademicMonth,
  getAcademicMonthKey,
  getCalendarMonthKey,
} = require("../utils/monthlyFeeWaiver");

// =====================================================
// Allowed Fee Heads
// =====================================================

const ALLOWED_FEE_HEADS = [
  "ADMISSION",
  "MONTHLY",
  "BUS",
  "EXAM",
  "SPORT",
  "COMPUTER",
  "FUNCTION",
  "SMART_CLASS",
  "OTHER",
  "LATE_FEE",
  "OPENING_DUE",
  "ALL",
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

const LUMP_SUM_START_MONTH = 3; // April
const LUMP_SUM_END_MONTH = 7; // August

// Additional 10% discount
const LUMP_SUM_MONTHLY_DISCOUNT = 0.10;

// =====================================================
// Validate Fee Head
// =====================================================

const validateFeeHead = (feeHead) => {
  const normalizedFeeHead =
    String(feeHead || "")
      .trim()
      .toUpperCase();

  if (
    !ALLOWED_FEE_HEADS.includes(
      normalizedFeeHead
    )
  ) {
    throw new Error(
      "Invalid fee head"
    );
  }

  return normalizedFeeHead;
};

// =====================================================
// Validate Payment Type
// =====================================================

const validatePaymentType = (
  paymentType
) => {
  const finalPaymentType =
    String(
      paymentType || "REGULAR"
    )
      .trim()
      .toUpperCase();

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
    String(
      feeDiscountType || "NONE"
    )
      .trim()
      .toUpperCase();

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
//   -> LUMP_SUM
//
// isLumpSum: false
//   -> REGULAR
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
    await studentRepository
      .findByStudentId(
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
      `Amount cannot be greater than due fee. Due fee is â‚¹${currentDueFee}`
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
  feeHead,
  currentDate = new Date()
) => {
  const fees =
    getFeeSnapshotForDate(
      student,
      currentDate
    ).fees;

  switch (feeHead) {
    case "ADMISSION":
      return Number(
        fees.admissionFee ||
          0
      );

    case "MONTHLY":
      return Number(
        fees.monthlyFee || 0
      );

    case "EXAM":
      return Number(
        fees.examFee || 0
      );

    case "SPORT":
      return Number(
        fees.sportFee || 0
      );

    case "COMPUTER":
      return Number(
        fees.computerFee ||
          0
      );

    case "FUNCTION":
      return Number(
        fees.functionFee ||
          0
      );

    case "SMART_CLASS":
      return Number(
        fees.smartClassFee ||
          0
      );

    case "OTHER":
      return Number(
        fees.otherCharges ||
          0
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
  const validHeads = [
    "ADMISSION",
    "MONTHLY",
    "EXAM",
    "SPORT",
    "COMPUTER",
    "FUNCTION",
    "SMART_CLASS",
    "OTHER",
  ];

  if (
    !validHeads.includes(
      feeHead
    )
  ) {
    throw new Error(
      "Invalid fee head"
    );
  }

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

  // =========================================
  // RTE
  // All fees 100% discount
  // =========================================

  if (
    discountType === "RTE"
  ) {
    return 0;
  }

  // =========================================
  // SIBLING
  // Monthly 20% discount
  // =========================================

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

  // =========================================
  // GIRL
  // Admission 50% discount
  // =========================================

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
  student,
  currentDate = new Date()
) => {
  const discountType =
    validateFeeDiscountType(
      student.feeDiscountType
    );

  const monthlyFee =
    Number(
      getFeeSnapshotForDate(
        student,
        currentDate
      ).fees.monthlyFee || 0
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
// Monthly Late Fee
// =====================================================
//
// Monthly Late Fee Rule:
//
// 1st - 20th:
//   Late Fee = â‚¹0
//
// 21st - Last Day:
//   Late Fee = â‚¹20
//
// After Month End:
//   Late Fee = â‚¹50 total
//
// =====================================================

const getMonthlyLateFee = (
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

  const day =
    date.getDate();

  // 1st - 20th
  if (day <= 20) {
    return 0;
  }

  // 21st - Last Day
  if (day > 20) {
    return 20;
  }

  return 0;
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
  student,
  providedHistory = null
) => {
  const history =
    Array.isArray(providedHistory)
      ? providedHistory
      : await feeRepository.getFeeHistory(
        student.studentId
      );

  const paid = {
    ADMISSION: 0,
    MONTHLY: 0,
    BUS: 0,
    EXAM: 0,
    SPORT: 0,
    COMPUTER: 0,
    FUNCTION: 0,
    SMART_CLASS: 0,
    OTHER: 0,
    LATE_FEE: 0,
    OPENING_DUE: 0,
  };

  for (const fee of history || []) {
    const paymentStatus =
      String(
        fee?.paymentStatus || ""
      )
        .trim()
        .toUpperCase();

    if (
      paymentStatus !== "SUCCESS"
    ) {
      continue;
    }

    // ===============================================
    // New / Corrected Records
    // ===============================================
    //
    // When a payment contains feeBreakdown, each
    // allocated amount must be counted against its
    // actual fee head.
    //
    // Example:
    //
    // Total Payment = 110
    // MONTHLY       = 75
    // Other Heads   = 35
    //
    // This prevents the complete 110 from being
    // counted as MONTHLY only.
    //
    // ===============================================

    const feeBreakdown =
      typeof fee?.feeBreakdown
        ?.toObject === "function"
        ? fee.feeBreakdown.toObject()
        : fee?.feeBreakdown;

    let hasAllocatedBreakdown =
      false;

    const allocatedAmounts = {};

    if (
      feeBreakdown &&
      typeof feeBreakdown ===
        "object"
    ) {
      for (
        const head of Object.keys(
          paid
        )
      ) {
        const headAmount =
          Number(
            feeBreakdown[head] || 0
          );

        if (
          !Number.isFinite(
            headAmount
          ) ||
          headAmount < 0
        ) {
          continue;
        }

        allocatedAmounts[head] =
          headAmount;

        if (headAmount > 0) {
          hasAllocatedBreakdown =
            true;
        }
      }

      if (
        hasAllocatedBreakdown
      ) {
        for (
          const head of Object.keys(
            paid
          )
        ) {
          paid[head] += Number(
            allocatedAmounts[head] || 0
          );
        }

        continue;
      }
    }

    // ===============================================
    // Old Records Fallback
    // ===============================================
    //
    // Old records may not contain feeBreakdown.
    // In that case, use feeHead + amount.
    //
    // ===============================================

    const legacyFeeHead =
      String(
        fee?.feeHead || ""
      )
        .trim()
        .toUpperCase();

    const legacyAmount =
      Number(
        fee?.amount || 0
      );

    if (
      Object.prototype.hasOwnProperty.call(
        paid,
        legacyFeeHead
      ) &&
      Number.isFinite(
        legacyAmount
      ) &&
      legacyAmount > 0
    ) {
      paid[legacyFeeHead] +=
        legacyAmount;
    }
  }

  // ===============================================
  // Completed Cash BUS Refunds
  // ===============================================
  //
  // Original payment records remain unchanged for
  // audit. Completed BUS refunds reduce only the net
  // paid amount for the BUS fee head.
  //
  // ===============================================

  const completedBusRefunds =
    (
      Array.isArray(
        student.busFeeRefunds
      )
        ? student.busFeeRefunds
        : []
    ).reduce(
      (total, refund) => {
        const status =
          String(
            refund?.status || ""
          )
            .trim()
            .toUpperCase();

        const amount =
          Number(refund?.amount || 0);

        if (
          status !== "COMPLETED" ||
          !Number.isFinite(amount) ||
          amount <= 0
        ) {
          return total;
        }

        return total + amount;
      },
      0
    );

  paid.BUS =
    Math.max(
      paid.BUS -
      completedBusRefunds,
      0
    );

  for (
    const head of Object.keys(
      paid
    )
  ) {
    paid[head] =
      Number(
        paid[head].toFixed(2)
      );
  }

  return paid;
};


// =====================================================
// Fee Month Helpers
// =====================================================

const MONTH_KEY_PATTERN =
  /^\d{4}-(0[1-9]|1[0-2])$/;

const getMonthKey = (dateValue) => {
  const date = new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
};

// =====================================================
// Normalize Requested MONTHLY / BUS Fee Months
// =====================================================
//
// Request format:
//
// feeMonths: {
//   MONTHLY: ["2026-04", "2026-05"],
//   BUS: ["2026-04", "2026-05"]
// }
//
// The field is optional for full backward compatibility.
//
// =====================================================

const normalizeRequestedFeeMonths = (
  feeMonths
) => {
  const normalized = {
    MONTHLY: [],
    BUS: [],
  };

  if (
    feeMonths === undefined ||
    feeMonths === null
  ) {
    return normalized;
  }

  if (
    typeof feeMonths !==
      "object" ||
    Array.isArray(feeMonths)
  ) {
    throw new Error(
      "Fee months must be an object"
    );
  }

  for (
    const [rawHead, rawMonths]
    of Object.entries(feeMonths)
  ) {
    const head =
      String(rawHead || "")
        .trim()
        .toUpperCase();

    if (
      !Object.prototype
        .hasOwnProperty.call(
          normalized,
          head
        )
    ) {
      throw new Error(
        "Fee months are supported only for MONTHLY and BUS"
      );
    }

    if (!Array.isArray(rawMonths)) {
      throw new Error(
        `${head} fee months must be an array`
      );
    }

    const uniqueMonths =
      new Set();

    for (const rawMonth of rawMonths) {
      const month =
        String(rawMonth || "")
          .trim();

      if (
        !MONTH_KEY_PATTERN.test(
          month
        )
      ) {
        throw new Error(
          `${head} fee month must be in YYYY-MM format`
        );
      }

      uniqueMonths.add(month);
    }

    if (uniqueMonths.size === 0) {
      throw new Error(
        `${head} fee months cannot be empty`
      );
    }

    normalized[head] = [
      ...new Set([
        ...normalized[head],
        ...uniqueMonths,
      ]),
    ].sort();
  }

  return normalized;
};

const getScheduleMonthKey = (
  detail
) => {
  const month =
    String(
      detail?.feeMonth ||
      detail?.month ||
      ""
    ).trim();

  return MONTH_KEY_PATTERN.test(
    month
  )
    ? month
    : null;
};

const getScheduleMonthAmount = (
  detail,
  feeHead
) => {
  const amount =
    feeHead === "BUS"
      ? Number(
        detail
          ?.effectiveBusFee ||
        detail?.busFee ||
        0
      )
      : Number(
        detail
          ?.effectiveMonthlyFee ||
        detail?.monthlyFee ||
        0
      );

  return Number.isFinite(amount) &&
    amount >= 0
    ? Number(amount.toFixed(2))
    : 0;
};

const getPaymentFeeHeadAmount = (
  payment,
  feeHead
) => {
  const feeBreakdown =
    typeof payment?.feeBreakdown
      ?.toObject === "function"
      ? payment.feeBreakdown
        .toObject()
      : payment?.feeBreakdown;

  let hasAllocatedBreakdown =
    false;

  if (
    feeBreakdown &&
    typeof feeBreakdown ===
      "object"
  ) {
    hasAllocatedBreakdown =
      Object.values(
        feeBreakdown
      ).some((value) => {
        const amount =
          Number(value || 0);

        return (
          Number.isFinite(amount) &&
          amount > 0
        );
      });

    if (hasAllocatedBreakdown) {
      const amount =
        Number(
          feeBreakdown[feeHead] ||
          0
        );

      return Number.isFinite(amount) &&
        amount > 0
        ? Number(amount.toFixed(2))
        : 0;
    }
  }

  const paymentFeeHead =
    String(
      payment?.feeHead || ""
    )
      .trim()
      .toUpperCase();

  if (paymentFeeHead !== feeHead) {
    return 0;
  }

  const amount =
    Number(payment?.amount || 0);

  return Number.isFinite(amount) &&
    amount > 0
    ? Number(amount.toFixed(2))
    : 0;
};

const getStoredFeeMonthAllocations = (
  payment,
  feeHead
) => {
  const rawAllocations =
    Array.isArray(payment?.feeMonths)
      ? payment.feeMonths
      : [];

  return rawAllocations
    .map((rawEntry) => {
      const entry =
        typeof rawEntry?.toObject ===
          "function"
          ? rawEntry.toObject()
          : rawEntry;

      if (typeof entry === "string") {
        const month = entry.trim();

        return feeHead === "MONTHLY" &&
          MONTH_KEY_PATTERN.test(month)
          ? {
            month,
            amount: null,
          }
          : null;
      }

      if (
        !entry ||
        typeof entry !== "object"
      ) {
        return null;
      }

      const entryHead =
        String(
          entry.feeHead ||
          "MONTHLY"
        )
          .trim()
          .toUpperCase();

      const month =
        String(
          entry.month || ""
        ).trim();

      if (
        entryHead !== feeHead ||
        !MONTH_KEY_PATTERN.test(month)
      ) {
        return null;
      }

      const amount = Number(
        entry.amount ??
        entry.monthlyPaid ??
        entry.busPaid ??
        Number.NaN
      );

      return {
        month,
        amount:
          Number.isFinite(amount) &&
          amount > 0
            ? Number(
              amount.toFixed(2)
            )
            : null,
      };
    })
    .filter(Boolean);
};

const getPaidAmountByFeeMonth = ({
  history = [],
  feeHead,
  schedule = [],
  totalPaid = 0,
  explicitlyPaidMonths = [],
}) => {
  const scheduleEntries =
    (Array.isArray(schedule)
      ? schedule
      : []
    )
      .map((detail) => ({
        month:
          getScheduleMonthKey(
            detail
          ),
        amount:
          getScheduleMonthAmount(
            detail,
            feeHead
          ),
      }))
      .filter(
        (entry) =>
          entry.month
      )
      .sort(
        (first, second) =>
          first.month.localeCompare(
            second.month
          )
      );

  const scheduleAmountByMonth =
    new Map(
      scheduleEntries.map(
        (entry) => [
          entry.month,
          entry.amount,
        ]
      )
    );

  const paidAmountByMonth =
    new Map(
      scheduleEntries.map(
        (entry) => [
          entry.month,
          0,
        ]
      )
    );

  const applyToOldestDue = (
    rawAmount
  ) => {
    let remainingAmount =
      Math.max(
        Number(rawAmount || 0),
        0
      );

    for (const entry of scheduleEntries) {
      if (remainingAmount <= 0) {
        break;
      }

      const alreadyPaid =
        Number(
          paidAmountByMonth.get(
            entry.month
          ) || 0
        );

      const monthDue =
        Math.max(
          entry.amount -
          alreadyPaid,
          0
        );

      const allocatedAmount =
        Math.min(
          remainingAmount,
          monthDue
        );

      if (allocatedAmount <= 0) {
        continue;
      }

      paidAmountByMonth.set(
        entry.month,
        Number(
          (
            alreadyPaid +
            allocatedAmount
          ).toFixed(2)
        )
      );

      remainingAmount =
        Number(
          (
            remainingAmount -
            allocatedAmount
          ).toFixed(2)
        );
    }
  };

  for (
    const rawEntry of
      explicitlyPaidMonths || []
  ) {
    const month =
      typeof rawEntry === "string"
        ? rawEntry.trim()
        : String(
          rawEntry?.month || ""
        ).trim();

    if (
      scheduleAmountByMonth.has(
        month
      )
    ) {
      paidAmountByMonth.set(
        month,
        scheduleAmountByMonth.get(
          month
        )
      );
    }
  }

  const sortedHistory = [
    ...(Array.isArray(history)
      ? history
      : []),
  ].sort((first, second) => {
    const firstDate =
      new Date(
        first?.paymentDate ||
        first?.createdAt ||
        0
      ).getTime();

    const secondDate =
      new Date(
        second?.paymentDate ||
        second?.createdAt ||
        0
      ).getTime();

    return firstDate - secondDate;
  });

  let historyHeadTotal = 0;

  for (const payment of sortedHistory) {
    if (
      String(
        payment?.paymentStatus ||
        ""
      )
        .trim()
        .toUpperCase() !==
      "SUCCESS"
    ) {
      continue;
    }

    const headAmount =
      getPaymentFeeHeadAmount(
        payment,
        feeHead
      );

    if (headAmount <= 0) {
      continue;
    }

    historyHeadTotal += headAmount;

    let remainingPaymentAmount =
      headAmount;

    const storedAllocations =
      getStoredFeeMonthAllocations(
        payment,
        feeHead
      );

    for (
      const allocation of
        storedAllocations
    ) {
      if (
        remainingPaymentAmount <= 0
      ) {
        break;
      }

      if (
        !scheduleAmountByMonth.has(
          allocation.month
        )
      ) {
        continue;
      }

      const alreadyPaid =
        Number(
          paidAmountByMonth.get(
            allocation.month
          ) || 0
        );

      const monthDue =
        Math.max(
          Number(
            scheduleAmountByMonth.get(
              allocation.month
            ) || 0
          ) - alreadyPaid,
          0
        );

      const requestedAmount =
        allocation.amount === null
          ? monthDue
          : allocation.amount;

      const allocatedAmount =
        Math.min(
          requestedAmount,
          remainingPaymentAmount,
          monthDue
        );

      if (allocatedAmount <= 0) {
        continue;
      }

      paidAmountByMonth.set(
        allocation.month,
        Number(
          (
            alreadyPaid +
            allocatedAmount
          ).toFixed(2)
        )
      );

      remainingPaymentAmount =
        Number(
          (
            remainingPaymentAmount -
            allocatedAmount
          ).toFixed(2)
        );
    }

    if (remainingPaymentAmount > 0) {
      applyToOldestDue(
        remainingPaymentAmount
      );
    }
  }

  const unrecordedPaidAmount =
    Math.max(
      Number(totalPaid || 0) -
      historyHeadTotal,
      0
    );

  if (unrecordedPaidAmount > 0) {
    applyToOldestDue(
      unrecordedPaidAmount
    );
  }

  return paidAmountByMonth;
};

const buildSelectedFeeMonthAllocations =
  async ({
    student,
    currentFeeCalculation,
    feeMonths,
    feeBreakdown,
    paymentType,
  }) => {
    const requestedMonths =
      normalizeRequestedFeeMonths(
        feeMonths
      );

    const hasRequestedMonths =
      requestedMonths.MONTHLY
        .length > 0 ||
      requestedMonths.BUS
        .length > 0;

    if (!hasRequestedMonths) {
      return [];
    }

    if (paymentType !== "REGULAR") {
      throw new Error(
        "Fee months can be selected only for REGULAR payments"
      );
    }

    const history =
      await feeRepository.getFeeHistory(
        student.studentId
      );

    const allocations = [];

    for (
      const feeHead of [
        "MONTHLY",
        "BUS",
      ]
    ) {
      const selectedMonths =
        requestedMonths[feeHead];

      if (selectedMonths.length === 0) {
        continue;
      }

      const paymentAmount =
        Number(
          feeBreakdown?.[feeHead] ||
          0
        );

      if (
        !Number.isFinite(
          paymentAmount
        ) ||
        paymentAmount <= 0
      ) {
        throw new Error(
          `${feeHead} amount must be greater than zero when its fee months are selected`
        );
      }

      const schedule =
        feeHead === "BUS"
          ? currentFeeCalculation
            .busDetails || []
          : currentFeeCalculation
            .monthlyDetails || [];

      const scheduleAmountByMonth =
        new Map(
          schedule
            .map((detail) => [
              getScheduleMonthKey(
                detail
              ),
              getScheduleMonthAmount(
                detail,
                feeHead
              ),
            ])
            .filter(
              ([month]) => month
            )
        );

      const paidAmountByMonth =
        getPaidAmountByFeeMonth({
          history,
          feeHead,
          schedule,
          totalPaid:
            currentFeeCalculation
              .paidBreakdown
              ?.[feeHead] || 0,
          explicitlyPaidMonths:
            feeHead === "MONTHLY"
              ? student.paidFeeMonths ||
                []
              : [],
        });

      let remainingPaymentAmount =
        Number(
          paymentAmount.toFixed(2)
        );

      let selectedMonthsDue = 0;

      for (const month of selectedMonths) {
        if (
          !scheduleAmountByMonth.has(
            month
          )
        ) {
          throw new Error(
            `${feeHead} fee is not chargeable for ${month}`
          );
        }

        const monthFee =
          Number(
            scheduleAmountByMonth.get(
              month
            ) || 0
          );

        const alreadyPaid =
          Number(
            paidAmountByMonth.get(
              month
            ) || 0
          );

        const monthDue =
          Math.max(
            monthFee -
            alreadyPaid,
            0
          );

        if (monthDue <= 0) {
          throw new Error(
            `${feeHead} fee for ${month} is already fully paid`
          );
        }

        selectedMonthsDue +=
          monthDue;

        const allocatedAmount =
          Math.min(
            remainingPaymentAmount,
            monthDue
          );

        if (allocatedAmount > 0) {
          allocations.push({
            feeHead,
            month,
            amount:
              Number(
                allocatedAmount
                  .toFixed(2)
              ),
          });

          remainingPaymentAmount =
            Number(
              (
                remainingPaymentAmount -
                allocatedAmount
              ).toFixed(2)
            );
        }
      }

      if (remainingPaymentAmount > 0.01) {
        throw new Error(
          `${feeHead} selected months due is Rs.${Number(
            selectedMonthsDue.toFixed(2)
          )}, which is less than the allocated amount Rs.${paymentAmount}`
        );
      }
    }

    return allocations;
  };

// =====================================================
// Get Active Global Monthly Fee Waivers
// =====================================================

const getActiveMonthlyFeeWaiverContext =
  async (
    startDate,
    endDate
  ) => {
    const start =
      new Date(startDate);

    const end =
      new Date(endDate);

    if (
      Number.isNaN(
        start.getTime()
      ) ||
      Number.isNaN(
        end.getTime()
      ) ||
      start > end
    ) {
      return {
        waivedMonthKeys: [],
        waivers: [],
      };
    }

    const waivers =
      await monthlyFeeWaiverRepository
        .getActiveMonthlyFeeWaivers({
          startMonth:
            getCalendarMonthKey(
              start
            ),

          endMonth:
            getCalendarMonthKey(
              end
            ),
        });

    return {
      waivedMonthKeys:
        waivers.map(
          (waiver) =>
            waiver.month
        ),

      waivers:
        waivers.map(
          (waiver) => ({
            academicYear:
              waiver.academicYear,

            month:
              waiver.month,

            monthName:
              waiver.monthName,

            reason:
              waiver.reason,

            waivedAt:
              waiver.waivedAt,
          })
        ),
    };
  };

// =====================================================
// Waive Monthly Fee For Every Student
// ADMIN ONLY
// =====================================================

const waiveMonthlyFeeForAllStudents =
  async (
    body = {},
    userId
  ) => {
    const academicYear =
      normalizeAcademicYear(
        body.academicYear
      );

    const reason = String(
      body.reason || ""
    ).trim();

    if (!reason) {
      throw new Error(
        "Waiver reason is required"
      );
    }

    if (reason.length > 250) {
      throw new Error(
        "Waiver reason cannot exceed 250 characters"
      );
    }

    if (
      !Array.isArray(
        body.months
      ) ||
      body.months.length === 0
    ) {
      throw new Error(
        "At least one month is required"
      );
    }

    const monthNames = [
      ...new Set(
        body.months.map(
          (month) =>
            normalizeAcademicMonth(
              month
            )
        )
      ),
    ];

    const now = new Date();

    const waiverData =
      monthNames.map(
        (monthName) => ({
          academicYear:
            academicYear.value,

          month:
            getAcademicMonthKey({
              academicYear:
                academicYear.value,
              monthName,
            }),

          monthName,
          reason,
          waivedBy: userId,
          waivedAt: now,
        })
      );

    const savedWaivers =
      await monthlyFeeWaiverRepository
        .upsertMonthlyFeeWaivers(
          waiverData
        );

    return {
      academicYear:
        academicYear.value,

      appliesTo:
        "ALL_STUDENTS",

      totalWaivedMonths:
        savedWaivers.length,

      waivedMonths:
        savedWaivers.map(
          (waiver) => ({
            month:
              waiver.month,

            monthName:
              waiver.monthName,

            reason:
              waiver.reason,

            waivedAt:
              waiver.waivedAt,
          })
        ),

      excludedFrom: [
        "MONTHLY_FEE_ACCRUAL",
        "BUS_FEE_ACCRUAL",
        "LATE_FEE",
        "LUMP_SUM",
      ],
    };
  };

const normalizePaidMonthEntry = (
  entry,
  effectiveMonthlyFee
) => {
  if (
    typeof entry === "string"
  ) {
    const month = entry.trim();

    return MONTH_KEY_PATTERN.test(
      month
    )
      ? month
      : null;
  }

  if (
    !entry ||
    typeof entry !== "object"
  ) {
    return null;
  }

  const month = String(
    entry.month || ""
  ).trim();

  if (
    !MONTH_KEY_PATTERN.test(
      month
    )
  ) {
    return null;
  }

  const explicitlyPaid =
    entry.paid === true ||
    entry.isPaid === true ||
    String(
      entry.status || ""
    ).toUpperCase() === "PAID";

  const paidAmount = Number(
    entry.monthlyPaid ??
    entry.amount ??
    0
  );

  const fullyPaidByAmount =
    effectiveMonthlyFee > 0 &&
    Number.isFinite(
      paidAmount
    ) &&
    paidAmount + 0.001 >=
      effectiveMonthlyFee;

  return (
    explicitlyPaid ||
    fullyPaidByAmount
  )
    ? month
    : null;
};

const getStudentFeeStartDate = (
  student
) => {
  if (
    student.feeStartDate
  ) {
    const configuredDate =
      new Date(
        student.feeStartDate
      );

    if (
      !Number.isNaN(
        configuredDate.getTime()
      )
    ) {
      return configuredDate;
    }
  }

  const admissionDate =
    new Date(
      student.admissionDate
    );

  if (
    Number.isNaN(
      admissionDate.getTime()
    )
  ) {
    throw new Error(
      "Invalid fee start date"
    );
  }

  if (
    student.feeStartFrom ===
    "ADMISSION_DATE"
  ) {
    return new Date(
      admissionDate.getFullYear(),
      admissionDate.getMonth(),
      admissionDate.getDate()
    );
  }

  return new Date(
    admissionDate.getFullYear(),
    admissionDate.getMonth() + 1,
    1
  );
};

const getPaidFeeMonths = ({
  student,
  history = [],
  monthlyPaid = 0,
  feeStartDate,
  monthlyDetails = [],
}) => {
  const schedule =
    Array.isArray(monthlyDetails)
      ? monthlyDetails
      : [];

  const legacyExplicitMonths = [];

  if (
    Array.isArray(
      student.paidFeeMonths
    )
  ) {
    legacyExplicitMonths.push(
      ...student.paidFeeMonths
    );
  }

  for (const fee of history || []) {
    if (
      String(
        fee?.paymentStatus || ""
      )
        .trim()
        .toUpperCase() !==
      "SUCCESS"
    ) {
      continue;
    }

    if (
      Array.isArray(
        fee.paidFeeMonths
      )
    ) {
      legacyExplicitMonths.push(
        ...fee.paidFeeMonths
      );
    }
  }

  if (schedule.length > 0) {
    const paidAmountByMonth =
      getPaidAmountByFeeMonth({
        history,
        feeHead: "MONTHLY",
        schedule,
        totalPaid: monthlyPaid,
        explicitlyPaidMonths:
          legacyExplicitMonths,
      });

    return schedule
      .map((detail) => ({
        month:
          getScheduleMonthKey(
            detail
          ),
        monthFee:
          getScheduleMonthAmount(
            detail,
            "MONTHLY"
          ),
      }))
      .filter((detail) => {
        if (!detail.month) {
          return false;
        }

        const paidAmount =
          Number(
            paidAmountByMonth.get(
              detail.month
            ) || 0
          );

        return (
          detail.monthFee <= 0 ||
          paidAmount + 0.001 >=
            detail.monthFee
        );
      })
      .map(
        (detail) => detail.month
      )
      .sort();
  }

  // Legacy fallback for records without a generated
  // monthly schedule.
  const effectiveMonthlyFee =
    getNormalMonthlyFee(student);

  const paidAmount =
    Number(monthlyPaid || 0);

  if (
    !Number.isFinite(paidAmount) ||
    paidAmount <= 0 ||
    effectiveMonthlyFee <= 0
  ) {
    return [];
  }

  const fullyPaidMonthCount =
    Math.floor(
      (paidAmount + 0.001) /
      effectiveMonthlyFee
    );

  const firstMonth =
    new Date(
      feeStartDate.getFullYear(),
      feeStartDate.getMonth(),
      1
    );

  return Array.from(
    {
      length:
        fullyPaidMonthCount,
    },
    (_, index) =>
      getMonthKey(
        new Date(
          firstMonth.getFullYear(),
          firstMonth.getMonth() +
            index,
          1
        )
      )
  ).filter(Boolean);
};

const getLateFeeSummary = ({
  student,
  feeStartDate,
  currentDate = new Date(),
  paidFeeMonths = [],
  paidLateFee = 0,
  excludedFeeMonths = [],
}) => {
  // à¤ªà¤¹à¤²à¥‡ waiver à¤•à¥‡ à¤¬à¤¿à¤¨à¤¾ original late fee à¤¨à¤¿à¤•à¤¾à¤²à¥‡à¤‚
  const originalDetails =
    calculateMonthWiseLateFee(
      feeStartDate,
      currentDate,
      paidFeeMonths,
      student.feeDiscountType || "NONE",
      [],
      excludedFeeMonths
    );

  const waiverByMonth = new Map();

  const lateFeeWaivers =
    Array.isArray(student.lateFeeWaivers)
      ? student.lateFeeWaivers
      : [];

  for (const waiver of lateFeeWaivers) {
    const month =
      String(waiver?.month || "").trim();

    const amount =
      Number(waiver?.waivedAmount || 0);

    if (
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      continue;
    }

    waiverByMonth.set(
      month,
      Number(waiverByMonth.get(month) || 0) +
        amount
    );
  }

  let remainingPaidLateFee =
    Math.max(Number(paidLateFee || 0), 0);

  const monthWiseLateFee =
    originalDetails.map((item) => {
      const lateFee =
        Math.max(Number(item.lateFee || 0), 0);

      const requestedWaiver =
        Math.max(
          Number(
            waiverByMonth.get(item.month) || 0
          ),
          0
        );

      // A saved waiver permanently protects that part
      // of the month. Future payments are allocated only
      // against the remaining payable balance.
      const waivedAmount =
        Math.min(
          requestedWaiver,
          lateFee
        );

      const remainingAfterWaiver =
        Math.max(
          lateFee - waivedAmount,
          0
        );

      // Paid late fee is adjusted oldest month first,
      // after its saved waiver has been applied.
      const lateFeePaid =
        Math.min(
          remainingPaidLateFee,
          remainingAfterWaiver
        );

      remainingPaidLateFee =
        Math.max(
          remainingPaidLateFee -
            lateFeePaid,
          0
        );

      const payableLateFee =
        Math.max(
          remainingAfterWaiver -
            lateFeePaid,
          0
        );

      return {
        ...item,

        lateFee:
          Number(lateFee.toFixed(2)),

        lateFeePaid:
          Number(lateFeePaid.toFixed(2)),

        waivedAmount:
          Number(waivedAmount.toFixed(2)),

        payableLateFee:
          Number(payableLateFee.toFixed(2)),

        // Monthly fee payment status
        paid:
           Number(payableLateFee) > 0,
      };
    });

  const total = (field) =>
    Number(
      monthWiseLateFee
        .reduce(
          (sum, item) =>
            sum + Number(item[field] || 0),
          0
        )
        .toFixed(2)
    );

  return {
    lateFee:
      total("lateFee"),

    lateFeeWaived:
      total("waivedAmount"),

    lateFeePaid:
      total("lateFeePaid"),

    payableLateFee:
      total("payableLateFee"),

    monthWiseLateFee,
  };
};


// =====================================================
// Calculate Fee By Fee Head
// =====================================================
//
// POST /api/fees/calculate
//
// Supports:
//
// ADMISSION
// MONTHLY
// EXAM
// SPORT
// COMPUTER
// FUNCTION
// SMART_CLASS
// OTHER
// ALL
//
// Multiple:
//
// ["ADMISSION", "MONTHLY"]
//
// =====================================================

const calculateFeeByHead = async ({
  studentId,
  feeHead,
  includeLumpSumDetails = false,
}) => {
  // ===================================================
  // Get Student
  // ===================================================

  const student =
    await getStudent(
      studentId
    );

  // ===================================================
  // Normalize Fee Head
  // ===================================================

  let selectedHeads = [];

  if (
    typeof feeHead === "string" &&
    feeHead
      .trim()
      .toUpperCase() === "ALL"
  ) {
    selectedHeads = [
      "ADMISSION",
      "MONTHLY",
      "BUS",
      "EXAM",
      "SPORT",
      "COMPUTER",
      "FUNCTION",
      "SMART_CLASS",
      "OTHER",
    ];
  } else if (
    Array.isArray(feeHead)
  ) {
    selectedHeads =
      feeHead.map(
        (head) =>
          String(head)
            .trim()
            .toUpperCase()
      );
  } else if (
    typeof feeHead === "string"
  ) {
    selectedHeads = [
      feeHead
        .trim()
        .toUpperCase(),
    ];
  } else {
    throw new Error(
      "feeHead is required"
    );
  }

  // ===================================================
  // Remove Duplicate Heads
  // ===================================================

  selectedHeads = [
    ...new Set(
      selectedHeads
    ),
  ];

  // ===================================================
  // Valid Fee Heads
  // ===================================================

  const academicFeeHeads = [
    "ADMISSION",
    "MONTHLY",
    "EXAM",
    "SPORT",
    "COMPUTER",
    "FUNCTION",
    "SMART_CLASS",
    "OTHER",
  ];

  const standardFeeHeads = [
    ...academicFeeHeads,
    "BUS",
  ];

  const validHeads = [
    ...standardFeeHeads,
    "LATE_FEE",
    "OPENING_DUE",
  ];

  const invalidHeads =
    selectedHeads.filter(
      (head) =>
        !validHeads.includes(
          head
        )
    );

  if (
    invalidHeads.length > 0
  ) {
    throw new Error(
      `Invalid fee head: ${invalidHeads.join(
        ", "
      )}`
    );
  }

  // ===================================================
  // Paid Fee History
  // ===================================================

  const history =
    await feeRepository
      .getFeeHistory(
        student.studentId
      );

  const paid =
    await getPaidFeeHeadAmounts(
      student,
      history
    );

  // ===================================================
  // Fee Start Date
  // ===================================================

  let feeStartDate = null;

  if (
    student.feeStartDate
  ) {
    feeStartDate =
      new Date(
        student.feeStartDate
      );
  }

  // ===================================================
  // Fallback Fee Start Date
  // ===================================================

  if (
    !feeStartDate ||
    Number.isNaN(
      feeStartDate.getTime()
    )
  ) {
    const admissionDate =
      new Date(
        student.admissionDate
      );

    if (
      Number.isNaN(
        admissionDate.getTime()
      )
    ) {
      throw new Error(
        "Invalid fee start date"
      );
    }

    if (
      student.feeStartFrom ===
      "ADMISSION_DATE"
    ) {
      feeStartDate =
        new Date(
          admissionDate.getFullYear(),
          admissionDate.getMonth(),
          admissionDate.getDate()
        );
    } else {
      feeStartDate =
        new Date(
          admissionDate.getFullYear(),
          admissionDate.getMonth() + 1,
          1
        );
    }
  }

  // ===================================================
  // Current Date
  // ===================================================

  const currentDate =
    new Date();

  // ===================================================
  // Global Monthly Fee Waivers
  // ===================================================

  const monthlyFeeWaiverContext =
    await getActiveMonthlyFeeWaiverContext(
      feeStartDate,
      currentDate
    );

  const waivedMonthlyFeeMonths =
    monthlyFeeWaiverContext
      .waivedMonthKeys;

  const waivedMonthlyFeeMonthSet =
    new Set(
      waivedMonthlyFeeMonths
    );

  // ===================================================
  // Promotion Helpers
  // ===================================================

  const feeFieldByHead = {
    ADMISSION:
      "admissionFee",

    MONTHLY:
      "monthlyFee",

    EXAM:
      "examFee",

    SPORT:
      "sportFee",

    COMPUTER:
      "computerFee",

    FUNCTION:
      "functionFee",

    SMART_CLASS:
      "smartClassFee",

    OTHER:
      "otherCharges",
  };

  const discountType =
    validateFeeDiscountType(
      student.feeDiscountType
    );

  /*
   * Promotion history में saved fee
   * values को valid number में बदलता है।
   */
  const normalizePromotionFees = (
    source = {}
  ) => {
    const normalizedFees = {};

    for (
      const head of
        academicFeeHeads
    ) {
      const fieldName =
        feeFieldByHead[head];

      const amount =
        Number(
          source?.[fieldName] || 0
        );

      normalizedFees[fieldName] =
        Number.isFinite(amount) &&
        amount >= 0
          ? Number(
            amount.toFixed(2)
          )
          : 0;
    }

    return normalizedFees;
  };

  /*
   * Student का discount promotion
   * fee snapshot पर apply करता है।
   */
  const applyStudentDiscount = (
    source = {},
    excludeAdmission = false
  ) => {
    const fees =
      normalizePromotionFees(
        source
      );

    /*
     * Promotion पर नई admission fee
     * apply नहीं होगी।
     */
    if (excludeAdmission) {
      fees.admissionFee = 0;
    }

    /*
     * RTE:
     * सभी fees zero।
     */
    if (
      discountType === "RTE"
    ) {
      for (
        const head of
          academicFeeHeads
      ) {
        fees[
          feeFieldByHead[head]
        ] = 0;
      }
    }

    /*
     * SIBLING:
     * Monthly fee पर 20% discount।
     */
    else if (
      discountType === "SIBLING"
    ) {
      fees.monthlyFee =
        Number(
          (
            fees.monthlyFee * 0.8
          ).toFixed(2)
        );
    }

    /*
     * GIRL:
     * केवल original admission fee
     * पर 50% discount।
     */
    else if (
      discountType === "GIRL"
    ) {
      fees.admissionFee =
        Number(
          (
            fees.admissionFee * 0.5
          ).toFixed(2)
        );
    }

    return fees;
  };

  const getPromotionDate = (
    promotion
  ) => {
    return new Date(
      promotion?.effectiveFrom ||
      promotion?.appliedAt ||
      promotion?.promotedAt
    );
  };

  // ===================================================
  // Applied Promotion History
  // ===================================================

  const appliedPromotions = (
    Array.isArray(
      student.classPromotionHistory
    )
      ? student.classPromotionHistory
      : []
  )
    .filter((promotion) => {
      const status =
        String(
          promotion?.status ||
          "APPLIED"
        )
          .trim()
          .toUpperCase();

      const promotionDate =
        getPromotionDate(
          promotion
        );

      return (
        status === "APPLIED" &&
        !Number.isNaN(
          promotionDate.getTime()
        ) &&
        promotionDate <= currentDate
      );
    })
    .sort(
      (first, second) =>
        getPromotionDate(first) -
        getPromotionDate(second)
    );

  // ===================================================
  // Promotion-Aware Monthly Calculation
  // ===================================================

  const monthlyCalculation =
    calculateAccruedMonthlyFee({
      student,
      feeStartDate,
      currentDate,
      waivedMonths:
        waivedMonthlyFeeMonths,
    });

  const accruedMonths =
    monthlyCalculation
      .accruedMonths;

  const monthlyDetails =
    monthlyCalculation.details;

  const busCalculation =
    calculateAccruedBusFee({
      student,
      feeStartDate,
      currentDate,
      waivedMonths:
        waivedMonthlyFeeMonths,
    });

  const accruedBusMonths =
    busCalculation.accruedMonths;

  const busDetails =
    busCalculation.details;

  // ===================================================
  // Lump Sum Check
  // ===================================================

  let activeLumpSum =
    false;

  try {
    const lumpSumPayments =
      await feeRepository
        .getLumpSumPayments(
          student.studentId
        );

    if (
      Array.isArray(
        lumpSumPayments
      ) &&
      lumpSumPayments.length > 0
    ) {
      const start =
        new Date(
          feeStartDate
        );

      const startMonth =
        start.getMonth();

      const startYear =
        start.getFullYear();

      let academicYearEnd;

      if (
        startMonth >= 3
      ) {
        academicYearEnd =
          new Date(
            startYear + 1,
            2,
            31,
            23,
            59,
            59,
            999
          );
      } else {
        academicYearEnd =
          new Date(
            startYear,
            2,
            31,
            23,
            59,
            59,
            999
          );
      }

      if (
        currentDate <=
        academicYearEnd
      ) {
        activeLumpSum =
          lumpSumPayments.some(
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

              return (
                paymentDate <=
                  currentDate &&
                paymentDate <=
                  academicYearEnd
              );
            }
          );
      }
    }
  } catch (
    error
  ) {
    activeLumpSum = false;
  }

  // ===================================================
  // Monthly Total
  // ===================================================

  let monthlyTotal = 0;

  if (
    activeLumpSum
  ) {
    monthlyTotal = 0;
  } else {
    monthlyTotal =
      monthlyCalculation.total;
  }

  monthlyTotal =
    Number(
      monthlyTotal.toFixed(2)
    );

  const hasUncoveredBusPeriod =
    getBusFacilityPeriods({
      student,
      feeStartDate,
    }).some(
      (period) =>
        period
          .coveredByExistingLumpSum ===
          false
    );

  const busTotal =
    activeLumpSum &&
    !hasUncoveredBusPeriod
      ? 0
      : Number(
        busCalculation.total
          .toFixed(2)
      );

  // ===================================================
  // Cumulative Promotion Fees
  // ===================================================

  let promotionHeadTotals =
    null;

  if (
    appliedPromotions.length > 0 &&
    appliedPromotions[0].fromFees
  ) {
    /*
     * First promotion के fromFees में
     * student की original fees हैं।
     */
    const originalFees =
      applyStudentDiscount(
        appliedPromotions[0]
          .fromFees
      );

    promotionHeadTotals = {};

    for (
      const head of
        academicFeeHeads
    ) {
      const fieldName =
        feeFieldByHead[head];

      /*
       * Original monthly fees पहले से
       * monthlyTotal में calculate हैं।
       */
      promotionHeadTotals[head] =
        head === "MONTHLY"
          ? 0
          : Number(
            originalFees[
              fieldName
            ] || 0
          );
    }

    /*
     * प्रत्येक applied promotion की
     * नई class fees cumulative जोड़ें।
     */
    for (
      const promotion of
        appliedPromotions
    ) {
      if (!promotion.toFees) {
        continue;
      }

      /*
       * excludeAdmission = true:
       * नई admission fee नहीं जुड़ेगी।
       */
      const promotionFees =
        applyStudentDiscount(
          promotion.toFees,
          true
        );

      /*
       * Promotion जिस calendar month में effective हुई,
       * वह month globally waived है तो उस promotion की
       * monthly fee भी cumulative due में add नहीं होगी।
       */
      const promotionMonth =
        getMonthKey(
          getPromotionDate(
            promotion
          )
        );

      if (
        promotionMonth &&
        waivedMonthlyFeeMonthSet.has(
          promotionMonth
        )
      ) {
        promotionFees.monthlyFee = 0;
      }

      for (
        const head of
          academicFeeHeads
      ) {
        const fieldName =
          feeFieldByHead[head];

        promotionHeadTotals[head] =
          Number(
            (
              Number(
                promotionHeadTotals[
                  head
                ] || 0
              ) +
              Number(
                promotionFees[
                  fieldName
                ] || 0
              )
            ).toFixed(2)
          );
      }
    }
  }

  // ===================================================
  // Paid Months + Month-wise Late Fee
  // ===================================================

  const paidFeeMonths =
    getPaidFeeMonths({
      student,
      history,

      monthlyPaid:
        paid.MONTHLY,

      feeStartDate,
      monthlyDetails,
    });

  const paidBusAmountByMonth =
    getPaidAmountByFeeMonth({
      history,
      feeHead: "BUS",
      schedule: busDetails,
      totalPaid:
        paid.BUS,
    });

  const paidBusFeeMonths =
    (Array.isArray(busDetails)
      ? busDetails
      : []
    )
      .map((detail) => ({
        month:
          getScheduleMonthKey(
            detail
          ),
        monthFee:
          getScheduleMonthAmount(
            detail,
            "BUS"
          ),
      }))
      .filter((detail) => {
        if (!detail.month) {
          return false;
        }

        const paidAmount =
          Number(
            paidBusAmountByMonth.get(
              detail.month
            ) || 0
          );

        return (
          detail.monthFee <= 0 ||
          paidAmount + 0.001 >=
            detail.monthFee
        );
      })
      .map(
        (detail) => detail.month
      )
      .sort();

  const lateFeeSummary =
    activeLumpSum
      ? {
        lateFee: 0,
        lateFeeWaived: 0,
        lateFeePaid: 0,
        payableLateFee: 0,
        monthWiseLateFee: [],
      }
      : getLateFeeSummary({
        student,
        feeStartDate,
        currentDate,
        paidFeeMonths,

        paidLateFee:
          paid.LATE_FEE,

        excludedFeeMonths:
          waivedMonthlyFeeMonths,
      });

  // ===================================================
  // Response Objects
  // ===================================================

  const feeBreakdown = {};
  const paidBreakdown = {};
  const dueBreakdown = {};

  let totalFee = 0;
  let totalPaid = 0;
  let totalDue = 0;

  // ===================================================
  // Calculate Selected Heads
  // ===================================================

  for (
    const head of selectedHeads
  ) {
    if (
      head === "LATE_FEE" ||
      head === "OPENING_DUE"
    ) {
      continue;
    }

    let effectiveFee = 0;

    if (
      head === "MONTHLY"
    ) {
      /*
       * Previous accrued monthly fees
       * + promotion की नई monthly fee।
       */
      effectiveFee =
        monthlyTotal +
        Number(
          promotionHeadTotals
            ?.MONTHLY || 0
        );
    } else if (
      head === "BUS"
    ) {
      effectiveFee =
        busTotal;
    } else if (
      promotionHeadTotals
    ) {
      /*
       * Original fee
       * + सभी applied promotions की fee।
       */
      effectiveFee =
        Number(
          promotionHeadTotals[
            head
          ] || 0
        );
    } else {
      /*
       * जिन students का promotion
       * नहीं हुआ उनके लिए existing flow।
       */
      effectiveFee =
        getEffectiveFeeHeadAmount(
          student,
          head
        );
    }

    effectiveFee =
      Number(
        effectiveFee.toFixed(2)
      );

    const paidAmount =
      Number(
        paid[head] || 0
      );

    const dueAmount =
      Math.max(
        effectiveFee -
          paidAmount,
        0
      );

    feeBreakdown[head] =
      Number(
        effectiveFee.toFixed(2)
      );

    paidBreakdown[head] =
      Number(
        paidAmount.toFixed(2)
      );

    dueBreakdown[head] =
      Number(
        dueAmount.toFixed(2)
      );

    totalFee +=
      effectiveFee;

    totalPaid +=
      paidAmount;

    totalDue +=
      dueAmount;
  }

  // ===================================================
  // Opening Due
  // ===================================================

  const isAll =
    academicFeeHeads.every(
      (head) =>
        selectedHeads.includes(
          head
        )
    );

  const openingDue =
    Number(
      student.openingDue || 0
    );

  const openingDuePaid =
    Number(
      paid.OPENING_DUE || 0
    );

  const openingDueBalance =
    Math.max(
      openingDue -
        openingDuePaid,
      0
    );

  const includeOpeningDue =
    isAll ||
    selectedHeads.includes(
      "OPENING_DUE"
    );

  if (
    includeOpeningDue &&
    openingDue > 0
  ) {
    totalFee +=
      openingDue;

    totalPaid +=
      openingDuePaid;

    totalDue +=
      openingDueBalance;

    feeBreakdown.OPENING_DUE =
      Number(
        openingDue.toFixed(2)
      );

    paidBreakdown.OPENING_DUE =
      Number(
        openingDuePaid.toFixed(2)
      );

    dueBreakdown.OPENING_DUE =
      Number(
        openingDueBalance.toFixed(2)
      );
  }

  // ===================================================
  // Late Fee
  // ===================================================

  const includeLateFee =
    isAll ||
    selectedHeads.includes(
      "MONTHLY"
    ) ||
    selectedHeads.includes(
      "LATE_FEE"
    );

  if (includeLateFee) {
    feeBreakdown.LATE_FEE =
      lateFeeSummary.lateFee;

    paidBreakdown.LATE_FEE =
      lateFeeSummary.lateFeePaid;

    dueBreakdown.LATE_FEE =
      lateFeeSummary.payableLateFee;

    totalFee +=
      lateFeeSummary.lateFee;

    totalPaid +=
      lateFeeSummary.lateFeePaid;

    totalDue +=
      lateFeeSummary.payableLateFee;
  }

  // ===================================================
  // Final Values
  // ===================================================

  totalFee =
    Number(
      totalFee.toFixed(2)
    );

  totalPaid =
    Number(
      totalPaid.toFixed(2)
    );

  totalDue =
    Number(
      Math.max(
        totalDue,
        0
      ).toFixed(2)
    );

  // ===================================================
  // Optional Lump Sum Details
  // Used by POST /api/fees/calculate only. Internal fee
  // recalculations keep their previous lightweight flow.
  // ===================================================

  let lumpSumDetails = null;

  if (includeLumpSumDetails) {
    if (student.lumpSumPaid === true) {
      lumpSumDetails = {
        eligible: false,
        paymentType: "LUMP_SUM",
        reason:
          "Lump Sum payment has already been paid for this student",
        lumpSumAmount: 0,
      };
    } else {
      try {
        lumpSumDetails =
          await calculateLumpSumDetails(
            student,
            currentDate
          );
      } catch (error) {
        lumpSumDetails = {
          eligible: false,
          paymentType:
            "LUMP_SUM",
          reason:
            error.message ||
            "Lump Sum details are not available",
          lumpSumAmount: 0,
        };
      }
    }
  }

  // ===================================================
  // Final Response
  // ===================================================

  return {
    studentId:
      student.studentId,

    feeHead:
      isAll
        ? "ALL"
        : selectedHeads,

    feeStartDate,

    accruedMonths,

    monthlyDetails,

    hasBusFacility:
      student.hasBusFacility === true,

    monthlyBusFee:
      Number(student.busFee || 0),

    accruedBusMonths,

    busDetails,

    waivedMonthlyFeeMonths:
      monthlyFeeWaiverContext
        .waivers,

    feeDiscountType:
      student.feeDiscountType,

    feeBreakdown,

    paidBreakdown,

    dueBreakdown,

    totalFee,

    paidFee:
      totalPaid,

    paidFeeMonths,

    paidBusFeeMonths,

    lateFee:
      includeLateFee
        ? lateFeeSummary.lateFee
        : 0,

    lateFeeWaived:
      includeLateFee
        ? lateFeeSummary.lateFeeWaived
        : 0,

    lateFeePaid:
      includeLateFee
        ? lateFeeSummary.lateFeePaid
        : 0,

    payableLateFee:
      includeLateFee
        ? lateFeeSummary.payableLateFee
        : 0,

    lateFeeDetails:
      includeLateFee
        ? lateFeeSummary.monthWiseLateFee
        : [],

    dueFee:
      totalDue,

    ...(includeLumpSumDetails
      ? { lumpSumDetails }
      : {}),
  };
};


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
    discountType === "RTE" &&
    !(
      student.hasBusFacility === true &&
      Number(student.busFee || 0) > 0
    )
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

      hasBusFacility:
        student.hasBusFacility === true,

      monthlyBusFee:
        Number(student.busFee || 0),

      remainingBusMonths: 0,

      remainingBusFee: 0,

      busFeeSchedule: [],

      remainingMonthlyAmount: 0,

      remainingOneTimeFees: 0,

      remainingAcademicFee: 0,

      lateFee: 0,

      lateFeeWaived: 0,

      lateFeePaid: 0,

      payableLateFee: 0,

      lateFeeDetails: [],

      additionalDiscount: 0,

      discountedMonthlyAmount: 0,

      lumpSumAmount: 0,

      feeBreakdown: {
        MONTHLY: 0,
        BUS: 0,
        ADMISSION: 0,
        EXAM: 0,
        SPORT: 0,
        COMPUTER: 0,
        FUNCTION: 0,
        SMART_CLASS: 0,
        OTHER: 0,
        LATE_FEE: 0,
        OPENING_DUE: 0,
      },

      waivedMonthlyFeeMonths: [],
    };
  }

  // -------------------------------------------------
  // Paid History
  // -------------------------------------------------

  const history =
    await feeRepository
      .getFeeHistory(
        student.studentId
      );

  const paid =
    await getPaidFeeHeadAmounts(
      student,
      history
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

      hasBusFacility:
        student.hasBusFacility === true,

      monthlyBusFee:
        Number(student.busFee || 0),

      remainingBusMonths: 0,

      remainingBusFee: 0,

      busFeeSchedule: [],

      remainingMonthlyAmount: 0,

      remainingOneTimeFees: 0,

      remainingAcademicFee: 0,

      lateFee: 0,

      lateFeeWaived: 0,

      lateFeePaid: 0,

      payableLateFee: 0,

      lateFeeDetails: [],

      additionalDiscount: 0,

      discountedMonthlyAmount: 0,

      lumpSumAmount: 0,

      feeBreakdown: {
        MONTHLY: 0,
        BUS: 0,
        ADMISSION: 0,
        EXAM: 0,
        SPORT: 0,
        COMPUTER: 0,
        FUNCTION: 0,
        SMART_CLASS: 0,
        OTHER: 0,
        LATE_FEE: 0,
        OPENING_DUE: 0,
      },

      waivedMonthlyFeeMonths: [],
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
  // Global Monthly Fee Waivers
  // -------------------------------------------------

  const monthlyFeeWaiverContext =
    await getActiveMonthlyFeeWaiverContext(
      effectiveStartDate,
      academicYearEnd
    );

  // -------------------------------------------------
  // Promotion-Aware Academic Fee Schedule
  // -------------------------------------------------

  const academicMonthlyCalculation =
    calculateAccruedMonthlyFee({
      student,
      feeStartDate:
        effectiveStartDate,
      currentDate:
        academicYearEnd,
      waivedMonths:
        monthlyFeeWaiverContext
          .waivedMonthKeys,
    });

  const monthlyFeeSchedule =
    academicMonthlyCalculation
      .details;

  const academicBusCalculation =
    calculateAccruedBusFee({
      student,
      feeStartDate:
        effectiveStartDate,
      currentDate:
        academicYearEnd,
      waivedMonths:
        monthlyFeeWaiverContext
          .waivedMonthKeys,
    });

  const busFeeSchedule =
    academicBusCalculation.details;

  const totalAcademicMonths =
    academicMonthlyCalculation
      .accruedMonths;

  // -------------------------------------------------
  // Effective Monthly Fee
  // Includes the student's normal discount.
  // -------------------------------------------------

  const normalMonthlyFee =
    getNormalMonthlyFee(
      student,
      currentDate
    );

  // -------------------------------------------------
  // Already Paid Monthly Fee
  // -------------------------------------------------

  const monthlyPaid =
    Number(
      paid.MONTHLY || 0
    );

  // -------------------------------------------------
  // Months Passed Until Current Month
  // -------------------------------------------------

  const today =
    new Date(currentDate);

  const todayMonthKey =
    getCalendarMonthKey(
      today
    );

  /*
   * Waived months monthlyFeeSchedule में नहीं हैं,
   * इसलिए passedMonths भी केवल chargeable months हैं।
   */
  const passedMonths =
    monthlyFeeSchedule.filter(
      (monthDetail) => {
        const detailMonth =
          String(
            monthDetail.feeMonth ||
            monthDetail.month ||
            ""
          ).trim();

        return (
          MONTH_KEY_PATTERN.test(
            detailMonth
          ) &&
          detailMonth <=
            todayMonthKey
        );
      }
    ).length;

  // -------------------------------------------------
  // Already Paid Months
  // -------------------------------------------------

  let remainingMonthlyPaid =
    Math.max(
      monthlyPaid,
      0
    );

  let alreadyPaidMonths = 0;

  for (
    const monthDetail of
    monthlyFeeSchedule
  ) {
    const monthFee =
      Number(
        monthDetail
          .effectiveMonthlyFee || 0
      );

    if (monthFee <= 0) {
      alreadyPaidMonths += 1;

      continue;
    }

    if (
      remainingMonthlyPaid + 0.01 <
      monthFee
    ) {
      break;
    }

    remainingMonthlyPaid =
      Math.max(
        remainingMonthlyPaid -
        monthFee,
        0
      );

    alreadyPaidMonths += 1;
  }

  alreadyPaidMonths =
    Math.min(
      alreadyPaidMonths,
      Math.max(
        passedMonths,
        0
      )
    );

  // -------------------------------------------------
  // Payable Late Fee
  // Only overdue, unpaid, non-waived monthly periods
  // are included. Lump-sum discount never applies to it.
  // -------------------------------------------------

  const paidFeeMonths =
    getPaidFeeMonths({
      student,
      history,
      monthlyPaid,
      feeStartDate:
        effectiveStartDate,
      monthlyDetails:
        monthlyFeeSchedule,
    });

  const lateFeeSummary =
    getLateFeeSummary({
      student,
      feeStartDate:
        effectiveStartDate,
      currentDate,
      paidFeeMonths,
      paidLateFee:
        paid.LATE_FEE,
      excludedFeeMonths:
        monthlyFeeWaiverContext
          .waivedMonthKeys,
    });

  const payableLateFee =
    Number(
      lateFeeSummary
        .payableLateFee
        .toFixed(2)
    );

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
  // -------------------------------------------------

  const remainingMonthlyAmount =
    Number(
      Math.max(
        academicMonthlyCalculation
          .total - monthlyPaid,
        0
      ).toFixed(2)
    );

  // -------------------------------------------------
  // Remaining Bus Fee
  // No student or lump-sum discount applies to BUS.
  // -------------------------------------------------

  const busPaid =
    Number(paid.BUS || 0);

  const remainingBusFee =
    Number(
      Math.max(
        academicBusCalculation.total -
        busPaid,
        0
      ).toFixed(2)
    );

  let remainingBusPaid =
    Math.max(busPaid, 0);

  let alreadyPaidBusMonths = 0;

  for (
    const monthDetail of
    busFeeSchedule
  ) {
    const monthBusFee =
      Number(
        monthDetail.effectiveBusFee ||
        0
      );

    if (monthBusFee <= 0) {
      alreadyPaidBusMonths += 1;

      continue;
    }

    if (
      remainingBusPaid + 0.01 <
      monthBusFee
    ) {
      break;
    }

    remainingBusPaid =
      Math.max(
        remainingBusPaid -
        monthBusFee,
        0
      );

    alreadyPaidBusMonths += 1;
  }

  const remainingBusMonths =
    Math.max(
      academicBusCalculation
        .accruedMonths -
      alreadyPaidBusMonths,
      0
    );

  // -------------------------------------------------
  // One-Time Fees
  // -------------------------------------------------

  const oneTimeFeeHeads = [
    "ADMISSION",
    "EXAM",
    "SPORT",
    "COMPUTER",
    "FUNCTION",
    "SMART_CLASS",
    "OTHER",
  ];

  const remainingOneTimeFeeBreakdown =
    {};

  for (const head of oneTimeFeeHeads) {
    const effectiveAmount =
      getEffectiveFeeHeadAmount(
        student,
        head
      );

    const alreadyPaid =
      Number(paid[head] || 0);

    remainingOneTimeFeeBreakdown[
      head
    ] = Number(
      Math.max(
        effectiveAmount -
          alreadyPaid,
        0
      ).toFixed(2)
    );
  }

  const remainingOneTimeFees =
    Number(
      oneTimeFeeHeads
        .reduce(
          (total, head) =>
            total +
            Number(
              remainingOneTimeFeeBreakdown[
                head
              ] || 0
            ),
          0
        )
        .toFixed(2)
    );

  // -------------------------------------------------
  // Normal Remaining Academic Fee
  // -------------------------------------------------

  const remainingAcademicFee =
    Number(
      (
        remainingMonthlyAmount +
        remainingBusFee +
        remainingOneTimeFees +
        payableLateFee
      ).toFixed(2)
    );

  // -------------------------------------------------
  // Lump Sum Discount
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
  // Already gets 20% discount.
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
  // -------------------------------------------------

  const lumpSumFeeBreakdown = {
    MONTHLY:
      Number(
        discountedMonthlyAmount
          .toFixed(2)
      ),
    BUS: remainingBusFee,
    ADMISSION:
      remainingOneTimeFeeBreakdown
        .ADMISSION,
    EXAM:
      remainingOneTimeFeeBreakdown
        .EXAM,
    SPORT:
      remainingOneTimeFeeBreakdown
        .SPORT,
    COMPUTER:
      remainingOneTimeFeeBreakdown
        .COMPUTER,
    FUNCTION:
      remainingOneTimeFeeBreakdown
        .FUNCTION,
    SMART_CLASS:
      remainingOneTimeFeeBreakdown
        .SMART_CLASS,
    OTHER:
      remainingOneTimeFeeBreakdown
        .OTHER,
    LATE_FEE:
      payableLateFee,
    OPENING_DUE: 0,
  };

  const lumpSumAmount =
    Number(
      Object.values(
        lumpSumFeeBreakdown
      )
        .reduce(
          (total, value) =>
            total +
            Number(value || 0),
          0
        )
        .toFixed(2)
    );

  // -------------------------------------------------
  // Discount Percentage
  // -------------------------------------------------

  const monthlyDiscountPercentage =
    discountType === "NONE" ||
      discountType === "GIRL"
      ? 10
      : 0;

  return {
    eligible: true,

    paymentType:
      "LUMP_SUM",

    discountType,

    monthlyDiscountPercentage,

    feeStartDate,

    totalAcademicMonths,

    passedMonths,

    alreadyPaidMonths,

    remainingMonths,

    normalMonthlyFee,

    hasBusFacility:
      student.hasBusFacility === true,

    monthlyBusFee:
      Number(student.busFee || 0),

    monthlyFeeSchedule,

    waivedMonthlyFeeMonths:
      monthlyFeeWaiverContext
        .waivers,

    remainingMonthlyAmount,

    alreadyPaidBusMonths,

    remainingBusMonths,

    remainingBusFee,

    busFeeSchedule,

    remainingOneTimeFees,

    remainingAcademicFee,

    lateFee:
      lateFeeSummary.lateFee,

    lateFeeWaived:
      lateFeeSummary
        .lateFeeWaived,

    lateFeePaid:
      lateFeeSummary.lateFeePaid,

    payableLateFee,

    lateFeeDetails:
      lateFeeSummary
        .monthWiseLateFee,

    additionalDiscount,

    discountedMonthlyAmount,

    lumpSumAmount,

    feeBreakdown:
      lumpSumFeeBreakdown,
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
// Apply Server-Calculated Lump Sum Breakdown
// =====================================================

const applyLumpSumFeeBreakdown = (
  target,
  lumpSumDetails
) => {
  const calculatedBreakdown =
    lumpSumDetails?.feeBreakdown;

  if (
    !calculatedBreakdown ||
    typeof calculatedBreakdown !==
      "object"
  ) {
    throw new Error(
      "Lump Sum fee breakdown could not be calculated"
    );
  }

  for (const head of Object.keys(target)) {
    const amount =
      Number(
        calculatedBreakdown[head] ||
        0
      );

    if (
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      throw new Error(
        `Invalid calculated Lump Sum ${head} amount`
      );
    }

    target[head] =
      Number(amount.toFixed(2));
  }

  const breakdownTotal =
    Number(
      Object.values(target)
        .reduce(
          (total, amount) =>
            total +
            Number(amount || 0),
          0
        )
        .toFixed(2)
    );

  const expectedAmount =
    Number(
      Number(
        lumpSumDetails.lumpSumAmount
      ).toFixed(2)
    );

  if (
    Math.abs(
      breakdownTotal -
      expectedAmount
    ) > 0.01
  ) {
    throw new Error(
      "Calculated Lump Sum fee breakdown does not match the payable amount"
    );
  }

  return target;
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
  feeBreakdown,
  feeMonths,
}) => {
  const isLumpSum =
    paymentType === "LUMP_SUM";

  return {
    receiptNo,

    student: student._id,

    studentId: student.studentId,

    feeHead,

    amount,

    feeBreakdown:
      feeBreakdown || {
        MONTHLY: 0,
        BUS: 0,
        ADMISSION: 0,
        EXAM: 0,
        SPORT: 0,
        COMPUTER: 0,
        FUNCTION: 0,
        SMART_CLASS: 0,
        OTHER: 0,
        LATE_FEE: 0,
        OPENING_DUE: 0,
      },

    feeMonths:
      Array.isArray(feeMonths)
        ? feeMonths
        : [],

    paymentType,

    feeDiscountType:
      student.feeDiscountType || "NONE",

    lumpSumDiscountPercent:
      isLumpSum
        ? Number(
          lumpSumDetails
            ?.monthlyDiscountPercentage || 0
        )
        : 0,

    lumpSumDiscountAmount:
      isLumpSum
        ? Number(
          lumpSumDetails
            ?.additionalDiscount || 0
        )
        : 0,

    paymentMode,

    paymentStatus: "SUCCESS",

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
  lumpSumDetails = null,
  feeBreakdown = null
) => {
  const currentPaidFee =
    Number(student.paidFee || 0);

  const amount =
    Number(paymentAmount);

  // =====================================================
  // Validate Current Paid Fee
  // =====================================================

  if (
    !Number.isFinite(currentPaidFee) ||
    currentPaidFee < 0
  ) {
    throw new Error(
      "Paid fee must be a valid non-negative number"
    );
  }

  // =====================================================
  // Validate Payment Amount
  // =====================================================

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error(
      "Payment amount must be a valid positive number"
    );
  }

  // =====================================================
  // New Total Paid Fee
  // =====================================================

  const paidFee =
    currentPaidFee + amount;

  // =====================================================
  // LUMP SUM
  // =====================================================

  if (
    paymentType === "LUMP_SUM"
  ) {
    const updateData = {
      paidFee:
        Number(
          paidFee.toFixed(2)
        ),

      dueFee: 0,
    };

    updateData.lumpSumPaid =
      true;

    if (
      lumpSumDetails
    ) {
      if (
        lumpSumDetails.paidTill
      ) {
        updateData.lumpSumPaidTill =
          lumpSumDetails.paidTill;
      } else if (
        lumpSumDetails.lumpSumPaidTill
      ) {
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

      if (
        lumpSumDetails.monthlyDiscountPercentage !==
        undefined
      ) {
        updateData.lumpSumDiscountPercent =
          Number(
            lumpSumDetails
              .monthlyDiscountPercentage
          );
      }

      if (
        lumpSumDetails.additionalDiscount !==
        undefined
      ) {
        updateData.lumpSumDiscountAmount =
          Number(
            lumpSumDetails
              .additionalDiscount
          );
      }
    }

    const updatedStudent =
      await studentRepository.updateFee(
        student._id,
        updateData.paidFee,
        updateData.dueFee,
        {
          lumpSumPaid:
            true,

          lumpSumPaidTill:
            updateData.lumpSumPaidTill,

          lumpSumDiscountType:
            updateData.lumpSumDiscountType,

          lumpSumDiscountPercent:
            updateData
              .lumpSumDiscountPercent,

          lumpSumDiscountAmount:
            updateData
              .lumpSumDiscountAmount,
        }
      );

    if (
      !updatedStudent
    ) {
      throw new Error(
        "Failed to update student fee"
      );
    }

    return updatedStudent;
  }

  // =====================================================
  // REGULAR PAYMENT
  // =====================================================

  let newDueFee;

  if (
    feeBreakdown &&
    typeof feeBreakdown ===
    "object"
  ) {
    const breakdownTotal =
      Object.values(
        feeBreakdown
      ).reduce(
        (
          total,
          value
        ) =>
          total +
          Number(
            value || 0
          ),
        0
      );

    if (
      Math.abs(
        breakdownTotal -
        amount
      ) > 0.01
    ) {
      throw new Error(
        `Fee breakdown total ₹${breakdownTotal} does not match payment amount ₹${amount}`
      );
    }

    newDueFee =
      Math.max(
        Number(
          currentDueFee || 0
        ),
        0
      );
  } else {
    newDueFee =
      Math.max(
        Number(
          currentDueFee || 0
        ),
        0
      );
  }

  const updateData = {
    paidFee:
      Number(
        paidFee.toFixed(2)
      ),

    dueFee:
      Number(
        newDueFee.toFixed(2)
      ),
  };

  const updatedStudent =
    await studentRepository.updateFee(
      student._id,
      updateData.paidFee,
      updateData.dueFee,
      null
    );

  if (
    !updatedStudent
  ) {
    throw new Error(
      "Failed to update student fee"
    );
  }

  return updatedStudent;
};


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
    feeBreakdown,
    feeMonths,
  } = body;

  // ===================================================
  // Fee Head
  // ===================================================

  const finalFeeHead =
    validateFeeHead(
      feeHead
    );

  // ===================================================
  // CASH Only
  // ===================================================

  if (
    paymentMode !== "CASH"
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

  // ===================================================
  // Current Total Due
  // ===================================================

  const currentFeeCalculation =
    await calculateFeeByHead({
      studentId:
        student.studentId,
      feeHead:
        "ALL",
    });

  const currentDueFee =
    Number(
      currentFeeCalculation.dueFee || 0
    );

  // ===================================================
  // Regular Payment
  // ===================================================

  if (
    finalPaymentType === "REGULAR"
  ) {
    const headDue =
      finalFeeHead === "ALL"
        ? currentDueFee
        : finalFeeHead === "MONTHLY"
          ? Number(
            currentFeeCalculation
              .dueBreakdown
              ?.MONTHLY || 0
          ) +
            Number(
              currentFeeCalculation
                .dueBreakdown
                ?.LATE_FEE || 0
            )
          : Number(
            currentFeeCalculation
              .dueBreakdown
              ?.[finalFeeHead] || 0
          );

    validateDueAmount(
      paymentAmount,
      headDue
    );

    // Legacy per-head calculation below is retained only
    // for reference and must not run.
    if (false) {

      // =================================================
      // SINGLE FEE HEAD PAYMENT
      // =================================================

      if (
        finalFeeHead !== "ALL"
      ) {
        const paid =
          await getPaidFeeHeadAmounts(
            student
          );

        let headDue = 0;

        // ===============================================
        // MONTHLY
        // ===============================================

        if (
          finalFeeHead === "MONTHLY"
        ) {
          const feeStartDate =
            student.feeStartDate ||
            (
              student.admissionDate
                ? new Date(
                  new Date(
                    student.admissionDate
                  ).getFullYear(),
                  new Date(
                    student.admissionDate
                  ).getMonth() + 1,
                  1
                )
                : null
            );

          let accruedMonthlyFee = 0;

          if (feeStartDate) {
            const startDate =
              new Date(
                feeStartDate
              );

            const today =
              new Date();

            startDate.setHours(
              0,
              0,
              0,
              0
            );

            today.setHours(
              0,
              0,
              0,
              0
            );

            if (
              today >= startDate
            ) {
              const months =
                (
                  today.getFullYear() -
                  startDate.getFullYear()
                ) *
                  12 +
                (
                  today.getMonth() -
                  startDate.getMonth()
                ) +
                1;

              const monthlyFee =
                getNormalMonthlyFee(
                  student
                );

              accruedMonthlyFee =
                monthlyFee * months;
            }
          }

          const monthlyPaid =
            Number(
              paid.MONTHLY || 0
            );

          headDue =
            Math.max(
              accruedMonthlyFee -
                monthlyPaid,
              0
            );
        }

        // ===============================================
        // ONE-TIME FEE HEAD
        // ===============================================

        else {
          const effectiveAmount =
            getEffectiveFeeHeadAmount(
              student,
              finalFeeHead
            );

          const alreadyPaid =
            Number(
              paid[finalFeeHead] || 0
            );

          headDue =
            Math.max(
              effectiveAmount -
                alreadyPaid,
              0
            );
        }

        // ===============================================
        // Validate Head Due
        // ===============================================

        validateDueAmount(
          paymentAmount,
          headDue
        );
      }

      // =================================================
      // ALL PAYMENT
      // =================================================

      else {
        validateDueAmount(
          paymentAmount,
          currentDueFee
        );
      }
    }
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

  let lumpSumDetails =
    null;

  if (
    finalPaymentType ===
    "LUMP_SUM"
  ) {
    // ===============================================
    // Already Paid Lump Sum Protection
    // ===============================================

    if (
      student.lumpSumPaid === true
    ) {
      const error =
        new Error(
          "Lump Sum payment has already been paid for this student"
        );

      error.statusCode = 400;

      throw error;
    }

    // ===============================================
    // Validate Lump Sum Amount
    // ===============================================

    lumpSumDetails =
      await validateLumpSumPayment(
        student,
        paymentAmount
      );
  }

  // ===================================================
  // Fee Breakdown
  // ===================================================

  const normalizedFeeBreakdown = {
    MONTHLY: 0,
    BUS: 0,
    ADMISSION: 0,
    EXAM: 0,
    SPORT: 0,
    COMPUTER: 0,
    FUNCTION: 0,
    SMART_CLASS: 0,
    OTHER: 0,
    LATE_FEE: 0,
    OPENING_DUE: 0,
  };

  // ===================================================
  // Lump Sum Breakdown
  // Always calculated by the backend, including late fee.
  // ===================================================

  if (
    finalPaymentType ===
    "LUMP_SUM"
  ) {
    applyLumpSumFeeBreakdown(
      normalizedFeeBreakdown,
      lumpSumDetails
    );
  }

  // ===================================================
  // ALL Regular Fee Payment
  // ===================================================

  else if (
    finalFeeHead === "ALL"
  ) {
    // ===============================================
    // feeBreakdown Required
    // ===============================================

    if (
      !feeBreakdown ||
      typeof feeBreakdown !==
      "object"
    ) {
      throw new Error(
        "feeBreakdown is required when feeHead is All"
      );
    }

    const allowedHeads = [
      "MONTHLY",
      "BUS",
      "ADMISSION",
      "EXAM",
      "SPORT",
      "COMPUTER",
      "FUNCTION",
      "SMART_CLASS",
      "OTHER",
      "LATE_FEE",
      "OPENING_DUE",
    ];

    let breakdownTotal = 0;

    // ===============================================
    // Validate Each Fee Head
    // ===============================================

    for (
      const head of allowedHeads
    ) {
      const headAmount =
        Number(
          feeBreakdown[head] || 0
        );

      if (
        !Number.isFinite(
          headAmount
        )
      ) {
        throw new Error(
          `${head} fee amount must be a valid number`
        );
      }

      if (
        headAmount < 0
      ) {
        throw new Error(
          `${head} fee amount cannot be negative`
        );
      }

      const availableDue =
        Number(
          currentFeeCalculation
            .dueBreakdown
            ?.[head] || 0
        );

      if (
        finalPaymentType ===
          "REGULAR" &&
        headAmount >
          availableDue + 0.01
      ) {
        throw new Error(
          `${head} amount cannot be greater than due amount â‚¹${availableDue}`
        );
      }

      normalizedFeeBreakdown[
        head
      ] = Number(
        headAmount.toFixed(2)
      );

      breakdownTotal +=
        headAmount;
    }

    // ===============================================
    // Round Total
    // ===============================================

    breakdownTotal =
      Number(
        breakdownTotal.toFixed(2)
      );

    const finalPaymentAmount =
      Number(
        paymentAmount.toFixed(2)
      );

    // ===============================================
    // Breakdown Total Must Match Payment
    // ===============================================

    if (
      breakdownTotal !==
      finalPaymentAmount
    ) {
      throw new Error(
        `Fee breakdown total â‚¹${breakdownTotal} must equal payment amount â‚¹${finalPaymentAmount}`
      );
    }
  } else {
    // =================================================
    // Single Fee Head Payment
    // =================================================

    if (
      !Object.prototype.hasOwnProperty.call(
        normalizedFeeBreakdown,
        finalFeeHead
      )
    ) {
      throw new Error(
        "Invalid fee head"
      );
    }

    if (
      finalFeeHead ===
      "MONTHLY"
    ) {
      const monthlyDue =
        Number(
          currentFeeCalculation
            .dueBreakdown
            ?.MONTHLY || 0
        );

      const monthlyPart =
        Math.min(
          paymentAmount,
          monthlyDue
        );

      const lateFeePart =
        Math.max(
          paymentAmount -
            monthlyPart,
          0
        );

      normalizedFeeBreakdown.MONTHLY =
        Number(
          monthlyPart.toFixed(2)
        );

      normalizedFeeBreakdown.LATE_FEE =
        Number(
          lateFeePart.toFixed(2)
        );
    } else {
      normalizedFeeBreakdown[
        finalFeeHead
      ] = Number(
        paymentAmount.toFixed(2)
      );
    }
  }

  // ===================================================
  // Optional MONTHLY / BUS Month-wise Allocations
  // ===================================================

  const feeMonthAllocations =
    await buildSelectedFeeMonthAllocations({
      student,
      currentFeeCalculation,
      feeMonths,
      feeBreakdown:
        normalizedFeeBreakdown,
      paymentType:
        finalPaymentType,
    });

  // ===================================================
  // Effective Fee Head Amount
  // ===================================================

  const effectiveFeeHeadAmount =
    finalFeeHead === "ALL"
      ? paymentAmount
      : finalFeeHead ===
          "LATE_FEE"
        ? currentFeeCalculation
          .payableLateFee
        : finalFeeHead ===
            "OPENING_DUE"
          ? Number(
            student.openingDue || 0
          )
          : finalFeeHead ===
              "BUS"
            ? Number(
              currentFeeCalculation
                .feeBreakdown
                ?.BUS || 0
            )
          : getEffectiveFeeHeadAmount(
            student,
            finalFeeHead
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

      feeHead:
        finalFeeHead,

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

      feeBreakdown:
        normalizedFeeBreakdown,

      feeMonths:
        feeMonthAllocations,
    });

  // ===================================================
  // Create Fee
  // ===================================================

  const fee =
    await feeRepository.createFee(
      feeData
    );

  const postPaymentCalculation =
    finalPaymentType ===
      "REGULAR"
      ? await calculateFeeByHead({
        studentId:
          student.studentId,
        feeHead:
          "ALL",
      })
      : null;

  // ===================================================
  // Update Student
  // ===================================================

  const updatedStudent =
    await updateStudentAfterPayment(
      student,
      paymentAmount,
      finalPaymentType,
      postPaymentCalculation
        ?.dueFee || 0,
      lumpSumDetails,
      normalizedFeeBreakdown
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

      feeHead:
        finalFeeHead,

      effectiveFeeHeadAmount,

      paymentType:
        finalPaymentType,

      feeBreakdown:
        normalizedFeeBreakdown,

      feeMonths:
        feeMonthAllocations,

      lumpSumDetails:
        finalPaymentType ===
          "LUMP_SUM"
          ? lumpSumDetails
          : null,
    },
  };
};


const waiveLateFee = async (
  body = {},
  userId
) => {
  const studentId =
    String(
      body.studentId || ""
    ).trim();

  const month =
    String(
      body.month || ""
    ).trim();

  const reason =
    String(
      body.reason || ""
    ).trim();

  const waiverType =
    String(
      body.waiverType ||
        "AMOUNT"
    )
      .trim()
      .toUpperCase();

  // ===============================================
  // Basic Validation
  // ===============================================

  if (!studentId) {
    throw new Error(
      "Student ID is required"
    );
  }

  if (
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(
      month
    )
  ) {
    throw new Error(
      "Month must be in YYYY-MM format"
    );
  }

  if (!reason) {
    throw new Error(
      "Waiver reason is required"
    );
  }

  if (!userId) {
    throw new Error(
      "Waiving user is required"
    );
  }

  const allowedWaiverTypes = [
    "FULL",
    "AMOUNT",
    "PERCENTAGE",
  ];

  if (
    !allowedWaiverTypes.includes(
      waiverType
    )
  ) {
    throw new Error(
      "Invalid waiver type"
    );
  }

  // ===============================================
  // Get Student
  // ===============================================

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

  if (
    student.feeDiscountType === "RTE"
  ) {
    throw new Error(
      "RTE student has no late fee"
    );
  }

  // ===============================================
  // Current Fee Calculation
  // ===============================================

  const currentCalculation =
    await calculateFeeByHead({
      studentId,
      feeHead: "ALL",
    });

  const lateFeeDetails =
    Array.isArray(
      currentCalculation.lateFeeDetails
    )
      ? currentCalculation.lateFeeDetails
      : Array.isArray(
          currentCalculation.monthWiseLateFee
        )
      ? currentCalculation.monthWiseLateFee
      : [];

  const monthDetail =
    lateFeeDetails.find(
      (item) =>
        item.month === month
    );

  if (!monthDetail) {
    throw new Error(
      "Late fee month not found"
    );
  }

  const originalLateFee =
    Math.max(
      Number(
        monthDetail.lateFee || 0
      ),
      0
    );

  const lateFeePaid =
    Math.max(
      Number(
        monthDetail.lateFeePaid || 0
      ),
      0
    );

  if (
    originalLateFee <= 0
  ) {
    throw new Error(
      "No late fee exists for this month"
    );
  }

  const maximumWaivableAmount =
    Number(
      Math.max(
        originalLateFee -
          lateFeePaid,
        0
      ).toFixed(2)
    );

  // ===============================================
  // Calculate Waiver Amount
  // ===============================================

  let finalWaivedAmount = 0;
  let waiverValue = null;

  if (
    waiverType === "FULL"
  ) {
    waiverValue = 100;

    finalWaivedAmount =
      maximumWaivableAmount;
  }

  if (
    waiverType === "AMOUNT"
  ) {
    waiverValue =
      Number(
        body.waiverValue ??
          body.waivedAmount
      );

    if (
      !Number.isFinite(
        waiverValue
      ) ||
      waiverValue <= 0
    ) {
      throw new Error(
        "Valid waived amount is required"
      );
    }

    if (
      waiverValue >
      maximumWaivableAmount
    ) {
      throw new Error(
        `Waived amount cannot exceed ${maximumWaivableAmount}`
      );
    }

    finalWaivedAmount =
      waiverValue;
  }

  if (
    waiverType ===
    "PERCENTAGE"
  ) {
    waiverValue =
      Number(
        body.waiverValue ??
          body.percentage
      );

    if (
      !Number.isFinite(
        waiverValue
      ) ||
      waiverValue <= 0 ||
      waiverValue > 100
    ) {
      throw new Error(
        "Waiver percentage must be between 1 and 100"
      );
    }

    finalWaivedAmount =
      maximumWaivableAmount *
      (
        waiverValue / 100
      );
  }

  finalWaivedAmount =
    Number(
      finalWaivedAmount.toFixed(2)
    );

  // ===============================================
  // Existing Waivers
  // ===============================================

  const updatedWaivers =
    Array.isArray(
      student.lateFeeWaivers
    )
      ? student.lateFeeWaivers.map(
          (waiver) =>
            typeof waiver.toObject ===
            "function"
              ? waiver.toObject()
              : { ...waiver }
        )
      : [];

  const existingIndex =
    updatedWaivers.findIndex(
      (waiver) =>
        waiver.month === month
    );

  const waiverData = {
    month,

    waivedAmount:
      finalWaivedAmount,

    reason,

    waivedBy:
      userId,

    waivedAt:
      new Date(),
  };

  // Same month à¤•à¥€ waiver update à¤•à¤°à¥‡à¤‚,
  // duplicate entry à¤¨à¤¹à¥€à¤‚ à¤¬à¤¨à¤¾à¤à¤
  if (
    existingIndex >= 0
  ) {
    updatedWaivers[
      existingIndex
    ] = {
      ...updatedWaivers[
        existingIndex
      ],

      ...waiverData,
    };
  } else {
    updatedWaivers.push(
      waiverData
    );
  }

  // ===============================================
  // Save Waiver
  // ===============================================

  const updatedStudent =
    await studentRepository.updateStudent(
      student._id,
      {
        lateFeeWaivers:
          updatedWaivers,

        updatedBy:
          userId,
      }
    );

  if (!updatedStudent) {
    throw new Error(
      "Late fee waiver failed"
    );
  }

  // ===============================================
  // Updated Fee Calculation
  // ===============================================

  const updatedCalculation =
    await calculateFeeByHead({
      studentId,
      feeHead: "ALL",
    });

  const updatedDetails =
    Array.isArray(
      updatedCalculation.lateFeeDetails
    )
      ? updatedCalculation.lateFeeDetails
      : Array.isArray(
          updatedCalculation.monthWiseLateFee
        )
      ? updatedCalculation.monthWiseLateFee
      : [];

  const updatedMonthDetail =
    updatedDetails.find(
      (item) =>
        item.month === month
    );

  // ===============================================
  // Response
  // ===============================================

  return {
    studentId,

    month,

    waiverType,

    waiverValue,

    reason,

    lateFee:
      Number(
        updatedMonthDetail
          ?.lateFee ||
          originalLateFee
      ),

    lateFeePaid:
      Number(
        updatedMonthDetail
          ?.lateFeePaid || 0
      ),

    waivedAmount:
      Number(
        updatedMonthDetail
          ?.waivedAmount ??
          finalWaivedAmount
      ),

    payableLateFee:
      Number(
        updatedMonthDetail
          ?.payableLateFee || 0
      ),

    totalLateFee:
      Number(
        updatedCalculation
          .lateFee || 0
      ),

    totalLateFeeWaived:
      Number(
        updatedCalculation
          .lateFeeWaived || 0
      ),

    totalPayableLateFee:
      Number(
        updatedCalculation
          .payableLateFee || 0
      ),

    dueFee:
      Number(
        updatedCalculation
          .dueFee || 0
      ),

    lateFeeDetails:
      updatedDetails,
  };
};



const revokeLateFeeWaiver = async (
  studentId,
  month,
  userId
) => {
  studentId = String(studentId || "").trim();
  month = String(month || "").trim();

  if (!studentId) {
    throw new Error("Student ID is required");
  }

  if (
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)
  ) {
    throw new Error(
      "Month must be in YYYY-MM format"
    );
  }

  const student =
    await studentRepository.findByStudentId(
      studentId
    );

  if (!student) {
    throw new Error("Student not found");
  }

  const currentWaivers =
    Array.isArray(student.lateFeeWaivers)
      ? student.lateFeeWaivers
      : [];

  const existingWaiver =
    currentWaivers.find(
      (waiver) => waiver.month === month
    );

  if (!existingWaiver) {
    throw new Error(
      "Late fee waiver not found for this month"
    );
  }

  const revokedAmount =
    Number(
      existingWaiver.waivedAmount || 0
    );

  // Selected month à¤•à¥€ waiver à¤¹à¤Ÿà¤¾à¤à¤
  const updatedWaivers =
    currentWaivers
      .filter(
        (waiver) =>
          waiver.month !== month
      )
      .map((waiver) =>
        typeof waiver.toObject === "function"
          ? waiver.toObject()
          : { ...waiver }
      );

  const updatedStudent =
    await studentRepository.updateStudent(
      student._id,
      {
        lateFeeWaivers: updatedWaivers,
        updatedBy: userId,
      }
    );

  if (!updatedStudent) {
    throw new Error(
      "Late fee waiver revoke failed"
    );
  }

  // Revoke à¤•à¥‡ à¤¬à¤¾à¤¦ fresh calculation
  const updatedCalculation =
    await calculateFeeByHead({
      studentId,
      feeHead: "ALL",
    });

  const lateFeeDetails =
    Array.isArray(
      updatedCalculation.lateFeeDetails
    )
      ? updatedCalculation.lateFeeDetails
      : [];

  const updatedMonthDetail =
    lateFeeDetails.find(
      (item) => item.month === month
    );

  return {
    studentId,
    month,
    revokedAmount,

    waivedAmount:
      Number(
        updatedMonthDetail?.waivedAmount || 0
      ),

    payableLateFee:
      Number(
        updatedMonthDetail?.payableLateFee || 0
      ),

    totalLateFeeWaived:
      Number(
        updatedCalculation.lateFeeWaived || 0
      ),

    totalPayableLateFee:
      Number(
        updatedCalculation.payableLateFee || 0
      ),

    dueFee:
      Number(
        updatedCalculation.dueFee || 0
      ),

    lateFeeDetails,
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
    feeBreakdown,
    feeMonths,
  } = body;

  // ===================================================
  // Fee Head Validation
  // ===================================================

  const finalFeeHead =
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

  const currentFeeCalculation =
    await calculateFeeByHead({
      studentId:
        student.studentId,

      feeHead:
        "ALL",
    });

  const currentDueFee =
    Number(
      currentFeeCalculation
        .dueFee || 0
    );

  // ===================================================
  // Regular Payment
  // ===================================================

  if (
    finalPaymentType ===
    "REGULAR"
  ) {
    const headDue =
      finalFeeHead === "ALL"
        ? currentDueFee
        : finalFeeHead ===
            "MONTHLY"
          ? Number(
            currentFeeCalculation
              .dueBreakdown
              ?.MONTHLY || 0
          ) +
            Number(
              currentFeeCalculation
                .dueBreakdown
                ?.LATE_FEE || 0
            )
          : Number(
            currentFeeCalculation
              .dueBreakdown
              ?.[finalFeeHead] || 0
          );

    validateDueAmount(
      paymentAmount,
      headDue
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

  let lumpSumDetails =
    null;

  if (
    finalPaymentType ===
    "LUMP_SUM"
  ) {
    if (
      student.lumpSumPaid ===
      true
    ) {
      const error =
        new Error(
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
  // Fee Breakdown
  // ===================================================

  const normalizedFeeBreakdown = {
    MONTHLY: 0,
    BUS: 0,
    ADMISSION: 0,
    EXAM: 0,
    SPORT: 0,
    COMPUTER: 0,
    FUNCTION: 0,
    SMART_CLASS: 0,
    OTHER: 0,
    LATE_FEE: 0,
    OPENING_DUE: 0,
  };

  // ===================================================
  // Lump Sum Breakdown
  // Always calculated by the backend, including late fee.
  // ===================================================

  if (
    finalPaymentType ===
    "LUMP_SUM"
  ) {
    applyLumpSumFeeBreakdown(
      normalizedFeeBreakdown,
      lumpSumDetails
    );
  }

  // ===================================================
  // ALL Regular Fee Payment
  // ===================================================

  else if (
    finalFeeHead === "ALL"
  ) {
    if (
      !feeBreakdown ||
      typeof feeBreakdown !==
        "object"
    ) {
      throw new Error(
        "feeBreakdown is required when feeHead is All"
      );
    }

    let breakdownTotal = 0;

    for (
      const head of Object.keys(
        normalizedFeeBreakdown
      )
    ) {
      const headAmount =
        Number(
          feeBreakdown[head] || 0
        );

      if (
        !Number.isFinite(
          headAmount
        ) ||
        headAmount < 0
      ) {
        throw new Error(
          `${head} fee amount must be a valid non-negative number`
        );
      }

      const availableDue =
        Number(
          currentFeeCalculation
            .dueBreakdown
            ?.[head] || 0
        );

      if (
        finalPaymentType ===
          "REGULAR" &&
        headAmount >
          availableDue + 0.01
      ) {
        throw new Error(
          `${head} amount cannot be greater than due amount â‚¹${availableDue}`
        );
      }

      normalizedFeeBreakdown[
        head
      ] = Number(
        headAmount.toFixed(2)
      );

      breakdownTotal +=
        headAmount;
    }

    breakdownTotal =
      Number(
        breakdownTotal.toFixed(2)
      );

    const finalPaymentAmount =
      Number(
        paymentAmount.toFixed(2)
      );

    if (
      breakdownTotal !==
      finalPaymentAmount
    ) {
      throw new Error(
        `Fee breakdown total â‚¹${breakdownTotal} must equal payment amount â‚¹${finalPaymentAmount}`
      );
    }
  }

  // ===================================================
  // Single Fee Head Payment
  // ===================================================

  else if (
    finalFeeHead === "MONTHLY"
  ) {
    const monthlyDue =
      Number(
        currentFeeCalculation
          .dueBreakdown
          ?.MONTHLY || 0
      );

    const monthlyPart =
      Math.min(
        paymentAmount,
        monthlyDue
      );

    normalizedFeeBreakdown
      .MONTHLY =
      Number(
        monthlyPart.toFixed(2)
      );

    normalizedFeeBreakdown
      .LATE_FEE =
      Number(
        Math.max(
          paymentAmount -
            monthlyPart,
          0
        ).toFixed(2)
      );
  } else {
    if (
      !Object.prototype
        .hasOwnProperty.call(
          normalizedFeeBreakdown,
          finalFeeHead
        )
    ) {
      throw new Error(
        "Invalid fee head"
      );
    }

    normalizedFeeBreakdown[
      finalFeeHead
    ] = Number(
      paymentAmount.toFixed(2)
    );
  }

  // ===================================================
  // Optional MONTHLY / BUS Month-wise Allocations
  // ===================================================

  const feeMonthAllocations =
    await buildSelectedFeeMonthAllocations({
      student,
      currentFeeCalculation,
      feeMonths,
      feeBreakdown:
        normalizedFeeBreakdown,
      paymentType:
        finalPaymentType,
    });

  // ===================================================
  // Effective Fee Head
  // ===================================================

  const effectiveFeeHeadAmount =
    finalFeeHead === "ALL"
      ? paymentAmount
      : finalFeeHead ===
          "LATE_FEE"
        ? currentFeeCalculation
          .payableLateFee
        : finalFeeHead ===
            "OPENING_DUE"
          ? Number(
            student.openingDue || 0
          )
          : finalFeeHead ===
              "BUS"
            ? Number(
              currentFeeCalculation
                .feeBreakdown
                ?.BUS || 0
            )
          : getEffectiveFeeHeadAmount(
            student,
            finalFeeHead
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
          : `${finalFeeHead} Fee Payment - ${student.studentId}`,

      notes: {
        studentId:
          student.studentId,

        studentMongoId:
          student._id.toString(),

        feeHead:
          finalFeeHead,

        effectiveFeeHeadAmount,

        feeDiscountType:
          student.feeDiscountType ||
          "NONE",

        paymentType:
          finalPaymentType,
      },
    });

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

        feeHead:
          finalFeeHead,

        feeBreakdown:
          normalizedFeeBreakdown,

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

        feeMonths:
          feeMonthAllocations,
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
      finalFeeHead,

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

    feeBreakdown:
      normalizedFeeBreakdown,

    feeMonths:
      feeMonthAllocations,

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

        feeMonths:
          pendingPayment.feeMonths ||
          [],

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

    const currentFeeCalculation =
      await calculateFeeByHead({
        studentId:
          student.studentId,

        feeHead:
          "ALL",
      });

    const currentDueFee =
      Number(
        currentFeeCalculation
          .dueFee || 0
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

    const finalFeeHead =
      validateFeeHead(
        pendingPayment.feeHead
      );

    // =================================================
    // Regular Payment
    // =================================================

    if (
      finalPaymentType ===
      "REGULAR"
    ) {
      const headDue =
        finalFeeHead === "ALL"
          ? currentDueFee
          : finalFeeHead ===
              "MONTHLY"
            ? Number(
              currentFeeCalculation
                .dueBreakdown
                ?.MONTHLY || 0
            ) +
              Number(
                currentFeeCalculation
                  .dueBreakdown
                  ?.LATE_FEE || 0
              )
            : Number(
              currentFeeCalculation
                .dueBreakdown
                ?.[finalFeeHead] || 0
            );

      validateDueAmount(
        paidAmount,
        headDue
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

      if (
        currentDueFee <= 0
      ) {
        const error =
          new Error(
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
    // Remarks
    // =================================================

    const finalRemarks =
      finalPaymentType ===
        "LUMP_SUM"
        ? "Online UPI QR Lump Sum Academic Fee Payment"
        : "Online UPI QR Payment";

    // =================================================
    // Payment Breakdown
    // =================================================

    const paymentFeeBreakdown = {
      MONTHLY: 0,
      BUS: 0,
      ADMISSION: 0,
      EXAM: 0,
      SPORT: 0,
      COMPUTER: 0,
      FUNCTION: 0,
      SMART_CLASS: 0,
      OTHER: 0,
      LATE_FEE: 0,
      OPENING_DUE: 0,
    };

    const savedBreakdown =
      typeof pendingPayment
        .feeBreakdown?.toObject ===
        "function"
        ? pendingPayment
          .feeBreakdown.toObject()
        : pendingPayment
          .feeBreakdown;

    if (
      savedBreakdown &&
      typeof savedBreakdown ===
        "object"
    ) {
      for (
        const head of Object.keys(
          paymentFeeBreakdown
        )
      ) {
        const savedAmount =
          Number(
            savedBreakdown[head] || 0
          );

        if (
          Number.isFinite(
            savedAmount
          ) &&
          savedAmount >= 0
        ) {
          paymentFeeBreakdown[
            head
          ] = Number(
            savedAmount.toFixed(2)
          );
        }
      }
    }

    const savedBreakdownTotal =
      Object.values(
        paymentFeeBreakdown
      ).reduce(
        (
          total,
          value
        ) =>
          total +
          Number(
            value || 0
          ),
        0
      );

    // Backward compatibility for QR records created
    // before feeBreakdown was stored.

    if (
      Math.abs(
        savedBreakdownTotal -
          paidAmount
      ) > 0.01
    ) {
      for (
        const head of Object.keys(
          paymentFeeBreakdown
        )
      ) {
        paymentFeeBreakdown[
          head
        ] = 0;
      }

      if (
        finalFeeHead ===
        "MONTHLY"
      ) {
        const monthlyDue =
          Number(
            currentFeeCalculation
              .dueBreakdown
              ?.MONTHLY || 0
          );

        const monthlyPart =
          Math.min(
            paidAmount,
            monthlyDue
          );

        paymentFeeBreakdown
          .MONTHLY =
          Number(
            monthlyPart.toFixed(2)
          );

        paymentFeeBreakdown
          .LATE_FEE =
          Number(
            Math.max(
              paidAmount -
                monthlyPart,
              0
            ).toFixed(2)
          );
      } else if (
        finalFeeHead === "ALL"
      ) {
        let remainingAmount =
          paidAmount;

        const allocationOrder = [
          "OPENING_DUE",
          "ADMISSION",
          "EXAM",
          "SPORT",
          "COMPUTER",
          "FUNCTION",
          "SMART_CLASS",
          "OTHER",
          "BUS",
          "MONTHLY",
          "LATE_FEE",
        ];

        for (
          const head of allocationOrder
        ) {
          if (
            remainingAmount <= 0
          ) {
            break;
          }

          const headDue =
            Number(
              currentFeeCalculation
                .dueBreakdown
                ?.[head] || 0
            );

          const allocatedAmount =
            Math.min(
              remainingAmount,
              headDue
            );

          paymentFeeBreakdown[
            head
          ] = Number(
            allocatedAmount.toFixed(2)
          );

          remainingAmount =
            Number(
              (
                remainingAmount -
                allocatedAmount
              ).toFixed(2)
            );
        }
      } else {
        paymentFeeBreakdown[
          finalFeeHead
        ] = Number(
          paidAmount.toFixed(2)
        );
      }
    }

    // A captured Lump Sum payment always uses the
    // freshly recalculated server breakdown. This keeps
    // LATE_FEE allocation correct even for older pending
    // QR records that did not save it.
    if (
      finalPaymentType ===
      "LUMP_SUM"
    ) {
      applyLumpSumFeeBreakdown(
        paymentFeeBreakdown,
        lumpSumDetails
      );
    }

    // =================================================
    // Create Fee
    // =================================================

    const feeData =
      buildFeePaymentData({
        receiptNo,

        student,

        feeHead:
          finalFeeHead,

        amount:
          Number(
            paidAmount.toFixed(2)
          ),

        paymentType:
          finalPaymentType,

        lumpSumDetails,

        paymentMode:
          "ONLINE",

        transactionId:
          successfulPayment.id,

        remarks:
          finalRemarks,

        collectedBy:
          userId || null,

        feeBreakdown:
          paymentFeeBreakdown,

        feeMonths:
          pendingPayment.feeMonths ||
          [],
      });

    const fee =
      await feeRepository.createFee(
        feeData
      );

    const postPaymentCalculation =
      finalPaymentType ===
        "REGULAR"
        ? await calculateFeeByHead({
          studentId:
            student.studentId,

          feeHead:
            "ALL",
        })
        : null;

    // =================================================
    // Update Student
    // =================================================

    const updatedStudent =
      await updateStudentAfterPayment(
        student,
        paidAmount,
        finalPaymentType,
        postPaymentCalculation
          ?.dueFee || 0,
        lumpSumDetails,
        paymentFeeBreakdown
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
          finalFeeHead,

        paidFee:
          updatedStudent.paidFee,

        dueFee:
          updatedStudent.dueFee,

        feeDiscountType:
          updatedStudent.feeDiscountType ||
          "NONE",

        paymentType:
          finalPaymentType,

        feeBreakdown:
          paymentFeeBreakdown,

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

  normalizeRequestedFeeMonths,

  getPaidAmountByFeeMonth,

  buildSelectedFeeMonthAllocations,

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

  // =========================================
  // Fee Calculate API
  // =========================================
  calculateFeeByHead,
  waiveMonthlyFeeForAllStudents,
  waiveLateFee,
  revokeLateFeeWaiver,
};
