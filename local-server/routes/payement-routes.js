const express = require("express");
const { verifyPayment, createOrder } = require("../PayementController/PayementController");
const router = express.Router();

const auth = require("../middleware/auth");

router.post('/createOrder', auth, createOrder);
router.post('/verifyPayment', auth, verifyPayment);

module.exports = router;