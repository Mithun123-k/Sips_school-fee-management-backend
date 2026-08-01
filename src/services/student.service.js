const studentRepository = require("../repositories/student.repository");
const generateStudentId = require("../utils/generateStudentId");

// =====================================================
// Calculate Fee Start Date
// =====================================================

const calculateFeeStartDate = (admissionDate) => {
  const date = new Date(admissionDate);

  // ===================================================
  // TEST MODE
  // Fee starts from STUDENT CREATION TIME
  // 1 minute = 1 month
  // ===================================================

  if (process.env.TEST_FEE_MODE === "true") {
    return new Date();
  }

  // ===================================================
  // PRODUCTION MODE
  // Admission: 15 July
  // Fee Start: 01 August
  // ===================================================

  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    1
  );
};

// =====================================================
// Calculate Monthly Fee
// =====================================================

const calculateMonthlyFee = (
  feeStartDate,
  monthlyFee,
  currentDate = new Date()
) => {
  if (!feeStartDate || !monthlyFee) {
    return 0;
  }

  const startDate = new Date(feeStartDate);
  const today = new Date(currentDate);

  // ===================================================
  // TEST MODE
  // 1 MINUTE = 1 MONTH
  // ===================================================

  if (process.env.TEST_FEE_MODE === "true") {
    const diffMs =
      today.getTime() - startDate.getTime();

    if (diffMs < 0) {
      return 0;
    }

    const minutesPassed = Math.floor(
      diffMs / (60 * 1000)
    );

    // Creation = 1 month
    // 1 minute = 2 months
    // 2 minutes = 3 months

    const months = minutesPassed + 1;

    return months * Number(monthlyFee);
  }

  // ===================================================
  // PRODUCTION MODE
  // REAL CALENDAR MONTH
  // ===================================================

  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // Fee has not started
  if (today < startDate) {
    return 0;
  }

  const months =
    (today.getFullYear() - startDate.getFullYear()) * 12 +
    (today.getMonth() - startDate.getMonth()) +
    1;

  return months * Number(monthlyFee);
};

// =====================================================
// Calculate Total Due Fee
// =====================================================

const calculateDueFee = (
  student,
  currentDate = new Date()
) => {
  const openingDue =
    Number(student.openingDue || 0);

  const monthlyFeeAmount =
    calculateMonthlyFee(
      student.feeStartDate,
      Number(student.monthlyFee || 0),
      currentDate
    );

  const paidFee =
    Number(student.paidFee || 0);

  const totalDue =
    openingDue +
    monthlyFeeAmount -
    paidFee;

  return Math.max(totalDue, 0);
};

// =====================================================
// Create Student
// =====================================================

const createStudent = async (
  body,
  userId
) => {
  const {
    mobile,
    admissionDate,
    monthlyFee,
    openingDue,
    totalFee,
  } = body;

  // ===================================================
  // Check Mobile
  // ===================================================

  const existingStudent =
    await studentRepository.findByMobile(
      mobile
    );

  if (existingStudent) {
    throw new Error(
      "Mobile number already exists"
    );
  }

  // ===================================================
  // Admission Date
  // ===================================================

  const finalAdmissionDate =
    admissionDate
      ? new Date(admissionDate)
      : new Date();

  // ===================================================
  // Fee Start Date
  // ===================================================

  const feeStartDate =
    calculateFeeStartDate(
      finalAdmissionDate
    );

  // ===================================================
  // Fee Values
  // ===================================================

  const finalMonthlyFee =
    Number(monthlyFee || 0);

  const finalOpeningDue =
    Number(openingDue || 0);

  const finalTotalFee =
    Number(totalFee || 0);

  const finalPaidFee = 0;

  // ===================================================
  // Generate Student ID
  // ===================================================

  const studentId =
    await generateStudentId();

  // ===================================================
  // Student Data
  // ===================================================

  const studentData = {
    ...body,

    studentId,

    admissionDate:
      finalAdmissionDate,

    feeStartDate,

    monthlyFee:
      finalMonthlyFee,

    openingDue:
      finalOpeningDue,

    totalFee:
      finalTotalFee,

    paidFee:
      finalPaidFee,

    dueFee: 0,

    createdBy: userId,
  };

  // ===================================================
  // Create Student
  // ===================================================

  const student =
    await studentRepository.createStudent(
      studentData
    );

  // ===================================================
  // Calculate Initial Due
  // ===================================================

  const dueFee =
    calculateDueFee(student);

  // ===================================================
  // Update Due Fee In MongoDB
  // ===================================================

  await studentRepository.updateDueFee(
    student._id,
    dueFee
  );

  // Update API response
  student.dueFee = dueFee;

  return student;
};

// =====================================================
// Get All Students
// =====================================================

const getAllStudents = async () => {
  const students =
    await studentRepository.getAllStudents();

  for (const student of students) {
    // Calculate latest due
    const dueFee =
      calculateDueFee(student);

    // Update MongoDB
    if (
      Number(student.dueFee) !==
      Number(dueFee)
    ) {
      await studentRepository.updateDueFee(
        student._id,
        dueFee
      );
    }

    // Update API response
    student.dueFee = dueFee;
  }

  return students;
};

// =====================================================
// Get Student By ID
// =====================================================

const getStudentById = async (id) => {
  const student =
    await studentRepository.getStudentById(
      id
    );

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  // Calculate latest due
  const dueFee =
    calculateDueFee(student);

  // Update MongoDB
  if (
    Number(student.dueFee) !==
    Number(dueFee)
  ) {
    await studentRepository.updateDueFee(
      student._id,
      dueFee
    );
  }

  // Update API response
  student.dueFee = dueFee;

  return student;
};

// =====================================================
// Search Student
// =====================================================

const searchStudent = async (search) => {
  const student =
    await studentRepository.searchStudent(
      search
    );

  if (!student) {
    return null;
  }

  // Calculate latest due
  const dueFee =
    calculateDueFee(student);

  // Update MongoDB
  if (
    Number(student.dueFee) !==
    Number(dueFee)
  ) {
    await studentRepository.updateDueFee(
      student._id,
      dueFee
    );
  }

  // Update API response
  student.dueFee = dueFee;

  return student;
};

// =====================================================
// Update Student
// =====================================================

const updateStudent = async (
  id,
  body,
  userId
) => {
  // ===================================================
  // Get Existing Student
  // ===================================================

  const existingStudent =
    await studentRepository.getStudentById(
      id
    );

  if (!existingStudent) {
    throw new Error(
      "Student not found"
    );
  }

  // ===================================================
  // Updated By
  // ===================================================

  body.updatedBy = userId;

  // ===================================================
  // Admission Date Changed
  // ===================================================

  if (body.admissionDate) {
    const newAdmissionDate =
      new Date(body.admissionDate);

    body.feeStartDate =
      calculateFeeStartDate(
        newAdmissionDate
      );
  }

  // ===================================================
  // Update Student
  // ===================================================

  const student =
    await studentRepository.updateStudent(
      id,
      body
    );

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  // ===================================================
  // Calculate Latest Due
  // ===================================================

  const dueFee =
    calculateDueFee(student);

  // ===================================================
  // Update Due Fee In MongoDB
  // ===================================================

  await studentRepository.updateDueFee(
    student._id,
    dueFee
  );

  // Update API response
  student.dueFee = dueFee;

  return student;
};

// =====================================================
// Delete Student
// =====================================================

const deleteStudent = async (id) => {
  const student =
    await studentRepository.deleteStudent(
      id
    );

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  return;
};

// =====================================================
// Export
// =====================================================

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  searchStudent,
  updateStudent,
  deleteStudent,
  calculateDueFee,
};