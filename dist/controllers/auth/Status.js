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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuthStatus = void 0;
const checkAuthStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🔍 Checking auth status");
    try {
        if (req.user) {
            console.log("✅ User authenticated:", req.user.email);
            res.status(200).json({
                authenticated: true,
                user: {
                    userId: req.user.userId,
                    email: req.user.email
                }
            });
        }
        else {
            console.log("❌ User not authenticated");
            res.status(401).json({
                authenticated: false,
                message: "Not authenticated"
            });
        }
    }
    catch (error) {
        console.error("🚫 Error checking auth status:", error);
        res.status(500).json({ message: "Server error during authentication check" });
    }
});
exports.checkAuthStatus = checkAuthStatus;
