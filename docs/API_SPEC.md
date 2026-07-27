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
  ⚠️ AJOUT (audit technique 2026-07-25) : toute route `/v1/admin/*` qui
  MODIFIE une donnée écrit systématiquement une ligne dans
  `admin_audit_log` (DATA_MODEL.md §2.24) via `admin.middleware.ts`
  (LLD.md §1.2) — un secret statique unique sans journal d'audit rend
  un accès (légitime ou via fuite) indétectable a posteriori.
  ⚠️ CORRECTION : le journal d'audit ne compense PAS l'absence de
  rotation — il constate après coup, il n'empêche rien. Une clé partagée
  non tournante reste valide indéfiniment après une fuite. Tant que
  `X-Admin-Key` reste le mécanisme retenu (V1 — cible : autorisation par
  identité à jetons courts, à trancher avant toute route admin exposée
  hors usage personnel), les quatre contrôles suivants sont obligatoires
  et conditionnent l'activation de la première route `/v1/admin/*` :
  1. **Fail-closed** : `ADMIN_API_KEY` absente/vide côté serveur →
     TOUTES les routes `/v1/admin/*` répondent `503` et le process logge
     une erreur au boot. Jamais de dégradation en "accès libre".
  2. **Comparaison à temps constant** (`crypto.timingSafeEqual` sur des
     buffers de même longueur, jamais `===`) — sinon la clé est
     récupérable octet par octet par mesure de latence.
  3. **Clé versionnée et tournée** : format `v<n>.<secret>`, rotation
     planifiée tous les 90 jours ET immédiate à toute suspicion. Le
     serveur accepte deux versions simultanément pendant une fenêtre de
     recouvrement de 24 h, puis rejette l'ancienne. La version utilisée
     est journalisée dans `admin_audit_log.details`.
  4. **Procédure d'incident** documentée (ENV_SETUP.md §1.7) : révoquer
     d'abord, relire ensuite `admin_audit_log` sur toute la période
     d'exposition pour établir ce qui a été touché.

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

