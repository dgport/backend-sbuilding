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
exports.AddFloorPlan = void 0;
const sql_1 = __importDefault(require("../../config/sql"));
const AddFloorPlanSchema_1 = require("../../schemas/floorPlans/AddFloorPlanSchema");
const AddFloorPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const { body } = req;
    try {
        const result = AddFloorPlanSchema_1.AddFloorPlanSchema.safeParse(body);
        if (!result.success) {
            return res.status(400).json({
                status: "ERROR",
                error: "VALIDATION_ERROR",
                message: "Invalid input data",
                errors: result.error.format(),
            });
        }
        const { name, building_id, floor_range_start, floor_range_end, starting_apartment_number, apartments_per_floor } = result.data;
        const buildingExists = yield sql_1.default.query("SELECT * FROM buildings WHERE id = $1", [building_id]);
        if (buildingExists.rows.length === 0) {
            return res.status(404).json({
                status: "ERROR",
                error: "BUILDING_NOT_FOUND",
                message: "Building with this ID does not exist.",
            });
        }
        const existingFloorPlan = yield sql_1.default.query("SELECT * FROM floor_plans WHERE LOWER(name) = LOWER($1) AND building_id = $2", [name, building_id]);
        if (existingFloorPlan.rows.length > 0) {
            return res.status(409).json({
                status: "ERROR",
                error: "FLOOR_PLAN_EXIST",
                message: "A floor plan with this name already exists for this building.",
            });
        }
        const desktopImageUrl = ((_c = (_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a.desktop_image) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.path) || '';
        const mobileImageUrl = ((_f = (_e = (_d = req.files) === null || _d === void 0 ? void 0 : _d.mobile_image) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.path) || '';
        const { rows: [newFloorPlan] } = yield sql_1.default.query(`INSERT INTO floor_plans (
        name, building_id, desktop_image, mobile_image,
        floor_range_start, floor_range_end,
        starting_apartment_number, apartments_per_floor
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [
            name,
            building_id,
            desktopImageUrl,
            mobileImageUrl,
            floor_range_start,
            floor_range_end,
            starting_apartment_number,
            apartments_per_floor,
        ]);
        res.status(201).json({
            status: "SUCCESS",
            message: "Floor plan created successfully",
            data: newFloorPlan,
        });
    }
    catch (error) {
        console.error("Error creating floor plan:", error);
        res.status(500).json({
            status: "ERROR",
            error: "SERVER_ERROR",
            message: "An error occurred while creating the floor plan",
        });
    }
});
exports.AddFloorPlan = AddFloorPlan;
