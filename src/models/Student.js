const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      unique: true,
      required: true,
    },

    admissionNo: {
      type: String,
      default: "",
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    fatherName: {
      type: String,
      required: true,
      trim: true,
    },

    motherName: {
      type: String,
      default: "",
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: true,
    },

    dob: {
      type: Date,
    },

    className: {
      type: String,
      required: true,
    },

    section: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    admissionDate: {
      type: Date,
      default: Date.now,
    },

    totalFee: {
      type: Number,
      default: 0,
    },

    paidFee: {
      type: Number,
      default: 0,
    },

    dueFee: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

module.exports = mongoose.model("Student", studentSchema);