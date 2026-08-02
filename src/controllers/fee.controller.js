const asyncHandler = require("../helpers/asyncHandler");

const sendResponse =
  require("../utils/response");

const feeService =
  require("../services/fee.service");

// =====================================================
// Collect CASH Fee
// ADMIN / RECEPTIONIST
// =====================================================

exports.collectFee = asyncHandler(
  async (req, res) => {
    const fee =
      await feeService.collectFee(
        req.body,
        req.user.id
      );

    return sendResponse(
      res,
      201,
      true,
      "Fee collected successfully",
      fee
    );
  }
);

// =====================================================
// Create Online QR
// PUBLIC
// =====================================================
//
// Student can search himself and create QR
// without login.
//

exports.createOnlineQR = asyncHandler(
  async (req, res) => {
    const qr =
      await feeService.createOnlineQR(
        req.body,
        null
      );

    return sendResponse(
      res,
      201,
      true,
      "Payment QR generated successfully",
      qr
    );
  }
);

// =====================================================
// Check Online Payment
// PUBLIC
// =====================================================
//
// Student can check payment status
// without login.
//

exports.checkOnlinePayment =
  asyncHandler(
    async (req, res) => {
      const result =
        await feeService.checkOnlinePayment(
          req.params.qrId,
          null
        );

      return sendResponse(
        res,
        200,
        true,
        result.paid
          ? "Payment successful"
          : "Payment pending",
        result
      );
    }
  );

// =====================================================
// Fee History
// ADMIN / RECEPTIONIST
// =====================================================

exports.getFeeHistory =
  asyncHandler(
    async (req, res) => {
      const fees =
        await feeService.getFeeHistory(
          req.params.studentId
        );

      return sendResponse(
        res,
        200,
        true,
        "Fee history fetched successfully",
        fees
      );
    }
  );

// =====================================================
// Receipt Details
// ADMIN / RECEPTIONIST
// =====================================================

exports.getReceipt =
  asyncHandler(
    async (req, res) => {
      const receipt =
        await feeService.getReceipt(
          req.params.id
        );

      return sendResponse(
        res,
        200,
        true,
        "Receipt fetched successfully",
        receipt
      );
    }
  );