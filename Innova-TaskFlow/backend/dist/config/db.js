"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConnected = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Track connection state for serverless environments
let cachedConn = null;
let connectionPromise = null;
const connectDB = async () => {
    // If already connected, return immediately
    if (cachedConn) {
        console.log('Using cached MongoDB connection');
        return true;
    }
    // If a connection attempt is in progress, wait for it to complete
    // (fixes serverless cold-start race condition where the fire-and-forget
    //  initial connectDB() hasn't finished by the time the first request arrives)
    if (connectionPromise) {
        console.log('MongoDB connection in progress - awaiting existing attempt...');
        try {
            await connectionPromise;
        }
        catch (_error) {
            // Connection failed, fall through to return false
        }
        return cachedConn !== null;
    }
    // If no MONGODB_URI, skip connection (for testing)
    if (!process.env.MONGODB_URI) {
        console.warn('⚠️ MONGODB_URI not set - skipping MongoDB connection');
        return false;
    }
    // Start the connection attempt and store the promise so concurrent
    // calls can await the same attempt instead of starting duplicates
    connectionPromise = mongoose_1.default.connect(process.env.MONGODB_URI, {
        // Fast timeout settings for serverless environments
        serverSelectionTimeoutMS: 5000, // 5 second timeout
        socketTimeoutMS: 45000, // 45 second socket timeout
        maxPoolSize: 1, // Minimal pool for serverless
        bufferCommands: true, // Allow buffering while connecting (default; safe for serverless)
    });
    try {
        const conn = await connectionPromise;
        cachedConn = conn;
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return true;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown database error';
        console.error(`❌ MongoDB connection error: ${message}`);
        if (process.env.VERCEL) {
            // On Vercel serverless, don't crash - let app continue for health checks
            console.log('⚠️ Continuing without MongoDB (health checks still work)');
            return false;
        }
        // Non-Vercel: exit on error
        process.exit(1);
    }
    finally {
        // Clear the promise so future calls can attempt a fresh connection
        connectionPromise = null;
    }
};
// Export a helper to check if MongoDB is connected
const isConnected = () => {
    return cachedConn !== null && mongoose_1.default.connection.readyState === 1;
};
exports.isConnected = isConnected;
exports.default = connectDB;
