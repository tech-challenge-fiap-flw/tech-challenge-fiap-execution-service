import { requireRole } from '../RoleMiddleware';
import { Request, Response, NextFunction } from 'express';

describe('requireRole', () => {
  function mockReq(user: any = undefined): Request {
    const req: any = { headers: {} };
    if (user !== undefined) {
      req.user = user;
    }
    return req;
  }

  function mockRes(): Response {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    return res;
  }

  it('should return 401 if no user is set', () => {
    const middleware = requireRole('admin');
    const req = mockReq();
    const res = mockRes();
    const next: NextFunction = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if user role does not match', () => {
    const middleware = requireRole('admin');
    const req = mockReq({ type: 'customer' });
    const res = mockRes();
    const next: NextFunction = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if user role matches', () => {
    const middleware = requireRole('admin', 'mechanic');
    const req = mockReq({ type: 'mechanic' });
    const res = mockRes();
    const next: NextFunction = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should accept any of the specified roles', () => {
    const middleware = requireRole('admin', 'mechanic');
    const req = mockReq({ type: 'admin' });
    const res = mockRes();
    const next: NextFunction = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
