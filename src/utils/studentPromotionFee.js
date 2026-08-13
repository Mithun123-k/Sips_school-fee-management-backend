const FEE_FIELDS = [
  "admissionFee",
  "monthlyFee",
  "examFee",
  "sportFee",
  "computerFee",
  "functionFee",
  "smartClassFee",
  "otherCharges",
];

const {
  getCalendarMonthKey,
  normalizeWaivedMonthKeys,
} = require("./monthlyFeeWaiver");

// =====================================================
// Get Normalized Fee Snapshot
// =====================================================

const getFeeSnapshot = (
  source = {}
) => {
  const finalSource =
    source &&
    typeof source === "object"
      ? source
      : {};

  return FEE_FIELDS.reduce(
    (fees, field) => {
      const value =
        Number(
          finalSource[field] ?? 0
        );

      fees[field] =
        Number.isFinite(value) &&
        value >= 0
          ? Number(
            value.toFixed(2)
          )
          : 0;

      return fees;
    },
    {}
  );
};

// =====================================================
// Get Next Fee Period Start
// =====================================================
//
// TEST MODE:
// 1 minute = 1 month
//
// PRODUCTION MODE:
// Next calendar month's first date
//
// =====================================================

const getNextFeePeriodStart = (
  currentDate = new Date()
) => {
  if (
    currentDate === null ||
    currentDate === ""
  ) {
    throw new Error(
      "Invalid promotion date"
    );
  }

  const current =
    new Date(currentDate);

  if (
    Number.isNaN(
      current.getTime()
    )
  ) {
    throw new Error(
      "Invalid promotion date"
    );
  }

  // Testing में 1 minute = 1 month
  if (
    process.env.TEST_FEE_MODE ===
    "true"
  ) {
    return new Date(
      current.getTime() +
      60 * 1000
    );
  }

  // Production में next month की 1 तारीख
  return new Date(
    current.getFullYear(),
    current.getMonth() + 1,
    1,
    0,
    0,
    0,
    0
  );
};

// =====================================================
// Get Valid Promotion History
// =====================================================

const getPromotionHistory = (
  student
) => {
  const history =
    Array.isArray(
      student
        ?.classPromotionHistory
    )
      ? student
        .classPromotionHistory
      : [];

  return history
    .map((promotion) => {
      if (
        !promotion ||
        promotion.effectiveFrom ===
        undefined ||
        promotion.effectiveFrom ===
        null ||
        promotion.effectiveFrom === ""
      ) {
        return null;
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
        return null;
      }

      return {
        promotion,
        effectiveFrom,
      };
    })
    .filter(Boolean)
    .sort(
      (first, second) =>
        first.effectiveFrom -
        second.effectiveFrom
    );
};

// =====================================================
// Get Fee Snapshot For Date
// =====================================================
//
// Promotion से पहले पुरानी class fee लगेगी.
// Promotion effective होने के बाद saved new class fee
// snapshot लगेगा.
//
// Student की current fee fields बदलने पर भी पुरानी
// promotion history retroactively change नहीं होगी.
//
// =====================================================

const getFeeSnapshotForDate = (
  student,
  targetDate = new Date()
) => {
  if (
    !student ||
    typeof student !== "object"
  ) {
    throw new Error(
      "Valid student is required"
    );
  }

  if (
    targetDate === null ||
    targetDate === ""
  ) {
    throw new Error(
      "Invalid fee calculation date"
    );
  }

  const target =
    new Date(targetDate);

  if (
    Number.isNaN(
      target.getTime()
    )
  ) {
    throw new Error(
      "Invalid fee calculation date"
    );
  }

  const history =
    getPromotionHistory(
      student
    );

  // No promotion history
  if (
    history.length === 0
  ) {
    return {
      className:
        student.className,

      section:
        student.section || "",

      fees:
        getFeeSnapshot(
          student
        ),
    };
  }

  // सबसे पहली promotion से पहले
  // पुरानी class की fee
  let result = {
    className:
      history[0]
        .promotion
        .fromClass ||
      student.className,

    section:
      history[0]
        .promotion
        .fromSection || "",

    fees:
      getFeeSnapshot(
        history[0]
          .promotion
          .fromFees ||
        student
      ),
  };

  // हर effective promotion को date के अनुसार apply करें
  for (
    const item of history
  ) {
    if (
      target <
      item.effectiveFrom
    ) {
      break;
    }

    result = {
      className:
        item.promotion
          .toClass ||
        result.className,

      section:
        item.promotion
          .toSection || "",

      fees:
        getFeeSnapshot(
          item.promotion
            .toFees ||
          result.fees
        ),
    };
  }

  return result;
};

// =====================================================
// Get Discounted Monthly Fee
// =====================================================

const getDiscountedMonthlyFee = (
  monthlyFee,
  feeDiscountType = "NONE"
) => {
  const amount =
    Number(
      monthlyFee ?? 0
    );

  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new Error(
      "Invalid monthly fee"
    );
  }

  const finalDiscountType =
    String(
      feeDiscountType ||
      "NONE"
    )
      .trim()
      .toUpperCase();

  // RTE = 100% monthly fee discount
  if (
    finalDiscountType ===
    "RTE"
  ) {
    return 0;
  }

  // SIBLING = 20% monthly fee discount
  if (
    finalDiscountType ===
    "SIBLING"
  ) {
    return Number(
      (
        amount * 0.8
      ).toFixed(2)
    );
  }

  // GIRL discount monthly fee पर apply नहीं होता.
  // NONE और GIRL दोनों में full monthly fee लगेगी.
  return Number(
    amount.toFixed(2)
  );
};

