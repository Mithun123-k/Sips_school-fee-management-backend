const feeRepository = require("../repositories/fee.repository");
const studentRepository = require("../repositories/student.repository");
const generateReceiptNo = require("../utils/generateReceiptNo");

// ==============================
// Collect Fee
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
    await studentRepository.getStudentById(studentId);

  if (!student) {
    throw new Error("Student not found");
  }

  // Validate Amount
  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  // Due Amount Validation
  if (amount > student.dueFee) {
    throw new Error(
      "Amount cannot be greater than due fee"
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
      amount,
      paymentMode,
      transactionId,
      remarks,
      collectedBy: userId,
    });

  // Update Student Fee
  const paidFee =
    student.paidFee + amount;

  const dueFee =
    student.totalFee - paidFee;

  await studentRepository.updateFee(
    student._id,
    paidFee,
    dueFee
  );

  return fee;
};

// ==============================
// Fee History
// ==============================

const getFeeHistory = async (
  studentId
) => {

  return await feeRepository.getFeeHistory(
    studentId
  );

};

// ==============================
// Receipt Details
// ==============================

const getReceipt = async (id) => {

  const receipt =
    await feeRepository.getReceipt(id);

  if (!receipt)
    throw new Error("Receipt not found");

  return receipt;

};

module.exports = {
  collectFee,
  getFeeHistory,
  getReceipt,
};