const studentRepository = require("../repositories/student.repository");
const generateStudentId = require("../utils/generateStudentId");

// =====================================================
// Calculate Fee Start Date
// =====================================================

const calculateFeeStartDate = (admissionDate) => {
  const date = new Date(admissionDate);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid admission date");
  }

  // ===================================================
  // TEST MODE
  // 1 minute = 1 month
  // ===================================================

  if (process.env.TEST_FEE_MODE === "true") {
    return new Date();
  }

  // ===================================================
  // PRODUCTION MODE
  //
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
// Validate Fee Values
// =====================================================

const validateFeeValues = ({
  monthlyFee,
  openingDue,
  totalFee,
}) => {
  const finalMonthlyFee = Number(monthlyFee || 0);
  const finalOpeningDue = Number(openingDue || 0);
  const finalTotalFee = Number(totalFee || 0);

  if (
    !Number.isFinite(finalMonthlyFee) ||
    !Number.isFinite(finalOpeningDue) ||
    !Number.isFinite(finalTotalFee)
  ) {
    throw new Error("Fee values must be valid numbers");
  }

  if (
    finalMonthlyFee < 0 ||
    finalOpeningDue < 0 ||
    finalTotalFee < 0
  ) {
    throw new Error("Fee values cannot be negative");
  }

  return {
    monthlyFee: finalMonthlyFee,
    openingDue: finalOpeningDue,
    totalFee: finalTotalFee,
  };
};

// =====================================================
// Create Student
// ADMIN ONLY
// =====================================================

const createStudent = async (body, userId) => {
  const {
    admissionNo,
    name,
    fatherName,
    motherName,
    mobile,
    email,
    gender,
    dob,
    className,
    section,
    address,
    admissionDate,
    monthlyFee,
    openingDue,
    totalFee,
  } = body;

  // ===================================================
  // Check Duplicate Student
  // ===================================================

  const existingStudent =
    await studentRepository.findByAdmissionNo(
      admissionNo,
      name,
      fatherName,
      motherName,
      className
    );

  if (existingStudent) {
    if (
      admissionNo &&
      existingStudent.admissionNo === admissionNo
    ) {
      throw new Error(
        "Student with this admission number already exists"
      );
    }

    throw new Error(
      "Student with same name, father name, mother name and class already exists"
    );
  }

  // ===================================================
  // Generate Student ID
  // ===================================================

  const studentId = await generateStudentId();

  // ===================================================
  // Admission Date
  // ===================================================

  const finalAdmissionDate = admissionDate
    ? new Date(admissionDate)
    : new Date();

  if (
    Number.isNaN(
      finalAdmissionDate.getTime()
    )
  ) {
    throw new Error("Invalid admission date");
  }

  // ===================================================
  // Fee Values
  // ===================================================

  const feeValues = validateFeeValues({
    monthlyFee,
    openingDue,
    totalFee,
  });

  // ===================================================
  // Initial Fee Calculation
  // ===================================================

  const paidFee = 0;

  const dueFee = feeValues.openingDue;

  // ===================================================
  // Fee Start Date
  // ===================================================

  const feeStartDate =
    calculateFeeStartDate(
      finalAdmissionDate
    );

  // ===================================================
  // Create Student
  // ===================================================

  const student =
    await studentRepository.createStudent({
      studentId,

      admissionNo:
        admissionNo || "",

      name,

      fatherName,

      motherName:
        motherName || "",

      mobile,

      email:
        email || "",

      gender,

      dob:
        dob || null,

      className,

      section:
        section || "",

      address:
        address || "",

      admissionDate:
        finalAdmissionDate,

      monthlyFee:
        feeValues.monthlyFee,

      openingDue:
        feeValues.openingDue,

      totalFee:
        feeValues.totalFee,

      paidFee,

      dueFee,

      feeStartDate,

      status:
        "ACTIVE",

      isDeleted:
        false,

      createdBy:
        userId,

      updatedBy:
        userId,
    });

  return student;
};

// =====================================================
// Get All Students
// =====================================================

const getAllStudents = async () => {
  return await studentRepository.getAllStudents();
};

// =====================================================
// Get Student By ID
// =====================================================

const getStudentById = async (id) => {
  const student =
    await studentRepository.getStudentById(id);

  if (!student) {
    throw new Error("Student not found");
  }

  return student;
};

// =====================================================
// Update Student
// ADMIN ONLY
// =====================================================

