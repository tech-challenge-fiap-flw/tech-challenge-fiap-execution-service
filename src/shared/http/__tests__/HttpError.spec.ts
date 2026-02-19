import { badRequest, notFound, unauthorized, forbidden } from '../HttpError';
import { ServerException } from '../../application/ServerException';

describe('HttpError helpers', () => {
  it('badRequest should return a 400 ServerException', () => {
    const err = badRequest('Bad!', { field: 'x' });

    expect(err).toBeInstanceOf(ServerException);
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Bad!');
    expect(err.details).toEqual({ field: 'x' });
  });

  it('notFound should return a 404 ServerException', () => {
    const err = notFound('Not found!');

    expect(err).toBeInstanceOf(ServerException);
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Not found!');
  });

  it('unauthorized should return a 401 ServerException', () => {
    const err = unauthorized('No auth');

    expect(err).toBeInstanceOf(ServerException);
    expect(err.statusCode).toBe(401);
  });

  it('forbidden should return a 403 ServerException', () => {
    const err = forbidden('No access');

    expect(err).toBeInstanceOf(ServerException);
    expect(err.statusCode).toBe(403);
  });
});
