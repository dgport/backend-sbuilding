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
exports.updateApartmentStatus = void 0;
const GenerateApartmentsSchema_1 = require("../../schemas/apartments/GenerateApartmentsSchema");
const sql_1 = __importDefault(require("../../config/sql"));
const updateApartmentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validationResult = GenerateApartmentsSchema_1.updateApartmentStatusSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                status: 'ERROR',
                error: 'INVALID_INPUT',
                message: 'The provided data is invalid.',
                details: validationResult.error.errors
            });
        }
        const { status, floor_plan_id, flat_number, sqm_price } = validationResult.data;
        let queryFields = [];
        let queryParams = [];
        let paramCounter = 1;
        if (status !== undefined) {
            queryFields.push(`status = $${paramCounter}`);
            queryParams.push(status);
            paramCounter++;
        }
        if (sqm_price !== undefined) {
            queryFields.push(`sqm_price = $${paramCounter}`);
            queryParams.push(sqm_price);
            paramCounter++;
        }
        if (queryFields.length === 0) {
            return res.status(400).json({
                status: 'ERROR',
                error: 'INVALID_INPUT',
                message: 'No fields to update were provided'
            });
        }
        queryParams.push(floor_plan_id, flat_number);
        const query = `
      UPDATE apartments 
      SET ${queryFields.join(', ')} 
      WHERE floor_plan_id = $${paramCounter} AND flat_number = $${paramCounter + 1}
      RETURNING *
    `;
        const result = yield sql_1.default.query(query, queryParams);
        if (result.rowCount === 0) {
            return res.status(404).json({
                status: 'ERROR',
                error: 'APARTMENT_NOT_FOUND',
                message: 'Apartment not found with the given floor_plan_id and flat_number'
            });
        }
        const updatedApartment = result.rows[0];
        if (typeof updatedApartment.images === 'string') {
            try {
                updatedApartment.images = JSON.parse(updatedApartment.images);
            }
            catch (e) {
                updatedApartment.images = [];
            }
        }
        if (!Array.isArray(updatedApartment.images)) {
            updatedApartment.images = [];
        }
        res.status(200).json({
            status: 'SUCCESS',
            message: 'Apartment updated successfully',
            apartment: updatedApartment
        });
    }
    catch (error) {
        console.error("Error updating apartment:", error);
        res.status(500).json({
            status: 'ERROR',
            error: 'SERVER_ERROR',
            message: 'An error occurred while updating the apartment.',
            details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
        });
    }
});
exports.updateApartmentStatus = updateApartmentStatus;
