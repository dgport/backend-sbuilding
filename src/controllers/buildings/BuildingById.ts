import { Request, Response } from "express";
import pool from '../../config/sql';

export const GetBuildingById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                message: 'Building ID is required',
            });
            return;
        }

        const query = `
            SELECT id, name
            FROM buildings 
            WHERE id = $1;
        `;

        const { rows } = await pool.query(query, [id]);

        if (rows.length === 0) {
            res.status(404).json({
                message: 'Building not found',
            });
            return;
        }

        res.status(200).json({
            data: rows[0]
        });

    } catch (error) {
        console.error('Error retrieving building:', error);
        res.status(500).json({
            message: 'Internal server error while retrieving building'
        });
    }
};