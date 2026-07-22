import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../lib/errors';

// Sliding window en mémoire — suffisant pour une seule instance Render
// (§5 API_SPEC, "détails par route dans le code"). Pas de Redis avant
// 10 000 DAU (PROJECT_BRIEF non-goal 12).
export function rateLimit({ windowMs, max }: { windowMs: number; max: number }) {
  const hits = new Map<string, number[]>();

  return (req: Request, _res: Response, next: NextFunction) => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

    if (timestamps.length >= max) {
      next(new AppError('RATE_LIMITED', 'Too many requests.'));
      return;
    }

    timestamps.push(now);
    hits.set(key, timestamps);
    next();
  };
}