const updateStudent = async (
  id,
  body,
  userId
) => {
  const student =
    await studentRepository.getStudentById(id);

  if (!student) {
    throw new Error("Student not found");
  }

  // ===================================================
  // Prevent Direct Fee Manipulation
  // ===================================================
  //
  // These values must only change through
  // proper fee/payment APIs.
  //
  // paidFee
  // dueFee
  // openingDue
  //
  // are protected from normal student update.
  // ===================================================

  const {
    paidFee,
    dueFee,
    studentId,
    isDeleted,
    createdBy,
    ...updateData
  } = body;

  // ===================================================
  // Prevent Manual Fee Manipulation
  // ===================================================

  delete updateData.paidFee;
  delete updateData.dueFee;

  // Opening due should also not be changed
  // through normal student update.

  delete updateData.openingDue;

  // ===================================================
  // Admission Date Validation
  // ===================================================

  if (updateData.admissionDate) {
    const newAdmissionDate =
      new Date(updateData.admissionDate);

    if (
      Number.isNaN(
        newAdmissionDate.getTime()
      )
    ) {
      throw new Error(
        "Invalid admission date"
      );
    }

    updateData.admissionDate =
      newAdmissionDate;

    // Recalculate fee start date
    updateData.feeStartDate =
      calculateFeeStartDate(
        newAdmissionDate
      );
  }

  // ===================================================
  // Validate Monthly Fee / Total Fee
  // ===================================================

  if (
    updateData.monthlyFee !== undefined ||
    updateData.totalFee !== undefined
  ) {
    const monthlyFee =
      updateData.monthlyFee !== undefined
        ? updateData.monthlyFee
        : student.monthlyFee;

    const totalFee =
      updateData.totalFee !== undefined
        ? updateData.totalFee
        : student.totalFee;

    const feeValues =
      validateFeeValues({
        monthlyFee,
        openingDue:
          student.openingDue,
        totalFee,
      });

    updateData.monthlyFee =
      feeValues.monthlyFee;

    updateData.totalFee =
      feeValues.totalFee;
  }

  // ===================================================
  // Duplicate Check
  // ===================================================

  const name =
    updateData.name ??
    student.name;

  const fatherName =
    updateData.fatherName ??
    student.fatherName;

  const motherName =
    updateData.motherName ??
    student.motherName;

  const className =
    updateData.className ??
    student.className;

  const admissionNo =
    updateData.admissionNo ??
    student.admissionNo;

  const existingStudent =
    await studentRepository.findByAdmissionNo(
      admissionNo,
      name,
      fatherName,
      motherName,
      className
    );

  if (
    existingStudent &&
    existingStudent._id.toString() !==
      student._id.toString()
  ) {
    throw new Error(
      "Another student with same details already exists"
    );
  }

  // ===================================================
  // Update User
  // ===================================================

  updateData.updatedBy = userId;

  // ===================================================
  // Update Student
  // ===================================================

  const updatedStudent =
    await studentRepository.updateStudent(
      id,
      updateData
    );

  if (!updatedStudent) {
    throw new Error(
      "Student update failed"
    );
  }

  return updatedStudent;
};

// =====================================================
// Delete Student
// ADMIN ONLY
// =====================================================

const deleteStudent = async (
  id,
  userId
) => {
  const student =
    await studentRepository.getStudentById(id);

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  const deletedStudent =
    await studentRepository.deleteStudent(
      id
    );

  if (!deletedStudent) {
    throw new Error(
      "Student delete failed"
    );
  }

  return deletedStudent;
};

// =====================================================
// Search Student For Payment
// PUBLIC
// =====================================================
//
// Student can search using:
// 1. Student ID
// 2. Mobile Number
//
// Only payment-related information is returned.
// =====================================================

const searchStudent = async (search) => {
  if (
    !search ||
    typeof search !== "string" ||
    !search.trim()
  ) {
    throw new Error(
      "Student ID or mobile number is required"
    );
  }

  const cleanSearch =
    search.trim();

  const student =
    await studentRepository.searchStudent(
      cleanSearch
    );

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  // ===================================================
  // Inactive Student Cannot Make Payment
  // ===================================================

  if (student.status !== "ACTIVE") {
    throw new Error(
      "Student account is inactive"
    );
  }

  // ===================================================
  // Public Response
  // ===================================================
  //
  // Do NOT expose:
  // - mobile
  // - email
  // - address
  // - dob
  // - createdBy
  // - updatedBy
  // - internal MongoDB fields
  //
  // ===================================================

  return {
    studentId:
      student.studentId,

    name:
      student.name,

    fatherName:
      student.fatherName,

    className:
      student.className,

    section:
      student.section,

    monthlyFee:
      Number(student.monthlyFee || 0),

    dueFee:
      Number(student.dueFee || 0),

    status:
      student.status,
  };
};

// =====================================================
// Export
// =====================================================

module.exports = {
  createStudent,

  getAllStudents,

  getStudentById,

  updateStudent,

  deleteStudent,

  searchStudent,

  calculateFeeStartDate,
};