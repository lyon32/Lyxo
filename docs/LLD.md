# LLD.md — LYXO · Low-Level Design
# Version : 1.0 — fin Juillet 2026
# Rôle : LA structure de dossiers exacte à respecter (pas ce qu'un agent
# inventerait), la responsabilité de chaque module, les signatures des
# fonctions non triviales, le state management, et les conventions de
# nommage. Toute session Claude Code qui crée un fichier hors de cet
# arbre doit d'abord justifier pourquoi l'arbre ne convient pas.

---

## 1. FOLDER / FILE STRUCTURE

### 1.1 App mobile (`lyxo-app/`)

```
lyxo-app/
├── app/                          # expo-router (file-based routing)
│   ├── (auth)/                   # ⚠️ CORRECTION (audit doc, Phase 1) : la structure
│   │   │                         #   RÉELLEMENT livrée utilise deux dossiers PLATS
│   │   │                         #   `app/auth/` + `app/onboarding/` (segments visibles
│   │   │                         #   dans l'URL, ex. /auth/login) et non ce route group
│   │   │                         #   `(auth)/` (segment masqué, ex. /login). Déviation
│   │   │                         #   fonctionnellement neutre mais jamais actée par écrit
│   │   │                         #   avant cet audit — renommer maintenant coûterait un
│   │   │                         #   refactor de tous les router.push/replace pour un
│   │   │                         #   bénéfice nul ; on documente la réalité plutôt que
│   │   │                         #   de forcer la conformité de l'arbre. Fichiers réels :
│   │   │                         #   app/onboarding/(language|welcome|goal|split|
│   │   │                         #   onboarding-details).tsx + app/auth/(index=signup|
│   │   │                         #   login|forgot-password|reset-password|callback).tsx.
│   │   ├── language.tsx          # 1bis — PREMIER ÉCRAN ABSOLU (choix FR/EN avant tout — CLAUDE.md §7/§8)
│   │   ├── welcome.tsx           # 1ter — pitch + offline fusionnés (photo hero réelle,
│   │   │                         #   PHOTO HERO EXCEPTION §19.8bis) ; anciennement offline.tsx
│   │   ├── goal.tsx              # écran 2 (pré-auth) — objectif, 3 cards
│   │   ├── split.tsx             # écran 2 (pré-auth) — split préféré, data-cards
│   │   ├── signup.tsx            # écran 3 — recap endowment + social (Google/Apple iOS-only) + email
│   │   ├── login.tsx             # écran 3bis
│   │   ├── forgot-password.tsx   # écran 3quater, étape 1 (saisie email)
│   │   ├── reset-password.tsx    # écran 3quater, étape 3 (deep link lyxo.app/reset/{token})
│   │   └── onboarding-details.tsx # écran 2bis (post-auth) — pays/unité/Data Saver/règle 90j/pseudo
│   ├── (tabs)/                   # ⚠️ RÉGÉNÉRÉ (audit doc #16) pour refléter
│   │   │                         #   §6.1 (nav restructure 2026-07-24) — cette
│   │   │                         #   section décrivait encore l'ANCIENNE nav
│   │   │                         #   5 onglets (Accueil·Log·Progrès·Discover·
│   │   │                         #   Profil), remplacée par Home·Log·Search·
│   │   │                         #   Performance·Shop, Profil retiré de la tab
│   │   │                         #   bar. "profile" reste routé DANS ce groupe
│   │   │                         #   (`href: null` le masque de la barre sans
│   │   │                         #   le retirer du routeur) — accès via
│   │   │                         #   l'avatar en haut à droite de Home.
│   │   ├── _layout.tsx           # 5 routes visibles : Home·Log·Search·
│   │   │                         #   Performance·Shop + "profile" masqué (§6.1)
│   │   ├── index.tsx             # Home
│   │   ├── log.tsx               # Log — fichier plat (pas de sous-dossier ;
│   │   │                         #   Workout Logger/rest-timer pas encore
│   │   │                         #   scindés en sous-écrans, prévu Bloc B)
│   │   ├── search.tsx            # Search — remplace `discover.tsx` (§6.1) :
│   │   │                         #   bibliothèque d'exercices, sous-tabs
│   │   │                         #   "Feed"/"Discover" en pills texte
│   │   ├── progress.tsx          # Performance (nom d'écran ; fichier historique `progress.tsx`)
│   │   ├── shop.tsx              # Shop — v2, vide en v1 (marketplace coach, §6.1/§6.4)
│   │   └── profile.tsx           # Profil — fichier plat, routé hors tab bar (§6.1)
│   ├── messages.tsx              # AJOUTÉ (audit doc #16) — manquait à l'arbre ;
│   │                             #   inbox chat Partners + dossier "Requests" (§6.8)
│   ├── notifications.tsx         # AJOUTÉ (audit doc #16) — manquait à l'arbre ;
│   │                             #   liste notifications (Conquête, follows, coach)
│   ├── coach/
│   │   ├── clients.tsx
│   │   ├── programs/
│   │   │   ├── index.tsx
│   │   │   └── builder.tsx
│   │   └── invite.tsx
│   ├── settings/
│   │   ├── index.tsx
│   │   ├── data-saver.tsx
│   │   └── delete-account.tsx
│   ├── paywall.tsx               # ROADMAP Phase 9 (billing)
│   └── _layout.tsx               # racine : providers, UpdateChecker
│
├── components/
│   ├── ui/                       # primitives design system (Braise)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Stepper.tsx           # ±2,5kg / ±2.5-5lbs, 56px min
│   │   ├── Heatmap.tsx
│   │   └── PRCard.tsx            # carte partageable
│   ├── logger/
│   │   ├── WeightRepsInput.tsx   # les 2 blocs égaux (audit 2.8)
│   │   ├── NumberKeyboard.tsx    # clavier custom sticky
│   │   └── SetRow.tsx
│   ├── social/
│   │   ├── FeedCard.tsx
│   │   ├── StoryRing.tsx
│   │   ├── ConquestBanner.tsx
│   │   └── TraceCard.tsx
│   └── UpdateChecker.tsx         # OTA banner
│
├── lib/                          # logique métier pure, testable, sans UI
│   ├── sync/
│   │   ├── engine.ts             # orchestration pull/push
│   │   ├── conflict-resolution.ts # LWW
│   │   └── watermelon-schema.ts
│   ├── pr-detection.ts           # règles anti-triche §18.1
│   ├── units.ts                  # kg↔lbs, formats FR/EN (§19.15)
│   ├── billing-region.ts         # détection pays+IP (§19.1)
│   └── i18n/
│       ├── fr.json
│       └── en.json
│
├── stores/                       # state management (voir §4)
│   ├── useAuthStore.ts
│   ├── useWorkoutStore.ts        # séance EN COURS (éphémère)
│   ├── useSettingsStore.ts
│   └── useSyncStatusStore.ts
│
├── db/                           # WatermelonDB
│   ├── schema.ts
│   ├── models/
│   │   ├── Workout.ts
│   │   ├── Set.ts
│   │   ├── PersonalRecord.ts
│   │   └── ...
│   └── migrations.ts
│
├── api/                          # client HTTP typé (Data Contract = API_SPEC.md)
│   ├── client.ts                 # instance fetch/axios + intercepteur JWT
│   ├── profiles.ts               # AJOUTÉ (audit doc #20) — manquait à l'arbre ;
│   │                             #   check-username, me, billing-region, export,
│   │                             #   delete (API_SPEC §4.2)
│   ├── sync.ts
│   ├── social.ts
│   ├── coach.ts
│   └── billing.ts                # ROADMAP Phase 9 (billing)
│
├── assets/
│   ├── brand/                    # monogram-bone.png, wordmark-bone.png
│   └── exercises/                # pack ~50 GIFs embarqués
│
├── design/handoff/                # bundle Claude Design (référence pixel)
├── tailwind.config.js
├── global.css
├── babel.config.js
├── metro.config.js
├── app.json
└── nativewind-env.d.ts
```

