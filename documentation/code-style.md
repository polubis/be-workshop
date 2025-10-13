# Code Style Guide

> **Last Updated**: October 13, 2025  
> **Project**: BE Workshop - URL Shortener  
> **Tech Stack**: TypeScript, Express, Supabase

This document defines the coding conventions and style guidelines for the backend workshop project. Following these conventions ensures code consistency, readability, and maintainability across the codebase.

---

## Table of Contents

1. [General](#general)
2. [JavaScript](#javascript)
3. [TypeScript](#typescript)

---

## 1. General

### Do not use directly any libraries in application logic. Use "facade" pattern

Never import and use third-party libraries directly in your application logic. Always create a facade (wrapper) layer to abstract the library implementation. This reduces maintenance costs and migration risks.

**Rationale**: Direct library usage creates tight coupling and makes it difficult to switch libraries or handle breaking changes. A facade pattern provides a stable interface while allowing the underlying implementation to change.

**Examples**:

```typescript
// ❌ Bad - direct library usage in application logic
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import bcrypt from 'bcrypt';

export const userHandler = async (req: Request, res: Response) => {
  // Direct Supabase usage
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  const { data, error } = await supabase.from('users').select('*');
  
  // Direct Zod usage
  const schema = z.object({ email: z.string().email() });
  const result = schema.parse(req.body);
  
  // Direct bcrypt usage
  const hashedPassword = await bcrypt.hash(password, 10);
  
  return res.json(data);
};

// ✅ Good - facade pattern
// lib/database/database-facade.ts
type DatabaseClient = {
  select(table: string): Promise<any[]>;
  insert(table: string, data: any): Promise<void>;
  update(table: string, id: string, data: any): Promise<void>;
  delete(table: string, id: string): Promise<void>;
};

const createSupabaseFacade = (): DatabaseClient => {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  
  return {
    select: async (table: string) => {
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw new Error(`Database error: ${error.message}`);
      return data;
    },
    insert: async (table: string, data: any) => {
      const { error } = await supabase.from(table).insert(data);
      if (error) throw new Error(`Database error: ${error.message}`);
    },
    update: async (table: string, id: string, data: any) => {
      const { error } = await supabase.from(table).update(data).eq('id', id);
      if (error) throw new Error(`Database error: ${error.message}`);
    },
    delete: async (table: string, id: string) => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw new Error(`Database error: ${error.message}`);
    }
  };
};

// lib/validation/validation-facade.ts
type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: string[];
};

type Validator = {
  validate<T>(schema: any, data: unknown): ValidationResult<T>;
};

const createZodValidator = (): Validator => ({
  validate: <T>(schema: any, data: unknown): ValidationResult<T> => {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error: any) {
      return { 
        success: false, 
        errors: error.errors?.map((e: any) => e.message) || ['Validation failed'] 
      };
    }
  }
});

// lib/crypto/hash-facade.ts
type HashService = {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
};

const createBcryptHashService = (): HashService => ({
  hash: async (password: string) => {
    return await bcrypt.hash(password, 10);
  },
  compare: async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
  }
});

// Application logic using facades
const userHandler = async (req: Request, res: Response) => {
  const db = createSupabaseFacade();
  const validator = createZodValidator();
  const hashService = createBcryptHashService();
  
  // Use facades instead of direct library calls
  const validation = validator.validate(userSchema, req.body);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.errors });
  }
  
  const hashedPassword = await hashService.hash(validation.data.password);
  await db.insert('users', { ...validation.data, password: hashedPassword });
  
  const users = await db.select('users');
  return res.json(users);
};

// Exports at the bottom
export { userHandler };
```

**Benefits**:
- **Migration Safety**: Can switch from Supabase to PostgreSQL without changing application logic
- **Testing**: Easy to mock facades for unit testing
- **Consistency**: Standardized interfaces across the application
- **Error Handling**: Centralized error handling and logging
- **Future-proofing**: Can add features like caching, retries, or monitoring without changing application code

**Facade Structure**:
```
lib/
├── database/
│   ├── supabase-facade.ts
│   └── database-interface.ts
├── validation/
│   ├── zod-facade.ts
│   └── validation-interface.ts
├── crypto/
│   ├── bcrypt-facade.ts
│   └── hash-interface.ts
└── http/
    ├── axios-facade.ts
    └── http-interface.ts
```

### Prefer functional programming instead of OOP to avoid not needed coupling and huge modules

Use functional programming patterns instead of Object-Oriented Programming. This reduces coupling, makes modules smaller and more focused, and promotes better testability.

**Rationale**: OOP often leads to large classes with multiple responsibilities, tight coupling between methods, and difficulty in testing individual pieces. Functional programming promotes small, pure functions that are easier to test, reason about, and compose.

**Examples**:

```typescript
// ❌ Bad - OOP approach with large class
class UserService {
  private database: DatabaseClient;
  private validator: Validator;
  private hashService: HashService;
  private emailService: EmailService;
  
  constructor(database: DatabaseClient, validator: Validator, hashService: HashService, emailService: EmailService) {
    this.database = database;
    this.validator = validator;
    this.hashService = hashService;
    this.emailService = emailService;
  }
  
  async createUser(userData: unknown): Promise<User> {
    const validation = this.validator.validate(userSchema, userData);
    if (!validation.success) {
      throw new Error('Validation failed');
    }
    
    const hashedPassword = await this.hashService.hash(validation.data.password);
    const user = await this.database.insert('users', { ...validation.data, password: hashedPassword });
    
    await this.emailService.sendWelcomeEmail(user.email);
    
    return user;
  }
  
  async updateUser(id: string, userData: unknown): Promise<User> {
    // Similar large method with multiple responsibilities
  }
  
  async deleteUser(id: string): Promise<void> {
    // Another method with multiple responsibilities
  }
}

// ✅ Good - functional approach with small, focused functions
// user/validation.ts
const validateUserData = (validator: Validator) => (userData: unknown) => {
  const validation = validator.validate(userSchema, userData);
  if (!validation.success) {
    throw new ValidationError('Invalid user data', validation.errors);
  }
  return validation.data;
};

// user/hashing.ts
const hashUserPassword = (hashService: HashService) => async (userData: UserData) => {
  const hashedPassword = await hashService.hash(userData.password);
  return { ...userData, password: hashedPassword };
};

// user/database.ts
const createUserInDatabase = (database: DatabaseClient) => async (userData: UserData) => {
  return await database.insert('users', userData);
};

// user/notification.ts
const sendWelcomeEmail = (emailService: EmailService) => async (user: User) => {
  await emailService.sendWelcomeEmail(user.email);
};

// user/composition.ts - compose the functions
const createUser = (
  validator: Validator,
  hashService: HashService,
  database: DatabaseClient,
  emailService: EmailService
) => async (userData: unknown): Promise<User> => {
  const validate = validateUserData(validator);
  const hashPassword = hashUserPassword(hashService);
  const saveUser = createUserInDatabase(database);
  const notifyUser = sendWelcomeEmail(emailService);
  
  const validatedData = validate(userData);
  const hashedData = await hashPassword(validatedData);
  const user = await saveUser(hashedData);
  await notifyUser(user);
  
  return user;
};

// Usage
const userCreator = createUser(validator, hashService, database, emailService);
const user = await userCreator(userData);
```

**Benefits**:
- **Small Functions**: Each function has a single responsibility
- **Easy Testing**: Test each function in isolation
- **Composability**: Functions can be combined in different ways
- **No Hidden State**: All dependencies are explicit
- **Reusability**: Functions can be reused in different contexts

### Avoid barrel exports, except for "complex" modules

Avoid barrel exports (index.ts files that re-export everything) except for complex modules where you need to control the public API and keep some parts private.

**Rationale**: Barrel exports can lead to circular dependencies, make it harder to track what's actually being used, and can cause performance issues with large bundles. They should only be used for complex modules that need a controlled public API.

**Examples**:

```typescript
// ❌ Bad - unnecessary barrel export for simple module
// user/index.ts
export { createUser } from './create-user';
export { updateUser } from './update-user';
export { deleteUser } from './delete-user';
export { getUser } from './get-user';

// ❌ Bad - importing from barrel when direct import is clearer
import { createUser, updateUser } from './user';

// ✅ Good - direct imports for simple modules
import { createUser } from './user/create-user';
import { updateUser } from './user/update-user';

// ✅ Good - barrel export for complex module with controlled API
// payment/index.ts (complex module)
export { createPayment } from './create-payment';
export { processPayment } from './process-payment';
export { refundPayment } from './refund-payment';
// Note: internal utilities like validateCard, formatCurrency are NOT exported

// ✅ Good - using barrel for complex module
import { createPayment, processPayment } from './payment';
```

**When to use barrel exports**:
- **Complex modules** with multiple related functions that form a cohesive API
- **Libraries** where you want to control the public interface
- **Feature modules** where some functions should be public and others private
- **Legacy codebases** where refactoring all imports would be too expensive

**When NOT to use barrel exports**:
- **Simple modules** with 1-3 functions
- **Utility modules** where all functions are independent
- **New codebases** where you can design direct imports from the start

**Complex module example**:
```typescript
// payment/index.ts - controlled public API
export { createPayment } from './create-payment';
export { processPayment } from './process-payment';
export { refundPayment } from './refund-payment';
export type { Payment, PaymentStatus } from './types';

// Internal functions not exported:
// - validateCard
// - formatCurrency  
// - calculateFees
// - sendReceipt
```

### Keep middleware "small" to avoid not needed costs later, and to make your backend fast always, and apply concrete middleware only in cases where it's required

Keep middleware functions small and focused. Only apply middleware where it's actually needed, not globally. This ensures optimal performance and avoids unnecessary processing overhead.

**Rationale**: Large middleware functions and global middleware application can significantly impact performance. Each middleware adds processing time to every request, so they should be minimal and only applied where necessary.

**Examples**:

```typescript
// ❌ Bad - large, complex middleware applied globally
app.use((req, res, next) => {
  // Heavy logging
  console.log(`Request: ${req.method} ${req.url}`);
  console.log(`Headers:`, req.headers);
  console.log(`Body:`, req.body);
  
  // Heavy validation for all routes
  if (req.body) {
    const schema = z.object({
      // Complex validation schema
    });
    try {
      schema.parse(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Validation failed' });
    }
  }
  
  // Heavy authentication for all routes
  const token = req.headers.authorization;
  if (token) {
    // Complex JWT verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
  }
  
  // Heavy rate limiting for all routes
  const ip = req.ip;
  const requests = await redis.get(`rate_limit:${ip}`);
  if (requests && parseInt(requests) > 100) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  next();
});

// ❌ Bad - applying middleware globally when not needed
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// ✅ Good - small, focused middleware applied only where needed
// Small logging middleware
const logRequest = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

// Small validation middleware
const validateUserData = (req: Request, res: Response, next: NextFunction) => {
  const schema = z.object({ email: z.string().email() });
  try {
    schema.parse(req.body);
    next();
  } catch {
    res.status(400).json({ error: 'Invalid email' });
  }
};

// Small auth middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  next();
};

// Small rate limiting middleware
const rateLimit = (maxRequests: number) => (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip;
  const requests = getRequestCount(ip);
  if (requests > maxRequests) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  next();
};

// Apply middleware only where needed
app.get('/health', healthCheckHandler); // No middleware needed

app.post('/api/users', 
  logRequest,           // Small logging
  validateUserData,    // Small validation
  createUserHandler    // Handler
);

app.get('/api/users/:id',
  requireAuth,         // Small auth
  getUserHandler       // Handler
);

app.post('/api/url',
  rateLimit(10),       // Small rate limiting
  validateUrlData,     // Small validation
  createUrlHandler     // Handler
);
```

**Middleware Size Guidelines**:

```typescript
// ✅ Good - small middleware (1-5 lines of logic)
const logRequest = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

// ✅ Good - focused middleware (single responsibility)
const validateEmail = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.email || !req.body.email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  next();
};

// ❌ Bad - large middleware (multiple responsibilities)
const complexMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Logging
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Validation
  const schema = z.object({ /* complex schema */ });
  try {
    schema.parse(req.body);
  } catch (error) {
    return res.status(400).json({ error: 'Validation failed' });
  }
  
  // Authentication
  const token = req.headers.authorization;
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
  }
  
  // Rate limiting
  const ip = req.ip;
  const requests = await redis.get(`rate_limit:${ip}`);
  if (requests && parseInt(requests) > 100) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  next();
};
```

**Performance Benefits**:
- **Faster Response Times**: Small middleware processes faster
- **Reduced Memory Usage**: Less memory allocation per request
- **Better Caching**: Smaller functions are more likely to be optimized by the JavaScript engine
- **Easier Debugging**: Small middleware is easier to profile and debug
- **Selective Application**: Only apply expensive operations where needed

**When to Apply Middleware Globally**:
- **Essential security** (CORS, helmet)
- **Core functionality** (body parsing, JSON parsing)
- **Critical logging** (error tracking, basic request logging)

**When to Apply Middleware Per Route**:
- **Validation** (different schemas per endpoint)
- **Authentication** (some routes public, some private)
- **Rate limiting** (different limits per endpoint)
- **Business logic** (specific to certain operations)

### Use single file/folder naming convention name-of-something.ext

Use kebab-case (hyphen-separated) for all file and folder names. This ensures consistency across the codebase and avoids issues with case sensitivity on different operating systems.

**Rationale**: Kebab-case is universally supported, avoids case sensitivity issues, and provides clear visual separation between words. It's the standard for web development and works consistently across all platforms.

**Examples**:

```typescript
// ❌ Bad - inconsistent naming
userService.ts
UserController.ts
user-repository.ts
UserHandler.ts

// ❌ Bad - camelCase files
userService.ts
userController.ts
userRepository.ts

// ❌ Bad - PascalCase files
UserService.ts
UserController.ts
UserRepository.ts

// ✅ Good - consistent kebab-case
user-service.ts
user-controller.ts
user-repository.ts
user-handler.ts
url-shortening.ts
error-handler.ts
health-check.ts
```

**Folder Structure**:

```
src/
├── shells/
│   ├── url-shortening/
│   │   ├── handler.ts
│   │   ├── utils.ts
│   │   └── index.ts
│   ├── health-check/
│   │   ├── handler.ts
│   │   └── index.ts
│   └── user-management/
│       ├── create-user.ts
│       ├── update-user.ts
│       └── index.ts
├── cross-shell/
│   ├── middleware/
│   │   ├── validate.ts
│   │   └── error-handler.ts
│   └── services/
│       ├── user.ts
│       └── auth.ts
└── lib/
    ├── database/
    │   ├── client.ts
    │   └── query-builder.ts
    └── validation/
        ├── user.ts
        └── url.ts
```

### Do not add any postfixes to files like 'name-of-smth.service.ts'

Avoid adding descriptive postfixes to file names. The file name should clearly indicate its purpose without needing additional suffixes like `.service`, `.controller`, `.handler`, etc.

**Rationale**: Postfixes add unnecessary verbosity and can make file names longer than needed. The file's purpose should be clear from its name and location in the directory structure.

**Examples**:

```typescript
// ❌ Bad - with postfixes
user-service.ts
user-controller.ts
user-handler.ts
user-repository.ts
user-validator.ts
user-middleware.ts

// ❌ Bad - redundant postfixes
user.service.ts
user.controller.ts
user.handler.ts

// ✅ Good - clear names without postfixes
user.ts
user.ts
user.ts
user.ts
user.ts
user.ts

// ✅ Good - descriptive names that don't need postfixes
create-user.ts
update-user.ts
delete-user.ts
validate-user.ts
authenticate-user.ts
```

**Better Organization**:

```
src/
├── shells/
│   ├── user/
│   │   ├── create-user.ts      // Instead of user.service.ts
│   │   ├── update-user.ts      // Instead of user.controller.ts
│   │   ├── delete-user.ts      // Instead of user.handler.ts
│   │   ├── validate-user.ts    // Instead of user.validator.ts
│   │   └── index.ts
│   └── url-shortening/
│       ├── shorten-url.ts      // Instead of url-shortening.service.ts
│       ├── retrieve-url.ts     // Instead of url-shortening.handler.ts
│       └── index.ts
├── cross-shell/
│   ├── middleware/
│   │   ├── validate.ts         // Instead of validation.middleware.ts
│   │   └── error-handler.ts    // Instead of error.middleware.ts
│   └── services/
│       ├── database.ts         // Instead of database.service.ts
│       └── auth.ts            // Instead of auth.service.ts
```

**Benefits**:
- **Shorter names**: Easier to read and type
- **Less redundancy**: Purpose is clear from context
- **Consistent pattern**: All files follow the same naming convention
- **Better organization**: Group related files in folders instead of using postfixes

---

## 2. JavaScript

### Avoid "this" keyword

Avoid using the `this` keyword in JavaScript/TypeScript code. Prefer functional programming patterns and explicit parameter passing.

**Rationale**: The `this` keyword creates implicit context dependencies and can lead to confusing behavior, especially in async operations and when passing functions around.

**Examples**:

```typescript
// ❌ Bad - using 'this'
class UserService {
  private users: User[] = [];
  
  addUser(user: User) {
    this.users.push(user); // 'this' creates implicit dependency
  }
  
  getUsers() {
    return this.users;
  }
}

// ✅ Good - functional approach
type UserRepository = {
  addUser(users: User[], user: User): User[];
  getUsers(users: User[]): User[];
};

const userRepository: UserRepository = {
  addUser: (users, user) => [...users, user],
  getUsers: (users) => users
};

// ✅ Good - explicit state management
function createUserService(initialUsers: User[] = []) {
  let users = [...initialUsers];
  
  return {
    addUser: (user: User) => {
      users = [...users, user];
    },
    getUsers: () => users
  };
}
```

**When 'this' might be acceptable**:
- React class components (legacy, prefer hooks)
- Third-party library APIs that require it
- Framework-specific patterns (Express middleware, etc.)

### Avoid function declarations

Prefer function expressions and arrow functions over function declarations. This promotes consistency and avoids hoisting-related confusion.

**Rationale**: Function declarations are hoisted, which can lead to unexpected behavior and makes code harder to reason about. Function expressions and arrow functions have more predictable execution order.

**Examples**:

```typescript
// ❌ Bad - function declaration
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Good - arrow function
const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ✅ Good - function expression
const calculateTotal = function(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ✅ Good - one-liner arrow function
const calculateTotal = (items: Item[]): number => 
  items.reduce((sum, item) => sum + item.price, 0);
```

**When function declarations might be acceptable**:
- Top-level module exports that need to be hoisted
- Recursive functions where the function name is needed for self-reference
- When working with legacy codebases that heavily use function declarations

### Prefer "down of the file exports" instead of inline exports

Place all exports at the bottom of the file rather than using inline exports. This makes it easier to see what the module exports and promotes better code organization.

**Rationale**: Having all exports at the bottom creates a clear "public API" section, makes it easier to track what's being exported, and improves code readability.

**Examples**:

```typescript
// ❌ Bad - inline exports
export const generateShortId = (length: number): string => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ✅ Good - exports at the bottom
const generateShortId = (length: number): string => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Exports at the bottom
export { generateShortId, validateUrl };
```

**Benefits**:
- Clear separation between implementation and public API
- Easy to see all exports at a glance
- Better for refactoring and maintenance
- Consistent with functional programming patterns

---

## 2. TypeScript

### Avoid any and prefer unknown

Avoid using the `any` type and prefer `unknown` when the type is truly unknown. This maintains type safety and forces explicit type checking.

**Rationale**: The `any` type disables TypeScript's type checking, while `unknown` forces you to perform type guards and explicit type checking before using the value.

**Examples**:

```typescript
// ❌ Bad - using 'any'
function processData(data: any): string {
  return data.toString(); // No type safety, could crash at runtime
}

function handleResponse(response: any) {
  console.log(response.user.name); // Could throw if response.user is undefined
}

// ✅ Good - using 'unknown'
function processData(data: unknown): string {
  if (typeof data === 'string') {
    return data;
  }
  if (typeof data === 'number') {
    return data.toString();
  }
  throw new Error('Unsupported data type');
}

function handleResponse(response: unknown) {
  if (typeof response === 'object' && response !== null) {
    const obj = response as { user?: { name?: string } };
    if (obj.user?.name) {
      console.log(obj.user.name);
    }
  }
}

// ✅ Good - proper type guards
function isUser(obj: unknown): obj is { name: string; email: string } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    'email' in obj &&
    typeof (obj as any).name === 'string' &&
    typeof (obj as any).email === 'string'
  );
}
```

**When 'any' might be acceptable**:
- Working with legacy JavaScript libraries that don't have type definitions
- Migration scenarios where gradual typing is being applied
- Third-party APIs that are genuinely untyped and cannot be typed

### Always use export type and import type keywords

Use `export type` and `import type` for type-only imports and exports. This makes it clear that these are type-only operations and can be optimized by bundlers.

**Rationale**: Type-only imports/exports are removed at runtime, making it clear to both developers and tools that these are compile-time only. This improves bundle size and makes intent explicit.

**Examples**:

```typescript
// ❌ Bad - mixing value and type imports
import { User, createUser, UserRole } from './user';
import { ApiError, ErrorHandler } from './errors';

// ❌ Bad - regular export for types
export interface User {
  id: string;
  name: string;
}

export type UserRole = 'admin' | 'user';

// ✅ Good - separate type and value imports
import { createUser } from './user';
import type { User, UserRole } from './user';
import { ErrorHandler } from './errors';
import type { ApiError } from './errors';

// ✅ Good - explicit type exports
export type { User, UserRole };
export interface User {
  id: string;
  name: string;
}

// ✅ Good - re-exporting types
export type { User } from './user';
export type { ApiError } from './errors';
```

**Benefits**:
- Clear separation between runtime values and compile-time types
- Better tree-shaking and bundle optimization
- Explicit intent for type-only operations
- Prevents accidental runtime usage of type-only imports

### Avoid interfaces prefer types for anything

Prefer `type` over `interface` for all type definitions. Types are more flexible, can represent unions and intersections, and are generally more powerful for complex type operations.

**Rationale**: Interfaces are primarily for object shapes and have limitations. Types can represent unions, intersections, primitives, and complex type operations. Using types consistently provides more flexibility and avoids the need to choose between interface and type.

**Examples**:

```typescript
// ❌ Bad - using interfaces
interface User {
  id: string;
  name: string;
  email: string;
}

interface UserRole {
  role: 'admin' | 'user';
}

interface AdminUser extends User {
  role: 'admin';
  permissions: string[];
}

// ✅ Good - using types
type User = {
  id: string;
  name: string;
  email: string;
};

type UserRole = 'admin' | 'user';

type AdminUser = User & {
  role: 'admin';
  permissions: string[];
};

// ✅ Good - complex type operations with types
type PartialUser = Partial<User>;
type UserWithId = Pick<User, 'id'>;
type UserWithoutId = Omit<User, 'id'>;
type UserKeys = keyof User;
type UserValues = User[keyof User];

// ✅ Good - union types (not possible with interfaces)
type Status = 'loading' | 'success' | 'error';
type ApiResponse<T> = 
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// ✅ Good - conditional types (not possible with interfaces)
type NonNullable<T> = T extends null | undefined ? never : T;
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
```

**Benefits of using types**:
- **Unions**: Can represent multiple possible shapes
- **Intersections**: Can combine multiple types
- **Conditional Types**: Can create complex type logic
- **Mapped Types**: Can transform existing types
- **Template Literal Types**: Can create string literal types
- **Consistency**: One way to define all types

**When interfaces might be acceptable**:
- **Declaration merging** (extending existing interfaces from libraries)
- **Class implementation** (though prefer composition over inheritance)
- **Legacy codebases** where interfaces are already established

---

*This guide is a living document and will be built step by step with your input.*

