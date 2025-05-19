"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Signin_1 = require("../../controllers/auth/Signin");
const Signup_1 = require("../../controllers/auth/Signup");
const auth_1 = require("../../middlewares/auth");
const LogOut_1 = require("../../controllers/auth/LogOut");
const Status_1 = require("../../controllers/auth/Status");
const router = express_1.default.Router();
// Public routes
router.post("/signin", Signin_1.SignIn);
router.post("/signup", Signup_1.SignUp);
// Protected routes
router.post("/signout", auth_1.authenticateToken, LogOut_1.SignOut);
router.get("/status", auth_1.authenticateToken, Status_1.checkAuthStatus); // Add this new route
exports.default = router;
