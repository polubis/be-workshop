import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
  NODE_ENV: z.string().optional(),
});
/**
 * Validates environment variables on application startup
 * Exits the process if validation fails
 */
const validateEnvironment = (): {
  supabaseUrl: string;
  supabaseAnonKey: string;
  nodeEnv: string | undefined;
} => {
  try {
    const parsed = envSchema.parse(process.env);

    return {
      supabaseUrl: parsed.SUPABASE_URL,
      supabaseAnonKey: parsed.SUPABASE_ANON_KEY,
      nodeEnv: parsed.NODE_ENV,
    };
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

/**
 * Validated environment variables
 * This is validated once at application startup
 */
export const env = validateEnvironment();
export type Env = ReturnType<typeof validateEnvironment>;
