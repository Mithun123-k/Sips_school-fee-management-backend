const { body } = require("express-validator");

exports.createStudentValidation = [

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Student name is required"),

  body("fatherName")
    .trim()
    .notEmpty()
    .withMessage("Father name is required"),

  body("mobile")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required")
    .isLength({ min: 10, max: 10 })
    .withMessage("Mobile number must be 10 digits"),

  body("gender")
    .notEmpty()
    .withMessage("Gender is required"),

  body("className")
    .notEmpty()
    .withMessage("Class is required"),

  body("totalFee")
    .notEmpty()
    .withMessage("Total fee is required")
    .isNumeric()
    .withMessage("Total fee must be numeric"),
];

exports.updateStudentValidation = [

  body("name")
    .optional()
    .trim(),

  body("fatherName")
    .optional()
    .trim(),

  body("mobile")
    .optional()
    .isLength({ min: 10, max: 10 }),

  body("totalFee")
    .optional()
    .isNumeric(),
];