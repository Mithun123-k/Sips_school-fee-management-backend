const MonthlyFeeWaiver =
  require("../models/MonthlyFeeWaiver");

// =====================================================
// Upsert Global Monthly Fee Waivers
// =====================================================

const upsertMonthlyFeeWaivers = async (
  waivers = []
) => {
  if (
    !Array.isArray(waivers) ||
    waivers.length === 0
  ) {
    return [];
  }

  const operations =
    waivers.map((waiver) => ({
      updateOne: {
        filter: {
          month: waiver.month,
        },

        update: {
          $set: {
            academicYear:
              waiver.academicYear,

            monthName:
              waiver.monthName,

            reason:
              waiver.reason,

            isActive: true,

            waivedBy:
              waiver.waivedBy,

            waivedAt:
              waiver.waivedAt,
          },
        },

        upsert: true,
      },
    }));

  await MonthlyFeeWaiver.bulkWrite(
    operations,
    {
      ordered: true,
    }
  );

  return await MonthlyFeeWaiver.find({
    month: {
      $in: waivers.map(
        (waiver) => waiver.month
      ),
    },
    isActive: true,
  })
    .sort({
      month: 1,
    })
    .lean();
};

// =====================================================
// Get Active Waivers Between Two Months
// =====================================================

const getActiveMonthlyFeeWaivers = async ({
  startMonth,
  endMonth,
}) => {
  return await MonthlyFeeWaiver.find({
    isActive: true,

    month: {
      $gte: startMonth,
      $lte: endMonth,
    },
  })
    .sort({
      month: 1,
    })
    .lean();
};

// =====================================================
// Export
// =====================================================

module.exports = {
  upsertMonthlyFeeWaivers,
  getActiveMonthlyFeeWaivers,
};
