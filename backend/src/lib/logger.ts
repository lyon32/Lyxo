import pino from 'pino';

export const logger = pino({
  redact: [
    'phone_number',
    '*.phone_number',
    'email',
    '*.email',
    'push_token',
    '*.push_token',
    'req.headers.authorization',
    'req.headers["x-admin-key"]',
  ],
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});
