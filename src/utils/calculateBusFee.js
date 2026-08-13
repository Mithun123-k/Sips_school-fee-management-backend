const {
  getCalendarMonthKey,
  normalizeWaivedMonthKeys,
} = require("./monthlyFeeWaiver");

const normalizeBusPeriod = (
  period
) => {
  const busFee =
    Number(period?.busFee || 0);

  const effectiveFrom =
    new Date(
      period?.effectiveFrom
    );

  const effectiveTo =
    period?.effectiveTo
      ? new Date(
        period.effectiveTo
      )
      : null;

  if (
    !Number.isFinite(busFee) ||
    busFee <= 0 ||
    Number.isNaN(
      effectiveFrom.getTime()
    ) ||
    (
      effectiveTo &&
      Number.isNaN(
        effectiveTo.getTime()
      )
    ) ||
    (
      effectiveTo &&
      effectiveTo < effectiveFrom
    )
  ) {
    return null;
  }

  return {
    busFee:
      Number(busFee.toFixed(2)),
    effectiveFrom,
    effectiveTo,
    firstMonthProrated:
      period?.firstMonthProrated ===
      true,
    firstMonthBusFee:
      Number.isFinite(
        Number(
          period?.firstMonthBusFee
        )
      )
        ? Number(
          Number(
            period.firstMonthBusFee
          ).toFixed(2)
        )
        : null,
    daysInStartMonth:
      Number.isFinite(
        Number(
          period?.daysInStartMonth
        )
      )
        ? Number(
          period.daysInStartMonth
        )
        : null,
    chargeableDays:
      Number.isFinite(
        Number(
          period?.chargeableDays
        )
      )
        ? Number(
          period.chargeableDays
        )
        : null,
    fullMonthlyFeeFrom:
      period?.fullMonthlyFeeFrom
        ? new Date(
          period.fullMonthlyFeeFrom
        )
        : null,
    coveredByExistingLumpSum:
      period
        ?.coveredByExistingLumpSum !==
      false,
  };
};

const getBusFeeForMonth = (
  period,
  feeMonth,
  isFirstTestPeriod = false
) => {
  const startMonth =
    getCalendarMonthKey(
      period.effectiveFrom
    );

  if (
    period.firstMonthProrated ===
      true &&
    (
      feeMonth === startMonth ||
      isFirstTestPeriod
    ) &&
    Number.isFinite(
      period.firstMonthBusFee
    ) &&
    period.firstMonthBusFee >= 0
  ) {
    return Number(
      period.firstMonthBusFee
        .toFixed(2)
    );
  }

  return Number(
    period.busFee.toFixed(2)
  );
};

// =====================================================
// Get Bus Facility Periods
// =====================================================
//
// New students use busFacilityHistory. Existing students
// without history continue through the legacy fields.
//
// =====================================================

const getBusFacilityPeriods = ({
  student,
  feeStartDate,
}) => {
  const history =
    Array.isArray(
      student?.busFacilityHistory
    )
      ? student.busFacilityHistory
      : [];

  const periods =
    history
      .map(normalizeBusPeriod)
      .filter(Boolean);

  if (periods.length > 0) {
    return periods.sort(
      (first, second) =>
        first.effectiveFrom -
        second.effectiveFrom
    );
  }

  const legacyBusFee =
    Number(student?.busFee || 0);

  const legacyStart =
    new Date(feeStartDate);

  if (
    student?.hasBusFacility !==
      true ||
    !Number.isFinite(
      legacyBusFee
    ) ||
    legacyBusFee <= 0 ||
    Number.isNaN(
      legacyStart.getTime()
    )
  ) {
    return [];
  }

  return [
    {
      busFee:
        Number(
          legacyBusFee.toFixed(2)
        ),
      effectiveFrom:
        legacyStart,
      effectiveTo: null,
    },
  ];
};

const getBusPeriodForDate = (
  periods,
  dateValue,
  testMode = false
) => {
  const date =
    new Date(dateValue);

  if (
    Number.isNaN(date.getTime())
  ) {
    return null;
  }

  const matchingPeriods =
    periods.filter((period) => {
      if (testMode) {
        return (
          date >=
            period.effectiveFrom &&
          (
            !period.effectiveTo ||
            date <=
              period.effectiveTo
          )
        );
      }

      const dateMonth =
        date.getFullYear() * 12 +
        date.getMonth();

      const startMonth =
        period.effectiveFrom
          .getFullYear() * 12 +
        period.effectiveFrom
          .getMonth();

      const endMonth =
        period.effectiveTo
          ? period.effectiveTo
            .getFullYear() * 12 +
            period.effectiveTo
              .getMonth()
          : Number.POSITIVE_INFINITY;

      return (
        dateMonth >= startMonth &&
        dateMonth <= endMonth
      );
    });

  return matchingPeriods.length > 0
    ? matchingPeriods[
      matchingPeriods.length - 1
    ]
    : null;
};

// =====================================================
// Calculate Accrued Bus Fee
// =====================================================
//
// Bus fee is optional, starts with the student's normal
// fee start date and uses the same globally waived months.
// Student discounts and class promotions do not change it.
//
// =====================================================

