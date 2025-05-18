"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteFloorPlan = void 0;
const sql_1 = __importDefault(require("../../config/sql"));
const promises_1 = __importDefault(require("fs/promises"));
const DeleteFloorPlanSchema_1 = require("../../schemas/floorPlans/DeleteFloorPlanSchema");
const DeleteFloorPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = DeleteFloorPlanSchema_1.DeleteFloorPlanSchema.safeParse(req.params);
        if (!result.success) {
            return res.status(400).json({
                status: "ERROR",
                error: "VALIDATION_ERROR",
                message: "Invalid input data",
                errors: result.error.format(),
            });
        }
        const { id } = result.data;
        const { rows: existingFloorPlans } = yield sql_1.default.query("SELECT * FROM floor_plans WHERE id = $1", [id]);
        if (existingFloorPlans.length === 0) {
            return res.status(404).json({
                status: "ERROR",
                error: "FLOOR_PLAN_NOT_FOUND",
                message: "Floor plan with this ID does not exist.",
            });
        }
        const floorPlan = existingFloorPlans[0];
        try {
            if (floorPlan.desktop_image) {
                yield promises_1.default.unlink(floorPlan.desktop_image);
            }
            if (floorPlan.mobile_image) {
                yield promises_1.default.unlink(floorPlan.mobile_image);
            }
        }
        catch (fileError) {
            console.warn("Could not delete associated image files:", fileError);
        }
        const { rowCount } = yield sql_1.default.query("DELETE FROM floor_plans WHERE id = $1", [id]);
        if (rowCount === 0) {
            return res.status(500).json({
                status: "ERROR",
                error: "DELETION_FAILED",
                message: "Unable to delete the floor plan.",
            });
        }
        res.status(200).json({
            status: "SUCCESS",
            message: "Floor plan deleted successfully",
            data: { id }
        });
    }
    catch (error) {
        console.error("Error deleting floor plan:", error);
        res.status(500).json({
            status: "ERROR",
            error: "SERVER_ERROR",
            message: "An error occurred while deleting the floor plan",
        });
    }
});
exports.DeleteFloorPlan = DeleteFloorPlan;
