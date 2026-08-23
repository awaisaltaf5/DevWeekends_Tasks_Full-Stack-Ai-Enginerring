"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            // Verify token
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                res.status(500).json({ message: 'JWT secret is not configured' });
                return;
            }
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            // Add user from payload to request object
            req.user = typeof decoded === 'string' ? { id: decoded } : {
                id: typeof decoded.sub === 'string' ? decoded.sub : undefined,
                email: typeof decoded.email === 'string' ? decoded.email : undefined
            };
            next();
        }
        catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
            return;
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
exports.protect = protect;
