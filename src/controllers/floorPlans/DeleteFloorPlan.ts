import { Request, Response } from 'express';
import pool from '../../config/sql';
import fs from 'fs/promises';
import { DeleteFloorPlanSchema } from '../../schemas/floorPlans/DeleteFloorPlanSchema';

export const DeleteFloorPlan = async (req: Request, res: Response) => {
  try {
 
    const result = DeleteFloorPlanSchema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        status: "ERROR",
        error: "VALIDATION_ERROR",
        message: "Invalid input data",
        errors: result.error.format(),
      });
    }

    const { id } = result.data;
 
    const { rows: existingFloorPlans } = await pool.query(
      "SELECT * FROM floor_plans WHERE id = $1",
      [id]
    );

    if (existingFloorPlans.length === 0) {
      return res.status(404).json({
        status: "ERROR",
        error: "FLOOR_PLAN_NOT_FOUND",
        message: "Floor plan with this ID does not exist.",
      });
    }

    const floorPlan = existingFloorPlans[0];

 
    try {
      if (floorPlan.desktop_image) {
        await fs.unlink(floorPlan.desktop_image);
      }
      if (floorPlan.mobile_image) {
        await fs.unlink(floorPlan.mobile_image);
      }
    } catch (fileError) {
      console.warn("Could not delete associated image files:", fileError);
      
    }
 
    const { rowCount } = await pool.query(
      "DELETE FROM floor_plans WHERE id = $1",
      [id]
    );

    if (rowCount === 0) {
      return res.status(500).json({
        status: "ERROR",
        error: "DELETION_FAILED",
        message: "Unable to delete the floor plan.",
      });
    }

    res.status(200).json({
      status: "SUCCESS",
      message: "Floor plan deleted successfully",
      data: { id }
    });

  } catch (error) {
    console.error("Error deleting floor plan:", error);
    res.status(500).json({
      status: "ERROR",
      error: "SERVER_ERROR",
      message: "An error occurred while deleting the floor plan",
    });
  }
};

 