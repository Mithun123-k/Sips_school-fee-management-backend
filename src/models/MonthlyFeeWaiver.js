const mongoose = require("mongoose");

// =====================================================
// Global Monthly Fee Waiver
// =====================================================
//
// One active record represents one calendar month for
// which MONTHLY fee is waived for every student.
//
// Example:
// academicYear: "2026-2027"
// month: "2026-05"
// monthName: "MAY"
//
// =====================================================

const monthlyFeeWaiverSchema =
  new mongoose.Schema(
    {
      academicYear: {
        type: String,
        required: true,
        trim: true,
        match:
          /^\d{4}-\d{4}$/,
        index: true,
      },

      month: {
        type: String,
        required: true,
        trim: true,
        match:
          /^\d{4}-(0[1-9]|1[0-2])$/,
        unique: true,
        index: true,
      },

      monthName: {
        type: String,
        required: true,
        enum: [
          "APRIL",
          "MAY",
          "JUNE",
          "JULY",
          "AUGUST",
          "SEPTEMBER",
          "OCTOBER",
          "NOVEMBER",
          "DECEMBER",
          "JANUARY",
          "FEBRUARY",
          "MARCH",
        ],
      },

      reason: {
        type: String,
        required: true,
        trim: true,
        maxlength: 250,
      },

      isActive: {
        type: Boolean,
        default: true,
        required: true,
        index: true,
      },

      waivedBy: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      waivedAt: {
        type: Date,
        default: Date.now,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

monthlyFeeWaiverSchema.index({
  academicYear: 1,
  isActive: 1,
  month: 1,
});

module.exports = mongoose.model(
  "MonthlyFeeWaiver",
  monthlyFeeWaiverSchema
);
