// =====================================
// Calculate Fee Start Date
// =====================================

const {
  normalizeWaivedMonthKeys,
} = require("./monthlyFeeWaiver");

const calculateFeeStartDate = (admissionDate) => {
  const date = new Date(admissionDate);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid admission date");
  }

  // TEST MODE: fee starts now and 1 minute = 1 month.
  if (process.env.TEST_FEE_MODE === "true") {
    return new Date();
  }

  // PRODUCTION MODE:
  // Fee starts from first day of next month.
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    1
  );
};

// =====================================
// Validate Discount Type
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
    case "SIBLING":
      return amount * 0.8;

    case "RTE":
      return 0;

    case "GIRL":
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

  const finalDiscountType =
    validateFeeDiscountType(
      feeDiscountType
    );

  const discountedMonthlyFee =
    getDiscountedMonthlyFee(
      originalMonthlyFee,
      finalDiscountType
    );

  // TEST MODE:
  // First month starts immediately.
  // Every minute adds one month.
  if (
    process.env.TEST_FEE_MODE === "true"
  ) {
    const diffMs =
      today.getTime() -
      startDate.getTime();

    if (diffMs < 0) {
      return 0;
    }

    const minutesPassed =
      Math.floor(
        diffMs /
        (60 * 1000)
      );

    return (
      (minutesPassed + 1) *
      discountedMonthlyFee
    );
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

  if (today < startDate) {
    return 0;
  }

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

  return (
    months *
    discountedMonthlyFee
  );
};

// =====================================
// Calculate Late Fee For One Month
// =====================================
//
// 1st to 20th:
//   ₹0
//
// 21st to last day:
//   ₹20
//
// First day of next month onward:
//   ₹50
//
// RTE:
//   ₹0
//
// =====================================

const calculateLateFeeForMonth = (
  feeMonthDate,
  currentDate = new Date(),
  feeDiscountType = "NONE"
) => {
  const finalDiscountType =
    validateFeeDiscountType(
      feeDiscountType
    );

  if (
    finalDiscountType === "RTE"
  ) {
    return 0;
  }

  const monthDate =
    new Date(feeMonthDate);

  const today =
    new Date(currentDate);

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

  // 21st date:
  // Current unpaid month gets ₹20.
  const lateFeeStartDate =
    new Date(
      year,
      month,
      11
    );

  lateFeeStartDate.setHours(
    0,
    0,
    0,
    0
  );

  // First day of next month:
  // Previous unpaid month becomes ₹50.
  const nextMonthStartDate =
    new Date(
      year,
      month ,
      21
    );

  nextMonthStartDate.setHours(
    0,
    0,
    0,
    0
  );

  // 1st to 20th
  if (
    today <
    lateFeeStartDate
  ) {
    return 0;
  }

  // 21st to last day
  if (
    today <
    nextMonthStartDate
  ) {
    return 20;
  }

  // Next month onward
  return 50;
};

// =====================================
// Calculate Month-wise Late Fee
// =====================================

const calculateMonthWiseLateFee = (
  feeStartDate,
  currentDate = new Date(),
  paidFeeMonths = [],
  feeDiscountType = "NONE",
  lateFeeWaivers = [],
  excludedFeeMonths = []
) => {
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

  if (today < startDate) {
    return [];
  }

  // Normalize paid months
  const paidMonths =
    new Set(
      Array.isArray(
        paidFeeMonths
      )
        ? paidFeeMonths
        : []
    );

  /*
   * जिन months की monthly fee globally waived है,
   * उन months पर late fee भी generate नहीं होगी।
   */
  const excludedMonthKeys =
    normalizeWaivedMonthKeys(
      excludedFeeMonths
    );

  // Normalize month-wise waivers
  const waiverByMonth =
    new Map();

  if (
    Array.isArray(
      lateFeeWaivers
    )
  ) {
    lateFeeWaivers.forEach(
      (waiver) => {
        const waiverMonth =
          String(
            waiver?.month || ""
          ).trim();

        const waiverAmount =
          Number(
            waiver?.waivedAmount || 0
          );

        if (
          !/^\d{4}-(0[1-9]|1[0-2])$/.test(
            waiverMonth
          ) ||
          !Number.isFinite(
            waiverAmount
          ) ||
          waiverAmount <= 0
        ) {
          return;
        }

        const existingAmount =
          Number(
            waiverByMonth.get(
              waiverMonth
            ) || 0
          );

        waiverByMonth.set(
          waiverMonth,
          existingAmount +
            waiverAmount
        );
      }
    );
  }

  const result = [];

  let currentMonth =
    new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      1
    );

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

    if (
      excludedMonthKeys.has(
        monthKey
      )
    ) {
      currentMonth =
        new Date(
          year,
          month + 1,
          1
        );

      continue;
    }

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

    const savedWaiverAmount =
      Number(
        waiverByMonth.get(
          monthKey
        ) || 0
      );

    const waivedAmount =
      isPaid
        ? 0
        : Math.min(
            savedWaiverAmount,
            lateFee
          );

    const payableLateFee =
      Math.max(
        lateFee -
          waivedAmount,
        0
      );

    result.push({
      month:
        monthKey,

      lateFee,

      waivedAmount,

      payableLateFee,

      paid:
        isPaid,
    });

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
// Calculate Total Payable Late Fee
// =====================================

