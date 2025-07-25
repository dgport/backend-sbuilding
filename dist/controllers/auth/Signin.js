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
exports.SignIn = void 0;
const sql_1 = __importDefault(require("../../config/sql"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const SigninSchema_1 = require("../../schemas/auth/SigninSchema");
const SignIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = SigninSchema_1.SignInSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                message: 'Invalid input data',
                errors: result.error.format(),
            });
            return;
        }
        const { email, password } = result.data;
        const query = `
      SELECT id, email, password_hash 
      FROM users 
      WHERE email = $1;
    `;
        const { rows } = yield sql_1.default.query(query, [email]);
        if (rows.length === 0) {
            res.status(401).json({
                message: 'Invalid credentials',
            });
            return;
        }
        const user = rows[0];
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password_hash);
        if (!passwordMatch) {
            res.status(401).json({
                message: 'Invalid credentials',
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        const isProduction = process.env.NODE_ENV === 'production';
        let domain;
        if (isProduction) {
            const origin = req.headers.origin;
            if (origin && origin.includes('aisigroup.ge')) {
                domain = '.aisigroup.ge';
            }
        }
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            domain: domain,
            path: '/',
            maxAge: 24 * 60 * 60 * 1000
        };
        console.log("🍪 Setting cookie with options:", cookieOptions);
        res.cookie('token', token, cookieOptions);
        res.status(200).json({
            message: 'Login successful',
            token: token,
            data: {
                id: user.id,
                email: user.email
            }
        });
    }
    catch (error) {
        console.error('Error during sign in:', error);
        res.status(500).json({
            message: 'Internal server error during sign in'
        });
    }
});
exports.SignIn = SignIn;
