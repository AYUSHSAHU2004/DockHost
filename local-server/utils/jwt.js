const jwt = require("jsonwebtoken");

function generateAccessToken(user) {

    return jwt.sign(
        {
            _id: user._id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1m"
        }
    );

}

function generateRefreshToken(user) {

    return jwt.sign(
        {
            _id: user._id,
            email: user.email
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "30d"
        }
    );

}

module.exports = {
    generateAccessToken,
    generateRefreshToken
};