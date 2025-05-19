import express, { Request, Response, NextFunction, Application } from 'express';
import dotenv from "dotenv";
import { initDatabase } from './database/db.init';
import router from './routes';
import swaggerMiddleware from "./middlewares/swagger-middleware";
import cookieParser from 'cookie-parser';
import cors from "cors";

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3001', 10);
const isProduction: boolean = process.env.NODE_ENV === 'production';

// Define allowed origins
const allowedOrigins: string[] = [
    "http://localhost:3000",
    "https://aisibatumi.ge", 
    "https://www.aisibatumi.ge",
    "https://api.aisibatumi.ge", 
    "http://api.aisibatumi.ge"
];

// CORS configuration with proper function-based origin handling
app.use(
  cors({
    origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`Origin ${origin} not allowed by CORS`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  })
);

// Handle preflight requests
app.options('*', cors());

// Add security headers for production
if (isProduction) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    next();
  });
}

// Parse JSON request bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Set up API routes
app.use("/api", router);

// Set up Swagger documentation
app.use("/api", ...swaggerMiddleware);

// Error handling middleware
interface ServerError extends Error {
  status?: number;
}

app.use((err: ServerError, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize database and start server
(async (): Promise<void> => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT} (${isProduction ? 'production' : 'development'} mode)`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
})();