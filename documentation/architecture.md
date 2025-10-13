# Architectural Decision Record: Linux-Inspired Backend Architecture

## Status

**Proposed** - This ADR documents the architectural decisions for the backend application's modular architecture inspired by Linux system design.

## Context

The backend application is being structured to follow a Linux-inspired modular architecture. This approach provides clear separation of concerns, modularity, and scalability while maintaining a cohesive and maintainable codebase.

## Decision

We will implement a Linux-inspired backend architecture with the following core components:

### 1. Shells (Endpoint Modules)

**Location**: `src/shells/`

Shells are isolated, independent modules representing a complete endpoint or feature domain. They are the equivalent of user-space applications in an operating system. Each shell is a black box with its own internal logic and complexity, exposing only a well-defined public API.

**Characteristics**:

- **Self-contained**: Manages its own internal logic, validation, business rules, and data access patterns.
- **Isolated**: Has no direct knowledge of other shells.
- **Public API**: Exports a consistent public interface (routes, handlers, middleware) while hiding all implementation details.
- **Communicates via IPC**: Interacts with the system and other shells only through the defined `ipc` contracts and by using services provided by the `kernel` and `cross-shell` layers.

### 2. Kernel (System Core)

**Location**: `src/kernel/`

The Kernel is the absolute core of the system. It provides the foundational, low-level services required for the application to function. Shells typically do not interact with the kernel directly; instead, they use the more abstract, domain-specific services provided by the `cross-shell` layer.

**Responsibilities (What goes here?):**

- **Database Setup**: `src/kernel/db/` - Database connection, client initialization, and connection pooling.
- **Framework Setup**: Core Express/Fastify/NestJS configuration and initialization.
- **Middleware Stack**: `src/kernel/middleware/` - Core middleware (CORS, helmet, rate limiting, body parsing).
- **Library Configuration**: Setup and configuration of third-party libraries (logging, monitoring, etc.).
- **Environment Loading**: Bootstrapping and validating environment variables.
- **Authentication Core**: Low-level authentication setup (passport, JWT configuration, session management).

### 3. IPC (Inter-Process Communication)

**Location**: `src/ipc/`

The IPC layer defines the contracts for how different parts of the system communicate. It is the "contract layer" of the backend, ensuring type-safe and reliable data exchange between shells, database, external services, and clients. It contains no executable code, only type definitions and schemas.

**Responsibilities (What goes here?):**

- **Database Contracts**: `src/ipc/database/` - Type definitions for database entities, table schemas, and query results.
- **Environment Contracts**: `src/ipc/env/` - Type definitions and validation schemas for environment variables.
- **Endpoint Contracts**: `src/ipc/endpoints/` - Request/response schemas for API endpoints.
- **DTO Definitions**: `src/ipc/dto/` - Data Transfer Objects for client-server communication.
- **Payload Schemas**: `src/ipc/payload/` - Validation schemas for request payloads (Zod, Yup, etc.).
- **Event Contracts**: Definitions for any inter-service or pub/sub events.

### 4. Cross-Shell (Shared Domain Services)

**Location**: `src/cross-shell/`

This layer contains domain-specific features, utilities, and validation logic that are designed to be shared and used across multiple shells. It is the "domain-facing" part of the kernel, providing abstractions and shared business logic that shells can consume directly.

**Responsibilities (What goes here?):**

- **Shared Validation Schemas**: `src/cross-shell/validation/` - Common validation schemas used across multiple endpoints (e.g., pagination, common field validators).
- **Shared Business Logic**: `src/cross-shell/services/` - Domain-specific services and utilities used by multiple shells.
- **Shared Middleware**: `src/cross-shell/middleware/` - Domain-specific middleware (e.g., user permissions, resource ownership checks).
- **Utility Functions**: `src/cross-shell/utils/` - Domain-specific helper functions and utilities.
- **Data Access Patterns**: `src/cross-shell/repositories/` - Shared repository patterns or base classes for data access.

### 5. Libraries (System Libraries)

**Location**: `src/lib/` and `packages/`

Libraries are domain-agnostic, reusable code modules that can be used in any backend application:

#### Examples:

- **HTTP Client Wrapper**: `src/lib/http-client/` - Generic HTTP client with retry logic and error handling.
- **Logger**: `src/lib/logger/` - Pure logging utility wrapper.
- **Cryptography**: `src/lib/crypto/` - Encryption, hashing, and security utilities.
- **Date/Time Utils**: `src/lib/datetime/` - Date manipulation and formatting utilities.
- **String Utils**: `src/lib/string/` - String manipulation, slugification, etc.

#### Characteristics:

- Completely domain-agnostic and business-logic-free
- Highly reusable across different projects
- Well-tested and stable
- Version-controlled independently
- No dependencies on application-specific code

#### Decision Framework:

**When to put in `src/lib/` or `packages/`:**

- ✅ Code is completely domain-agnostic
- ✅ Code can be used in any backend application
- ✅ Code has no business logic dependencies
- ✅ Code is a pure utility or primitive

**When to put in `src/cross-shell/`:**

- ✅ Code contains domain-specific business logic
- ✅ Code is specific to this application's domain
- ✅ Code needs to be shared across multiple shells

**When to keep in each shell:**

