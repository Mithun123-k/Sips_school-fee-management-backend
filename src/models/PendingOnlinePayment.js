const mongoose = require("mongoose");

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

const ALLOWED_FEE_DISCOUNT_TYPES = [
  "NONE",
  "SIBLING",
  "RTE",
  "GIRL",
];

// =====================================================
// MONTHLY / BUS Month Allocation Schema
// =====================================================

const feeMonthAllocationSchema =
  new mongoose.Schema(
    {
      feeHead: {
        type: String,
        enum: [
          "MONTHLY",
          "BUS",
        ],
        required: true,
      },

      month: {
        type: String,
        required: true,
        trim: true,
        match:
          /^\d{4}-(0[1-9]|1[0-2])$/,
      },

      amount: {
        type: Number,
        required: true,
        min: 0.01,
      },
    },
    {
      _id: false,
    }
  );

// =====================================================
// =====================================================
// Pending Online Payment Schema
// =====================================================

const pendingOnlinePaymentSchema =
  new mongoose.Schema(
    {
      // ================================================
      // Razorpay QR ID
      // ================================================

      qrId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
      },

      // ================================================
      // Student Reference
      // ================================================

      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
        index: true,
      },

      // ================================================
      // Student ID
      // ================================================

      studentId: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },

      // ================================================
      // Fee Head
      // ================================================

      feeHead: {
        type: String,
        enum: ALLOWED_FEE_HEADS,
        required: true,
        trim: true,
        index: true,
      },

      // ================================================
      // Fee Breakdown
      // ================================================

      feeBreakdown: {
        MONTHLY: {
          type: Number,
          default: 0,
          min: 0,
        },

        BUS: {
          type: Number,
          default: 0,
          min: 0,
        },

        ADMISSION: {
          type: Number,
          default: 0,
          min: 0,
        },

        EXAM: {
          type: Number,
          default: 0,
          min: 0,
        },

        SPORT: {
          type: Number,
          default: 0,
          min: 0,
        },

        COMPUTER: {
          type: Number,
          default: 0,
          min: 0,
        },

        FUNCTION: {
          type: Number,
          default: 0,
          min: 0,
        },

        SMART_CLASS: {
          type: Number,
          default: 0,
          min: 0,
        },

        OTHER: {
          type: Number,
          default: 0,
          min: 0,
        },

        LATE_FEE: {
          type: Number,
          default: 0,
          min: 0,
        },

        OPENING_DUE: {
          type: Number,
          default: 0,
          min: 0,
        },
      },

      // ================================================
      // MONTHLY / BUS Month-wise Allocations
      // ================================================

      feeMonths: {
        type: [
          feeMonthAllocationSchema,
        ],
        default: [],
      },

      // ================================================
      // Payment Amount
      // ================================================

      amount: {
        type: Number,
        required: true,
        min: 0.01,
      },

      // ================================================
      // Legacy Lump Sum Flag
      // ================================================

      isLumpSum: {
        type: Boolean,
        default: false,
      },

      // ================================================
      // Payment Type
      // ================================================

      paymentType: {
        type: String,
        enum: ALLOWED_PAYMENT_TYPES,
        default: "REGULAR",
        required: true,
        index: true,
      },

      // ================================================
      // Student Discount Type
      // ================================================

      feeDiscountType: {
        type: String,
        enum: ALLOWED_FEE_DISCOUNT_TYPES,
        default: "NONE",
        required: true,
        index: true,
      },

      // ================================================
      // Lump Sum Discount Percentage
      // ================================================

      lumpSumDiscountPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      // ================================================
      // Lump Sum Discount Amount
      // ================================================

      lumpSumDiscountAmount: {
        type: Number,
        default: 0,
        min: 0,
      },

      // ================================================
      // Razorpay Payment ID
      // ================================================

      paymentId: {
        type: String,
        default: "",
        index: true,
        trim: true,
      },

      // ================================================
      // Payment Status
      // ================================================

      status: {
        type: String,
        enum: [
          "PENDING",
          "SUCCESS",
          "FAILED",
        ],
        default: "PENDING",
        index: true,
      },

      // ================================================
      // QR Image
      // ================================================

      qrImageUrl: {
        type: String,
        default: "",
        trim: true,
      },

      // ================================================
      // Created By
      // ================================================

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      // ================================================
      // Payment Completed At
      // ================================================

      completedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

// =====================================================
// Compound Indexes
// =====================================================

pendingOnlinePaymentSchema.index({
  studentId: 1,
  status: 1,
});

pendingOnlinePaymentSchema.index({
  paymentId: 1,
  status: 1,
});

pendingOnlinePaymentSchema.index({
  student: 1,
  paymentType: 1,
  status: 1,
});

// =====================================================
// Export
// =====================================================

module.exports = mongoose.model(
  "PendingOnlinePayment",
  pendingOnlinePaymentSchema
);
