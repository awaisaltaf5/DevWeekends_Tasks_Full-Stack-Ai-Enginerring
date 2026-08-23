"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (_req, res) => {
    console.log('✅ Test handler invoked');
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.end(JSON.stringify({
        success: true,
        message: "Vercel works!",
        timestamp: new Date().toISOString()
    }));
};
