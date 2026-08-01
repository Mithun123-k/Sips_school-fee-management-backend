const mongoose = require("mongoose");

const pendingOnlinePaymentSchema = new mongoose.Schema(
  {
    qrId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    studentId: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentId: {
      type: String,
      default: "",
      index: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    qrImageUrl: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PendingOnlinePayment",
  pendingOnlinePaymentSchema
);