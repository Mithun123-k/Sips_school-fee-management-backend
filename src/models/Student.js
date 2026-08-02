const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    // =====================================================
    // Student Basic Information
    // =====================================================

    studentId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    admissionNo: {
      type: String,
      default: "",
      unique: true,
      sparse: true,
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

    // =====================================================
    // Admission Information
    // =====================================================

    admissionDate: {
      type: Date,
      default: Date.now,
    },

    // =====================================================
    // Student Fee Heads
    // =====================================================
    //
    // These values are the actual fees assigned
    // to this particular student.
    //
    // Initially they can come from FeeStructure.
    // Later ADMIN can override them individually.
    //

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

    // =====================================================
    // Previous Pending Fee
    // =====================================================

    openingDue: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // Total Fee
    // =====================================================
    //
    // Sum of all applicable fee heads + opening due.
    //

    totalFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // Total Amount Paid
    // =====================================================

    paidFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // Current Outstanding Fee
    // =====================================================
    //
    // dueFee = totalFee - paidFee
    //

    dueFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // Fee Calculation Start Date
    // =====================================================

    feeStartDate: {
      type: Date,
    },

    // =====================================================
    // Student Status
    // =====================================================

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    // =====================================================
    // Soft Delete
    // =====================================================

    isDeleted: {
      type: Boolean,
      default: false,
    },

    // =====================================================
    // User Tracking
    // =====================================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// Duplicate Student Protection
// =====================================================

studentSchema.index(
  {
    name: 1,
    fatherName: 1,
    motherName: 1,
    className: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Student",
  studentSchema
);