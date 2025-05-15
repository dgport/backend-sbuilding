import { z } from 'zod';

export const GenerateApartmentsSchema = z.object({
  floor_plan_id: z.string().describe('The ID of the floor plan'),
  building_id: z.string().describe('The ID of the building for the apartments'),
  name: z.string().describe('The name or label for the floor (e.g., "First Floor", "Penthouse")'),
});

 
export const updateApartmentStatusSchema = z.object({
  status: z.string(),
  floor_plan_id: z.string(),
  flat_number: z.string(), 
  square_meters: z.number().optional(),
  sqm_price: z.number().optional()
});