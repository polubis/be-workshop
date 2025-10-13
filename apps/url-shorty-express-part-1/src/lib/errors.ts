/**
 * Base API Error class for HTTP errors
 */
export class ApiError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request Error
 */
export class BadRequestError extends ApiError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

/**
 * 401 Unauthorized Error
 */
export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

/**
 * 403 Forbidden Error
 */
export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

/**
 * 404 Not Found Error
 */
export class NotFoundError extends ApiError {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}

/**
 * 409 Conflict Error
 */
export class ConflictError extends ApiError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

/**
 * 422 Unprocessable Entity Error
 */
export class UnprocessableEntityError extends ApiError {
  constructor(message = "Unprocessable Entity") {
    super(message, 422);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends ApiError {
  constructor(message = "Internal Server Error") {
    super(message, 500);
  }
}

