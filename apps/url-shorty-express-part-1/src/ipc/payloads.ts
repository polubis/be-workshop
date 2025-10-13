import { z } from "zod";

export const shortUrlSchema = z.object({
  body: z.object({
    url: z.string().url({ message: "Wrong url format" }).max(2048),
  }),
});

export type ShortUrlPayload = z.infer<typeof shortUrlSchema>;

