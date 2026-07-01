const jwt = require("jsonwebtoken");

function auth(req, res, next) {
    const token = req.cookies.accessToken;
    console.log("[AUTH] Cookies received:", req.cookies);
    console.log("[AUTH] accessToken present?", !!token);

    if (!token) {
        console.log("[AUTH] No token — rejecting");
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("[AUTH] Token valid, user:", decoded.email);
        req.user = decoded;
        next();
    } catch (err) {
        console.log("[AUTH] Token verify FAILED:", err.message); // <-- this tells you WHY (expired vs malformed vs wrong secret)
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

module.exports = auth;