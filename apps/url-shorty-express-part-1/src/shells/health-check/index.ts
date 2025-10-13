import type { Request, Response } from "express";

/**
 * Health check endpoint handler
 * Returns the application status
 */
const healthCheck = (req: Request, res: Response) => {
  res.json({ status: "ok" });
};

// Exports at the bottom
export { healthCheck };

