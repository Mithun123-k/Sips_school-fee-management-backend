const studentRepository = require("../repositories/student.repository");

const generateStudentId = require("../utils/generateStudentId");

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
// Validate Fee Value
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
// Calculate Fee Total
// =====================================================
//
// Only 8 fee heads are included here.
// Opening due is added separately.
//

const calculateFeeHeadsTotal = (feeData) => {
  return FEE_FIELDS.reduce(
    (total, field) => {
      return (
        total +
        Number(feeData[field] || 0)
      );
    },
    0
  );
};

// =====================================================
// Get Fee Data From Request
// =====================================================
//
// Create Student:
//
// If fee field is not sent,
// its value will be 0.
//
// Example:
//
// {
//   admissionFee: 2000,
//   monthlyFee: 1500
// }
//
// Remaining fee heads = 0
//

const buildFeeData = (data) => {
  const feeData = {};

  for (const field of FEE_FIELDS) {
    feeData[field] =
      data[field] !== undefined
        ? getFeeValue(data[field])
        : 0;
  }

  return feeData;
};

// =====================================================
// Calculate Student Fee
// =====================================================
//
// totalFee
// = all fee heads + openingDue
//
// dueFee
// = totalFee - paidFee
//
// paidFee is normally 0 when creating student.
//

const calculateStudentFee = ({
  feeData,
  openingDue = 0,
  paidFee = 0,
}) => {
  const feeHeadsTotal =
    calculateFeeHeadsTotal(
      feeData
    );

  const safeOpeningDue =
    getFeeValue(openingDue);

  const safePaidFee =
    getFeeValue(paidFee);

  const totalFee =
    feeHeadsTotal +
    safeOpeningDue;

  const dueFee = Math.max(
    totalFee - safePaidFee,
    0
  );

  return {
    totalFee,
    paidFee: safePaidFee,
    dueFee,
  };
};

// =====================================================
// Calculate Fee Start Date
// =====================================================

