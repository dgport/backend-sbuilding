"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddBuildingSchema = void 0;
const zod_1 = require("zod");
exports.AddBuildingSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
});
