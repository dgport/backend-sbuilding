"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddFloorPlanSchema = void 0;
const zod_1 = require("zod");
exports.AddFloorPlanSchema = zod_1.z.object({
    name: zod_1.z.string()
        .trim()
        .min(1, { message: "Name cannot be empty" })
        .max(100, { message: "Name cannot exceed 100 characters" }),
    building_id: zod_1.z.coerce.number()
        .int({ message: "Building ID must be a number" })
        .positive({ message: "Building ID must be positive" }),
    floor_range_start: zod_1.z.coerce.number()
        .int({ message: "Floor range start must be a number" })
        .min(1, { message: "Floor range start must be at least 1" }),
    floor_range_end: zod_1.z.coerce.number()
        .int({ message: "Floor range end must be a number" })
        .min(1, { message: "Floor range end must be at least 1" }),
    starting_apartment_number: zod_1.z.coerce.number()
        .int({ message: "Starting apartment number must be a number" })
        .min(1, { message: "Starting apartment number must be at least 1" }),
    apartments_per_floor: zod_1.z.coerce.number()
        .int({ message: "Apartments per floor must be a number" })
        .min(1, { message: "Apartments per floor must be at least 1" }),
});
