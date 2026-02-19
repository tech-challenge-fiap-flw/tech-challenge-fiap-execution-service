import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  sub: number;
  type: 'admin' | 'mechanic' | 'customer';
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    return res.status(401).json({ error: 'Token malformed' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      typeof (decoded as any).sub === 'number' &&
      (decoded as any).type &&
      ['admin', 'mechanic', 'customer'].includes((decoded as any).type)
    ) {
      (req as any).user = decoded as unknown as AuthPayload;
      next();
    } else {
      return res.status(401).json({ error: 'Invalid token payload' });
    }
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
