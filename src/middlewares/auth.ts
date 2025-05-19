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
 
  
    let token = req.cookies.token;
 
    if (!token && req.headers.authorization) {
    
        const authHeader = req.headers.authorization;
        
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

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
        next();
    } catch (error) {
        console.error("🚫 Token verification failed:", error);
        res.status(403).json({ message: "Invalid or expired token" });
    }
};