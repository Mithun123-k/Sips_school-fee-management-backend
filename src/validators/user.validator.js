const { body } = require("express-validator");

exports.createReceptionistValidation = [

  body("name")
    .notEmpty()
    .withMessage("Name is required"),

  body("mobile")
    .notEmpty()
    .withMessage("Mobile is required")
    .isLength({ min: 10, max: 10 })
    .withMessage("Invalid mobile number"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email"),
];