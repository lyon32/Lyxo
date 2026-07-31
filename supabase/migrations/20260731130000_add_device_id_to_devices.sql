-- ROADMAP 3.6 — contrainte 1 appareil actif (gratuit). DATA_MODEL.md §2.2.
--
-- `devices` (20260722072825) n'a jamais eu de quoi IDENTIFIER un appareil
-- précis d'un rappel à l'autre — seulement `push_token` (optionnel) et
-- `is_active`. Sans `device_id`, impossible de savoir si une requête vient
-- du même téléphone qu'hier ou d'un nouveau.
--
-- ⚠️ PAS un UNIQUE(is_active) ni rien de partiel sur l'activité — DATA_MODEL
-- §2.2 l'a déjà explicitement écarté (bloquerait le multi-device Lyxo+,
-- qui a besoin de PLUSIEURS lignes `is_active = true` pour un même profil).
-- `unique(profile_id, device_id)` est une contrainte D'IDENTITÉ, pas
-- d'activité : elle empêche seulement d'enregistrer deux fois le même
-- appareil, jamais de bloquer un second appareil actif.

alter table devices add column device_id text not null;
create unique index uq_device_profile_device on devices(profile_id, device_id);
