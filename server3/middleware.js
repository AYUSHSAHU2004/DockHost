import jwt from "jsonwebtoken";
// import { JWT_PUBLIC_KEY } from "./config.js";
const secretKey = process.env.JWT_SECRET;  // store securely, e.g., env variable

export function authMiddleware(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        console.log(decoded);
        if (!decoded || !decoded.sub) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        req.userId = decoded.sub;
        
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
}