const calculateLateFee = (
  feeStartDate,
  currentDate = new Date(),
  paidFeeMonths = [],
  feeDiscountType = "NONE",
  lateFeeWaivers = [],
  excludedFeeMonths = []
) => {
  const monthWiseLateFee =
    calculateMonthWiseLateFee(
      feeStartDate,
      currentDate,
      paidFeeMonths,
      feeDiscountType,
      lateFeeWaivers,
      excludedFeeMonths
    );

  return monthWiseLateFee.reduce(
    (
      total,
      monthData
    ) => {
      return (
        total +
        Number(
          monthData
            ?.payableLateFee || 0
        )
      );
    },
    0
  );
};

// =====================================
// Calculate Late Fee Waiver
// =====================================
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
    case "FULL":
      waivedAmount =
        finalLateFee;
      break;

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

    case "NONE":
    default:
      waivedAmount = 0;
      break;
  }

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
// Opening Due
// + Monthly Fee
// + Payable Late Fee
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
  lateFeeWaiverValue = 0,
  lateFeeWaivers = [],
  excludedFeeMonths = []
) => {
  const finalDiscountType =
    validateFeeDiscountType(
      feeDiscountType
    );

  const monthlyAmount =
    calculateMonthlyFee(
      feeStartDate,
      monthlyFee,
      currentDate,
      finalDiscountType
    );

  const monthWiseLateFee =
    calculateMonthWiseLateFee(
      feeStartDate,
      currentDate,
      paidFeeMonths,
      finalDiscountType,
      lateFeeWaivers,
      excludedFeeMonths
    );

  // Total late fee before waiver
  const lateFee =
    monthWiseLateFee.reduce(
      (
        total,
        monthData
      ) => {
        return (
          total +
          Number(
            monthData
              ?.lateFee || 0
          )
        );
      },
      0
    );

  // Total month-wise waived amount
  const monthWiseWaivedAmount =
    monthWiseLateFee.reduce(
      (
        total,
        monthData
      ) => {
        return (
          total +
          Number(
            monthData
              ?.waivedAmount || 0
          )
        );
      },
      0
    );

  // Payable after month-wise waiver
  const monthWisePayableLateFee =
    monthWiseLateFee.reduce(
      (
        total,
        monthData
      ) => {
        return (
          total +
          Number(
            monthData
              ?.payableLateFee || 0
          )
        );
      },
      0
    );

  // Old global waiver support
  const globalLateFeeWaiver =
    calculateLateFeeWaiver(
      monthWisePayableLateFee,
      lateFeeWaiverType,
      lateFeeWaiverValue
    );

  const totalLateFeeWaived =
    monthWiseWaivedAmount +
    globalLateFeeWaiver
      .waivedAmount;

  const payableLateFee =
    globalLateFeeWaiver
      .payableLateFee;

  const finalOpeningDue =
    Number(
      openingDue || 0
    );

  const finalPaidFee =
    Number(
      paidFee || 0
    );

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

  const totalDue =
    finalOpeningDue +
    monthlyAmount +
    payableLateFee -
    finalPaidFee;

  return {
    openingDue:
      finalOpeningDue,

    monthlyFee:
      monthlyAmount,

    lateFee,

    lateFeeWaived:
      totalLateFeeWaived,

    payableLateFee,

    paidFee:
      finalPaidFee,

    totalDue:
      Math.max(
        totalDue,
        0
      ),
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

  const finalAdmissionFee =
    getDiscountedAdmissionFee(
      admissionFee,
      finalDiscountType
    );

  const finalMonthlyFee =
    getDiscountedMonthlyFee(
      monthlyFee,
      finalDiscountType
    );

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
    discountedFees
      .admissionFee +
    discountedFees
      .examFee +
    discountedFees
      .sportFee +
    discountedFees
      .computerFee +
    discountedFees
      .functionFee +
    discountedFees
      .smartClassFee +
    discountedFees
      .otherCharges
  );
};

// =====================================
// Export
// =====================================

module.exports = {
  calculateFeeStartDate,

  calculateMonthlyFee,

  calculateDueFee,

  getDiscountedMonthlyFee,

  getMonthlyDiscountPercentage,

  getAdmissionDiscountPercentage,

  getDiscountedAdmissionFee,

  getDiscountedFeeHeads,

  calculateOneTimeFeeTotal,

  validateFeeDiscountType,

  calculateLateFeeForMonth,

  calculateLateFee,

  calculateMonthWiseLateFee,

  calculateLateFeeWaiver,
};
