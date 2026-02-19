import {
  ServerException,
  NotFoundServerException,
  BadRequestServerException,
  ForbiddenServerException,
  UnauthorizedServerException,
} from '../ServerException';

describe('ServerException', () => {
  it('should create with message, statusCode and details', () => {
    const err = new ServerException('test error', 500, { field: 'x' });

    expect(err.message).toBe('test error');
    expect(err.statusCode).toBe(500);
    expect(err.details).toEqual({ field: 'x' });
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ServerException);
  });

  it('should work without details', () => {
    const err = new ServerException('test', 400);

    expect(err.details).toBeUndefined();
  });
});

describe('NotFoundServerException', () => {
  it('should have statusCode 404', () => {
    const err = new NotFoundServerException();

    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Not found');
  });

  it('should allow custom message and details', () => {
    const err = new NotFoundServerException('Custom not found', { id: 1 });

    expect(err.message).toBe('Custom not found');
    expect(err.details).toEqual({ id: 1 });
  });
});

describe('BadRequestServerException', () => {
  it('should have statusCode 400', () => {
    const err = new BadRequestServerException();

    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Bad request');
  });
});

describe('ForbiddenServerException', () => {
  it('should have statusCode 403', () => {
    const err = new ForbiddenServerException();

    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('Forbidden');
  });
});

describe('UnauthorizedServerException', () => {
  it('should have statusCode 401', () => {
    const err = new UnauthorizedServerException();

    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Unauthorized');
  });
});
