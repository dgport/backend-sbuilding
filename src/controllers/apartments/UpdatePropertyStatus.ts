import { Request, Response } from "express";
import { updateApartmentStatusSchema } from "../../schemas/apartments/GenerateApartmentsSchema";
import pool from "../../config/sql";

export const updateApartmentStatus = async (req: Request, res: Response) => {
  try {
    const validationResult = updateApartmentStatusSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        status: 'ERROR',
        error: 'INVALID_INPUT',
        message: 'The provided data is invalid.',
        details: validationResult.error.errors
      });
    }
    
    const { status, floor_plan_id, flat_number, sqm_price } = validationResult.data;
    
    let queryFields = [];
    let queryParams = [];
    let paramCounter = 1;
    
    if (status !== undefined) {
      queryFields.push(`status = $${paramCounter}`);
      queryParams.push(status);
      paramCounter++;
    }
    
    if (sqm_price !== undefined) {
      queryFields.push(`sqm_price = $${paramCounter}`);
      queryParams.push(sqm_price);
      paramCounter++;
    }
    
    if (queryFields.length === 0) {
      return res.status(400).json({
        status: 'ERROR',
        error: 'INVALID_INPUT',
        message: 'No fields to update were provided'
      });
    }
    
    queryParams.push(floor_plan_id, flat_number);
    
    const query = `
      UPDATE apartments 
      SET ${queryFields.join(', ')} 
      WHERE floor_plan_id = $${paramCounter} AND flat_number = $${paramCounter + 1}
      RETURNING *
    `;
    
    const result = await pool.query(query, queryParams);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'ERROR',
        error: 'APARTMENT_NOT_FOUND',
        message: 'Apartment not found with the given floor_plan_id and flat_number'
      });
    }
    
    const updatedApartment = result.rows[0];
    
    if (typeof updatedApartment.images === 'string') {
      try {
        updatedApartment.images = JSON.parse(updatedApartment.images);
      } catch (e) {
        updatedApartment.images = [];
      }
    }
    
    if (!Array.isArray(updatedApartment.images)) {
      updatedApartment.images = [];
    }
    
    res.status(200).json({
      status: 'SUCCESS',
      message: 'Apartment updated successfully',
      apartment: updatedApartment
    });
    
  } catch (error) {
    console.error("Error updating apartment:", error);
    res.status(500).json({
      status: 'ERROR',
      error: 'SERVER_ERROR',
      message: 'An error occurred while updating the apartment.',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
};