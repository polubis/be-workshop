import { Request, Response } from "express";
import { createSupabaseServerClient } from "../../kernel/supabase";
import { NotFoundError } from "../../lib/errors";

/**
 * URL retrieval endpoint handler
 * Redirects to the original URL based on the short code
 */
export const urlRetrievalHandler = async (req: Request, res: Response) => {
  const { shortId } = req.params;
  const supabase = createSupabaseServerClient(req, res);

  const { data, error } = await supabase
    .from("urls")
    .select("long_url")
    .eq("short_code", shortId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Short URL not found");
  }

  res.redirect(301, data.long_url);
};

