// =====================================
// Calculate Fee Start Date
// =====================================

const calculateFeeStartDate = (admissionDate) => {
  const date = new Date(admissionDate);

  // =====================================
  // Validate Admission Date
  // =====================================

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid admission date");
  }

  // =====================================
  // TEST MODE
  //
  // Fee starts NOW
  // 1 minute = 1 month
  // =====================================

  if (process.env.TEST_FEE_MODE === "true") {
    return new Date();
  }

  // =====================================
  // PRODUCTION MODE
  //
  // Admission: 15 July
  // Fee Start: 01 August
  // =====================================

  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    1
  );
};

// =====================================
// Validate Discount Type
// =====================================
//
// NONE
// SIBLING
// RTE
// GIRL
//
// =====================================

const validateFeeDiscountType = (
  feeDiscountType = "NONE"
) => {
  const allowedDiscountTypes = [
    "NONE",
    "SIBLING",
    "RTE",
    "GIRL",
  ];

  const finalDiscountType =
    feeDiscountType || "NONE";

  if (
    !allowedDiscountTypes.includes(
      finalDiscountType
    )
  ) {
    throw new Error(
      "Invalid fee discount type"
    );
  }

  return finalDiscountType;
};

// =====================================
// Get Discounted Monthly Fee
// =====================================
//
// NONE
//     -> No discount
//
// SIBLING
//     -> Monthly Fee 20% discount
//     -> Student pays 80%
//
// RTE
//     -> Monthly Fee = 0
//     -> Late Fee = 0
//
// GIRL
//     -> Monthly Fee unchanged
//     -> Late Fee applicable
//
// =====================================

const getDiscountedMonthlyFee = (
  monthlyFee,
  feeDiscountType = "NONE"
) => {
  const amount =
    Number(monthlyFee || 0);

  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new Error(
      "Monthly fee must be a valid non-negative number"
    );
  }

  const discountType =
    validateFeeDiscountType(
      feeDiscountType
    );

  switch (discountType) {
    // ===================================
    // SIBLING
    // 20% Discount
    // ===================================

    case "SIBLING":
      return amount * 0.8;

    // ===================================
    // RTE
    // 100% Discount
    // ===================================

    case "RTE":
      return 0;

    // ===================================
    // GIRL
    // Monthly fee unchanged
    // ===================================

    case "GIRL":
      return amount;

    // ===================================
    // NONE
    // ===================================

    case "NONE":
    default:
      return amount;
  }
};

// =====================================
// Calculate Monthly Fee
// =====================================

const calculateMonthlyFee = (
  feeStartDate,
  monthlyFee,
  currentDate = new Date(),
  feeDiscountType = "NONE"
) => {
  if (
    !feeStartDate ||
    monthlyFee === undefined ||
    monthlyFee === null
  ) {
    return 0;
  }

  const startDate =
    new Date(feeStartDate);

  const today =
    new Date(currentDate);

  // =====================================
  // Validate Dates
  // =====================================

  if (
    Number.isNaN(
      startDate.getTime()
    ) ||
    Number.isNaN(
      today.getTime()
    )
  ) {
    return 0;
  }

  // =====================================
  // Validate Monthly Fee
  // =====================================

  const originalMonthlyFee =
    Number(monthlyFee);

  if (
    !Number.isFinite(
      originalMonthlyFee
    ) ||
    originalMonthlyFee < 0
  ) {
    throw new Error(
      "Monthly fee must be a valid non-negative number"
    );
  }

  // =====================================
  // Validate Discount
  // =====================================

  const finalDiscountType =
    validateFeeDiscountType(
      feeDiscountType
    );

  // =====================================
  // Effective Monthly Fee
  // =====================================

  const discountedMonthlyFee =
    getDiscountedMonthlyFee(
      originalMonthlyFee,
      finalDiscountType
    );

  // =====================================
  // TEST MODE
  //
  // 1 MINUTE = 1 MONTH
  // =====================================

  if (
    process.env.TEST_FEE_MODE === "true"
  ) {
    const diffMs =
      today.getTime() -
      startDate.getTime();

    // Fee has not started
    if (diffMs < 0) {
      return 0;
    }

    const minutesPassed =
      Math.floor(
        diffMs /
          (60 * 1000)
      );

    // First month starts immediately
    const months =
      minutesPassed + 1;

    return (
      months *
      discountedMonthlyFee
    );
  }

  // =====================================
  // PRODUCTION MODE
  // =====================================

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

  // =====================================
  // Fee has not started
  // =====================================

  if (today < startDate) {
    return 0;
  }

  // =====================================
  // Calculate Number of Months
  // =====================================

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

  // =====================================
  // Final Monthly Fee
  // =====================================

  return (
    months *
    discountedMonthlyFee
  );
};

