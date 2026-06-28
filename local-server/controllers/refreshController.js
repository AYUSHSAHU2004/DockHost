const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { generateAccessToken } = require("../utils/jwt");

exports.refresh = async (req, res) => {

    try {

        const refreshToken = req.cookies.refreshToken;

        console.log("Inside Refresh Endpoint");

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token missing"
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findById(decoded._id);

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        const accessToken = generateAccessToken(user);

        return res.status(200).json({
            token: accessToken
        });

    } catch (err) {

        return res.status(401).json({
            message: "Invalid refresh token"
        });

    }

};