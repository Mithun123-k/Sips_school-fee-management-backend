const Fee = require("../models/Fee");

// =====================================================
// Create Fee
// =====================================================

const createFee = async (data) => {
  return await Fee.create(data);
};

// =====================================================
// Get Fee History
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
// Get Fee By Receipt Number
// =====================================================

const findByReceiptNo = async (
  receiptNo
) => {
  return await Fee.findOne({
    receiptNo,
  });
};

// =====================================================
// Get Student Fee Summary
// =====================================================
//
// Useful for dashboard / student details.
//

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

        totalAmount: {
          $sum: "$amount",
        },

        paymentCount: {
          $sum: 1,
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
// Get Total Collected Amount
// =====================================================

const getTotalCollectedAmount = async () => {
  const result =
    await Fee.aggregate([
      {
        $match: {
          paymentStatus: "SUCCESS",
        },
      },

      {
        $group: {
          _id: null,

          totalAmount: {
            $sum: "$amount",
          },
        },
      },
    ]);

  return (
    result[0]?.totalAmount || 0
  );
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

  getTotalCollectedAmount,
};