### 1.2 Backend (`lyxo-api/`)

```
lyxo-api/
├── src/
│   ├── routes/
│   │   ├── sync.routes.ts
│   │   ├── profiles.routes.ts
│   │   ├── social.routes.ts
│   │   ├── coach.routes.ts
│   │   ├── billing.routes.ts      # ROADMAP Phase 9 uniquement
│   │   └── webhooks.routes.ts     # ROADMAP Phase 9 uniquement
│   ├── controllers/                # 1 fichier par domaine, miroir de routes/
│   ├── services/                   # logique métier, appelée par les controllers
│   │   ├── sync.service.ts
│   │   ├── pr-detection.service.ts # même règles que lib/pr-detection.ts app — dupliqué volontairement (serveur = source de vérité, client = calcul optimiste)
│   │   ├── billing-region.service.ts
│   │   ├── pawapay.service.ts      # ROADMAP Phase 9
│   │   └── revenuecat.service.ts   # ROADMAP Phase 9
│   ├── middlewares/
│   │   ├── auth.middleware.ts      # vérif JWT Supabase
│   │   ├── admin.middleware.ts     # AJOUTÉ (audit technique 2026-07-25) :
│   │   │                           #   vérif X-Admin-Key + écriture systématique
│   │   │                           #   dans admin_audit_log (DATA_MODEL §2.24)
│   │   │                           #   sur toute route /v1/admin/* qui modifie
│   │   │                           #   une donnée — voir SECURITY_NOTES §1.1
│   │   │                           #   Contrat de vérification (API_SPEC §1) :
│   │   │                           #   fail-closed si ADMIN_API_KEY absente (503
│   │   │                           #   + erreur au boot), timingSafeEqual jamais
│   │   │                           #   ===, clé versionnée v<n>.<secret> avec
│   │   │                           #   2 versions acceptées pendant 24h lors
│   │   │                           #   d'une rotation (90j ou sur suspicion),
│   │   │                           #   version journalisée dans details.
│   │   ├── error-handler.middleware.ts  # FORMAT D'ERREUR STANDARD (API_SPEC §2)
│   │   └── rate-limit.middleware.ts
│   ├── lib/
│   │   ├── errors.ts                # classe AppError + codes (SCREAMING_SNAKE_CASE)
│   │   └── prisma.ts                # instance Prisma singleton
│   ├── cron/
│   │   ├── purge-soft-deleted.ts    # J+90 (§18.3)
│   │   ├── purge-deleted-accounts.ts # J+30 (§18.5/§20.3)
│   │   ├── trial-reminders.ts       # J12/J14/J21 (ROADMAP Phase 9)
│   │   └── story-expiry.ts          # purge 24h
│   └── index.ts
├── prisma/
│   └── schema.prisma                # généré via `prisma db pull`, jamais écrit à la main en premier
├── supabase/
│   └── migrations/                  # SOURCE DE VÉRITÉ du schéma (§20.5)
└── package.json
```

