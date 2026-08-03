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
  "All",
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
      // required: true,
      trim: true,
      index: true,
    },

    // =================================================
    // Amount
    // =================================================

    amount: {
      type: Number,
      required: true,
      min: 0.01,
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
    //
    // CASH:
    // ADMIN / RECEPTIONIST
    //
    // ONLINE:
    // Public payment can have null
    //

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
  // feeHead: 1,
  paymentStatus: 1,
});

// =====================================================
// Export
// =====================================================

module.exports = mongoose.model(
  "Fee",
  feeSchema
);