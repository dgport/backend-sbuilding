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
exports.BuildingFloorPlan = void 0;
const sql_1 = __importDefault(require("../../config/sql"));
const BuildingFloorPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                status: 'ERROR',
                error: 'INVALID_BUILDING_ID',
                message: 'A valid building ID must be provided'
            });
        }
        const query = "SELECT * FROM floor_plans WHERE building_id = $1 ORDER BY name ASC";
        const result = yield sql_1.default.query(query, [Number(id)]);
        return res.status(200).json(result.rows);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({
                status: 'ERROR',
                error: 'SERVER_ERROR',
                message: 'An error occurred while fetching floor plans',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
        return res.status(500).json({
            status: 'ERROR',
            error: 'SERVER_ERROR',
            message: 'An unknown server error occurred'
        });
    }
});
exports.BuildingFloorPlan = BuildingFloorPlan;
