// const studentRepository =
//   require("../repositories/student.repository");

// const feeRepository =
//   require("../repositories/fee.repository");

// const feeStructureRepository =
//   require("../repositories/feeStructure.repository");

// const generateStudentId =
//   require("../utils/generateStudentId");

// const generateAdmissionNo =
//   require("../utils/generateAdmission");

// const {
//   getLumpSumPreview,
//   calculateFeeByHead,
// } = require("./fee.service");

// const {
//   getFeeSnapshot,
//   getNextFeePeriodStart,
//   getFeeSnapshotForDate,
// } = require(
//   "../utils/studentPromotionFee"
// );

// // =====================================================
// // Constants
// // =====================================================

// const ALLOWED_FEE_DISCOUNT_TYPES = [
//   "NONE",
//   "SIBLING",
//   "RTE",
//   "GIRL",
// ];

// const FEE_HEADS = [
//   "admissionFee",
//   "monthlyFee",
//   "examFee",
//   "sportFee",
//   "computerFee",
//   "functionFee",
//   "smartClassFee",
//   "otherCharges",
// ];

// // =====================================================
// // Calculate Fee Start Date
// // =====================================================
// //
// // Production:
// //
// // Admission Date = 15 July
// // Fee Start Date  = 01 August
// //
// // Test Mode:
// //
// // 1 minute = 1 month
// //
// // =====================================================

// const calculateFeeStartDate = (
//   admissionDate,
//   feeStartFrom = "NEXT_MONTH"
// ) => {
//   const date =
//     new Date(admissionDate);

//   if (
//     Number.isNaN(
//       date.getTime()
//     )
//   ) {
//     throw new Error(
//       "Invalid admission date"
//     );
//   }

//   // ===================================================
//   // TEST MODE
//   // ===================================================

//   if (
//     process.env.TEST_FEE_MODE ===
//     "true"
//   ) {
//     return new Date();
//   }

//   // ===================================================
//   // PRODUCTION MODE
//   // ===================================================

//   if (
//     feeStartFrom ===
//     "ADMISSION_DATE"
//   ) {
//     return new Date(
//       date.getFullYear(),
//       date.getMonth(),
//       date.getDate()
//     );
//   }

//   return new Date(
//     date.getFullYear(),
//     date.getMonth() + 1,
//     1
//   );
// };

// // =====================================================
// // Validate Fee Discount Type
// // =====================================================

// const validateFeeDiscountType = (
//   feeDiscountType
// ) => {
//   const finalDiscountType =
//     feeDiscountType || "NONE";

//   if (
//     !ALLOWED_FEE_DISCOUNT_TYPES.includes(
//       finalDiscountType
//     )
//   ) {
//     throw new Error(
//       "Invalid fee discount type"
//     );
//   }

//   return finalDiscountType;
// };

// // =====================================================
// // Normalize Fee Value
// // =====================================================

// const normalizeFeeValue = (
//   value,
//   fieldName
// ) => {
//   const amount =
//     Number(value || 0);

//   if (
//     !Number.isFinite(amount) ||
//     amount < 0
//   ) {
//     throw new Error(
//       `${fieldName} must be a valid non-negative number`
//     );
//   }

//   return amount;
// };

// // =====================================================
// // Validate All Fee Heads
// // =====================================================

// const validateFeeHeads = ({
//   admissionFee = 0,
//   monthlyFee = 0,
//   examFee = 0,
//   sportFee = 0,
//   computerFee = 0,
//   functionFee = 0,
//   smartClassFee = 0,
//   otherCharges = 0,
// }) => {
//   return {
//     admissionFee:
//       normalizeFeeValue(
//         admissionFee,
//         "Admission fee"
//       ),

//     monthlyFee:
//       normalizeFeeValue(
//         monthlyFee,
//         "Monthly fee"
//       ),

//     examFee:
//       normalizeFeeValue(
//         examFee,
//         "Exam fee"
//       ),

//     sportFee:
//       normalizeFeeValue(
//         sportFee,
//         "Sport fee"
//       ),

//     computerFee:
//       normalizeFeeValue(
//         computerFee,
//         "Computer fee"
//       ),

//     functionFee:
//       normalizeFeeValue(
//         functionFee,
//         "Function fee"
//       ),

//     smartClassFee:
//       normalizeFeeValue(
//         smartClassFee,
//         "Smart class fee"
//       ),

//     otherCharges:
//       normalizeFeeValue(
//         otherCharges,
//         "Other charges"
//       ),
//   };
// };

// // =====================================================
// // Calculate Discounted Fee Heads
// // =====================================================
// //
// // SIBLING:
// // Monthly Fee = 80%
// //
// // RTE:
// // All fee heads = 0
// //
// // GIRL:
// // Admission Fee = 50%
// //
// // =====================================================

// const calculateDiscountedFeeHeads = (
//   feeHeads,
//   feeDiscountType
// ) => {
//   const finalDiscountType =
//     validateFeeDiscountType(
//       feeDiscountType
//     );

//   const {
//     admissionFee,
//     monthlyFee,
//     examFee,
//     sportFee,
//     computerFee,
//     functionFee,
//     smartClassFee,
//     otherCharges,
//   } = feeHeads;

//   switch (
//     finalDiscountType
//   ) {
//     // =================================================
//     // SIBLING
//     // =================================================

//     case "SIBLING":
//       return {
//         admissionFee,

//         monthlyFee:
//           monthlyFee * 0.8,

//         examFee,

//         sportFee,

//         computerFee,

//         functionFee,

//         smartClassFee,

//         otherCharges,
//       };

//     // =================================================
//     // RTE
//     // =================================================

//     case "RTE":
//       return {
//         admissionFee: 0,

//         monthlyFee: 0,

//         examFee: 0,

//         sportFee: 0,

//         computerFee: 0,

//         functionFee: 0,

//         smartClassFee: 0,

//         otherCharges: 0,
//       };

//     // =================================================
//     // GIRL
//     // =================================================

//     case "GIRL":
//       return {
//         admissionFee:
//           admissionFee * 0.5,

//         monthlyFee,

//         examFee,

//         sportFee,

//         computerFee,

//         functionFee,

//         smartClassFee,

//         otherCharges,
//       };

//     // =================================================
//     // NONE
//     // =================================================

//     case "NONE":
//     default:
//       return {
//         admissionFee,

//         monthlyFee,

//         examFee,

//         sportFee,

//         computerFee,

//         functionFee,

//         smartClassFee,

//         otherCharges,
//       };
//   }
// };

// // =====================================================
// // Calculate Effective Fee Total
// // =====================================================

// const calculateEffectiveFeeTotal = (
//   feeHeads,
//   feeDiscountType
// ) => {
//   const discountedFees =
//     calculateDiscountedFeeHeads(
//       feeHeads,
//       feeDiscountType
//     );

//   return (
//     discountedFees.admissionFee +
//     discountedFees.monthlyFee +
//     discountedFees.examFee +
//     discountedFees.sportFee +
//     discountedFees.computerFee +
//     discountedFees.functionFee +
//     discountedFees.smartClassFee +
//     discountedFees.otherCharges
//   );
// };

// // =====================================================
// // Calculate Total Fee
// // =====================================================

// const calculateTotalFee = (
//   feeHeads,
//   openingDue,
//   feeDiscountType
// ) => {
//   const discountedFeeTotal =
//     calculateEffectiveFeeTotal(
//       feeHeads,
//       feeDiscountType
//     );

//   const finalOpeningDue =
//     normalizeFeeValue(
//       openingDue,
//       "Opening due"
//     );

//   return (
//     discountedFeeTotal +
//     finalOpeningDue
//   );
// };

// // =====================================================
// // Get Effective Monthly Fee
// // =====================================================

// const getEffectiveMonthlyFee = (
//   student,
//   currentDate = new Date()
// ) => {
//   const discountType =
//     validateFeeDiscountType(
//       student.feeDiscountType
//     );

//   const feeSnapshot =
//     getFeeSnapshotForDate(
//       student,
//       currentDate
//     ).fees;

//   const monthlyFee =
//     normalizeFeeValue(
//       feeSnapshot.monthlyFee,
//       "Monthly fee"
//     );

//   switch (
//   discountType
//   ) {
//     case "SIBLING":
//       return monthlyFee * 0.8;

//     case "RTE":
//       return 0;

//     case "GIRL":
//       return monthlyFee;

//     case "NONE":
//     default:
//       return monthlyFee;
//   }
// };

// // =====================================================
// // Get Effective One-Time Fees
// // =====================================================

// const getEffectiveOneTimeFees = (
//   student,
//   currentDate = new Date()
// ) => {
//   const discountType =
//     validateFeeDiscountType(
//       student.feeDiscountType
//     );

//   const feeSnapshot =
//     getFeeSnapshotForDate(
//       student,
//       currentDate
//     ).fees;

//   const admissionFee =
//     normalizeFeeValue(
//       feeSnapshot.admissionFee,
//       "Admission fee"
//     );

//   const examFee =
//     normalizeFeeValue(
//       feeSnapshot.examFee,
//       "Exam fee"
//     );

//   const sportFee =
//     normalizeFeeValue(
//       feeSnapshot.sportFee,
//       "Sport fee"
//     );

//   const computerFee =
//     normalizeFeeValue(
//       feeSnapshot.computerFee,
//       "Computer fee"
//     );

//   const functionFee =
//     normalizeFeeValue(
//       feeSnapshot.functionFee,
//       "Function fee"
//     );

//   const smartClassFee =
//     normalizeFeeValue(
//       feeSnapshot.smartClassFee,
//       "Smart class fee"
//     );

//   const otherCharges =
//     normalizeFeeValue(
//       feeSnapshot.otherCharges,
//       "Other charges"
//     );

//   // ===================================================
//   // RTE
//   // ===================================================
//   //
//   // RTE = 100% discount on all applicable fees
//   //

//   if (discountType === "RTE") {
//     return 0;
//   }

//   // ===================================================
//   // GIRL
//   // ===================================================
//   //
//   // GIRL = 50% discount ONLY on Admission Fee
//   //

//   let effectiveAdmissionFee =
//     admissionFee;

//   if (
//     discountType === "GIRL"
//   ) {
//     effectiveAdmissionFee =
//       admissionFee * 0.5;
//   }

//   // ===================================================
//   // SIBLING
//   // ===================================================
//   //
//   // SIBLING discount applies ONLY to Monthly Fee.
//   // Monthly fee is handled separately by
//   // getEffectiveMonthlyFee().
//   //

//   return Number(
//     (
//       effectiveAdmissionFee +
//       examFee +
//       sportFee +
//       computerFee +
//       functionFee +
//       smartClassFee +
//       otherCharges
//     ).toFixed(2)
//   );
// };

// // =====================================================
// // Calculate Accrued Months
// // =====================================================

// const calculateAccruedMonths = (
//   feeStartDate,
//   currentDate = new Date()
// ) => {
//   const start =
//     new Date(feeStartDate);

//   const current =
//     new Date(currentDate);

//   if (
//     Number.isNaN(
//       start.getTime()
//     )
//   ) {
//     return 0;
//   }

//   if (
//     Number.isNaN(
//       current.getTime()
//     )
//   ) {
//     throw new Error(
//       "Invalid current date"
//     );
//   }

//   // ===================================================
//   // TEST MODE
//   // 1 minute = 1 month
//   // ===================================================

//   if (
//     process.env.TEST_FEE_MODE ===
//     "true"
//   ) {
//     const elapsedMilliseconds =
//       current.getTime() -
//       start.getTime();

//     if (
//       elapsedMilliseconds <= 0
//     ) {
//       return 1;
//     }

//     const elapsedMinutes =
//       Math.floor(
//         elapsedMilliseconds /
//         (60 * 1000)
//       );

//     return (
//       Math.max(
//         elapsedMinutes,
//         0
//       ) + 1
//     );
//   }

//   // ===================================================
//   // Production Mode
//   // ===================================================

//   const startYear =
//     start.getFullYear();

//   const startMonth =
//     start.getMonth();

//   const currentYear =
//     current.getFullYear();

//   const currentMonth =
//     current.getMonth();

//   if (
//     current <
//     new Date(
//       startYear,
//       startMonth,
//       1
//     )
//   ) {
//     return 0;
//   }

//   return (
//     (currentYear - startYear) *
//     12 +
//     (currentMonth -
//       startMonth) +
//     1
//   );
// };

// // =====================================================
// // Get Academic Year End Date
// // =====================================================
// //
// // Example:
// //
// // Fee Start = August 2026
// // Academic Year End = March 31, 2027
// //
// // Fee Start = January 2027
// // Academic Year End = March 31, 2027
// //
// // Fee Start = April 2027
// // Academic Year End = March 31, 2028
// //
// // =====================================================

// const getAcademicYearEndDate = (
//   feeStartDate
// ) => {
//   const start =
//     new Date(feeStartDate);

//   if (
//     Number.isNaN(
//       start.getTime()
//     )
//   ) {
//     return null;
//   }

//   const startMonth =
//     start.getMonth();

//   const startYear =
//     start.getFullYear();

//   // ===================================================
//   // April to December
//   // Academic year ends next year March
//   // ===================================================

