import { z } from 'zod';

export const updateApartmentStatusSchema = z.object({
  status: z.enum(['available', 'reserved', 'sold']),
  floor_plan_id: z.number().int(),
  flat_number: z.number().int(),
  sqm_price: z.number().optional() 
});