### 1.3 Web (`lyxo-web/`) — minimal, 3 pages (non-goal 6 PROJECT_BRIEF)

```
lyxo-web/
├── pages/
│   ├── index.tsx          # landing
│   ├── pay/[token].tsx    # paiement PawaPay (ROADMAP Phase 9) — token en PATH, forme unique (API_SPEC §4.5)
│   ├── invite/[code].tsx  # fallback deep link coach
│   └── account/delete.tsx # suppression de compte web
```

---

## 2. MODULE RESPONSIBILITIES

**`lib/sync/`** — Le module le plus critique du projet (Bloc C, jamais
compressé). Responsable de l'orchestration pull/push WatermelonDB : il
sait QUAND synchroniser (foreground, retour réseau, post-paiement forcé
§20.4), QUOI envoyer (diff local depuis `updated_at`), et comment
résoudre les conflits (LWW silencieux). Frontière stricte : il ne connaît
RIEN du contenu métier des tables (pas de règles PR ici) — c'est un pur
mécanisme de transport de données, testé indépendamment de toute logique
fitness.

⚠️ **AJOUT (audit technique 2026-07-25) — retry/backoff obligatoire,
symétrique au traitement déjà spécifié pour le billing** :
`BILLING_FLOW.md §4.3bis` détaille une résilience réseau complète
(verrou, polling, TTL) pour le checkout — `lib/sync/` n'avait aucune
politique équivalente alors qu'il est désigné ici comme LE module le plus
critique. Règle : tout pull/push qui échoue (5xx, `503
PROVIDER_UNAVAILABLE`, timeout réseau) déclenche un retry avec backoff
exponentiel borné (ex. 2s/4s/8s/16s, plafond 5 tentatives), puis abandon
silencieux jusqu'au prochain déclencheur naturel (retour réseau détecté
par `NetInfo`, prochain foreground) — jamais de boucle de retry infinie
qui viderait la batterie/data. Un push interrompu EN COURS DE BATCH (pas
juste avant l'envoi) doit reprendre sans dupliquer ni perdre d'entités —
couvert par l'idempotence déjà en place (`local_id`, §API_SPEC 4.1) mais
à tester explicitement (test de torture symétrique à celui du billing :
mode avion → coupure mi-push → reprise → un seul état final cohérent,
DoD Bloc C).

⚠️ CORRECTION : « couvert par l'idempotence » est insuffisant comme
spécification — `local_id` garantit qu'un item rejoué ne crée pas de
doublon, il ne dit RIEN de ce que le client a le droit de considérer
comme acquis quand la réponse n'arrive jamais. C'est exactement le cas
d'une coupure mi-batch, et c'est là que se perdent des séances (critère
de succès n°1). Contrat explicite :

1. **Idempotence par item, pas par batch.** La clé est le `local_id` de
   chaque entité (UUID généré client à la création, jamais réattribué,
   stable à travers les rejeux). Un rejeu du même `local_id` est un
   no-op côté serveur, pas une erreur : réponse `200` avec l'état déjà
   enregistré, jamais `409`.
2. **Frontière transactionnelle serveur = le batch entier.** Un push est
   appliqué dans UNE transaction : tout est commit, ou rien ne l'est. Pas
   de commit partiel item par item — sinon une coupure laisse un état
   serveur intermédiaire dont ni le client ni le serveur ne connaît le
   contenu exact.
3. **Le client n'avance son checkpoint qu'après un accusé de commit
   confirmé.** L'accusé est la réponse HTTP du push, qui porte la liste
   des `local_id` effectivement commis. Un timeout, une coupure réseau ou
   un 5xx ne sont **jamais** interprétés comme un succès : le curseur
   local reste où il était.
4. **Reprise = rejouer le batch non accusé à l'identique.** Le client ne
   tente pas de deviner ce qui est passé. Il renvoie les mêmes items ; le
   point 1 garantit qu'un item déjà commis n'est pas dupliqué, le point 2
   garantit qu'il n'y a pas d'état intermédiaire à réconcilier. Les items
   déjà présents ressortent dans l'accusé, ce qui permet au client
   d'avancer son checkpoint au tour suivant.
5. **Le cas dangereux est le succès non accusé** : serveur commit, puis
   la réponse se perd. Le client rejoue, croyant avoir échoué. Sans le
   point 1, ce scénario duplique les séances ; c'est lui, et pas la
   coupure avant commit, qui doit être testé en priorité.

Tests dédiés (TESTING.md, DoD Bloc C) — les deux moments de coupure sont
distincts et doivent être couverts séparément :
- Coupure **avant** commit serveur → rien en base, le client rejoue, état
  final = un exemplaire de chaque entité.
- Coupure **après** commit serveur mais avant réception de la réponse →
  déjà en base, le client rejoue quand même, état final = un exemplaire
  de chaque entité (aucun doublon, aucune perte).

**`lib/pr-detection.ts`** — Encode les 3 règles anti-triche (§18.1) :
plafond de plausibilité, delta max, ancienneté. Frontière : pure function,
zéro effet de bord, zéro appel réseau — prend un historique de sets en
entrée, retourne un verdict. Dupliqué côté serveur
(`services/pr-detection.service.ts`) qui EST la source de vérité finale ;
la version client ne sert qu'à l'affichage optimiste immédiat (célébrer
un PR avant même la sync).

**`lib/billing-region.ts`** — Détecte `billing_region` une seule fois, à
l'onboarding (pays déclaré + IP en confirmation, §19.1). Frontière :
n'écrit jamais directement dans `profiles` — retourne une valeur que
l'écran d'onboarding envoie via l'API, qui elle-même vérifie/stocke.
Le client ne peut jamais modifier `billing_region` après coup (seul un
endpoint admin le peut).

**`stores/`** (frontend) — Voir §4, state éphémère UI uniquement.
Frontière stricte : AUCUNE donnée de séance/PR/social n'y vit
durablement — c'est le rôle de WatermelonDB. Un store ne survit pas à un
kill de l'app (sauf ce qui est explicitement persist, ex. préférences UI
locales non synchronisées comme un filtre de recherche).

