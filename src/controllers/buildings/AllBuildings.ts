import { Request, Response } from "express";
import pool from '../../config/sql';


export const GetBuildings = async (req: Request, res: Response): Promise<void> => {
    try {
        const query = `
            SELECT id, name
            FROM buildings
            ORDER BY created_at DESC;
        `;

        const { rows } = await pool.query(query);

        res.status(200).json({
            data: rows
        });

    } catch (error) {
        console.error('Error retrieving buildings:', error);
        res.status(500).json({
            message: 'Internal server error while retrieving buildings'
        });
    }
};