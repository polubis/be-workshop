# Change Log

## v0.7.0 - Code Style Guide Implementation & Architecture Refactoring

*Timestamp: Mon, 13 Oct 2025 12:06:00 GMT*

This major update implements a comprehensive code style guide and refactors the application to follow Linux-inspired modular architecture patterns.

### **Code Style Guide Implementation**
*   **Create Comprehensive Code Style Guide**
    *   Add `documentation/code-style.md` with detailed coding conventions
    *   Define JavaScript rules: avoid `this` keyword, function declarations, prefer bottom-of-file exports
    *   Define TypeScript rules: avoid `any` types, prefer `unknown`, use `import type` syntax, prefer types over interfaces
    *   Define General rules: facade pattern for libraries, functional programming over OOP, small middleware, kebab-case naming

*   **Apply Code Style Fixes**
    *   Convert all function declarations to function expressions
    *   Move all inline exports to bottom-of-file exports
    *   Replace `any` types with `unknown` and proper type guards
    *   Use `import type` for type-only imports from Express
    *   Apply consistent naming conventions throughout codebase

### **Linux-Inspired Architecture Refactoring**
*   **Implement Modular Shell Architecture**
    *   Create `src/shells/` directory for isolated endpoint modules
    *   Implement `url-shortening/`, `url-retrieval/`, and `health-check/` shells
    *   Each shell is self-contained with its own handlers and utilities
    *   Shells communicate only through defined interfaces, never directly

*   **Add Cross-Shell Services**
    *   Create `src/cross-shell/middleware/` for shared middleware
    *   Implement `validate.ts` and `error-handler.ts` as reusable components
    *   Middleware follows single responsibility principle

*   **Implement Kernel Layer**
    *   Create `src/kernel/` for core system services
    *   Add `env.ts` for environment variable validation
    *   Add `supabase.ts` for database client management
    *   Kernel provides foundational services to shells

*   **Add IPC Contracts**
    *   Create `src/ipc/` for type definitions and schemas
    *   Implement `payloads.ts` with Zod validation schemas
    *   Clear separation between runtime values and compile-time types

*   **Enhance Error Handling**
    *   Create comprehensive error class hierarchy in `src/lib/errors.ts`
    *   Implement `ApiError` base class with status codes
    *   Add specific error classes: `BadRequestError`, `NotFoundError`, `UnauthorizedError`, etc.
    *   Centralized error handling with proper HTTP status codes

### **Architecture Benefits**
*   **Modularity**: Clear separation of concerns between endpoint modules
*   **Scalability**: Easy to add new endpoint modules without affecting existing ones
*   **Maintainability**: Isolated modules are easier to maintain and refactor
*   **Type Safety**: IPC contracts ensure type-safe communication between layers
*   **Testing**: Each module can be tested in isolation with clear boundaries

### **Code Quality Improvements**
*   **Type Safety**: All `any` types replaced with `unknown` and proper type guards
*   **Consistency**: Uniform code style across entire codebase
*   **Performance**: Type-only imports for better tree-shaking
*   **Maintainability**: Clear separation between implementation and public API

### **Files Modified**
*   **14 files changed** with comprehensive refactoring
*   **970+ lines added** for code style guide documentation
*   **121 lines removed** from consolidated architecture
*   **All handlers** converted to follow new patterns
*   **All middleware** updated to use new error handling

### **How to Use the New Architecture**
The application now follows a clear modular pattern:

1. **Shells** (`src/shells/`): Isolated endpoint modules
   - Each shell handles one domain (URL shortening, retrieval, health)
   - Self-contained with internal logic and utilities
   - Exports only public API through `index.ts`

2. **Cross-Shell** (`src/cross-shell/`): Shared domain services
   - Middleware used across multiple shells
   - Validation and error handling utilities
   - Domain-specific business logic

3. **Kernel** (`src/kernel/`): System core services
   - Environment validation and configuration
   - Database client management
   - Foundational services for the application

4. **IPC** (`src/ipc/`): Communication contracts
   - Type definitions and validation schemas
   - Clear interfaces between layers
   - Type-safe data exchange

## v0.6.0 - Linux-Inspired Architecture Implementation

*Timestamp: Mon, 13 Oct 2025 11:03:00 GMT*

This update refactors the application to follow a Linux-inspired modular architecture, providing better separation of concerns and scalability.

*   **Implement Shell Architecture**
    *   Create `src/shells/` directory for isolated endpoint modules
    *   Implement `url-shortening/`, `url-retrieval/`, and `health-check/` shells
    *   Each shell is self-contained with its own handlers and utilities
    *   Shells communicate only through defined interfaces

*   **Add Cross-Shell Services**
    *   Create `src/cross-shell/middleware/` for shared middleware
    *   Implement `validate.ts` and `error-handler.ts` as reusable components
    *   Middleware follows single responsibility principle

*   **Implement Kernel Layer**
    *   Create `src/kernel/` for core system services
    *   Add `env.ts` for environment variable validation
    *   Add `supabase.ts` for database client management
    *   Kernel provides foundational services to shells

*   **Add IPC Contracts**
    *   Create `src/ipc/` for type definitions and schemas
    *   Implement `payloads.ts` with Zod validation schemas
    *   Clear separation between runtime values and compile-time types

*   **Enhance Error Handling**
    *   Create comprehensive error class hierarchy in `src/lib/errors.ts`
    *   Implement `ApiError` base class with status codes
    *   Add specific error classes: `BadRequestError`, `NotFoundError`, `UnauthorizedError`, etc.
    *   Centralized error handling with proper HTTP status codes

*   **Create Architecture Documentation**
    *   Add `documentation/architecture.md` with detailed architecture explanation
    *   Document the Linux-inspired design principles
    *   Provide clear guidelines for future development

