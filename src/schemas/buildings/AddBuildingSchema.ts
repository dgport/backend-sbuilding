import { z } from "zod";

export const AddBuildingSchema = z.object({
    name: z.string().min(1, "Name is required"),
});