// =====================================================
// Calculate Accrued Monthly Fee
// =====================================================
//
// हर accrued fee period के लिए उस date की class और
// monthly fee snapshot calculate की जाती है.
//
// इससे promotion से पहले old class fee और promotion
// effective होने के बाद new class fee लगती है.
//
// =====================================================

const calculateAccruedMonthlyFee =
  ({
    student,
    feeStartDate,
    currentDate =
    new Date(),
    waivedMonths = [],
  }) => {
    if (
      !student ||
      typeof student !==
      "object"
    ) {
      throw new Error(
        "Valid student is required"
      );
    }

    if (
      feeStartDate ===
      undefined ||
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
      new Date(
        feeStartDate
      );

    if (
      Number.isNaN(
        start.getTime()
      )
    ) {
      return {
        accruedMonths: 0,
        total: 0,
        details: [],
      };
    }

    if (
      currentDate === null ||
      currentDate === ""
    ) {
      throw new Error(
        "Invalid current date"
      );
    }

    const current =
      new Date(
        currentDate
      );

    if (
      Number.isNaN(
        current.getTime()
      )
    ) {
      throw new Error(
        "Invalid current date"
      );
    }

    const details = [];

    const waivedMonthKeys =
      normalizeWaivedMonthKeys(
        waivedMonths
      );

    // ===================================================
    // TEST MODE
    // 1 minute = 1 month
    // ===================================================

    if (
      process.env
        .TEST_FEE_MODE ===
      "true"
    ) {
      const difference =
        current.getTime() -
        start.getTime();

      // Fee start future में है तो कोई fee accrue नहीं होगी.
      if (
        difference < 0
      ) {
        return {
          accruedMonths: 0,
          total: 0,
          details: [],
        };
      }

      const accruedMonths =
        Math.floor(
          difference /
          (60 * 1000)
        ) + 1;

      for (
        let index = 0;
        index <
        accruedMonths;
        index += 1
      ) {
        const periodDate =
          new Date(
            start.getTime() +
            index *
            60 *
            1000
          );

        /*
         * Test mode में one minute one month है,
         * इसलिए waiver check virtual calendar month
         * के आधार पर होगा।
         */
        const virtualMonthDate =
          new Date(
            start.getFullYear(),
            start.getMonth() +
              index,
            1
          );

        const feeMonthKey =
          getCalendarMonthKey(
            virtualMonthDate
          );

        if (
          waivedMonthKeys.has(
            feeMonthKey
          )
        ) {
          continue;
        }

        const snapshot =
          getFeeSnapshotForDate(
            student,
            periodDate
          );

        const effectiveMonthlyFee =
          getDiscountedMonthlyFee(
            snapshot.fees
              .monthlyFee,

            student
              .feeDiscountType
          );

        details.push({
          month:
            periodDate
              .toISOString(),

          feeMonth:
            feeMonthKey,

          className:
            snapshot.className,

          section:
            snapshot.section,

          monthlyFee:
            snapshot.fees
              .monthlyFee,

          effectiveMonthlyFee,
        });
      }
    }

    // ===================================================
    // PRODUCTION MODE
    // ===================================================

    else {
      const startMonth =
        new Date(
          start.getFullYear(),
          start.getMonth(),
          1,
          0,
          0,
          0,
          0
        );

      const currentMonth =
        new Date(
          current.getFullYear(),
          current.getMonth(),
          1,
          0,
          0,
          0,
          0
        );

      if (
        currentMonth <
        startMonth
      ) {
        return {
          accruedMonths: 0,
          total: 0,
          details: [],
        };
      }

      const accruedMonths =
        (
          currentMonth
            .getFullYear() -
          startMonth
            .getFullYear()
        ) *
        12 +
        (
          currentMonth
            .getMonth() -
          startMonth
            .getMonth()
        ) +
        1;

      for (
        let index = 0;
        index <
        accruedMonths;
        index += 1
      ) {
        const periodDate =
          new Date(
            startMonth
              .getFullYear(),

            startMonth
              .getMonth() +
            index,

            1,
            0,
            0,
            0,
            0
          );

        const feeMonthKey =
          getCalendarMonthKey(
            periodDate
          );

        /*
         * Global waiver वाले month की monthly fee
         * schedule में add नहीं होगी।
         */
        if (
          waivedMonthKeys.has(
            feeMonthKey
          )
        ) {
          continue;
        }

        const snapshot =
          getFeeSnapshotForDate(
            student,
            periodDate
          );

        const effectiveMonthlyFee =
          getDiscountedMonthlyFee(
            snapshot.fees
              .monthlyFee,

            student
              .feeDiscountType
          );

        details.push({
          month:
            feeMonthKey,

          className:
            snapshot.className,

          section:
            snapshot.section,

          monthlyFee:
            snapshot.fees
              .monthlyFee,

          effectiveMonthlyFee,
        });
      }
    }

    const total =
      details.reduce(
        (sum, detail) =>
          sum +
          Number(
            detail
              .effectiveMonthlyFee ||
            0
          ),
        0
      );

    return {
      accruedMonths:
        details.length,

      total:
        Number(
          total.toFixed(2)
        ),

      details,
    };
  };

// =====================================================
// Export
// =====================================================

module.exports = {
  FEE_FIELDS,
  getFeeSnapshot,
  getNextFeePeriodStart,
  getFeeSnapshotForDate,
  getDiscountedMonthlyFee,
  calculateAccruedMonthlyFee,
};
