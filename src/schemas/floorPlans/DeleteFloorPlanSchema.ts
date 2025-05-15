import { z } from "zod";

export const DeleteFloorPlanSchema = z.object({
    id: z.string()
  });