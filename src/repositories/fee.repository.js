const Fee = require("../models/Fee");

// =====================================================
// Create Fee
// =====================================================
//
// Creates a fee/payment transaction.
//
// Supported payment types:
//
// REGULAR
// LUMP_SUM
//
// Supported payment modes:
//
// CASH
// ONLINE
//
// =====================================================

const createFee = async (data) => {
  return await Fee.create(data);
};

// =====================================================
// Get Fee History
// =====================================================

const getAllFeeHistory = async () => {
  return await Fee.find({})
    .populate(
      "student",
      "studentId admissionNo name fatherName className section"
    )
    .populate(
      "collectedBy",
      "name role"
    )
    .sort({
      paymentDate: -1,
      createdAt: -1,
    });
};

//
// Returns complete payment history of a student.
//
// Includes:
// - Fee Head
// - Amount
// - Payment Type
// - Discount information
// - Payment Mode
// - Payment Status
// - Transaction ID
// - Collector
//
// =====================================================

const getFeeHistory = async (studentId) => {
  return await Fee.find({
    studentId,
  })
    .populate(
      "collectedBy",
      "name role"
    )
    .sort({
      paymentDate: -1,
      createdAt: -1,
    });
};

// =====================================================
// Get Receipt
// =====================================================
//
// Returns complete receipt information.
//
// =====================================================

const getReceipt = async (id) => {
  return await Fee.findById(id)
    .populate(
      "student",
      "studentId admissionNo name fatherName className section"
    )
    .populate(
      "collectedBy",
      "name role"
    );
};

// =====================================================
// Find Fee By Transaction ID
// =====================================================
//
// Used mainly for ONLINE payment duplicate
// protection.
//
// Only SUCCESS payments are considered.
//
// =====================================================

const findByTransactionId = async (
  transactionId
) => {
  if (!transactionId) {
    return null;
  }

  return await Fee.findOne({
    transactionId,
    paymentStatus: "SUCCESS",
  });
};

// =====================================================
// Find Fee By Receipt Number
// =====================================================

const findByReceiptNo = async (
  receiptNo
) => {
  if (!receiptNo) {
    return null;
  }

  return await Fee.findOne({
    receiptNo,
  });
};

// =====================================================
// Get Student Fee Summary
// =====================================================
//
// Groups successful payments by fee head.
//
// Example:
//
// MONTHLY
// totalAmount: 12000
//
// ADMISSION
// totalAmount: 2000
//
// Also returns total Lump Sum discount.
//
// =====================================================

const getStudentFeeSummary = async (
  studentId
) => {
  return await Fee.aggregate([
    {
      $match: {
        studentId,
        paymentStatus: "SUCCESS",
      },
    },

    {
      $group: {
        _id: "$feeHead",

        // =============================================
        // Final amount actually collected
        // =============================================

        totalAmount: {
          $sum: "$amount",
        },

        // =============================================
        // Number of payments
        // =============================================

        paymentCount: {
          $sum: 1,
        },

        // =============================================
        // Total Lump Sum Discount
        // =============================================

        totalLumpSumDiscount: {
          $sum: {
            $ifNull: [
              "$lumpSumDiscountAmount",
              0,
            ],
          },
        },
      },
    },

    {
      $sort: {
        _id: 1,
      },
    },
  ]);
};

// =====================================================
// Get Student Payment Type Summary
// =====================================================
//
// Returns:
//
// REGULAR
// LUMP_SUM
//
// Legacy records where paymentType is missing
// are treated as REGULAR.
//
// =====================================================

