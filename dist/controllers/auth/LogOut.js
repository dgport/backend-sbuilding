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
exports.SignOut = void 0;
const SignOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("🚪 Signing out user:", (_a = req.user) === null || _a === void 0 ? void 0 : _a.email);
    try {
        // Determine environment
        const isProduction = process.env.NODE_ENV === 'production';
        // Set domain based on environment and origin
        let domain;
        if (isProduction) {
            // Extract the base domain from the origin
            const origin = req.headers.origin;
            if (origin && origin.includes('aisigroup.ge')) {
                domain = '.aisigroup.ge'; // This will work for all subdomains
            }
        }
        // Clear the cookie with matching options that were used to set it
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            domain: domain,
            path: '/'
        };
        console.log("🍪 Clearing cookie with options:", cookieOptions);
        res.clearCookie('token', cookieOptions);
        res.status(200).json({
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        console.error('Error during sign out:', error);
        res.status(500).json({
            message: 'Internal server error during sign out'
        });
    }
});
exports.SignOut = SignOut;
