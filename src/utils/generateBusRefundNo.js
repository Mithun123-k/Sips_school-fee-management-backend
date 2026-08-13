const Counter =
  require("../models/Counter");

const generateBusRefundNo =
  async () => {
    const counter =
      await Counter.findByIdAndUpdate(
        "busFeeRefundNo",
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

    return `BRF${String(
      counter.seq
    ).padStart(6, "0")}`;
  };

module.exports =
  generateBusRefundNo;
