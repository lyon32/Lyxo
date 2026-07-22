import type { SupabaseJwtPayload } from '../lib/auth';

declare global {
  namespace Express {
    interface Request {
      auth?: SupabaseJwtPayload;
    }
  }
}

export {};
