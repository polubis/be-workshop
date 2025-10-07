# Change Log

## v0.1.0 - Initial Turborepo Setup

**Timestamp:** 2025-10-07

### What was added:
- **Node.js version lock** (`.nvmrc`)
  - Locked to Node.js `22.20.0`
  - Ensures all developers use the same Node.js version
  
- **Package manager configuration** (`package.json`)
  - Locked pnpm to version `9.12.3` using `packageManager` field
  - Configured workspaces for `apps/*` and `packages/*`
  - Added Turborepo as a dev dependency
  - Added common scripts: `dev`, `build`, `lint`

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
   - Configure workspaces: `["apps/*", "packages/*"]`
   - Add `turbo` as a devDependency
   - Add scripts for `dev`, `build`, and `lint`

3. **Create turbo.json**
   - Add `$schema` for autocomplete
   - Define `tasks` for `build`, `lint`, and `dev`
   - Set `dev` task as `persistent: true` and `cache: false`

4. **Create .gitignore**
   - Add common Node.js ignores: `node_modules/`, `dist/`, `.env`
   - Add Turborepo specific: `.turbo/`
   - Add IDE and OS files: `.vscode/`, `.DS_Store`

5. **Create directory structure**
   ```bash
   # Create apps and packages directories
   mkdir apps packages
   
   # Add .gitkeep files to track empty directories
   touch apps/.gitkeep packages/.gitkeep
   ```

6. **Create base tsconfig.json**
   - Set `target: "ES2022"` for modern JavaScript
   - Enable `strict: true` for type safety
   - Set `noEmit: true` (let individual packages handle compilation)

7. **Install dependencies**
   ```bash
   pnpm install
   ```

### Common troubleshooting:
- **"pnpm: command not found"**: Install pnpm globally with `npm install -g pnpm@9.12.3`
- **"Node version mismatch"**: Run `nvm use` to switch to the correct version (or install nvm first)
- **Empty workspaces warning**: This is normal! We'll add apps and packages in future steps

### What's next:
Your Turborepo is ready! You can now:
- Add applications in the `apps/` directory (e.g., `apps/api`, `apps/web`)
- Add shared packages in the `packages/` directory (e.g., `packages/ui`, `packages/config`)