//   if (
//     startMonth >= 3
//   ) {
//     return new Date(
//       startYear + 1,
//       2,
//       31,
//       23,
//       59,
//       59,
//       999
//     );
//   }

//   // ===================================================
//   // January to March
//   // Academic year ends same year March
//   // ===================================================

//   return new Date(
//     startYear,
//     2,
//     31,
//     23,
//     59,
//     59,
//     999
//   );
// };

// // =====================================================
// // Check Successful Lump Sum Payment
// // =====================================================
// //
// // IMPORTANT:
// //
// // If at least one successful LUMP_SUM payment exists,
// // future monthly fee will NOT be generated for the
// // remaining months of the current academic year.
// //
// // Example:
// //
// // Monthly Fee = ₹1500
// //
// // Student pays complete LUMP_SUM amount.
// //
// // Then:
// //
// // Current month due = normal
// // Future months      = ₹0
// // Until March        = ₹0
// //
// // =====================================================

// const hasActiveLumpSumPayment = async (
//   student,
//   currentDate = new Date()
// ) => {
//   if (!student) {
//     return false;
//   }

//   const payments =
//     await feeRepository.getLumpSumPayments(
//       student.studentId
//     );

//   if (
//     !Array.isArray(payments) ||
//     payments.length === 0
//   ) {
//     return false;
//   }

//   const academicYearEnd =
//     getAcademicYearEndDate(
//       student.feeStartDate ||
//       student.admissionDate
//     );

//   if (!academicYearEnd) {
//     return false;
//   }

//   const current =
//     new Date(currentDate);

//   // Old lump-sum payment should not affect
//   // the next academic year.

//   if (
//     current >
//     academicYearEnd
//   ) {
//     return false;
//   }

//   return payments.some(
//     (payment) => {
//       const paymentDate =
//         new Date(
//           payment.paymentDate ||
//           payment.createdAt
//         );

//       if (
//         Number.isNaN(
//           paymentDate.getTime()
//         )
//       ) {
//         return false;
//       }

//       return (
//         paymentDate <= current &&
//         paymentDate <= academicYearEnd
//       );
//     }
//   );
// };

// // =====================================================
// // Calculate Current Due Fee
// // =====================================================

// const calculateCurrentDueFee = async (
//   student
// ) => {
//   if (
//     !student ||
//     !student.studentId
//   ) {
//     throw new Error(
//       "Valid student is required"
//     );
//   }

//   const feeCalculation =
//     await calculateFeeByHead({
//       studentId:
//         student.studentId,

//       feeHead: "ALL",
//     });

//   return Number(
//     feeCalculation?.dueFee || 0
//   );
// };

// // =====================================================
// // Update Dynamic Due Fee
// // =====================================================

// const refreshStudentDueFee = async (
//   student
// ) => {
//   const dueFee =
//     await calculateCurrentDueFee(
//       student
//     );

//   // Calculate due only for API response.
//   // GET/search request will not update database.

//   student.dueFee =
//     Number(
//       dueFee.toFixed(2)
//     );

//   return student;
// };

// // =====================================================
// // Get Active Student By Student ID
// // =====================================================

// const getActiveStudentByStudentId =
//   async (
//     studentId
//   ) => {
//     const student =
//       await studentRepository.findByStudentId(
//         studentId
//       );

//     if (!student) {
//       throw new Error(
//         "Student not found"
//       );
//     }

//     if (
//       student.status !==
//       "ACTIVE"
//     ) {
//       throw new Error(
//         "Student is not active"
//       );
//     }

//     return student;
//   };

// // =====================================================
// // Create Student
// // ADMIN ONLY
// // =====================================================

// const createStudent = async (
//   body,
//   userId
// ) => {
//   const {
//     name,
//     fatherName,
//     motherName,
//     mobile,
//     email,
//     gender,
//     dob,
//     className,
//     section,
//     address,
//     admissionDate,

//     admissionFee,
//     monthlyFee,
//     examFee,
//     sportFee,
//     computerFee,
//     functionFee,
//     smartClassFee,
//     otherCharges,

//     openingDue,

//     feeDiscountType,
//     feeStartFrom,
//   } = body;

//   // ===================================================
//   // Duplicate Check
//   // ===================================================

//   const existingStudent =
//     await studentRepository.findByAdmissionNo(
//       name,
//       fatherName,
//       motherName,
//       className
//     );

//   if (
//     existingStudent
//   ) {
//     throw new Error(
//       "Student with same name, father name, mother name and class already exists"
//     );
//   }

//   // ===================================================
//   // Generate Student ID And Admission Number
//   // ===================================================

//   const studentId =
//     await generateStudentId();

//   const admissionNo =
//     await generateAdmissionNo();

//   // ===================================================
//   // Admission Date
//   // ===================================================

//   const finalAdmissionDate =
//     admissionDate
//       ? new Date(admissionDate)
//       : new Date();

//   if (
//     Number.isNaN(
//       finalAdmissionDate.getTime()
//     )
//   ) {
//     throw new Error(
//       "Invalid admission date"
//     );
//   }

//   // ===================================================
//   // Discount Type
//   // ===================================================

//   const finalFeeDiscountType =
//     validateFeeDiscountType(
//       feeDiscountType
//     );

//   // ===================================================
//   // Fee Heads
//   // ===================================================

//   const feeHeads =
//     validateFeeHeads({
//       admissionFee,
//       monthlyFee,
//       examFee,
//       sportFee,
//       computerFee,
//       functionFee,
//       smartClassFee,
//       otherCharges,
//     });

//   // ===================================================
//   // Opening Due
//   // ===================================================

//   const finalOpeningDue =
//     normalizeFeeValue(
//       openingDue,
//       "Opening due"
//     );

//   // ===================================================
//   // Total Fee
//   // ===================================================

//   const totalFee =
//     calculateTotalFee(
//       feeHeads,
//       finalOpeningDue,
//       finalFeeDiscountType
//     );

//   // ===================================================
//   // Initial Paid And Due
//   // ===================================================

//   const paidFee = 0;

//   const dueFee =
//     finalOpeningDue;

//   // ===================================================
//   // Fee Start Option
//   // ===================================================

//   const finalFeeStartFrom =
//     feeStartFrom || "NEXT_MONTH";

//   if (
//     ![
//       "ADMISSION_DATE",
//       "NEXT_MONTH",
//       "CUSTOM",
//     ].includes(
//       finalFeeStartFrom
//     )
//   ) {
//     throw new Error(
//       "Invalid fee start option"
//     );
//   }

//   let feeStartDate;

//   // ===================================================
//   // Start From Admission Date
//   // ===================================================

//   if (
//     finalFeeStartFrom ===
//     "ADMISSION_DATE"
//   ) {
//     feeStartDate =
//       new Date(
//         finalAdmissionDate
//       );
//   }

//   // ===================================================
//   // Start From Next Month
//   // ===================================================

//   else if (
//     finalFeeStartFrom ===
//     "NEXT_MONTH"
//   ) {
//     feeStartDate =
//       calculateFeeStartDate(
//         finalAdmissionDate
//       );
//   }

//   // ===================================================
//   // Custom Fee Start Date
//   // ===================================================

//   else if (
//     finalFeeStartFrom ===
//     "CUSTOM"
//   ) {
//     if (
//       !body.feeStartDate
//     ) {
//       throw new Error(
//         "Fee start date is required for CUSTOM option"
//       );
//     }

//     feeStartDate =
//       new Date(
//         body.feeStartDate
//       );

//     if (
//       Number.isNaN(
//         feeStartDate.getTime()
//       )
//     ) {
//       throw new Error(
//         "Invalid fee start date"
//       );
//     }
//   }

//   // ===================================================
//   // Create Student
//   // ===================================================

//   const student =
//     await studentRepository.createStudent({
//       studentId,

//       admissionNo,

//       name,

//       fatherName,

//       motherName:
//         motherName || "",

//       mobile,

//       email:
//         email || "",

//       gender,

//       dob:
//         dob || null,

//       className,

//       section:
//         section || "",

//       address:
//         address || "",

//       admissionDate:
//         finalAdmissionDate,

//       feeDiscountType:
//         finalFeeDiscountType,

//       admissionFee:
//         feeHeads.admissionFee,

//       monthlyFee:
//         feeHeads.monthlyFee,

//       examFee:
//         feeHeads.examFee,

//       sportFee:
//         feeHeads.sportFee,

//       computerFee:
//         feeHeads.computerFee,

//       functionFee:
//         feeHeads.functionFee,

//       smartClassFee:
//         feeHeads.smartClassFee,

//       otherCharges:
//         feeHeads.otherCharges,

//       openingDue:
//         finalOpeningDue,

//       totalFee,

//       paidFee,

//       dueFee,

//       feeStartFrom:
//         finalFeeStartFrom,

//       feeStartDate,

//       status:
//         "ACTIVE",

//       isDeleted:
//         false,

//       createdBy:
//         userId,

//       updatedBy:
//         userId,
//     });

//   return student;
// };

// // =====================================================
// // Get All Students
// // =====================================================

// const getAllStudents = async () => {
//   const students =
//     await studentRepository.getAllStudents();

//   if (
//     !Array.isArray(students)
//   ) {
//     return [];
//   }

//   const updatedStudents =
//     await Promise.all(
//       students.map(
//         async (student) => {
//           if (
//             student.status !==
//             "ACTIVE"
//           ) {
//             return student;
//           }

//           return await refreshStudentDueFee(
//             student
//           );
//         }
//       )
//     );

//   return updatedStudents;
// };

// // =====================================================
// // Get Student By ID
// // =====================================================

// const getStudentById = async (
//   id
// ) => {
//   const student =
//     await studentRepository.getStudentById(
//       id
//     );

//   if (!student) {
//     throw new Error(
//       "Student not found"
//     );
//   }

//   if (
//     student.status ===
//     "ACTIVE"
//   ) {
//     return await refreshStudentDueFee(
//       student
//     );
//   }

//   return student;
// };

// // =====================================================
// // Update Student
// // ADMIN ONLY
// // =====================================================

// const updateStudent = async (
//   id,
//   body,
//   userId
// ) => {
//   const student =
//     await studentRepository.getStudentById(
//       id
//     );

//   if (!student) {
//     throw new Error(
//       "Student not found"
//     );
//   }

//   if (
//     body.className !== undefined
//   ) {
//     throw new Error(
//       "Use the student promotion API to change class"
//     );
//   }

//   // ===================================================
//   // Protected Fields
//   // ===================================================

//   const {
//     paidFee,
//     dueFee,
//     totalFee,
//     studentId,
//     isDeleted,
//     createdBy,
//     ...updateData
//   } = body;

//   // These fields cannot be updated directly
//   delete updateData.paidFee;
//   delete updateData.dueFee;
//   delete updateData.totalFee;
//   delete updateData.openingDue;
//   delete updateData.studentId;
//   delete updateData.isDeleted;
//   delete updateData.createdBy;
//   delete updateData.classPromotionHistory;
//   delete updateData.lateFeeWaivers;
//   delete updateData.lateFeeWaived;
//   delete updateData.lateFeeWaiverAmount;
//   delete updateData.lateFeeWaiverReason;

//   // ===================================================
//   // Discount Validation
//   // ===================================================

//   if (
//     updateData.feeDiscountType !==
//     undefined
//   ) {
//     updateData.feeDiscountType =
//       validateFeeDiscountType(
//         updateData.feeDiscountType
//       );
//   }

//   // ===================================================
//   // Admission Date
//   // ===================================================

//   if (
//     updateData.admissionDate !==
//     undefined
//   ) {
//     const newAdmissionDate =
//       new Date(
//         updateData.admissionDate
//       );

//     if (
//       Number.isNaN(
//         newAdmissionDate.getTime()
//       )
//     ) {
//       throw new Error(
//         "Invalid admission date"
//       );
//     }

//     updateData.admissionDate =
//       newAdmissionDate;
//   }

//   // ===================================================
//   // Fee Start From / Fee Start Date
//   //
//   // Supported:
//   // ADMISSION_DATE
//   // NEXT_MONTH
//   // CUSTOM
//   // ===================================================

//   if (
//     updateData.feeStartFrom !==
//     undefined ||
//     updateData.feeStartDate !==
//     undefined ||
//     updateData.admissionDate !==
//     undefined
//   ) {
//     const finalFeeStartFrom =
//       updateData.feeStartFrom ??
//       student.feeStartFrom ??
//       "NEXT_MONTH";

//     // -------------------------------------------------
//     // Validate Fee Start Option
//     // -------------------------------------------------

//     if (
//       ![
//         "ADMISSION_DATE",
//         "NEXT_MONTH",
//         "CUSTOM",
//       ].includes(
//         finalFeeStartFrom
//       )
//     ) {
//       throw new Error(
//         "Invalid fee start option"
//       );
//     }

//     // -------------------------------------------------
//     // Final Admission Date
//     // -------------------------------------------------

//     const finalAdmissionDate =
//       updateData.admissionDate
//         ? new Date(
//           updateData.admissionDate
//         )
//         : new Date(
//           student.admissionDate
//         );

