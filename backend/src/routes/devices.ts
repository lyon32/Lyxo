import { Router } from 'express';
import { z } from 'zod';

import { asyncHandler } from '../lib/async-handler';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { rawTable } from '../lib/raw-table';
import { getSupabaseAdmin } from '../lib/supabase-admin';
import { requireAuth } from '../middleware/require-auth';

export const devicesRouter = Router();

const registerSchema = z.object({
  device_id: z.string().min(1),
  push_token: z.string().nullable().optional(),
  device_name: z.string().min(1).max(120).nullable().optional(),
});

// POST /v1/devices/register — ROADMAP 3.6, DATA_MODEL §2.2.
// Pas de `requireActiveDevice` ici : cet appel doit toujours pouvoir
// (ré)activer un appareil, y compris un appareil déconnecté manuellement —
// l'exiger créerait une impasse.
//
// ⚠️ RÉVISÉ 2026-08-01 : n'active QUE la ligne de cet appareil, ne
// désactive plus jamais les autres. La contrainte "1 appareil actif si
// gratuit" (Q11b) a été supprimée — décision produit, pas une correction
// technique : tous les tiers ont désormais le multi-device simultané. La
// désactivation d'un appareil est devenue une action MANUELLE (voir
// `POST /v1/devices/:deviceId/disconnect` ci-dessous), jamais automatique
// au login.
devicesRouter.post(
  '/v1/devices/register',
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      next(new AppError('VALIDATION_ERROR', 'Invalid device registration payload.', parsed.error.issues));
      return;
    }
    const { device_id, push_token, device_name } = parsed.data;
    const userId = req.auth!.userId;
    const admin = getSupabaseAdmin();

    const { error: upsertError } = await rawTable(admin, 'devices').upsert(
      {
        profile_id: userId,
        device_id,
        push_token: push_token ?? null,
        device_name: device_name ?? null,
        is_active: true,
        last_active_at: new Date().toISOString(),
      },
      { onConflict: 'profile_id,device_id' },
    );
    if (upsertError) {
      next(new AppError('INTERNAL_ERROR', upsertError.message));
      return;
    }

    res.status(200).json({ is_active: true });
  }),
);

// GET /v1/devices — liste "Mes appareils" (écran de gestion manuelle,
// ROADMAP 3.6 révision 2026-08-01). Pas de `requireActiveDevice` : un
// appareil déconnecté doit pouvoir consulter la liste (et s'y voir).
devicesRouter.get(
  '/v1/devices',
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const userId = req.auth!.userId;
    const { data, error } = await rawTable(getSupabaseAdmin(), 'devices')
      .select('device_id, device_name, is_active, last_active_at, created_at')
      .eq('profile_id', userId)
      .order('last_active_at', { ascending: false });
    if (error) {
      next(new AppError('INTERNAL_ERROR', error.message));
      return;
    }
    res.status(200).json({ devices: data ?? [] });
  }),
);

// POST /v1/devices/:deviceId/disconnect — déconnexion MANUELLE d'un
// appareil (sécurité/gestion de session, type Netflix/Instagram) — plus un
// levier de monétisation. `:deviceId` est le `device_id` CLIENT (celui
// renvoyé par GET /v1/devices), pas l'uuid interne de la ligne.
//
// ⚠️ Ownership vérifiée par l'INTERSECTION profile_id + device_id : une
// ligne appartenant à un autre profil ne matche jamais, donc 0 ligne
// affectée → 404, jamais un succès silencieux sur l'appareil de quelqu'un
// d'autre.
devicesRouter.post(
  '/v1/devices/:deviceId/disconnect',
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const userId = req.auth!.userId;
    const targetDeviceId = req.params.deviceId;
    const admin = getSupabaseAdmin();

    const { data, error } = await rawTable(admin, 'devices')
      .update({ is_active: false })
      .eq('profile_id', userId)
      .eq('device_id', targetDeviceId)
      .select('device_id');
    if (error) {
      next(new AppError('INTERNAL_ERROR', error.message));
      return;
    }
    if (!data || data.length === 0) {
      next(new AppError('RESOURCE_NOT_FOUND', 'Device not found for this profile.'));
      return;
    }

    logger.info(
      { profileId: userId, disconnectedDeviceId: targetDeviceId },
      'device manually disconnected by user',
    );
    res.status(200).json({ device_id: targetDeviceId, is_active: false });
  }),
);
