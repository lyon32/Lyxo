import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/v1/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});
