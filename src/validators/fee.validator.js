const { body } = require("express-validator");

exports.collectFeeValidation = [

    body("studentId")
        .notEmpty()
        .withMessage("Student Id is required"),

    body("amount")
        .notEmpty()
        .withMessage("Amount is required")
        .isFloat({ gt: 0 })
        .withMessage("Amount must be greater than zero"),

    body("paymentMode")
        .notEmpty()
        .withMessage("Payment Mode is required")
        .isIn(["CASH", "ONLINE"])
        .withMessage("Invalid Payment Mode"),

    body("transactionId")
        .if(body("paymentMode").equals("ONLINE"))
        .notEmpty()
        .withMessage("Transaction Id is required for online payment"),

];