# CONVENTIONS.md — LYXO · Coding Standards
# Version : 1.0 — fin Juillet 2026
# Rôle : les règles de code non négociables. CodeRabbit vérifie une partie
# de ce fichier automatiquement (.coderabbit.yaml en pointe une copie
# condensée) ; ESLint/Prettier vérifient l'autre partie. Ce document est
# la référence humaine complète des deux.

---

## 1. LANGUAGE / FRAMEWORK VERSION PINS

> Épinglé = jamais mis à jour "en passant" pendant une session de feature.
> Toute montée de version majeure est une tâche dédiée, isolée, testée.

| Techno | Version épinglée | Note |
|---|---|---|
| Node.js | 20 LTS | Backend + tooling |
| TypeScript | ^5.4 (strict mode ON partout) | `"strict": true` non négociable dans tsconfig |
| Expo SDK | dernière stable au démarrage du projet, notée dans `app.json` | Vérifiée compatible avec toutes les libs natives avant tout upgrade |
| React Native | version bundlée par l'Expo SDK ci-dessus | Ne jamais forcer une version RN hors de celle d'Expo |
| NativeWind | v4 (stable) — **jamais v5** (pre-release, §A1 IMPLEMENTATION_PLAN) | |
| Tailwind CSS | **^3.4.17** — **jamais v4** (incompatible NativeWind v4) | Piège documenté §A1 |
| WatermelonDB | dernière stable compatible New Architecture | Vérifier compat à chaque upgrade Expo SDK |
| Prisma | dernière stable | Schéma généré via `db pull`, jamais écrit à la main en premier (§20.5) |
| Express | 4.x stable | Pas de migration 5.x tant que non LTS |
| Google Play Billing Library | **v8+ obligatoire au 31/08/2026** (§19.14) | Géré via RevenueCat — vérifier la version embarquée par le SDK au moment de l'intégration Phase 9 |
| Android Target SDK | **= la deadline Google Play en cours** (Google impose targetSdkVersion N-1 chaque année pour toute soumission) | Vérifié à CHAQUE upgrade Expo SDK (Expo suit généralement la deadline) ET avant chaque soumission — un target SDK périmé = upload REFUSÉ. Rappel lié : `POST_NOTIFICATIONS` est une permission RUNTIME depuis Android 13 (flow de demande spécifié dans PRD §1.4bis) |

Toute lib ajoutée en cours de projet : installée via **Expo MCP
`add_library`** (versions garanties compatibles SDK, §A1) plutôt qu'un
`npm install` naïf.

---

## 2. LINTING / FORMATTING

- **ESLint** : config Expo par défaut + règles TypeScript strict
  (`@typescript-eslint/recommended`). Aucun `// eslint-disable` sans
  commentaire expliquant pourquoi juste au-dessus.
- **Prettier** : `prettier-plugin-tailwindcss` actif (tri automatique des
  classes NativeWind) — installé dès le Bloc A1.
- **Pré-commit** : lint + typecheck bloquants avant tout commit (via
  husky ou équivalent léger — pas de commit qui casse le typecheck)
  + **gitleaks** (détection de secrets — aucun token/clé ne part dans un
  commit ; procédure si fuite : ENV_SETUP §1.6).
- **CI (GitHub Actions)** : lint + typecheck + tests unitaires sur
  chaque PR — obligatoire avant merge, CodeRabbit review en parallèle.
- **TypeScript strict** : `any` interdit sauf justification en commentaire
  ; préférer `unknown` + narrowing. Pas de `// @ts-ignore` silencieux —
  toujours `// @ts-expect-error: <raison>`.

---

## 3. COMMIT MESSAGE STYLE

Format **Conventional Commits**, en français pour le corps si utile,
type en anglais standard :

```
<type>(<scope>): <description courte, impératif, minuscule>

[corps optionnel — pourquoi, pas juste quoi]

[footer optionnel — refs #issue, BREAKING CHANGE:]
```

Types autorisés : `feat` · `fix` · `refactor` · `test` · `docs` ·
`chore` · `perf` · `style` (formatage pur, zéro impact logique).

Scopes typiques : `logger`, `sync`, `social`, `coach`, `billing`,
`auth`, `design-system`, `ci`.

