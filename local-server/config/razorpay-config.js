const razorpay = require("razorpay");

const createRazorpayInstance = () => {
  return new razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret
  });
}
module.exports = createRazorpayInstance;
