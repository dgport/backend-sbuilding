import { Request, Response } from "express";

export const SignOut = async (req: Request, res: Response): Promise<void> => {
    try {

        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
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