**`db/` (WatermelonDB)** — Source de vérité OFFLINE. Frontière : aucun
composant UI ne parle à l'API directement pour les données de séance —
tout passe par les models WatermelonDB, qui se synchronisent en
arrière-plan via `lib/sync/`. Un écran ne sait pas si une donnée vient du
serveur ou du cache local, et ne doit pas avoir besoin de le savoir.

**`services/` (backend)** — Toute la logique métier serveur, appelée par
les controllers mais indépendante d'Express (testable sans mocker HTTP).
Frontière : un service ne connaît pas `req`/`res`, seulement des objets
métier typés en entrée/sortie.

**`cron/` (backend)** — Tâches planifiées, chacune dans son fichier,
chacune idempotente (relancer un cron deux fois ne double pas les
effets — vérifie toujours l'état avant d'agir).

⚠️ **AJOUT (audit technique 2026-07-25) — monitoring de succès
obligatoire, pas seulement les erreurs** : `purge-soft-deleted.ts` (J+90)
et `purge-deleted-accounts.ts` (J+30) exécutent une obligation RGPD, pas
une simple tâche de maintenance — un échec SILENCIEUX (process qui ne
démarre pas, redéploiement Render pendant la fenêtre cron, exception
avalée) est une violation de conformité invisible jusqu'à un contrôle.
Règle : chaque cron logge un `logger.info` de succès avec le nombre de
lignes traitées à CHAQUE exécution (pas seulement `Sentry.captureException`
sur échec) ; une alerte Sentry dédiée se déclenche si aucune exécution
réussie n'est observée sur une fenêtre glissante (ex. 25h pour un cron
quotidien) — un heartbeat, pas juste un try/catch.

⚠️ PRÉCISION : un `logger.info` n'est pas un heartbeat — c'est une ligne
de log, un événement qu'il faut avoir vu passer. Or le mode de panne à
détecter est justement une **absence** d'événement (scheduler arrêté,
conteneur non redémarré après déploiement) : rien ne s'écrit, donc rien
ne déclenche d'alerte, et une supervision fondée sur des logs ou des
exceptions reste silencieuse indéfiniment. Il faut un état **persistant**
interrogeable :
- Chaque job écrit, **à chaque exécution réussie**, une ligne d'état
  durable (table `cron_heartbeats` : `job_name` en clé, `last_success_at`,
  `rows_processed`, `duration_ms`) — dans la même transaction que son
  travail, pour qu'un succès enregistré signifie bien un travail commis.
- Un contrôle de **fraîcheur** séparé, qui ne dépend pas du job surveillé
  (sinon il tombe avec lui), lit périodiquement cette table et lève une
  alerte Sentry dédiée dès que `now() - last_success_at` dépasse la
  fenêtre attendue : 25 h pour les crons quotidiens
  (`purge-soft-deleted`, `purge-deleted-accounts`).
- `rows_processed = 0` est une valeur normale (rien à purger ce jour-là)
  et ne doit PAS alerter — l'alerte porte sur l'absence d'exécution, pas
  sur l'absence de travail.

**`middlewares/error-handler.middleware.ts`** — LE seul endroit qui
transforme une exception en réponse HTTP du format standard (API_SPEC
§2). Aucune route ne construit son propre objet d'erreur à la main —
toutes lèvent une `AppError(code, message, details?)` que ce middleware
capture et sérialise.

---

## 3. KEY FUNCTIONS — signatures pour la logique non triviale

### 3.1 Anti-triche PR (§18.1)
```typescript
// lib/pr-detection.ts (client) et services/pr-detection.service.ts (serveur, source de vérité)

interface PRCandidate {
  exerciseId: string;
  weightKg: number;
  reps: number;
  achievedAt: Date;
}

interface PRHistoryContext {
  bodyWeightKg: number | null;      // null si jamais renseigné
  previousBestKg: number | null;    // meilleur PR précédent sur CET exercice
  sessionsLoggedOnExercise: number; // nombre de séances distinctes ayant utilisé cet exercice
}

type IneligibilityReason =
  | 'implausible_weight'   // > 4× bodyWeightKg
  | 'delta_too_high'       // > +15% vs previousBestKg
  | 'insufficient_history' // < 3 séances loggées sur l'exercice
  | null;

function evaluatePRSocialEligibility(
  candidate: PRCandidate,
  context: PRHistoryContext
): { isSocialEligible: boolean; reason: IneligibilityReason } {
  // Ordre de vérification : plausibilité > delta > ancienneté
  // Un PR toujours enregistré dans personal_records (stats perso intactes),
  // seul is_social_eligible détermine sa visibilité leaderboard/Conquête/Trace.
}
```

