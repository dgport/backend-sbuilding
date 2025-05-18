"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignUpSchema = void 0;
const zod_1 = require("zod");
exports.SignUpSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Invalid email format" }),
    password: zod_1.z.string().min(6, { message: "Password must be at least 6 characters" }),
    firstName: zod_1.z.string().min(1, { message: "First name is required" }),
    lastName: zod_1.z.string().min(1, { message: "Last name is required" })
});