// =====================================
// Get Month End Date
// =====================================

const getMonthEndDate = (
  year,
  month
) => {
  return new Date(
    year,
    month + 1,
    0
  );
};

// =====================================
// Calculate Late Fee For One Month
// =====================================
//
// Rules:
//
// NONE:
//   Late fee applicable
//
// SIBLING:
//   Late fee applicable
//
// GIRL:
//   Late fee applicable
//
// RTE:
//   Late fee = ₹0
//
// -------------------------------------
//
// Normal Late Fee Rules:
//
// Before 20th:
//   ₹0
//
// 20th to before month-end:
//   ₹20
//
// Month-end onwards:
//   ₹50
//
// Maximum:
//   ₹50 per overdue month
//
// =====================================

const calculateLateFeeForMonth = (
  feeMonthDate,
  currentDate = new Date(),
  feeDiscountType = "NONE"
) => {
  // =====================================
  // Validate Discount Type
  // =====================================

  const finalDiscountType =
    validateFeeDiscountType(
      feeDiscountType
    );

  // =====================================
  // RTE
  //
  // RTE has zero fees.
  // Therefore no late fee.
  // =====================================

  if (
    finalDiscountType === "RTE"
  ) {
    return 0;
  }

  const monthDate =
    new Date(feeMonthDate);

  const today =
    new Date(currentDate);

  // =====================================
  // Validate Dates
  // =====================================

  if (
    Number.isNaN(
      monthDate.getTime()
    ) ||
    Number.isNaN(
      today.getTime()
    )
  ) {
    return 0;
  }

  monthDate.setHours(
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

  const year =
    monthDate.getFullYear();

  const month =
    monthDate.getMonth();

  // =====================================
  // 20th Date
  // =====================================

  const twentiethDate =
    new Date(
      year,
      month,
      20
    );

  twentiethDate.setHours(
    0,
    0,
    0,
    0
  );

  // =====================================
  // Month End
  // =====================================

  const monthEndDate =
    getMonthEndDate(
      year,
      month
    );

  monthEndDate.setHours(
    0,
    0,
    0,
    0
  );

  // =====================================
  // Before 20th
  // No Late Fee
  // =====================================

  if (
    today < twentiethDate
  ) {
    return 0;
  }

  // =====================================
  // 20th to before month-end
  // ₹20
  // =====================================

  if (
    today < monthEndDate
  ) {
    return 20;
  }

  // =====================================
  // Month-end onwards
  // ₹50
  // =====================================

  return 50;
};

// =====================================
// Calculate Total Late Fee
// =====================================
//
// paidFeeMonths format:
//
// [
//   "2026-08",
//   "2026-09"
// ]
//
// Paid months are excluded.
//
// RTE:
//   Late fee = ₹0
//
// =====================================

const calculateLateFee = (
  feeStartDate,
  currentDate = new Date(),
  paidFeeMonths = [],
  feeDiscountType = "NONE"
) => {
  // =====================================
  // Validate Discount
  // =====================================

  const finalDiscountType =
    validateFeeDiscountType(
      feeDiscountType
    );

  // =====================================
  // RTE
  //
// No late fee for RTE.
// =====================================

  if (
    finalDiscountType === "RTE"
  ) {
    return 0;
  }

  if (!feeStartDate) {
    return 0;
  }

  const startDate =
    new Date(feeStartDate);

  const today =
    new Date(currentDate);

  // =====================================
  // Validate Dates
  // =====================================

  if (
    Number.isNaN(
      startDate.getTime()
    ) ||
    Number.isNaN(
      today.getTime()
    )
  ) {
    return 0;
  }

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

  // =====================================
  // Fee has not started
  // =====================================

  if (
    today < startDate
  ) {
    return 0;
  }

  // =====================================
  // Normalize Paid Months
  // =====================================

  const paidMonths =
    new Set(
      Array.isArray(
        paidFeeMonths
      )
        ? paidFeeMonths
        : []
    );

  let totalLateFee = 0;

  // =====================================
  // Start from Fee Start Month
  // =====================================

  let currentMonth =
    new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      1
    );

  // =====================================
  // Check Every Month
  // =====================================

  while (
    currentMonth <= today
  ) {
    const year =
      currentMonth.getFullYear();

    const month =
      currentMonth.getMonth();

    const monthKey =
      `${year}-${String(
        month + 1
      ).padStart(2, "0")}`;

    // ===================================
    // Skip Paid Month
    // ===================================

    if (
      !paidMonths.has(
        monthKey
      )
    ) {
      totalLateFee +=
        calculateLateFeeForMonth(
          currentMonth,
          today,
          finalDiscountType
        );
    }

    // ===================================
    // Next Month
    // ===================================

    currentMonth =
      new Date(
        year,
        month + 1,
        1
      );
  }

  return totalLateFee;
};

