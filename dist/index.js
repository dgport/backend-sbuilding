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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_init_1 = require("./database/db.init");
const routes_1 = __importDefault(require("./routes"));
const swagger_middleware_1 = __importDefault(require("./middlewares/swagger-middleware"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3001', 10);
const isProduction = process.env.NODE_ENV === 'production';
// Define allowed origins
const allowedOrigins = [
    "http://localhost:3000",
    "https://aisibatumi.ge",
    "https://www.aisibatumi.ge",
    "https://api.aisibatumi.ge",
    "http://api.aisibatumi.ge"
];
// CORS configuration with proper function-based origin handling
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            console.warn(`Origin ${origin} not allowed by CORS`);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
// Handle preflight requests
app.options('*', (0, cors_1.default)());
// Add security headers for production
if (isProduction) {
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        next();
    });
}
// Parse JSON request bodies
app.use(express_1.default.json());
// Parse cookies
app.use((0, cookie_parser_1.default)());
// Serve static files from uploads directory
app.use('/uploads', express_1.default.static('uploads'));
// Set up API routes
app.use("/api", routes_1.default);
// Set up Swagger documentation
app.use("/api", ...swagger_middleware_1.default);
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// Initialize database and start server
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_init_1.initDatabase)();
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT} (${isProduction ? 'production' : 'development'} mode)`);
        });
    }
    catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
}))();
