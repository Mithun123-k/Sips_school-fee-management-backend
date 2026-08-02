const feeRepository = require("../repositories/fee.repository");
const studentRepository = require("../repositories/student.repository");
const pendingOnlinePaymentRepository = require("../repositories/pendingOnlinePayment.repository");

const razorpay = require("../config/razorpay");

const generateReceiptNo = require("../utils/generateReceiptNo");

// =====================================================
// Allowed Fee Heads
// =====================================================

const ALLOWED_FEE_HEADS = [
  "ADMISSION",
  "MONTHLY",
  "EXAM",
  "SPORT",
  "COMPUTER",
  "FUNCTION",
  "SMART_CLASS",
  "OTHER",
];

// =====================================================
// Validate Fee Head
// =====================================================

const validateFeeHead = (feeHead) => {
  if (!ALLOWED_FEE_HEADS.includes(feeHead)) {
    throw new Error("Invalid fee head");
  }
};

// =====================================================
// Validate Amount
// =====================================================

const validateAmount = (amount) => {
  const paymentAmount = Number(amount);

  if (
    !Number.isFinite(paymentAmount) ||
    paymentAmount <= 0
  ) {
    throw new Error(
      "Amount must be greater than zero"
    );
  }

  return paymentAmount;
};

// =====================================================
// Find Student
// =====================================================

const getStudent = async (studentId) => {
  const student =
    await studentRepository.findByStudentId(
      studentId
    );

  if (!student) {
    throw new Error("Student not found");
  }

  if (student.status !== "ACTIVE") {
    throw new Error(
      "Student is not active"
    );
  }

  return student;
};

// =====================================================
// Validate Due Amount
// =====================================================

const validateDueAmount = (
  paymentAmount,
  dueFee
) => {
  const currentDueFee =
    Number(dueFee || 0);

  if (paymentAmount > currentDueFee) {
    throw new Error(
      `Amount cannot be greater than due fee. Due fee is ₹${currentDueFee}`
    );
  }

  return currentDueFee;
};

// =====================================================
// Collect CASH Fee
// =====================================================

