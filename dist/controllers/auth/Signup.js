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
exports.SignUp = void 0;
const sql_1 = __importDefault(require("../../config/sql"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const SignupSchema_1 = require("../../schemas/auth/SignupSchema");
const SignUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = SignupSchema_1.SignUpSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                message: 'Invalid input data',
                errors: result.error.format(),
            });
            return;
        }
        const { email, password, firstName, lastName } = result.data;
        const checkQuery = `
        SELECT id FROM users WHERE email = $1;
      `;
        const { rows } = yield sql_1.default.query(checkQuery, [email]);
        if (rows.length > 0) {
            res.status(400).json({
                message: 'User with this email already exists',
            });
            return;
        }
        const saltRounds = 10;
        const passwordHash = yield bcrypt_1.default.hash(password, saltRounds);
        const createQuery = `
        INSERT INTO users (email, password_hash, first_name, last_name)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, first_name, last_name;
      `;
        const values = [email, passwordHash, firstName, lastName];
        const { rows: [newUser] } = yield sql_1.default.query(createQuery, values);
        res.status(201).json({
            message: 'User registered successfully',
            data: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.first_name,
                lastName: newUser.last_name
            }
        });
    }
    catch (error) {
        console.error('Error during sign up:', error);
        res.status(500).json({
            message: 'Internal server error during sign up'
        });
    }
});
exports.SignUp = SignUp;
