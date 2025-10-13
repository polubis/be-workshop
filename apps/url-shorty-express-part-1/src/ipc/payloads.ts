import { z } from "zod";

const shortUrlSchema = z.object({
  body: z.object({
    url: z.string().url({ message: "Wrong url format" }).max(2048),
  }),
});

type ShortUrlPayload = z.infer<typeof shortUrlSchema>;

// Exports at the bottom
export { shortUrlSchema };
export type { ShortUrlPayload };