const collectFee = async (
  body,
  userId
) => {
  const {
    studentId,
    feeHead,
    amount,
    paymentMode,
    transactionId,
    remarks,
  } = body;

  // ---------------------------------------------------
  // Fee Head
  // ---------------------------------------------------

  validateFeeHead(feeHead);

  // ---------------------------------------------------
  // CASH Only
  // ---------------------------------------------------

  if (paymentMode !== "CASH") {
    throw new Error(
      "Manual fee collection is only allowed for CASH payment"
    );
  }

  // ---------------------------------------------------
  // Student
  // ---------------------------------------------------

  const student =
    await getStudent(studentId);

  // ---------------------------------------------------
  // Amount
  // ---------------------------------------------------

  const paymentAmount =
    validateAmount(amount);

  // ---------------------------------------------------
  // Due
  // ---------------------------------------------------

  const currentDueFee =
    validateDueAmount(
      paymentAmount,
      student.dueFee
    );

  // ---------------------------------------------------
  // Receipt
  // ---------------------------------------------------

  const receiptNo =
    await generateReceiptNo();

  // ---------------------------------------------------
  // Create Fee
  // ---------------------------------------------------

  const fee =
    await feeRepository.createFee({
      receiptNo,

      student:
        student._id,

      studentId:
        student.studentId,

      feeHead,

      amount:
        paymentAmount,

      paymentMode:
        "CASH",

      paymentStatus:
        "SUCCESS",

      transactionId:
        transactionId || "",

      remarks:
        remarks || "",

      collectedBy:
        userId,
    });

  // ---------------------------------------------------
  // Update Student
  // ---------------------------------------------------

  const paidFee =
    Number(student.paidFee || 0) +
    paymentAmount;

  const dueFee =
    Math.max(
      currentDueFee -
        paymentAmount,
      0
    );

  const updatedStudent =
    await studentRepository.updateFee(
      student._id,
      paidFee,
      dueFee
    );

  if (!updatedStudent) {
    throw new Error(
      "Failed to update student fee"
    );
  }

  return {
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

// =====================================================
// Create Online QR
// =====================================================
//
// PUBLIC
//
// userId can be null.
//

const createOnlineQR = async (
  body,
  userId = null
) => {
  const {
    studentId,
    feeHead,
    amount,
  } = body;

  // ---------------------------------------------------
  // Fee Head
  // ---------------------------------------------------

  validateFeeHead(feeHead);

  // ---------------------------------------------------
  // Student
  // ---------------------------------------------------

  const student =
    await getStudent(studentId);

  // ---------------------------------------------------
  // Amount
  // ---------------------------------------------------

  const paymentAmount =
    validateAmount(amount);

  // ---------------------------------------------------
  // Due
  // ---------------------------------------------------

  const currentDueFee =
    validateDueAmount(
      paymentAmount,
      student.dueFee
    );

  console.log(
    "===================================="
  );

  console.log(
    "ONLINE QR PAYMENT"
  );

  console.log(
    "Student:",
    student.studentId
  );

  console.log(
    "Fee Head:",
    feeHead
  );

  console.log(
    "Amount:",
    paymentAmount
  );

  console.log(
    "Due:",
    currentDueFee
  );

  console.log(
    "===================================="
  );

  // ---------------------------------------------------
  // Razorpay Amount
  // ---------------------------------------------------

  const razorpayAmount =
    Math.round(
      paymentAmount * 100
    );

  // ---------------------------------------------------
  // Create Razorpay QR
  // ---------------------------------------------------

  const qr =
    await razorpay.qrCode.create({
      type: "upi_qr",

      name:
        `School Fee ${student.studentId}`,

      usage:
        "single_use",

      fixed_amount:
        true,

      payment_amount:
        razorpayAmount,

      description:
        `${feeHead} Fee Payment - ${student.studentId}`,

      notes: {
        studentId:
          student.studentId,

        studentMongoId:
          student._id.toString(),

        feeHead,
      },
    });

  // ---------------------------------------------------
  // Save Pending Payment
  // ---------------------------------------------------

  const pendingPayment =
    await pendingOnlinePaymentRepository
      .createPendingPayment({
        qrId:
          qr.id,

        student:
          student._id,

        studentId:
          student.studentId,

        feeHead,

        amount:
          paymentAmount,

        qrImageUrl:
          qr.image_url,

        createdBy:
          userId || null,

        status:
          "PENDING",
      });

  // ---------------------------------------------------
  // Return
  // ---------------------------------------------------

  return {
    qrId:
      pendingPayment.qrId,

    studentId:
      pendingPayment.studentId,

    feeHead:
      pendingPayment.feeHead,

    amount:
      pendingPayment.amount,

    imageUrl:
      pendingPayment.qrImageUrl,

    status:
      "PENDING",

    paymentMode:
      "ONLINE",

    paymentStatus:
      "PENDING",
  };
};

// =====================================================
// Check Online Payment
// =====================================================
//
// PUBLIC
//
// userId can be null.
//

const checkOnlinePayment = async (
  qrId,
  userId = null
) => {
  // ---------------------------------------------------
  // Pending Payment
  // ---------------------------------------------------

  const pendingPayment =
    await pendingOnlinePaymentRepository
      .findByQrId(qrId);

  if (!pendingPayment) {
    throw new Error(
      "Online payment request not found"
    );
  }

  // ---------------------------------------------------
  // Already Success
  // ---------------------------------------------------

  if (
    pendingPayment.status ===
    "SUCCESS"
  ) {
    const existingFee =
      pendingPayment.paymentId
        ? await feeRepository
            .findByTransactionId(
              pendingPayment.paymentId
            )
        : null;

    return {
      paid: true,

      status:
        "SUCCESS",

      qrId,

      paymentId:
        pendingPayment.paymentId,

      fee:
        existingFee,
    };
  }

  // ---------------------------------------------------
  // Fetch Razorpay Payments
  // ---------------------------------------------------

  const response =
    await razorpay.qrCode.fetchPayments(
      qrId
    );

  const payments =
    response.items || [];

  // ---------------------------------------------------
  // Find Captured Payment
  // ---------------------------------------------------

  const successfulPayment =
    payments.find(
      (payment) =>
        payment.status ===
        "captured"
    );

  // ---------------------------------------------------
  // Still Pending
  // ---------------------------------------------------

  if (!successfulPayment) {
    return {
      paid: false,

      status:
        "PENDING",

      qrId,

      feeHead:
        pendingPayment.feeHead,

      amount:
        pendingPayment.amount,
    };
  }

  // ---------------------------------------------------
  // Payment Amount
  // ---------------------------------------------------

  const paidAmount =
    Number(
      successfulPayment.amount
    ) / 100;

  const pendingAmount =
    Number(
      pendingPayment.amount
    );

  // ---------------------------------------------------
  // Amount Check
  // ---------------------------------------------------

  if (
    paidAmount !==
    pendingAmount
  ) {
    throw new Error(
      "Payment amount mismatch"
    );
  }

  // ---------------------------------------------------
  // Duplicate Payment Protection
  // ---------------------------------------------------

  const existingFee =
    await feeRepository
      .findByTransactionId(
        successfulPayment.id
      );

  if (existingFee) {
    await pendingOnlinePaymentRepository
      .markPaymentSuccess(
        qrId,
        successfulPayment.id
      );

    return {
      paid: true,

      status:
        "SUCCESS",

      qrId,

      paymentId:
        successfulPayment.id,

      receiptNo:
        existingFee.receiptNo,

      fee:
        existingFee,
    };
  }

  // ---------------------------------------------------
  // Student
  // ---------------------------------------------------

  const student =
    await getStudent(
      pendingPayment.studentId
    );

  // ---------------------------------------------------
  // Due
  // ---------------------------------------------------

  const currentDueFee =
    Number(student.dueFee || 0);

  if (
    paidAmount >
    currentDueFee
  ) {
    throw new Error(
      `Payment amount exceeds due fee. Due fee is ₹${currentDueFee}`
    );
  }

  // ---------------------------------------------------
  // Receipt
  // ---------------------------------------------------

  const receiptNo =
    await generateReceiptNo();

  // ---------------------------------------------------
  // Create Fee
  // ---------------------------------------------------

  const fee =
    await feeRepository.createFee({
      receiptNo,

      student:
        student._id,

      studentId:
        student.studentId,

      feeHead:
        pendingPayment.feeHead,

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
        userId || null,
    });

  // ---------------------------------------------------
  // Update Student Fee
  // ---------------------------------------------------

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

  if (!updatedStudent) {
    throw new Error(
      "Failed to update student fee"
    );
  }

  // ---------------------------------------------------
  // Mark Pending Payment SUCCESS
  // ---------------------------------------------------

  await pendingOnlinePaymentRepository
    .markPaymentSuccess(
      qrId,
      successfulPayment.id
    );

  // ---------------------------------------------------
  // Return Success
  // ---------------------------------------------------

  return {
    paid: true,

    status:
      "SUCCESS",

    qrId,

    paymentId:
      successfulPayment.id,

    receiptNo,

    fee,

    student: {
      studentId:
        updatedStudent.studentId,

      name:
        updatedStudent.name,

      feeHead:
        pendingPayment.feeHead,

      paidFee:
        updatedStudent.paidFee,

      dueFee:
        updatedStudent.dueFee,
    },
  };
};

// =====================================================
// Fee History
// =====================================================

const getFeeHistory = async (
  studentId
) => {
  const student =
    await studentRepository
      .findByStudentId(
        studentId
      );

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  return await feeRepository
    .getFeeHistory(
      student.studentId
    );
};

// =====================================================
// Receipt Details
// =====================================================

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

// =====================================================
// Export
// =====================================================

module.exports = {
  collectFee,

  createOnlineQR,

  checkOnlinePayment,

  getFeeHistory,

  getReceipt,
};