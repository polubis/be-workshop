import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { BadRequestError } from "../../lib/errors";

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
    } catch (err: unknown) {
      const error = err as { errors: Array<{ message: string }> };
      const messages = error.errors.map((errorItem: { message: string }) => errorItem.message).join(", ");
      throw new BadRequestError(messages);
    }
  };

// Exports at the bottom
export { validate };

