const studentRepository =
  require("../repositories/student.repository");

const feeStructureRepository =
  require("../repositories/feeStructure.repository");

const generateStudentId =
  require("../utils/generateStudentId");

// =====================================================
// Fee Fields
// =====================================================

const FEE_FIELDS = [
  "admissionFee",
  "monthlyFee",
  "examFee",
  "sportFee",
  "computerFee",
  "functionFee",
  "smartClassFee",
  "otherCharges",
];

// =====================================================
// Get Fee Value
// =====================================================

const getFeeValue = (value) => {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    throw new Error(
      "Fee amount must be a valid number"
    );
  }

  if (amount < 0) {
    throw new Error(
      "Fee amount cannot be negative"
    );
  }

  return amount;
};

// =====================================================
// Calculate Fee Heads Total
// =====================================================

const calculateFeeHeadsTotal = (data) => {
  return FEE_FIELDS.reduce(
    (total, field) => {
      return (
        total +
        Number(data[field] || 0)
      );
    },
    0
  );
};

// =====================================================
// Calculate Student Total Fee
// =====================================================
//
// Total Fee:
//
// All Fee Heads + Opening Due
//
// =====================================================

const calculateStudentTotalFee = (
  data
) => {
  const feeHeadsTotal =
    calculateFeeHeadsTotal(data);

  const openingDue =
    Number(data.openingDue || 0);

  return (
    feeHeadsTotal +
    openingDue
  );
};

// =====================================================
// Calculate Due Fee
// =====================================================
//
// Due = Total Fee - Paid Fee
//
// Due kabhi negative nahi hoga.
//

const calculateDueFee = (
  totalFee,
  paidFee
) => {
  return Math.max(
    Number(totalFee || 0) -
      Number(paidFee || 0),
    0
  );
};

// =====================================================
// Build Student Fee Data
// =====================================================
//
// Create ke time agar fee field nahi diya gaya
// to 0 consider hoga.
//

const buildCreateFeeData = (
  body
) => {
  const feeData = {};

  for (const field of FEE_FIELDS) {
    feeData[field] =
      getFeeValue(body[field]);
  }

  feeData.openingDue =
    getFeeValue(
      body.openingDue
    );

  return feeData;
};

// =====================================================
// Calculate Fee Start Date
// =====================================================

const calculateFeeStartDate = (
  admissionDate
) => {
  const date = new Date(
    admissionDate || Date.now()
  );

  // ===================================================
  // TEST MODE
  // ===================================================

  if (
    process.env.TEST_FEE_MODE ===
    "true"
  ) {
    return new Date();
  }

  // ===================================================
  // PRODUCTION MODE
  //
  // Fee starts from admission date.
  // ===================================================

  return date;
};

// =====================================================
// Create Student
// =====================================================

