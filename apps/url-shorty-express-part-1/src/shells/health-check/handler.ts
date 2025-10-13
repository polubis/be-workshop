import { Request, Response } from "express";

/**
 * Health check endpoint handler
 * Returns the application status
 */
export const healthCheckHandler = (req: Request, res: Response) => {
  res.json({ status: "ok" });
};

