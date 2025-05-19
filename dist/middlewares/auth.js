"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    // Enhanced debugging
    console.log('Auth middleware - Headers:', req.headers);
    console.log('Auth middleware - Cookies:', req.cookies);
    console.log('Auth middleware - Token present:', !!token);
    if (!token) {
        res.status(401).json({ message: "Authentication required" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        console.log('Auth middleware - User authenticated:', decoded.email);
        next();
    }
    catch (error) {
        console.log('Auth middleware - Token verification failed:', error);
        // Clear the invalid token
        res.clearCookie('token');
        res.status(403).json({ message: "Invalid or expired token" });
    }
};
exports.authenticateToken = authenticateToken;
