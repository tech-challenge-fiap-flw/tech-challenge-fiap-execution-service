export class ServerException extends Error {
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundServerException extends ServerException {
  constructor(message = 'Not found', details?: any) {
    super(message, 404, details);
  }
}

export class BadRequestServerException extends ServerException {
  constructor(message = 'Bad request', details?: any) {
    super(message, 400, details);
  }
}

export class ForbiddenServerException extends ServerException {
  constructor(message = 'Forbidden', details?: any) {
    super(message, 403, details);
  }
}

export class UnauthorizedServerException extends ServerException {
  constructor(message = 'Unauthorized', details?: any) {
    super(message, 401, details);
  }
}
