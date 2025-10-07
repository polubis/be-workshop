# Change Log

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