//     if (
//       Number.isNaN(
//         finalAdmissionDate.getTime()
//       )
//     ) {
//       throw new Error(
//         "Invalid admission date"
//       );
//     }

//     // -------------------------------------------------
//     // ADMISSION_DATE
//     // -------------------------------------------------

//     if (
//       finalFeeStartFrom ===
//       "ADMISSION_DATE"
//     ) {
//       updateData.feeStartDate =
//         new Date(
//           finalAdmissionDate
//         );
//     }

//     // -------------------------------------------------
//     // NEXT_MONTH
//     // -------------------------------------------------

//     else if (
//       finalFeeStartFrom ===
//       "NEXT_MONTH"
//     ) {
//       updateData.feeStartDate =
//         calculateFeeStartDate(
//           finalAdmissionDate
//         );
//     }

//     // -------------------------------------------------
//     // CUSTOM
//     // -------------------------------------------------

//     else if (
//       finalFeeStartFrom ===
//       "CUSTOM"
//     ) {
//       const customFeeStartDate =
//         updateData.feeStartDate
//           ? new Date(
//             updateData.feeStartDate
//           )
//           : student.feeStartDate
//             ? new Date(
//               student.feeStartDate
//             )
//             : null;

//       if (
//         !customFeeStartDate ||
//         Number.isNaN(
//           customFeeStartDate.getTime()
//         )
//       ) {
//         throw new Error(
//           "Valid fee start date is required for CUSTOM option"
//         );
//       }

//       updateData.feeStartDate =
//         customFeeStartDate;
//     }

//     // -------------------------------------------------
//     // Save Fee Start Option
//     // -------------------------------------------------

//     updateData.feeStartFrom =
//       finalFeeStartFrom;
//   }

//   // ===================================================
//   // Current Fee Heads
//   // ===================================================

//   const currentFeeHeads = {
//     admissionFee:
//       Number(
//         student.admissionFee || 0
//       ),

//     monthlyFee:
//       Number(
//         student.monthlyFee || 0
//       ),

//     examFee:
//       Number(
//         student.examFee || 0
//       ),

//     sportFee:
//       Number(
//         student.sportFee || 0
//       ),

//     computerFee:
//       Number(
//         student.computerFee || 0
//       ),

//     functionFee:
//       Number(
//         student.functionFee || 0
//       ),

//     smartClassFee:
//       Number(
//         student.smartClassFee || 0
//       ),

//     otherCharges:
//       Number(
//         student.otherCharges || 0
//       ),
//   };

//   // ===================================================
//   // Check Fee Fields Updated
//   // ===================================================

//   const feeFieldsUpdated =
//     FEE_HEADS.some(
//       (field) =>
//         updateData[field] !==
//         undefined
//     );

//   // ===================================================
//   // Updated Fee Heads
//   // ===================================================

//   const updatedFeeHeads =
//     validateFeeHeads({
//       admissionFee:
//         updateData.admissionFee !==
//           undefined
//           ? updateData.admissionFee
//           : currentFeeHeads.admissionFee,

//       monthlyFee:
//         updateData.monthlyFee !==
//           undefined
//           ? updateData.monthlyFee
//           : currentFeeHeads.monthlyFee,

//       examFee:
//         updateData.examFee !==
//           undefined
//           ? updateData.examFee
//           : currentFeeHeads.examFee,

//       sportFee:
//         updateData.sportFee !==
//           undefined
//           ? updateData.sportFee
//           : currentFeeHeads.sportFee,

//       computerFee:
//         updateData.computerFee !==
//           undefined
//           ? updateData.computerFee
//           : currentFeeHeads.computerFee,

//       functionFee:
//         updateData.functionFee !==
//           undefined
//           ? updateData.functionFee
//           : currentFeeHeads.functionFee,

//       smartClassFee:
//         updateData.smartClassFee !==
//           undefined
//           ? updateData.smartClassFee
//           : currentFeeHeads.smartClassFee,

//       otherCharges:
//         updateData.otherCharges !==
//           undefined
//           ? updateData.otherCharges
//           : currentFeeHeads.otherCharges,
//     });

//   // ===================================================
//   // Save Updated Fee Heads
//   // ===================================================

//   if (
//     feeFieldsUpdated
//   ) {
//     updateData.admissionFee =
//       updatedFeeHeads.admissionFee;

//     updateData.monthlyFee =
//       updatedFeeHeads.monthlyFee;

//     updateData.examFee =
//       updatedFeeHeads.examFee;

//     updateData.sportFee =
//       updatedFeeHeads.sportFee;

//     updateData.computerFee =
//       updatedFeeHeads.computerFee;

//     updateData.functionFee =
//       updatedFeeHeads.functionFee;

//     updateData.smartClassFee =
//       updatedFeeHeads.smartClassFee;

//     updateData.otherCharges =
//       updatedFeeHeads.otherCharges;
//   }

//   // ===================================================
//   // Final Discount Type
//   // ===================================================

//   const finalDiscountType =
//     updateData.feeDiscountType !==
//       undefined
//       ? updateData.feeDiscountType
//       : student.feeDiscountType ||
//       "NONE";

//   // ===================================================
//   // Recalculate Total Fee
//   // ===================================================

//   if (
//     feeFieldsUpdated ||
//     updateData.feeDiscountType !==
//     undefined
//   ) {
//     const finalOpeningDue =
//       Number(
//         student.openingDue || 0
//       );

//     updateData.totalFee =
//       calculateTotalFee(
//         updatedFeeHeads,
//         finalOpeningDue,
//         finalDiscountType
//       );
//   }

//   // ===================================================
//   // Duplicate Check
//   // ===================================================

//   const name =
//     updateData.name ??
//     student.name;

//   const fatherName =
//     updateData.fatherName ??
//     student.fatherName;

//   const motherName =
//     updateData.motherName ??
//     student.motherName;

//   const className =
//     updateData.className ??
//     student.className;

//   const admissionNo =
//     updateData.admissionNo ??
//     student.admissionNo;

//   const existingStudent =
//     await studentRepository.findByAdmissionNo(
//       admissionNo,
//       name,
//       fatherName,
//       motherName,
//       className
//     );

//   if (
//     existingStudent &&
//     existingStudent._id.toString() !==
//     student._id.toString()
//   ) {
//     throw new Error(
//       "Another student with same details already exists"
//     );
//   }

//   // ===================================================
//   // Updated By
//   // ===================================================

//   updateData.updatedBy =
//     userId;

//   // ===================================================
//   // Update Student
//   // ===================================================

//   const updatedStudent =
//     await studentRepository.updateStudent(
//       id,
//       updateData
//     );

//   if (!updatedStudent) {
//     throw new Error(
//       "Student update failed"
//     );
//   }

//   // ===================================================
//   // Refresh Due
//   // ===================================================

//   return await refreshStudentDueFee(
//     updatedStudent
//   );
// };

// // =====================================================
// // Promote Student
// // ADMIN ONLY
// // =====================================================
// //
// // Student की class तुरंत change होगी,
// // लेकिन नई class की fee अगले fee month से लगेगी.
// //
// // पुरानी paid fee और payment history सुरक्षित रहेगी.
// //
// // =====================================================

// const promoteStudent = async (
//   body = {},
//   userId
// ) => {
//   const studentId =
//     String(
//       body.studentId || ""
//     ).trim();

//   const toClass =
//     String(
//       body.toClass || ""
//     ).trim();

//   const remarks =
//     String(
//       body.remarks || ""
//     ).trim();

//   // ===================================================
//   // Required Fields Validation
//   // ===================================================

//   if (!studentId) {
//     throw new Error(
//       "Student ID is required"
//     );
//   }

//   if (!toClass) {
//     throw new Error(
//       "Promoted class is required"
//     );
//   }

//   if (!userId) {
//     throw new Error(
//       "Promoting user is required"
//     );
//   }

//   // ===================================================
//   // Get Student
//   // ===================================================

//   const student =
//     await studentRepository
//       .findByStudentId(
//         studentId
//       );

//   if (!student) {
//     throw new Error(
//       "Student not found"
//     );
//   }

//   if (
//     student.status !== "ACTIVE"
//   ) {
//     throw new Error(
//       "Student is not active"
//     );
//   }

//   // ===================================================
//   // Current Class
//   // ===================================================

//   const fromClass =
//     String(
//       student.className || ""
//     ).trim();

//   if (
//     fromClass === toClass
//   ) {
//     throw new Error(
//       `Student is already in ${toClass}`
//     );
//   }

//   const now =
//     new Date();

//   // ===================================================
//   // Current Promotion History
//   // ===================================================

//   const currentHistory =
//     Array.isArray(
//       student.classPromotionHistory
//     )
//       ? student.classPromotionHistory
//         .map(
//           (promotion) =>
//             typeof promotion.toObject ===
//             "function"
//               ? promotion.toObject()
//               : {
//                 ...promotion,
//               }
//         )
//       : [];

//   // ===================================================
//   // Check Pending Promotion
//   // ===================================================

//   const pendingPromotion =
//     currentHistory.find(
//       (promotion) => {
//         const effectiveFrom =
//           new Date(
//             promotion.effectiveFrom
//           );

//         return (
//           !Number.isNaN(
//             effectiveFrom.getTime()
//           ) &&
//           effectiveFrom > now
//         );
//       }
//     );

//   if (
//     pendingPromotion
//   ) {
//     throw new Error(
//       `A promotion to ${pendingPromotion.toClass} is already pending from ${new Date(
//         pendingPromotion.effectiveFrom
//       ).toISOString()}`
//     );
//   }

//   // ===================================================
//   // Get New Class Fee Structure
//   // ===================================================

//   const feeStructure =
//     await feeStructureRepository
//       .getFeeStructureByClass(
//         toClass
//       );

//   if (!feeStructure) {
//     throw new Error(
//       `Active fee structure for class ${toClass} not found`
//     );
//   }

//   // ===================================================
//   // Final Section
//   // ===================================================

//   const toSection =
//     body.section !== undefined
//       ? String(
//         body.section || ""
//       ).trim()
//       : String(
//         student.section || ""
//       ).trim();

//   // ===================================================
//   // Current Fee Snapshot
//   // ===================================================

//   const currentSnapshot =
//     getFeeSnapshotForDate(
//       student,
//       now
//     );

//   const fromFees =
//     getFeeSnapshot(
//       currentSnapshot.fees
//     );

//   // ===================================================
//   // New Class Fee Snapshot
//   // ===================================================

//   const toFees =
//     getFeeSnapshot(
//       feeStructure
//     );

//   // ===================================================
//   // New Fee Effective Date
//   // ===================================================

//   const effectiveFrom =
//     getNextFeePeriodStart(
//       now
//     );

//   // ===================================================
//   // Promotion History Record
//   // ===================================================

//   const promotion = {
//     fromClass,

//     toClass,

//     fromSection:
//       student.section || "",

//     toSection,

//     effectiveFrom,

//     fromFees,

//     toFees,

//     feeStructure:
//       feeStructure._id,

//     remarks,

//     promotedBy:
//       userId,

//     promotedAt:
//       now,
//   };

//   // ===================================================
//   // Calculate New Total Fee
//   // ===================================================

//   const totalFee =
//     calculateTotalFee(
//       toFees,

//       Number(
//         student.openingDue || 0
//       ),

//       student.feeDiscountType ||
//       "NONE"
//     );

//   // ===================================================
//   // Update Student
//   // ===================================================

//   const updatedStudent =
//     await studentRepository
//       .updateStudent(
//         student._id,
//         {
//           className:
//             toClass,

//           section:
//             toSection,

//           ...toFees,

//           totalFee,

//           classPromotionHistory: [
//             ...currentHistory,
//             promotion,
//           ],

//           updatedBy:
//             userId,
//         }
//       );

//   if (!updatedStudent) {
//     throw new Error(
//       "Student promotion failed"
//     );
//   }

//   // ===================================================
//   // Refresh Current Due
//   // ===================================================

//   const refreshedStudent =
//     await refreshStudentDueFee(
//       updatedStudent,
//       now
//     );

//   // ===================================================
//   // Response
//   // ===================================================

//   return {
//     studentId:
//       refreshedStudent.studentId,

//     studentName:
//       refreshedStudent.name,

//     previousClass:
//       fromClass,

//     promotedClass:
//       toClass,

//     previousSection:
//       student.section || "",

//     promotedSection:
//       toSection,

//     effectiveFrom,

//     previousMonthlyFee:
//       fromFees.monthlyFee,

//     promotedMonthlyFee:
//       toFees.monthlyFee,

//     feeDiscountType:
//       refreshedStudent.feeDiscountType,

//     paidFee:
//       Number(
//         refreshedStudent.paidFee || 0
//       ),

//     dueFee:
//       Number(
//         refreshedStudent.dueFee || 0
//       ),

//     remarks,
//   };
// };

// // =====================================================
// // Delete Student
// // ADMIN ONLY
// // =====================================================

// const deleteStudent = async (
//   id,
//   userId
// ) => {
//   const student =
//     await studentRepository.getStudentById(
//       id
//     );

//   if (!student) {
//     throw new Error(
//       "Student not found"
//     );
//   }

