const mongoose = require("mongoose");

// =====================================================
// Allowed Fee Heads
// =====================================================

const ALLOWED_FEE_HEADS = [
  "ADMISSION",
  "MONTHLY",
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
// Fee Schema
// =====================================================

const feeSchema = new mongoose.Schema(
  {
    // =================================================
    // Receipt Number
    // =================================================

    receiptNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    // =================================================
    // Student Reference
    // =================================================

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    // =================================================
    // Student ID
    // =================================================

    studentId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // =================================================
    // Fee Head
    // =================================================

    feeHead: {
      type: String,
      enum: ALLOWED_FEE_HEADS,
      required: true,
      trim: true,
      index: true,
    },

    // =================================================
    // Amount Actually Paid
    // =================================================

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    // =================================================
    // Fee Breakdown
    // =================================================

    feeBreakdown: {
      MONTHLY: {
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

    // =================================================
    // Payment Type
    // =================================================

    paymentType: {
      type: String,
      enum: ALLOWED_PAYMENT_TYPES,
      default: "REGULAR",
      required: true,
      index: true,
    },

    // =================================================
    // Student Normal Discount Type
    // =================================================

    feeDiscountType: {
      type: String,
      enum: ALLOWED_FEE_DISCOUNT_TYPES,
      default: "NONE",
      required: true,
      index: true,
    },

    // =================================================
    // Lump Sum Discount Percentage
    // =================================================

    lumpSumDiscountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // =================================================
    // Lump Sum Discount Amount
    // =================================================

    lumpSumDiscountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =================================================
    // Payment Mode
    // =================================================

    paymentMode: {
      type: String,
      enum: [
        "CASH",
        "ONLINE",
      ],
      required: true,
      index: true,
    },

    // =================================================
    // Payment Status
    // =================================================

    paymentStatus: {
      type: String,
      enum: [
        "SUCCESS",
        "FAILED",
        "PENDING",
      ],
      default: "SUCCESS",
      index: true,
    },

    // =================================================
    // Razorpay Transaction / Payment ID
    // =================================================

    transactionId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    // =================================================
    // Remarks
    // =================================================

    remarks: {
      type: String,
      default: "",
      trim: true,
    },

    // =================================================
    // Collected By
    // =================================================

    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =================================================
    // Payment Date
    // =================================================

    paymentDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// Compound Indexes
// =====================================================

feeSchema.index({
  studentId: 1,
  paymentDate: -1,
});

feeSchema.index({
  student: 1,
  paymentStatus: 1,
});

feeSchema.index({
  student: 1,
  paymentType: 1,
  paymentStatus: 1,
});

// =====================================================
// Export
// =====================================================

module.exports = mongoose.model(
  "Fee",
  feeSchema
);