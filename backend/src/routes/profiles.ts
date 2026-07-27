import { Router } from 'express';
import { z } from 'zod';

import { asyncHandler } from '../lib/async-handler';
import { computeBillingRegion } from '../lib/billing-region';
import { isValidCountryCode } from '../lib/countries';
import { AppError } from '../lib/errors';
import { lookupCountryFromIp } from '../lib/geo-ip';
import { logger } from '../lib/logger';
import { getSupabaseAdmin } from '../lib/supabase-admin';
import { isValidUsername, suggestUsernames } from '../lib/username';
import { rateLimit } from '../middleware/rate-limit';
import { requireAuth } from '../middleware/require-auth';

export const profilesRouter = Router();

// GET /v1/profiles/check-username?value=... — API_SPEC.md §4.2, sans JWT
// (appelable pré-compte, écran 3 signup). 20/min/IP anti-énumération.
profilesRouter.get(
  '/v1/profiles/check-username',
  rateLimit({ windowMs: 60_000, max: 20 }),
  asyncHandler(async (req, res, next) => {
    const value = String(req.query.value ?? '');

    if (!isValidUsername(value)) {
      next(
        new AppError('VALIDATION_ERROR', 'Invalid username format.', {
          fields: ['value'],
        }),
      );
      return;
    }

    const suggestions = suggestUsernames(value);
    const { data, error } = await getSupabaseAdmin()
      .from('profiles')
      .select('username')
      .in('username', [value, ...suggestions]);

    if (error) {
      next(new AppError('INTERNAL_ERROR', error.message));
      return;
    }

    const taken = new Set(data.map((row) => row.username));

    if (!taken.has(value)) {
      res.status(200).json({ available: true });
      return;
    }

    res.status(200).json({
      available: false,
      suggestions: suggestions.filter((s) => !taken.has(s)),
    });
  }),
);

// GET /v1/profiles/me — auth requise.
profilesRouter.get(
  '/v1/profiles/me',
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const { data, error } = await getSupabaseAdmin()
      .from('profiles')
      .select('*')
      .eq('id', req.auth!.userId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      next(new AppError('INTERNAL_ERROR', error.message));
      return;
    }
    if (!data) {
      next(new AppError('RESOURCE_NOT_FOUND', 'Profile not found.'));
      return;
    }

    res.status(200).json(data);
  }),
);

const patchSchema = z
  .object({
    display_name: z.string().max(60).nullable(),
    bio: z.string().max(300).nullable(),
    is_private: z.boolean(),
    weight_unit: z.enum(['kg', 'lbs']),
    data_saver: z.boolean(),
    hide_lost_titles: z.boolean(),
    rivalry_notifications: z.boolean(),
    private_sessions_default: z.boolean(),
    goal: z.enum(['force', 'masse', 'regularite']).nullable(),
    preferred_split: z.enum(['ppl', 'upper_lower', 'full_body', 'custom']).nullable(),
    weekly_goal: z.number().int().min(1).max(7),
    // `username` absent du tableau des champs modifiables (API_SPEC §4.2)
    // mais explicitement requis par le PATCH post-login (même section,
    // "RÔLE CRITIQUE" + ROADMAP 1.6) — traité comme allowlisté ici.
    username: z.string(),
  })
  .partial();

const ALLOWED_KEYS = Object.keys(patchSchema.shape);

