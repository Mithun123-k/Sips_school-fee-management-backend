const PendingOnlinePayment =
  require("../models/PendingOnlinePayment");

// =====================================================
// Create Pending Payment
// =====================================================
//
// Creates a new pending Razorpay QR payment.
//
// Important:
// The service is responsible for calculating and passing:
//
// - amount
// - paymentType
// - feeDiscountType
// - lumpSumDiscountPercent
// - lumpSumDiscountAmount
//
// =====================================================

const createPendingPayment = async (
  data
) => {
  if (!data) {
    throw new Error(
      "Pending payment data is required"
    );
  }

  return await PendingOnlinePayment.create(
    data
  );
};

// =====================================================
// Find By QR ID
// =====================================================
//
// Used for checking the complete payment record.
//
// =====================================================

const findByQrId = async (
  qrId
) => {
  if (!qrId) {
    return null;
  }

  return await PendingOnlinePayment
    .findOne({
      qrId,
    })
    .populate(
      "student",
      "studentId name fatherName className section feeDiscountType"
    );
};

// =====================================================
// Find Pending Payment By QR ID
// =====================================================
//
// Only returns payment which is still PENDING.
//
// Useful when payment has not yet been completed.
//
// =====================================================

const findPendingByQrId = async (
  qrId
) => {
  if (!qrId) {
    return null;
  }

  return await PendingOnlinePayment
    .findOne({
      qrId,
      status: "PENDING",
    })
    .populate(
      "student",
      "studentId name fatherName className section feeDiscountType"
    );
};

// =====================================================
// Find By Payment ID
// =====================================================
//
// Used for duplicate payment protection.
//
// =====================================================

const findByPaymentId = async (
  paymentId
) => {
  if (!paymentId) {
    return null;
  }

  return await PendingOnlinePayment
    .findOne({
      paymentId,
    })
    .populate(
      "student",
      "studentId name fatherName className section feeDiscountType"
    );
};

// =====================================================
// Update Payment
// =====================================================
//
// Generic payment update.
//
// runValidators:
// Ensures schema validation is applied.
//
// =====================================================

const updatePayment = async (
  qrId,
  data
) => {
  if (!qrId) {
    throw new Error(
      "QR ID is required"
    );
  }

  if (!data) {
    throw new Error(
      "Payment update data is required"
    );
  }

  return await PendingOnlinePayment
    .findOneAndUpdate(
      {
        qrId,
      },
      {
        $set: data,
      },
      {
        new: true,
        runValidators: true,
      }
    )
    .populate(
      "student",
      "studentId name fatherName className section feeDiscountType"
    );
};

// =====================================================
// Mark Payment Success
// =====================================================
//
// IMPORTANT:
//
// Only a PENDING payment can be marked SUCCESS.
//
// This prevents an already completed payment from
// being overwritten.
//
// =====================================================

const markPaymentSuccess = async (
  qrId,
  paymentId
) => {
  if (!qrId) {
    throw new Error(
      "QR ID is required"
    );
  }

  if (!paymentId) {
    throw new Error(
      "Payment ID is required"
    );
  }

  return await PendingOnlinePayment
    .findOneAndUpdate(
      {
        qrId,
        status: "PENDING",
      },
      {
        $set: {
          paymentId,
          status: "SUCCESS",
          completedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
    .populate(
      "student",
      "studentId name fatherName className section feeDiscountType"
    );
};

// =====================================================
// Mark Payment Failed
// =====================================================
//
// Only PENDING payment can be marked FAILED.
//
// =====================================================

const markPaymentFailed = async (
  qrId
) => {
  if (!qrId) {
    throw new Error(
      "QR ID is required"
    );
  }

  return await PendingOnlinePayment
    .findOneAndUpdate(
      {
        qrId,
        status: "PENDING",
      },
      {
        $set: {
          status: "FAILED",
          completedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
    .populate(
      "student",
      "studentId name fatherName className section feeDiscountType"
    );
};

// =====================================================
// Export
// =====================================================

module.exports = {
  createPendingPayment,

  findByQrId,

  findPendingByQrId,

  findByPaymentId,

  updatePayment,

  markPaymentSuccess,

  markPaymentFailed,
};