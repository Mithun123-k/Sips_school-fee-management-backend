const asyncHandler =
  require("../helpers/asyncHandler");

const sendResponse =
  require("../utils/response");

const feeService =
  require("../services/fee.service");





// =====================================================
// Collect CASH Fee
// ADMIN / RECEPTIONIST
// =====================================================
//
// Supports:
// - Normal Fee Payment
// - Sibling Discount
// - RTE Discount
// - Girl Discount
// - Lump Sum Payment
//
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
// Student can create payment QR
// without login.
//
// Supports:
// - Normal payment
// - Lump Sum payment
//
// =====================================================

exports.createOnlineQR =
  asyncHandler(
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
// =====================================================

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
// Lump Sum Preview
// PUBLIC
// =====================================================
//
// Used before payment.
//
// Frontend/Kiosk calls this API after
// student is selected.
//
// It returns:
//
// - Discount type
// - Remaining months
// - Normal monthly fee
// - Lump Sum monthly fee
// - Remaining monthly amount
// - Remaining one-time fees
// - Normal remaining academic fee
// - Additional discount
// - Final Lump Sum amount
//
// =====================================================

exports.getLumpSumPreview =
  asyncHandler(
    async (req, res) => {
      const preview =
        await feeService.getLumpSumPreview(
          req.params.studentId
        );

      return sendResponse(
        res,
        200,
        true,
        "Lump Sum preview fetched successfully",
        preview
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

  exports.getAllFeeHistory = asyncHandler(
  async (req, res) => {
    const fees =
      await feeService.getAllFeeHistory();

    return sendResponse(
      res,
      200,
      true,
      "All fee history fetched successfully",
      fees
    );
  }
);

// =====================================================
// Calculate Student Fee
// =====================================================
//
// POST /api/fees/calculate
//
// Body:
//
// {
//   "studentId": "SIPS000001",
//   "feeHead": "ADMISSION"
// }
//
// OR:
//
// {
//   "studentId": "SIPS000001",
//   "feeHead": [
//     "ADMISSION",
//     "MONTHLY"
//   ]
// }
//
// OR:
//
// {
//   "studentId": "SIPS000001",
//   "feeHead": "ALL"
// }
//
// =====================================================

exports.calculateFee =
  asyncHandler(
    async (req, res) => {
      const {
        studentId,
        feeHead,
      } = req.body || {};

      if (!studentId) {
        return sendResponse(
          res,
          400,
          false,
          "studentId is required",
          null
        );
      }

      if (
        feeHead === undefined ||
        feeHead === null ||
        (
          typeof feeHead === "string" &&
          feeHead.trim() === ""
        ) ||
        (
          Array.isArray(feeHead) &&
          feeHead.length === 0
        )
      ) {
        return sendResponse(
          res,
          400,
          false,
          "feeHead is required",
          null
        );
      }

      const result =
        await feeService.calculateFeeByHead(
          {
            studentId,
            feeHead,
            includeLumpSumDetails:
              true,
          }
        );

      return sendResponse(
        res,
        200,
        true,
        "Fee calculated successfully",
        result
      );
    }
  );


  exports.waiveLateFee = asyncHandler(
  async (req, res) => {
    const result =
      await feeService.waiveLateFee(
        req.body,
        req.user.id
      );

    return sendResponse(
      res,
      200,
      true,
      "Late fee waived successfully",
      result
    );
  }
);

exports.revokeLateFeeWaiver =
  asyncHandler(
    async (req, res) => {
      const result =
        await feeService
          .revokeLateFeeWaiver(
            req.params.studentId,
            req.params.month,
            req.user.id
          );

      return sendResponse(
        res,
        200,
        true,
        "Late fee waiver revoked successfully",
        result
      );
    }
  );

// =====================================================
// Waive Monthly Fee For All Students
// ADMIN ONLY
// =====================================================

exports.waiveMonthlyFeeForAllStudents =
  asyncHandler(
    async (req, res) => {
      const result =
        await feeService
          .waiveMonthlyFeeForAllStudents(
            req.body,
            req.user.id
          );

      return sendResponse(
        res,
        200,
        true,
        "Monthly fee waived for all students successfully",
        result
      );
    }
  );
