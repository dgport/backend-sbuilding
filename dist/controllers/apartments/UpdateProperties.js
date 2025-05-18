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
exports.updateSharedProperties = void 0;
const sql_1 = __importDefault(require("../../config/sql"));
const fileUtils_1 = require("../../utils/fileUtils");
const path_1 = __importDefault(require("path"));
const updateSharedProperties = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uploadedFiles = req.files || [];
    try {
        const { floor_plan_id, flat_id, square_meters, mobile_paths = '', desktop_paths = '' } = req.body;
        if (!floor_plan_id || !flat_id) {
            uploadedFiles.forEach(file => (0, fileUtils_1.removeUploadedFile)(file.path));
            return res.status(400).json({
                status: 'ERROR',
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Both floor_plan_id and flat_id are required',
            });
        }
        if (square_meters === undefined) {
            uploadedFiles.forEach(file => (0, fileUtils_1.removeUploadedFile)(file.path));
            return res.status(400).json({
                status: 'ERROR',
                error: 'MISSING_SQUARE_METERS',
                message: 'Square meters must be provided.',
            });
        }
        // Convert values to the correct types
        const floorPlanIdValue = floor_plan_id.toString();
        const flatIdValue = parseInt(flat_id, 10);
        const squareMetersValue = parseFloat(square_meters);
        // Check floor plan exists
        const checkFloorPlanQuery = `
      SELECT 1 FROM floor_plans WHERE id = $1
    `;
        const checkFloorPlanResult = yield sql_1.default.query(checkFloorPlanQuery, [floorPlanIdValue]);
        if (checkFloorPlanResult.rowCount === 0) {
            uploadedFiles.forEach(file => (0, fileUtils_1.removeUploadedFile)(file.path));
            return res.status(404).json({
                status: 'ERROR',
                error: 'FLOOR_PLAN_NOT_FOUND',
                message: 'Floor plan not found',
            });
        }
        // Get existing apartment
        const getExistingApartmentQuery = `
      SELECT a.*, b.id as building_id, b.name
      FROM apartments a
      JOIN buildings b ON a.building_id = b.id
      WHERE a.floor_plan_id = $1 AND a.flat_id = $2
    `;
        const existingApartment = yield sql_1.default.query(getExistingApartmentQuery, [floorPlanIdValue, flatIdValue]);
        if (existingApartment.rowCount === 0) {
            uploadedFiles.forEach(file => (0, fileUtils_1.removeUploadedFile)(file.path));
            return res.status(404).json({
                status: 'ERROR',
                error: 'APARTMENT_NOT_FOUND',
                message: 'No apartments found with the provided flat_id under this floor plan',
            });
        }
        // Process existing images
        let existingImages = [];
        if (existingApartment.rows[0].images) {
            if (typeof existingApartment.rows[0].images === 'string') {
                try {
                    existingImages = JSON.parse(existingApartment.rows[0].images);
                }
                catch (e) {
                    existingImages = [];
                }
            }
            else if (Array.isArray(existingApartment.rows[0].images)) {
                existingImages = existingApartment.rows[0].images;
            }
        }
        // Build update query
        let query = `
      UPDATE apartments 
      SET square_meters = $3, mobile_paths = $4, desktop_paths = $5
    `;
        let values = [floorPlanIdValue, flatIdValue, squareMetersValue, mobile_paths, desktop_paths];
        // Process uploaded files
        if (uploadedFiles.length > 0) {
            const newImagePaths = uploadedFiles.map(file => `/uploads/apartments/${file.filename}`).slice(0, 2);
            // Remove old images
            if (existingImages.length > 0) {
                existingImages.forEach((imagePath) => {
                    const fullPath = path_1.default.join(process.cwd(), imagePath.replace(/^\//, ''));
                    (0, fileUtils_1.removeUploadedFile)(fullPath);
                });
            }
            // Add images to query
            query += `, images = $${values.length + 1}`;
            values.push(JSON.stringify(newImagePaths));
            // Remove excess uploaded files
            if (uploadedFiles.length > 2) {
                for (let i = 2; i < uploadedFiles.length; i++) {
                    (0, fileUtils_1.removeUploadedFile)(uploadedFiles[i].path);
                }
            }
        }
        // Complete the query
        query += `
      WHERE floor_plan_id = $1 
      AND flat_id = $2 
      RETURNING id, flat_id, flat_number, floor_plan_id, status, square_meters, images, floor, building_id, mobile_paths, desktop_paths
    `;
        // Execute the update
        const result = yield sql_1.default.query(query, values);
        // Process the results
        const updatedApartments = result.rows.map(apartment => {
            let apartmentImages = apartment.images;
            if (typeof apartmentImages === 'string') {
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
            return Object.assign(Object.assign({}, apartment), { images: apartmentImages, name: existingApartment.rows[0].name });
        });
        res.status(200).json({
            status: 'SUCCESS',
            message: 'Shared properties updated successfully',
            updatedApartments: updatedApartments,
            affectedCount: result.rowCount,
        });
    }
    catch (error) {
        console.error('Error updating shared properties:', error);
        // Clean up any uploaded files in case of error
        uploadedFiles.forEach(file => (0, fileUtils_1.removeUploadedFile)(file.path));
        res.status(500).json({
            status: 'ERROR',
            error: 'SERVER_ERROR',
            message: 'An error occurred while updating apartment properties',
            details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
        });
    }
});
exports.updateSharedProperties = updateSharedProperties;
