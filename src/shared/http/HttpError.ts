import { ServerException } from '../application/ServerException';

export function badRequest(message: string, details?: any): ServerException {
  return new ServerException(message, 400, details);
}

export function notFound(message: string): ServerException {
  return new ServerException(message, 404);
}

export function unauthorized(message: string): ServerException {
  return new ServerException(message, 401);
}

export function forbidden(message: string): ServerException {
  return new ServerException(message, 403);
}
