const feeStructureRepository =
  require("../repositories/feeStructure.repository");

const studentRepository =
  require("../repositories/student.repository");

// =====================================================
// Allowed Fee Fields
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
// Validate Fee
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

const calculateTotalFee = (feeData) => {
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
// Build Fee Data
// =====================================================

const buildFeeData = (body) => {
  const feeData = {};

  for (const field of FEE_FIELDS) {
    feeData[field] = getFeeValue(
      body[field]
    );
  }

  return feeData;
};

// =====================================================
// Create Fee Structure
// =====================================================
// ADMIN ONLY
//
// Fee structure create hone ke baad
// agar us class ke students already hain,
// unko bhi fee structure apply hoga.
//

const createFeeStructure = async (
  body,
  userId
) => {
  const className =
    body.className?.trim();

  if (!className) {
    throw new Error(
      "Class name is required"
    );
  }

  // ---------------------------------------------------
  // Duplicate Class Check
  // ---------------------------------------------------

  const existing =
    await feeStructureRepository
      .getFeeStructureByClass(
        className
      );

  if (existing) {
    throw new Error(
      `Fee structure for class ${className} already exists`
    );
  }

  // ---------------------------------------------------
  // Fee Data
  // ---------------------------------------------------

  const feeData =
    buildFeeData(body);

  // ---------------------------------------------------
  // Create Structure
  // ---------------------------------------------------

  const feeStructure =
    await feeStructureRepository
      .createFeeStructure({
        className,

        ...feeData,

        createdBy: userId,

        updatedBy: userId,

        isActive: true,
      });

  // ---------------------------------------------------
  // Apply To Existing Students
  // ---------------------------------------------------

  const updatedStudents =
    await studentRepository
      .updateStudentsFeeByClass(
        className,
        feeData,
        userId
      );

  return {
    feeStructure:
      feeStructure.toObject(),

    totalFee:
      calculateTotalFee(
        feeData
      ),

    studentsUpdated:
      updatedStudents.length,
  };
};

// =====================================================
// Get All Fee Structures
// =====================================================

const getAllFeeStructures =
  async () => {
    const structures =
      await feeStructureRepository
        .getAllFeeStructures();

    return structures.map(
      (structure) => ({
        ...structure.toObject(),

        totalFee:
          calculateTotalFee(
            structure
          ),
      })
    );
  };

// =====================================================
// Get Fee Structure By ID
// =====================================================

const getFeeStructureById =
  async (id) => {
    const feeStructure =
      await feeStructureRepository
        .getFeeStructureById(id);

    if (!feeStructure) {
      throw new Error(
        "Fee structure not found"
      );
    }

    return {
      ...feeStructure.toObject(),

      totalFee:
        calculateTotalFee(
          feeStructure
        ),
    };
  };

// =====================================================
// Get Fee Structure By Class
// =====================================================

const getFeeStructureByClass =
  async (className) => {
    if (
      !className ||
      !className.trim()
    ) {
      throw new Error(
        "Class name is required"
      );
    }

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

    return {
      ...feeStructure.toObject(),

      totalFee:
        calculateTotalFee(
          feeStructure
        ),
    };
  };

// =====================================================
// Apply Fee Structure To Complete Class
// =====================================================
// ADMIN ONLY
//
// Existing paidFee preserve.
// Existing openingDue preserve.
// totalFee calculate.
// dueFee calculate.
//

const applyFeeStructureToClass =
  async (
    className,
    userId
  ) => {
    const cleanClassName =
      className?.trim();

    if (!cleanClassName) {
      throw new Error(
        "Class name is required"
      );
    }

    // -------------------------------------------------
    // Find Fee Structure
    // -------------------------------------------------

    const feeStructure =
      await feeStructureRepository
        .getFeeStructureByClass(
          cleanClassName
        );

    if (!feeStructure) {
      throw new Error(
        `Fee structure for class ${cleanClassName} not found`
      );
    }

    // -------------------------------------------------
    // Fee Data
    // -------------------------------------------------

    const feeData = {};

    for (const field of FEE_FIELDS) {
      feeData[field] =
        Number(
          feeStructure[field] || 0
        );
    }

    // -------------------------------------------------
    // Update All Students
    // -------------------------------------------------

    const updatedStudents =
      await studentRepository
        .updateStudentsFeeByClass(
          cleanClassName,
          feeData,
          userId
        );

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return {
      className:
        cleanClassName,

      feeStructure:
        feeStructure.toObject(),

      totalFee:
        calculateTotalFee(
          feeData
        ),

      studentsUpdated:
        updatedStudents.length,

      students:
        updatedStudents,
    };
  };

// =====================================================
// Update Fee Structure
// =====================================================
// ADMIN ONLY
//
// Example:
//
// PUT /fee-structures/:id
//
// {
//   "monthlyFee": 2000,
//   "examFee": 500
// }
//
// Same class ke saare students update honge.
//

const updateFeeStructure =
  async (
    id,
    body,
    userId
  ) => {
    // -------------------------------------------------
    // Existing Structure
    // -------------------------------------------------

    const existing =
      await feeStructureRepository
        .getFeeStructureById(id);

    if (!existing) {
      throw new Error(
        "Fee structure not found"
      );
    }

    const oldClassName =
      existing.className;

    // -------------------------------------------------
    // New Class
    // -------------------------------------------------

    const newClassName =
      body.className !== undefined
        ? body.className.trim()
        : oldClassName;

    if (!newClassName) {
      throw new Error(
        "Class name cannot be empty"
      );
    }

    // -------------------------------------------------
    // Duplicate Class
    // -------------------------------------------------

    if (
      newClassName !==
      oldClassName
    ) {
      const duplicate =
        await feeStructureRepository
          .getFeeStructureByClass(
            newClassName
          );

      if (duplicate) {
        throw new Error(
          `Fee structure for class ${newClassName} already exists`
        );
      }
    }

    // -------------------------------------------------
    // Prepare Fee Data
    // -------------------------------------------------
    //
    // Jo field nahi bheja gaya,
    // uski old value preserve hogi.
    //

    const feeData = {};

    for (const field of FEE_FIELDS) {
      if (
        body[field] !== undefined
      ) {
        feeData[field] =
          getFeeValue(
            body[field]
          );
      } else {
        feeData[field] =
          Number(
            existing[field] || 0
          );
      }
    }

    // -------------------------------------------------
    // Update Data
    // -------------------------------------------------

    const updateData = {
      ...feeData,

      updatedBy: userId,
    };

    if (
      body.className !== undefined
    ) {
      updateData.className =
        newClassName;
    }

    // -------------------------------------------------
    // Update Fee Structure
    // -------------------------------------------------

    const updated =
      await feeStructureRepository
        .updateFeeStructure(
          id,
          updateData
        );

    if (!updated) {
      throw new Error(
        "Fee structure update failed"
      );
    }

    // -------------------------------------------------
    // Apply New Fee To Students
    // -------------------------------------------------
    //
    // IMPORTANT:
    //
    // Same class:
    // → same class students update
    //
    // Class name changed:
    // → new class students update
    //
    // Existing students automatically
    // old class se new class me move nahi honge.
    //

    const targetClass =
      newClassName;

    const updatedStudents =
      await studentRepository
        .updateStudentsFeeByClass(
          targetClass,
          feeData,
          userId
        );

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return {
      feeStructure:
        updated.toObject(),

      totalFee:
        calculateTotalFee(
          feeData
        ),

      previousClass:
        oldClassName,

      updatedClass:
        newClassName,

      studentsUpdated:
        updatedStudents.length,
    };
  };

// =====================================================
// Update Individual Student Fees
// =====================================================
// ADMIN ONLY
//
// Example:
//
// PUT /fee-structures/student/STU001
//
// {
//   "monthlyFee": 1200,
//   "examFee": 500
// }
//
// Sirf selected student update hoga.
//

const updateIndividualStudentFees =
  async (
    studentId,
    body,
    userId
  ) => {
    const cleanStudentId =
      studentId?.trim();

    if (!cleanStudentId) {
      throw new Error(
        "Student ID is required"
      );
    }

    // -------------------------------------------------
    // Check At Least One Fee
    // -------------------------------------------------

    const hasFeeField =
      FEE_FIELDS.some(
        (field) =>
          body[field] !== undefined
      );

    if (!hasFeeField) {
      throw new Error(
        "At least one fee field is required"
      );
    }

    // -------------------------------------------------
    // Build Fee Data
    // -------------------------------------------------

    const feeData = {};

    for (const field of FEE_FIELDS) {
      if (
        body[field] !== undefined
      ) {
        feeData[field] =
          getFeeValue(
            body[field]
          );
      }
    }

    // -------------------------------------------------
    // Update Student
    // -------------------------------------------------

    const student =
      await studentRepository
        .updateIndividualStudentFees(
          cleanStudentId,
          feeData,
          userId
        );

    if (!student) {
      throw new Error(
        "Student not found"
      );
    }

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

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
// Delete Fee Structure
// =====================================================

const deleteFeeStructure =
  async (
    id,
    userId
  ) => {
    const existing =
      await feeStructureRepository
        .getFeeStructureById(id);

    if (!existing) {
      throw new Error(
        "Fee structure not found"
      );
    }

    const deleted =
      await feeStructureRepository
        .deleteFeeStructure(id);

    if (!deleted) {
      throw new Error(
        "Fee structure delete failed"
      );
    }

    return deleted;
  };

// =====================================================
// Export
// =====================================================

module.exports = {
  createFeeStructure,

  getAllFeeStructures,

  getFeeStructureById,

  getFeeStructureByClass,

  applyFeeStructureToClass,

  updateFeeStructure,

  updateIndividualStudentFees,

  deleteFeeStructure,

  calculateTotalFee,
};