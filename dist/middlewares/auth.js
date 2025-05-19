"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    console.log("⚙️ Auth middleware running");
    console.log("📦 Cookies received:", req.cookies);
    // Try to get token from cookies first
    let token = req.cookies.token;
    // If not in cookies, check Authorization header
    if (!token && req.headers.authorization) {
        console.log("🔑 Using Authorization header");
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }
    if (!token) {
        console.log("❌ No token found in cookies or headers");
        res.status(401).json({ message: "Authentication required" });
        return;
    }
    try {
        console.log("🔍 Verifying token");
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log("✅ Token verified, user:", decoded.email);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error("🚫 Token verification failed:", error);
        res.status(403).json({ message: "Invalid or expired token" });
    }
};
exports.authenticateToken = authenticateToken;
