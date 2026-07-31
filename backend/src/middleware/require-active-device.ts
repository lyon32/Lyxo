import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { rawTable } from '../lib/raw-table';
import { getSupabaseAdmin } from '../lib/supabase-admin';

// ROADMAP 3.6 — contrainte 1 appareil actif (gratuit), DATA_MODEL §2.2.
// Appliqué SÉLECTIVEMENT, jamais dans `requireAuth` lui-même : `requireAuth`
// protège déjà `profiles.ts` et le reste de `sync.ts`, et retrofiter cette
// vérification là casserait des routes qui n'ont rien à voir avec la règle
// multi-device. Ce middleware ne se chaîne QU'APRÈS `requireAuth`, sur les
// routes qui doivent vraiment refuser un appareil désactivé.
//
// ⚠️ PAS appliqué à `POST /v1/sync/push` — décision explicite, pas un
// oubli : un appareil qu'on vient de désactiver peut avoir des séances déjà
// créées localement, en attente d'envoi. Les bloquer ne protège rien (c'est
// de la donnée légitime déjà produite) et violerait le critère de succès
// n°1 ("zéro perte de séance"). Seule la lecture (`GET /v1/sync/pull`) est
// coupée : l'appareil peut vider ce qu'il a, jamais récupérer plus après
// avoir été remplacé.
//
// ⚠️ Fail-CLOSED si l'en-tête `X-Device-Id` est absent — décision
// explicite, pas un défaut. Aucun coach beta n'est encore installé
// (2026-07-31) : c'est le seul moment où durcir ce comportement ne casse
// rien de réel. Un client qui n'envoie pas cet en-tête sur une route qui
// exige ce middleware est un bug côté client, pas un cas à tolérer.
export async function requireActiveDevice(req: Request, _res: Response, next: NextFunction) {
  const deviceId = req.headers['x-device-id'];
  if (typeof deviceId !== 'string' || deviceId.length === 0) {
    next(new AppError('FORBIDDEN', 'Missing X-Device-Id header.', { reason: 'missing_device_id' }));
    return;
  }

  const userId = req.auth!.userId;
  const { data, error } = await rawTable(getSupabaseAdmin(), 'devices')
    .select('is_active')
    .eq('profile_id', userId)
    .eq('device_id', deviceId)
    .maybeSingle();

  if (error) {
    next(new AppError('INTERNAL_ERROR', error.message));
    return;
  }

  // Ni enregistré ni actif : même verdict des deux côtés — un appareil
  // jamais inscrit n'a pas plus de droits qu'un appareil désactivé.
  if (!data || !data.is_active) {
    // Événement qui expliquera un "j'ai été déconnecté tout seul" en beta —
    // pas juste une erreur HTTP de plus, un signal à pouvoir retrouver.
    logger.info(
      { profileId: userId, deviceId },
      'sync rejected: device not active for this profile',
    );
    next(new AppError('FORBIDDEN', 'Device is not active for this profile.', { reason: 'device_inactive' }));
    return;
  }

  next();
}
