const { body } =
  require("express-validator");

exports.loginValidation = [
  body("mobile")
    .notEmpty()
    .withMessage("Mobile Required"),

  body("password")
    .notEmpty()
    .withMessage("Password Required"),
];