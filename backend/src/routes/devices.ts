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
});

// POST /v1/devices/register — ROADMAP 3.6, DATA_MODEL §2.2.
// Pas de `requireActiveDevice` ici : c'est PRÉCISÉMENT l'appel qui décide
// quel appareil devient actif — l'exiger créerait une impasse (un appareil
// ne pourrait jamais redevenir actif puisqu'il faudrait déjà l'être).
devicesRouter.post(
  '/v1/devices/register',
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      next(new AppError('VALIDATION_ERROR', 'Invalid device registration payload.', parsed.error.issues));
      return;
    }
    const { device_id, push_token } = parsed.data;
    const userId = req.auth!.userId;
    const admin = getSupabaseAdmin();

    // Dérivé côté serveur, JAMAIS depuis un champ envoyé par le client
    // (même règle que `billing_region`, API_SPEC §4.2) — un client pourrait
    // toujours prétendre être premium pour garder plusieurs appareils actifs.
    const { data: isPremium, error: premiumError } = await admin.rpc('has_active_premium', {
      p_profile_id: userId,
    });
    if (premiumError) {
      next(new AppError('INTERNAL_ERROR', premiumError.message));
      return;
    }

    if (!isPremium) {
      // "1 appareil actif si gratuit" (Q11b) : désactive tous les AUTRES
      // appareils de ce profil avant d'activer celui-ci. Ne touche jamais
      // les données de l'appareil désactivé — seule sa capacité à
      // continuer de LIRE de la sync (`requireActiveDevice`, `/sync/pull`
      // uniquement) s'arrête ; il garde le droit de pousser ce qu'il a déjà.
      const { data: deactivated, error: deactivateError } = await rawTable(admin, 'devices')
        .update({ is_active: false })
        .eq('profile_id', userId)
        .neq('device_id', device_id)
        .eq('is_active', true)
        .select('device_id');
      if (deactivateError) {
        next(new AppError('INTERNAL_ERROR', deactivateError.message));
        return;
      }
      if (deactivated && deactivated.length > 0) {
        // Événement qui expliquera un "j'ai été déconnecté tout seul" en
        // beta — pas juste une conséquence silencieuse d'un nouveau login.
        logger.info(
          {
            profileId: userId,
            newDeviceId: device_id,
            deactivatedDeviceIds: deactivated.map((d: { device_id: string }) => d.device_id),
          },
          'device registration deactivated other devices (free tier, 1 active device)',
        );
      }
    }

    const { error: upsertError } = await rawTable(admin, 'devices').upsert(
      {
        profile_id: userId,
        device_id,
        push_token: push_token ?? null,
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
