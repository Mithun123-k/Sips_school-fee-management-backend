const PendingOnlinePayment = require("../models/PendingOnlinePayment");

// ============================
// Create Pending Payment
// ============================

const createPendingPayment = async (data) => {
  return await PendingOnlinePayment.create(data);
};

// ============================
// Find By QR ID
// ============================

const findByQrId = async (qrId) => {
  return await PendingOnlinePayment.findOne({
    qrId,
  });
};

// ============================
// Update Payment
// ============================

const updatePayment = async (qrId, data) => {
  return await PendingOnlinePayment.findOneAndUpdate(
    {
      qrId,
    },
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};

module.exports = {
  createPendingPayment,
  findByQrId,
  updatePayment,
};