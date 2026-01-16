/**
 * Auth Middleware
 * - Supabase JWT verification
 * - App JWT verification
 * - Role-based access control (RBAC)
 */

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { getConfig } from '../config/env';

const config = getConfig();

export interface AuthUser {
  id: string;
  email?: string;
  wallet_address?: string;
  role?: 'user' | 'creator' | 'admin';
}

export interface JWTPayload extends JwtPayload {
  sub: string;
  email?: string;
  wallet_address?: string;
  role?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      authUser?: AuthUser | null;
    }
  }
}

function getTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization || '';
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  return null;
}

export async function requireSupabaseAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      res.status(401).json({ error: 'Missing Authorization token' });
      return;
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.authUser = {
      id: data.user.id,
      email: data.user.email || undefined,
      role: (data.user.user_metadata &&
      typeof data.user.user_metadata === 'object' &&
      'role' in data.user.user_metadata
        ? String((data.user.user_metadata as Record<string, unknown>).role)
        : undefined) as 'user' | 'creator' | 'admin' | undefined,
    };

    next();
  } catch (err) {
    logger.error('Supabase auth error:', err);
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export function requireAppJWT(req: Request, res: Response, next: NextFunction): void {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      res.status(401).json({ error: 'Missing Authorization token' });
      return;
    }

    const payload = jwt.verify(token, config.jwtSecret) as JWTPayload;

    req.authUser = {
      id: payload.sub,
      email: payload.email,
      wallet_address: payload.wallet_address,
      role: payload.role as 'user' | 'creator' | 'admin' | undefined,
    };

    next();
  } catch (err) {
    logger.warn('App JWT invalid:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(roles: Array<'user' | 'creator' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.authUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    if (!user.role || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }

    next();
  };
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = getTokenFromHeader(req);
  if (!token) {
    next();
    return;
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret) as JWTPayload;
    req.authUser = {
      id: payload.sub,
      email: payload.email,
      wallet_address: payload.wallet_address,
      role: payload.role as 'user' | 'creator' | 'admin' | undefined,
    };
  } catch {
    req.authUser = null;
  }
  next();
}

// Alias for backward compatibility
export const authenticateToken = requireAppJWT;
