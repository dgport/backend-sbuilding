import { Request, Response } from "express";

export const SignOut = async (req: Request, res: Response): Promise<void> => {
    console.log("🚪 Signing out user:", req.user?.email);
    
    try {
        // Determine environment
        const isProduction = process.env.NODE_ENV === 'production';
        
        // Set domain based on environment and origin
        let domain;
        if (isProduction) {
            // Extract the base domain from the origin
            const origin = req.headers.origin as string;
            if (origin && origin.includes('aisigroup.ge')) {
                domain = '.aisigroup.ge'; // This will work for all subdomains
            }
        }

        // Clear the cookie with matching options that were used to set it
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' as const : 'lax' as const,
            domain: domain,
            path: '/'
        };
        
        console.log("🍪 Clearing cookie with options:", cookieOptions);
        res.clearCookie('token', cookieOptions);

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