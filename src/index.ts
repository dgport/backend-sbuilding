import express from 'express';
import dotenv from "dotenv";
import { initDatabase } from './database/db.init';
import router from './routes';
import swaggerMiddleware from "./middlewares/swagger-middleware";
import cookieParser from 'cookie-parser';
import cors from "cors";
import path from 'path';

// Load environment variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

console.log(`Running in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
console.log(`Allowed origins: ${JSON.stringify([
  "http://localhost:3000", 
  "https://aisigroup.ge", 
  "https://www.aisigroup.ge",
  "https://api.aisigroup.ge"
])}`);

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000", 
      "https://aisigroup.ge", 
      "https://www.aisigroup.ge",
      "https://api.aisigroup.ge"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  })
);

// Enable pre-flight requests for all routes
app.options('*', cors());

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// API routes
app.use("/api", router);
app.use("/api", ...swaggerMiddleware);

// Add diagnostic endpoint for debugging CORS and cookies
app.get('/api/debug', (req, res) => {
  res.status(200).json({
    cookies: req.cookies,
    headers: {
      origin: req.headers.origin,
      host: req.headers.host,
      referer: req.headers.referer,
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'not set',
      isProduction: isProduction
    }
  });
});

// Initialize database
(async () => {
  try {
    await initDatabase();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
})();

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});