/**
 * Base API Error class for HTTP errors
 */
class ApiError extends Error {
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
class BadRequestError extends ApiError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

/**
 * 401 Unauthorized Error
 */
class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

/**
 * 403 Forbidden Error
 */
class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

/**
 * 404 Not Found Error
 */
class NotFoundError extends ApiError {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}

/**
 * 409 Conflict Error
 */
class ConflictError extends ApiError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

/**
 * 422 Unprocessable Entity Error
 */
class UnprocessableEntityError extends ApiError {
  constructor(message = "Unprocessable Entity") {
    super(message, 422);
  }
}

/**
 * 500 Internal Server Error
 */
class InternalServerError extends ApiError {
  constructor(message = "Internal Server Error") {
    super(message, 500);
  }
}

// Exports at the bottom
export { 
  ApiError, 
  BadRequestError, 
  UnauthorizedError, 
  ForbiddenError, 
  NotFoundError, 
  ConflictError, 
  UnprocessableEntityError, 
  InternalServerError 
};

