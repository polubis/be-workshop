import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { BadRequestError } from "../../lib/errors";

export const validate =
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

