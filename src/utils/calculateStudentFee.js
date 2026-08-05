// =====================================
// Calculate Fee Start Date
// =====================================

const calculateFeeStartDate = (
  admissionDate
) => {
  const date = new Date(admissionDate);

  // =====================================
  // Validate Admission Date
  // =====================================

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      "Invalid admission date"
    );
  }

  // =====================================
  // TEST MODE
  //
  // Fee starts NOW
  // 1 minute = 1 month
  // =====================================

  if (
    process.env.TEST_FEE_MODE === "true"
  ) {
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
//     -> All Fees 100% discount
//     -> Monthly Fee = 0
//
// GIRL
//     -> Only Admission Fee 50% discount
//     -> Monthly Fee remains unchanged
//
// =====================================

const getDiscountedMonthlyFee = (
  monthlyFee,
  feeDiscountType = "NONE"
) => {
  const amount =
    Number(monthlyFee || 0);

  // =====================================
  // Validate Monthly Fee
  // =====================================

  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new Error(
      "Monthly fee must be a valid non-negative number"
    );
  }

  // =====================================
  // Validate Discount Type
  // =====================================

  const discountType =
    validateFeeDiscountType(
      feeDiscountType
    );

  // =====================================
  // Apply Discount
  // =====================================

  switch (discountType) {
    // ===================================
    // SIBLING
    // 20% Monthly Discount
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
    //
    // Girl discount is ONLY on
    // Admission Fee.
    //
    // Monthly fee remains 100%.
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
//
// This function calculates accumulated
// monthly fee from feeStartDate.
//
// Discount is applied BEFORE multiplying
// by number of months.
//
// Example:
//
// Monthly Fee = ₹1500
// SIBLING = 20%
//
// Effective Monthly Fee = ₹1200
//
// 3 Months:
//
// ₹1200 × 3 = ₹3600
//
// =====================================

const calculateMonthlyFee = (
  feeStartDate,
  monthlyFee,
  currentDate = new Date(),
  feeDiscountType = "NONE"
) => {
  // =====================================
  // No Fee
  // =====================================

  if (
    !feeStartDate ||
    monthlyFee === undefined ||
    monthlyFee === null
  ) {
    return 0;
  }

  // =====================================
  // Dates
  // =====================================

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
  // Validate Discount Type
  // =====================================

  const finalDiscountType =
    validateFeeDiscountType(
      feeDiscountType
    );

  // =====================================
  // Calculate Effective Monthly Fee
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

    // ===================================
    // Fee has not started
    // ===================================

    if (diffMs < 0) {
      return 0;
    }

    const minutesPassed =
      Math.floor(
        diffMs /
          (60 * 1000)
      );

    // ===================================
    // Create = 1st month
    // After 1 minute = 2nd month
    // After 2 minutes = 3rd month
    // ===================================

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
  // Fee has not started yet
  // =====================================

  if (today < startDate) {
    return 0;
  }

  // =====================================
  // Calculate Months
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
// Calculate Total Due
// =====================================
//
// Formula:
//
// Opening Due
// + Discounted Monthly Fee
// - Paid Fee
//
// =====================================

const calculateDueFee = (
  feeStartDate,
  monthlyFee,
  openingDue = 0,
  paidFee = 0,
  currentDate = new Date(),
  feeDiscountType = "NONE"
) => {
  // =====================================
  // Monthly Fee
  // =====================================

  const monthlyAmount =
    calculateMonthlyFee(
      feeStartDate,

      monthlyFee,

      currentDate,

      feeDiscountType
    );

  // =====================================
  // Opening Due
  // =====================================

  const finalOpeningDue =
    Number(openingDue || 0);

  // =====================================
  // Paid Fee
  // =====================================

  const finalPaidFee =
    Number(paidFee || 0);

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
    monthlyAmount -
    finalPaidFee;

  // =====================================
  // Never Return Negative Due
  // =====================================

  return Math.max(
    totalDue,
    0
  );
};

// =====================================
// Get Monthly Discount Percentage
// =====================================
//
// SIBLING = 20%
// RTE     = 100%
// GIRL    = 0% monthly
// NONE    = 0%
//
// =====================================

const getMonthlyDiscountPercentage = (
  feeDiscountType = "NONE"
) => {
  const finalDiscountType =
    validateFeeDiscountType(
      feeDiscountType
    );

  switch (finalDiscountType) {
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
//
// NONE
//     -> 0%
//
// SIBLING
//     -> 0%
//
// RTE
//     -> 100%
//
// GIRL
//     -> 50%
//
// =====================================

const getAdmissionDiscountPercentage = (
  feeDiscountType = "NONE"
) => {
  const finalDiscountType =
    validateFeeDiscountType(
      feeDiscountType
    );

  switch (finalDiscountType) {
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
    Number(admissionFee || 0);

  if (
    !Number.isFinite(amount) ||
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
//
// This helper provides the final
// effective fee-head values.
//
// Useful for:
// - Student creation
// - Fee summary
// - Receipt
// - Reports
// - Class-wise fee update
//
// Original fee values should still be
// stored in Student.
//
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
    Number(examFee || 0);

  const finalSportFee =
    Number(sportFee || 0);

  const finalComputerFee =
    Number(computerFee || 0);

  const finalFunctionFee =
    Number(functionFee || 0);

  const finalSmartClassFee =
    Number(smartClassFee || 0);

  const finalOtherCharges =
    Number(otherCharges || 0);

  // =====================================
  // RTE
  //
  // All fees are 100% discounted.
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
// This calculates:
// Admission
// + Exam
// + Sport
// + Computer
// + Function
// + Smart Class
// + Other Charges
//
// NOTE:
// Monthly fee is NOT included here
// because monthly fee is calculated
// separately based on months.
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
};