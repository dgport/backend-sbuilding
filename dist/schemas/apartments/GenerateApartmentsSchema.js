"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApartmentStatusSchema = exports.GenerateApartmentsSchema = void 0;
const zod_1 = require("zod");
exports.GenerateApartmentsSchema = zod_1.z.object({
    floor_plan_id: zod_1.z.string().describe('The ID of the floor plan'),
    building_id: zod_1.z.string().describe('The ID of the building for the apartments'),
    name: zod_1.z.string().describe('The name or label for the floor (e.g., "First Floor", "Penthouse")'),
});
exports.updateApartmentStatusSchema = zod_1.z.object({
    status: zod_1.z.string(),
    floor_plan_id: zod_1.z.string(),
    flat_number: zod_1.z.string(),
    square_meters: zod_1.z.number().optional(),
    sqm_price: zod_1.z.number().optional()
});
