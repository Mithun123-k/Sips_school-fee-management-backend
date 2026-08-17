const asyncHandler = require("../helpers/asyncHandler");
const sendResponse = require("../utils/response");
const userService = require("../services/user.service");

exports.createReceptionist = asyncHandler(async (req, res) => {

  const user = await userService.createReceptionist(req.body);

  return sendResponse(
    res,
    201,
    true,
    "Receptionist created successfully",
    user
  );
});

exports.getAllReceptionists = asyncHandler(async (req, res) => {

  const users =
    await userService.getAllReceptionists();

  return sendResponse(
    res,
    200,
    true,
    "Receptionists fetched successfully",
    users
  );
});

exports.getReceptionist = asyncHandler(async (req, res) => {

  const user =
    await userService.getReceptionist(
      req.params.id
    );

  return sendResponse(
    res,
    200,
    true,
    "Receptionist fetched successfully",
    user
  );
});

exports.updateReceptionist = asyncHandler(async (req, res) => {

  const user =
    await userService.updateReceptionist(
      req.params.id,
      req.body
    );

  return sendResponse(
    res,
    200,
    true,
    "Receptionist updated successfully",
    user
  );
});

exports.deleteReceptionist = asyncHandler(async (req, res) => {

  await userService.deleteReceptionist(
    req.params.id
  );

  return sendResponse(
    res,
    200,
    true,
    "Receptionist deleted successfully"
  );
});