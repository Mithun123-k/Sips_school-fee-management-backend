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
];

// =====================================================
// Allowed Payment Types
// =====================================================
//
// REGULAR
//   -> Normal fee payment
//
// LUMP_SUM
//   -> Academic year remaining fee payment
//   -> Additional monthly discount applicable
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
      // Payment Amount
      // ================================================
      //
      // This is the FINAL amount expected to be paid.
      //
      // Example:
      //
      // Monthly Fee = ₹1500
      // Lump Sum Discount = ₹150
      // Payment Amount = ₹1350
      //
      // ================================================

      amount: {
        type: Number,
        required: true,
        min: 0.01,
      },

      isLumpSum: {
        type: Boolean,
        default: false,
      },

      // ================================================
      // Payment Type
      // ================================================
      //
      // REGULAR
      // LUMP_SUM
      //
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
      //
      // Snapshot of student's discount at the time
      // QR payment was created.
      //
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
      //
      // REGULAR:
      // 0
      //
      // LUMP_SUM:
      // Usually 10 for NONE / GIRL
      // 0 for SIBLING / RTE
      //
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
      //
      // Actual rupee amount discounted.
      //
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
      //
      // Public payment:
      // null
      //
      // Admin / Receptionist:
      // User ObjectId
      //
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

module.exports =
  mongoose.model(
    "PendingOnlinePayment",
    pendingOnlinePaymentSchema
  );