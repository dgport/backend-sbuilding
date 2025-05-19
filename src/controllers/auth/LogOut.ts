import { Request, Response } from "express";

export const SignOut = async (req: Request, res: Response): Promise<void> => {
 
    
    try {
  
        const isProduction = process.env.NODE_ENV === 'production';
        
 
        let domain;
        if (isProduction) {
           
            const origin = req.headers.origin as string;
            if (origin && origin.includes('aisigroup.ge')) {
                domain = '.aisigroup.ge'; 
            }
        }

      
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' as const : 'lax' as const,
            domain: domain,
            path: '/'
        };
         
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