import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";

const validateEnvironment = () => {
  try {
    const envSchema = z.object({
      SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
      SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
      NODE_ENV: z.string().optional(),
    });

    return envSchema.parse(process.env);
  } catch (error) {
    console.error("❌ Environment validation failed:");
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    }
    console.error("\n💡 Make sure to set the required environment variables:");
    console.error("  - SUPABASE_URL: Your Supabase project URL");
    console.error("  - SUPABASE_ANON_KEY: Your Supabase anonymous key");
    process.exit(1);
  }
};

// Validate environment on startup
const env = validateEnvironment();

class ApiError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

class BadRequestError extends ApiError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

class NotFoundError extends ApiError {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}

const app = express();
app.use(express.json());

// Supabase configuration using validated environment variables
const supabaseUrl = env.SUPABASE_URL;
const supabaseAnonKey = env.SUPABASE_ANON_KEY;

// Create Supabase server client for Express
const createSupabaseServerClient = (req: Request, res: Response) => {
  const cookieHeader = req.headers.cookie || "";

  return createServerClient(supabaseUrl, supabaseAnonKey, {
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
            secure: options?.secure ?? process.env.NODE_ENV === "production",
            sameSite: options?.sameSite ?? "lax",
          });
          res.appendHeader("Set-Cookie", serializedCookie);
        });
      },
    },
  });
};

const PORT = 3000;

function generateShortId(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const shortUrlSchema = z.object({
  body: z.object({
    url: z.string().url({ message: "Wrong url format" }).max(2048),
  }),
});

const validate =
  (schema: z.AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err: any) {
      const messages = err.errors.map((error: any) => error.message).join(", ");
      throw new BadRequestError(messages);
    }
  };

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/url", validate(shortUrlSchema), async (req, res) => {
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
});

app.get("/:shortId", async (req, res) => {
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
});

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  return res.status(500).json({ error: "Internal Server Error" });
};

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
