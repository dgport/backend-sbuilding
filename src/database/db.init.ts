import pool from '../config/sql';

export const createUsersTableIfNotExists = async (): Promise<void> => {
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
    await pool.query(usersQuery);
  } catch (error) {
    console.error("Error creating users table:", error);
    throw error;
  }
};

export const createBuildingsTableIfNotExists = async (): Promise<void> => {
  const buildingsQuery = `
  CREATE TABLE IF NOT EXISTS buildings (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

  try {
    await pool.query(buildingsQuery);
  } catch (error) {
    console.error("Error creating buildings table:", error);
    throw error;
  }
};

export const createRefreshTokensTableIfNotExists = async (): Promise<void> => {
  const refreshTokensQuery = `
  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

  try {
    await pool.query(refreshTokensQuery);
  } catch (error) {
    console.error("Error creating refresh tokens table:", error);
    throw error;
  }
};


export const createFloorPlanTableIfNoExists = async (): Promise<void> => {
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
    await pool.query(floorPlanQuery);
 
  } catch (error) {
    console.error("Error creating Floor type table:", error);
    throw error;
  }
};



const createApartmentsTableIfNotExists = async () => {
  try {
    await pool.query(`
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
   
  } catch (error) {
    console.error("Error creating apartments table:", error);
  }
};





export const initDatabase = async (): Promise<void> => {
  try {
    await createUsersTableIfNotExists();
    await createBuildingsTableIfNotExists();
    await createRefreshTokensTableIfNotExists();
    await createFloorPlanTableIfNoExists();
    await createApartmentsTableIfNotExists();
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};