// =====================================
// Calculate Month-wise Late Fee
// =====================================
//
// Returns:
//
// [
//   {
//     month: "2026-08",
//     lateFee: 50,
//     paid: false
//   }
// ]
//
// RTE:
//
// [
//   {
//     month: "2026-08",
//     lateFee: 0,
//     paid: false
//   }
// ]
//
// =====================================

const calculateMonthWiseLateFee = (
  feeStartDate,
  currentDate = new Date(),
  paidFeeMonths = [],
  feeDiscountType = "NONE"
) => {
  // =====================================
  // Validate Discount
  // =====================================

  const finalDiscountType =
    validateFeeDiscountType(
      feeDiscountType
    );

  if (!feeStartDate) {
    return [];
  }

  const startDate =
    new Date(feeStartDate);

  const today =
    new Date(currentDate);

  // =====================================
  // Validate Dates
  // =====================================

  if (
    Number.isNaN(
      startDate.getTime()
    ) ||
    Number.isNaN(
      today.getTime()
    )
  ) {
    return [];
  }

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

  // =====================================
  // Fee not started
  // =====================================

  if (
    today < startDate
  ) {
    return [];
  }

  // =====================================
  // Normalize Paid Months
  // =====================================

  const paidMonths =
    new Set(
      Array.isArray(
        paidFeeMonths
      )
        ? paidFeeMonths
        : []
    );

  const result = [];

  let currentMonth =
    new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      1
    );

  // =====================================
  // Loop Through Months
  // =====================================

  while (
    currentMonth <= today
  ) {
    const year =
      currentMonth.getFullYear();

    const month =
      currentMonth.getMonth();

    const monthKey =
      `${year}-${String(
        month + 1
      ).padStart(2, "0")}`;

    const isPaid =
      paidMonths.has(
        monthKey
      );

    const lateFee =
      isPaid
        ? 0
        : calculateLateFeeForMonth(
            currentMonth,
            today,
            finalDiscountType
          );

    result.push({
      month: monthKey,
      lateFee,
      paid: isPaid,
    });

    // ===================================
    // Next Month
    // ===================================

    currentMonth =
      new Date(
        year,
        month + 1,
        1
      );
  }

  return result;
};

// =====================================
// Calculate Late Fee Waiver
// =====================================
//
// waiverType:
//
// NONE
// AMOUNT
// PERCENTAGE
// FULL
//
// =====================================

const calculateLateFeeWaiver = (
  lateFee,
  waiverType = "NONE",
  waiverValue = 0
) => {
  const finalLateFee =
    Number(
      lateFee || 0
    );

  // =====================================
  // Validate Late Fee
  // =====================================

  if (
    !Number.isFinite(
      finalLateFee
    ) ||
    finalLateFee < 0
  ) {
    throw new Error(
      "Late fee must be a valid non-negative number"
    );
  }

  const finalWaiverType =
    waiverType || "NONE";

  let waivedAmount = 0;

  switch (
    finalWaiverType
  ) {
    // ===================================
    // FULL WAIVER
    // ===================================

    case "FULL":
      waivedAmount =
        finalLateFee;
      break;

    // ===================================
    // FIXED AMOUNT WAIVER
    // ===================================

    case "AMOUNT": {
      const amount =
        Number(
          waiverValue || 0
        );

      if (
        !Number.isFinite(
          amount
        ) ||
        amount < 0
      ) {
        throw new Error(
          "Waiver amount must be a valid non-negative number"
        );
      }

      waivedAmount =
        Math.min(
          amount,
          finalLateFee
        );

      break;
    }

    // ===================================
    // PERCENTAGE WAIVER
    // ===================================

    case "PERCENTAGE": {
      const percentage =
        Number(
          waiverValue || 0
        );

      if (
        !Number.isFinite(
          percentage
        ) ||
        percentage < 0 ||
        percentage > 100
      ) {
        throw new Error(
          "Waiver percentage must be between 0 and 100"
        );
      }

      waivedAmount =
        finalLateFee *
        (
          percentage / 100
        );

      break;
    }

    // ===================================
    // NO WAIVER
    // ===================================

    case "NONE":
    default:
      waivedAmount = 0;
      break;
  }

  // =====================================
  // Payable Late Fee
  // =====================================

  const payableLateFee =
    Math.max(
      finalLateFee -
        waivedAmount,
      0
    );

  return {
    lateFee:
      finalLateFee,

    waivedAmount,

    payableLateFee,
  };
};

