import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Define the JWT payload interface
interface JwtPayload {
  userId: string;
  email: string;
  [key: string]: any; // For any additional fields
}

// Extend Express Request type to include user property
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

  // Enhanced debugging
  console.log('Auth middleware - Headers:', req.headers);
  console.log('Auth middleware - Cookies:', req.cookies);
  console.log('Auth middleware - Token present:', !!token);
  
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
    
    // Clear the invalid token
    res.clearCookie('token');
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
