const express = require("express");
const { verifyPayment, createOrder } = require("../PayementController/PayementController");
const router = express.Router();

router.post('/createOrder',createOrder);
router.post('/verifyPayment',verifyPayment);

module.exports = router;