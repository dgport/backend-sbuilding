import { Request, Response } from "express";
import pool from '../../config/sql';


 

export const DeleteBuildingById = async (req: Request, res: Response): Promise<void> => {
    const client = await pool.connect();

    try {
        // Start a transaction
        await client.query('BEGIN');

        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                message: "Building ID is required",
            });
            return;
        }

        // First, delete floor plans associated with the building
        const deleteFloorPlansQuery = `
            DELETE FROM floor_plans 
            WHERE building_id = $1
        `;
        await client.query(deleteFloorPlansQuery, [id]);

        // Then delete the building itself
        const deleteBuilding = `
            DELETE FROM buildings 
            WHERE id = $1
            RETURNING id;
        `;

        const { rows } = await client.query(deleteBuilding, [id]);

        if (rows.length === 0) {
            await client.query('ROLLBACK');
            res.status(404).json({
                message: "Building not found",
            });
            return;
        }

        // Commit the transaction
        await client.query('COMMIT');

        res.status(200).json({
            message: "Building and associated floor plans deleted successfully",
        });

    } catch (error) {
        // Rollback the transaction in case of error
        await client.query('ROLLBACK');
        console.error("Error deleting building:", error);
        res.status(500).json({
            message: "Internal server error while deleting building",
        });
    } finally {
        // Release the client back to the pool
        client.release();
    }
};