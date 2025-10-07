# Change Log

## v0.4.0 - Zod Validation & Custom Error Handling

*Timestamp: Tue, 07 Oct 2025 09:00:00 GMT*

This update adds robust input validation using Zod and a structured, centralized error-handling system.

*   **Add Zod Dependency**
    *   In `apps/url-shorty-express-part-1/package.json`, add `"zod": "^3.23.8"` to the dependencies.
    *   Run `pnpm install` from the root of the project to install the new package.

*   **Implement Custom Error Classes**
    *   In `index.ts`, create a base `ApiError` class that extends `Error` and includes a `statusCode`.
    *   Create `BadRequestError` (400) and `NotFoundError` (404) classes that extend `ApiError`.

*   **Create Zod Validation**
    *   Define a `shortUrlSchema` using Zod to validate the request body. It should ensure `url` is a string, a valid URL, and no more than 2,048 characters.
    *   Create a reusable `validate` middleware that takes a schema, parses the request, and throws a `BadRequestError` on failure.

*   **Update Endpoints**
    *   Apply the `validate(shortUrlSchema)` middleware to the `POST /api/url` route.
    *   Change the `GET /:shortId` endpoint to `throw new NotFoundError(...)` instead of sending a JSON response directly.

*   **Add Global Error Handler**
    *   Implement a final `errorHandler` middleware that catches all errors.
    *   It should check if the error is an instance of `ApiError` and return the appropriate status code and message.
    *   For unexpected errors, it should log them and return a generic 500 Internal Server Error.
    *   **Important:** This middleware must be added *after* all your routes with `app.use(errorHandler)`.

### How to Test:
Test the new validation and error responses.

1.  **Test Invalid URL submission:**
    ```bash
    curl -X POST http://localhost:3000/api/url \
    -H "Content-Type: application/json" \
    -d '{"url": "not-a-valid-url"}'
    ```
    - **Expected Response (400 Bad Request):**
      ```json
      {"error":"Wrong url format"}
      ```

2.  **Test Not Found error:**
    ```bash
    # Use an ID that you know does not exist
    curl -v http://localhost:3000/nonexistent
    ```
    - **Expected Response (404 Not Found):**
      ```
      < HTTP/1.1 404 Not Found
      ...
      {"error":"Short URL not found"}
      ```

## v0.3.0 - Initial URL Shortener Feature

*Timestamp: Tue, 07 Oct 2025 08:00:00 GMT*

This update introduces the core URL shortening functionality. Here’s how you can recreate it:

*   **Setup Express Server**
    *   In `apps/url-shorty-express-part-1/src/index.ts`, add the `express.json()` middleware to parse JSON request bodies.
    *   Create an empty object (`urlDatabase`) to serve as a temporary, in-memory database for storing URL mappings.

*   **Create the Shortening Endpoint (`POST /api/url`)**
    *   Add a `POST` route that accepts a JSON payload with a `url` property.
    *   Implement a function (`generateShortId`) to create a random, 8-character string of lowercase letters and numbers.
    *   Inside the endpoint, call this function to generate a unique ID. Make sure the ID doesn't already exist in `urlDatabase`.
    *   Store the original URL with the new short ID as the key.
    *   Respond with the full short URL.

*   **Create the Redirect Endpoint (`GET /:shortId`)**
    *   Add a `GET` route that uses a URL parameter (`:shortId`) to capture the short ID.
    *   Look up the `shortId` in the `urlDatabase`.
    *   If found, use `res.redirect(301, longUrl)` to permanently redirect the user.
    *   If not found, respond with a `404 Not Found` error.

### How to Test:
You can test the new endpoints using `cURL` from your terminal.

1.  **Create a short URL:**
    ```bash
    curl -X POST http://localhost:3000/api/url \
    -H "Content-Type: application/json" \
    -d '{"url": "https://www.example.com"}'
    ```
    - **Expected Response:** You will get a JSON response with the new short URL.
      ```json
      {"shortUrl":"http://localhost:3000/xxxxxxxx"}
      ```
      (Where `xxxxxxxx` is the randomly generated 8-character ID).

2.  **Test the redirect:**
    - Copy the 8-character ID from the response above.
    - Use it in the following command:
    ```bash
    # Replace xxxxxxxx with the ID you received
    curl -v http://localhost:3000/xxxxxxxx
    ```
    - **Expected Response:** Look for the `301 Moved Permanently` redirect header in the output.
      ```
      < HTTP/1.1 301 Moved Permanently
      < Location: https://www.example.com
      ...
      ```

**⚠️ Common Pitfalls for Beginners:**

*   **Missing `express.json()`:** Forgetting to add `app.use(express.json());` will cause `req.body` to be `undefined`, and your `POST` endpoint won't be able to read the incoming URL.
*   **Redirect Loop:** Be careful not to shorten a URL that points back to your own shortener (e.g., `localhost:3000`). This can cause an infinite redirect loop. We'll add validation for this later!
*   **Data is Not Persistent:** Our in-memory `urlDatabase` will be cleared every time the server restarts. We will replace this with a real database (Supabase) in a future step.