const calculateAccruedBusFee = ({
  student,
  feeStartDate,
  currentDate = new Date(),
  waivedMonths = [],
}) => {
  if (
    !student ||
    typeof student !== "object"
  ) {
    throw new Error(
      "Valid student is required"
    );
  }

  if (
    feeStartDate === undefined ||
    feeStartDate === null ||
    feeStartDate === ""
  ) {
    return {
      accruedMonths: 0,
      total: 0,
      details: [],
    };
  }

  const start =
    new Date(feeStartDate);

  if (
    Number.isNaN(start.getTime())
  ) {
    return {
      accruedMonths: 0,
      total: 0,
      details: [],
    };
  }

  const current =
    new Date(currentDate);

  if (
    Number.isNaN(current.getTime())
  ) {
    throw new Error(
      "Invalid current date"
    );
  }

  const details = [];

  const busPeriods =
    getBusFacilityPeriods({
      student,
      feeStartDate: start,
    });

  if (busPeriods.length === 0) {
    return {
      accruedMonths: 0,
      total: 0,
      details: [],
    };
  }

  const waivedMonthKeys =
    normalizeWaivedMonthKeys(
      waivedMonths
    );

  // ===================================================
  // TEST MODE: 1 minute = 1 month
  // ===================================================

  if (
    process.env.TEST_FEE_MODE ===
    "true"
  ) {
    const difference =
      current.getTime() -
      start.getTime();

    if (difference < 0) {
      return {
        accruedMonths: 0,
        total: 0,
        details: [],
      };
    }

    const periods =
      Math.floor(
        difference /
        (60 * 1000)
      ) + 1;

    for (
      let index = 0;
      index < periods;
      index += 1
    ) {
      const periodDate =
        new Date(
          start.getTime() +
          index * 60 * 1000
        );

      const virtualMonthDate =
        new Date(
          start.getFullYear(),
          start.getMonth() + index,
          1
        );

      const feeMonth =
        getCalendarMonthKey(
          virtualMonthDate
        );

      if (
        waivedMonthKeys.has(
          feeMonth
        )
      ) {
        continue;
      }

      const busPeriod =
        getBusPeriodForDate(
          busPeriods,
          periodDate,
          true
        );

      if (!busPeriod) {
        continue;
      }

      const previousPeriodDate =
        index > 0
          ? new Date(
            start.getTime() +
            (index - 1) *
              60 * 1000
          )
          : null;

      const previousBusPeriod =
        previousPeriodDate
          ? getBusPeriodForDate(
            busPeriods,
            previousPeriodDate,
            true
          )
          : null;

      const isFirstTestPeriod =
        previousBusPeriod !==
        busPeriod;

      const busFee =
        getBusFeeForMonth(
          busPeriod,
          feeMonth,
          isFirstTestPeriod
        );

      details.push({
        month:
          periodDate.toISOString(),
        feeMonth,
        busFee:
          Number(busFee.toFixed(2)),
        effectiveBusFee:
          Number(busFee.toFixed(2)),
        firstMonthProrated:
          busPeriod
            .firstMonthProrated ===
            true &&
          (
            feeMonth ===
              getCalendarMonthKey(
                busPeriod
                  .effectiveFrom
              ) ||
            isFirstTestPeriod
          ),
      });
    }
  } else {
    // =================================================
    // PRODUCTION MODE
    // =================================================

    const startMonth =
      new Date(
        start.getFullYear(),
        start.getMonth(),
        1
      );

    const currentMonth =
      new Date(
        current.getFullYear(),
        current.getMonth(),
        1
      );

    if (currentMonth < startMonth) {
      return {
        accruedMonths: 0,
        total: 0,
        details: [],
      };
    }

    const periods =
      (
        currentMonth.getFullYear() -
        startMonth.getFullYear()
      ) * 12 +
      (
        currentMonth.getMonth() -
        startMonth.getMonth()
      ) + 1;

    for (
      let index = 0;
      index < periods;
      index += 1
    ) {
      const periodDate =
        new Date(
          startMonth.getFullYear(),
          startMonth.getMonth() + index,
          1
        );

      const month =
        getCalendarMonthKey(
          periodDate
        );

      if (
        waivedMonthKeys.has(month)
      ) {
        continue;
      }

      const busPeriod =
        getBusPeriodForDate(
          busPeriods,
          periodDate,
          false
        );

      if (!busPeriod) {
        continue;
      }

      const busFee =
        getBusFeeForMonth(
          busPeriod,
          month
        );

      details.push({
        month,
        busFee:
          Number(busFee.toFixed(2)),
        effectiveBusFee:
          Number(busFee.toFixed(2)),
        firstMonthProrated:
          busPeriod
            .firstMonthProrated ===
            true &&
          month ===
            getCalendarMonthKey(
              busPeriod
                .effectiveFrom
            ),
      });
    }
  }

  const total =
    details.reduce(
      (sum, detail) =>
        sum +
        Number(
          detail.effectiveBusFee || 0
        ),
      0
    );

  return {
    accruedMonths: details.length,
    total:
      Number(total.toFixed(2)),
    details,
  };
};

module.exports = {
  getBusFacilityPeriods,
  calculateAccruedBusFee,
};