### 3.2 Résolution de conflit de sync (LWW silencieux, Q12a)
```typescript
// lib/sync/conflict-resolution.ts

interface SyncableRecord {
  id: string;
  updatedAt: Date;
  deletedAt: Date | null;
}

function resolveConflict<T extends SyncableRecord>(
  local: T,
  remote: T
): T {
  // Le plus récent par updatedAt gagne, silencieusement (pas de toast).
  // Cas particulier : si l'un des deux a deletedAt non-null, il gagne
  // TOUJOURS si son updatedAt est >= à l'autre (une suppression récente
  // prime sur une modification plus ancienne).
  return remote.updatedAt >= local.updatedAt ? remote : local;
}
```

⚠️ **AJOUT (audit technique 2026-07-25) — garde-fou contre le clock skew
client** : `updatedAt` ci-dessus est généré CÔTÉ CLIENT (WatermelonDB,
DATA_MODEL.md convention §2). Un appareil du parc cible (Android
d'occasion, horloge non synchronisée NTP) peut envoyer un `updatedAt`
dans le futur ou fortement dérivé, ce qui ferait gagner silencieusement
une donnée plus ancienne sur un autre appareil (scénario multi-device
Lyxo+, PRICING.md §5) — contraire au critère de succès n°1 du produit
("zéro perte de séance signalée"). Règle serveur, appliquée AVANT le LWW,
côté `services/sync.service.ts` (backend, pas dans cette fonction pure
qui reste un mécanisme client) :
1. Comparer chaque `updatedAt` reçu au `server_timestamp` de la requête.
   ⚠️ CORRECTION : ce `server_timestamp` est généré **à l'entrée de la
   requête côté serveur** (ou par la base, `now()`), jamais lu dans le
   payload de sync. Le champ homonyme d'API_SPEC.md §4.1 circule dans la
   réponse *pull* (serveur → client, comme curseur de sync) ; le
   réutiliser en le prenant dans le corps du *push* rendrait le garde-fou
   inopérant — un client à l'horloge dérivée enverrait simplement un
   `server_timestamp` aussi décalé que son `updatedAt`, et l'écart
   mesuré serait toujours nul. La référence de comparaison ne doit
   jamais provenir de la partie qu'elle sert à contrôler.
2. Si `updatedAt` dépasse `server_timestamp` de plus d'un seuil de
   tolérance (ex. 5 minutes, horloges non parfaitement synchronisées
   même sans dérive anormale) → clamper à `server_timestamp` avant
   d'appliquer `resolveConflict`, et logger un `pino.warn` (pas bloquant,
   juste un signal de dérive à surveiller).
3. Test d'intégration dédié (TESTING.md §1.2) : horloge client
   délibérément décalée de plusieurs jours dans le futur → la donnée la
   plus récente RÉELLE (par temps serveur) ne doit jamais être écrasée.

### 3.3 Conversion d'unités (§19.15)
```typescript
// lib/units.ts

const KG_TO_LBS = 2.20462;

function formatWeight(weightKg: number, unit: 'kg' | 'lbs', locale: 'fr' | 'en'): string {
  // kg : arrondi 1 décimale, virgule si fr ("82,5 kg")
  // lbs : converti, arrondi 1 décimale, point si en ("181.9 lbs")
}

function stepperIncrement(unit: 'kg' | 'lbs'): number[] {
  // kg → [2.5]  |  lbs → [2.5, 5]  (plaques réelles, Q5/§19.15)
}

// RÈGLE : cette fonction ne s'appelle QUE côté affichage.
// weight_kg reste TOUJOURS la valeur stockée/envoyée à l'API.
```

### 3.4 Détection de région de facturation (§19.1)
```typescript
// lib/billing-region.ts

interface RegionSignal {
  declaredCountry: string;   // ISO 3166-1 alpha-2, saisi à l'onboarding
  ipCountry: string | null;  // best-effort, jamais seul décisif
}

function resolveBillingRegion(signal: RegionSignal): 'africa_momo' | 'intl_iap' {
  // declaredCountry est TOUJOURS prioritaire.
  // ipCountry ne sert qu'à logger un écart pour revue manuelle (pas à trancher).
  // Liste des pays africa_momo dans config/billing-regions.ts (maintenue à part).
}
```

### 3.5 Idempotence webhook PawaPay (§4.2bis BILLING_FLOW)
```typescript
// services/pawapay.service.ts (backend)

async function handleDepositCallback(payload: PawaPayDepositCallback): Promise<void> {
  // 1. Vérifier signature RFC-9421
  // 2. Re-GET /v2/deposits/{depositId} — ne JAMAIS activer sur le seul callback
  // 3. Si payments.deposit_id existe déjà avec status='complete' → no-op (200 silencieux)
  // 4. Sinon : transaction SQL — update payments + subscriptions ensemble (atomique)
  // 5. Déclencher push silencieuse → le client doit forcer /sync (§20.4)
}
```

---

## 4. STATE MANAGEMENT (frontend)

**Approche : Zustand pour l'état UI éphémère, WatermelonDB pour tout le
reste.** Pas de Redux (trop de boilerplate pour un solo dev), pas de
Context API pour l'état qui bouge souvent (re-renders non contrôlés).