const createStudent = async (
  body,
  userId
) => {
  // ===================================================
  // Basic Values
  // ===================================================

  const name =
    body.name?.trim();

  const fatherName =
    body.fatherName?.trim();

  const motherName =
    body.motherName?.trim() || "";

  const className =
    body.className?.trim();

  const admissionNo =
    body.admissionNo?.trim();

  // ===================================================
  // Basic Validation
  // ===================================================

  if (!name) {
    throw new Error(
      "Student name is required"
    );
  }

  if (!fatherName) {
    throw new Error(
      "Father name is required"
    );
  }

  if (!className) {
    throw new Error(
      "Class is required"
    );
  }

  // ===================================================
  // Duplicate Student Check
  // ===================================================

  const duplicate =
    await studentRepository.findByAdmissionNo(
      admissionNo,
      name,
      fatherName,
      motherName,
      className
    );

  if (duplicate) {
    if (
      admissionNo &&
      duplicate.admissionNo ===
        admissionNo
    ) {
      throw new Error(
        `Student with admission number ${admissionNo} already exists`
      );
    }

    throw new Error(
      "Student with same name, father name, mother name and class already exists"
    );
  }

  // ===================================================
  // Generate Student ID
  // ===================================================

  const studentId =
    await generateStudentId();

  // ===================================================
  // Fee Data
  // ===================================================

  const feeData =
    buildCreateFeeData(body);

  // ===================================================
  // Calculate Total Fee
  // ===================================================

  const totalFee =
    calculateStudentTotalFee(
      feeData
    );

  // ===================================================
  // New Student Paid Fee
  // ===================================================

  const paidFee = 0;

  // ===================================================
  // Calculate Due
  // ===================================================

  const dueFee =
    calculateDueFee(
      totalFee,
      paidFee
    );

  // ===================================================
  // Admission Date
  // ===================================================

  const admissionDate =
    body.admissionDate
      ? new Date(
          body.admissionDate
        )
      : new Date();

  // ===================================================
  // Fee Start Date
  // ===================================================

  const feeStartDate =
    calculateFeeStartDate(
      admissionDate
    );

  // ===================================================
  // Create Student
  // ===================================================

  const student =
    await studentRepository.createStudent(
      {
        studentId,

        admissionNo,

        name,

        fatherName,

        motherName,

        mobile:
          body.mobile?.trim(),

        email:
          body.email?.trim() || "",

        gender:
          body.gender,

        dob:
          body.dob
            ? new Date(body.dob)
            : undefined,

        className,

        section:
          body.section?.trim() || "",

        address:
          body.address?.trim() || "",

        admissionDate,

        // =============================================
        // Fee Heads
        // =============================================

        admissionFee:
          feeData.admissionFee,

        monthlyFee:
          feeData.monthlyFee,

        examFee:
          feeData.examFee,

        sportFee:
          feeData.sportFee,

        computerFee:
          feeData.computerFee,

        functionFee:
          feeData.functionFee,

        smartClassFee:
          feeData.smartClassFee,

        otherCharges:
          feeData.otherCharges,

        // =============================================
        // Fee Summary
        // =============================================

        openingDue:
          feeData.openingDue,

        totalFee,

        paidFee,

        dueFee,

        feeStartDate,

        // =============================================
        // Status
        // =============================================

        status: "ACTIVE",

        isDeleted: false,

        // =============================================
        // User
        // =============================================

        createdBy: userId,

        updatedBy: userId,
      }
    );

  return student;
};

// =====================================================
// Get All Students
// =====================================================

const getAllStudents = async () => {
  return await studentRepository
    .getAllStudents();
};

// =====================================================
// Get Student By ID
// =====================================================

const getStudentById = async (
  id
) => {
  const student =
    await studentRepository
      .getStudentById(id);

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  return student;
};

// =====================================================
// Update Student
// =====================================================
//
// Student information + fee heads update.
//
// IMPORTANT:
//
// paidFee direct update allowed nahi hai.
//
// Fee change hone par:
//
// totalFee = fee heads + openingDue
//
// dueFee = totalFee - existing paidFee
//
// =====================================================

