const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { generateAccessToken } = require("../utils/jwt");

exports.refresh = async (req, res) => {
    console.log("[REFRESH] Called at", new Date().toISOString());
    try {
        const refreshToken = req.cookies.refreshToken;
        console.log("[REFRESH] refreshToken present?", !!refreshToken);

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token missing" });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        console.log("[REFRESH] refreshToken valid for user:", decoded.email);

        const user = await User.findById(decoded._id);
        if (!user) {
            console.log("[REFRESH] User not found in DB for id:", decoded._id);
            return res.status(401).json({ message: "User not found" });
        }

        const accessToken = generateAccessToken(user);
        console.log("[REFRESH] New accessToken issued, setting cookie");

        res.cookie("accessToken", accessToken, {
            httpOnly: true, secure: false, sameSite: "lax", maxAge: 15 * 60 * 1000,
        });

        return res.status(200).json({ message: "Token refreshed" });
    } catch (err) {
        console.log("[REFRESH] FAILED:", err.message);
        return res.status(401).json({ message: "Invalid refresh token" });
    }
};