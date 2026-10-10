import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'chaupal_desi_jwt_secret_2026';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    name: string;
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  let token = req.cookies?.token;

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Kripya pehle login karein (Please login first)' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Session samapt ho gaya, dobara login karein (Invalid or expired session)' });
  }
}

export function optionalToken(req: AuthRequest, res: Response, next: NextFunction) {
  let token = req.cookies?.token;

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
    } catch (err) {
      // Ignore token verification failure for optional auth
    }
  }
  next();
}
