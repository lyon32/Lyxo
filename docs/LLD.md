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
│   ├── (auth)/                   # arbre mis à jour — audit doc passe 6 (fiche 19/23)
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
│   ├── (tabs)/
│   │   ├── _layout.tsx           # les 5 onglets (Accueil·Log·Progrès·Discover·Profil)
│   │   ├── index.tsx             # Accueil
│   │   ├── log/
│   │   │   ├── index.tsx         # sélection séance
│   │   │   ├── [workoutId].tsx   # Workout Logger
│   │   │   └── rest-timer.tsx
│   │   ├── progress.tsx
│   │   ├── discover.tsx          # placeholder V1, actif S13+
│   │   └── profile/
│   │       ├── index.tsx
│   │       └── [userId].tsx      # profil d'un autre user
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

*Documents liés : DATA_MODEL.md (schémas complets) · API_SPEC.md
(contrat des routes) · ARCHITECTURE.md (vue système) · CONVENTIONS.md
(règles de code détaillées, style, lint).*