const updateStudent = async (
  id,
  body,
  userId
) => {
  // ===================================================
  // Existing Student
  // ===================================================

  const existing =
    await studentRepository
      .getStudentById(id);

  if (!existing) {
    throw new Error(
      "Student not found"
    );
  }

  // ===================================================
  // Duplicate Check
  // ===================================================

  const newName =
    body.name !== undefined
      ? body.name.trim()
      : existing.name;

  const newFatherName =
    body.fatherName !== undefined
      ? body.fatherName.trim()
      : existing.fatherName;

  const newMotherName =
    body.motherName !== undefined
      ? body.motherName.trim()
      : existing.motherName || "";

  const newClassName =
    body.className !== undefined
      ? body.className.trim()
      : existing.className;

  const newAdmissionNo =
    body.admissionNo !== undefined
      ? body.admissionNo.trim()
      : existing.admissionNo;

  // ===================================================
  // Check Duplicate
  // ===================================================

  const duplicate =
    await studentRepository.findByAdmissionNo(
      newAdmissionNo,
      newName,
      newFatherName,
      newMotherName,
      newClassName
    );

  if (
    duplicate &&
    duplicate._id.toString() !==
      existing._id.toString()
  ) {
    throw new Error(
      "Another student with same details already exists"
    );
  }

  // ===================================================
  // Prepare Update Data
  // ===================================================

  const updateData = {};

  // ===================================================
  // Basic Fields
  // ===================================================

  if (
    body.admissionNo !== undefined
  ) {
    updateData.admissionNo =
      newAdmissionNo;
  }

  if (
    body.name !== undefined
  ) {
    updateData.name =
      newName;
  }

  if (
    body.fatherName !== undefined
  ) {
    updateData.fatherName =
      newFatherName;
  }

  if (
    body.motherName !== undefined
  ) {
    updateData.motherName =
      newMotherName;
  }

  if (
    body.mobile !== undefined
  ) {
    updateData.mobile =
      body.mobile.trim();
  }

  if (
    body.email !== undefined
  ) {
    updateData.email =
      body.email.trim();
  }

  if (
    body.gender !== undefined
  ) {
    updateData.gender =
      body.gender;
  }

  if (
    body.dob !== undefined
  ) {
    updateData.dob =
      body.dob
        ? new Date(body.dob)
        : undefined;
  }

  if (
    body.className !== undefined
  ) {
    updateData.className =
      newClassName;
  }

  if (
    body.section !== undefined
  ) {
    updateData.section =
      body.section.trim();
  }

  if (
    body.address !== undefined
  ) {
    updateData.address =
      body.address.trim();
  }

  if (
    body.admissionDate !== undefined
  ) {
    updateData.admissionDate =
      new Date(
        body.admissionDate
      );

    updateData.feeStartDate =
      calculateFeeStartDate(
        updateData.admissionDate
      );
  }

  // ===================================================
  // Current Fee Values
  // ===================================================

  const currentFeeData = {};

  for (const field of FEE_FIELDS) {
    currentFeeData[field] =
      Number(
        existing[field] || 0
      );
  }

  // ===================================================
  // Update Fee Heads
  // ===================================================

  let feeChanged = false;

  for (const field of FEE_FIELDS) {
    if (
      body[field] !== undefined
    ) {
      currentFeeData[field] =
        getFeeValue(
          body[field]
        );

      feeChanged = true;
    }
  }

  // ===================================================
  // Opening Due
  // ===================================================

  let openingDue =
    Number(
      existing.openingDue || 0
    );

  if (
    body.openingDue !== undefined
  ) {
    openingDue =
      getFeeValue(
        body.openingDue
      );

    feeChanged = true;
  }

  // ===================================================
  // Recalculate Fee
  // ===================================================

  if (feeChanged) {
    const totalFee =
      calculateStudentTotalFee({
        ...currentFeeData,
        openingDue,
      });

    const paidFee =
      Number(
        existing.paidFee || 0
      );

    const dueFee =
      calculateDueFee(
        totalFee,
        paidFee
      );

    // ================================================
    // Set Fee Heads
    // ================================================

    for (
      const field of FEE_FIELDS
    ) {
      updateData[field] =
        currentFeeData[field];
    }

    updateData.openingDue =
      openingDue;

    updateData.totalFee =
      totalFee;

    updateData.dueFee =
      dueFee;
  }

  // ===================================================
  // Updated By
  // ===================================================

  updateData.updatedBy =
    userId;

  // ===================================================
  // Update Student
  // ===================================================

  const updatedStudent =
    await studentRepository
      .updateStudent(
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
// =====================================================

const deleteStudent = async (
  id,
  userId
) => {
  const student =
    await studentRepository
      .getStudentById(id);

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  const deleted =
    await studentRepository
      .deleteStudent(id);

  if (!deleted) {
    throw new Error(
      "Student delete failed"
    );
  }

  return deleted;
};

// =====================================================
// Search Student
// =====================================================
//
// Public fee payment page.
//
// Search by:
// 1. Student ID
// 2. Mobile
//
// =====================================================

const searchStudent = async (
  search
) => {
  if (
    !search ||
    !search.trim()
  ) {
    throw new Error(
      "Student ID or mobile number is required"
    );
  }

  const student =
    await studentRepository
      .searchStudent(
        search.trim()
      );

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  return student;
};

// =====================================================
// Update Fee After Payment
// =====================================================
//
// IMPORTANT:
//
// This function should ONLY be used
// from fee collection/payment flow.
//
// paidFee and dueFee are updated together.
//

const updateFee = async (
  id,
  paidFee,
  dueFee
) => {
  const student =
    await studentRepository
      .getStudentById(id);

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  const newPaidFee =
    getFeeValue(paidFee);

  const newDueFee =
    getFeeValue(dueFee);

  return await studentRepository
    .updateFee(
      id,
      newPaidFee,
      newDueFee
    );
};

// =====================================================
// Update Due Fee
// =====================================================
//
// Internal use only.
//
// =====================================================

const updateDueFee = async (
  id,
  dueFee
) => {
  const student =
    await studentRepository
      .getStudentById(id);

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  const newDueFee =
    getFeeValue(dueFee);

  return await studentRepository
    .updateDueFee(
      id,
      newDueFee
    );
};

// =====================================================
// Get Students By Class
// =====================================================

const getStudentsByClass = async (
  className
) => {
  if (
    !className ||
    !className.trim()
  ) {
    throw new Error(
      "Class name is required"
    );
  }

  return await studentRepository
    .getStudentsByClass(
      className.trim()
    );
};

// =====================================================
// Apply Fee Structure To Class
// =====================================================
//
// FeeStructure se class ke all students
// ki fee update karega.
//
// Existing paidFee preserve rahega.
//
// =====================================================

const applyFeeStructureToClass =
  async (
    className,
    userId
  ) => {
    if (
      !className ||
      !className.trim()
    ) {
      throw new Error(
        "Class name is required"
      );
    }

    // =================================================
    // Get Fee Structure
    // =================================================

    const feeStructure =
      await feeStructureRepository
        .getFeeStructureByClass(
          className.trim()
        );

    if (!feeStructure) {
      throw new Error(
        `Fee structure for class ${className} not found`
      );
    }

    // =================================================
    // Fee Data
    // =================================================

    const feeData = {};

    for (
      const field of FEE_FIELDS
    ) {
      feeData[field] =
        Number(
          feeStructure[field] || 0
        );
    }

    // =================================================
    // Update Students
    // =================================================

    const students =
      await studentRepository
        .updateStudentsFeeByClass(
          className.trim(),
          feeData,
          userId
        );

    return {
      className:
        className.trim(),

      feeStructure,

      studentsUpdated:
        students.length,

      students,
    };
  };

// =====================================================
// Update Individual Student Fees
// =====================================================
//
// Selected student ki fee update.
//
// =====================================================

const updateIndividualStudentFees =
  async (
    studentId,
    feeData,
    userId
  ) => {
    if (
      !studentId ||
      !studentId.trim()
    ) {
      throw new Error(
        "Student ID is required"
      );
    }

    const allowedFeeData = {};

    for (
      const field of FEE_FIELDS
    ) {
      if (
        feeData[field] !== undefined
      ) {
        allowedFeeData[field] =
          getFeeValue(
            feeData[field]
          );
      }
    }

    if (
      Object.keys(
        allowedFeeData
      ).length === 0
    ) {
      throw new Error(
        "At least one fee field is required"
      );
    }

    const student =
      await studentRepository
        .updateIndividualStudentFees(
          studentId.trim(),
          allowedFeeData,
          userId
        );

    if (!student) {
      throw new Error(
        "Student not found"
      );
    }

    return {
      student,

      totalFee:
        Number(
          student.totalFee || 0
        ),

      paidFee:
        Number(
          student.paidFee || 0
        ),

      dueFee:
        Number(
          student.dueFee || 0
        ),
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

  updateFee,

  updateDueFee,

  getStudentsByClass,

  applyFeeStructureToClass,

  updateIndividualStudentFees,

  calculateFeeHeadsTotal,

  calculateStudentTotalFee,

  calculateDueFee,
};