// =====================================
// Calculate Due Fee
// =====================================
//
// Formula:
//
// Opening Due
// + Monthly Fee
// + Payable Late Fee
// - Paid Fee
//
// RTE:
//
// Opening Due
// + Monthly Fee (0)
// + Late Fee (0)
// - Paid Fee
//
// =====================================

const calculateDueFee = (
  feeStartDate,
  monthlyFee,
  openingDue = 0,
  paidFee = 0,
  currentDate = new Date(),
  feeDiscountType = "NONE",
  paidFeeMonths = [],
  lateFeeWaiverType = "NONE",
  lateFeeWaiverValue = 0
) => {
  // =====================================
  // Validate Discount
  // =====================================

  const finalDiscountType =
    validateFeeDiscountType(
      feeDiscountType
    );

  // =====================================
  // Monthly Fee
  // =====================================

  const monthlyAmount =
    calculateMonthlyFee(
      feeStartDate,
      monthlyFee,
      currentDate,
      finalDiscountType
    );

  // =====================================
  // Late Fee
  //
  // RTE automatically returns 0.
  // =====================================

  const lateFee =
    calculateLateFee(
      feeStartDate,
      currentDate,
      paidFeeMonths,
      finalDiscountType
    );

  // =====================================
  // Late Fee Waiver
  // =====================================

  const lateFeeWaiver =
    calculateLateFeeWaiver(
      lateFee,
      lateFeeWaiverType,
      lateFeeWaiverValue
    );

  // =====================================
  // Opening Due
  // =====================================

  const finalOpeningDue =
    Number(
      openingDue || 0
    );

  // =====================================
  // Paid Fee
  // =====================================

  const finalPaidFee =
    Number(
      paidFee || 0
    );

  // =====================================
  // Validate Opening Due
  // =====================================

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

  // =====================================
  // Validate Paid Fee
  // =====================================

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

  // =====================================
  // Calculate Total Due
  // =====================================

  const totalDue =
    finalOpeningDue +
    monthlyAmount +
    lateFeeWaiver.payableLateFee -
    finalPaidFee;

  // =====================================
  // Never Return Negative Due
  // =====================================

  const finalDue =
    Math.max(
      totalDue,
      0
    );

  // =====================================
  // Return Detailed Result
  // =====================================

  return {
    openingDue:
      finalOpeningDue,

    monthlyFee:
      monthlyAmount,

    lateFee:
      lateFeeWaiver.lateFee,

    lateFeeWaived:
      lateFeeWaiver.waivedAmount,

    payableLateFee:
      lateFeeWaiver.payableLateFee,

    paidFee:
      finalPaidFee,

    totalDue:
      finalDue,
  };
};

// =====================================
// Get Monthly Discount Percentage
// =====================================

const getMonthlyDiscountPercentage = (
  feeDiscountType = "NONE"
) => {
  const finalDiscountType =
    validateFeeDiscountType(
      feeDiscountType
    );

  switch (
    finalDiscountType
  ) {
    case "SIBLING":
      return 20;

    case "RTE":
      return 100;

    case "GIRL":
      return 0;

    case "NONE":
    default:
      return 0;
  }
};

// =====================================
// Get Admission Fee Discount
// =====================================

const getAdmissionDiscountPercentage = (
  feeDiscountType = "NONE"
) => {
  const finalDiscountType =
    validateFeeDiscountType(
      feeDiscountType
    );

  switch (
    finalDiscountType
  ) {
    case "RTE":
      return 100;

    case "GIRL":
      return 50;

    case "SIBLING":
    case "NONE":
    default:
      return 0;
  }
};

