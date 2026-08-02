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
      // For public payment this can be null.
      //

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
// Indexes
// =====================================================

pendingOnlinePaymentSchema.index({
  studentId: 1,
  status: 1,
});

pendingOnlinePaymentSchema.index({
  paymentId: 1,
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