Exemples :
```
feat(logger): ajoute steppers unit-aware kg/lbs
fix(sync): corrige LWW sur deletedAt prioritaire
refactor(pr-detection): extrait la règle de plausibilité en fonction pure
chore(deps): pin tailwindcss à 3.4.17
```

Interdits : messages du type `wip`, `fix bug`, `update`, ou tout message
qui ne dit pas QUOI a changé. Un commit = une unité logique cohérente
(pas 15 fichiers sans rapport dans un seul commit "gros refacto").

---

## 4. FILE NAMING PATTERNS

(Détail complet dans LLD.md §5 — rappel condensé ici)
- Composants : `PascalCase.tsx`
- Logique/hooks/services : `kebab-case.ts`
- Types/interfaces : `PascalCase`, jamais préfixés `I`
- Tables/colonnes SQL, champs API JSON : `snake_case`
- Codes d'erreur : `SCREAMING_SNAKE_CASE`
- Tests : colocalisés, `<fichier>.test.ts(x)`
- Migrations : `YYYYMMDDHHMMSS_verbe_objet.sql`

---

## 5. PATTERNS À SUIVRE

### 5.1 Repository-like pour WatermelonDB
Pas de requêtes WatermelonDB éparpillées dans les composants. Chaque
modèle a ses méthodes de requête centralisées (ex. `Workout.recentFor
(profileId, limit)`), appelées depuis les hooks — un composant ne
construit jamais une query WatermelonDB brute inline.

### 5.2 Hooks pour toute logique réactive
`useWorkoutStore`, `useSyncStatus`, `useOfflineWorkouts(profileId)` —
la donnée réactive passe TOUJOURS par un hook, jamais par un accès
direct au store/DB dans le corps d'un composant. Ça isole le composant
de l'implémentation (Zustand vs WatermelonDB vs API) et facilite les
tests.

### 5.3 Fonctions pures pour toute logique métier testable
`pr-detection.ts`, `units.ts`, `billing-region.ts`, `conflict-
resolution.ts` : zéro effet de bord, zéro appel réseau, zéro accès direct
à une DB. Entrée typée → sortie typée. C'est ce qui rend les tests
unitaires (DoD point 5) triviaux à écrire.

### 5.4 Un seul point de vérité pour les erreurs (backend)
Toute route lève une `AppError(code, message, details?)` — jamais un
`res.status(x).json(...)` construit à la main dans un controller. Le
middleware `error-handler` est le seul endroit qui sérialise (API_SPEC
§2). Ajouter un nouveau code d'erreur = l'ajouter dans `lib/errors.ts`,
jamais l'inventer inline dans une route.

### 5.5 Config centralisée pour les limites freemium
Une seule source (`config/limits.ts` ou table `feature_flags`/config
équivalente) pour tout seuil business (90 jours d'historique, 5 exercices
custom, 3 clients Coach Découverte...). Jamais un nombre magique
`if (days > 90)` dispersé dans 5 fichiers différents.

### 5.6 i18n dès le premier caractère
Aucune string UI en dur, même en français, même "juste pour tester" —
DoD point 3, non négociable. `t('workout.validate_set')`, jamais
`"Valider la série"` inline dans le JSX.

