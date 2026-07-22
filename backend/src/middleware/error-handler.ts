import * as Sentry from '@sentry/node';
import type { NextFunction, Request, Response } from 'express';

import { AppError, ERROR_STATUS } from '../lib/errors';
import { logger } from '../lib/logger';

// Seul point de sérialisation des erreurs (CONVENTIONS.md §5.4) — format
// exact API_SPEC.md §2, non négociable.
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // 4 paramètres obligatoires : Express reconnaît un error-handler à son
  // arity — `next` doit rester présent même si jamais appelé ici.
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(ERROR_STATUS[err.code]).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  logger.error({ err }, 'unhandled error');
  Sentry.captureException(err);

  res.status(ERROR_STATUS.INTERNAL_ERROR).json({
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error.', details: null },
  });
}
