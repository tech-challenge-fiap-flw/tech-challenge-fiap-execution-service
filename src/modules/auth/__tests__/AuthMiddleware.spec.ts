import { authMiddleware } from '../AuthMiddleware';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

describe('authMiddleware', () => {
  function mockReq(headers: Record<string, string> = {}): Request {
    return { headers } as Request;
  }

  function mockRes(): Response {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    return res;
  }

  const next: NextFunction = jest.fn();
  const secret = process.env.JWT_SECRET || 'secret';

  beforeEach(() => {
    (next as jest.Mock).mockReset();
  });

  it('should return 401 if no authorization header', () => {
    const req = mockReq();
    const res = mockRes();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token not provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is malformed (no token after Bearer)', () => {
    const req = mockReq({ authorization: 'Bearer ' });
    const res = mockRes();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token malformed' });
  });

  it('should return 401 if token is invalid', () => {
    const req = mockReq({ authorization: 'Bearer invalid_token' });
    const res = mockRes();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('should return 401 if token payload does not have required fields', () => {
    const token = jwt.sign({ foo: 'bar' }, secret);
    const req = mockReq({ authorization: `Bearer ${token}` });
    const res = mockRes();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token payload' });
  });

  it('should return 401 if type is not a valid role', () => {
    const token = jwt.sign({ sub: 1, type: 'superadmin' }, secret);
    const req = mockReq({ authorization: `Bearer ${token}` });
    const res = mockRes();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token payload' });
  });

  it('should set req.user and call next for valid admin token', () => {
    const token = jwt.sign({ sub: 1, type: 'admin' }, secret);
    const req = mockReq({ authorization: `Bearer ${token}` });
    const res = mockRes();

    authMiddleware(req, res, next);

    expect((req as any).user).toBeDefined();
    expect((req as any).user.sub).toBe(1);
    expect((req as any).user.type).toBe('admin');
    expect(next).toHaveBeenCalled();
  });

  it('should set req.user and call next for valid mechanic token', () => {
    const token = jwt.sign({ sub: 2, type: 'mechanic' }, secret);
    const req = mockReq({ authorization: `Bearer ${token}` });
    const res = mockRes();

    authMiddleware(req, res, next);

    expect((req as any).user.type).toBe('mechanic');
    expect(next).toHaveBeenCalled();
  });

  it('should set req.user and call next for valid customer token', () => {
    const token = jwt.sign({ sub: 3, type: 'customer' }, secret);
    const req = mockReq({ authorization: `Bearer ${token}` });
    const res = mockRes();

    authMiddleware(req, res, next);

    expect((req as any).user.type).toBe('customer');
    expect(next).toHaveBeenCalled();
  });
});
