import "dotenv/config";
import "express-async-errors";
import express from "express";
import { shortUrlSchema } from "./ipc/payloads";
import { validate } from "./cross-shell/middleware/validate";
import { errorHandler } from "./cross-shell/middleware/error-handler";
import { healthCheck } from "./shells/health-check";
import { urlShortening } from "./shells/url-shortening";
import { urlRetrieval } from "./shells/url-retrieval";

const app = express();
app.use(express.json());

const PORT = 3000;

// Routes
app.get("/health", healthCheck);
app.post("/api/url", validate(shortUrlSchema), urlShortening);
app.get("/:shortId", urlRetrieval);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
