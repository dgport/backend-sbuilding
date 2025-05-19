import { Request, Response } from "express";

export const checkAuthStatus = async (req: Request, res: Response): Promise<void> => {
    console.log("🔍 Checking auth status");
    
    try {
        if (req.user) {
            console.log("✅ User authenticated:", req.user.email);
            res.status(200).json({
                authenticated: true,
                user: {
                    userId: req.user.userId,
                    email: req.user.email
                }
            });
        } else {
            console.log("❌ User not authenticated");
            res.status(401).json({ 
                authenticated: false,
                message: "Not authenticated" 
            });
        }
    } catch (error) {
        console.error("🚫 Error checking auth status:", error);
        res.status(500).json({ message: "Server error during authentication check" });
    }
};