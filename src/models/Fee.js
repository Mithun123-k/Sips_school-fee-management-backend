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
// Allowed Payment Types
// =====================================================
//
// REGULAR
//   -> Normal fee payment
//
// LUMP_SUM
//   -> Full eligible fee payment
//   -> Additional 10% discount on MONTHLY fee
//      only when applicable
//
// =====================================================

const ALLOWED_PAYMENT_TYPES = [
  "REGULAR",
  "LUMP_SUM",
];

// =====================================================
// Allowed Student Discount Types
// =====================================================
//
// NONE
//   -> No normal discount
//
// SIBLING
//   -> Monthly Fee 20% discount
//
// RTE
//   -> All fees 100% discount
//
// GIRL
//   -> Admission Fee 50% discount
//
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
      // required: true,
      trim: true,
      index: true,
    },

    // =================================================
    // Amount Actually Paid
    // =================================================
    //
    // IMPORTANT:
    // This is the FINAL amount actually paid by
    // the student after applicable discounts.
    //
    // Example:
    //
    // Monthly Fee = ₹1500
    // Lump Sum 10% = ₹150 discount
    // Paid = ₹1350
    //
    // amount = 1350
    //
    // =================================================

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    // =================================================
    // Fee Breakdown
    // =================================================
    //
    // This is the breakdown of the amount paid by
    // the student for each fee head.
    //
    // Example:
    //
    // Monthly Fee = ₹1500
    // Exam Fee = ₹500
    // Total Paid = ₹2000
    //
    // feeBreakdown: {
    //   MONTHLY: 1500,
    //   EXAM: 500,
    // }
    //
    // =================================================

    feeBreakdown: {
      MONTHLY: { type: Number, default: 0 },
      ADMISSION: { type: Number, default: 0 },
      EXAM: { type: Number, default: 0 },
      SPORT: { type: Number, default: 0 },
      COMPUTER: { type: Number, default: 0 },
      FUNCTION: { type: Number, default: 0 },
      SMART_CLASS: { type: Number, default: 0 },
      OTHER: { type: Number, default: 0 },
    },

    // =================================================
    // Payment Type
    // =================================================
    //
    // REGULAR
    // LUMP_SUM
    //
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
    //
    // Stored with payment for receipt/report history.
    //
    // NONE
    // SIBLING
    // RTE
    // GIRL
    //
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
    //
    // Only applicable when paymentType = LUMP_SUM.
    //
    // Current rule:
    // 10% additional discount on MONTHLY fee.
    //
    // For REGULAR payment:
    // 0
    //
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
    //
    // Actual rupee amount discounted from the payment.
    //
    // Example:
    //
    // Monthly Fee = ₹1500
    // Lump Sum Discount = 10%
    // Discount Amount = ₹150
    //
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
    //
    // CASH:
    // ADMIN / RECEPTIONIST
    //
    // ONLINE:
    // Public payment can have null
    //
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
  // feeHead: 1,
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