//   const deletedStudent =
//     await studentRepository.deleteStudent(
//       id
//     );

//   if (!deletedStudent) {
//     throw new Error(
//       "Student delete failed"
//     );
//   }

//   return deletedStudent;
// };

// // =====================================================
// // Search Student For Payment
// // PUBLIC
// // =====================================================

// const searchStudent = async (
//   search
// ) => {
//   if (
//     !search ||
//     typeof search !== "string" ||
//     !search.trim()
//   ) {
//     throw new Error(
//       "Student ID or mobile number is required"
//     );
//   }

//   const cleanSearch =
//     search.trim();

//   const students =
//     await studentRepository.searchStudent(
//       cleanSearch
//     );

//   // ===================================================
//   // Student Not Found
//   // ===================================================

//   if (
//     !students ||
//     students.length === 0
//   ) {
//     throw new Error(
//       "Student not found"
//     );
//   }

//   // ===================================================
//   // Refresh Due + Lump Sum Preview
//   // ===================================================

//   const result = [];

//   for (const student of students) {
//     // ===============================================
//     // Refresh Due
//     // ===============================================

//     const updatedStudent =
//       await refreshStudentDueFee(
//         student
//       );

//     // ===============================================
//     // Lump Sum Preview
//     // ===============================================

//     const lumpSumPreview =
//       await getLumpSumPreview(
//         updatedStudent.studentId
//       );

//     // ===============================================
//     // Response
//     // ===============================================

//     result.push({
//       studentId:
//         updatedStudent.studentId,

//       name:
//         updatedStudent.name,

//       fatherName:
//         updatedStudent.fatherName,

//       motherName:
//         updatedStudent.motherName,

//       admissionNo:
//         updatedStudent.admissionNo,

//       mobile:
//         updatedStudent.mobile,

//       email:
//         updatedStudent.email,

//       gender:
//         updatedStudent.gender,

//       dob:
//         updatedStudent.dob,

//       className:
//         updatedStudent.className,

//       section:
//         updatedStudent.section,

//       monthlyFee:
//         Number(
//           updatedStudent.monthlyFee || 0
//         ),

//       feeDiscountType:
//         updatedStudent.feeDiscountType ||
//         "NONE",

//       dueFee:
//         Number(
//           updatedStudent.dueFee || 0
//         ),

//       lumpSumPreview,

//       status:
//         updatedStudent.status,
//     });
//   }

//   // ===================================================
//   // Return
//   // ===================================================

//   return result;
// };

// // =====================================================
// // Get Current Due Fee
// // =====================================================

// const getCurrentDueFee = async (
//   student
// ) => {
//   return await calculateCurrentDueFee(
//     student
//   );
// };

// // =====================================================
// // Export
// // =====================================================

// module.exports = {
//   createStudent,

//   getAllStudents,

//   getStudentById,

//   updateStudent,

//   promoteStudent,

//   deleteStudent,

//   searchStudent,

//   calculateFeeStartDate,

//   validateFeeDiscountType,

//   calculateDiscountedFeeHeads,

//   calculateEffectiveFeeTotal,

//   calculateTotalFee,

//   getEffectiveMonthlyFee,

//   getEffectiveOneTimeFees,

//   calculateAccruedMonths,

//   getAcademicYearEndDate,

//   hasActiveLumpSumPayment,

//   calculateCurrentDueFee,

//   getCurrentDueFee,
// };




const studentRepository =
  require("../repositories/student.repository");

const feeRepository =
  require("../repositories/fee.repository");

const monthlyFeeWaiverRepository =
  require("../repositories/monthlyFeeWaiver.repository");

const feeStructureRepository =
  require("../repositories/feeStructure.repository");

const generateStudentId =
  require("../utils/generateStudentId");
const generateAdmissionNo = require("../utils/generateAdmission");
const generateBusRefundNo =
  require("../utils/generateBusRefundNo");
const {
  getLumpSumPreview,
  calculateFeeByHead,
} = require("./fee.service");

const {
  getFeeSnapshot,
  getNextFeePeriodStart,
  getFeeSnapshotForDate,
} = require("../utils/studentPromotionFee");

const {
  calculateAccruedBusFee,
} = require("../utils/calculateBusFee");

const {
  getCalendarMonthKey,
} = require("../utils/monthlyFeeWaiver");

// =====================================================
// Constants
// =====================================================

const ALLOWED_FEE_DISCOUNT_TYPES = [
  "NONE",
  "SIBLING",
  "RTE",
  "GIRL",
];

const FEE_HEADS = [
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
// Calculate Fee Start Date
// =====================================================
//
// Production:
//
// Admission Date = 15 July
// Fee Start Date  = 01 August
//
// Test Mode:
//
// 1 minute = 1 month
//
// =====================================================

const calculateFeeStartDate = (
  admissionDate,
  feeStartFrom = "NEXT_MONTH"
) => {
  const date =
    new Date(admissionDate);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    throw new Error(
      "Invalid admission date"
    );
  }

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

  if (feeStartFrom === "ADMISSION_DATE") {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  }

  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    1
  );
};

// =====================================================
// Validate Fee Discount Type
// =====================================================

const validateFeeDiscountType = (
  feeDiscountType
) => {
  const finalDiscountType =
    feeDiscountType || "NONE";

  if (
    !ALLOWED_FEE_DISCOUNT_TYPES.includes(
      finalDiscountType
    )
  ) {
    throw new Error(
      "Invalid fee discount type"
    );
  }

  return finalDiscountType;
};

// =====================================================
// Normalize Fee Value
// =====================================================

const normalizeFeeValue = (
  value,
  fieldName
) => {
  const amount =
    Number(value || 0);

  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new Error(
      `${fieldName} must be a valid non-negative number`
    );
  }

  return amount;
};

// =====================================================
// Validate All Fee Heads
// =====================================================

const validateFeeHeads = ({
  admissionFee = 0,
  monthlyFee = 0,
  examFee = 0,
  sportFee = 0,
  computerFee = 0,
  functionFee = 0,
  smartClassFee = 0,
  otherCharges = 0,
}) => {
  return {
    admissionFee:
      normalizeFeeValue(
        admissionFee,
        "Admission fee"
      ),

    monthlyFee:
      normalizeFeeValue(
        monthlyFee,
        "Monthly fee"
      ),

    examFee:
      normalizeFeeValue(
        examFee,
        "Exam fee"
      ),

    sportFee:
      normalizeFeeValue(
        sportFee,
        "Sport fee"
      ),

    computerFee:
      normalizeFeeValue(
        computerFee,
        "Computer fee"
      ),

    functionFee:
      normalizeFeeValue(
        functionFee,
        "Function fee"
      ),

    smartClassFee:
      normalizeFeeValue(
        smartClassFee,
        "Smart class fee"
      ),

    otherCharges:
      normalizeFeeValue(
        otherCharges,
        "Other charges"
      ),
  };
};

// =====================================================
// Calculate Discounted Fee Heads
// =====================================================
//
// SIBLING:
// Monthly Fee = 80%
//
// RTE:
// All fee heads = 0
//
// GIRL:
// Admission Fee = 50%
//
// =====================================================

const calculateDiscountedFeeHeads = (
  feeHeads,
  feeDiscountType
) => {
  const finalDiscountType =
    validateFeeDiscountType(
      feeDiscountType
    );

  const {
    admissionFee,
    monthlyFee,
    examFee,
    sportFee,
    computerFee,
    functionFee,
    smartClassFee,
    otherCharges,
  } = feeHeads;

  switch (
  finalDiscountType
  ) {
    // =================================================
    // SIBLING
    // =================================================

    case "SIBLING":
      return {
        admissionFee,

        monthlyFee:
          monthlyFee * 0.8,

        examFee,

        sportFee,

        computerFee,

        functionFee,

        smartClassFee,

        otherCharges,
      };

    // =================================================
    // RTE
    // =================================================

    case "RTE":
      return {
        admissionFee: 0,

        monthlyFee: 0,

        examFee: 0,

        sportFee: 0,

        computerFee: 0,

        functionFee: 0,

        smartClassFee: 0,

        otherCharges: 0,
      };

    // =================================================
    // GIRL
    // =================================================

    case "GIRL":
      return {
        admissionFee:
          admissionFee * 0.5,

        monthlyFee,

        examFee,

        sportFee,

        computerFee,

        functionFee,

        smartClassFee,

        otherCharges,
      };

    // =================================================
    // NONE
    // =================================================

    case "NONE":
    default:
      return {
        admissionFee,

        monthlyFee,

        examFee,

        sportFee,

        computerFee,

        functionFee,

        smartClassFee,

        otherCharges,
      };
  }
};

// =====================================================
// Calculate Effective Fee Total
// =====================================================

const calculateEffectiveFeeTotal = (
  feeHeads,
  feeDiscountType
) => {
  const discountedFees =
    calculateDiscountedFeeHeads(
      feeHeads,
      feeDiscountType
    );

  return (
    discountedFees.admissionFee +
    discountedFees.monthlyFee +
    discountedFees.examFee +
    discountedFees.sportFee +
    discountedFees.computerFee +
    discountedFees.functionFee +
    discountedFees.smartClassFee +
    discountedFees.otherCharges
  );
};

// =====================================================
// Calculate Total Fee
// =====================================================

const calculateTotalFee = (
  feeHeads,
  openingDue,
  feeDiscountType
) => {
  const discountedFeeTotal =
    calculateEffectiveFeeTotal(
      feeHeads,
      feeDiscountType
    );

  const finalOpeningDue =
    normalizeFeeValue(
      openingDue,
      "Opening due"
    );

  return (
    discountedFeeTotal +
    finalOpeningDue
  );
};

// =====================================================
// Get Effective Monthly Fee
// =====================================================

const getEffectiveMonthlyFee = (
  student,
  currentDate = new Date()
) => {
  const discountType =
    validateFeeDiscountType(
      student.feeDiscountType
    );

  const feeSnapshot =
    getFeeSnapshotForDate(
      student,
      currentDate
    ).fees;

  const monthlyFee =
    normalizeFeeValue(
      feeSnapshot.monthlyFee,
      "Monthly fee"
    );

  switch (
  discountType
  ) {
    case "SIBLING":
      return monthlyFee * 0.8;

    case "RTE":
      return 0;

    case "GIRL":
      return monthlyFee;

    case "NONE":
    default:
      return monthlyFee;
  }
};

// =====================================================
// Get Effective One-Time Fees
// =====================================================

const getEffectiveOneTimeFees = (
  student,
  currentDate = new Date()
) => {
  const discountType =
    validateFeeDiscountType(
      student.feeDiscountType
    );

  const feeSnapshot =
    getFeeSnapshotForDate(
      student,
      currentDate
    ).fees;

  const admissionFee =
    normalizeFeeValue(
      feeSnapshot.admissionFee,
      "Admission fee"
    );

  const examFee =
    normalizeFeeValue(
      feeSnapshot.examFee,
      "Exam fee"
    );

  const sportFee =
    normalizeFeeValue(
      feeSnapshot.sportFee,
      "Sport fee"
    );

  const computerFee =
    normalizeFeeValue(
      feeSnapshot.computerFee,
      "Computer fee"
    );

  const functionFee =
    normalizeFeeValue(
      feeSnapshot.functionFee,
      "Function fee"
    );

  const smartClassFee =
    normalizeFeeValue(
      feeSnapshot.smartClassFee,
      "Smart class fee"
    );

  const otherCharges =
    normalizeFeeValue(
      feeSnapshot.otherCharges,
      "Other charges"
    );

  // ===================================================
  // RTE
  // ===================================================
  //
  // RTE = 100% discount on all applicable fees
  //

  if (discountType === "RTE") {
    return 0;
  }

  // ===================================================
  // GIRL
  // ===================================================
  //
  // GIRL = 50% discount ONLY on Admission Fee
  //
  // Example:
  //
  // Admission = ₹110
  // Discount  = ₹55
  // Effective = ₹55
  //
  // Other fees remain unchanged.
  //

  let effectiveAdmissionFee =
    admissionFee;

  if (
    discountType === "GIRL"
  ) {
    effectiveAdmissionFee =
      admissionFee * 0.5;
  }

  // ===================================================
  // SIBLING
  // ===================================================
  //
  // SIBLING discount applies ONLY to Monthly Fee.
  //
  // Monthly fee is handled separately by
  // getEffectiveMonthlyFee().
  //
  // Therefore one-time fees remain unchanged.
  //

  return Number(
    (
      effectiveAdmissionFee +
      examFee +
      sportFee +
      computerFee +
      functionFee +
      smartClassFee +
      otherCharges
    ).toFixed(2)
  );
};

// =====================================================
// Calculate Accrued Months
// =====================================================


