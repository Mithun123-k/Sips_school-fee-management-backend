const FeeStructure = require("../models/FeeStructure");

// =====================================================
// Create Fee Structure
// =====================================================

const createFeeStructure = async (data) => {
  return await FeeStructure.create(data);
};

// =====================================================
// Get All Active Fee Structures
// =====================================================

const getAllFeeStructures = async () => {
  return await FeeStructure.find({
    isActive: true,
  }).sort({
    className: 1,
  });
};

// =====================================================
// Get Fee Structure By ID
// =====================================================

const getFeeStructureById = async (id) => {
  return await FeeStructure.findOne({
    _id: id,
    isActive: true,
  });
};

// =====================================================
// Get Fee Structure By Class
// =====================================================

const getFeeStructureByClass = async (
  className
) => {
  return await FeeStructure.findOne({
    className: className.trim(),
    isActive: true,
  });
};

// =====================================================
// Check Fee Structure By Class
// =====================================================

const existsByClassName = async (
  className
) => {
  return await FeeStructure.exists({
    className: className.trim(),
    isActive: true,
  });
};

// =====================================================
// Update Fee Structure
// =====================================================

const updateFeeStructure = async (
  id,
  data
) => {
  return await FeeStructure.findOneAndUpdate(
    {
      _id: id,
      isActive: true,
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
// Update Fee Structure By Class
// =====================================================
//
// Useful when admin directly updates:
// Class 1
// Class 2
// Class 3
//
// =====================================================

const updateFeeStructureByClass = async (
  className,
  data
) => {
  return await FeeStructure.findOneAndUpdate(
    {
      className: className.trim(),
      isActive: true,
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
// Deactivate Fee Structure
// =====================================================

const deleteFeeStructure = async (
  id,
  userId
) => {
  return await FeeStructure.findOneAndUpdate(
    {
      _id: id,
      isActive: true,
    },
    {
      $set: {
        isActive: false,
        updatedBy: userId,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

// =====================================================
// Activate Fee Structure
// =====================================================

const activateFeeStructure = async (
  id,
  userId
) => {
  return await FeeStructure.findOneAndUpdate(
    {
      _id: id,
      isActive: false,
    },
    {
      $set: {
        isActive: true,
        updatedBy: userId,
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
  createFeeStructure,

  getAllFeeStructures,

  getFeeStructureById,

  getFeeStructureByClass,

  existsByClassName,

  updateFeeStructure,

  updateFeeStructureByClass,

  deleteFeeStructure,

  activateFeeStructure,
};