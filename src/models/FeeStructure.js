const mongoose = require("mongoose");

const feeStructureSchema = new mongoose.Schema(
  {
    // ==============================
    // Class
    // ==============================

    className: {
      type: String,
      required: true,
      trim: true,
    },

    // ==============================
    // Fee Heads
    // ==============================

    admissionFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    monthlyFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    examFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    sportFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    computerFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    functionFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    smartClassFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    otherCharges: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==============================
    // Status
    // ==============================

    isActive: {
      type: Boolean,
      default: true,
    },

    // ==============================
    // User Tracking
    // ==============================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// One fee structure per class
feeStructureSchema.index(
  { className: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "FeeStructure",
  feeStructureSchema
);