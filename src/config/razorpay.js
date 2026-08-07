const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// console.log(
//   "RAZORPAY VERSION:",
//   require("razorpay/package.json").version
// );

// console.log(
//   "RAZORPAY QR CODE:",
//   typeof razorpay.qrCode
// );

// console.log(
//   "RAZORPAY QR CREATE:",
//   typeof razorpay.qrCode?.create
// );

module.exports = razorpay;