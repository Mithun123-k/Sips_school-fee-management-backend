const User = require("../models/User");

// =========================
// Authentication
// =========================

const findByMobile = async (mobile) => {
  return await User.findOne({ mobile }).select("+password");
};

const createUser = async (data) => {
  return await User.create(data);
};

const findAdmin = async () => {
  return await User.findOne({ role: "ADMIN" });
};

// =========================
// Receptionist CRUD
// =========================

const getAllReceptionists = async () => {
  return await User.find({
    role: "RECEPTIONIST",
  }).select("-password");
};

const getReceptionistById = async (id) => {
  return await User.findOne({
    _id: id,
    role: "RECEPTIONIST",
  }).select("-password");
};

const updateReceptionist = async (id, data) => {
  return await User.findOneAndUpdate(
    {
      _id: id,
      role: "RECEPTIONIST",
    },
    data,
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");
};

const deleteReceptionist = async (id) => {
  return await User.findOneAndDelete({
    _id: id,
    role: "RECEPTIONIST",
  });
};

module.exports = {
  // Auth
  findByMobile,
  createUser,
  findAdmin,

  // Receptionist
  getAllReceptionists,
  getReceptionistById,
  updateReceptionist,
  deleteReceptionist,
};