| Type de donnée | Où elle vit | Pourquoi |
|---|---|---|
| Séance en cours de log (avant complétion) | `useWorkoutStore` (Zustand) | Éphémère, redondant avec WatermelonDB tant que non "complétée" — évite d'écrire en base à chaque tap |
| Séances terminées, sets, PRs, profils | WatermelonDB (via hooks `withObservables`) | Source de vérité offline, réactif nativement |
| Session utilisateur (JWT, profil courant) | `useAuthStore` (Zustand) + Supabase client | Zustand = cache mémoire rapide ; Supabase gère la persistance/refresh du JWT |
| Préférences UI non synchronisées (ex. dernier filtre exercice utilisé) | `useSettingsStore` (Zustand + AsyncStorage persist) | Confort, pas de valeur à synchroniser serveur |
| Choix onboarding PRÉ-auth (`goal`, `preferred_split`) | AsyncStorage brut (clés `onboarding_goal`/`onboarding_split`, PAS Zustand — aucun composant n'a besoin de les observer en réactif avant le login) | Éphémère : lu une seule fois par le PATCH post-login (API_SPEC §4.2), puis supprimé d'AsyncStorage — `profiles.goal`/`preferred_split` (DB, via sync) devient l'UNIQUE source de vérité après le premier login |
| Statut de sync (en cours/erreur/dernière sync) | `useSyncStatusStore` (Zustand) | Affichage de l'indicateur SYNCED, éphémère |
| Feature flags (kill switch) | Lu depuis le payload de `/v1/sync/pull`, caché en mémoire | Pas de store dédié — c'est une donnée serveur comme une autre |

Règle de frontière : **si une donnée doit survivre à un crash de l'app,
elle vit dans WatermelonDB, jamais dans un store Zustand.** Les stores
sont reconstruits à froid au démarrage.

---

## 5. NAMING CONVENTIONS

- **Fichiers composants** : PascalCase (`WeightRepsInput.tsx`).
- **Fichiers logique/hooks/services** : kebab-case (`pr-detection.ts`,
  `use-workout-store.ts` — sauf exports Zustand nommés `useXStore`
  respectant la convention React des hooks).
- **Tables/colonnes SQL** : snake_case (`personal_records`, `weight_kg`).
- **Champs API JSON** : snake_case (aligné sur les colonnes SQL — pas de
  camelCase en transit, évite une couche de mapping inutile).
- **Variables/fonctions TypeScript** : camelCase. **Types/interfaces** :
  PascalCase, jamais préfixé `I` (`PRCandidate`, pas `IPRCandidate`).
- **Codes d'erreur API** : SCREAMING_SNAKE_CASE (API_SPEC §2).
- **Routes API** : kebab-case, pluriel pour les collections
  (`/v1/coach/clients`, pas `/v1/coach/client`).
- **Composants de test** : `<NomDuFichier>.test.ts(x)`, colocalisés avec
  le fichier testé (pas de dossier `__tests__` séparé).
- **Migrations SQL** : `YYYYMMDDHHMMSS_verbe_objet.sql`
  (`20260801120000_create_personal_records.sql`).

---

## 6. REDESIGN RÉFÉRENCE (brainstorm design, 26 captures, 2026-07-24)

> Décidé image par image avec Lionel à partir d'un screenshot-reference
> d'une app fitness/social existante. **Palette Braise inchangée** —
> `tailwind.config.js` (bg/card/input/border/muted/fg/ember/steel) reste la
> seule source de couleurs UI ; seuls structure/composants/copy sont
> adoptés depuis la référence. ROADMAP.md 4.8-4.13 + Phase 5bis portent le
> détail d'exécution ; ce qui suit est la spec écran par écran.

### 6.0 Règles transverses (AJOUTÉ 2026-07-27)
> Décisions du brainstorm 2026-07-24 qui n'avaient jamais été écrites ici
> — elles ne vivaient que dans les captures d'origine. Ce sont des règles
> **globales**, à réutiliser d'écran en écran : le redesign s'applique à
> toute l'app, pas au seul écran en cours de construction.

**Pattern d'état vide (unique, app-wide).** Titre en gras + description en
gris, **alignés à gauche** et **ancrés en haut** de la zone de contenu
(sous le header, pas centrés verticalement), aucune illustration, aucune
icône, aucun CTA décoratif. Implémentation unique :
`components/EmptyState.tsx` — ne jamais réécrire ce bloc à la main dans
un écran.

> ⚠️ Le centrage vertical (`flex-1 items-center justify-center`) est
> explicitement exclu : il donne à un écran normal l'allure d'une page
> d'erreur ou d'un échec de chargement. L'état vide occupe la place que
> le contenu occupera, donc il commence là où le contenu commencerait.

**Ce qui n'est PAS un état vide** : un bloc d'opt-in, d'onboarding ou de
promotion affiché à la place du contenu (ex. l'écran d'activation de
Discover, `app/(tabs)/search.tsx`) — illustration, titre centré et CTA y
sont volontaires. La distinction : un état vide *constate* une absence de
données ; un bloc d'opt-in *demande une action* pour qu'il y en ait. Ne
pas migrer les seconds vers `EmptyState`. Une seule forme pour tous les cas : "No logs yet", "No gym
partners yet", "No notifications", onglets Recent/Custom du sheet Add
Exercise (§6.5bis), feed vide, etc. Un état vide est un écran de
production — c'est ce que voient les 10 coachs beta au premier lancement,
avant d'avoir la moindre donnée. Jamais un `return null`, jamais un
spinner infini, jamais un placeholder "à faire".

**Format de stat card.** Label en capitales grises + valeur en gros gras +
sous-titre gris, en grille 2 colonnes. Vaut pour TOUTES les stats de
l'app (Performance §6.x, stats row du détail workout §6.3, Share Lift Card
§6.7) — pas un format par écran.

