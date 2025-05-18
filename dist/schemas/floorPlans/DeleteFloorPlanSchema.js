"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteFloorPlanSchema = void 0;
const zod_1 = require("zod");
exports.DeleteFloorPlanSchema = zod_1.z.object({
    id: zod_1.z.string()
});
