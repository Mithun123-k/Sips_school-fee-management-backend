const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    receiptNo: {
      type: String,
      required: true,
      unique: true,
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

    paymentMode: {
      type: String,
      enum: ["CASH", "ONLINE"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["SUCCESS", "FAILED", "PENDING"],
      default: "SUCCESS",
    },

    transactionId: {
      type: String,
      default: "",
    },

    remarks: {
      type: String,
      default: "",
    },

    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Fee", feeSchema);