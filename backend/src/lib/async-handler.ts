import type { NextFunction, Request, Response } from 'express';

// Express 4 ne relaie pas automatiquement les rejets de promesse d'un
// handler async vers le middleware d'erreur — sans ce wrapper une
// exception async serait silencieuse (requête qui pend) plutôt que de
// tomber dans error-handler.ts.
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
