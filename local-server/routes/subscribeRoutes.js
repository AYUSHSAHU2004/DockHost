const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
    subscribe,
    getSubscriptions
} = require("../controllers/subscribeController");

router.post("/", auth, subscribe);

router.get("/", auth, getSubscriptions);
module.exports = router;