const calculateAccruedMonths = (
  feeStartDate,
  currentDate = new Date()
) => {
  const start =
    new Date(feeStartDate);

  const current =
    new Date(currentDate);

  if (
    Number.isNaN(
      start.getTime()
    )
  ) {
    return 0;
  }

  if (
    Number.isNaN(
      current.getTime()
    )
  ) {
    throw new Error(
      "Invalid current date"
    );
  }

  // ===================================================
  // TEST MODE
  // 1 minute = 1 month
  // ===================================================

  if (
    process.env.TEST_FEE_MODE ===
    "true"
  ) {
    const elapsedMilliseconds =
      current.getTime() -
      start.getTime();

    if (
      elapsedMilliseconds <= 0
    ) {
      return 1;
    }

    const elapsedMinutes =
      Math.floor(
        elapsedMilliseconds /
        (60 * 1000)
      );

    return (
      Math.max(
        elapsedMinutes,
        0
      ) + 1
    );
  }

  // ===================================================
  // Production Mode
  // ===================================================

  const startYear =
    start.getFullYear();

  const startMonth =
    start.getMonth();

  const currentYear =
    current.getFullYear();

  const currentMonth =
    current.getMonth();

  if (
    current <
    new Date(
      startYear,
      startMonth,
      1
    )
  ) {
    return 0;
  }

  return (
    (currentYear - startYear) *
    12 +
    (currentMonth -
      startMonth) +
    1
  );
};

// =====================================================
// Get Academic Year End Date
// =====================================================
//
// Example:
//
// Fee Start = August 2026
// Academic Year End = March 31, 2027
//
// Fee Start = January 2027
// Academic Year End = March 31, 2027
//
// Fee Start = April 2027
// Academic Year End = March 31, 2028
//
// =====================================================

const getAcademicYearEndDate = (
  feeStartDate
) => {
  const start =
    new Date(feeStartDate);

  if (
    Number.isNaN(
      start.getTime()
    )
  ) {
    return null;
  }

  const startMonth =
    start.getMonth();

  const startYear =
    start.getFullYear();

  // ===================================================
  // April to December
  // Academic year ends next year March
  // ===================================================

  if (
    startMonth >= 3
  ) {
    return new Date(
      startYear + 1,
      2,
      31,
      23,
      59,
      59,
      999
    );
  }

  // ===================================================
  // January to March
  // Academic year ends same year March
  // ===================================================

  return new Date(
    startYear,
    2,
    31,
    23,
    59,
    59,
    999
  );
};

// =====================================================
// Check Successful Lump Sum Payment
// =====================================================
//
// IMPORTANT:
//
// If at least one successful LUMP_SUM payment exists,
// future monthly fee will NOT be generated for the
// remaining months of the current academic year.
//
// Example:
//
// Monthly Fee = ₹1500
//
// Student pays complete LUMP_SUM amount.
//
// Then:
//
// Current month due = normal
// Future months      = ₹0
// Until March        = ₹0
//
// =====================================================

const hasActiveLumpSumPayment = async (
  student,
  currentDate = new Date()
) => {
  if (!student) {
    return false;
  }

  // ===================================================
  // TEST MODE
  // ===================================================
  //
  // In test mode we still check actual successful
  // lump-sum payment records.
  //

  const payments =
    await feeRepository.getLumpSumPayments(
      student.studentId
    );

  if (
    !Array.isArray(payments) ||
    payments.length === 0
  ) {
    return false;
  }

  const academicYearEnd =
    getAcademicYearEndDate(
      student.feeStartDate ||
      student.admissionDate
    );

  if (!academicYearEnd) {
    return false;
  }

  const current =
    new Date(currentDate);

  // ===================================================
  // If academic year is already over,
  // old lump-sum payment should not affect
  // next academic year.
  // ===================================================

  if (
    current >
    academicYearEnd
  ) {
    return false;
  }

  // ===================================================
  // Find valid lump-sum payment
  // ===================================================

  return payments.some(
    (payment) => {
      const paymentDate =
        new Date(
          payment.paymentDate ||
          payment.createdAt
        );

      if (
        Number.isNaN(
          paymentDate.getTime()
        )
      ) {
        return false;
      }

      // Payment must belong to current
      // academic year.

      return (
        paymentDate <=
        current &&
        paymentDate <=
        academicYearEnd
      );
    }
  );
};

// =====================================================
// Calculate Current Due Fee
// =====================================================
//
// Normal:
//
// Opening Due
// +
// One-Time Fees
// +
// Accrued Monthly Fees
// -
// Paid Fee
//
// Lump Sum:
//
// After successful LUMP_SUM payment:
//
// Opening Due
// +
// One-Time Fees
// +
// Already accrued monthly fees
// -
// Paid Fee
//
// Future monthly fees = 0
//
// =====================================================

const calculateCurrentDueFee = async (
  student
) => {
  if (
    !student ||
    !student.studentId
  ) {
    throw new Error(
      "Valid student is required"
    );
  }

  const feeCalculation =
    await calculateFeeByHead({
      studentId:
        student.studentId,

      feeHead: "ALL",
    });

  return Number(
    feeCalculation?.dueFee || 0
  );
};

// =====================================================
// Update Dynamic Due Fee
// =====================================================

const refreshStudentDueFee = async (
  student
) => {
  const dueFee =
    await calculateCurrentDueFee(
      student
    );

  // Dynamic due is calculated fresh for the response.
  // GET/search requests must not write to the database.
  student.dueFee =
    Number(
      dueFee.toFixed(2)
    );

  return student;
};

// =====================================================
// Get Student By Student ID
// =====================================================

const getActiveStudentByStudentId =
  async (
    studentId
  ) => {
    const student =
      await studentRepository.findByStudentId(
        studentId
      );

    if (!student) {
      throw new Error(
        "Student not found"
      );
    }

    if (
      student.status !==
      "ACTIVE"
    ) {
      throw new Error(
        "Student is not active"
      );
    }

    return student;
  };

// =====================================================
// Create Student
// ADMIN ONLY
// =====================================================