> Deux codes SUCCÈS ne figurant pas dans ce tableau (ce n'est pas un
> format d'erreur) mais faisant partie de la liste fermée §3 : `202`
> (traitement asynchrone accepté, ex. `POST /v1/billing/pay-link`,
> `DELETE /v1/profiles/me`) et `410` (ressource définitivement expirée/
> consommée, ex. `GET /v1/pay/:token` sur un lien déjà utilisé ou
> expiré). `410` porte quand même un body au FORMAT D'ERREUR STANDARD
> ci-dessus (`PAY_LINK_EXPIRED`/`PAY_LINK_ALREADY_USED`).

> Note `DUPLICATE_REQUEST` : sur les routes idempotentes (sync push,
> checkout), un rejeu n'est PAS une erreur utilisateur — répondre 200
> avec le résultat déjà connu plutôt qu'un 409 est souvent préférable ;
> le choix exact (200 silencieux vs 409 explicite) est précisé route par
> route ci-dessous.

---

## 3. STATUS CODES UTILISÉS (liste fermée)

`200` OK · `201` Created · `202` Accepted · `204` No Content (ex. DELETE
réussi) · `400` `401` `403` `404` `409` `410` `422` `429` `500` `503`
(voir tableau ci-dessus).
- `202 Accepted` : la requête est valide et acceptée, mais son
  traitement est ASYNCHRONE — la ressource n'est pas garantie créée/
  modifiée au moment où la réponse part (ex. `POST /v1/billing/pay-link`
  qui déclenche un envoi email en arrière-plan, `DELETE /v1/profiles/me`
  dont le soft-delete réel est différé, `POST /v1/follows` sur un compte
  privé qui crée une demande en attente). Jamais utilisé pour une
  opération synchrone déjà effective — dans ce cas c'est `200`/`201`.
- `410 Gone` : la ressource a existé mais est DÉFINITIVEMENT expirée ou
  déjà consommée — pas juste absente (ce serait `404`). Usage unique
  actuel : `GET /v1/pay/:token` sur un lien PawaPay déjà utilisé
  (`PAY_LINK_ALREADY_USED`) ou expiré (`PAY_LINK_EXPIRED`), §4.5.
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

Tables synchronisables via ce endpoint : toutes les tables `[SYNC]` de
DATA_MODEL.md §2, **PLUS `exercises`** (audit doc #4) — référentiel en
lecture seule côté client, mais rendu pull-able via sa colonne
`updated_at` (DATA_MODEL.md §2.3) pour permettre une mise à jour
incrémentale du catalogue (ex. bascule ExerciseDB Pro) sans obliger un
redéploiement de l'app. `stories` n'est PAS dans cette liste — elle
n'est pas synchronisée offline-first (DATA_MODEL.md §2.10).

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

#### `PATCH /v1/profiles/me/billing-region` (ajouté ROADMAP 1.7)
Auth requise. Body optionnel : `{ "declared_country"?: "CM" }` (ISO 3166-1
alpha-2, liste fermée — `400 VALIDATION_ERROR` sinon). Calcule et stocke
`billing_region` **côté serveur uniquement** (BILLING_FLOW.md §2) : pays
déclaré prioritaire si fourni, IP de la requête (`req.ip`, via
`geoip-lite`) en confirmation sinon/en cas d'absence — jamais l'inverse,
jamais accepté tel quel du body. Conflit déclaré/IP : le déclaré gagne,
l'écart est loggé (pino `warn`) pour revue, jamais bloquant. Appelé par
l'app après chaque `SIGNED_IN` (`lib/compute-billing-region.ts`) — pas
encore de pays déclaré tant que l'écran country picker (1.8) n'existe
pas, donc IP seule en pratique jusque-là.
→ `200 { "id", "billing_region", "country" }`.

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
⚠️ (audit doc #18) **Exclut TOUJOURS les workouts avec `is_private=true`,
y compris pour les follows MUTUELS** — `is_private` est une intention
explicite du poseur, elle prime sur tout statut de relation ; aucune
exception "mutuel" ne la contourne.

#### `GET /v1/leaderboard/:exercise_id`
→ classement entre follows mutuels uniquement, poids brut, PRs avec
`is_social_eligible=true` seulement. Entrées inéligibles exclues (pas
juste grisées — elles n'apparaissent PAS dans cette réponse).
⚠️ (audit doc #18) **Exclut aussi tout PR rattaché à un `workout`
`is_private=true`** — un record réalisé lors d'une séance privée
n'apparaît jamais dans un leaderboard, même entre follows mutuels
(même logique d'exclusion que `GET /v1/feed` ci-dessus).

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

#### `GET /v1/programs` (ajouté, audit doc #21) — coach uniquement
→ liste des programmes créés par le coach connecté (`coach_id = auth.uid()`),
format compact (id, name, cycle_weeks, nombre de clients assignés).
Pas de `client_id` en query en V1 — un client suit son programme assigné
via `workouts.program_id`, pas via cette route (réservée au coach).

#### `GET /v1/programs/:id` (ajouté, audit doc #21)
→ détail complet d'un programme, `program_workouts` inclus (structure
semaine/jour/exercices/cibles — DATA_MODEL.md §2.15). Autorisé pour le
coach auteur (`coach_id = auth.uid()`) OU un client qui lui est assigné
via `coach_clients` ; `403 FORBIDDEN` sinon.

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

### 4.7 Gym Matching & Chat (ajouté, audit doc #14 — override V1 daté
2026-07-24, voir LLD.md §6.8 / ROADMAP.md Phase 5bis pour la trace)

#### `GET /v1/partners/candidates` (AJOUTÉ, audit technique 2026-07-25)
> ⚠️ CORRECTION : `POST /v1/partners/swipes` ci-dessous exige un
> `target_id`, mais jusqu'à cet ajout aucun endpoint ne fournissait de
> liste de profils swipables — la feature Gym Matching était non
> implémentable telle que spécifiée (trou de contrat, pas un détail).
Auth requise. Query `?cursor=...`. → liste de profils candidats au swipe,
format compact (`id`, `username`, `avatar_initials`, `gym`). Exclusions
appliquées côté serveur, jamais côté client :
- Le profil appelant lui-même.
- Tout `target_id` déjà présent dans `partner_swipes` pour ce
  `swiper_id` (non soft-deleted) — jamais reproposer un profil déjà
  swipé (like ou reject).
- Tout profil déjà `partners` (match existant) avec l'appelant.
- ⚠️ CORRECTION : les exclusions ci-dessus (self / déjà swipé / déjà
  matché) sont fonctionnelles, pas des règles de visibilité — elles ne
  dispensent PAS d'appliquer §1.2 SECURITY_NOTES, sans quoi cet endpoint
  devient un contournement des profils privés et des blocages. S'ajoutent
  donc, toutes vérifiées côté serveur (RLS + filtre applicatif, double
  verrou §1.3) :
  - Tout profil soft-deleted (`deleted_at is not null`) ou en attente de
    purge après suppression de compte (§18.5).
  - Toute paire bloquée, dans les DEUX sens (bloqueur → bloqué et
    bloqué → bloqueur) : un profil bloqué ne doit jamais réapparaître
    dans un flux de swipe.
  - Tout profil `is_private=true` SANS follow approuvé de l'appelant —
    même règle de lecture que partout ailleurs (§1.2). Un profil privé
    n'est donc pas swipable par défaut ; c'est volontaire.
  - Tout profil `is_reviewer=true` (S12 SECURITY_NOTES, même filtre que
    leaderboard/Discover).
```json
{ "data": [ { "id": "uuid", "username": "massalifts",
    "avatar_initials": "ML", "gym": "Fitness Club Akwa" } ],
  "next_cursor": null }
```

#### `POST /v1/partners/swipes` — Body `{ "target_id": "uuid", "direction": "like"|"reject" }`
→ `201`. Si `direction=like` ET un swipe inverse `(target_id, swiper_id,
direction='like')` existe déjà → crée automatiquement une ligne
`partners` (match mutuel, DATA_MODEL.md §2.20/§2.21) et la réponse porte
en plus `{ "matched": true, "partner_id": "uuid" }`. `409 CONFLICT` si un
swipe existe déjà pour cette paire (`swiper_id`,`target_id`) — pas
re-swipable tant que non soft-deleted.

#### `GET /v1/partners` — Query `?cursor=...`
→ liste des matchs actifs (`partners`, non soft-deleted) du user
connecté, format compact (`partner_id`, `username`, `avatar_initials`,
`matched_at`).

#### `POST /v1/conversations` — Body `{ "recipient_id": "uuid" }`
→ `201` `{ "id", "status" }`. `status` = `'accepted'` d'emblée si
`recipient_id` est un Partner matché de l'appelant, sinon `'pending'`
(dossier "Requests", LLD.md §6.8) jusqu'à réponse du destinataire.
`409 CONFLICT` si une conversation existe déjà pour cette paire (index
unique sur la paire non ordonnée, DATA_MODEL.md §2.22).

#### `GET /v1/conversations/:id/messages` — Query `?cursor=...`
Auth requise, réservé aux deux membres de la conversation
(`initiator_id`/`recipient_id` = `auth.uid()`, sinon `403 FORBIDDEN`).
→ `{ "data": [ { "id", "sender_id", "body", "created_at" } ], "next_cursor": ... }`,
triés par `created_at`.

#### `POST /v1/conversations/:id/messages` — Body `{ "body": "..." }`
→ `201`. `403 FORBIDDEN` si l'appelant n'est ni `initiator_id` ni
`recipient_id`. Si la conversation est `status='pending'` et que
l'expéditeur est le `recipient_id` (il répond) → la conversation passe
à `'accepted'` (accord explicite, LLD.md §6.8).

#### `POST /v1/physique-photos` — multipart (ajouté, audit doc #14, sur
le modèle de `POST /v1/stories` §4.3)
Menu Actions › Physique (LLD.md §6.5) — galerie de progression pure,
aucun chiffre associé (poids/masse grasse restent des stat cards
Performance). `taken_at` par défaut = `now()` côté serveur si non fourni.
→ `201` `{ "id", "photo_url", "taken_at" }`.

---

## 5. RATE LIMITING (résumé, détails par route dans le code)
- `/v1/billing/checkout` : 5 tentatives / token / heure (anti-spam, §4.2bis).
- `/v1/sync/push` : pas de limite dure, mais taille de batch plafonnée
  (protection mémoire serveur).
- `/v1/profiles/check-username` : 20/min/IP (anti-énumération, §4.2).

⚠️ **AJOUT (audit technique 2026-07-25) — routes sociales/chat sans
limite chiffrée jusqu'ici**, alors que ces features sont déjà en scope V1
(pas repoussables à "Phase 3, pas critique") : sans limite, une même
route devient un vecteur d'abus direct (spam de messages, swipe massif/
scraping de profils, signalements en rafale pour déclencher l'auto-hide
à 3 reports, §S11/S12 SECURITY_NOTES). Limites minimales à implémenter
via le `rate-limit.middleware.ts` déjà existant :
- `POST /v1/reports` : 10/heure/user — au-delà, un signalement légitime
  peut attendre, un flood ne doit pas pouvoir déclencher un auto-hide.
- `POST /v1/conversations/:id/messages` : 60/heure/conversation/user —
  généreux pour un usage normal, bloque un spam automatisé.
- `POST /v1/partners/swipes` : 100/jour/user — un volume de swipe humain
  raisonnable, empêche un script de scraper `GET /v1/partners/candidates`
  en masse via des swipes automatisés.
- `POST /v1/follows` : 50/heure/user — anti-spam de demandes de follow.

⚠️ CORRECTION — **état partagé, pas mémoire process**. L'implémentation
actuelle (`backend/src/middleware/rate-limit.ts`) garde une `Map` en
mémoire du process et clé sur `req.ip`. Deux conséquences qui rendent les
quotas ci-dessus fictifs s'ils sont posés tels quels :
- Sur N instances, chaque instance compte séparément → quota réel = N × la
  valeur annoncée. Idem après chaque redéploiement Render (compteurs
  remis à zéro), et derrière un proxy où plusieurs users partagent une IP.
- Les quotas ci-dessus sont **par user** et **par conversation**, pas par
  IP — ils exigent une clé dérivée de `auth.uid()` (et de l'id de
  conversation pour les messages), pas de `req.ip`.

Règle : ces quatre routes ne s'activent qu'avec un compteur en **état
partagé** (Redis, ou une table Postgres à fenêtre glissante — suffisant à
ce volume, pas d'infra nouvelle à provisionner). À défaut, deux
obligations cumulatives avant activation : (a) déploiement **verrouillé à
une seule instance**, vérifié dans la config Render et pas seulement
supposé ; (b) comportement **fail-closed** — si le magasin de compteurs
est indisponible, la requête est rejetée (`503`), jamais laissée passer
sans comptage. La mention "pas besoin de Redis, limite en mémoire process
suffit" était une sous-estimation : elle vaut pour du confort anti-abus
générique, pas pour des quotas qui portent une garantie de sécurité
(auto-hide à 3 reports, §S11/S12).

Toutes les autres routes user-facing : limite générale raisonnable
(seuil plus large à définir en Phase 3 selon le volume observé — les
quatre limites ci-dessus, elles, sont un prérequis avant l'activation des
features concernées, pas une amélioration différable).

---

*Documents liés : DATA_MODEL.md (les tables derrière ces endpoints) ·
BILLING_FLOW.md (détail narratif du flux §4.5) · ARCHITECTURE.md (qui
appelle qui) · CLAUDE_LYXO_V3.md §18-20 (règles d'origine).*
