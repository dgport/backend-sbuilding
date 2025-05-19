import { Request, Response } from "express";

export const checkAuthStatus = async (req: Request, res: Response): Promise<void> => {
 
    
    try {
        if (req.user) {
        
            res.status(200).json({
                authenticated: true,
                user: {
                    userId: req.user.userId,
                    email: req.user.email
                }
            });
        } else {
          
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