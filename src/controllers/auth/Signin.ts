import { Request, Response } from "express";
import pool from '../../config/sql';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { SignInSchema } from "../../schemas/auth/SigninSchema";

export const SignIn = async (req: Request, res: Response): Promise<void> => {
    console.log("📝 SignIn attempt for:", req.body.email);
    console.log("🌐 Origin:", req.headers.origin);
    
    try {
        const result = SignInSchema.safeParse(req.body);

        if (!result.success) {
            console.log("❌ Validation failed:", result.error.format());
            res.status(400).json({
                message: 'Invalid input data',
                errors: result.error.format(),
            });
            return;
        }

        const { email, password } = result.data;

        const query = `
      SELECT id, email, password_hash 
      FROM users 
      WHERE email = $1;
    `;

        const { rows } = await pool.query(query, [email]);

        if (rows.length === 0) {
            console.log("❌ No user found with email:", email);
            res.status(401).json({
                message: 'Invalid credentials',
            });
            return;
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            console.log("❌ Password did not match for user:", email);
            res.status(401).json({
                message: 'Invalid credentials',
            });
            return;
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Determine environment
        const isProduction = process.env.NODE_ENV === 'production';
        console.log(`🔧 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
        
        // Set domain based on environment and origin
        let domain;
        if (isProduction) {
            // Extract the base domain from the origin
            const origin = req.headers.origin as string;
            if (origin && origin.includes('aisigroup.ge')) {
                domain = '.aisigroup.ge'; // This will work for all subdomains
                console.log("🔧 Using production domain:", domain);
            }
        }

        // Cookie settings
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction, // Only use secure in production
            sameSite: isProduction ? 'none' as const : 'lax' as const,
            domain: domain,
            path: '/',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        };
        
        console.log("🍪 Setting cookie with options:", cookieOptions);
        res.cookie('token', token, cookieOptions);
        
        // Also send the token in the response body for frontends that prefer to use Authorization header
        res.status(200).json({
            message: 'Login successful',
            token: token, // Include the token in the response
            data: {
                id: user.id,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Error during sign in:', error);
        res.status(500).json({
            message: 'Internal server error during sign in'
        });
    }
};