import { Request, Response } from "express";
import { AddBuildingSchema } from '../../schemas/buildings/AddBuildingSchema';
import pool from '../../config/sql';

export const AddBuilding = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = AddBuildingSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({
                message: 'Invalid input data',
                errors: result.error.format(),
            });
            return;
        }

        const { name } = result.data;

        const checkQuery = `
            SELECT id FROM buildings WHERE name = $1;
        `;
        const { rows } = await pool.query(checkQuery, [name]);

        if (rows.length > 0) {
            res.status(400).json({
                message: 'Building with this name already exists',
            });
            return;
        }

        const createQuery = `
            INSERT INTO buildings (name)
            VALUES ($1)
            RETURNING id, name;
        `;

        const values = [name];
        const { rows: [addBuilding] } = await pool.query(createQuery, values);

        res.status(201).json({
            message: 'Building created successfully',
            data: addBuilding
        });

    } catch (error) {
        console.error('Error creating Building:', error);
        res.status(500).json({
            message: 'Internal server error while creating Building'
        });
    }
};