### 5.7 Composants de perf par défaut (ajout audit deep-tech)
- **Listes longues** (feed, historique, bibliothèque d'exos, leaderboard) :
  `FlashList` (Shopify) par défaut — jamais `FlatList`/`ScrollView.map`
  sur des listes non bornées. Budget : 60 fps sur le device ≤ 3 Go.
- **Images/GIFs** : `expo-image` EXCLUSIVEMENT (cache disque+mémoire
  natif, `cachePolicy`, decode WebP, `recyclingKey` pour les listes) —
  jamais `<Image>` RN core pour du contenu distant, jamais de cache
  maison via expo-file-system (le composant ExerciseLoader §17.4 de
  CLAUDE.md est PÉRIMÉ sur ce point). La logique Data Saver (URL `.jpg`
  au lieu de `.gif`) reste, appliquée à la prop `source`.

### 5.8 Cycle de vie : zéro listener orphelin (anti memory-leak)
- Tout `addListener` / `subscribe` / `setInterval` / `setTimeout` créé
  dans un composant DOIT retourner son cleanup dans le MÊME `useEffect`.
- Les listeners GLOBAUX (NetInfo, AppState) vivent UNIQUEMENT dans
  `lib/sync/engine.ts`, en singleton initialisé une fois au boot — jamais
  dans un composant (sinon : listeners empilés à chaque remontage = sync
  déclenchée N fois, OOM kill silencieux sur 3 Go de RAM, invisible dans
  Sentry).
- Test de torture Bloc C (ajout DoD) : 20 allers-retours d'écran
  Logger↔Accueil + vérification profiler mémoire (pas de croissance
  monotone).

### 5.9 Idempotence explicite sur toute route qui peut être rejouée
Sync push, checkout, webhooks : toujours vérifier l'état AVANT d'agir
(§4.2bis BILLING_FLOW, §3.1 API_SPEC `DUPLICATE_REQUEST`). Un rejeu
n'est jamais une erreur qui casse, c'est un no-op documenté.

---

## 6. PATTERNS À ÉVITER

- **❌ Prop drilling profond** — au-delà de 2-3 niveaux, passer par un
  hook/store plutôt que de faire remonter des props sur 5 composants.
- **❌ `useEffect` comme réponse par défaut** — la majorité des besoins
  de synchronisation d'état se résolvent avec les hooks WatermelonDB
  réactifs (`withObservables`) ou un state dérivé, pas un `useEffect`
  qui recopie une prop dans un state local.
- **❌ Logique métier dans les composants JSX** — un composant appelle
  une fonction de `lib/`, il ne réimplémente jamais une règle métier
  inline (le composant Workout Logger ne recalcule pas lui-même si un
  PR est éligible socialement — il appelle `pr-detection.ts`).
- **❌ `console.log` en production** — Sentry (client) / logger structuré
  (backend) uniquement. Un `console.log` qui traîne est un signal
  CodeRabbit à corriger avant merge.
  **Logger structuré backend = pino** (JSON, niveaux par NODE_ENV), avec
  rédaction PII obligatoire :
  ```ts
  // lib/logger.ts
  import pino from 'pino';
  export const logger = pino({
    redact: ['phone_number', '*.phone_number', 'email', '*.email',
             'push_token', '*.push_token', 'req.headers.authorization',
             'req.headers["x-admin-key"]'],
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  });
  ```
  Un `logger.info(req.body)` sur /billing/checkout ne doit JAMAIS écrire
  un numéro de téléphone en clair chez Render (SECURITY_NOTES §4).
- **❌ Colonnes dérivées stockées** — le piège `is_premium` déjà corrigé
  (§20.1) : ne JAMAIS stocker physiquement une valeur calculable de
  manière fiable à la volée depuis d'autres tables. Si un agent propose
  une colonne "pour la perf", la réponse par défaut est non — mesurer
  d'abord un vrai problème de perf avant d'introduire une redondance.
- **❌ DELETE SQL physique sur les tables SYNC** — toujours `deleted_at`
  (§18.3). Un `DELETE FROM workouts` est un bug, pas une feature.
- **❌ Nouvelle dépendance sans passer par Expo MCP `add_library`** —
  évite les incompatibilités de version SDK silencieuses.
- **❌ Introduire une lib du stack "fermé" écarté** (Tamagui, Unistyles,
  Redux, Docker local, Flutter...) sans une nouvelle décision écrite et
  datée — voir ARCHITECTURE.md §3 pour la liste et les raisons déjà
  tranchées.
- **❌ Traduire un message d'erreur côté API** — la traduction vit
  côté client via le `code` (API_SPEC §2). L'API ne renvoie jamais de
  texte pré-traduit FR/EN.
- **❌ Complexité anticipée non demandée** — pas de queue/Redis/
  microservice "pour plus tard" avant que le volume ne le justifie
  (§16.6). Le MVP reste aussi simple que le permet le cahier des charges
  actuel, pas celui imaginé pour 100 000 users.

---

*Documents liés : LLD.md (structure et responsabilités) · API_SPEC.md
(format d'erreur détaillé) · ARCHITECTURE.md (stack et raisons) ·
CLAUDE_LYXO_V3.md (règles produit/techniques source, §16-20).*
