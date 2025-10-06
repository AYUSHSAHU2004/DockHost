const express = require('express');
const Router = express.Router();
const { googleAuth } = require('../authController/authController');

Router.get("/google", googleAuth);

module.exports = Router;