import express, { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

class ApiError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

class BadRequestError extends ApiError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

const app = express();
app.use(express.json());

const urlDatabase: Record<string, string> = {};

const PORT = 3000;

function generateShortId(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
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

const validate = (schema: z.AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err: any) {
      const messages = err.errors.map((error: any) => error.message).join(', ');
      throw new BadRequestError(messages);
    }
  };

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/url', validate(shortUrlSchema), (req, res) => {
  const { url } = req.body;

  let shortId = generateShortId(8);
  while (urlDatabase[shortId]) {
    shortId = generateShortId(8);
  }

  urlDatabase[shortId] = url;

  const shortUrl = `http://localhost:${PORT}/${shortId}`;
  res.status(201).json({ shortUrl });
});

app.get('/:shortId', (req, res) => {
  const { shortId } = req.params;
  const longUrl = urlDatabase[shortId];

  if (longUrl) {
    res.redirect(301, longUrl);
  } else {
    throw new NotFoundError('Short URL not found');
  }
});

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: 'Internal Server Error' });
};

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  setInterval(() => {
    console.log('Tick!')
  }, 1000)
});   