**Conventions de header.** Un écran de tab porte son titre à gauche et ses
actions à droite (Home : salutation + 3 icônes, §6.2 ; Profil : 3 icônes
share/edit/settings, §6.7). Les sheets portent un titre court et une
croix de fermeture à droite.

### 6.1 Nav restructure
Remplace les 5 tabs actuels (`index`/`log`/`progress`/`discover`/`profile`) :
**Home** · **Log** · **Search** (sous-tabs "Feed"/"Discover" en pills texte) ·
**Performance** (= `progress.tsx`) · **Shop** (v2, vide en v1 — marketplace
coach) · **Actions** ("...", bottom-sheet, pas un écran). Profil retiré de
la tab bar → icône avatar en haut à droite de Home.

> ⚠️ **Révision 2026-07-24** : `log.tsx` avait été initialement retiré de la
> tab bar (remplacé par le sheet "Add Exercise" + l'écran Exercises via
> Actions), pour coller à l'image de référence (4 icônes + "..." sans Log
> distinct). Lionel a demandé de le remettre visible dans la pilule —
> `app/(tabs)/_layout.tsx` l'affiche désormais en 2e position (après Home).
> Toujours aussi accessible via Actions → Exercises (même fichier/route,
> les deux chemins coexistent sans duplication de code).

### 6.2 Home (`app/(tabs)/index.tsx`)
- Header : "Today ▾" + salutation ("Good Morning"/"Good Afternoon"...) à
  gauche, 3 icônes à droite — notifications (badge rouge), messages,
  avatar profil.
- "Today ▾" ouvre un calendrier mensuel (nav mois ← →, jour sélectionné en
  bleu accent, bouton "Done") avec un indicateur discret sous les jours
  ayant une séance loggée.
