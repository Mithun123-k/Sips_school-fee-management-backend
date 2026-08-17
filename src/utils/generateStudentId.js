const Counter = require("../models/Counter");

const generateStudentId = async () => {

  const counter =
    await Counter.findByIdAndUpdate(
      "studentId",
      {
        $inc: {
          seq: 1,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

  return `SIPS${String(counter.seq).padStart(
    6,
    "0"
  )}`;
};

module.exports =
generateStudentId;