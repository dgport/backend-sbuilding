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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApartments = void 0;
const GetApartmentsByBuilding_1 = require("./GetApartmentsByBuilding");
const getApartments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { building_id, floor_plan_id } = req.params;
    const { page = '1', limit = '10', floor } = req.query;
    try {
        if (!building_id) {
            return res.status(400).json({
                status: 'ERROR',
                error: 'MISSING_BUILDING_ID',
                message: 'The building_id is required and cannot be empty.',
            });
        }
        const buildingId = parseInt(building_id, 10);
        if (isNaN(buildingId)) {
            return res.status(400).json({
                status: 'ERROR',
                error: 'INVALID_BUILDING_ID',
                message: 'The provided building_id is not a valid integer. Please provide a valid numeric building_id.',
            });
        }
        let floorPlanId;
        if (floor_plan_id) {
            floorPlanId = parseInt(floor_plan_id, 10);
            if (isNaN(floorPlanId)) {
                return res.status(400).json({
                    status: 'ERROR',
                    error: 'INVALID_FLOOR_PLAN_ID',
                    message: 'The provided floor_plan_id is not a valid integer. Please provide a valid numeric floor_plan_id.',
                });
            }
        }
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        if (isNaN(pageNumber) || pageNumber < 1) {
            return res.status(400).json({
                status: 'ERROR',
                error: 'INVALID_PAGE',
                message: 'The page parameter must be a positive integer.',
            });
        }
        if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
            return res.status(400).json({
                status: 'ERROR',
                error: 'INVALID_LIMIT',
                message: 'The limit parameter must be a positive integer not exceeding 100.',
            });
        }
        let floorNumber;
        if (floor !== undefined) {
            floorNumber = parseInt(floor, 10);
            if (isNaN(floorNumber)) {
                return res.status(400).json({
                    status: 'ERROR',
                    error: 'INVALID_FLOOR',
                    message: 'The floor parameter must be a valid integer.',
                });
            }
        }
        const offset = (pageNumber - 1) * limitNumber;
        // Pass floorNumber to the database query
        const { apartments: apartmentsGrouped, total } = yield (0, GetApartmentsByBuilding_1.getApartmentsByBuildingId)(buildingId, floorPlanId, limitNumber, offset, floorNumber);
        // No need to filter apartments here as we're already filtering in the database query
        let filteredApartments = apartmentsGrouped;
        let filteredTotal = total;
        if (filteredApartments.length === 0) {
            if (pageNumber === 1) {
                const errorMessage = floorNumber !== undefined
                    ? `No apartments found for building ID ${buildingId}${floorPlanId ? `, floor plan ID ${floorPlanId}` : ''} and floor ${floorNumber}.`
                    : floorPlanId
                        ? `No apartments found for building ID ${buildingId} and floor plan ID ${floorPlanId}.`
                        : `No apartments found for building ID ${buildingId}.`;
                return res.status(404).json({
                    status: 'ERROR',
                    error: 'NO_APARTMENTS_FOUND',
                    message: errorMessage,
                });
            }
            else {
                return res.status(404).json({
                    status: 'ERROR',
                    error: 'PAGE_OUT_OF_RANGE',
                    message: `No apartments found for page ${pageNumber}. The total number of pages is ${Math.ceil(filteredTotal / limitNumber)}.`,
                });
            }
        }
        const totalPages = Math.ceil(filteredTotal / limitNumber);
        const hasNextPage = pageNumber < totalPages;
        const hasPreviousPage = pageNumber > 1;
        let successMessage = `Apartments retrieved successfully for building ID ${buildingId}`;
        if (floorPlanId) {
            successMessage += ` and floor plan ID ${floorPlanId}`;
        }
        if (floorNumber !== undefined) {
            successMessage += ` on floor ${floorNumber}`;
        }
        successMessage += '.';
        return res.status(200).json({
            status: 'SUCCESS',
            message: successMessage,
            pagination: {
                total: filteredTotal,
                page: pageNumber,
                limit: limitNumber,
                totalPages,
                hasNextPage,
                hasPreviousPage,
            },
            apartments: filteredApartments,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({
                status: 'ERROR',
                error: 'SERVER_ERROR',
                message: 'An error occurred while retrieving apartments.',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
        return res.status(500).json({
            status: 'ERROR',
            error: 'UNKNOWN_ERROR',
            message: 'An unknown error occurred while processing your request.',
        });
    }
});
exports.getApartments = getApartments;
