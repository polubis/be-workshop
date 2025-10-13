import type { Request, Response } from "express";
import { createSupabaseServerClient } from "../../kernel/supabase";
import { ApiError } from "../../lib/errors";

/**
 * Generates a random short ID for URL shortening
 * @param length - Length of the short ID to generate
 * @returns A random string of alphanumeric characters
 */
const generateShortId = (length: number): string => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * URL shortening endpoint handler
 * Creates a short URL from a long URL
 */
const urlShortening = async (req: Request, res: Response) => {
  const { url } = req.body;
  const supabase = createSupabaseServerClient(req, res);

  const maxRetries = 10;

  for (let retries = 0; retries < maxRetries; retries++) {
    const shortId = generateShortId(8);

    const { error } = await supabase.from("urls").insert([
      {
        long_url: url,
        short_code: shortId,
      },
    ]);

    if (!error) {
      // Success - return the short URL
      const PORT = process.env.PORT || 3000;
      const shortUrl = `http://localhost:${PORT}/${shortId}`;
      return res.status(201).json({ shortUrl });
    }

    // If it's a unique constraint violation, retry with a new short code
    if (error.code === "23505") {
      continue;
    }

    // For any other database error, throw it immediately
    throw error;
  }

  // If all retries are exhausted, throw the required error message
  throw new ApiError("An unexpected error occurred, please try again", 500);
};

// Exports at the bottom
export { urlShortening };