### **Architecture Benefits**
*   **Modularity**: Clear separation of concerns between endpoint modules
*   **Scalability**: Easy to add new endpoint modules without affecting existing ones
*   **Maintainability**: Isolated modules are easier to maintain and refactor
*   **Type Safety**: IPC contracts ensure type-safe communication between layers
*   **Testing**: Each module can be tested in isolation with clear boundaries

## v0.5.0 - Supabase Database Integration

*Timestamp: Mon, 13 Oct 2025 09:00:00 GMT*

This update replaces the in-memory storage with a proper Supabase database, adds environment variable validation, and includes local development database setup.

*   **Add Supabase Dependencies**
    *   In `apps/url-shorty-express-part-1/package.json`, add `"@supabase/ssr": "^0.7.0"` for server-side rendering support with cookie handling.
    *   Add `"dotenv": "^17.2.3"` for environment variable management.
    *   Add `"supabase": "^2.51.0"` as a dev dependency for local CLI operations.

*   **Add Database Management Scripts**
    *   Add `"db:start": "npx supabase start"` to start the local Supabase development environment.
    *   Add `"db:stop": "npx supabase stop"` to stop the local development environment.
    *   Add `"db:migrate": "npx supabase migration up"` to apply database migrations.
    *   Add `"db:reset": "npx supabase db reset"` to reset the local database.
    *   Add `"db:new-migration": "npx supabase migration new"` to create new migration files.

*   **Implement Environment Validation**
    *   In `index.ts`, add `import "dotenv/config"` at the top to load environment variables.
    *   Create `validateEnvironment()` function using Zod to validate required environment variables.
    *   Validate `SUPABASE_URL` as a proper URL and `SUPABASE_ANON_KEY` as a required string.
    *   Exit gracefully with helpful error messages if environment validation fails.

*   **Setup Supabase Server Client**
    *   Import Supabase SSR utilities: `createServerClient`, `parseCookieHeader`, `serializeCookieHeader`.
    *   Create `createSupabaseServerClient()` function that handles cookie parsing and setting for proper session management.
    *   Configure secure cookie options with `httpOnly`, `secure` (production only), and `sameSite: "lax"`.

*   **Replace In-Memory Storage with Database**
    *   Remove the `urlDatabase` object completely.
    *   Update `POST /api/url` endpoint to use `supabase.from("urls").insert()` with retry logic for unique constraint violations.
    *   Update `GET /:shortId` endpoint to use `supabase.from("urls").select().eq().single()` for database queries.
    *   Add proper error handling for database operations with fallback to generic error messages.

*   **Initialize Supabase Local Development**
    *   Create `supabase/.gitignore` to exclude temporary Supabase files from version control.
    *   Generate `supabase/config.toml` with comprehensive local development configuration including API, database, auth, storage, and studio settings.
    *   Create initial migration `20251013074417_init.sql` with the `urls` table schema.

*   **Database Schema (`urls` table)**
    *   `id`: Auto-incrementing primary key
    *   `creation_date`: Timestamp with timezone, defaults to now()
    *   `update_date`: Timestamp with timezone, auto-updated via trigger
    *   `long_url`: Text field with constraints (1-2048 chars, must start with http:// or https://)
    *   `short_code`: Text field with constraints (min 8 chars, lowercase letters and numbers only)
    *   `unique_short_code`: Unique constraint on short_code to prevent duplicates
    *   Includes trigger function `handle_updated_at()` to automatically update `update_date` on modifications.

### How to Setup:
Before running the application, you need to set up the local Supabase environment and configure environment variables.

1.  **Install Supabase CLI dependencies:**
    ```bash
    pnpm install
    ```

2.  **Start local Supabase development environment:**
    ```bash
    cd apps/url-shorty-express-part-1
    pnpm db:start
    ```
    This will start Docker containers for PostgreSQL, Supabase Studio, and other services.

3.  **Create environment file:**
    Create `.env` in `apps/url-shorty-express-part-1/` with:
    ```env
    SUPABASE_URL=http://127.0.0.1:54321
    SUPABASE_ANON_KEY=your_anon_key_from_supabase_start_output
    ```
    **Note:** The `SUPABASE_ANON_KEY` is displayed in the terminal when you run `pnpm db:start`.

4.  **Access Supabase Studio:**
    - Open `http://localhost:54323` to view your local database in Supabase Studio
    - You can inspect tables, run queries, and manage your database schema

### How to Test:
The API endpoints work the same as before, but now use a real database.

1.  **Test creating a short URL:**
    ```bash
    curl -X POST http://localhost:3000/api/url \
    -H "Content-Type: application/json" \
    -d '{"url": "https://www.example.com"}'
    ```
    - **Expected Response:** Same as before, but data is now persisted in the database.
      ```json
      {"shortUrl":"http://localhost:3000/xxxxxxxx"}
      ```

2.  **Test the redirect:**
    ```bash
    curl -v http://localhost:3000/xxxxxxxx
    ```
    - **Expected Response:** Same 301 redirect behavior, but data retrieved from database.

3.  **Verify database persistence:**
    - Stop your Express server and restart it
    - Previously created short URLs should still work (unlike the in-memory version)
    - Check the `urls` table in Supabase Studio at `http://localhost:54323`

### Important Notes:
*   **Database Persistence:** Unlike the previous in-memory version, your data now persists between server restarts.
*   **Environment Variables Required:** The server will not start without proper `SUPABASE_URL` and `SUPABASE_ANON_KEY` configuration.
*   **Local Development Only:** This setup uses local Supabase containers. For production, you'd need to create a Supabase project and use production credentials.
*   **Docker Required:** The `supabase start` command requires Docker to be installed and running on your system.

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

