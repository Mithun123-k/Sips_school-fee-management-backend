const PendingOnlinePayment = require("../models/PendingOnlinePayment");

// =====================================================
// Create Pending Payment
// =====================================================

const createPendingPayment = async (
  data
) => {
  return await PendingOnlinePayment.create(
    data
  );
};

// =====================================================
// Find By QR ID
// =====================================================

const findByQrId = async (
  qrId
) => {
  return await PendingOnlinePayment.findOne({
    qrId,
  });
};

// =====================================================
// Find Pending Payment By QR ID
// =====================================================

const findPendingByQrId = async (
  qrId
) => {
  return await PendingOnlinePayment.findOne({
    qrId,
    status: "PENDING",
  });
};

// =====================================================
// Find By Payment ID
// =====================================================

const findByPaymentId = async (
  paymentId
) => {
  if (!paymentId) {
    return null;
  }

  return await PendingOnlinePayment.findOne({
    paymentId,
  });
};

// =====================================================
// Update Payment
// =====================================================

const updatePayment = async (
  qrId,
  data
) => {
  return await PendingOnlinePayment.findOneAndUpdate(
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
  );
};

// =====================================================
// Mark Payment Success
// =====================================================

const markPaymentSuccess = async (
  qrId,
  paymentId
) => {
  return await PendingOnlinePayment.findOneAndUpdate(
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
  );
};

// =====================================================
// Mark Payment Failed
// =====================================================

const markPaymentFailed = async (
  qrId
) => {
  return await PendingOnlinePayment.findOneAndUpdate(
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