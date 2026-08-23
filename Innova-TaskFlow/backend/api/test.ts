import type { Request, Response } from 'express';

export default (_req: Request, res: Response): void => {
  console.log('✅ Test handler invoked');
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.end(JSON.stringify({
    success: true,
    message: "Vercel works!",
    timestamp: new Date().toISOString()
  }));
};