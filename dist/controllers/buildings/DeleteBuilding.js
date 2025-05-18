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
exports.DeleteBuildingById = void 0;
const sql_1 = __importDefault(require("../../config/sql"));
const DeleteBuildingById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield sql_1.default.connect();
    try {
        // Start a transaction
        yield client.query('BEGIN');
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                message: "Building ID is required",
            });
            return;
        }
        // First, delete floor plans associated with the building
        const deleteFloorPlansQuery = `
            DELETE FROM floor_plans 
            WHERE building_id = $1
        `;
        yield client.query(deleteFloorPlansQuery, [id]);
        // Then delete the building itself
        const deleteBuilding = `
            DELETE FROM buildings 
            WHERE id = $1
            RETURNING id;
        `;
        const { rows } = yield client.query(deleteBuilding, [id]);
        if (rows.length === 0) {
            yield client.query('ROLLBACK');
            res.status(404).json({
                message: "Building not found",
            });
            return;
        }
        // Commit the transaction
        yield client.query('COMMIT');
        res.status(200).json({
            message: "Building and associated floor plans deleted successfully",
        });
    }
    catch (error) {
        // Rollback the transaction in case of error
        yield client.query('ROLLBACK');
        console.error("Error deleting building:", error);
        res.status(500).json({
            message: "Internal server error while deleting building",
        });
    }
    finally {
        // Release the client back to the pool
        client.release();
    }
});
exports.DeleteBuildingById = DeleteBuildingById;
