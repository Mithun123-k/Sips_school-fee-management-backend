const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    // ============================
    // Student Basic Information
    // ============================

    studentId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    admissionNo: {
      type: String,
      default: "",
      trim: true,
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
      trim: true,
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
      trim: true,
    },

    section: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    // ============================
    // Admission Information
    // ============================

    admissionDate: {
      type: Date,
      default: Date.now,
    },

    // ============================
    // Fee Management
    // ============================

    // Monthly fee of the student
    monthlyFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Previous pending fee for old students
    openingDue: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Total fee structure / annual or overall fee
    totalFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Total amount paid by student
    paidFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Current outstanding amount
    dueFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Fee calculation starts from this date
    // Example:
    // Admission: 15 July
    // Fee Start: 01 August
    feeStartDate: {
      type: Date,
    },

    // ============================
    // Student Status
    // ============================

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // ============================
    // User Tracking
    // ============================

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