// =====================================
// Get Discounted Admission Fee
// =====================================

const getDiscountedAdmissionFee = (
  admissionFee,
  feeDiscountType = "NONE"
) => {
  const amount =
    Number(
      admissionFee || 0
    );

  // =====================================
  // Validate Admission Fee
  // =====================================

  if (
    !Number.isFinite(
      amount
    ) ||
    amount < 0
  ) {
    throw new Error(
      "Admission fee must be a valid non-negative number"
    );
  }

  const discountPercentage =
    getAdmissionDiscountPercentage(
      feeDiscountType
    );

  return (
    amount *
    (
      1 -
      discountPercentage / 100
    )
  );
};

// =====================================
// Get Discounted Fee Heads
// =====================================

const getDiscountedFeeHeads = (
  {
    admissionFee = 0,
    monthlyFee = 0,
    examFee = 0,
    sportFee = 0,
    computerFee = 0,
    functionFee = 0,
    smartClassFee = 0,
    otherCharges = 0,
  },
  feeDiscountType = "NONE"
) => {
  const finalDiscountType =
    validateFeeDiscountType(
      feeDiscountType
    );

  // =====================================
  // Admission
  // =====================================

  const finalAdmissionFee =
    getDiscountedAdmissionFee(
      admissionFee,
      finalDiscountType
    );

  // =====================================
  // Monthly
  // =====================================

  const finalMonthlyFee =
    getDiscountedMonthlyFee(
      monthlyFee,
      finalDiscountType
    );

  // =====================================
  // Other Fee Heads
  // =====================================

  const finalExamFee =
    Number(
      examFee || 0
    );

  const finalSportFee =
    Number(
      sportFee || 0
    );

  const finalComputerFee =
    Number(
      computerFee || 0
    );

  const finalFunctionFee =
    Number(
      functionFee || 0
    );

  const finalSmartClassFee =
    Number(
      smartClassFee || 0
    );

  const finalOtherCharges =
    Number(
      otherCharges || 0
    );

  // =====================================
  // RTE
  //
  // All Fees 100% Discounted
  // =====================================

  if (
    finalDiscountType === "RTE"
  ) {
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
  }

  // =====================================
  // Normal / Sibling / Girl
  // =====================================

  return {
    admissionFee:
      finalAdmissionFee,

    monthlyFee:
      finalMonthlyFee,

    examFee:
      finalExamFee,

    sportFee:
      finalSportFee,

    computerFee:
      finalComputerFee,

    functionFee:
      finalFunctionFee,

    smartClassFee:
      finalSmartClassFee,

    otherCharges:
      finalOtherCharges,
  };
};

// =====================================
// Calculate One-Time Fee Total
// =====================================
//
// Includes:
//
// Admission
// Exam
// Sport
// Computer
// Function
// Smart Class
// Other Charges
//
// Monthly fee is NOT included.
//
// Late fee is NOT included.
//
// =====================================

const calculateOneTimeFeeTotal = (
  feeHeads,
  feeDiscountType = "NONE"
) => {
  const discountedFees =
    getDiscountedFeeHeads(
      feeHeads,
      feeDiscountType
    );

  return (
    discountedFees.admissionFee +
    discountedFees.examFee +
    discountedFees.sportFee +
    discountedFees.computerFee +
    discountedFees.functionFee +
    discountedFees.smartClassFee +
    discountedFees.otherCharges
  );
};

// =====================================
// Export
// =====================================

module.exports = {
  // ===================================
  // Fee Start
  // ===================================

  calculateFeeStartDate,

  // ===================================
  // Monthly Fee
  // ===================================

  calculateMonthlyFee,

  // ===================================
  // Due Fee
  // ===================================

  calculateDueFee,

  // ===================================
  // Discount
  // ===================================

  getDiscountedMonthlyFee,

  getMonthlyDiscountPercentage,

  getAdmissionDiscountPercentage,

  getDiscountedAdmissionFee,

  getDiscountedFeeHeads,

  calculateOneTimeFeeTotal,

  validateFeeDiscountType,

  // ===================================
  // Late Fee
  // ===================================

  calculateLateFeeForMonth,

  calculateLateFee,

  calculateMonthWiseLateFee,

  // ===================================
  // Late Fee Waiver
  // ===================================

  calculateLateFeeWaiver,
};
