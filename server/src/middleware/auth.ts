import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-move-together-sports-key-2026';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication token required' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired session token' });
      return;
    }
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  });
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
    } catch {
      // Ignored for optional auth
    }
  }
  next();
};
