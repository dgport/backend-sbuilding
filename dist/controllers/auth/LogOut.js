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
    try {
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
            path: '/'
        };
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
