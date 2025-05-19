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
    const token = req.cookies.token;

    // Add debugging
    console.log('Auth middleware - Token present:', !!token);
    console.log('Auth middleware - Cookies:', req.cookies);

    if (!token) {
        res.status(401).json({ message: "Authentication required" });
        return;
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'your-secret-key'
        ) as JwtPayload;

        req.user = decoded;
        console.log('Auth middleware - User authenticated:', decoded.email);
        next();
    } catch (error) {
        console.log('Auth middleware - Token verification failed:', error);
        res.status(403).json({ message: "Invalid or expired token" });
    }
};