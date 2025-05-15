
import { Request, Response } from "express";
import pool from '../../config/sql';
import bcrypt from 'bcrypt';
import { SignUpSchema } from "../../schemas/auth/SignupSchema";


export const SignUp = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = SignUpSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({
                message: 'Invalid input data',
                errors: result.error.format(),
            });
            return;
        }

        const { email, password, firstName, lastName } = result.data;
        const checkQuery = `
        SELECT id FROM users WHERE email = $1;
      `;
        const { rows } = await pool.query(checkQuery, [email]);

        if (rows.length > 0) {
            res.status(400).json({
                message: 'User with this email already exists',
            });
            return;
        }
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const createQuery = `
        INSERT INTO users (email, password_hash, first_name, last_name)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, first_name, last_name;
      `;

        const values = [email, passwordHash, firstName, lastName];
        const { rows: [newUser] } = await pool.query(createQuery, values);

        res.status(201).json({
            message: 'User registered successfully',
            data: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.first_name,
                lastName: newUser.last_name
            }
        });

    } catch (error) {
        console.error('Error during sign up:', error);
        res.status(500).json({
            message: 'Internal server error during sign up'
        });
    }
};
