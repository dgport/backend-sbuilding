import { Request, Response } from 'express';
import pool from '../../config/sql';
import { AddFloorPlanSchema } from '../../schemas/floorPlans/AddFloorPlanSchema';

export const AddFloorPlan = async (req: Request, res: Response) => {
  const { body } = req;
  
  try {
 
    const result = AddFloorPlanSchema.safeParse(body);
    
    if (!result.success) {
      return res.status(400).json({
        status: "ERROR",
        error: "VALIDATION_ERROR",
        message: "Invalid input data",
        errors: result.error.format(),
      });
    }
    
 
    const { 
      name,
      building_id,
      floor_range_start,
      floor_range_end,
      starting_apartment_number,
      apartments_per_floor
    } = result.data;
    
 
    const buildingExists = await pool.query(
      "SELECT * FROM buildings WHERE id = $1",
      [building_id]
    );
    
    if (buildingExists.rows.length === 0) {
      return res.status(404).json({
        status: "ERROR",
        error: "BUILDING_NOT_FOUND",
        message: "Building with this ID does not exist.",
      });
    }
    
 
    const existingFloorPlan = await pool.query(
      "SELECT * FROM floor_plans WHERE LOWER(name) = LOWER($1) AND building_id = $2",
      [name, building_id]
    );
    
    if (existingFloorPlan.rows.length > 0) {
      return res.status(409).json({
        status: "ERROR",
        error: "FLOOR_PLAN_EXIST",
        message: "A floor plan with this name already exists for this building.",
      });
    }
    
    const desktopImageUrl = (req.files as any)?.desktop_image?.[0]?.path || '';
    const mobileImageUrl = (req.files as any)?.mobile_image?.[0]?.path || '';
    
 
    const { rows: [newFloorPlan] } = await pool.query(
      `INSERT INTO floor_plans (
        name, building_id, desktop_image, mobile_image,
        floor_range_start, floor_range_end,
        starting_apartment_number, apartments_per_floor
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        name,
        building_id,
        desktopImageUrl,
        mobileImageUrl,
        floor_range_start,
        floor_range_end,
        starting_apartment_number,
        apartments_per_floor,
      ]
    );
    
    res.status(201).json({
      status: "SUCCESS",
      message: "Floor plan created successfully",
      data: newFloorPlan,
    });
  } catch (error) {
    console.error("Error creating floor plan:", error);
    res.status(500).json({
      status: "ERROR",
      error: "SERVER_ERROR",
      message: "An error occurred while creating the floor plan",
    });
  }
};