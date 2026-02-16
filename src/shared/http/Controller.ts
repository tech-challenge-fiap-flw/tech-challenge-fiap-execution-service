import { Request, Response, NextFunction } from 'express';
import { ServerException } from '../application/ServerException';

export interface HttpRequest {
  body: any;
  params: any;
  query: any;
  headers: any;
  user?: any;
}

export interface HttpResponse {
  status: number;
  body?: any;
}

export interface IController {
  handle(req: HttpRequest): Promise<HttpResponse>;
}

export function adaptExpress(controller: IController) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const httpReq: HttpRequest = {
        body: req.body,
        params: req.params,
        query: req.query,
        headers: req.headers,
        user: (req as any).user,
      };
      const httpRes = await controller.handle(httpReq);
      if (httpRes.body !== undefined) {
        res.status(httpRes.status).json(httpRes.body);
      } else {
        res.status(httpRes.status).send();
      }
    } catch (err: any) {
      if (err instanceof ServerException) {
        res.status(err.statusCode).json({ error: err.message, details: err.details });
      } else {
        next(err);
      }
    }
  };
}
