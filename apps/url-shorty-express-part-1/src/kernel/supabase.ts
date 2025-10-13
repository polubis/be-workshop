import type { Request, Response } from "express";
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import { env } from "./env";

/**
 * Creates a Supabase server client for Express requests
 * Handles cookie management for authentication state
 */
const createSupabaseServerClient = (req: Request, res: Response) => {
  const cookieHeader = req.headers.cookie || "";

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        const cookies = parseCookieHeader(cookieHeader);
        return cookies.map(({ name, value }) => ({
          name,
          value: value ?? "",
        }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          const serializedCookie = serializeCookieHeader(name, value, {
            ...options,
            httpOnly: options?.httpOnly ?? true,
            secure: options?.secure ?? env.nodeEnv === "production",
            sameSite: options?.sameSite ?? "lax",
          });
          res.appendHeader("Set-Cookie", serializedCookie);
        });
      },
    },
  });
};

// Exports at the bottom
export { createSupabaseServerClient };

