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
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "https://aisigroup.ge",
        "https://www.aisigroup.ge",
        "https://api.aisigroup.ge"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.options('*', (0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/uploads', express_1.default.static('uploads'));
app.use("/api", routes_1.default);
app.use("/api", ...swagger_middleware_1.default);
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_init_1.initDatabase)();
    }
    catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
}))();
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
