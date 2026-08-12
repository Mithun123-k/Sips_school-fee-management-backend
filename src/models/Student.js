const mongoose = require("mongoose");

const feeSnapshotSchema =
  new mongoose.Schema(
    {
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
    },
    {
      _id: false,
    }
  );

const classPromotionSchema =
  new mongoose.Schema(
    {
      fromClass: {
        type: String,
        required: true,
        trim: true,
      },

      toClass: {
        type: String,
        required: true,
        trim: true,
      },

      fromSection: {
        type: String,
        default: "",
        trim: true,
      },

      toSection: {
        type: String,
        default: "",
        trim: true,
      },

      /*
       * जिस समय promotion student पर
       * effective हुई।
       *
       * Immediate promotion में service
       * current date भेजेगी।
       */
      effectiveFrom: {
        type: Date,
        required: true,
      },

      /*
       * Current implementation में
       * promotion तुरंत APPLIED होगी।
       *
       * PENDING और CANCELLED future
       * workflow support के लिए रखे हैं।
       */
      status: {
        type: String,
        enum: [
          "PENDING",
          "APPLIED",
          "CANCELLED",
        ],
        default: "APPLIED",
        required: true,
      },

      fromFees: {
        type: feeSnapshotSchema,
        required: true,
      },

      toFees: {
        type: feeSnapshotSchema,
        required: true,
      },

      feeStructure: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "FeeStructure",
        required: true,
      },

      remarks: {
        type: String,
        default: "",
        trim: true,
      },

      promotedBy: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      promotedAt: {
        type: Date,
        default: Date.now,
      },

      /*
       * PENDING promotion में यह null
       * रहेगा। APPLIED promotion में
       * service current date भेजेगी।
       */
      appliedAt: {
        type: Date,
        default: null,
      },

      cancelledAt: {
        type: Date,
        default: null,
      },

      cancelledBy: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      cancellationReason: {
        type: String,
        default: "",
        trim: true,
      },
    },
    {
      _id: true,
    }
  );

// =====================================================
// Month-wise Late Fee Waiver
// =====================================================

const lateFeeWaiverSchema =
  new mongoose.Schema(
    {
      month: {
        type: String,
        required: true,
        trim: true,
        match:
          /^\d{4}-(0[1-9]|1[0-2])$/,
      },

      waivedAmount: {
        type: Number,
        required: true,
        min: 0,
        max: 50,
      },

      reason: {
        type: String,
        required: true,
        trim: true,
      },

      waivedBy: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      waivedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      _id: true,
    }
  );

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
    // Fee Discount Type
    // =====================================================
    //
    // NONE
    //   -> No discount
    //
    // SIBLING
    //   -> Only Monthly Fee gets 20% discount
    //
    // RTE
    //   -> All applicable fees get 100% discount
    //
    // GIRL
    //   -> Only Admission Fee gets 50% discount
    //
    // ===================================================== 

    feeDiscountType: {
      type: String,
      enum: [
        "NONE",
        "SIBLING",
        "RTE",
        "GIRL",
      ],
      default: "NONE",
      required: true,
      trim: true,
    },

    // =====================================================
    // Student Fee Heads
    // =====================================================
    //
    // These are the ORIGINAL fees assigned
    // to this particular student.
    //
    // Discount is calculated separately.
    // Original values are preserved.
    //
    // =====================================================

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
    // Class Promotion History
    // =====================================================
    //
    // Class changes immediately for administration,
    // while the promoted fee snapshot becomes effective
    // from effectiveFrom (normally next month).
    //
    // =====================================================

    classPromotionHistory: {
      type: [classPromotionSchema],
      default: [],
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
    // Effective total fee after applicable discount
    // + opening due.
    //
    // =====================================================

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
    // Lump Sum future-month coverage is also considered
    // during fee calculation.
    //
    // =====================================================

    dueFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // Fee Calculation Start Date
    // =====================================================

    feeStartFrom: {
      type: String,
      enum: [
        "ADMISSION_DATE",
        "NEXT_MONTH",
        "CUSTOM",
      ],
      default: "NEXT_MONTH",
    },

    feeStartDate: {
      type: Date,
    },

    // =====================================================
    // Lump Sum Payment
    // =====================================================
    //
    // When a student pays future monthly fees through
    // Lump Sum payment, these fields store the coverage.
    //
    // Example:
    //
    // Monthly Fee = â‚¹1500
    //
    // Student pays August -> March through Lump Sum.
    //
    // lumpSumPaid = true
    //
    // lumpSumPaidTill = March 1 / March 31
    // depending on the calculation logic.
    //
    // Until lumpSumPaidTill:
    //
    // Monthly Fee = 0
    //
    // After lumpSumPaidTill:
    //
    // Normal monthly fee generation starts again.
    //
    // =====================================================

    lumpSumPaid: {
      type: Boolean,
      default: false,
    },

    // =====================================================
    // Lump Sum Paid Till
    // =====================================================
    //
    // Stores the last month covered by Lump Sum payment.
    //
    // Example:
    //
    // lumpSumPaidTill = 2027-03-31
    //
    // Means monthly fee remains covered through March 2027.
    //
    // =====================================================

    lumpSumPaidTill: {
      type: Date,
      default: null,
    },

    // =====================================================
    // Lump Sum Discount Type
    // =====================================================
    //
    // NONE
    //       -> No Lump Sum discount
    //
    // PERCENTAGE
    //       -> Percentage based Lump Sum discount
    //
    // =====================================================

    lumpSumDiscountType: {
      type: String,
      enum: [
        "NONE",
        "PERCENTAGE",
      ],
      default: "NONE",
    },

    // =====================================================
    // Lump Sum Discount Percentage
    // =====================================================

    lumpSumDiscountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // =====================================================
    // Lump Sum Discount Amount
    // =====================================================
    //
    // Actual amount discounted from Lump Sum payment.
    //
    // Example:
    //
    // Original Lump Sum = â‚¹12,000
    // Discount = 10%
    // Discount Amount = â‚¹1,200
    //
    // Final Paid Amount = â‚¹10,800
    //
    // =====================================================

    lumpSumDiscountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // Month-wise Late Fee Waiver Records
    // =====================================================

    lateFeeWaivers: {
      type: [lateFeeWaiverSchema],
      default: [],
    },

    // =====================================================
    // Legacy Late Fee Waiver Summary Fields
    // =====================================================
    //
    // These fields are retained for backward compatibility.
    // New waiver calculations use lateFeeWaivers.
    //
    // =====================================================

    lateFeeWaived: {
      type: Boolean,
      default: false,
    },

    lateFeeWaiverAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lateFeeWaiverReason: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // Student Status
    // =====================================================

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "INACTIVE",
      ],
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

// =====================================================
// Lump Sum Coverage Index
// =====================================================
//
// Useful for finding students whose Lump Sum
// coverage is currently active.
//
// =====================================================

studentSchema.index({
  lumpSumPaid: 1,
  lumpSumPaidTill: 1,
});

// =====================================================
// Class Promotion Effective Date Index
// =====================================================
//
// Used by promotion history lookups and the atomic
// pending-promotion check in student.repository.js.
//
// =====================================================

studentSchema.index({
  "classPromotionHistory.effectiveFrom": 1,
});

// =====================================================
// Export
// =====================================================

module.exports = mongoose.model(
  "Student",
  studentSchema
);