const createStudent = async (
  body,
  userId
) => {
  const {
    // admissionNo,
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

    admissionFee,
    monthlyFee,
    hasBusFacility,
    busFee,
    examFee,
    sportFee,
    computerFee,
    functionFee,
    smartClassFee,
    otherCharges,

    openingDue,

    feeDiscountType,
    feeStartFrom,


  } = body;

  // ===================================================
  // Duplicate Check
  // ===================================================

  const existingStudent =
    await studentRepository.findByAdmissionNo(
      // admissionNo,
      name,
      fatherName,
      motherName,
      className
    );

  if (
    existingStudent
  ) {
    // if (
    //   admissionNo &&
    //   existingStudent.admissionNo ===
    //   admissionNo
    // ) {
    //   throw new Error(
    //     "Student with this admission number already exists"
    //   );
    // }

    throw new Error(
      "Student with same name, father name, mother name and class already exists"
    );
  }

  // ===================================================
  // Generate Student ID
  // ===================================================

  const studentId =
    await generateStudentId();

  const admissionNo = await generateAdmissionNo();

  // ===================================================
  // Admission Date
  // ===================================================

  const finalAdmissionDate =
    admissionDate
      ? new Date(admissionDate)
      : new Date();

  if (
    Number.isNaN(
      finalAdmissionDate.getTime()
    )
  ) {
    throw new Error(
      "Invalid admission date"
    );
  }

  // ===================================================
  // Discount Type
  // ===================================================

  const finalFeeDiscountType =
    validateFeeDiscountType(
      feeDiscountType
    );

  // ===================================================
  // Fee Heads
  // ===================================================

  const feeHeads =
    validateFeeHeads({
      admissionFee,
      monthlyFee,
      examFee,
      sportFee,
      computerFee,
      functionFee,
      smartClassFee,
      otherCharges,
    });

  const finalHasBusFacility =
    hasBusFacility === true ||
    hasBusFacility === "true";

  const finalBusFee =
    normalizeFeeValue(
      busFee,
      "Bus fee"
    );

  if (
    finalHasBusFacility &&
    finalBusFee <= 0
  ) {
    throw new Error(
      "Bus fee must be greater than zero when bus facility is enabled"
    );
  }

  if (
    !finalHasBusFacility &&
    finalBusFee !== 0
  ) {
    throw new Error(
      "Bus fee must be zero when bus facility is disabled"
    );
  }

  // ===================================================
  // Opening Due
  // ===================================================

  const finalOpeningDue =
    normalizeFeeValue(
      openingDue,
      "Opening due"
    );

  // ===================================================
  // Total Fee
  // ===================================================

  const totalFee =
    calculateTotalFee(
      feeHeads,
      finalOpeningDue,
      finalFeeDiscountType
    );

  // ===================================================
  // Initial Paid
  // ===================================================

  const paidFee = 0;

  // ===================================================
  // Initial Due
  // ===================================================

  const dueFee =
    finalOpeningDue;

  // ===================================================
  // Fee Start Date
  // ===================================================

  // const feeStartDate =
  //   calculateFeeStartDate(
  //     finalAdmissionDate
  //   );


  const finalFeeStartFrom =
    feeStartFrom || "NEXT_MONTH";

  if (
    ![
      "ADMISSION_DATE",
      "NEXT_MONTH",
      "CUSTOM",
    ].includes(finalFeeStartFrom)
  ) {
    throw new Error(
      "Invalid fee start option"
    );
  }

  let feeStartDate;

  if (
    finalFeeStartFrom ===
    "ADMISSION_DATE"
  ) {
    feeStartDate =
      new Date(finalAdmissionDate);

  } else if (
    finalFeeStartFrom ===
    "NEXT_MONTH"
  ) {
    feeStartDate =
      calculateFeeStartDate(
        finalAdmissionDate
      );

  } else if (
    finalFeeStartFrom ===
    "CUSTOM"
  ) {
    if (!body.feeStartDate) {
      throw new Error(
        "Fee start date is required for CUSTOM option"
      );
    }

    feeStartDate =
      new Date(body.feeStartDate);

    if (
      Number.isNaN(
        feeStartDate.getTime()
      )
    ) {
      throw new Error(
        "Invalid fee start date"
      );
    }
  }

  // let feeStartDate;

  // if (
  //   finalFeeStartFrom ===
  //   "ADMISSION_DATE"
  // ) {
  //   feeStartDate =
  //     new Date(finalAdmissionDate);
  // } else if (
  //   finalFeeStartFrom ===
  //   "NEXT_MONTH"
  // ) {
  //   feeStartDate =
  //     calculateFeeStartDate(
  //       finalAdmissionDate
  //     );
  // } else {
  //   if (!body.feeStartDate) {
  //     throw new Error(
  //       "Fee start date is required for CUSTOM option"
  //     );
  //   }

  //   feeStartDate =
  //     new Date(body.feeStartDate);

  //   if (
  //     Number.isNaN(
  //       feeStartDate.getTime()
  //     )
  //   ) {
  //     throw new Error(
  //       "Invalid fee start date"
  //     );
  //   }
  // }

  // let feeStartDate;

  // if (
  //   finalFeeStartFrom ===
  //   "ADMISSION_DATE"
  // ) {
  //   feeStartDate =
  //     new Date(finalAdmissionDate);
  // } else {
  //   feeStartDate =
  //     calculateFeeStartDate(
  //       finalAdmissionDate
  //     );
  // }

  // ===================================================
  // Create Student
  // ===================================================

  const student =
    await studentRepository.createStudent({
      studentId,

      admissionNo,

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

      feeDiscountType:
        finalFeeDiscountType,

      admissionFee:
        feeHeads.admissionFee,

      monthlyFee:
        feeHeads.monthlyFee,

      hasBusFacility:
        finalHasBusFacility,

      busFee:
        finalBusFee,

      busFacilityStartEffectiveFrom:
        finalHasBusFacility
          ? feeStartDate
          : null,

      busFacilityHistory:
        finalHasBusFacility
          ? [
            {
              busFee:
                finalBusFee,
              effectiveFrom:
                feeStartDate,
              effectiveTo: null,
              status: "ACTIVE",
              startType:
                "ADMISSION",
              firstMonthProrated:
                false,
              coveredByExistingLumpSum:
                true,
              startedBy:
                userId,
              startedAt:
                new Date(),
            },
          ]
          : [],

      examFee:
        feeHeads.examFee,

      sportFee:
        feeHeads.sportFee,

      computerFee:
        feeHeads.computerFee,

      functionFee:
        feeHeads.functionFee,

      smartClassFee:
        feeHeads.smartClassFee,

      otherCharges:
        feeHeads.otherCharges,

      openingDue:
        finalOpeningDue,

      totalFee,

      paidFee,

      dueFee,

      feeStartFrom: finalFeeStartFrom,

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
  const students =
    await studentRepository.getAllStudents();

  if (
    !Array.isArray(students)
  ) {
    return [];
  }

  const updatedStudents =
    await Promise.all(
      students.map(
        async (student) => {
          if (
            student.status !==
            "ACTIVE"
          ) {
            return student;
          }

          return await refreshStudentDueFee(
            student
          );
        }
      )
    );

  return updatedStudents;
};

// =====================================================
// Get Student By ID
// =====================================================

const getStudentById = async (
  id
) => {
  const student =
    await studentRepository.getStudentById(
      id
    );

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  if (
    student.status ===
    "ACTIVE"
  ) {
    return await refreshStudentDueFee(
      student
    );
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
    await studentRepository.getStudentById(
      id
    );

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  if (
    body.className !== undefined
  ) {
    throw new Error(
      "Use the student promotion API to change class"
    );
  }

  // ===================================================
  // Protected Fields
  // ===================================================

  const {
    paidFee,
    dueFee,
    totalFee,
    studentId,
    isDeleted,
    createdBy,
    ...updateData
  } = body;

  // These fields cannot be updated directly
  delete updateData.paidFee;
  delete updateData.dueFee;
  delete updateData.totalFee;
  delete updateData.openingDue;
  delete updateData.studentId;
  delete updateData.isDeleted;
  delete updateData.createdBy;
  delete updateData.classPromotionHistory;
  delete updateData.hasBusFacility;
  delete updateData.busFee;
  delete updateData.busFacilityHistory;
  delete updateData.busFacilityStartEffectiveFrom;
  delete updateData.busFacilityStopEffectiveFrom;
  delete updateData.busFacilityStoppedAt;
  delete updateData.busFacilityStoppedBy;
  delete updateData.busFeeRefunds;
  delete updateData.lateFeeWaivers;
  delete updateData.lateFeeWaived;
  delete updateData.lateFeeWaiverAmount;
  delete updateData.lateFeeWaiverReason;

  // ===================================================
  // Discount Validation
  // ===================================================

  if (
    updateData.feeDiscountType !==
    undefined
  ) {
    updateData.feeDiscountType =
      validateFeeDiscountType(
        updateData.feeDiscountType
      );
  }

  // ===================================================
  // Admission Date
  // ===================================================

  if (
    updateData.admissionDate !==
    undefined
  ) {
    const newAdmissionDate =
      new Date(
        updateData.admissionDate
      );

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
  }

  // ===================================================
  // Fee Start From / Fee Start Date
  //
  // Supported:
  // ADMISSION_DATE
  // NEXT_MONTH
  // CUSTOM
  // ===================================================

  if (
    updateData.feeStartFrom !==
    undefined ||
    updateData.feeStartDate !==
    undefined ||
    updateData.admissionDate !==
    undefined
  ) {
    const finalFeeStartFrom =
      updateData.feeStartFrom ??
      student.feeStartFrom ??
      "NEXT_MONTH";

    // -------------------------------------------------
    // Validate Fee Start Option
    // -------------------------------------------------

    if (
      ![
        "ADMISSION_DATE",
        "NEXT_MONTH",
        "CUSTOM",
      ].includes(
        finalFeeStartFrom
      )
    ) {
      throw new Error(
        "Invalid fee start option"
      );
    }

    // -------------------------------------------------
    // Final Admission Date
    // -------------------------------------------------

    const finalAdmissionDate =
      updateData.admissionDate
        ? new Date(
          updateData.admissionDate
        )
        : new Date(
          student.admissionDate
        );

    if (
      Number.isNaN(
        finalAdmissionDate.getTime()
      )
    ) {
      throw new Error(
        "Invalid admission date"
      );
    }

    // -------------------------------------------------
    // ADMISSION_DATE
    // -------------------------------------------------

    if (
      finalFeeStartFrom ===
      "ADMISSION_DATE"
    ) {
      updateData.feeStartDate =
        new Date(
          finalAdmissionDate
        );
    }

    // -------------------------------------------------
    // NEXT_MONTH
    // -------------------------------------------------

    else if (
      finalFeeStartFrom ===
      "NEXT_MONTH"
    ) {
      updateData.feeStartDate =
        calculateFeeStartDate(
          finalAdmissionDate
        );
    }

    // -------------------------------------------------
    // CUSTOM
    // -------------------------------------------------

    else if (
      finalFeeStartFrom ===
      "CUSTOM"
    ) {
      const customFeeStartDate =
        updateData.feeStartDate
          ? new Date(
            updateData.feeStartDate
          )
          : student.feeStartDate
            ? new Date(
              student.feeStartDate
            )
            : null;

      if (
        !customFeeStartDate ||
        Number.isNaN(
          customFeeStartDate.getTime()
        )
      ) {
        throw new Error(
          "Valid fee start date is required for CUSTOM option"
        );
      }

      updateData.feeStartDate =
        customFeeStartDate;
    }

    // -------------------------------------------------
    // Save Fee Start Option
    // -------------------------------------------------

    updateData.feeStartFrom =
      finalFeeStartFrom;
  }

  // ===================================================
  // Current Fee Heads
  // ===================================================

  const currentFeeHeads = {
    admissionFee:
      Number(
        student.admissionFee || 0
      ),

    monthlyFee:
      Number(
        student.monthlyFee || 0
      ),

    examFee:
      Number(
        student.examFee || 0
      ),

    sportFee:
      Number(
        student.sportFee || 0
      ),

    computerFee:
      Number(
        student.computerFee || 0
      ),

    functionFee:
      Number(
        student.functionFee || 0
      ),

    smartClassFee:
      Number(
        student.smartClassFee || 0
      ),

    otherCharges:
      Number(
        student.otherCharges || 0
      ),
  };

  // ===================================================
  // Check Fee Fields Updated
  // ===================================================

  const feeFieldsUpdated =
    FEE_HEADS.some(
      (field) =>
        updateData[field] !==
        undefined
    );

  // ===================================================
  // Updated Fee Heads
  // ===================================================

  const updatedFeeHeads =
    validateFeeHeads({
      admissionFee:
        updateData.admissionFee !==
          undefined
          ? updateData.admissionFee
          : currentFeeHeads.admissionFee,

      monthlyFee:
        updateData.monthlyFee !==
          undefined
          ? updateData.monthlyFee
          : currentFeeHeads.monthlyFee,

      examFee:
        updateData.examFee !==
          undefined
          ? updateData.examFee
          : currentFeeHeads.examFee,

      sportFee:
        updateData.sportFee !==
          undefined
          ? updateData.sportFee
          : currentFeeHeads.sportFee,

      computerFee:
        updateData.computerFee !==
          undefined
          ? updateData.computerFee
          : currentFeeHeads.computerFee,

      functionFee:
        updateData.functionFee !==
          undefined
          ? updateData.functionFee
          : currentFeeHeads.functionFee,

      smartClassFee:
        updateData.smartClassFee !==
          undefined
          ? updateData.smartClassFee
          : currentFeeHeads.smartClassFee,

      otherCharges:
        updateData.otherCharges !==
          undefined
          ? updateData.otherCharges
          : currentFeeHeads.otherCharges,
    });

  // ===================================================
  // Save Updated Fee Heads
  // ===================================================

  if (
    feeFieldsUpdated
  ) {
    updateData.admissionFee =
      updatedFeeHeads.admissionFee;

    updateData.monthlyFee =
      updatedFeeHeads.monthlyFee;

    updateData.examFee =
      updatedFeeHeads.examFee;

    updateData.sportFee =
      updatedFeeHeads.sportFee;

    updateData.computerFee =
      updatedFeeHeads.computerFee;

    updateData.functionFee =
      updatedFeeHeads.functionFee;

    updateData.smartClassFee =
      updatedFeeHeads.smartClassFee;

    updateData.otherCharges =
      updatedFeeHeads.otherCharges;
  }

  // ===================================================
  // Final Discount Type
  // ===================================================

  const finalDiscountType =
    updateData.feeDiscountType !==
      undefined
      ? updateData.feeDiscountType
      : student.feeDiscountType ||
      "NONE";

  // ===================================================
  // Recalculate Total Fee
  // ===================================================

  if (
    feeFieldsUpdated ||
    updateData.feeDiscountType !==
    undefined
  ) {
    const finalOpeningDue =
      Number(
        student.openingDue || 0
      );

    updateData.totalFee =
      calculateTotalFee(
        updatedFeeHeads,
        finalOpeningDue,
        finalDiscountType
      );
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
  // Updated By
  // ===================================================

  updateData.updatedBy =
    userId;

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

  // ===================================================
  // Refresh Due
  // ===================================================

  return await refreshStudentDueFee(
    updatedStudent
  );
};

// =====================================================
// Promote Student
// ADMIN ONLY
// =====================================================
//
// The student's class changes immediately, but the new
// class fee snapshot is used from the next fee month.
// Previous paid fee and fee history are never replaced.
//
// =====================================================
const promoteStudent = async (
  body = {},
  userId
) => {
  const studentId = String(
    body.studentId || ""
  ).trim();

  const toClass = String(
    body.toClass || ""
  ).trim();

  const inputRemarks = String(
    body.remarks || ""
  ).trim();

  if (!studentId) {
    throw new Error(
      "Student ID is required"
    );
  }

  if (!toClass) {
    throw new Error(
      "Promoted class is required"
    );
  }

  if (!userId) {
    throw new Error(
      "Promoting user is required"
    );
  }

  const student =
    await studentRepository
      .findByStudentId(studentId);

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  if (student.status !== "ACTIVE") {
    throw new Error(
      "Student is not active"
    );
  }

  const fromClass = String(
    student.className || ""
  ).trim();

  if (!fromClass) {
    throw new Error(
      "Student current class is missing"
    );
  }

  /*
   * Promotion उसी class में दोबारा
   * नहीं की जा सकती।
   */
  if (fromClass === toClass) {
    const error = new Error(
      `Student is already in Class ${toClass}`
    );

    error.statusCode = 409;
    error.code =
      "STUDENT_ALREADY_IN_CLASS";

    throw error;
  }

  const now = new Date();

  /*
   * Target class की active
   * fee structure प्राप्त करें।
   */
  const feeStructure =
    await feeStructureRepository
      .getFeeStructureByClass(
        toClass
      );

  if (!feeStructure) {
    throw new Error(
      `Active fee structure for Class ${toClass} not found`
    );
  }

  /*
   * Section request में नहीं आने पर
   * existing section इस्तेमाल होगी।
   */
  const toSection =
    body.section !== undefined
      ? String(
          body.section || ""
        ).trim()
      : String(
          student.section || ""
        ).trim();

  /*
   * Promotion से पहले की applicable
   * fee structure snapshot।
   */
  const currentSnapshot =
    getFeeSnapshotForDate(
      student,
      now
    );

  const fromFees =
    getFeeSnapshot(
      currentSnapshot.fees
    );

  /*
   * नई class की fee structure।
   */
  const newClassFees =
    getFeeSnapshot(
      feeStructure
    );

  /*
   * Promotion पर नई admission fee
   * apply नहीं होगी।
   *
   * Student की existing admission fee
   * unchanged रखी जाएगी।
   */
  const toFees = {
    ...newClassFees,

    admissionFee:
      normalizeFeeValue(
        student.admissionFee,
        "Admission fee"
      ),
  };

  /*
   * Promotion due calculate करते समय
   * admission fee पूरी तरह exclude होगी।
   */
  const discountedPromotionFees =
    calculateDiscountedFeeHeads(
      {
        ...toFees,
        admissionFee: 0,
      },
      student.feeDiscountType ||
        "NONE"
    );

  /*
   * नई class की applicable fees
   * existing dueFee में add होंगी।
   */
  const promotionDueAmount =
    Number(
      (
        discountedPromotionFees
          .monthlyFee +
        discountedPromotionFees
          .examFee +
        discountedPromotionFees
          .sportFee +
        discountedPromotionFees
          .computerFee +
        discountedPromotionFees
          .functionFee +
        discountedPromotionFees
          .smartClassFee +
        discountedPromotionFees
          .otherCharges
      ).toFixed(2)
    );

  /*
   * Promotion तुरंत effective होगी।
   */
  const effectiveFrom = now;

  /*
   * Remarks manually नहीं मिलने पर
   * system सही classes के आधार पर
   * remarks बनाएगा।
   */
  const finalRemarks =
    inputRemarks ||
    `Promoted from Class ${fromClass} to Class ${toClass}`;

  const promotion = {
    fromClass,
    toClass,

    fromSection:
      String(
        student.section || ""
      ).trim(),

    toSection,

    effectiveFrom,

    fromFees,
    toFees,

    feeStructure:
      feeStructure._id,

    status: "APPLIED",

    appliedAt:
      now,

    remarks:
      finalRemarks,

    promotedBy:
      userId,

    promotedAt:
      now,
  };

  /*
   * नई class के आधार पर total fee
   * calculate करें।
   */
  const totalFee =
    calculateTotalFee(
      toFees,
      Number(
        student.openingDue || 0
      ),
      student.feeDiscountType ||
        "NONE"
    );

  /*
   * Student class, section, fees,
   * due और promotion history update करें।
   */
  const updatedStudent =
    await studentRepository
      .promoteStudent(
        student._id,
        {
          className:
            toClass,

          section:
            toSection,

          ...toFees,

          totalFee,

          promotionDueAmount,

          promotion,

          updatedBy:
            userId,
        }
      );

  if (!updatedStudent) {
    throw new Error(
      "Student promotion failed"
    );
  }

  return {
    studentId:
      updatedStudent.studentId,

    studentName:
      updatedStudent.name,

    previousClass:
      fromClass,

    promotedClass:
      toClass,

    previousSection:
      String(
        student.section || ""
      ).trim(),

    promotedSection:
      toSection,

    effectiveFrom,

    promotionStatus:
      "APPLIED",

    previousMonthlyFee:
      Number(
        fromFees.monthlyFee || 0
      ),

    promotedMonthlyFee:
      Number(
        toFees.monthlyFee || 0
      ),

    feeDiscountType:
      updatedStudent
        .feeDiscountType,

    paidFee:
      Number(
        updatedStudent.paidFee || 0
      ),

    dueFee:
      Number(
        updatedStudent.dueFee || 0
      ),

    promotionDueAdded:
      promotionDueAmount,

    admissionFee:
      Number(
        updatedStudent
          .admissionFee || 0
      ),

    remarks:
      finalRemarks,
  };
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
    await studentRepository.getStudentById(
      id
    );

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

const searchStudent = async (
  search
) => {
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

  const students =
    await studentRepository.searchStudent(
      cleanSearch
    );

  // ===================================================
  // Student Not Found
  // ===================================================

  if (
    !students ||
    students.length === 0
  ) {
    throw new Error(
      "Student not found"
    );
  }

  // ===================================================
  // Refresh Due + Lump Sum Preview
  // ===================================================

  const result = [];

  for (const student of students) {

    // ===============================================
    // Refresh Due
    // ===============================================

    const updatedStudent =
      await refreshStudentDueFee(
        student
      );

    // ===============================================
    // Lump Sum Preview
    // ===============================================

    const lumpSumPreview =
      await getLumpSumPreview(
        updatedStudent.studentId
      );

    // ===============================================
    // Response
    // ===============================================

    result.push({
      id:
        updatedStudent._id, 
      studentId:
        updatedStudent.studentId,

      name:
        updatedStudent.name,

      fatherName:
        updatedStudent.fatherName,

      motherName:
        updatedStudent.motherName,

      admissionNo:
        updatedStudent.admissionNo,

      mobile:
        updatedStudent.mobile,

      email:
        updatedStudent.email,

      gender:
        updatedStudent.gender,

      dob:
        updatedStudent.dob,

      className:
        updatedStudent.className,

      section:
        updatedStudent.section,

      monthlyFee:
        Number(
          updatedStudent.monthlyFee || 0
        ),

      feeDiscountType:
        updatedStudent.feeDiscountType ||
        "NONE",

      dueFee:
        Number(
          updatedStudent.dueFee || 0
        ),

      lumpSumPreview,

      status:
        updatedStudent.status,
    });
  }

  // ===================================================
  // Return
  // ===================================================

  return result;
};

// =====================================================
// Get Current Due Fee
// =====================================================

const getCurrentDueFee = async (
  student
) => {
  return await calculateCurrentDueFee(
    student
  );
};

// =====================================================
// BUS Facility Stop + CASH Refund Helpers
// =====================================================

const normalizeBusStopEffectiveFrom = (
  value,
  currentDate = new Date()
) => {
  const input =
    String(value || "").trim();

  const match =
    input.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

  if (!match) {
    throw new Error(
      "Bus stop effective date must be in YYYY-MM-DD format"
    );
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const effectiveFrom =
    new Date(
      year,
      month - 1,
      day,
      0,
      0,
      0,
      0
    );

  if (
    effectiveFrom.getFullYear() !==
      year ||
    effectiveFrom.getMonth() !==
      month - 1 ||
    effectiveFrom.getDate() !== day
  ) {
    throw new Error(
      "Invalid bus stop effective date"
    );
  }

  const now =
    new Date(currentDate);

  if (
    Number.isNaN(now.getTime())
  ) {
    throw new Error(
      "Invalid current date"
    );
  }

  const nextMonthStart =
    new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
      0,
      0,
      0,
      0
    );

  if (
    effectiveFrom.getTime() !==
    nextMonthStart.getTime()
  ) {
    throw new Error(
      `Bus facility can only stop from next month: ${nextMonthStart.getFullYear()}-${String(
        nextMonthStart.getMonth() + 1
      ).padStart(2, "0")}-01`
    );
  }

  return effectiveFrom;
};

const getBusRefundAcademicYearEnd = (
  effectiveFrom
) => {
  const date =
    new Date(effectiveFrom);

  const academicStartYear =
    date.getMonth() >= 3
      ? date.getFullYear()
      : date.getFullYear() - 1;

  return new Date(
    academicStartYear + 1,
    2,
    31,
    23,
    59,
    59,
    999
  );
};

const getGrossPaidBusFee = (
  history = []
) => {
  const total =
    (
      Array.isArray(history)
        ? history
        : []
    ).reduce(
      (sum, fee) => {
        if (
          String(
            fee?.paymentStatus || ""
          )
            .trim()
            .toUpperCase() !==
          "SUCCESS"
        ) {
          return sum;
        }

        const feeBreakdown =
          typeof fee?.feeBreakdown
            ?.toObject === "function"
            ? fee.feeBreakdown
              .toObject()
            : fee?.feeBreakdown;

        const allocatedBusFee =
          Number(
            feeBreakdown?.BUS || 0
          );

        if (
          Number.isFinite(
            allocatedBusFee
          ) &&
          allocatedBusFee > 0
        ) {
          return sum +
            allocatedBusFee;
        }

        if (
          String(fee?.feeHead || "")
            .trim()
            .toUpperCase() !== "BUS"
        ) {
          return sum;
        }

        const amount =
          Number(fee?.amount || 0);

        return (
          Number.isFinite(amount) &&
          amount > 0
        )
          ? sum + amount
          : sum;
      },
      0
    );

  return Number(total.toFixed(2));
};

const getGrossSuccessfulPaymentTotal = (
  history = []
) => {
  const total =
    (
      Array.isArray(history)
        ? history
        : []
    ).reduce(
      (sum, fee) => {
        if (
          String(
            fee?.paymentStatus || ""
          )
            .trim()
            .toUpperCase() !==
          "SUCCESS"
        ) {
          return sum;
        }

        const amount =
          Number(fee?.amount || 0);

        return (
          Number.isFinite(amount) &&
          amount > 0
        )
          ? sum + amount
          : sum;
      },
      0
    );

  return Number(total.toFixed(2));
};

const getCompletedBusRefundTotal = (
  student
) => {
  const total =
    (
      Array.isArray(
        student?.busFeeRefunds
      )
        ? student.busFeeRefunds
        : []
    ).reduce(
      (sum, refund) => {
        const amount =
          Number(refund?.amount || 0);

        if (
          String(refund?.status || "")
            .trim()
            .toUpperCase() !==
              "COMPLETED" ||
          !Number.isFinite(amount) ||
          amount <= 0
        ) {
          return sum;
        }

        return sum + amount;
      },
      0
    );

  return Number(total.toFixed(2));
};

const getBusWaiverContext = async (
  startDate,
  endDate
) => {
  const waivers =
    await monthlyFeeWaiverRepository
      .getActiveMonthlyFeeWaivers({
        startMonth:
          getCalendarMonthKey(
            startDate
          ),
        endMonth:
          getCalendarMonthKey(
            endDate
          ),
      });

  return {
    monthKeys:
      waivers.map(
        (waiver) => waiver.month
      ),
    waivers:
      waivers.map((waiver) => ({
        academicYear:
          waiver.academicYear,
        month: waiver.month,
        monthName:
          waiver.monthName,
        reason: waiver.reason,
      })),
  };
};

// =====================================================
// Start Or Restart BUS Facility
// =====================================================

const normalizeBusStartEffectiveFrom = (
  value,
  currentDate = new Date()
) => {
  const input =
    String(value || "").trim();

  const match =
    input.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

  if (!match) {
    throw new Error(
      "Bus start effective date must be in YYYY-MM-DD format"
    );
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const effectiveFrom =
    new Date(
      year,
      month - 1,
      day,
      0,
      0,
      0,
      0
    );

  if (
    effectiveFrom.getFullYear() !==
      year ||
    effectiveFrom.getMonth() !==
      month - 1 ||
    effectiveFrom.getDate() !== day
  ) {
    throw new Error(
      "Invalid bus start effective date"
    );
  }

  const now = new Date(currentDate);

  if (Number.isNaN(now.getTime())) {
    throw new Error(
      "Invalid current date"
    );
  }

  const currentMonthStart =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0
    );

  if (
    effectiveFrom <
    currentMonthStart
  ) {
    throw new Error(
      "Bus facility cannot start before the current month"
    );
  }

  return effectiveFrom;
};

const startBusFacility = async (
  studentId,
  body = {},
  userId,
  currentDate = new Date()
) => {
  const protectedFields = [
    "firstMonthBusFee",
    "daysInStartMonth",
    "chargeableDays",
    "fullMonthlyFeeFrom",
    "firstMonthProrated",
    "coveredByExistingLumpSum",
  ];

  if (
    protectedFields.some((field) =>
      Object.prototype
        .hasOwnProperty.call(
          body,
          field
        )
    )
  ) {
    throw new Error(
      "First-month BUS fee and proration details are calculated by the server"
    );
  }

  const student =
    await getActiveStudentByStudentId(
      String(studentId || "")
        .trim()
    );

  if (
    student.hasBusFacility ===
    true
  ) {
    throw new Error(
      "Student already has an active bus facility"
    );
  }

  const busFee =
    Number(body.busFee);

  if (
    !Number.isFinite(busFee) ||
    busFee <= 0
  ) {
    throw new Error(
      "Bus fee must be greater than zero"
    );
  }

  const finalBusFee =
    Number(busFee.toFixed(2));

  const reason =
    String(body.reason || "")
      .trim();

  if (
    reason.length < 3 ||
    reason.length > 250
  ) {
    throw new Error(
      "Bus start reason must contain 3 to 250 characters"
    );
  }

  const effectiveFrom =
    normalizeBusStartEffectiveFrom(
      body.effectiveFrom,
      currentDate
    );

  const feeStartDate =
    new Date(student.feeStartDate);

  if (
    Number.isNaN(
      feeStartDate.getTime()
    )
  ) {
    throw new Error(
      "Fee start date is not configured for this student"
    );
  }

  const feeStartMonth =
    new Date(
      feeStartDate.getFullYear(),
      feeStartDate.getMonth(),
      1
    );

  const busStartMonth =
    new Date(
      effectiveFrom.getFullYear(),
      effectiveFrom.getMonth(),
      1
    );

  if (busStartMonth < feeStartMonth) {
    throw new Error(
      "Bus facility cannot start before the student's fee start month"
    );
  }

  const history =
    Array.isArray(
      student.busFacilityHistory
    )
      ? student.busFacilityHistory
      : [];

  const previousPeriods =
    history
      .map((period) =>
        typeof period?.toObject ===
          "function"
          ? period.toObject()
          : { ...period }
      )
      .sort(
        (first, second) =>
          new Date(
            first.effectiveFrom
          ) -
          new Date(
            second.effectiveFrom
          )
      );

  const latestPeriod =
    previousPeriods.length > 0
      ? previousPeriods[
        previousPeriods.length - 1
      ]
      : null;

  if (latestPeriod) {
    const previousEffectiveTo =
      latestPeriod.effectiveTo
        ? new Date(
          latestPeriod.effectiveTo
        )
        : null;

    if (
      !previousEffectiveTo ||
      Number.isNaN(
        previousEffectiveTo
          .getTime()
      )
    ) {
      throw new Error(
        "Previous bus facility period is not closed"
      );
    }

    if (
      effectiveFrom <=
      previousEffectiveTo
    ) {
      throw new Error(
        "Bus restart date must be after the previous bus facility period"
      );
    }
  }

  const daysInStartMonth =
    new Date(
      effectiveFrom.getFullYear(),
      effectiveFrom.getMonth() + 1,
      0
    ).getDate();

  const chargeableDays =
    daysInStartMonth -
    effectiveFrom.getDate() +
    1;

  const firstMonthBusFee =
    Number(
      (
        finalBusFee /
        daysInStartMonth *
        chargeableDays
      ).toFixed(2)
    );

  const fullMonthlyFeeFrom =
    new Date(
      effectiveFrom.getFullYear(),
      effectiveFrom.getMonth() + 1,
      1,
      0,
      0,
      0,
      0
    );

  const startMonth =
    getCalendarMonthKey(
      effectiveFrom
    );

  const waiverContext =
    await getBusWaiverContext(
      effectiveFrom,
      effectiveFrom
    );

  const isStartMonthWaived =
    waiverContext.monthKeys
      .includes(startMonth);

  const startType =
    previousPeriods.length > 0
      ? "RESTART"
      : "LATER_START";

  const startedAt =
    new Date(currentDate);

  const period = {
    busFee: finalBusFee,
    effectiveFrom,
    effectiveTo: null,
    status: "ACTIVE",
    startType,
    firstMonthProrated:
      effectiveFrom.getDate() !==
      1,
    daysInStartMonth,
    chargeableDays,
    firstMonthBusFee,
    fullMonthlyFeeFrom,
    coveredByExistingLumpSum:
      false,
    startReason: reason,
    startedBy: userId,
    startedAt,
  };

  const updatedStudent =
    await studentRepository
      .startBusFacility({
        studentId:
          student.studentId,
        busFee: finalBusFee,
        busFacilityStartEffectiveFrom:
          effectiveFrom,
        period,
        updatedBy: userId,
      });

  if (!updatedStudent) {
    throw new Error(
      "Bus facility is already active or was changed by another request"
    );
  }

  let finalStudent =
    updatedStudent;

  let dueFeeRefreshPending =
    false;

  try {
    const currentFeeCalculation =
      await calculateFeeByHead({
        studentId:
          student.studentId,
        feeHead: "ALL",
      });

    finalStudent =
      await studentRepository
        .updateDueFee(
          updatedStudent._id,
          Number(
            currentFeeCalculation
              .dueFee || 0
          )
        ) || updatedStudent;
  } catch (error) {
    dueFeeRefreshPending = true;
  }

  return {
    student: {
      studentId:
        finalStudent.studentId,
      name: finalStudent.name,
      hasBusFacility: true,
      busFee: finalBusFee,
      busFacilityStartEffectiveFrom:
        effectiveFrom,
      dueFee:
        Number(
          finalStudent.dueFee || 0
        ),
    },
    startType,
    effectiveFrom,
    daysInStartMonth,
    chargeableDays,
    calculatedFirstMonthBusFee:
      firstMonthBusFee,
    payableFirstMonthBusFee:
      isStartMonthWaived
        ? 0
        : firstMonthBusFee,
    isStartMonthWaived,
    fullMonthlyFeeFrom,
    fullMonthlyBusFee:
      finalBusFee,
    dueFeeRefreshPending,
  };
};

const previewBusFacilityCashRefund =
  async (
    studentId,
    body = {},
    currentDate = new Date()
  ) => {
    const student =
      await getActiveStudentByStudentId(
        String(studentId || "")
          .trim()
      );

    const currentBusFee =
      Number(student.busFee || 0);

    if (
      student.hasBusFacility !==
        true ||
      !Number.isFinite(
        currentBusFee
      ) ||
      currentBusFee <= 0
    ) {
      throw new Error(
        "Student does not have an active bus facility"
      );
    }

    const reason =
      String(body.reason || "")
        .trim();

    if (
      reason.length < 3 ||
      reason.length > 250
    ) {
      throw new Error(
        "Bus stop reason must contain 3 to 250 characters"
      );
    }

    if (
      body.refundMode !==
        undefined &&
      String(body.refundMode)
        .trim()
        .toUpperCase() !== "CASH"
    ) {
      throw new Error(
        "Bus fee refund mode must be CASH"
      );
    }

    const effectiveFrom =
      normalizeBusStopEffectiveFrom(
        body.effectiveFrom,
        currentDate
      );

    const lastBusChargeDate =
      new Date(
        effectiveFrom.getTime() - 1
      );

    const feeStartDate =
      new Date(
        student.feeStartDate
      );

    if (
      Number.isNaN(
        feeStartDate.getTime()
      )
    ) {
      throw new Error(
        "Fee start date is not configured for this student"
      );
    }

    const academicYearEnd =
      getBusRefundAcademicYearEnd(
        effectiveFrom
      );

    const waiverContext =
      await getBusWaiverContext(
        feeStartDate,
        academicYearEnd
      );

    const usedBusCalculation =
      calculateAccruedBusFee({
        student,
        feeStartDate,
        currentDate:
          lastBusChargeDate,
        waivedMonths:
          waiverContext.monthKeys,
      });

    const paymentHistory =
      await feeRepository
        .getFeeHistory(
          student.studentId
        );

    const totalBusFeePaid =
      getGrossPaidBusFee(
        paymentHistory
      );

    const grossTotalFeePaid =
      getGrossSuccessfulPaymentTotal(
        paymentHistory
      );

    const previousBusRefunds =
      getCompletedBusRefundTotal(
        student
      );

    const netBusFeePaid =
      Number(
        Math.max(
          totalBusFeePaid -
          previousBusRefunds,
          0
        ).toFixed(2)
      );

    const netTotalFeePaid =
      Number(
        Math.max(
          grossTotalFeePaid -
          previousBusRefunds,
          0
        ).toFixed(2)
      );

    const usedBusFee =
      Number(
        usedBusCalculation.total
          .toFixed(2)
      );

    const refundAmount =
      Number(
        Math.max(
          netBusFeePaid -
          usedBusFee,
          0
        ).toFixed(2)
      );

    const futureBusCalculation =
      calculateAccruedBusFee({
        student: {
          hasBusFacility: true,
          busFee: currentBusFee,
          busFacilityHistory: [
            {
              busFee:
                currentBusFee,
              effectiveFrom,
              effectiveTo:
                academicYearEnd,
              status: "ACTIVE",
            },
          ],
        },
        feeStartDate:
          effectiveFrom,
        currentDate:
          academicYearEnd,
        waivedMonths:
          waiverContext.monthKeys,
      });

    let remainingRefund =
      refundAmount;

    const refundableMonthDetails = [];

    for (
      const detail of
      futureBusCalculation.details
    ) {
      if (remainingRefund <= 0) {
        break;
      }

      const month =
        String(
          detail.feeMonth ||
          detail.month || ""
        ).trim();

      const monthBusFee =
        Number(
          detail.effectiveBusFee ||
          0
        );

      const amount =
        Math.min(
          remainingRefund,
          monthBusFee
        );

      if (amount <= 0) {
        continue;
      }

      refundableMonthDetails.push({
        month,
        amount:
          Number(amount.toFixed(2)),
      });

      remainingRefund =
        Number(
          Math.max(
            remainingRefund -
            amount,
            0
          ).toFixed(2)
        );
    }

    return {
      studentId:
        student.studentId,
      name: student.name,
      hasBusFacility: true,
      monthlyBusFee:
        Number(
          currentBusFee.toFixed(2)
        ),
      refundMode: "CASH",
      effectiveFrom,
      lastBusChargeDate,
      lastBusChargeMonth:
        getCalendarMonthKey(
          lastBusChargeDate
        ),
      totalBusFeePaid,
      grossTotalFeePaid,
      previousBusRefunds,
      netBusFeePaid,
      netTotalFeePaid,
      usedBusMonths:
        usedBusCalculation
          .accruedMonths,
      usedBusFee,
      refundAmount,
      refundableMonths:
        refundableMonthDetails
          .map((detail) =>
            detail.month
          ),
      refundableMonthDetails,
      waivedBusFeeMonths:
        waiverContext.waivers,
      reason,
    };
  };

const stopBusFacilityWithCashRefund =
  async (
    studentId,
    body = {},
    userId
  ) => {
    if (
      body.confirmCashRefund !==
        true &&
      body.confirmCashRefund !==
        "true"
    ) {
      throw new Error(
        "Cash refund confirmation is required"
      );
    }

    const preview =
      await previewBusFacilityCashRefund(
        studentId,
        body
      );

    const student =
      await getActiveStudentByStudentId(
        preview.studentId
      );

    const receivedBy =
      String(body.receivedBy || "")
        .trim();

    if (
      preview.refundAmount > 0 &&
      (
        receivedBy.length < 2 ||
        receivedBy.length > 100
      )
    ) {
      throw new Error(
        "Received by is required for CASH refund"
      );
    }

    const cachedPaidFee =
      Number(student.paidFee || 0);

    const currentPaidFee =
      preview.grossTotalFeePaid > 0
        ? preview.netTotalFeePaid
        : cachedPaidFee;

    if (
      preview.refundAmount >
      currentPaidFee + 0.01
    ) {
      throw new Error(
        "Bus refund amount cannot be greater than total paid fee"
      );
    }

    const stoppedAt =
      new Date();

    const history =
      (
        Array.isArray(
          student.busFacilityHistory
        )
          ? student
            .busFacilityHistory
          : []
      ).map((period) =>
        typeof period?.toObject ===
          "function"
          ? period.toObject()
          : { ...period }
      );

    let activePeriodIndex = -1;

    for (
      let index =
        history.length - 1;
      index >= 0;
      index -= 1
    ) {
      if (
        !history[index]
          .effectiveTo &&
        String(
          history[index].status ||
          "ACTIVE"
        )
          .trim()
          .toUpperCase() ===
          "ACTIVE"
      ) {
        activePeriodIndex = index;
        break;
      }
    }

    const stoppedPeriodData = {
      effectiveTo:
        preview.lastBusChargeDate,
      status: "STOPPED",
      stopReason:
        preview.reason,
      stoppedBy: userId,
      stoppedAt,
    };

    if (activePeriodIndex >= 0) {
      history[activePeriodIndex] = {
        ...history[
          activePeriodIndex
        ],
        ...stoppedPeriodData,
      };
    } else {
      history.push({
        busFee:
          preview.monthlyBusFee,
        effectiveFrom:
          student.feeStartDate,
        startedBy:
          student.createdBy || null,
        startedAt:
          student.createdAt ||
          stoppedAt,
        ...stoppedPeriodData,
      });
    }

    let refund = null;

    if (preview.refundAmount > 0) {
      const refundNo =
        await generateBusRefundNo();

      refund = {
        refundNo,
        amount:
          preview.refundAmount,
        refundMode: "CASH",
        status: "COMPLETED",
        effectiveFrom:
          preview.effectiveFrom,
        lastBusChargeDate:
          preview.lastBusChargeDate,
        refundableMonths:
          preview.refundableMonths,
        refundableMonthDetails:
          preview
            .refundableMonthDetails,
        reason: preview.reason,
        receivedBy,
        remarks:
          String(
            body.remarks || ""
          ).trim(),
        refundedBy: userId,
        refundedAt: stoppedAt,
      };
    }

    const newPaidFee =
      Number(
        Math.max(
          currentPaidFee -
          preview.refundAmount,
          0
        ).toFixed(2)
      );

    const updatedStudent =
      await studentRepository
        .stopBusFacility({
          studentId:
            student.studentId,
          busFacilityHistory:
            history,
          busFacilityStopEffectiveFrom:
            preview.effectiveFrom,
          busFacilityStoppedAt:
            stoppedAt,
          busFacilityStoppedBy:
            userId,
          paidFee:
            newPaidFee,
          refund,
        });

    if (!updatedStudent) {
      throw new Error(
        "Bus facility is already stopped or was changed by another request"
      );
    }

    let finalStudent =
      updatedStudent;

    let dueFeeRefreshPending =
      false;

    try {
      const currentFeeCalculation =
        await calculateFeeByHead({
          studentId:
            student.studentId,
          feeHead: "ALL",
        });

      finalStudent =
        await studentRepository
          .updateDueFee(
            updatedStudent._id,
            Number(
              currentFeeCalculation
                .dueFee || 0
            )
          ) || updatedStudent;
    } catch (error) {
      dueFeeRefreshPending = true;
    }

    const savedRefund =
      refund
        ? finalStudent.busFeeRefunds[
          finalStudent
            .busFeeRefunds.length - 1
        ]
        : null;

    return {
      student: {
        studentId:
          finalStudent.studentId,
        name: finalStudent.name,
        hasBusFacility: false,
        busFee: 0,
        busFacilityStopEffectiveFrom:
          preview.effectiveFrom,
        paidFee:
          Number(
            finalStudent.paidFee || 0
          ),
        dueFee:
          Number(
            finalStudent.dueFee || 0
          ),
      },
      refund:
        savedRefund,
      refundAmount:
        preview.refundAmount,
      refundMode: "CASH",
      dueFeeRefreshPending,
    };
  };

const getBusFeeRefundHistory =
  async (studentId) => {
    const student =
      await studentRepository
        .findByStudentId(
          String(studentId || "")
            .trim()
        );

    if (!student) {
      throw new Error(
        "Student not found"
      );
    }

    const refunds =
      (
        Array.isArray(
          student.busFeeRefunds
        )
          ? student.busFeeRefunds
          : []
      )
        .map((refund) =>
          typeof refund?.toObject ===
            "function"
            ? refund.toObject()
            : { ...refund }
        )
        .sort(
          (first, second) =>
            new Date(
              second.refundedAt
            ) -
            new Date(
              first.refundedAt
            )
        );

    return {
      studentId:
        student.studentId,
      name: student.name,
      totalRefunds:
        refunds.length,
      totalRefundedAmount:
        Number(
          refunds.reduce(
            (total, refund) =>
              total +
              Number(
                refund.amount || 0
              ),
            0
          ).toFixed(2)
        ),
      refunds,
    };
  };

const getBusFeeRefundReceipt =
  async (identifier) => {
    const receipt =
      await studentRepository
        .getBusRefundReceipt(
          identifier
        );

    if (!receipt) {
      throw new Error(
        "Bus refund receipt not found"
      );
    }

    return receipt;
  };

// =====================================================
// Export
// =====================================================

module.exports = {
  createStudent,

  getAllStudents,

  getStudentById,

  updateStudent,

  promoteStudent,

  deleteStudent,

  searchStudent,

  calculateFeeStartDate,

  validateFeeDiscountType,

  calculateDiscountedFeeHeads,

  calculateEffectiveFeeTotal,

  calculateTotalFee,

  getEffectiveMonthlyFee,

  getEffectiveOneTimeFees,

  calculateAccruedMonths,

  getAcademicYearEndDate,

  hasActiveLumpSumPayment,

  calculateCurrentDueFee,

  getCurrentDueFee,

  startBusFacility,

  previewBusFacilityCashRefund,

  stopBusFacilityWithCashRefund,

  getBusFeeRefundHistory,

  getBusFeeRefundReceipt,
};
