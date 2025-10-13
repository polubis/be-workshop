import { Request, Response } from "express";
import { createSupabaseServerClient } from "../../kernel/supabase";
import { ApiError } from "../../lib/errors";
import { generateShortId } from "./utils";

/**
 * URL shortening endpoint handler
 * Creates a short URL from a long URL
 */
export const urlShorteningHandler = async (req: Request, res: Response) => {
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

