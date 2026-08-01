// =====================================
// Calculate Fee Start Date
// =====================================

const calculateFeeStartDate = (admissionDate) => {
  const date = new Date(admissionDate);

  // =====================================
  // TEST MODE
  // Fee starts NOW
  // 1 minute = 1 month
  // =====================================

  if (process.env.TEST_FEE_MODE === "true") {
    return new Date();
  }

  // =====================================
  // PRODUCTION MODE
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
// Calculate Monthly Fee
// =====================================

const calculateMonthlyFee = (
  feeStartDate,
  monthlyFee,
  currentDate = new Date()
) => {
  if (!feeStartDate || !monthlyFee) {
    return 0;
  }

  const startDate = new Date(feeStartDate);
  const today = new Date(currentDate);

  // =====================================
  // TEST MODE
  // 1 MINUTE = 1 MONTH
  // =====================================

  if (process.env.TEST_FEE_MODE === "true") {
    const diffMs = today.getTime() - startDate.getTime();

    if (diffMs < 0) {
      return 0;
    }

    const minutesPassed = Math.floor(
      diffMs / (60 * 1000)
    );

    // Create = 1st month
    // After 1 minute = 2nd month
    // After 2 minutes = 3rd month

    const months = minutesPassed + 1;

    return months * Number(monthlyFee);
  }

  // =====================================
  // PRODUCTION MODE
  // =====================================

  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // Fee has not started yet
  if (today < startDate) {
    return 0;
  }

  const months =
    (today.getFullYear() - startDate.getFullYear()) * 12 +
    (today.getMonth() - startDate.getMonth()) +
    1;

  return months * Number(monthlyFee);
};

// =====================================
// Calculate Total Due
// =====================================

const calculateDueFee = (
  feeStartDate,
  monthlyFee,
  openingDue = 0,
  paidFee = 0,
  currentDate = new Date()
) => {
  const monthlyAmount = calculateMonthlyFee(
    feeStartDate,
    monthlyFee,
    currentDate
  );

  const totalDue =
    Number(openingDue || 0) +
    monthlyAmount -
    Number(paidFee || 0);

  return Math.max(totalDue, 0);
};

// =====================================
// Export
// =====================================

module.exports = {
  calculateFeeStartDate,
  calculateMonthlyFee,
  calculateDueFee,
};