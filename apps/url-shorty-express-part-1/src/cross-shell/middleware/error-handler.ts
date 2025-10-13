import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../lib/errors";

/**
 * Global error handler middleware
 * Catches all errors thrown in the application and returns appropriate responses
 */
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle API errors with custom status codes
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Log unexpected errors for debugging
  console.error("Unexpected error:", err);

  // Handle all other errors as 500 Internal Server Error
  return res.status(500).json({ error: "Internal Server Error" });
};

// Exports at the bottom
export { errorHandler };

