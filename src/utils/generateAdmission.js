const Counter = require("../models/Counter");

const generateAdmissionNo = async () => {

  const counter =
    await Counter.findByIdAndUpdate(
      "admissionNo",
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

  return `ADM${String(counter.seq).padStart(
    6,
    "0"
  )}`;

};

module.exports = generateAdmissionNo;