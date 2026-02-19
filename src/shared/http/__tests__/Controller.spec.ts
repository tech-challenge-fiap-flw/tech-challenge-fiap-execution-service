import { adaptExpress, HttpRequest, HttpResponse, IController } from '../Controller';
import { ServerException } from '../../application/ServerException';
import { Request, Response, NextFunction } from 'express';

describe('adaptExpress', () => {
  function mockExpressReq(overrides: Partial<Request> = {}): Request {
    return {
      body: {},
      params: {},
      query: {},
      headers: {},
      ...overrides,
    } as Request;
  }

  function mockExpressRes(): Response {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    return res;
  }

  it('should call controller.handle and send json response', async () => {
    const controller: IController = {
      handle: jest.fn().mockResolvedValue({ status: 200, body: { ok: true } }),
    };

    const req = mockExpressReq({ body: { x: 1 } });
    const res = mockExpressRes();
    const next: NextFunction = jest.fn();

    const handler = adaptExpress(controller);
    await handler(req, res, next);

    expect(controller.handle).toHaveBeenCalledWith(
      expect.objectContaining({ body: { x: 1 } })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it('should call res.send when body is undefined (e.g. 204)', async () => {
    const controller: IController = {
      handle: jest.fn().mockResolvedValue({ status: 204 }),
    };

    const req = mockExpressReq();
    const res = mockExpressRes();
    const next: NextFunction = jest.fn();

    await adaptExpress(controller)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should handle ServerException and return proper error response', async () => {
    const controller: IController = {
      handle: jest.fn().mockRejectedValue(new ServerException('Bad', 400, { field: 'x' })),
    };

    const req = mockExpressReq();
    const res = mockExpressRes();
    const next: NextFunction = jest.fn();

    await adaptExpress(controller)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Bad', details: { field: 'x' } });
  });

  it('should call next for non-ServerException errors', async () => {
    const controller: IController = {
      handle: jest.fn().mockRejectedValue(new Error('unexpected')),
    };

    const req = mockExpressReq();
    const res = mockExpressRes();
    const next: NextFunction = jest.fn();

    await adaptExpress(controller)(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should pass user from req to HttpRequest', async () => {
    const user = { sub: 1, type: 'admin' };
    const controller: IController = {
      handle: jest.fn().mockResolvedValue({ status: 200, body: {} }),
    };

    const req = mockExpressReq();
    (req as any).user = user;
    const res = mockExpressRes();
    const next: NextFunction = jest.fn();

    await adaptExpress(controller)(req, res, next);

    expect(controller.handle).toHaveBeenCalledWith(
      expect.objectContaining({ user })
    );
  });
});
