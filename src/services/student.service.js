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

const feeStructureRepository =
  require("../repositories/feeStructure.repository");

const generateStudentId =
  require("../utils/generateStudentId");
const generateAdmissionNo = require("../utils/generateAdmission");
const {
  getLumpSumPreview,
  calculateFeeByHead,
} = require("./fee.service");

const {
  getFeeSnapshot,
  getNextFeePeriodStart,
  getFeeSnapshotForDate,
} = require("../utils/studentPromotionFee");

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
};
