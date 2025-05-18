"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApartmentStatusSchema = void 0;
const zod_1 = require("zod");
exports.updateApartmentStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['available', 'reserved', 'sold']),
    floor_plan_id: zod_1.z.number().int(),
    flat_number: zod_1.z.number().int(),
    sqm_price: zod_1.z.number().optional()
});
