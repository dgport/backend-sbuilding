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
exports.getApartmentsByBuildingId = void 0;
const sql_1 = __importDefault(require("../../config/sql"));
const getApartmentsByBuildingId = (buildingId_1, floorPlanId_1, ...args_1) => __awaiter(void 0, [buildingId_1, floorPlanId_1, ...args_1], void 0, function* (buildingId, floorPlanId, limit = 10, offset = 0, floorNumber) {
    try {
        // Base query for counting total apartments
        let countQuery = "SELECT COUNT(*) FROM apartments WHERE building_id = $1";
        const countParams = [buildingId];
        if (floorPlanId) {
            countQuery += " AND floor_plan_id = $2";
            countParams.push(floorPlanId);
        }
        // Add floor filter to count query if specified
        if (floorNumber !== undefined) {
            countQuery += ` AND floor = $${countParams.length + 1}`;
            countParams.push(floorNumber);
        }
        const countResult = yield sql_1.default.query(countQuery, countParams);
        const total = Number.parseInt(countResult.rows[0].count, 10);
        // Base query for selecting apartments - ADDED sqm_price TO THE SELECT STATEMENT
        let query = `SELECT flat_id, flat_number, status, images, floor, square_meters, 
                        mobile_paths, desktop_paths, floor_plan_id, sqm_price 
                 FROM apartments WHERE building_id = $1`;
        const queryParams = [buildingId];
        if (floorPlanId) {
            query += " AND floor_plan_id = $2";
            queryParams.push(floorPlanId);
        }
        // Add floor filter to select query if specified
        if (floorNumber !== undefined) {
            query += ` AND floor = $${queryParams.length + 1}`;
            queryParams.push(floorNumber);
        }
        // Order results
        query += " ORDER BY floor_plan_id, floor, flat_number";
        // Add pagination
        query += " LIMIT $" + (queryParams.length + 1) + " OFFSET $" + (queryParams.length + 2);
        queryParams.push(limit, offset);
        // Execute query
        const result = yield sql_1.default.query(query, queryParams);
        // Group apartments by floor plan and floor
        const apartmentsGrouped = result.rows.reduce((acc, apartment) => {
            // Initialize floor plan if not exists
            if (!acc[apartment.floor_plan_id]) {
                acc[apartment.floor_plan_id] = {
                    floor_plan_id: apartment.floor_plan_id,
                    apartments: [],
                };
            }
            // Find floor group
            const floorGroup = acc[apartment.floor_plan_id].apartments.find((floor) => floor.floor === apartment.floor);
            // Process apartment images
            let apartmentImages = apartment.images;
            if (typeof apartmentImages === "string") {
                try {
                    apartmentImages = JSON.parse(apartmentImages);
                }
                catch (e) {
                    apartmentImages = [];
                }
            }
            if (!Array.isArray(apartmentImages)) {
                apartmentImages = [];
            }
            // Handle paths
            const mobilePaths = apartment.mobile_paths || "";
            const desktopPaths = apartment.desktop_paths || "";
            // Add apartment to the appropriate floor group
            if (!floorGroup) {
                acc[apartment.floor_plan_id].apartments.push({
                    floor: apartment.floor,
                    apartments: [
                        {
                            flat_id: apartment.flat_id,
                            flat_number: apartment.flat_number,
                            status: apartment.status,
                            images: apartmentImages,
                            square_meters: apartment.square_meters,
                            mobile_paths: mobilePaths,
                            desktop_paths: desktopPaths,
                            sqm_price: apartment.sqm_price, // ADDED sqm_price TO THE OUTPUT
                        },
                    ],
                });
            }
            else {
                floorGroup.apartments.push({
                    flat_id: apartment.flat_id,
                    flat_number: apartment.flat_number,
                    status: apartment.status,
                    images: apartmentImages,
                    square_meters: apartment.square_meters,
                    mobile_paths: mobilePaths,
                    desktop_paths: desktopPaths,
                    sqm_price: apartment.sqm_price, // ADDED sqm_price TO THE OUTPUT
                });
            }
            return acc;
        }, {});
        // Convert grouped apartments to array
        const groupedApartments = Object.values(apartmentsGrouped);
        return {
            apartments: groupedApartments,
            total,
        };
    }
    catch (error) {
        console.error("Error fetching apartments by building ID:", error);
        throw new Error("Database query error");
    }
});
exports.getApartmentsByBuildingId = getApartmentsByBuildingId;
