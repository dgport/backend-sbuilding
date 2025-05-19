import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    userId: string;
    email: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
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
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'your-secret-key'
        ) as JwtPayload;

        console.log("✅ Token verified, user:", decoded.email);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("🚫 Token verification failed:", error);
        res.status(403).json({ message: "Invalid or expired token" });
    }
};