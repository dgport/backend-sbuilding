import { Request, Response } from "express";

export const SignOut = async (req: Request, res: Response): Promise<void> => {
    try {
        const isProduction = process.env.NODE_ENV === 'production';
        
        res.clearCookie('token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            domain: isProduction ? '.aisibatumi.ge' : undefined
        });

        res.status(200).json({
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Error during sign out:', error);
        res.status(500).json({
            message: 'Internal server error during sign out'
        });
    }
};