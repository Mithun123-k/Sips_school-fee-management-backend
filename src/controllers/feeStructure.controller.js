const asyncHandler =
  require("../helpers/asyncHandler");

const sendResponse =
  require("../utils/response");

const feeStructureService =
  require("../services/feeStructure.service");

// =====================================================
// CREATE FEE STRUCTURE
// ADMIN ONLY
// =====================================================

exports.createFeeStructure =
  asyncHandler(
    async (req, res) => {
      const result =
        await feeStructureService
          .createFeeStructure(
            req.body,
            req.user.id
          );

      return sendResponse(
        res,
        201,
        true,
        "Fee structure created successfully",
        result
      );
    }
  );

// =====================================================
// GET ALL FEE STRUCTURES
// ADMIN / RECEPTIONIST
// =====================================================

exports.getAllFeeStructures =
  asyncHandler(
    async (req, res) => {
      const feeStructures =
        await feeStructureService
          .getAllFeeStructures();

      return sendResponse(
        res,
        200,
        true,
        "Fee structures fetched successfully",
        feeStructures
      );
    }
  );

// =====================================================
// GET FEE STRUCTURE BY ID
// ADMIN / RECEPTIONIST
// =====================================================

exports.getFeeStructureById =
  asyncHandler(
    async (req, res) => {
      const feeStructure =
        await feeStructureService
          .getFeeStructureById(
            req.params.id
          );

      return sendResponse(
        res,
        200,
        true,
        "Fee structure fetched successfully",
        feeStructure
      );
    }
  );

// =====================================================
// GET FEE STRUCTURE BY CLASS
// ADMIN / RECEPTIONIST
// =====================================================

exports.getFeeStructureByClass =
  asyncHandler(
    async (req, res) => {
      const feeStructure =
        await feeStructureService
          .getFeeStructureByClass(
            req.params.className
          );

      return sendResponse(
        res,
        200,
        true,
        "Fee structure fetched successfully",
        feeStructure
      );
    }
  );

// =====================================================
// APPLY FEE STRUCTURE TO COMPLETE CLASS
// ADMIN ONLY
// =====================================================
//
// POST
// /api/fee-structures/class/:className/apply
//
// Example:
//
// Class 5 ke FeeStructure ko
// Class 5 ke saare active students par apply karega.
//
// paidFee preserve rahega.
// openingDue preserve rahega.
// dueFee automatically calculate hoga.
//

exports.applyFeeStructureToClass =
  asyncHandler(
    async (req, res) => {
      const result =
        await feeStructureService
          .applyFeeStructureToClass(
            req.params.className,
            req.user.id
          );

      return sendResponse(
        res,
        200,
        true,
        "Fee structure applied to class successfully",
        result
      );
    }
  );

// =====================================================
// UPDATE FEE STRUCTURE
// ADMIN ONLY
// =====================================================
//
// PUT
// /api/fee-structures/:id
//
// Example:
//
// {
//   "monthlyFee": 1800,
//   "examFee": 600
// }
//
// Is class ke saare active students update honge.
//

exports.updateFeeStructure =
  asyncHandler(
    async (req, res) => {
      const result =
        await feeStructureService
          .updateFeeStructure(
            req.params.id,
            req.body,
            req.user.id
          );

      return sendResponse(
        res,
        200,
        true,
        "Fee structure updated successfully",
        result
      );
    }
  );

// =====================================================
// UPDATE INDIVIDUAL STUDENT FEES
// ADMIN ONLY
// =====================================================
//
// PUT
// /api/fee-structures/student/:studentId
//
// Example:
//
// {
//   "monthlyFee": 1200,
//   "examFee": 500
// }
//
// Sirf selected student update hoga.
//

exports.updateIndividualStudentFees =
  asyncHandler(
    async (req, res) => {
      const result =
        await feeStructureService
          .updateIndividualStudentFees(
            req.params.studentId,
            req.body,
            req.user.id
          );

      return sendResponse(
        res,
        200,
        true,
        "Student fee updated successfully",
        result
      );
    }
  );

// =====================================================
// DELETE FEE STRUCTURE
// ADMIN ONLY
// =====================================================

exports.deleteFeeStructure =
  asyncHandler(
    async (req, res) => {
      const feeStructure =
        await feeStructureService
          .deleteFeeStructure(
            req.params.id,
            req.user.id
          );

      return sendResponse(
        res,
        200,
        true,
        "Fee structure deleted successfully",
        feeStructure
      );
    }
  );