- Bandeau conseil dismissible (ex. "Hold the button below to load
  previous workouts") + croix pour le fermer, état persisté.
- CTA principal : carte large "Start Workout" / sous-titre "Plan your next
  session" + bouton circulaire flèche.
- Module streak "Last 2 Weeks" : grille 7 jours × 2 semaines (S-M-T-W-T-F-S),
  jour courant marqué, compteur "active days" en tête de section.
- Pas de card "split actif" (le concept Splits/Routines est retiré, voir
  §6.4).

### 6.3 Écran détail Workout (ouvert depuis feed/profil)
Ordre vertical fixe : header auteur (avatar+handle) + date → titre →
stats row (Duration / Exercises / PRs) → row social (Likes / Comments) →
**photo si postée** (optionnelle, jamais obligatoire au moment du post) →
schéma anatomique → liste d'exercices.

- **PR** (stat "PRs") = volume max historique atteint sur cet exercice
  (pas poids max, pas 1RM estimé — distinct de la logique 1RM déjà en
  place pour le tier payant, CLAUDE_LYXO_V3.md Tier 2 item 2).
- **Schéma anatomique** : 2 assets fixes (vue face + vue dos), sélection
  logique selon les muscles travaillés dans la séance — pas un seul asset
  qui pivote. Palette de highlight par groupe musculaire **dédiée et
  indépendante** de la palette UI Braise (ex. orange jambes, rose dos dans
  la référence) — exemptée de la règle "palette inchangée" car c'est une
  couche de data-viz, pas du chrome d'app. Les groupes musculaires
  affichés doivent utiliser les mêmes slugs `muscle_group` que la table
  `exercises`/`lib/exercise-labels.ts` (pas une taxonomie parallèle) — la
  correspondance couleur reste à construire, rien n'existe encore
  (`components/MuscleFilterChips.tsx` ne fait que du style actif/inactif).
- **Liste d'exercices** : format adaptatif — sets/reps/poids pour la
  musculation classique ; durée/distance/allure/calories/incline pour le
  cardio/circuit (pas un tableau unique pour tout).

### 6.4 Splits / Routines / Programs — collapsed
Le plan initial (Splits = structure hebdo type Push/Pull/Legs, Routines =
séances individuelles, les deux prévus v1) est abandonné. Les deux
fusionnent en un seul concept futur, **"Programs"** — programme complet
acheté à un coach, **v2 uniquement** (marketplace, tab Shop). En v1 :
aucun tab Splits sur le Profil (seulement Workouts), aucun item Routines
dans le menu Actions, aucune card split actif sur Home.

### 6.5 Menu Actions ("...")
v1 : Exercises (réutilise l'UI du sheet Add Exercise en plein écran),
Physique (photos de progression uniquement — pas de chiffres, ceux-ci
restent des stat cards dans Performance), Feedback (formulaire in-app →
support client). Visibles mais grisés/désactivés (stubs v2) : Connect to
Health (Google Fit Android / Apple Health iOS), Nutrition Tracking,
Programs (§6.4). Abandonné définitivement, aucune version : Import.

### 6.5bis Flux de logging de séance (AJOUTÉ 2026-07-27)
> Décisions du brainstorm 2026-07-24 jamais écrites ici — §6 passait
> directement de Actions à Settings, alors que ROADMAP 2.3-2.11
> implémente précisément ce flux. Numérotation en "bis" pour ne pas
> décaler §6.6-§6.8, référencés depuis API_SPEC.md §4.7.

**Priming notification.** Écran interne (avatars superposés, "Stay in the
loop!", boutons *Enable Notifications* / *Not Now*) AVANT le prompt OS
natif — jamais le prompt système en premier. Un refus sur l'écran interne
ne consomme pas l'unique demande système, qu'Android/iOS ne réaffichent
pas.

**Écran de création de séance.** Compteur "0 sets / 0 exercices" en tête +
bouton "Add Exercise". ⚠️ L'action "Gym Check-in" de la référence est
**abandonnée** — ne pas la réintroduire en la voyant dans les captures.

**Sheet "Add Exercise" — 4 éléments, tous retenus :**
1. Onglets **All / Recent / Custom**.
2. Chips de catégorie par groupe musculaire (mêmes slugs `muscle_group`
   que `exercises` / `lib/exercise-labels.ts` — pas de taxonomie
   parallèle, cf. §6.3).
3. **"+ Create"** inline pour un exercice custom, sans quitter le sheet.
4. Sélection **multiple** par toggle à coche — c'est le mécanisme de
   sélection lui-même, pas une option : on ajoute N exercices en une
   passe, puis on valide.

⚠️ **Composant partagé, pas un écran.** La même UI sert trois surfaces :
le sheet dans le flux de séance, l'onglet **Log** de la tab bar (§6.1,
révision 2026-07-24) et **Actions → Exercises** en plein écran (§6.5). Un
seul composant, une seule liste, un seul jeu de filtres — toute logique
de sélection écrite "pour le sheet" doit rester agnostique de sa surface
d'affichage.

Contraintes de données à respecter dans ce sheet :
- **Recent** n'a aucune source avant ROADMAP 2.6 (`workouts`/
  `workout_exercises`/`sets`) : état vide §6.0 jusque-là, pas un onglet
  masqué (la structure à 3 onglets est définitive).
- **Custom** lit `custom_exercises` (DATA_MODEL §2.4). La limite de 5 en
  gratuit est posée **en base** (`enforce_custom_exercise_limit()`,
  ROADMAP 2.2) — l'UI doit donc traiter `CUSTOM_EXERCISE_LIMIT_REACHED`
  comme une réponse normale et attendue du "+ Create", avec un message
  explicite et un renvoi vers Lyxo+, jamais comme une erreur technique.
  Ne jamais dupliquer le compte des 5 côté client comme s'il faisait
  autorité : la base tranche, le client affiche.

**Table de logging active — adaptative par type d'exercice**, pas un
tableau unique : colonnes séries/reps/poids pour la musculation ;
colonnes rounds / secondes de travail / secondes de repos pour le
cardio/circuit. Le composant de saisie poids/reps est spécifié en ROADMAP
2.4 (`WeightRepsInput`, blocs égaux kg|reps, steppers unit-aware 56px
min, clavier custom sticky).

**Photo + légende post-séance : optionnelle et skippable.** Jamais un
passage obligé pour terminer une séance — cf. §6.3, la photo n'apparaît
dans le détail workout que si elle a été postée.

**Écran de fin de séance : minimal** (effet peak-end, ROADMAP 2.11) —
grand compteur + une ligne de félicitation courte. ⚠️ Pas de récapitulatif
de stats sur cet écran : c'est un choix, pas un oubli.

### 6.6 Settings
v1 actif : Theme (Auto/Light/Dark segmented), unité poids (KG/LBS),
unité distance (KM/MI), Auto Complete Sets. Visibles mais grisés (dépendent
du Health sync v2) : Write Workouts, Write Body Metrics, Health
Suggestions.

### 6.7 Profil
Tab unique Workouts (pas de tab Splits, §6.4). Compteurs Followers /
Following / **Partners** (3 relations distinctes — Partners = matchs Gym
Matching, §6.8, différent du Follow). Pas d'icône plante/gamification.
Edit Profile garde Username/Handle/Bio/**Gym**/**Instagram Handle** ; pas
de champ University ni de Badge Selector. Share Lift Card : nom/handle/
nombre de partners + stats d'entraînement (streak, volume, workouts
logged) — plus riche que le minimal de la référence.

### 6.8 Gym Matching + chat Partners (override V1, voir ROADMAP Phase 5bis)
Swipe matching entre lifters compatibles → relation "Partners" distincte
du Follow. Chat in-app avec dossier "Requests" (style Instagram) pour les
messages entrants hors-Partners : accord explicite requis avant de
rejoindre l'inbox principale — un Partner matché va direct en inbox. Ce
système était classé non-goal V2+ (CLAUDE_LYXO_V3.md §18 / PROJECT_BRIEF.md
non-goal 3) avant d'être explicitement débloqué pour la V1 le 2026-07-24 —
voir ces deux fichiers pour la trace de la décision.

---

*Documents liés : DATA_MODEL.md (schémas complets) · API_SPEC.md
(contrat des routes) · ARCHITECTURE.md (vue système) · CONVENTIONS.md
(règles de code détaillées, style, lint).*