## v0.2.0 - Express + TypeScript App Setup

**Timestamp:** 2025-10-07

### What was added:
- **New Express application** (`apps/url-shorty-express-part-1/`)
  - Minimal Express server with TypeScript
  - Single health check endpoint at `/health`
  - Runs on port 3000

- **Application package.json** (`apps/url-shorty-express-part-1/package.json`)
  - Express as main dependency
  - TypeScript and type definitions locally installed
  - `tsx` for running TypeScript in development with watch mode
  - Scripts: `dev` (watch mode), `build` (compile TS), `start` (run compiled JS)

- **Application TypeScript config** (`apps/url-shorty-express-part-1/tsconfig.json`)
  - Extends root `tsconfig.json`
  - Compiles from `src/` to `dist/`
  - Configured for Node.js/Express development

- **Minimal Express server** (`apps/url-shorty-express-part-1/src/index.ts`)
  - Basic Express setup with one endpoint
  - Health check endpoint returning JSON: `{ "status": "ok" }`
  - Console log on server startup

- **pnpm workspace configuration** (`pnpm-workspace.yaml`)
  - Required file for pnpm to detect workspaces
  - Tells pnpm to look for packages in `apps/*` and `packages/*`
  - Without this, pnpm won't install dependencies from your apps!

### How to reproduce:
1. **Create the app directory structure**
   ```bash
   mkdir -p apps/url-shorty-express-part-1/src
   ```

2. **Create `apps/url-shorty-express-part-1/package.json`**
   - Set `name: "url-shorty-express-part-1"`
   - Add dependencies:
     - `express` (main framework)
   - Add devDependencies:
     - `@types/express` (TypeScript types for Express)
     - `@types/node` (TypeScript types for Node.js)
     - `tsx` (run TypeScript directly with watch mode)
     - `typescript` (TypeScript compiler)
   - Add scripts:
     - `dev: "tsx watch src/index.ts"` (development with auto-reload)
     - `build: "tsc"` (compile TypeScript)
     - `start: "node dist/index.js"` (run compiled code)

3. **Create `apps/url-shorty-express-part-1/tsconfig.json`**
   - Extend from root: `"extends": "../../tsconfig.json"`
   - Set `outDir: "./dist"` (where compiled JS goes)
   - Set `rootDir: "./src"` (where TS source files are)
   - Set `noEmit: false` (enable compilation)
   - Include only `src/**/*`

4. **Create `apps/url-shorty-express-part-1/src/index.ts`**
   ```typescript
   import express from 'express';

   const app = express();
   const PORT = 3000;

   app.get('/health', (req, res) => {
     res.json({ status: 'ok' });
   });

   app.listen(PORT, () => {
     console.log(`Server is running on http://localhost:${PORT}`);
   });
   ```

5. **Create `pnpm-workspace.yaml` in the root** (CRITICAL for pnpm!)
   ```yaml
   packages:
     - 'apps/*'
     - 'packages/*'
   ```
   
   **Important:** pnpm ONLY uses this file to detect workspaces. The `workspaces` field in `package.json` is for npm/yarn compatibility but isn't used by pnpm. Without `pnpm-workspace.yaml`, pnpm will NOT install dependencies from your apps!

6. **Install pnpm (if not already installed)**
   ```bash
   # Option 1: Using Corepack (Recommended - comes with Node.js)
   corepack enable
   
   # Option 2: Install globally with npm
   npm install -g pnpm@9.12.3
   ```
   
   **Note:** The `packageManager` field in `package.json` specifies which pnpm version to use, but doesn't install pnpm itself. You need to install it first using one of the methods above.

7. **Install dependencies**
   ```bash
   # Install from the root (pnpm will install for all workspaces)
   pnpm install
   ```

8. **Run the development server**
   ```bash
   # From the root, using Turborepo
   pnpm dev --filter url-shorty-express-part-1
   
   # Or navigate to the app directory
   cd apps/url-shorty-express-part-1
   pnpm dev
   ```

9. **Test the server**
   - Open browser: `http://localhost:3000/health`
   - Or use curl: `curl http://localhost:3000/health`
   - Should return: `{"status":"ok"}`

### Common troubleshooting:
- **"pnpm: command not found" or "pnpm is not recognized"**: You need to install pnpm first! Use `corepack enable` (recommended) or `npm install -g pnpm@9.12.3`. The `packageManager` field in package.json only specifies which version to use, it doesn't install pnpm automatically.
- **"Cannot find module 'express'" or TypeScript can't find types**: This usually means pnpm didn't install your app's dependencies. **Make sure you have `pnpm-workspace.yaml` in the root!** Without this file, pnpm only installs root dependencies and ignores all apps. After creating the file, run `pnpm install` again.
- **pnpm only installed turbo, nothing else**: You're missing `pnpm-workspace.yaml`! pnpm requires this file to detect workspaces. The `workspaces` field in package.json is NOT used by pnpm (that's for npm/yarn only).
- **"Port 3000 is already in use"**: Another app is using port 3000. Either stop it or change the `PORT` constant in `src/index.ts`
- **TypeScript errors about Express types after installation**: Try deleting `node_modules` and `pnpm-lock.yaml`, then run `pnpm install` again from the root

