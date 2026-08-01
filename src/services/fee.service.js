const feeRepository = require("../repositories/fee.repository");
const studentRepository = require("../repositories/student.repository");
const pendingOnlinePaymentRepository = require("../repositories/pendingOnlinePayment.repository");

const razorpay = require("../config/razorpay");

const generateReceiptNo = require("../utils/generateReceiptNo");

// ==============================
// Collect CASH / Manual Fee
// ==============================

const collectFee = async (body, userId) => {
  const {
    studentId,
    amount,
    paymentMode,
    transactionId,
    remarks,
  } = body;

  // Find Student
  const student =
    await studentRepository.findByStudentId(studentId);

  if (!student) {
    throw new Error("Student not found");
  }

  // Convert amount to Number
  const paymentAmount = Number(amount);

  // Validate Amount
  if (
    !Number.isFinite(paymentAmount) ||
    paymentAmount <= 0
  ) {
    throw new Error(
      "Amount must be greater than zero"
    );
  }

  // Current Due Fee
  const currentDueFee =
    Number(student.dueFee || 0);

  // Due Amount Validation
  if (paymentAmount > currentDueFee) {
    throw new Error(
      `Amount cannot be greater than due fee. Due fee is ₹${currentDueFee}`
    );
  }

  // Generate Receipt
  const receiptNo =
    await generateReceiptNo();

  // Create Fee Entry
  const fee =
    await feeRepository.createFee({
      receiptNo,

      student: student._id,

      studentId: student.studentId,

      amount: paymentAmount,

      paymentMode,

      transactionId,

      remarks,

      collectedBy: userId,
    });

  // ==============================
  // Update Student Fee
  // ==============================

  const paidFee =
    Number(student.paidFee || 0) +
    paymentAmount;

  const dueFee =
    Math.max(
      currentDueFee - paymentAmount,
      0
    );

  await studentRepository.updateFee(
    student._id,
    paidFee,
    dueFee
  );

  return fee;
};

// ==============================
// Create Online QR
// ==============================

const createOnlineQR = async (
  body,
  userId
) => {
  const {
    studentId,
    amount,
  } = body;

  // Find Student
  const student =
    await studentRepository.findByStudentId(
      studentId
    );

  if (!student) {
    throw new Error("Student not found");
  }

  // Convert Amount
  const paymentAmount =
    Number(amount);

  // Validate Amount
  if (
    !Number.isFinite(paymentAmount) ||
    paymentAmount <= 0
  ) {
    throw new Error(
      "Amount must be greater than zero"
    );
  }

  // Current Due Fee
  const currentDueFee =
    Number(student.dueFee || 0);

  console.log(
    "===== ONLINE QR PAYMENT ====="
  );

  console.log(
    "Student ID:",
    student.studentId
  );

  console.log(
    "Payment Amount:",
    paymentAmount
  );

  console.log(
    "Current Due Fee:",
    currentDueFee
  );

  console.log(
    "Can Pay:",
    paymentAmount <= currentDueFee
  );

  console.log(
    "=============================="
  );

  // Due Fee Validation
  if (paymentAmount > currentDueFee) {
    throw new Error(
      `Amount cannot be greater than due fee. Due fee is ₹${currentDueFee}`
    );
  }

  // Razorpay amount is in paise
  const razorpayAmount =
    Math.round(
      paymentAmount * 100
    );

  // ==============================
  // Create Razorpay Dynamic QR
  // ==============================

  const qr =
    await razorpay.qrCode.create({
      type: "upi_qr",

      name:
        `School Fee ${student.studentId}`,

      usage: "single_use",

      fixed_amount: true,

      payment_amount:
        razorpayAmount,

      description:
        `Fee Payment - ${student.studentId}`,

      notes: {
        studentId:
          student.studentId,

        studentMongoId:
          student._id.toString(),
      },
    });

  // ==============================
  // Save Pending Payment
  // ==============================

  await pendingOnlinePaymentRepository
    .createPendingPayment({
      qrId: qr.id,

      student: student._id,

      studentId:
        student.studentId,

      amount:
        paymentAmount,

      qrImageUrl:
        qr.image_url,

      createdBy:
        userId,

      status: "PENDING",
    });

  return {
    qrId:
      qr.id,

    studentId:
      student.studentId,

    amount:
      paymentAmount,

    imageUrl:
      qr.image_url,

    status:
      qr.status,

    paymentMode:
      "ONLINE",

    paymentStatus:
      "PENDING",
  };
};

// ==============================
// Check Online Payment
// ==============================

