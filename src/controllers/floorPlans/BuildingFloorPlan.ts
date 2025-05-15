import { Request, Response } from "express";
import pool from "../../config/sql";

export const BuildingFloorPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        status: 'ERROR',
        error: 'INVALID_BUILDING_ID',
        message: 'A valid building ID must be provided'
      });
    }

    const query = "SELECT * FROM floor_plans WHERE building_id = $1 ORDER BY name ASC";
    const result = await pool.query(query, [Number(id)]);

 
    return res.status(200).json(result.rows);  

  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({
        status: 'ERROR',
        error: 'SERVER_ERROR',
        message: 'An error occurred while fetching floor plans',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    return res.status(500).json({
      status: 'ERROR',
      error: 'SERVER_ERROR',
      message: 'An unknown server error occurred'
    });
  }
};
