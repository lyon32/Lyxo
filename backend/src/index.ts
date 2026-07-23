import 'dotenv/config';

// initSentry() doit s'exécuter avant que express/cors ne soient require()
// (compilation commonjs = ordre source préservé), pour instrumenter dès
// le premier require.
import { initSentry } from './lib/sentry';

initSentry();

import cors from 'cors';
import express from 'express';
import pinoHttp from 'pino-http';

import { logger } from './lib/logger';
import { errorHandler } from './middleware/error-handler';
import { AppError } from './lib/errors';
import { healthRouter } from './routes/health';
import { profilesRouter } from './routes/profiles';

const app = express();

// Render est derrière un reverse proxy — sans ça, req.ip renvoie l'IP
// interne du proxy (pas le vrai client), ce qui casserait à la fois le
// rate-limit par IP (déjà en place, check-username) et la détection
// billing_region par IP (lib/geo-ip.ts, ROADMAP 1.7).
app.set('trust proxy', true);

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.use(healthRouter);
app.use(profilesRouter);

app.use((req, _res, next) => {
  next(new AppError('RESOURCE_NOT_FOUND', `No route for ${req.method} ${req.path}`));
});

app.use(errorHandler);

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  logger.info({ port }, 'lyxo-api listening');
});
