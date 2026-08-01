-- ROADMAP 3.6 (révision 2026-08-01) — la contrainte "1 appareil actif si
-- gratuit" est supprimée (décision produit, pas une correction technique) :
-- tous les tiers ont désormais le multi-device simultané. `device_name` est
-- un label lisible (Device.modelName côté client) pour l'écran manuel
-- "Mes appareils" — purement informatif, jamais utilisé pour l'auth/
-- ownership (ça reste `device_id`, déjà unique par profil).

alter table devices add column device_name text;
