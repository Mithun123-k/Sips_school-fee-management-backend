const Fee = require("../models/Fee");

const createFee = async (data) => {
  return await Fee.create(data);
};

const getFeeHistory = async (studentId) => {
  return await Fee.find({
    student: studentId,
  })
    .populate("collectedBy", "name")
    .sort({
      createdAt: -1,
    });
};

const getReceipt = async (id) => {
  return await Fee.findById(id)
    .populate("student")
    .populate("collectedBy", "name");
};

module.exports = {
  createFee,
  getFeeHistory,
  getReceipt,
};