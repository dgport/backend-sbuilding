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
exports.AddBuilding = void 0;
const AddBuildingSchema_1 = require("../../schemas/buildings/AddBuildingSchema");
const sql_1 = __importDefault(require("../../config/sql"));
const AddBuilding = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = AddBuildingSchema_1.AddBuildingSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                message: 'Invalid input data',
                errors: result.error.format(),
            });
            return;
        }
        const { name } = result.data;
        const checkQuery = `
            SELECT id FROM buildings WHERE name = $1;
        `;
        const { rows } = yield sql_1.default.query(checkQuery, [name]);
        if (rows.length > 0) {
            res.status(400).json({
                message: 'Building with this name already exists',
            });
            return;
        }
        const createQuery = `
            INSERT INTO buildings (name)
            VALUES ($1)
            RETURNING id, name;
        `;
        const values = [name];
        const { rows: [addBuilding] } = yield sql_1.default.query(createQuery, values);
        res.status(201).json({
            message: 'Building created successfully',
            data: addBuilding
        });
    }
    catch (error) {
        console.error('Error creating Building:', error);
        res.status(500).json({
            message: 'Internal server error while creating Building'
        });
    }
});
exports.AddBuilding = AddBuilding;