const checkOnlinePayment = async (
  qrId,
  userId
) => {
  // Find Pending Payment
  const pendingPayment =
    await pendingOnlinePaymentRepository
      .findByQrId(qrId);

  if (!pendingPayment) {
    throw new Error(
      "Online payment request not found"
    );
  }

  // Already successful
  if (
    pendingPayment.status ===
    "SUCCESS"
  ) {
    return {
      paid: true,

      status: "SUCCESS",

      paymentId:
        pendingPayment.paymentId,
    };
  }

  // ==============================
  // Fetch Payments From Razorpay
  // ==============================

  const response =
    await razorpay.qrCode.fetchPayments(
      qrId
    );

  const payments =
    response.items || [];

  // Find Captured Payment
  const successfulPayment =
    payments.find(
      (payment) =>
        payment.status ===
        "captured"
    );

  // Payment Not Completed
  if (!successfulPayment) {
    return {
      paid: false,

      status: "PENDING",

      qrId,
    };
  }

  // ==============================
  // Payment Amount
  // ==============================

  const paidAmount =
    Number(
      successfulPayment.amount
    ) / 100;

  const pendingAmount =
    Number(
      pendingPayment.amount
    );

  // ==============================
  // Amount Validation
  // ==============================

  if (
    paidAmount !==
    pendingAmount
  ) {
    throw new Error(
      "Payment amount mismatch"
    );
  }

  // ==============================
  // Find Student
  // ==============================

  const student =
    await studentRepository
      .findByStudentId(
        pendingPayment.studentId
      );

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  // Current Due Fee
  const currentDueFee =
    Number(student.dueFee || 0);

  // ==============================
  // Due Fee Validation
  // ==============================

  if (
    paidAmount >
    currentDueFee
  ) {
    throw new Error(
      `Payment amount exceeds due fee. Due fee is ₹${currentDueFee}`
    );
  }

  // ==============================
  // Duplicate Protection
  // ==============================

  const existingFee =
    await feeRepository
      .findByTransactionId(
        successfulPayment.id
      );

  if (existingFee) {
    await pendingOnlinePaymentRepository
      .updatePayment(
        qrId,
        {
          paymentId:
            successfulPayment.id,

          status:
            "SUCCESS",

          completedAt:
            new Date(),
        }
      );

    return {
      paid: true,

      status:
        "SUCCESS",

      paymentId:
        successfulPayment.id,

      fee:
        existingFee,
    };
  }

  // ==============================
  // Generate Receipt
  // ==============================

  const receiptNo =
    await generateReceiptNo();

  // ==============================
  // Create Fee
  // ==============================

  const fee =
    await feeRepository.createFee({
      receiptNo,

      student:
        student._id,

      studentId:
        student.studentId,

      amount:
        paidAmount,

      paymentMode:
        "ONLINE",

      paymentStatus:
        "SUCCESS",

      transactionId:
        successfulPayment.id,

      remarks:
        "Online UPI QR Payment",

      collectedBy:
        userId,
    });

  // ==============================
  // Update Student Fee
  // ==============================

  const paidFee =
    Number(student.paidFee || 0) +
    paidAmount;

  const dueFee =
    Math.max(
      currentDueFee -
        paidAmount,
      0
    );

  const updatedStudent =
    await studentRepository.updateFee(
      student._id,

      paidFee,

      dueFee
    );

  console.log(
    "===== STUDENT FEE UPDATED ====="
  );

  console.log(
    "Student:",
    updatedStudent
  );

  // ==============================
  // Mark Payment SUCCESS
  // ==============================

  await pendingOnlinePaymentRepository
    .updatePayment(
      qrId,
      {
        paymentId:
          successfulPayment.id,

        status:
          "SUCCESS",

        completedAt:
          new Date(),
      }
    );

  return {
    paid: true,

    status:
      "SUCCESS",

    paymentId:
      successfulPayment.id,

    receiptNo,

    fee,

    student: {
      studentId:
        updatedStudent.studentId,

      paidFee:
        updatedStudent.paidFee,

      dueFee:
        updatedStudent.dueFee,
    },
  };
};

// ==============================
// Fee History
// ==============================

const getFeeHistory = async (
  studentId
) => {
  return await feeRepository
    .getFeeHistory(studentId);
};

// ==============================
// Receipt Details
// ==============================

const getReceipt = async (
  id
) => {
  const receipt =
    await feeRepository
      .getReceipt(id);

  if (!receipt) {
    throw new Error(
      "Receipt not found"
    );
  }

  return receipt;
};

module.exports = {
  collectFee,

  createOnlineQR,

  checkOnlinePayment,

  getFeeHistory,

  getReceipt,
};