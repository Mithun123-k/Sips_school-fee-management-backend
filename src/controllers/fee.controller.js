const asyncHandler = require("../helpers/asyncHandler");
const sendResponse = require("../utils/response");

const feeService = require("../services/fee.service");

// ====================================
// Collect Fee
// ====================================

exports.collectFee = asyncHandler(async (req, res) => {

    const fee = await feeService.collectFee(
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

});

// ====================================
// Fee History
// ====================================

exports.getFeeHistory = asyncHandler(async (req, res) => {

    const fees = await feeService.getFeeHistory(
        req.params.studentId
    );

    return sendResponse(
        res,
        200,
        true,
        "Fee history fetched successfully",
        fees
    );

});

// ====================================
// Receipt Details
// ====================================

exports.getReceipt = asyncHandler(async (req, res) => {

    const receipt = await feeService.getReceipt(
        req.params.id
    );

    return sendResponse(
        res,
        200,
        true,
        "Receipt fetched successfully",
        receipt
    );

});