- ✅ Logic is endpoint-specific and unlikely to be reused
- ✅ Logic needs different implementations per endpoint
- ✅ Logic is experimental and may diverge

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Backend Application                      │
├─────────────────────────────────────────────────────────────┤
│  Shells (Endpoint Modules) - src/shells/                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ /api/users  │  │ /api/posts  │  │ /api/auth   │  ...     │
│  │  (routes,   │  │  (routes,   │  │  (routes,   │         │
│  │  handlers,  │  │  handlers,  │  │  handlers,  │         │
│  │  logic)     │  │  logic)     │  │  logic)     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                  ▲                 ▲                        │
│                  │ (Consumes)      │ (Consumes)             │
├──────────────────┼─────────────────┼─────────────────────────┤
│  Cross-Shell (Shared Domain Logic) - src/cross-shell/       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Validation  │  │  Services   │  │ Repositories│         │
│  │  Schemas    │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                  ▲                 ▲                        │
│                  │ (Abstracts)     │ (Abstracts)            │
├──────────────────┴─────────────────┴─────────────────────────┤
│  Kernel (System Core) - src/kernel/                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ DB Setup    │  │ Framework   │  │ Middleware  │         │
│  │             │  │  Config     │  │   Stack     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  IPC (Contracts Layer) - src/ipc/                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ DB Schemas  │  │   DTOs      │  │ Payloads    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  Libraries (Generic Utils) - src/lib/ & packages/           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │HTTP Client  │  │   Logger    │  │   Crypto    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Guidelines

### Shell Development

1. **Isolation**: A shell should never import from another shell (`../../shells/other-shell`).
2. **Communication**: Use only `cross-shell` services and `ipc` contracts. Avoid direct kernel access where possible.
3. **Public API Export**: Each shell must export a consistent public interface (e.g., a router, route definitions, or module exports).
4. **Internal Encapsulation**: All business logic, validation, and data access should be private to the shell.
5. **Error Handling**: Each shell handles its own errors and returns appropriate HTTP responses.

### Kernel Development

1. **Stability**: Kernel APIs should be stable and well-versioned, as changes can have wide-ranging effects.
2. **Minimality**: The kernel should remain as small as possible. Prefer implementing features in the `cross-shell` layer if they are not fundamental system services.
3. **Documentation**: All kernel services must be well-documented
4. **Testing**: Comprehensive testing for all kernel services
5. **Backward Compatibility**: Maintain backward compatibility when possible.

### Cross-Shell Development

1. **Abstraction**: Services in this layer should provide clean, easy-to-use abstractions over core kernel logic.
2. **Domain-Specific**: Code here is specific to the application's business domain but reusable across endpoints.
3. **Reusability**: Design shared services, validators, and middleware that can be consumed by multiple shells.
4. **Consistency**: Maintain consistent patterns for common operations (e.g., pagination, filtering, sorting).

### Library Development

1. **Domain Agnostic**: Libraries should have no business logic
2. **Reusability**: Design for maximum reusability across different projects
3. **Testing**: Extensive unit testing with high coverage
4. **Documentation**: Clear API documentation with usage examples
5. **Stability**: Ensure stable APIs with semantic versioning

## File Structure

```
src/
├── shells/                    # Endpoint Modules (Isolated Features)
│   ├── users/                 # Users endpoint module
│   │   ├── index.ts           # Public API exports
│   │   ├── routes.ts          # Route definitions
│   │   ├── handlers/          # Request handlers
│   │   ├── services/          # Business logic
│   │   └── validators/        # Input validation
│   ├── posts/                 # Posts endpoint module
│   └── auth/                  # Authentication endpoint module
├── kernel/                    # System Core (Low-level services)
│   ├── db/                    # Database setup
│   ├── middleware/            # Core middleware
│   ├── server.ts              # Server initialization
│   └── config.ts              # Framework configuration
├── ipc/                       # Communication Contracts (Types, Schemas)
│   ├── database/              # Database entity types
│   ├── dto/                   # Data Transfer Objects
│   ├── payload/               # Request payload schemas
│   ├── endpoints/             # API endpoint contracts
│   └── env/                   # Environment variable types
├── cross-shell/               # Shared Domain Services
│   ├── validation/            # Shared validation schemas
│   ├── services/              # Shared business logic
│   ├── middleware/            # Domain-specific middleware
│   ├── repositories/          # Data access patterns
│   └── utils/                 # Domain utilities
└── lib/                       # System Libraries (Domain-agnostic)
    ├── logger/                # Logging utilities
    ├── crypto/                # Cryptography utilities
    └── http-client/           # HTTP client wrapper
```

## Benefits

1. **Modularity**: Clear separation of concerns and responsibilities between endpoints
2. **Scalability**: Easy to add new endpoint modules without affecting existing ones
3. **Team Independence**: Different teams can work on different endpoint modules independently
4. **Maintainability**: Isolated modules are easier to maintain and refactor
5. **Testing**: Each endpoint module can be tested in isolation with clear boundaries
6. **Code Reuse**: Shared logic in `cross-shell` prevents duplication across endpoints
7. **Type Safety**: IPC contracts ensure type-safe communication between layers

## Conclusion

This Linux-inspired architecture provides a solid foundation for scalable, maintainable backend applications while maintaining the benefits of a monolithic development experience. The clear separation between shells (endpoint modules), kernel (system core), cross-shell (shared domain logic), ipc (contracts), and libraries (utilities) ensures that the system remains flexible, testable, and extensible as it grows.