const getStudentPaymentTypeSummary =
  async (studentId) => {
    return await Fee.aggregate([
      {
        $match: {
          studentId,
          paymentStatus: "SUCCESS",
        },
      },

      {
        $group: {
          _id: {
            $ifNull: [
              "$paymentType",
              "REGULAR",
            ],
          },

          // ===========================================
          // Final amount collected
          // ===========================================

          totalAmount: {
            $sum: "$amount",
          },

          // ===========================================
          // Number of payments
          // ===========================================

          paymentCount: {
            $sum: 1,
          },

          // ===========================================
          // Total Lump Sum Discount
          // ===========================================

          totalLumpSumDiscount: {
            $sum: {
              $ifNull: [
                "$lumpSumDiscountAmount",
                0,
              ],
            },
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);
  };

// =====================================================
// Get Lump Sum Payments
// =====================================================
//
// Returns only successful LUMP_SUM payments.
//
// If studentId is provided:
// -> returns only that student's payments.
//
// If studentId is not provided:
// -> returns all Lump Sum payments.
//
// Useful for:
// - Admin dashboard
// - Lump Sum history
// - Reports
//
// =====================================================

const getLumpSumPayments = async (
  studentId
) => {
  const query = {
    paymentType: "LUMP_SUM",
    paymentStatus: "SUCCESS",
  };

  if (studentId) {
    query.studentId = studentId;
  }

  return await Fee.find(query)
    .populate(
      "student",
      "studentId admissionNo name fatherName className section feeDiscountType"
    )
    .populate(
      "collectedBy",
      "name role"
    )
    .sort({
      paymentDate: -1,
      createdAt: -1,
    });
};

// =====================================================
// Get Student Lump Sum Payments
// =====================================================
//
// Dedicated helper for one student.
//
// =====================================================

const getStudentLumpSumPayments =
  async (studentId) => {
    if (!studentId) {
      return [];
    }

    return await Fee.find({
      studentId,
      paymentType: "LUMP_SUM",
      paymentStatus: "SUCCESS",
    })
      .populate(
        "collectedBy",
        "name role"
      )
      .sort({
        paymentDate: -1,
        createdAt: -1,
      });
  };

// =====================================================
// Find Successful Lump Sum Payment
// =====================================================
//
// Used to determine whether a student has already
// made a successful Lump Sum payment.
//
// IMPORTANT:
//
// If a student has already paid Lump Sum for the
// applicable period, the fee service can prevent
// another Lump Sum payment.
//
// =====================================================

const findSuccessfulLumpSumPayment =
  async (studentId) => {
    if (!studentId) {
      return null;
    }

    return await Fee.findOne({
      studentId,
      paymentType: "LUMP_SUM",
      paymentStatus: "SUCCESS",
    }).sort({
      paymentDate: -1,
      createdAt: -1,
    });
  };

// =====================================================
// Get Total Collected Amount
// =====================================================
//
// Includes every successful payment.
//
// IMPORTANT:
//
// amount = FINAL amount actually paid.
//
// Therefore:
//
// Original Fee = ₹15000
// Lump Sum Discount = ₹1200
// Final Paid = ₹13800
//
// totalAmount = ₹13800
//
// Discount is separately returned.
//
// =====================================================

const getTotalCollectedAmount =
  async () => {
    const result =
      await Fee.aggregate([
        {
          $match: {
            paymentStatus:
              "SUCCESS",
          },
        },

        {
          $group: {
            _id: null,

            // =========================================
            // Final collected amount
            // =========================================

            totalAmount: {
              $sum: "$amount",
            },

            // =========================================
            // Total Lump Sum Discount
            // =========================================

            totalLumpSumDiscount: {
              $sum: {
                $ifNull: [
                  "$lumpSumDiscountAmount",
                  0,
                ],
              },
            },

            // =========================================
            // Number of successful payments
            // =========================================

            paymentCount: {
              $sum: 1,
            },
          },
        },
      ]);

    return {
      totalAmount:
        result[0]?.totalAmount ||
        0,

      totalLumpSumDiscount:
        result[0]
          ?.totalLumpSumDiscount ||
        0,

      paymentCount:
        result[0]?.paymentCount ||
        0,
    };
  };

// =====================================================
// Get Total Lump Sum Discount
// =====================================================
//
// Returns total discount given through successful
// Lump Sum payments.
//
// =====================================================

const getTotalLumpSumDiscount =
  async () => {
    const result =
      await Fee.aggregate([
        {
          $match: {
            paymentType:
              "LUMP_SUM",

            paymentStatus:
              "SUCCESS",
          },
        },

        {
          $group: {
            _id: null,

            totalDiscount: {
              $sum: {
                $ifNull: [
                  "$lumpSumDiscountAmount",
                  0,
                ],
              },
            },
          },
        },
      ]);

    return (
      result[0]?.totalDiscount ||
      0
    );
  };

// =====================================================
// Get Total Lump Sum Collected Amount
// =====================================================
//
// Returns only the actual money collected through
// successful Lump Sum payments.
//
// =====================================================

const getTotalLumpSumCollectedAmount =
  async () => {
    const result =
      await Fee.aggregate([
        {
          $match: {
            paymentType:
              "LUMP_SUM",

            paymentStatus:
              "SUCCESS",
          },
        },

        {
          $group: {
            _id: null,

            totalAmount: {
              $sum: "$amount",
            },

            totalDiscount: {
              $sum: {
                $ifNull: [
                  "$lumpSumDiscountAmount",
                  0,
                ],
              },
            },

            paymentCount: {
              $sum: 1,
            },
          },
        },
      ]);

    return {
      totalAmount:
        result[0]?.totalAmount ||
        0,

      totalDiscount:
        result[0]?.totalDiscount ||
        0,

      paymentCount:
        result[0]?.paymentCount ||
        0,
    };
  };

// =====================================================
// Get Regular Payments
// =====================================================
//
// Legacy records without paymentType are also treated
// as REGULAR.
//
// =====================================================

const getRegularPayments = async (
  studentId
) => {
  const match = {
    paymentStatus: "SUCCESS",

    $or: [
      {
        paymentType: "REGULAR",
      },
      {
        paymentType: {
          $exists: false,
        },
      },
      {
        paymentType: null,
      },
    ],
  };

  if (studentId) {
    match.studentId = studentId;
  }

  return await Fee.find(match)
    .populate(
      "student",
      "studentId admissionNo name className section"
    )
    .populate(
      "collectedBy",
      "name role"
    )
    .sort({
      paymentDate: -1,
      createdAt: -1,
    });
};

// =====================================================
// Export
// =====================================================

module.exports = {
  createFee,

  getFeeHistory,

  getReceipt,

  findByTransactionId,

  findByReceiptNo,

  getStudentFeeSummary,

  getStudentPaymentTypeSummary,

  getLumpSumPayments,

  getStudentLumpSumPayments,

  findSuccessfulLumpSumPayment,

  getTotalCollectedAmount,

  getTotalLumpSumDiscount,

  getTotalLumpSumCollectedAmount,

  getRegularPayments,

  getAllFeeHistory,
};