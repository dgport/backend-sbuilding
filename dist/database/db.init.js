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
exports.initDatabase = exports.createFloorPlanTableIfNoExists = exports.createRefreshTokensTableIfNotExists = exports.createBuildingsTableIfNotExists = exports.createUsersTableIfNotExists = void 0;
const sql_1 = __importDefault(require("../config/sql"));
const createUsersTableIfNotExists = () => __awaiter(void 0, void 0, void 0, function* () {
    const usersQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
    try {
        yield sql_1.default.query(usersQuery);
    }
    catch (error) {
        console.error("Error creating users table:", error);
        throw error;
    }
});
exports.createUsersTableIfNotExists = createUsersTableIfNotExists;
const createBuildingsTableIfNotExists = () => __awaiter(void 0, void 0, void 0, function* () {
    const buildingsQuery = `
  CREATE TABLE IF NOT EXISTS buildings (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
    try {
        yield sql_1.default.query(buildingsQuery);
    }
    catch (error) {
        console.error("Error creating buildings table:", error);
        throw error;
    }
});
exports.createBuildingsTableIfNotExists = createBuildingsTableIfNotExists;
const createRefreshTokensTableIfNotExists = () => __awaiter(void 0, void 0, void 0, function* () {
    const refreshTokensQuery = `
  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
    try {
        yield sql_1.default.query(refreshTokensQuery);
    }
    catch (error) {
        console.error("Error creating refresh tokens table:", error);
        throw error;
    }
});
exports.createRefreshTokensTableIfNotExists = createRefreshTokensTableIfNotExists;
const createFloorPlanTableIfNoExists = () => __awaiter(void 0, void 0, void 0, function* () {
    const floorPlanQuery = (`
    CREATE TABLE IF NOT EXISTS floor_plans (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      building_id INTEGER NOT NULL REFERENCES buildings(id),
      desktop_image TEXT NOT NULL,
      mobile_image TEXT NOT NULL,
      floor_range_start INTEGER NOT NULL,
      floor_range_end INTEGER NOT NULL,
      starting_apartment_number INTEGER NOT NULL,
      apartments_per_floor INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(name, building_id)
    )
  `);
    try {
        yield sql_1.default.query(floorPlanQuery);
    }
    catch (error) {
        console.error("Error creating Floor type table:", error);
        throw error;
    }
});
exports.createFloorPlanTableIfNoExists = createFloorPlanTableIfNoExists;
const createApartmentsTableIfNotExists = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield sql_1.default.query(`
      CREATE TABLE IF NOT EXISTS apartments (
        id SERIAL PRIMARY KEY,
        flat_id VARCHAR(255) DEFAULT '',
        flat_number INT NOT NULL,
        floor INT NOT NULL,
        building_id INT NOT NULL,
        floor_plan_id VARCHAR(255) DEFAULT '',
        name VARCHAR(255) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'available',
        desktop_paths VARCHAR(255) DEFAULT '',   
        mobile_paths VARCHAR(255) DEFAULT '',  
        images JSONB DEFAULT '[]',
        square_meters DECIMAL(10,2) DEFAULT 0,
        sqm_price DECIMAL(10,2) DEFAULT 0,
        CHECK (status IN ('available', 'reserved', 'sold')),
        CONSTRAINT unique_apartment UNIQUE (building_id, name, floor_plan_id, floor, flat_number)
      );
    `);
    }
    catch (error) {
        console.error("Error creating apartments table:", error);
    }
});
const initDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, exports.createUsersTableIfNotExists)();
        yield (0, exports.createBuildingsTableIfNotExists)();
        yield (0, exports.createRefreshTokensTableIfNotExists)();
        yield (0, exports.createFloorPlanTableIfNoExists)();
        yield createApartmentsTableIfNotExists();
    }
    catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    }
});
exports.initDatabase = initDatabase;
