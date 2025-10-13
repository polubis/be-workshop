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
  let retries = 0;

  while (retries < maxRetries) {
    const shortId = generateShortId(8);

    try {
      const { error } = await supabase.from("urls").insert([
        {
          long_url: url,
          short_code: shortId,
        },
      ]);

      if (error) {
        // If it's a unique constraint violation, try again
        if (error.code === "23505") {
          retries++;
          continue;
        }
        throw error;
      }

      const PORT = process.env.PORT || 3000;
      const shortUrl = `http://localhost:${PORT}/${shortId}`;
      return res.status(201).json({ shortUrl });
    } catch (error) {
      if (retries >= maxRetries - 1) {
        throw new ApiError(
          "An unexpected error occurred, please try again",
          500
        );
      }
      retries++;
    }
  }
};

