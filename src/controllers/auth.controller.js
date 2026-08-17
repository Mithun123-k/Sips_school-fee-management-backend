const asyncHandler = require("../helpers/asyncHandler");

const authService = require("../services/auth.service");

const sendResponse = require("../utils/response");

exports.login = asyncHandler(
  async (req, res) => {

    const { mobile, password } =
      req.body;

    const result =
      await authService.login(
        mobile,
        password
      );

    return sendResponse(
      res,
      200,
      true,
      "Login Successful",
      {
        token: result.token,

        user: {
          id: result.user._id,
          name: result.user.name,
          role: result.user.role,
          mobile: result.user.mobile,
        },
      }
    );
  }
);