# API_SPEC.md — LYXO · API Contract
# Version : 1.0 — fin Juillet 2026
# Rôle : LE contrat d'API faisant foi. Toute route codée doit respecter
# le format de requête/réponse et surtout le FORMAT D'ERREUR ci-dessous
# — c'est la partie que les agents IA bâclent le plus souvent, donc elle
# est non négociable et vérifiée par CodeRabbit (.coderabbit.yaml).

---

## 0. CONVENTIONS GLOBALES

- Base URL : `https://api.lyxo.app` (prod) / preview Render (staging).
- Toutes les requêtes/réponses en **JSON**, `Content-Type: application/json`.
- Toutes les dates en **ISO 8601 UTC** (`2026-07-20T14:30:00Z`).
- Tous les montants en **FCFA entiers** (jamais de float pour l'argent).
- Tous les poids en **kg** dans l'API (conversion lbs = responsabilité du
  client, jamais de l'API — §19.15).
- Pagination : `?limit=50&cursor=<opaque>` → réponse `{ data: [...],
  next_cursor: string | null }`.
- Versionnement : préfixe `/v1/` sur toutes les routes dès le premier jour
  (évite une migration douloureuse plus tard).

---

## 1. AUTH SCHEME

- **Identité** : Supabase Auth (email, Google, Apple). Le client obtient
  un **JWT Supabase** après login.
- **Toute route protégée** exige `Authorization: Bearer <supabase_jwt>`.
- Le backend **vérifie** le JWT via Supabase (signature + expiration) à
  chaque requête — jamais de confiance aveugle dans un `profile_id`
  envoyé par le body/query.
- **Routes non authentifiées** (whitelist explicite) : `POST /v1/auth/*`
  (délégué à Supabase côté client en réalité — le backend n'a pas de
  routes login custom), `GET /v1/pay/:token` (protégé par le token
  lui-même, pas par JWT — c'est un lien email cliqué hors app),
  `POST /v1/webhooks/*` (protégés par signature du prestataire, pas JWT).
- **Rôle admin** : un header séparé `X-Admin-Key` (secret serveur,
  jamais exposé au client) pour les routes `/v1/admin/*` — utilisées
  uniquement par toi via un outil interne, jamais par l'app mobile.

---

## 2. FORMAT D'ERREUR STANDARD (non négociable)

Toute réponse d'erreur, sur TOUTE route, sans exception, suit EXACTEMENT
cette forme :

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Le workout demandé n'existe pas ou a été supprimé.",
    "details": null
  }
}
```

- `code` : **SCREAMING_SNAKE_CASE**, stable, jamais traduit — c'est ce
  que le client mappe vers un message i18n localisé, PAS le `message`.
- `message` : lisible par un humain, en anglais (le backend est
  mono-langue interne ; la traduction FR/EN affichée à l'user se fait
  CÔTÉ CLIENT via `code`, jamais en renvoyant du texte pré-traduit
  depuis l'API — sinon on duplique i18n entre deux systèmes).
- `details` : objet optionnel (ex. liste des champs de validation en
  échec) ou `null` — jamais omis (le client peut toujours lire `.details`
  sans vérifier son existence).
- **Aucune autre forme n'est acceptée** — pas de string brute, pas de
  `{ "err": "..." }`, pas de code HTTP seul sans body. CodeRabbit
  vérifie ce pattern sur chaque PR touchant une route.

### Table des codes d'erreur standards
| HTTP | `code` | Usage |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Champ manquant/invalide — `details` liste les champs |
| 401 | `UNAUTHENTICATED` | JWT absent/invalide/expiré |
| 403 | `FORBIDDEN` | Authentifié mais pas autorisé (RLS-like côté API) |
| 404 | `RESOURCE_NOT_FOUND` | Entité inexistante ou soft-deleted |
| 409 | `CONFLICT` | Ex. follow déjà existant, username pris |
| 409 | `DUPLICATE_REQUEST` | Idempotence : depositId/local_id déjà traité (no-op, pas une erreur bloquante — voir note) |
| 422 | `PAYMENT_REJECTED` | PawaPay a refusé (voir `details.failureReason`) |
| 429 | `RATE_LIMITED` | Trop de requêtes (ex. tentatives de checkout) |
| 500 | `INTERNAL_ERROR` | Erreur serveur — jamais de stack trace exposée au client, log Sentry côté serveur |
| 503 | `PROVIDER_UNAVAILABLE` | PawaPay/RevenueCat/Resend down — le client doit retry avec backoff |

> Note `DUPLICATE_REQUEST` : sur les routes idempotentes (sync push,
> checkout), un rejeu n'est PAS une erreur utilisateur — répondre 200
> avec le résultat déjà connu plutôt qu'un 409 est souvent préférable ;
> le choix exact (200 silencieux vs 409 explicite) est précisé route par
> route ci-dessous.

---

## 3. STATUS CODES UTILISÉS (liste fermée)

`200` OK · `201` Created · `204` No Content (ex. DELETE réussi) ·
`400` `401` `403` `404` `409` `422` `429` `500` `503` (voir tableau ci-dessus).
Aucun autre code n'est utilisé dans l'API LYXO — pas de 3xx (pas de
redirects API, les redirects HTTP restent l'affaire de la page web
lyxo.app), pas de 418 ou autres codes exotiques.

---

## 4. ENDPOINTS

### 4.1 Sync (le cœur — Bloc C)

#### `GET /v1/sync/pull`
Auth requise. Query : `?tables=workouts,sets,...&since=<iso8601>&limit=500&cursor=<opaque>`
Réponse 200 :
```json
{
  "data": {
    "workouts": [ { "id": "...", "updated_at": "...", "deleted_at": null, "...": "..." } ],
    "sets": [ "..." ]
  },
  "next_cursor": "opaque_string_or_null",
  "has_more": true,
  "server_timestamp": "2026-07-20T14:30:00Z",
  "is_premium": false,
  "premium_until": null
}
```
`is_premium`/`premium_until` : champs **calculés** à chaque appel (§20.1
— jamais lus depuis une colonne), dérivés de `subscriptions` +
`trial_expires_at`. Pagination : le client boucle tant que `has_more`.

#### `POST /v1/sync/push`
Auth requise. Body : `{ "changes": { "workouts": { "created": [...],
"updated": [...], "deleted": ["id1","id2"] }, "sets": {...} } }`
- `deleted` = liste d'IDs → le backend applique `deleted_at = now()`,
  **jamais un DELETE SQL physique** (§18.3).
- Idempotence : chaque entité porte `local_id` (workouts) ou un ID déjà
  généré client — un rejeu du même push est un no-op silencieux, 200.
Réponse 200 : `{ "accepted": { "workouts": 3, "sets": 12 }, "conflicts": [] }`
`conflicts` : jamais utilisé pour bloquer (LWW silencieux, Q12a) — le
tableau existe pour un futur monitoring, toujours vide en pratique V1.

---

### 4.2 Profil & Auth

#### `GET /v1/profiles/check-username?value=...`
Sans JWT (appelable pré-compte, écran 3 signup). Rate-limité (20/min/IP
— anti-énumération). Debounce 300 ms côté client (UI prompt écran 3).
→ `200` `{ "available": true }` ou
  `{ "available": false, "suggestions": ["massa_lift","massa237"] }`
`value` validé contre la regex username (SECURITY_NOTES §2.2) avant
requête DB — sinon `400 VALIDATION_ERROR`.

#### `GET /v1/profiles/me`
Auth requise. → profil complet + `billing_region`, `weight_unit`, etc.

#### `PATCH /v1/profiles/me`
Auth requise. Body : champs modifiables uniquement (`display_name`,
`bio`, `is_private`, `weight_unit`, `data_saver`, `hide_lost_titles`,
`rivalry_notifications`, `private_sessions_default`, `goal`,
`preferred_split`, `weekly_goal`).
⚠️ RÔLE CRITIQUE (fiche 2 comité) : après le PREMIER login de TOUT
provider (email, Google, Apple), l'app pousse systématiquement les choix
d'onboarding stockés en AsyncStorage (`goal`, `preferred_split`,
`weekly_goal`, `username` si absent) via ce PATCH — `signInWithOAuth` ne
transporte PAS raw_user_meta_data, donc ce PATCH post-login est
l'UNIQUE chemin fiable pour les 3 providers (le trigger meta_data n'est
qu'une optimisation du chemin email). **Rejeté 403**
si le body contient `billing_region`, `trial_*`, `is_reviewer`,
`is_premium` (n'existe pas), ou tout champ dérivé/serveur-only.

#### `DELETE /v1/profiles/me`
Auth requise. Soft-delete du compte (30j réversible, §18.5/§20.3) →
`202 Accepted` (traitement différé, pas immédiat). Body optionnel
`{ "reason": "..." }` pour analytics interne.

#### `GET /v1/profiles/me/export`
Auth requise. → export JSON brut complet (RGPD, gratuit — §14 PRICING).
`200` avec `Content-Disposition: attachment`.

---

### 4.3 Social

#### `POST /v1/follows` — Body `{ "followed_id": "uuid" }`
→ `201` si compte public (status='active') ou `202` si compte privé
(status='pending', notif envoyée au followed). `409 CONFLICT` si déjà
suivi (non-deleted).

#### `DELETE /v1/follows/:id` → `204`

#### `POST /v1/follows/:id/approve` (le followed approuve une demande)
→ `200`, status passe à 'active'.

#### `GET /v1/feed` — Query `?cursor=...`
→ séances des follows actifs, **format compact CONTRACTUEL** (§Q7c —
payload minimal, forfait data compté) :
```json
{ "data": [ {
    "id": "uuid", "username": "massalifts", "avatar_initials": "ML",
    "workout_title": "Push day", "completed_at": "2026-07-20T18:05:00Z",
    "total_volume_kg": 8400, "duration_secs": 4320, "pr_count": 1
} ], "next_cursor": null }
```
Rien d'autre ne voyage dans le feed — jamais de `gif_url`, jamais les
sets détaillés (chargés à la demande au tap sur la card).

#### `GET /v1/leaderboard/:exercise_id`
→ classement entre follows mutuels uniquement, poids brut, PRs avec
`is_social_eligible=true` seulement. Entrées inéligibles exclues (pas
juste grisées — elles n'apparaissent PAS dans cette réponse).

#### `POST /v1/stories` — multipart si `type=photo_overlay`
→ `201`, `expires_at` calculé serveur (+24h), jamais fourni par le client.

#### `POST /v1/reports` — Body `{ "target_type": "story", "target_id": "uuid", "reason": "..." }`
→ `201`. Auto-hide applicatif déclenché au 3e report distinct sur la
même cible (vérifié côté backend, pas côté client).

---

### 4.4 Coach Mode

#### `POST /v1/coach/invites` (coach uniquement, `is_coach=true` requis, sinon `403`)
→ `201` `{ "code": "AB12CD", "invite_url": "https://lyxo.app/invite/AB12CD" }`

#### `POST /v1/coach/invites/:code/accept` (le client)
→ `200`. **`403 FORBIDDEN` avec `code: COACH_CLIENT_LIMIT_REACHED`** si
le coach est en tier Découverte et a déjà 3 clients actifs (PRICING §5).

#### `GET /v1/coach/clients` (coach) → liste + dernière séance + heatmap mini.

#### `POST /v1/programs` (coach) / `POST /v1/programs/:id/assign`
Body assign : `{ "client_id": "uuid" }`.

---

### 4.5 Billing — ROADMAP Phase 9 UNIQUEMENT (= Phase produit 3, post-beta — §20.6, aucune route avant)

> ⚠️ Désambiguïsation (audit doc) : "Phase 3" au sens produit = monétisation
> = **Phase 9 de ROADMAP.md**. La Phase 3 de ROADMAP.md est la SYNC — aucune
> route billing n'y est jamais codée.

#### `POST /v1/billing/trial/start`
Auth requise. **Déclenché manuellement par l'user** (jamais auto).
`409 CONFLICT` avec `code: TRIAL_ALREADY_USED` si `trial_used=true`.
→ `200`, set `trial_expires_at = now() + 14j`.

#### `POST /v1/billing/pay-link` (interne, appelé par cron ou bouton "Renvoyer l'email")
→ `202`, génère token + envoie email (voie Afrique uniquement).

#### `GET /v1/pay/:token` (PAS de JWT — le token EST l'auth, page web)
→ `200` avec les plans si token valide/non expiré/non utilisé.
→ `410 Gone` avec `code: PAY_LINK_ALREADY_USED` si `used_at` renseigné.
→ `410 Gone` avec `code: PAY_LINK_EXPIRED` si token connu mais expiré —
  la page web affiche "Lien expiré" + bouton "Renvoyer l'email"
  (déclenche `POST /v1/billing/pay-link`) au lieu d'une page morte.
→ `404` si token inconnu.

#### `POST /v1/billing/checkout` (depuis la page web, pas l'app)
Body : `{ "token": "...", "plan": "monthly"|"annual", "phone_number": "..." }`
→ `202` `{ "status": "ACCEPTED" }` (prompt MoMo envoyé) ou
`422 PAYMENT_REJECTED` avec `details.failureReason` (ex.
`INVALID_PHONE_NUMBER`).
Idempotence anti double-clic (BILLING_FLOW §4.3bis) : si un payment
`pending` < 5 min existe déjà pour ce token → `200` avec le paiement en
cours (no-op), jamais un second deposit.

#### `GET /v1/pay/:token/status` (PAS de JWT — même auth token que /pay)
Polling de la page web pendant/après le checkout (survit à une réponse
POST perdue en 3G — BILLING_FLOW §4.3bis).
→ `200` `{ "status": "none"|"pending"|"provisional_access"|"complete"|"failed", "failure_reason": string|null }`

#### `POST /v1/webhooks/pawapay/deposits` (signature vérifiée, pas de JWT)
→ toujours `200` rapide (traitement async), même en cas de doublon
(idempotence sur `deposit_id`).

#### `POST /v1/webhooks/revenuecat` (Bearer secret RevenueCat, pas JWT user)
→ `200`.

#### `GET /v1/billing/status`
Auth requise. → `{ "is_premium": bool, "premium_until": "...", "source": "pawapay"|"revenuecat"|null }`
— utilisé par le bouton "Actualiser mon statut" (§20.4).

---

### 4.6 Flags critiques — canal indépendant du sync

#### `GET /v1/flags`
Sans auth, réponse minuscule et cacheable (Cache-Control 60s).
→ `200` `{ "sync_enabled": true, "billing_enabled": true }`
Raison (audit deep-tech) : les feature_flags voyagent normalement dans le
payload de sync — mais un bug dans le code de sync lui-même rendrait le
kill switch inopérant (le canal malade transporte son propre antidote).
Les flags CRITIQUES (`sync_enabled`, `billing_enabled`) sont donc AUSSI
lus via cet endpoint trivial appelé au boot, indépendant du pipeline de
sync. Les autres flags restent dans le payload de sync uniquement.

---

## 5. RATE LIMITING (résumé, détails par route dans le code)
- `/v1/billing/checkout` : 5 tentatives / token / heure (anti-spam, §4.2bis).
- `/v1/sync/push` : pas de limite dure, mais taille de batch plafonnée
  (protection mémoire serveur).
- Toutes les autres routes user-facing : limite générale raisonnable
  (à définir en Phase 3, pas critique en MVP à faible volume).

---

*Documents liés : DATA_MODEL.md (les tables derrière ces endpoints) ·
BILLING_FLOW.md (détail narratif du flux §4.5) · ARCHITECTURE.md (qui
appelle qui) · CLAUDE_LYXO_V3.md §18-20 (règles d'origine).*
