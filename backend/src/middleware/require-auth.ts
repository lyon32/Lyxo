import type { NextFunction, Request, Response } from 'express';

import { verifySupabaseJwt } from '../lib/auth';
import { AppError } from '../lib/errors';

// API_SPEC.md §1 : toute route protégée vérifie le JWT (signature +
// expiration) à CHAQUE requête — jamais de confiance aveugle dans un
// profile_id envoyé par le body/query.
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;

  if (!token) {
    next(new AppError('UNAUTHENTICATED', 'Missing bearer token.'));
    return;
  }

  try {
    req.auth = await verifySupabaseJwt(token);
    next();
  } catch {
    next(new AppError('UNAUTHENTICATED', 'Invalid or expired token.'));
  }
}