// PATCH /v1/profiles/me — auth requise. 403 sur tout champ hors
// allowlist (billing_region/trial_*/is_reviewer/is_premium/inconnu).
profilesRouter.patch(
  '/v1/profiles/me',
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const bodyKeys = Object.keys(req.body ?? {});
    const forbiddenKeys = bodyKeys.filter((key) => !ALLOWED_KEYS.includes(key));

    if (forbiddenKeys.length > 0) {
      next(
        new AppError('FORBIDDEN', 'Field not modifiable via this endpoint.', {
          fields: forbiddenKeys,
        }),
      );
      return;
    }

    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) {
      next(new AppError('VALIDATION_ERROR', 'Invalid field value.', parsed.error.issues));
      return;
    }

    const { username, ...rest } = parsed.data;
    const admin = getSupabaseAdmin();

    if (username !== undefined) {
      if (!isValidUsername(username)) {
        next(
          new AppError('VALIDATION_ERROR', 'Invalid username format.', { fields: ['username'] }),
        );
        return;
      }

      const { data: existing } = await admin
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', req.auth!.userId)
        .maybeSingle();

      if (existing) {
        next(new AppError('CONFLICT', 'Username already taken.'));
        return;
      }
    }

    const { data, error } = await admin
      .from('profiles')
      .update({ ...rest, ...(username !== undefined ? { username } : {}) })
      .eq('id', req.auth!.userId)
      .select()
      .maybeSingle();

    if (error) {
      // 23505 = unique_violation Postgres — le check-then-update ci-dessus
      // n'est pas atomique, une collision concurrente sur `username` doit
      // rester un 409 propre, jamais le message Postgres brut en 500
      // (SECURITY_NOTES.md §4 : aucun détail d'implémentation au client).
      if (error.code === '23505') {
        next(new AppError('CONFLICT', 'Username already taken.'));
        return;
      }
      next(new AppError('INTERNAL_ERROR', error.message));
      return;
    }
    // `.update()` sur un id sans ligne correspondante (profil manquant,
    // ex. trigger handle_new_user jamais exécuté) ne lève pas d'erreur
    // Postgres — `data` est simplement vide. `.single()` transformait ça
    // en 500 générique illisible ; on distingue proprement le cas 404.
    if (!data) {
      next(new AppError('RESOURCE_NOT_FOUND', 'Profile not found.'));
      return;
    }

    res.status(200).json(data);
  }),
);

const billingRegionSchema = z.object({
  declared_country: z.string().optional(),
});

// PATCH /v1/profiles/me/billing-region — auth requise. billing_region est
// calculé et stocké ICI, jamais accepté tel quel du client (BILLING_FLOW.md
// §2 : pays déclaré prioritaire, IP en confirmation seulement, jamais
// recalculé en douce après ce premier calcul à l'inscription). Un appel
// sans declared_country réutilise le country déjà en base (pas de retour
// silencieux à l'IP seule sur un compte déjà déclaré).
profilesRouter.patch(
  '/v1/profiles/me/billing-region',
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const parsed = billingRegionSchema.safeParse(req.body);
    if (!parsed.success) {
      next(new AppError('VALIDATION_ERROR', 'Invalid body.', parsed.error.issues));
      return;
    }

    const { declared_country } = parsed.data;
    if (declared_country && !isValidCountryCode(declared_country)) {
      next(
        new AppError('VALIDATION_ERROR', 'Invalid country code.', {
          fields: ['declared_country'],
        }),
      );
      return;
    }

    const admin = getSupabaseAdmin();

    // BILLING_FLOW.md §2 : billing_region est "immutable côté client" une
    // fois déclaré — si le body n'apporte pas de nouveau pays, on réutilise
    // le pays déjà stocké plutôt que de retomber sur l'IP seule (sinon un
    // rejeu sans body écraserait silencieusement un billing_region déjà
    // fixé par un pays déclaré avec un résultat purement IP, "recalculé en
    // douce" — audit doc, bug confirmé).
    const { data: existing, error: fetchError } = await admin
      .from('profiles')
      .select('country')
      .eq('id', req.auth!.userId)
      .maybeSingle();

    if (fetchError) {
      next(new AppError('INTERNAL_ERROR', fetchError.message));
      return;
    }
    if (!existing) {
      next(new AppError('RESOURCE_NOT_FOUND', 'Profile not found.'));
      return;
    }

    const effectiveCountry = declared_country ?? existing?.country ?? null;
    const ipCountry = lookupCountryFromIp(req.ip ?? '');
    const { billingRegion, conflict } = computeBillingRegion(effectiveCountry, ipCountry);

    if (conflict) {
      logger.warn(
        { userId: req.auth!.userId, declaredCountry: declared_country, ipCountry },
        'billing_region conflict: declared country wins over IP',
      );
    }

    const { data, error } = await admin
      .from('profiles')
      .update({
        billing_region: billingRegion,
        ...(declared_country ? { country: declared_country } : {}),
      })
      .eq('id', req.auth!.userId)
      .select('id, billing_region, country')
      .maybeSingle();

    if (error) {
      next(new AppError('INTERNAL_ERROR', error.message));
      return;
    }
    if (!data) {
      next(new AppError('RESOURCE_NOT_FOUND', 'Profile not found.'));
      return;
    }

    res.status(200).json(data);
  }),
);