const calculateFeeStartDate = (
  admissionDate
) => {
  const date = new Date(
    admissionDate
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
  // ===================================================
  //
  // Fee starts from admission date.
  //

  return date;
};

// =====================================================
// Create Student
// =====================================================

const createStudent = async (
  data,
  userId
) => {
  // ===================================================
  // Basic Values
  // ===================================================

  const name =
    data.name?.trim();

  const fatherName =
    data.fatherName?.trim();

  const motherName =
    data.motherName?.trim() || "";

  const className =
    data.className?.trim();

  const admissionNo =
    data.admissionNo?.trim() || "";

  // ===================================================
  // Required Validation
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

  const existing =
    await studentRepository
      .findByAdmissionNo(
        admissionNo,
        name,
        fatherName,
        motherName,
        className
      );

  if (existing) {
    if (
      admissionNo &&
      existing.admissionNo ===
        admissionNo
    ) {
      throw new Error(
        "Student with this admission number already exists"
      );
    }

    throw new Error(
      "Student already exists with same name, father name, mother name and class"
    );
  }

  // ===================================================
  // Generate Student ID
  // ===================================================

  const studentId =
    await generateStudentId();

  // ===================================================
  // Admission Date
  // ===================================================

  const admissionDate =
    data.admissionDate
      ? new Date(data.admissionDate)
      : new Date();

  // ===================================================
  // Fee Start Date
  // ===================================================

  const feeStartDate =
    calculateFeeStartDate(
      admissionDate
    );

  // ===================================================
  // Build Fee Heads
  // ===================================================
  //
  // IMPORTANT:
  //
  // Create Student API se jo fee values
  // aayengi wahi save hongi.
  //
  // FeeStructure ko automatically override
  // nahi kiya ja raha.
  //

  const feeData =
    buildFeeData(data);

  // ===================================================
  // Opening Due
  // ===================================================

  const openingDue =
    data.openingDue !== undefined
      ? getFeeValue(
          data.openingDue
        )
      : 0;

  // ===================================================
  // Paid Fee
  // ===================================================
  //
  // Normally create student par 0.
  //
  // Direct paidFee ko allow karna ho to
  // validator/service policy ke according
  // change kiya ja sakta hai.
  //

  const paidFee = 0;

  // ===================================================
  // Calculate Total + Due
  // ===================================================

  const calculatedFee =
    calculateStudentFee({
      feeData,
      openingDue,
      paidFee,
    });

  // ===================================================
  // Create Student Data
  // ===================================================

  const studentData = {
    // ===============================
    // Student ID
    // ===============================

    studentId,

    // ===============================
    // Basic Information
    // ===============================

    admissionNo,

    name,

    fatherName,

    motherName,

    mobile:
      data.mobile?.trim(),

    email:
      data.email?.trim() || "",

    gender:
      data.gender,

    dob:
      data.dob
        ? new Date(data.dob)
        : undefined,

    className,

    section:
      data.section?.trim() || "",

    address:
      data.address?.trim() || "",

    // ===============================
    // Admission Information
    // ===============================

    admissionDate,

    feeStartDate,

    // ===============================
    // Fee Heads
    // ===============================

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

    // ===============================
    // Fee Calculation
    // ===============================

    openingDue,

    totalFee:
      calculatedFee.totalFee,

    paidFee:
      calculatedFee.paidFee,

    dueFee:
      calculatedFee.dueFee,

    // ===============================
    // Status
    // ===============================

    status:
      data.status || "ACTIVE",

    isDeleted: false,

    // ===============================
    // User Tracking
    // ===============================

    createdBy: userId,

    updatedBy: userId,
  };

  // ===================================================
  // Create
  // ===================================================

  const student =
    await studentRepository
      .createStudent(
        studentData
      );

  return student;
};

// =====================================================
// Get Student By Student ID
// =====================================================

const getStudentByStudentId =
  async (studentId) => {
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
// Get Student By Mongo ID
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
// Student basic information + individual fee heads
// can be updated.
//
// paidFee / dueFee direct update nahi hoga.
//
// Fee fields update hone par:
// totalFee + dueFee automatically recalculate honge.
//

const updateStudent = async (
  id,
  data,
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
  // Basic Update Data
  // ===================================================

  const updateData = {};

  // ===================================================
  // Admission Number
  // ===================================================

  if (
    data.admissionNo !==
    undefined
  ) {
    updateData.admissionNo =
      data.admissionNo
        ?.trim() || "";
  }

  // ===================================================
  // Name
  // ===================================================

  if (
    data.name !== undefined
  ) {
    updateData.name =
      data.name.trim();
  }

  // ===================================================
  // Father Name
  // ===================================================

  if (
    data.fatherName !==
    undefined
  ) {
    updateData.fatherName =
      data.fatherName.trim();
  }

  // ===================================================
  // Mother Name
  // ===================================================

  if (
    data.motherName !==
    undefined
  ) {
    updateData.motherName =
      data.motherName
        ?.trim() || "";
  }

  // ===================================================
  // Mobile
  // ===================================================

  if (
    data.mobile !== undefined
  ) {
    updateData.mobile =
      data.mobile.trim();
  }

  // ===================================================
  // Email
  // ===================================================

  if (
    data.email !== undefined
  ) {
    updateData.email =
      data.email?.trim() || "";
  }

  // ===================================================
  // Gender
  // ===================================================

  if (
    data.gender !== undefined
  ) {
    updateData.gender =
      data.gender;
  }

  // ===================================================
  // DOB
  // ===================================================

  if (
    data.dob !== undefined
  ) {
    updateData.dob =
      data.dob
        ? new Date(data.dob)
        : undefined;
  }

  // ===================================================
  // Class
  // ===================================================

  if (
    data.className !==
    undefined
  ) {
    updateData.className =
      data.className.trim();
  }

  // ===================================================
  // Section
  // ===================================================

  if (
    data.section !== undefined
  ) {
    updateData.section =
      data.section?.trim() || "";
  }

  // ===================================================
  // Address
  // ===================================================

  if (
    data.address !== undefined
  ) {
    updateData.address =
      data.address?.trim() || "";
  }

  // ===================================================
  // Admission Date
  // ===================================================

  if (
    data.admissionDate !==
    undefined
  ) {
    const admissionDate =
      new Date(
        data.admissionDate
      );

    updateData.admissionDate =
      admissionDate;

    // Fee start date is updated
    // along with admission date.
    updateData.feeStartDate =
      calculateFeeStartDate(
        admissionDate
      );
  }

  // ===================================================
  // Status
  // ===================================================

  if (
    data.status !== undefined
  ) {
    updateData.status =
      data.status;
  }

  // ===================================================
  // Fee Fields
  // =====================================================
  //
  // Only sent fee heads are updated.
  //
  // Example:
  //
  // {
  //   monthlyFee: 1800
  // }
  //
  // Only monthlyFee changes.
  // Remaining fee heads stay unchanged.
  //

  let feeChanged = false;

  for (
    const field of FEE_FIELDS
  ) {
    if (
      data[field] !==
      undefined
    ) {
      updateData[field] =
        getFeeValue(
          data[field]
        );

      feeChanged = true;
    }
  }

  // ===================================================
  // Recalculate Fee
  // ===================================================

  if (feeChanged) {
    const feeData = {};

    for (
      const field of FEE_FIELDS
    ) {
      feeData[field] =
        updateData[field] !==
        undefined
          ? Number(
              updateData[field]
            )
          : Number(
              existing[field] ||
                0
            );
    }

    const openingDue =
      data.openingDue !==
      undefined
        ? getFeeValue(
            data.openingDue
          )
        : Number(
            existing.openingDue ||
              0
          );

    const paidFee =
      Number(
        existing.paidFee || 0
      );

    const calculatedFee =
      calculateStudentFee({
        feeData,
        openingDue,
        paidFee,
      });

    updateData.openingDue =
      openingDue;

    updateData.totalFee =
      calculatedFee.totalFee;

    updateData.dueFee =
      calculatedFee.dueFee;
  }

  // ===================================================
  // Opening Due Only Update
  // ===================================================

  if (
    data.openingDue !==
      undefined &&
    !feeChanged
  ) {
    const openingDue =
      getFeeValue(
        data.openingDue
      );

    const feeData = {};

    for (
      const field of FEE_FIELDS
    ) {
      feeData[field] =
        Number(
          existing[field] ||
            0
        );
    }

    const paidFee =
      Number(
        existing.paidFee || 0
      );

    const calculatedFee =
      calculateStudentFee({
        feeData,
        openingDue,
        paidFee,
      });

    updateData.openingDue =
      openingDue;

    updateData.totalFee =
      calculatedFee.totalFee;

    updateData.dueFee =
      calculatedFee.dueFee;
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

  const deletedStudent =
    await studentRepository
      .deleteStudent(id);

  if (!deletedStudent) {
    throw new Error(
      "Student delete failed"
    );
  }

  return deletedStudent;
};

// =====================================================
// Search Student
// =====================================================
//
// Public fee payment page.
//
// Search by:
// Student ID / Mobile
//

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
// Update Paid Fee + Due Fee
// =====================================================
//
// Used ONLY by fee collection/payment flow.
//
// Do not use this for fee structure changes.
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

  const safePaidFee =
    getFeeValue(paidFee);

  const safeDueFee =
    getFeeValue(dueFee);

  return await studentRepository
    .updateFee(
      id,
      safePaidFee,
      safeDueFee
    );
};

// =====================================================
// Update Due Fee
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

  const safeDueFee =
    getFeeValue(dueFee);

  return await studentRepository
    .updateDueFee(
      id,
      safeDueFee
    );
};

// =====================================================
// Get Students By Class
// =====================================================

const getStudentsByClass =
  async (className) => {
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
// Update All Students Fee By Class
// =====================================================
//
// Used by FeeStructure.
//
// Class ke saare ACTIVE students ke
// fee heads update honge.
//
// Existing paidFee preserve rahega.
// Existing openingDue preserve rahega.
//

const updateStudentsFeeByClass =
  async (
    className,
    feeData,
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

    const completeFeeData =
      buildFeeData(
        feeData
      );

    return await studentRepository
      .updateStudentsFeeByClass(
        className.trim(),
        completeFeeData,
        userId
      );
  };

// =====================================================
// Update Individual Student Fees
// =====================================================
//
// Used by FeeStructure / Admin.
//
// Example:
//
// {
//   monthlyFee: 1200,
//   examFee: 500
// }
//
// Sirf selected student's fee change hogi.
//

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

    const hasFeeField =
      FEE_FIELDS.some(
        (field) =>
          feeData[field] !==
          undefined
      );

    if (!hasFeeField) {
      throw new Error(
        "At least one fee field is required"
      );
    }

    const validatedFeeData =
      {};

    for (
      const field of FEE_FIELDS
    ) {
      if (
        feeData[field] !==
        undefined
      ) {
        validatedFeeData[
          field
        ] = getFeeValue(
          feeData[field]
        );
      }
    }

    const student =
      await studentRepository
        .updateIndividualStudentFees(
          studentId.trim(),
          validatedFeeData,
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
  // Student CRUD
  createStudent,
  getStudentByStudentId,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,

  // Public search
  searchStudent,

  // Payment fee
  updateFee,
  updateDueFee,

  // Class-wise fee
  getStudentsByClass,
  updateStudentsFeeByClass,

  // Individual fee
  updateIndividualStudentFees,

  // Helpers
  calculateFeeHeadsTotal,
  calculateStudentFee,
}; 