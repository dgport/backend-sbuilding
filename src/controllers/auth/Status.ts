import { Request, Response } from "express";

export const checkAuthStatus = async (req: Request, res: Response): Promise<void> => {
    try {
    
        if (req.user) {
            res.status(200).json({
                user: {
                    userId: req.user.userId,
                    email: req.user.email
                }
            });
        } else {
            res.status(401).json({ message: "Not authenticated" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error during authentication check" });
    }
};