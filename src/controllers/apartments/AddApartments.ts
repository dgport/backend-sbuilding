import { Request, Response } from 'express';
import pool from '../../config/sql';
import { z } from 'zod';
import { GenerateApartmentsSchema } from '../../schemas/apartments/GenerateApartmentsSchema';

const checkIfBuildingExists = async (buildingId: string) => {
  const result = await pool.query("SELECT 1 FROM buildings WHERE id = $1", [buildingId])
  return result.rows.length > 0
}
 
const checkIfFloorPlanExists = async (floorPlanId: string) => {
  const result = await pool.query("SELECT 1 FROM floor_plans WHERE id = $1", [floorPlanId])
  return result.rows.length > 0
}

const checkExistingApartments = async (buildingId: string, name: string, floorPlanId: string) => {
  const result = await pool.query(
    `
    SELECT * FROM apartments 
    WHERE building_id = $1 AND name = $2 AND floor_plan_id = $3
  `,
    [buildingId, name, floorPlanId],
  )

  return result.rows.length > 0
}

 

const generateApartments = async (buildingId: string, name: string, floorPlanId: string) => {
  try {
    const floorPlanResult = await pool.query("SELECT * FROM floor_plans WHERE id = $1", [floorPlanId])

    if (floorPlanResult.rows.length === 0) {
      console.error(`Floor plan with ID ${floorPlanId} not found.`)
      throw new Error("Floor plan not found")
    }

    const floorPlan = floorPlanResult.rows[0]
    const { floor_range_start, floor_range_end, starting_apartment_number, apartments_per_floor } = floorPlan

    const apartmentsByFloor = []

    for (let floor = floor_range_start; floor <= floor_range_end; floor++) {
      const apartments = []
      let floorBaseNumber
      if (floor === 0) {
        floorBaseNumber = starting_apartment_number
      } else {
        floorBaseNumber = floor * 100 + (starting_apartment_number % 100)
      }
 
      for (let flatIndex = 0; flatIndex < apartments_per_floor; flatIndex++) {
        const flatId = (flatIndex + 1).toString()
    
        const flatNumber = (floorBaseNumber + flatIndex).toString()
 
        await pool.query(
          "INSERT INTO apartments (flat_id, flat_number, floor, building_id, floor_plan_id, name, status, desktop_paths, mobile_paths, images, square_meters) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
          [flatId, flatNumber, floor.toString(), buildingId, floorPlanId, name, "available", "", "", "[]", "0"],
        )

        apartments.push({
          flat_id: flatId,
          flat_number: flatNumber,
          status: "available",
        })
      }

      apartmentsByFloor.push({
        floor: floor.toString(),
        apartments,
      })
    }

    return {
      building_id: buildingId,
      floor_plan_id: floorPlanId,
      name: name,
      apartments: apartmentsByFloor,
    }
  } catch (error) {
    console.error("Error generating apartments:", error)
    throw error
  }
}

export const AddApartments = async (req: Request, res: Response) => {
  const { building_id, name, floor_plan_id } = req.body

  try {
    const validatedData = GenerateApartmentsSchema.parse({
      building_id,
      name,
      floor_plan_id,
    })


    const buildingExists = await checkIfBuildingExists(validatedData.building_id)
    if (!buildingExists) {
      return res.status(400).json({
        status: "ERROR",
        error: "BUILDING_NOT_FOUND",
        message: `Building with ID ${validatedData.building_id} does not exist.`,
      })
    }

    const floorPlanExists = await checkIfFloorPlanExists(validatedData.floor_plan_id)
    if (!floorPlanExists) {
      return res.status(400).json({
        status: "ERROR",
        error: "FLOOR_PLAN_NOT_FOUND",
        message: `Floor plan with ID ${validatedData.floor_plan_id} does not exist.`,
      })
    }

 
    const existingApartments = await checkExistingApartments(
      validatedData.building_id,
      validatedData.name,
      validatedData.floor_plan_id,
    )
    if (existingApartments) {
      return res.status(400).json({
        status: "ERROR",
        error: "DUPLICATE_APARTMENTS",
        message: "Apartments with the same building_id, name, and floor_plan_id already exist.",
      })
    }

 
    const apartmentsData = await generateApartments(
      validatedData.building_id,
      validatedData.name,
      validatedData.floor_plan_id,
    )
 
    return res.status(201).json({
      status: "SUCCESS",
      message: "Apartments generated successfully.",
      apartments: apartmentsData,
    })
  } catch (error) {
 
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: "ERROR",
        error: "VALIDATION_ERROR",
        message: error.errors.map((err) => err.message).join(", "),
      })
    }

 
    if (error instanceof Error) {
      return res.status(500).json({
        status: "ERROR",
        error: "SERVER_ERROR",
        message: "An error occurred while generating apartments.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }

 
    return res.status(500).json({
      status: "ERROR",
      error: "UNKNOWN_ERROR",
      message: "An unknown error occurred while processing your request.",
    })
  }
}
