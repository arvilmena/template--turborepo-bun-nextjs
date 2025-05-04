import { ZodError } from "zod";

type AccountableErrorOthers =
  | {
      actorUserId?: string;
      cause?: unknown;
      requestId?: string;
    }
  | undefined;

export class AccountableError extends Error {
  others?: AccountableErrorOthers;
  msg: string;

  constructor(message: string, others?: AccountableErrorOthers) {
    super(message);
    this.message = message;
    this.others = others;
    this.msg = message;
  }
}

export class UnauthorizedError extends AccountableError {
  constructor(message: string, others?: AccountableErrorOthers) {
    super(message, others);
    this.name = "UnauthorizedError";
    this.message = message;
  }
}

export class DatabaseInsertionError extends AccountableError {
  constructor(message: string, others?: AccountableErrorOthers) {
    super(message, others);
    this.name = "DatabaseInsertionError";
    this.message = message;
  }
}

export class DatabaseDeletionError extends AccountableError {
  constructor(message: string, others?: AccountableErrorOthers) {
    super(message, others);
    this.name = "DatabaseDeletionError";
    this.message = message;
  }
}

export class NotFoundError extends AccountableError {
  constructor(message: string, others?: AccountableErrorOthers) {
    super(message, others);
    this.name = "NotFoundError";
    this.message = message;
  }
}

export class ForbiddenError extends AccountableError {
  constructor(message: string, others?: AccountableErrorOthers) {
    super(message, others);
    this.name = "ForbiddenError";
    this.message = message;
  }
}

export class BadRequestError extends AccountableError {
  constructor(message: string, others?: AccountableErrorOthers) {
    super(message, others);
    this.name = "BadRequestError";
    this.message = message;
  }
}

export class ConflictError extends AccountableError {
  constructor(message: string, others?: AccountableErrorOthers) {
    super(message, others);
    this.name = "ConflictError";
    this.message = message;
  }
}

export class FailedExpectationError extends AccountableError {
  constructor(message: string, others?: AccountableErrorOthers) {
    super(message, others);
    this.name = "FailedExpectationError";
    this.message = message;
  }
}

export type ServerActionError = {
  requestId: string;
  error: unknown | AccountableError;
};

export function makeServerActionError<TError extends AccountableError>(
  error: TError,
  requestId: string,
): {
  requestId: string;
  error: unknown;
} {
  const defaultError = {
    name: error.name,
    message: error.message,
  };

  /* Custom Errors */
  if (error.message.includes("Malformed JSON")) {
    return {
      requestId,
      error: { name: "BadRequestError", message: error.message },
    };
  }

  if (
    error.message.includes("jwt malformed") ||
    error.message.includes("invalid signature")
  ) {
    return {
      requestId,
      error: { name: "BadRequestError", message: "Invalid token" },
    };
  }

  if (error.message.includes("jwt expired")) {
    return {
      requestId,
      error: { name: "UnauthorizedError", message: "Token expired" },
    };
  }

  if (error instanceof BadRequestError) {
    return {
      requestId,
      error: defaultError,
    };
  }

  if (error instanceof UnauthorizedError) {
    return {
      requestId,
      error: defaultError,
    };
  }

  if (error instanceof ForbiddenError) {
    return {
      requestId,
      error: defaultError,
    };
  }

  if (error instanceof NotFoundError) {
    return {
      requestId,
      error: defaultError,
    };
  }

  if (error instanceof ConflictError) {
    return {
      requestId,
      error: defaultError,
    };
  }

  /* Library Errors */
  if (error instanceof ZodError) {
    /* Mostly for Controller's Payload Validation */
    return {
      requestId,
      error: {
        ...defaultError,
        issues: error.issues,
      },
    };
  }

  return {
    requestId,
    error: defaultError,
  };
}
