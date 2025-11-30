import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import pg from 'pg';

const JWT_SECRET = process.env.JWT_SECRET || 'fibertrace-jwt-secret-key-change-in-production';
const SALT_ROUNDS = 10;

let pool: pg.Pool | null = null;

export function setAuthPool(dbPool: pg.Pool) {
  pool = dbPool;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: number, email: string, role: string, tokenVersion: number = 0): string {
  return jwt.sign(
    { userId, email, role, tokenVersion },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
    tokenVersion?: number;
  };
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  if (decoded.tokenVersion === undefined) {
    return res.status(401).json({ error: 'Token missing version claim. Please login again.' });
  }

  if (pool) {
    try {
      const result = await pool.query(
        'SELECT token_version FROM users WHERE id = $1',
        [decoded.userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      const currentTokenVersion = parseInt(result.rows[0].token_version) || 0;
      if (decoded.tokenVersion !== currentTokenVersion) {
        return res.status(401).json({ error: 'Token has been invalidated. Please login again.' });
      }
    } catch (error) {
      console.error('Token version check failed:', error);
      return res.status(500).json({ error: 'Authentication service unavailable' });
    }
  }

  req.user = decoded;
  next();
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
}
