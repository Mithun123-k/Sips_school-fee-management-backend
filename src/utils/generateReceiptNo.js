const Counter = require("../models/Counter");

const generateReceiptNo = async () => {

  const counter =
    await Counter.findByIdAndUpdate(
      "receiptNo",
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

  return `RCP${String(counter.seq).padStart(
    6,
    "0"
  )}`;

};

module.exports = generateReceiptNo;