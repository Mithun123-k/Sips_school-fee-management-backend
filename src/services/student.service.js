const studentRepository = require("../repositories/student.repository");
const generateStudentId = require("../utils/generateStudentId");
const Student = require("../models/Student");

// ============================
// Create Student
// ============================

const createStudent = async (body, userId) => {
    const {
        mobile,
        totalFee
    } = body;

    // Check Mobile
    const existingStudent =
        await studentRepository.findByMobile(mobile);

    if (existingStudent) {
        throw new Error("Mobile number already exists");
    }

    // Generate Student ID
    const studentId =
        await generateStudentId();

    const student =
        await studentRepository.createStudent({
            ...body,
            studentId,
            paidFee: 0,
            dueFee: totalFee,
            createdBy: userId,
        });

    return student;
};

// ============================
// Get All Students
// ============================

const getAllStudents = async () => {

    return await studentRepository.getAllStudents();

};

// ============================
// Get Student By Id
// ============================

const getStudentById = async (id) => {

    const student =
        await studentRepository.getStudentById(id);

    if (!student)
        throw new Error("Student not found");

    return student;

};

// ============================
// Search Student
// ============================



const searchStudent = async (search) => {
    return await Student.findOne({
        isDeleted: false,
        $or: [
            { studentId: search },
            { mobile: search },
        ],
    });
};

module.exports = {
    searchStudent,
};
// ============================
// Update Student
// ============================

const updateStudent = async (
    id,
    body,
    userId
) => {

    body.updatedBy = userId;

    const student =
        await studentRepository.updateStudent(
            id,
            body
        );

    if (!student)
        throw new Error("Student not found");

    return student;

};

// ============================
// Delete Student
// ============================

const deleteStudent = async (id) => {

    const student =
        await studentRepository.deleteStudent(id);

    if (!student)
        throw new Error("Student not found");

    return;

};

module.exports = {

    createStudent,

    getAllStudents,

    getStudentById,

    searchStudent,

    updateStudent,

    deleteStudent,

};