const axios = require('axios');
const {
    generateAccessToken,
    generateRefreshToken
} = require("../utils/jwt");
const { oauth2Client } = require('../utils/googleClient');
const User = require('../models/userModel');

/* GET Google Authentication API. */
exports.googleAuth = async (req, res, next) => {
    const code = req.query.code;
    try {
        const googleRes = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(googleRes.tokens);
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        );
        const { email, name, picture } = userRes.data;
        // console.log(userRes);
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                image: picture,
            });
        }
        const accessToken =
            generateAccessToken(user);

        const refreshToken =
            generateRefreshToken(user);


        res.cookie(
            "refreshToken",
            refreshToken,
            {
                httpOnly: true,
                secure: false,      // true after HTTPS deployment
                sameSite: "lax",
                maxAge: 30 * 24 * 60 * 60 * 1000
            }
        );
        res.status(200).json({
            message: "success",
            token: accessToken,
            user
        });
    } catch (err) {
        console.error("Google Auth Error:", err);
        console.error(err.response?.data);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};