### What's next:
Your Express app is ready! In the next iteration, we can:
- Add middleware (body parsing, CORS, etc.)
- Add more routes and endpoints
- Connect to Supabase database
- Add validation and error handling

## v0.1.0 - Initial Turborepo Setup

**Timestamp:** 2025-10-07

### What was added:
- **Node.js version lock** (`.nvmrc`)
  - Locked to Node.js `22.20.0`
  - Ensures all developers use the same Node.js version
  
- **Package manager configuration** (`package.json`)
  - Locked pnpm to version `9.12.3` using `packageManager` field
  - Configured workspaces for `apps/*` and `packages/*` (for npm/yarn compatibility)
  - Added Turborepo as a dev dependency
  - Added common scripts: `dev`, `build`, `lint`

- **pnpm workspace configuration** (`pnpm-workspace.yaml`)
  - Required file for pnpm to detect workspaces
  - Tells pnpm to look for packages in `apps/*` and `packages/*`
  - Critical: pnpm ignores the `workspaces` field in package.json!

- **Turborepo configuration** (`turbo.json`)
  - Basic pipeline setup for build, lint, and dev tasks
  - Dev task configured as persistent (keeps running)
  - Build task configured to cache outputs

- **Git ignore rules** (`.gitignore`)
  - Ignores `node_modules`, build outputs, environment files
  - Ignores common IDE and OS files

- **Directory structure**
  - `apps/` - For applications (currently empty)
  - `packages/` - For shared packages (currently empty)

- **TypeScript base configuration** (`tsconfig.json`)
  - Strict mode enabled for type safety
  - ES2022 target for modern features
  - Can be extended by individual apps/packages

### How to reproduce:
1. **Set up Node.js version**
   ```bash
   # Create .nvmrc file with Node.js version
   echo "22.20.0" > .nvmrc
   
   # Use the correct Node version (if you have nvm installed)
   nvm use
   ```

2. **Initialize root package.json**
   - Set `private: true` (monorepos shouldn't be published)
   - Add `packageManager: "pnpm@9.12.3"` to lock pnpm version
   - Configure workspaces: `["apps/*", "packages/*"]` (optional, for npm/yarn compatibility)
   - Add `turbo` as a devDependency
   - Add scripts for `dev`, `build`, and `lint`

3. **Create `pnpm-workspace.yaml`** (CRITICAL for pnpm!)
   ```yaml
   packages:
     - 'apps/*'
     - 'packages/*'
   ```
   
   **Important:** pnpm ONLY uses this file to detect workspaces. Unlike npm/yarn, pnpm ignores the `workspaces` field in `package.json`. Without this file, pnpm will NOT discover or install dependencies from your apps and packages!

4. **Create turbo.json**
   - Add `$schema` for autocomplete
   - Define `tasks` for `build`, `lint`, and `dev`
   - Set `dev` task as `persistent: true` and `cache: false`

5. **Create .gitignore**
   - Add common Node.js ignores: `node_modules/`, `dist/`, `.env`
   - Add Turborepo specific: `.turbo/`
   - Add IDE and OS files: `.vscode/`, `.DS_Store`

6. **Create directory structure**
   ```bash
   # Create apps and packages directories
   mkdir apps packages
   
   # Add .gitkeep files to track empty directories
   touch apps/.gitkeep packages/.gitkeep
   ```

7. **Create base tsconfig.json**
   - Set `target: "ES2022"` for modern JavaScript
   - Enable `strict: true` for type safety
   - Set `noEmit: true` (let individual packages handle compilation)

8. **Install pnpm (if not already installed)**
   ```bash
   # Option 1: Using Corepack (Recommended - comes with Node.js)
   corepack enable
   
   # Option 2: Install globally with npm
   npm install -g pnpm@9.12.3
   ```
   
   **Note:** The `packageManager` field in `package.json` specifies which pnpm version to use, but doesn't install pnpm itself. You need to install it first using one of the methods above.

9. **Install dependencies**
   ```bash
   pnpm install
   ```

### Common troubleshooting:
- **"pnpm: command not found" or "pnpm is not recognized"**: You need to install pnpm first! Use `corepack enable` (recommended) or `npm install -g pnpm@9.12.3`. The `packageManager` field in package.json only specifies which version to use, it doesn't install pnpm automatically.
- **"Node version mismatch"**: Run `nvm use` to switch to the correct version (or install nvm first)
- **Empty workspaces warning**: This is normal! We'll add apps and packages in future steps

### What's next:
Your Turborepo is ready! You can now:
- Add applications in the `apps/` directory (e.g., `apps/api`, `apps/web`)
- Add shared packages in the `packages/` directory (e.g., `packages/ui`, `packages/config`)

