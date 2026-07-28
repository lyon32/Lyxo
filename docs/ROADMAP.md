# ROADMAP.md — LYXO · Implementation Roadmap (format tâches)

# Version : 1.0 — fin Juillet 2026

# Rôle : IMPLEMENTATION_PLAN.md raconte la stratégie par bloc (A→G) ; ce

# document la DÉCOUPE en tâches atomiques, calibrées pour tenir dans UNE

# session Claude Code cohérente. Coche au fur et à mesure. Si une tâche

# déborde manifestement d'une session, elle est déjà sur-découpée ici —

# ne pas la refusionner avec la suivante.

> Règle d'or : une session = une tâche cochée. Si Claude Code termine en
> avance, il consulte IDEAS_BACKLOG.md ou s'arrête — il ne commence pas
> la tâche suivante à la volée dans la même session sans validation.

> ⚠️ TABLE DE CORRESPONDANCE DES PHASES (audit doc — deux numérotations
> coexistent dans le corpus) :
>
> - **Phases ROADMAP (ce fichier)** : 1 Fondations · 2 Logger · 3 SYNC ·
>   4 Progrès · 5 Social · 6 Coach · 7 Beta · 8 Discover · 9 Billing ·
>   10 Marketplace.
> - **Phases PRODUIT (docs billing/PRD/briefs)** : P1 = MVP (Phases 1-7) ·
>   P2 = Discover/polissage (Phase 8) · P3 = monétisation (Phase 9).
>   Toute mention "Phase 3" dans PRICING/BILLING_FLOW/API_SPEC/ENV_SETUP =
>   **P3 = Phase 9 ici** — JAMAIS la Phase 3 SYNC de ce fichier.

---

## PHASE 1 — FONDATIONS (Bloc A, IMPLEMENTATION_PLAN)

- [X]  **1.1** Setup monorepo/2-repos, Expo TypeScript strict, ESLint/Prettier,
  i18next câblé (fichiers fr.json/en.json vides), NativeWind v4 recette
  exacte (tailwind 3.4.17, babel, metro, types) — écran de test Braise.

  + expo-router (layout (tabs) 5 onglets), lucide-react-native, CI
    GitHub Actions (lint+typecheck sur PR). Repo app poussé sur
    github.com/lyon32/Lyxo. Backend (Node/Express) reste à faire —
    voir 1.3.

  **Déviation documentée (audit doc, trouvée non tracée à l'écrit)** :
  `react-native-reanimated` est en v4 (`^4.5.2`), pas v3 comme fixé par
  CLAUDE_LYXO_V3.md §2 ("Animations | React Native Reanimated 3"). Choix
  imposé par Expo SDK 57 (New Arch) — NativeWind v4/reanimated peer deps
  de ce SDK n'exposent plus de branche v3 compatible — d'où aussi l'ajout
  de `react-native-worklets` en dépendance directe (peer explicite de
  reanimated v4, cf. note 2026-07-22). Aucun impact fonctionnel constaté ;
  §2 du CLAUDE.md est corrigé en conséquence pour refléter reanimated v4
  comme le choix réel imposé désormais par la version d'Expo.
- [X]  **1.2** Installer l'outillage Claude Code : Context7, Resend MCP,
  Maestro MCP + CLI, GitHub MCP, Supabase MCP, Expo MCP, CodeRabbit
  (GitHub App + .coderabbit.yaml), EAS CLI. Expo MCP et Resend MCP en
  attente d'auth OAuth navigateur (`/mcp` prochaine session) — le reste
  est actif via Bearer token ou CLI local vérifié.
- [X]  **1.3** Backend : squelette Node/Express TypeScript, healthcheck,
  Sentry (app + backend). Monorepo : backend/ dans lyon32/Lyxo
  (décision session, déviation assumée de la reco 2-repos). Sentry
  wired (lib/sentry.ts app + backend, no-op tant que SENTRY_DSN/
  EXPO_PUBLIC_SENTRY_DSN absents — pas de projet Sentry créé). Render
  déployé (staging) : service `lyxo-api` (Frankfurt) live sur
  https://lyxo-api.onrender.com, healthcheck `/v1/health` vérifié en
  prod (200 `{"status":"ok"}`).
- [X]  **1.4** Supabase CLI dans le repo (`supabase init`,
  supabase/config.toml), lien projet fait (`supabase link --project-ref gyslysnysrswzefmvpxw`), script
  `supabase:generate-types` (backend/package.json) exécuté avec
  succès via la CLI liée — backend/src/types/supabase.ts régénéré.
- [X]  **1.5** Migration + RLS : `profiles` (tous les champs DATA_MODEL
  §2.1, y compris `goal`/`preferred_split`/`weekly_goal`) + `devices`.
  Projet Supabase canonique : **lyxo** (gyslysnysrswzefmvpxw,
  eu-west-1, org lyon) — un doublon "Lyxo" (pbrceloazpnstskjbipa,
  eu-central-1) existe dans le même org, laissé de côté volontairement
  (décision session) : ne pas l'utiliser par erreur. Trigger
  `handle_new_user` (username depuis raw_user_meta_data sinon
  fallback) testé. RLS testée manuellement (anon bloqué sur profil
  privé, propriétaire OK, autre user bloqué ; colonnes
  billing_region/trial_*/is_reviewer non éditables côté client via
  GRANT/REVOKE colonne par colonne). Advisor sécurité : 0 warning
  après durcissement (search_path + RPC publique sur les fonctions
  trigger).
- [X]  **1.5bis** Écrans langue (1bis) + Welcome/offline fusionné (1ter,
  photo hero réelle — PHOTO HERO EXCEPTION, UI prompt) + onboarding
  PRÉ-auth (Objectif 3 cards, Split PPL/UL/FB — UI prompt écran 2) :
  stockage AsyncStorage (`onboarding_goal`/`onboarding_split`, LLD §4).
  Fait : app/onboarding/(language|welcome|goal|split).tsx,
  lib/onboarding-storage.ts, components/(OnboardingProgress|
  SelectableCard).tsx, gate racine (lib/use-onboarding-gate.ts,
  redirection depuis Accueil si langue jamais choisie), placeholder
  app/auth (réel à 1.6). Assets de marque réels utilisés (LX monogramme

  + wordmark LYXO blanc-sur-transparent, assets/brand/) — **PHOTO HERO
    MANQUANTE** : l'écran Welcome n'a pas de vrai stock photo (jamais IA
    générée par règle projet) — fond sombre uni en attendant qu'un vrai
    asset soit fourni. Note poids : les 2 PNG de marque copiés (~650-730
    Ko chacun) ne sont pas encore optimisés/recadrés (aucun outil image
    dispo en session) — à revoir avant la mesure DoD "< 30 Mo à
    l'installation" (PROJECT_BRIEF §3).
- [X]  **1.6** Auth : email + Google (Supabase Auth) — **Android V1 :
  PAS d'Apple Sign-In** (Apple réservé au build iOS, phase
  ultérieure post-Android — PROJECT_BRIEF non-goal 10, décision
  fiche 9 comité, UI prompt écran 3). Écrans signup/login (UI prompt
  écrans 3/3bis) + reset password (écran 3quater, Resend en SMTP
  custom Supabase dès ce bloc — fiche 14 comité). Objectif/split
  pré-auth (AsyncStorage) poussés via PATCH post-login (API_SPEC
  §4.2) — pas de sélecteur langue ici (déjà fait sur l'écran 1bis,
  avant ce bloc) ; unité kg/lbs regroupée à la tâche 1.8 (post-auth).

  Fait : backend requireAuth (JWKS ES256, lib/auth.ts — PAS de secret
  legacy, voir correction ENV_SETUP §1.2), routes GET/PATCH
  /v1/profiles/me + GET /v1/profiles/check-username (rate-limited,
  zod, allowlist stricte 403 hors champs autorisés), lib/supabase-admin
  (service_role, lazy — ne crashe plus le boot si absent). App :
  lib/supabase.ts (**SecureStore** + PKCE — correction de cette ligne :
  la session Supabase est stockée via `expo-secure-store`, jamais
  AsyncStorage, conforme SECURITY_NOTES.md §3bis.1 ; la mention
  "AsyncStorage" plus haut dans cette tâche concerne uniquement le
  stockage pré-auth des choix d'onboarding, non sensible), lib/auth-store.ts (zustand),
  push-onboarding-choices.ts (PATCH post-login idempotent), écrans
  app/auth/(index=signup|login|forgot-password|reset-password).tsx,
  gate racine réel (needs-onboarding/needs-auth/ready).

  **Déviation documentée** : accès DB backend via supabase-js/
  service_role au lieu de Prisma (décision session — évite un mot de
  passe Postgres à récupérer maintenant ; Prisma reste possible plus
  tard pour des besoins plus complexes).

  ⚠️ **Config manuelle Supabase Dashboard requise avant que l'auth
  fonctionne réellement** (aucune n'est faisable depuis une session
  headless) :

  1. `SUPABASE_SERVICE_ROLE_KEY` (Project Settings > API Keys) → env
     Render (`lyxo-api`) + `.env` local.
  2. Authentication > Providers > Google : activer + Client ID/Secret
     (Google Cloud Console) + redirect URI Supabase.
  3. Authentication > URL Configuration : autoriser `lyxo://auth/ callback` et `lyxo://auth/reset-password`.
  4. Authentication > Providers > Email : désactiver "Confirm email"
     (PRD 3.1, confirmation désactivée en V1) — sinon signUp ne crée
     pas de session immédiate (géré côté code, `needsEmailConfirmation`,
     mais l'UX voulue suppose ce réglage OFF).
  5. Authentication > SMTP : brancher Resend (domaine lyxo.app à
     vérifier, ou domaine sandbox Resend en attendant) pour l'email de
     reset password.

  **MàJ 2026-07-23 — vérifié en conditions réelles** (dev client Android
  sur émulateur + tests curl avec un vrai JWT signé) : SUPABASE_SERVICE_
  ROLE_KEY posée sur Render ✅, GET/PATCH /v1/profiles/me fonctionnent
  bout en bout avec un vrai token (vérification JWKS OK), trigger
  handle_new_user OK (username repris depuis raw_user_meta_data), 403
  bien renvoyé sur champ hors allowlist (billing_region testé). Ajout
  polyfill WebCrypto (lib/webcrypto-polyfill.ts, expo-crypto +
  react-native-get-random-values) — Hermes n'a pas crypto.subtle,
  supabase-js retombait sur PKCE "plain" au lieu de "S256" sans ça.
  **"Confirm email" corrigé et reconfirmé** (2e test signup : session
  immédiate, email_confirmed_at rempli automatiquement, profil créé,
  GET /v1/profiles/me OK).

  **Google OAuth testé sur device réel et fonctionnel** (Client Secret
  Google Cloud Console corrigé — le mauvais avait été collé au départ).
  Bug de course PKCE résolu (app/auth/callback.tsx + signInWithGoogle
  peuvent tous les deux tenter d'échanger le même code selon que
  l'interception WebBrowser réussisse ou non — repli sur vérification
  de session existante). Boutons retour corrigés/ajoutés sur tous les
  écrans auth + onboarding (goBackSafely, lib/safe-back.ts — router.back()
  plantait sans historique de navigation, ex. après déconnexion).
  Lien "Log in" du Welcome corrigé (pointait vers Inscription).

  ⚠️ **Reset password : limite structurelle découverte (2026-07-23),
  pas un bug de notre code.** Le lien email Supabase redirige via
  `https://.../auth/v1/verify?...&redirect_to=lyxo://auth/reset-password`
  — Chrome/mobile (et les liens Gmail via leur wrapper google.com/url)
  **refusent de suivre une redirection HTTP serveur vers un schéma
  personnalisé** (`lyxo://`), même lien copié/ouvert directement : page
  blanche, rien ne se passe. Confirmé identique pour un compte Google et
  un compte email classique — donc bien un problème de transport, pas
  lié au provider. **Solution réelle : App Link Android vérifié
  (`https://lyxo.app/reset/{token}`, assetlinks.json + intentFilters
  app.json) au lieu du schéma `lyxo://`** — nécessite un minimum de
  présence web sur lyxo.app (déjà listé comme devant exister,
  PROJECT_BRIEF non-goal 6 : "/reset/{token}"), pas encore construit.
  Tâche dédiée à créer, distincte de 1.6. **Confirmé par test ADB direct**
  (`adb shell am start -a android.intent.action.VIEW -d "lyxo://auth/ reset-password?code=..."`) : l'écran réagit correctement à un deep
  link reçu (tentative d'échange, échec propre sur code invalide,
  écran "Link expired" + "Resend email" affiché, pas de crash) — le
  code app (app/auth/reset-password.tsx) est donc sain, seul le
  transport email→app via schéma personnalisé est en cause.
- [X]  **1.7** billing_region : détection pays déclaré + IP (`lib/ billing-region.ts` + intégration à l'onboarding), stockage serveur.

  Fait : backend/src/lib/billing-region.ts (fonction pure,
  computeBillingRegion), backend/src/lib/geo-ip.ts (geoip-lite, offline,
  pas d'appel réseau externe), backend/src/config/billing-regions.ts
  (AFRICA_MOMO_COUNTRIES = ['CM'] uniquement en V1 — CI/Sénégal = Phase 3
  produit, PRICING.md), backend/src/lib/countries.ts (liste fermée ISO
  3166-1 alpha-2, réutilisable par le country picker de 1.8). Nouvelle
  route PATCH /v1/profiles/me/billing-region (documentée API_SPEC.md
  §4.2) — calcul et stockage strictement serveur, jamais accepté du
  client (cohérent avec le 403 déjà en place sur PATCH /v1/profiles/me).
  `app.set('trust proxy', true)` ajouté (bug latent découvert : sans ça,
  req.ip derrière le proxy Render ne reflète pas le vrai client, cassait
  aussi silencieusement le rate-limit par IP de check-username depuis
  1.6). App : lib/compute-billing-region.ts appelé après chaque
  SIGNED_IN (auth-store.ts) — pas encore de pays déclaré tant que
  l'écran country picker (1.8) n'existe pas, IP seule en pratique pour
  l'instant ; recalcul à chaque connexion accepté comme simplification
  temporaire (convergent tant qu'aucun pays n'est déclaré), à
  reconsidérer une fois 1.8 livré pour respecter à la lettre "jamais
  recalculé en douce" (BILLING_FLOW.md §2).

  Testé en local avec un vrai JWT signé : sans pays déclaré → intl_iap
  (IP localhost) ; declared_country=CM → africa_momo ; declared_country=
  FR → intl_iap ; code pays invalide → 400 VALIDATION_ERROR. Bug de
  dépendance corrigé au passage : `@supabase/supabase-js` plantait à la
  construction du client sur Node 20 (pas de WebSocket natif, requis
  seulement depuis Node 22, pour son sous-client Realtime jamais
  utilisé) — fourni `ws` en transport (lib/supabase-admin.ts).
- [X]  **1.8** Onboarding POST-auth (écran 2bis, UI prompt) : pays +
  unité kg/lbs, carte Data Saver, annonce règle 90 jours, pseudo
  avec suggestions (filtre §Q10). Suite visuelle sans jauge de
  progression (les 3 étapes construites en 1.5bis sont déjà
  cochées — ces écrans sont administratifs, pas "de construction").
  `app/onboarding/onboarding-details.tsx` (nom exact du fichier fixé par
  LLD.md §1.1) : sélecteur pays (`lib/countries.ts`, miroir client de la
  liste fermée backend + noms localisés via `i18n-iso-countries`,
  `components/CountryPickerModal.tsx` avec recherche), toggle kg/lbs,
  carte Data Saver (toggle `data_saver`), carte règle 90 jours (texte
  §18.6 exact), champ pseudo conditionnel — affiché uniquement si
  `username` porte encore le préfixe `lyxo_` du fallback OAuth
  (`handle_new_user`), donc jamais redemandé si déjà saisi à l'écran 3.
  Filtre Q10 (`lib/pseudo-filter.ts`) : liste courte de recommandation
  FR/camfranglais, jamais un blocage dur, suggestions neutres affichées
  sous le champ. Soumission : `PATCH /v1/profiles/me/billing-region`
  (declared_country) puis `PATCH /v1/profiles/me` (weight_unit,
  data_saver, username si modifié) → `/(tabs)`.
  **Bug corrigé au passage (dette notée depuis 1.7)** : `billing_region`
  était recalculé à CHAQUE `SIGNED_IN` (`lib/auth-store.ts`) au lieu
  d'une fois à l'inscription (BILLING_FLOW.md §2 : "jamais recalculée en
  douce") — l'appel a été retiré du listener et déplacé dans la
  soumission de cet écran, seul vrai point de déclenchement unique
  maintenant qu'un pays déclaré existe.
  Gate de navigation étendu (`lib/use-onboarding-gate.ts`, nouveau statut
  `needs-post-auth`) : déclenché tant que `profiles.country` est NULL
  (pas de nouvelle colonne — ce champ existant sert de signal "onboarding
  post-auth pas encore fait"), fail-open sur erreur réseau (ne bloque
  jamais l'accès à l'app déjà installée).

## PHASE 2 — LE LOGGER (Bloc B)

- [X]  **2.1** Migration : `exercises` + import ExerciseDB (200 exos, FR
  traduit — relecture humaine échantillon 30) + pack 50 GIFs embarqués.
- [X]  **2.2** Migration : `custom_exercises` (limite 5 gratuit).
  `supabase/migrations/20260725140000_create_custom_exercises.sql` : table
  §2.4 + index partiel `where deleted_at is null` + trigger `set_updated_at`

  + RLS `auth.uid() = profile_id` (select/insert/update — pas de DELETE,
    la suppression est un soft delete requis par le protocole de sync).
    La limite de 5 est posée **en base** via `enforce_custom_exercise_limit()`
    et non côté app comme DATA_MODEL §2.4 le prévoyait initialement (voir la
    correction sur place) : le client écrivant en direct via RLS, une limite
    applicative seule serait contournable avec la clé anon. Le "si gratuit"
    passe par `has_active_premium()`, **aujourd'hui basée sur `trial_expires_at`
    uniquement** — ⚠️ Phase 9 devra y ajouter le OR sur un abonnement actif
    une fois `subscriptions` créée, sinon les abonnés Lyxo+ resteront bloqués
    à 5 (PRICING.md : illimité en payant). Vérifié sur `lyxo`
    (gyslysnysrswzefmvpxw) par un test transactionnel rollbacké couvrant les
    6 cas : 5 OK, 6e bloqué, soft delete libère un emplacement, restauration
    bloquée, premium lève la limite, retour gratuit re-bloque. Advisor
    sécurité inchangé (seul le warning Auth préexistant subsiste).
- [X]  **2.3** Écran Workout Logger : structure de base (sélection
  exercice, ajout de séries) — sans encore la saisie poids/reps.
  `app/workout/active.tsx` : compteur "N séries / N exercices", cartes
  d'exercice avec lignes de série numérotées et bouton "+ Série", bouton
  "Ajouter un exercice". Nommé `active` et non `[id]` car sans persistance
  il n'y a qu'une séance en cours possible, sans id — `workout/[id].tsx`
  (détail d'une séance passée, LLD §6.3) se déclarera à côté sans
  collision. Route à plat : sans `app/workout/_layout.tsx`, expo-router
  nomme l'écran `workout/active`, pas `workout` (un `<Stack.Screen name="workout" />` déclenche un warning "No route named"). CTA
  "Start Workout" de Home branché dessus (il n'avait aucun handler).
  **L'essentiel de la tâche est `components/ExercisePicker.tsx`** : le
  composant partagé imposé par LLD §6.5bis, qui sert les trois surfaces
  (sheet du flux de séance, onglet Log, Actions → Exercises) avec une
  seule liste et un seul jeu de filtres. Il porte les 3 onglets
  All/Recent/Custom et bascule entre mode sélection (toggle à coche via
  la prop `selection`) et mode navigation (ouvre le détail) sans rien
  savoir de sa surface d'affichage — d'où l'absence volontaire de tout
  chrome d'écran dedans. Preuve de non-duplication : `app/(tabs)/log.tsx`
  est passé de 87 à 30 lignes et ne contient plus aucune logique de liste
  ou de filtre. Recherche et chips ne sont rendues que sur l'onglet All,
  où elles ont une liste à piloter. Un même exercice peut être ajouté
  plusieurs fois à une séance (superset), d'où un id d'instance distinct
  de `exercise.id`. Nouveau `components/EmptyState.tsx` : première
  implémentation du pattern §6.0 (titre gras + description grise, aligné
  à GAUCHE, sans icône).
  ⚠️ **RÉSERVES — ne pas lire comme des bugs :**

  - **Aucune persistance** (ROADMAP 2.6) : les séries ajoutées vivent en
    state d'écran et disparaissent au kill de l'app. Attendu à ce stade.
  - **Recent** est un état vide tant que 2.6 n'a pas créé `workouts`/
    `workout_exercises`/`sets` — aucune source de données n'existe.
  - **Custom** est un état vide en attente de son store client, et le
    **"+ Create" inline reste à faire** (§6.5bis) : à planifier **juste
    après 2.6**. C'est là que la limite de 5 posée en base en 2.2 sera
    enfin exercée côté UI — `CUSTOM_EXERCISE_LIMIT_REACHED` doit être
    traité comme une réponse NORMALE avec renvoi vers Lyxo+, jamais comme
    une erreur technique, et le client ne doit jamais recompter les 5
    comme s'il faisait autorité.
  - Saisie poids/reps volontairement absente → 2.4 (`WeightRepsInput`) ;
    "+ Série" n'ajoute qu'une ligne numérotée vide.
    Vérifié : `tsc --noEmit` et `eslint` verts, bundle Metro complet servi
    (4330 modules), et sur appareil réel le golden path (3 exercices cochés
    en une passe → "0 séries / 3 exercices", puis "+ Série" incrémentant le
    compteur). L'alignement à gauche des états vides Recent/Custom n'a été
    vérifié que **structurellement** (pas de `text-center` dans
    `EmptyState`), pas à l'œil — Maestro ne peut pas piloter l'appareil de
    test (voir la note de session sur INJECT_EVENTS).
- [X]  **2.4** Composant `WeightRepsInput` : blocs égaux kg|reps,
  steppers unit-aware (56px min), clavier custom sticky.
  `components/logger/WeightRepsInput.tsx` : deux blocs `flex-1` stricts
  (aucun des deux n'est secondaire), valeur en Inter Black 36px au-dessus
  d'un label 14px (plancher correctif audit #13), bloc focus souligné
  ember. Steppers ±2,5 kg / ±2.5-5 lbs volontairement **sans `flex-1`** :
  en mode lbs il y a 4 boutons sur une demi-largeur et `flex-1` les
  écraserait sous les 56px exigés — à taille fixe ils passent à la ligne.
  Swipe vertical sur le bloc poids = ±1 cran (LYXO_UI_PROMPT, "in addition
  to steppers"), via `Gesture.Pan` + `runOnJS`.
  `components/logger/NumberKeyboard.tsx` : clavier sticky hors ScrollView
  (il rétrécit la zone défilable au lieu de la recouvrir), touches ≥56px
  mémoïsées, touche décimale **désactivée et non masquée** sur les reps
  pour que la grille ne bouge pas d'un champ à l'autre.
  **Le focus vit dans l'écran, pas dans la ligne** : plusieurs séries sont
  affichées à la fois, une seule peut être en édition, et il ne doit
  exister qu'un seul clavier sticky — `WeightRepsInput` est donc contrôlé.
  Défilement automatique vers la série en cours d'édition (`measureLayout`
  contre un repère `collapsable={false}` dans le contenu du ScrollView),
  **conditionnel** : ne bouge que si la ligne n'est pas déjà entièrement
  visible, défiler une ligne lisible serait sa propre gêne.
  Branché dans `app/workout/active.tsx` : les lignes de série affichent la
  saisie au lieu du "—" de 2.3.
  ⚠️ **RÉSERVE — l'unité d'affichage est figée sur `kg`** (constante
  `DISPLAY_UNIT` unique dans `active.tsx`) : `profiles.weight_unit` est
  écrit à l'onboarding mais **jamais relu**, aucun store client ne
  l'expose. `lib/units.ts` et le composant sont réellement unit-aware et
  testés sur les deux unités, mais **le chemin lbs n'est pas exerçable
  dans l'app** tant qu'un store ne porte pas la préférence. À traiter
  quand un store de préférences existera.
  Bug trouvé au test sur appareil et corrigé : le compteur affichait
  "1 séries" — i18next ne pluralise qu'une variable `count` par clé, or
  la chaîne en portait deux ; décomposé en clés pluralisables recomposées
  (règle CLDR : "0 série" au singulier en fr, "0 sets" au pluriel en en).
- [X]  **2.5** `lib/units.ts` (conversion, formats FR/EN) + tests unitaires.
  **Fait pendant 2.4**, qui en avait besoin pour être unit-aware :
  `lib/units.ts` existe avec `KG_TO_LBS`, `formatWeight()`,
  `stepperIncrement()`, `kgToLbs()`/`lbsToKg()` et `weightInputValue()`,
  conformes aux signatures LLD §3.3, plus `lib/units.test.ts` (9 tests :
  formats FR/EN, indépendance locale/unité, suppression du zéro décimal,
  groupement des milliers, incréments par unité, aller-retour sans dérive).
  **A mis en place le tout premier runner de test du projet** — `jest-expo`

  + `@react-native/jest-preset` (peer dependency séparée depuis RN 0.86),
    `npm test`, et `"types": ["jest"]` dans tsconfig sans quoi
    `tsc --noEmit` échoue sur les fichiers de test. Débloque aussi 2.9 et
    3.4.
    Cochée après vérification explicite des **4 cas exigés par TESTING.md
    §1.1** — arrondis kg→lbs, formats FR/EN, steppers par unité, jamais de
    dérive du kg stocké — tous couverts, et l'API correspond aux signatures
    LLD §3.3.
    **Délibérément PAS construit ici** : formatteurs de volume
    (`total_volume_kg`) et de durée (`duration_secs`), et un `formatNumber`
    exporté pour les prix FCFA ("3 500", jamais "3,500", LYXO_UI_PROMPT
    §16). Les écrans qui les consomment n'existent pas encore — le volume
    est calculé en 2.6+/2.11, la Performance est Phase 4, le paywall Phase

  9. Le groupement des milliers par locale est déjà implémenté et testé
     dans le formatteur privé, il suffira de l'exporter le moment venu.
- [X]  **2.6** Migrations : `workouts`, `workout_exercises`, `sets` — tout
  offline dans WatermelonDB d'abord (pas encore de sync serveur).
  Les DEUX schémas écrits côte à côte, en lisant DATA_MODEL §2.5-2.7, jamais
  de mémoire : `supabase/migrations/20260727120000_create_workout_tables.sql`
  (appliqué sur `lyxo`, advisor sécurité inchangé) et `db/schema.ts`.
  `numeric(10,2)` / `numeric(8,2)` posés **dès la création** plutôt que par
  un ALTER post-hoc (CLAUDE_LYXO_V3 §17bis.2, "avant le premier insert") —
  en float, 82.5 × 3 donne 247.50000000000003.
  **Le vrai risque de la tâche était la dérive silencieuse** : les tables
  Postgres sont inertes jusqu'à la Phase 3, donc rien n'aurait signalé un
  écart. Deux parades : une table de correspondance colonne par colonne en
  tête de `db/schema.ts`, et surtout `db/schema.test.ts`, qui compare le
  schéma local aux types Postgres GÉNÉRÉS depuis la vraie base et échoue dès
  que l'un bouge sans l'autre. Garde-fou vérifié en le faisant échouer
  volontairement (colonne `reps` rendue optionnelle) avant de le garder.
  Deux écarts STRUCTURELS non corrigeables, documentés : WatermelonDB n'a que
  string/number/boolean (la précision `numeric` n'est garantie que côté
  serveur — le volume devra être réarrondi au push), et les CHECK n'y
  existent pas (l'invariant "au moins un id d'exercice" et le RPE 1-10 sont
  tenus par le code, sinon le push Phase 3 sera rejeté pour des lignes déjà
  écrites en local).
  Écran branché (`db/use-active-workout.ts` + `app/workout/active.tsx`) :
  la séance survit au kill de l'app. Rechargement réactif via
  `withChangesForTables`, qui émet à la souscription (`startWith(null)`,
  vérifié dans la source) — un seul chemin de chargement, pas de `setState`
  synchrone dans un effet. Reprendra sans changement les écritures de la
  sync en Phase 3.
  **Onglet Recent allumé** (`db/use-recent-exercises.ts`) — lève la première
  réserve inscrite sous 2.3.
  ⚠️ **Contradiction LLD §4 corrigée sur place** : son tableau rangeait la
  séance en cours dans un Zustand "éphémère", alors que la règle de frontière
  juste en dessous dit qu'une donnée devant survivre à un crash vit dans
  WatermelonDB. La règle l'emporte — perdre une séance parce qu'Android a tué
  l'app en arrière-plan est rédhibitoire sur le marché d'entrée. Le motif du
  tableau ("ne pas écrire à chaque tap") visait le mauvais niveau : c'est le
  TAMPON DE FRAPPE du clavier qui reste en mémoire, pas la série. Structure
  et valeurs validées → écriture immédiate ; chiffres en cours de frappe →
  jamais. `useWorkoutStore` n'existe pas et ne doit pas être créé.
  ⚠️ **RÉSERVES :**

  - **Rebuild natif OBLIGATOIRE** — contrairement à 2.3/2.4 (JS pur), cette
    tâche fait entrer WatermelonDB dans l'app ; il n'était jusqu'ici que dans
    un spike jetable. L'APK du 24/07 ne contient aucune entrée WatermelonDB :
    sans rebuild, l'app crashe à l'import.
  - Le **référentiel d'exercices reste réseau** (store Zustand, pas
    WatermelonDB) : au premier lancement hors ligne, les séries persistées
    s'affichent mais sans nom d'exercice (repli explicite, jamais de ligne
    masquée). Sa mise en cache locale relève de la Phase 3.
  - Le volet "follow actif" des policies de lecture (DATA_MODEL §2.5) attend
    la table `follows` en Phase 5 — d'ici là un profil privé n'est lisible
    que par lui-même, soit strictement moins permissif que la cible.
    Vérifié : tsc, eslint, 15/15 tests.
- [~]  **2.7** ~~Templates de séance / splits / rotation.~~ **ABANDONNÉE —
  caduque depuis le redesign du 2026-07-24, constaté le 2026-07-28.**
  LLD.md §6.4 supprime ce concept de la v1 : « Le plan initial (Splits =
  structure hebdo, Routines = séances individuelles, **les deux prévus
  v1**) est abandonné. Les deux fusionnent en un seul concept futur,
  **Programs** — programme complet acheté à un coach, **v2 uniquement** ».
  Concrètement en v1 : aucun tab Splits sur le Profil, aucun item Routines
  dans le menu Actions, aucune card split actif sur Home (déjà appliqué
  dans les écrans livrés). « Programs » relève de la Phase 10
  (marketplace coach, tab Shop) — ne rien construire ici.
  Cette ligne n'avait jamais été mise à jour après le redesign : la
  laisser cochable aurait fait implémenter ce que la spec venait de
  retirer. Conservée barrée plutôt que supprimée, pour que la
  numérotation 2.8-2.12 reste stable et que la décision soit traçable.
- [ ]  **2.8** Rest timer plein écran (anneau, ±15s, skip, next up) —
  implémentation par TIMESTAMP persisté + notification locale
  programmée (PRD 1.2 : doit survivre au verrouillage d'écran/appel).
  **Code livré et vérifié statiquement (commits 28a2193, b543b99), DoD
  appareil encore à valider.** `lib/rest-timer.ts` (calculs purs, 11 tests
  avec horloge injectée), `lib/rest-timer-store.ts` (`endsAt` persisté en
  AsyncStorage), `lib/notifications.ts`, `components/logger/
  RestTimerModal.tsx` (anneau SVG derrière les chiffres à 30 %),
  `components/NotificationPrimingModal.tsx` (priming avant le prompt
  système, LLD §6.5bis), et "Valider la série" dans `active.tsx`.
  ⚠️ **PIÈGE `sound` — ne pas le réintroduire.** Sur un CANAL Android le
  type est `string | null` : toute chaîne y désigne un NOM DE FICHIER
  audio à embarquer via le plugin, d'où l'erreur runtime "Custom sound
  'default' not found". Et `sound: true` n'y compile pas — le booléen
  n'est valable que dans le `content`. La propriété est donc OMISE sur le
  canal (importance HIGH ⇒ son système) et vaut `true` dans le content.
  Réintroduite puis retirée deux fois le 2026-07-28.
  ⚠️ **DIVERGENCE DE NOM DE PAQUET — résolue le 2026-07-28, à ne pas
  recréer.** `android/app/build.gradle` produisait `com.lyon32.lyxo`
  pendant qu'`app.json` déclarait `com.lyxo.app`. `android/` étant
  gitignoré et non régénéré, les DEUX applications se sont retrouvées
  installées, **toutes deux enregistrant le schéma `lyxo://`**. Le lien
  `lyxo://expo-development-client/...` qu'ouvre `expo run:android` est
  alors ambigu : Android lançait le paquet obsolète, si bien que les
  corrections testées ne portaient pas sur l'app affichée. C'est aussi ce
  qui faisait "apparaître et disparaître" la base WatermelonDB — deux apps,
  deux bases. Résolu par `expo prebuild --clean` (aligné sur
  `com.lyxo.app`) et désinstallation des deux anciens paquets.
  **Symptôme à reconnaître** : un correctif qui "ne change rien" alors que
  le bundle est bon — vérifier `pm list packages | grep lyxo` et
  `topResumedActivity` AVANT de chercher dans le code.
  Note : `expo prebuild` efface `android/gradle.properties`, donc les
  timeouts réseau Gradle allongés (réseau instable) sont à remettre après
  chaque prebuild — ou à porter dans un plugin `expo-build-properties`.
- [ ]  **2.9** `lib/pr-detection.ts` + tests unitaires (règles §18.1
  complètes : plausibilité, delta, ancienneté).11
- [ ]  **2.10** Célébration PR (carte partageable, pas de photo).
- [ ]  **2.11** Écran résumé fin de séance (peak-end).
- [ ]  **2.12** DoD check : parcours complet testable en mode avion sur
  Pixel 8 ET device bas de gamme.

## PHASE 3 — SYNC (Bloc C — le socle, jamais compressé)

- [ ]  **3.1** Migration : ajouter `deleted_at` sur TOUTES les tables SYNC
  créées jusqu'ici (si pas déjà fait dès la création — vérifier).
- [ ]  **3.2** Backend `/v1/sync/pull` : pagination (500/has_more/cursor),
  calcul `is_premium` dérivé (retourne false/null en Phase 1-3, la
  table subscriptions n'existe pas encore).
- [ ]  **3.3** Backend `/v1/sync/push` : idempotence par local_id,
  application soft-delete uniquement (jamais de DELETE physique) —
  tests d'intégration dédiés.
- [ ]  **3.4** `lib/sync/conflict-resolution.ts` (LWW) + tests unitaires
  (égalité de timestamp, suppression prioritaire).
- [ ]  **3.5** `lib/sync/engine.ts` : orchestration côté app (foreground,
  retour réseau, retry backoff).
- [ ]  **3.6** Contrainte 1 appareil actif (gratuit) : migration devices +
  logique d'invalidation au nouveau login.
- [ ]  **3.7** Torture tests manuels : mode avion pendant séance → sync ;
  kill app mid-séance ; login sur 2e appareil. Zéro perte constatée.
- [ ]  **3.8** Indicateur SYNCED + micro-texte "Enregistré sur ton
  téléphone ✓" (3 premières séances).

## PHASE 4 — PROGRÈS & PROFIL (Bloc D)

- [ ]  **4.1** Migration : `personal_records` complet (avec
  is_social_eligible, ineligibility_reason).
- [ ]  **4.2** Écran Progrès : graphes 1RM/volume (tout historique),
  heatmap, segmented control.
- [ ]  **4.3** Masquage consultation > 90 jours (gratuit) + notif J75.
- [ ]  **4.4** Écran Profil : grille stats 3col, tabs, heatmap.
- [ ]  **4.5** Compte privé : migration `is_private`, RLS, écran
  "demande en attente".
- [ ]  **4.6** Paramètres : Data Saver, langue, unité, opt-outs.
- [ ]  **4.7** Suppression de compte (in-app + endpoint soft-delete 30j)
  + export JSON (RGPD).

### Refonte UI/UX — brainstorm design référence (26 captures, 2026-07-24)

Décisions détaillées : LLD.md §Redesign référence. Palette Braise inchangée
— seuls structure/composants/copy sont adoptés depuis la référence.

- [ ]  **4.8** Refonte nav : Home / Search (sous-tabs Feed·Discover) /
  Performance / Shop (v2, vide en v1) / Actions("...") — profil retiré de
  la tab bar, accessible via icône avatar sur Home. `log.tsx` (tab
  Dumbbell actuel) retiré ; bibliothèque d'exercices devient le sheet
  "Add Exercise" (dans le flow séance) + un écran Exercises via Actions.
- [ ]  **4.9** Écran Home : header 3 icônes (notifications/messages/avatar),
  dropdown "Today" → calendrier mensuel avec indicateurs de jours actifs,
  bandeau conseil dismissible, CTA "Start Workout", module streak "Last 2
  Weeks" (grille 7j × 2 semaines + compteur active days).
- [ ]  **4.10** Écran détail workout (ouvert depuis feed/profil) : header
  auteur+date, titre, stats row (Duration/Exercises/PRs), row social
  (Likes/Comments), photo optionnelle si postée, schéma anatomique
  (2 assets fixes face/dos, sélection selon muscles travaillés, palette de
  highlight dédiée indépendante de la palette UI), liste d'exercices
  set-par-set (colonnes reps/poids pour la muscu, durée/distance/allure/
  calories pour le cardio). PR = volume max historique sur l'exercice.
- [ ]  **4.11** Menu Actions v1 : Exercises, Physique (photos de
  progression uniquement, pas de chiffres — ceux-ci restent dans
  Performance), Feedback (formulaire in-app → support). Items visibles
  mais désactivés/grisés pour les stubs v2 : Connect Health (Google
  Fit/Apple Health), Nutrition Tracking, Programs (marketplace coach).
  "Import" abandonné définitivement (aucune version).
- [ ]  **4.12** Settings : Theme (Auto/Light/Dark), unités poids/distance,
  Auto Complete Sets — actifs v1. Toggles Write Workouts/Write Body
  Metrics/Health Suggestions visibles mais grisés (dépendent du sync
  Health, v2).
- [ ]  **4.13** Profil v1 : tab unique Workouts (pas de tab Splits —
  Splits/Routines fusionnés dans "Programs", v2 marketplace coach, voir
  Phase 5bis/CLAUDE_LYXO_V3.md §18). Compteurs Followers/Following/
  **Partners** (3 relations distinctes). Edit Profile garde Username/
  Handle/Bio/Gym/Instagram (pas de champ University ni Badge Selector).
  Share Lift Card : nom/handle/partners + stats d'entraînement (streak,
  volume, workouts logged).

## PHASE 5 — SOCIAL (Bloc E — dense, surveiller le planning)

- [ ]  **5.1** Migration `follows` + RLS (asymétrique, self-ref, mutuel
  calculé) + tests d'intégration RLS privé/public.
- [ ]  **5.2** Écran feed abonnés (séances auto, format compact) +
  skeletons.
- [ ]  **5.3** Migration `traces` + logique de détection Conquête (au
  moment du sync PR, si follow mutuel concerné et PR social-eligible).
- [ ]  **5.4** Notification Conquête (push) + écran Rivalités/Leaderboard
  (poids brut, follows mutuels, exclusion des inéligibles).
- [ ]  **5.5** Trace card sur profil + bouton "Récupérer mon titre" +
  expiration 6 mois (cron) + toggle masquage.
- [ ]  **5.6** Migration `stories` : composer carte-stats (défaut).
- [ ]  **5.7** Composer photo overlay : compression client ≤300Ko,
  Supabase Storage upload, NSFW-check upload, purge cron 24h.
- [ ]  **5.8** Migration `reports` + auto-hide à 3 signalements (logique
  backend) + écran admin minimal (liste des signalés, pour toi).
- [ ]  **5.9** Push Expo : configuration complète (Conquête, follow
  demande, coach — tokens stockés dans `devices`).
- [ ]  **⚠️ Soupape planning** : si 5.7 déborde, la photo overlay glisse
  en Phase Discover (S13+), la carte-stats (5.6) suffit à livrer.

## PHASE 5bis — GYM MATCHING (Bloc E-bis, override V1 daté 2026-07-24)

> ⚠️ Cette phase n'existait pas dans le planning original — "Gym Matching"
> était classé non-goal V2+/hors-roadmap (CLAUDE_LYXO_V3.md §18) et le chat
> associé tombait sous le non-goal 3 PROJECT_BRIEF.md ("pas de messagerie
> générale"). Les deux ont été explicitement levés par décision écrite de
> Lionel le 2026-07-24, pendant le brainstorm design référence — voir
> PROJECT_BRIEF.md §4 non-goal 3 et CLAUDE_LYXO_V3.md §18 PRIORITÉ NIVEAU
> 2bis pour la trace de la décision. Dépend de Phase 5 (Follow/relations).

- [ ]  **5bis.1** Migration `partner_swipes` (like/reject) + `partners`
  (match mutuel, relation distincte de `follows`) + RLS.
- [ ]  **5bis.2** Écran swipe matching (sous-tab Discover du tab Search) :
  pile de cartes, critères de compatibilité à définir (salle, horaires,
  split) avant implémentation.
- [ ]  **5bis.3** Migration `conversations` + `messages` : statut
  `pending`/`accepted` par conversation — porte le dossier "Requests"
  (non-Partners) vs inbox principale (Partners).
- [ ]  **5bis.4** Écran Messages : inbox Partners + dossier Requests
  séparé (accord explicite requis avant de rejoindre l'inbox principale).
- [ ]  **5bis.5** DoD check : un follower non-Partner peut initier un
  message qui atterrit en Requests ; un Partner matché va direct en inbox.

## PHASE 6 — COACH MODE V1 (Bloc F, chevauche Phase 5)

> **Chevauchement avec Phase 5 expliqué** : 6.1 (migration `coach_clients`
>
> + attribut `is_coach`), 6.2 (génération invitation) et 6.3 (acceptation
>   invitation) n'ont **aucune dépendance technique réelle** sur Phase 5 —
>   `coach_clients` est une table indépendante du graphe de follow, et le
>   flux d'invitation coach ne lit ni le feed, ni les stories, ni le
>   leaderboard pour fonctionner. Ces 3 tâches peuvent démarrer dès que
>   Phase 4 est terminée, sans attendre Phase 5. 6.4-6.7 (programmes,
>   builder, dashboard coach) n'ont pas non plus de dépendance dure sur
>   Phase 5 ; elles sont séquencées après 6.1-6.3 pour une raison de flux
>   logique (un programme s'assigne à un client déjà lié via 6.1-6.3), pas
>   à cause d'un blocage technique.

- [ ]  **6.1** Migration `coach_clients` (many-to-many, limite 3
  Découverte) + attribut `is_coach` sur profiles.
- [ ]  **6.2** Endpoint + écran génération invitation
  (`lyxo.app/invite/{code}`) + Android App Links (pas Branch).
- [ ]  **6.3** Écran acceptation invitation (client) avec consentement
  explicite affiché.
- [ ]  **6.4** Migrations `programs` + `program_workouts` (structure
  libre, cycle au choix coach).
- [ ]  **6.5** Écran Programme builder (coach) + assignation à un client.
- [ ]  **6.6** Logger : affichage du programme assigné pré-rempli, calcul
  écart prévu/réalisé.
- [ ]  **6.7** Dashboard coach : liste clients, dernière séance, mini
  heatmap assiduité, bouton WhatsApp (pas de messagerie in-app).

## PHASE 7 — BETA (Bloc G)

- [ ]  **7.1** Play Console : app créée, package name, fiche minimale,
  App Access (identifiants reviewers permanents), **formulaire Data
  Safety complété** (fitness, identifiants, analytics PostHog EU —
  SECURITY_NOTES §3ter, fiche 10 comité).
- [ ]  **7.2** Play App Signing activé au premier upload. Internal
  Testing track configuré. EAS Update configuré (branche
  production).
- [ ]  **7.3** Composant `UpdateChecker` (OTA banner).
- [ ]  **7.4** Suite smoke Maestro (7 flows définis, TESTING §1.3) +
  exécution avant la distribution beta.
- [ ]  **7.5** PostHog branché (EU) : événements du funnel (signup,
  first_workout, J1/J7, share, invite).
- [ ]  **7.6** Recrutement des 10 coachs finalisé (tâche terrain démarrée
  dès Phase 1) — comptes créés, programmes prêts.
- [ ]  **7.7** Formulaire de retour (Tally/Forms) + dashboard métriques
  de décision (J7 40/25/20).
- [ ]  **7.8** Vérifier la règle des 20 testeurs/14 jours sur le compte
  développeur — calendrier ajusté en conséquence.
  ⚠️ Cette règle concerne, à la connaissance actuelle, le canal **Closed
  Testing** — PAS Internal Testing (utilisé pour les 10 coachs, CICD
  §3.3). Politique Google Play à reconfirmer à ce moment (elle peut
  évoluer) : si confirmée, ajouter/basculer sur un canal Closed Testing
  pour débloquer la promotion vers la Production track (CICD §3.3).

---

## PHASE 8 — DISCOVER + POLISSAGE (hors MVP beta)

- [ ]  **8.1** Discover public : vue matérialisée trending (pas de
  Redis), écran Discover actif, posts/commentaires publics.
- [ ]  **8.2** Modération renforcée pour le contenu public élargi.
- [ ]  **8.3** Polissage général, skeletons manquants, DoD repassée sur
  tous les écrans.
- [ ]  **8.4** Soumission Play Store production + (si prêt) App Store.

---

## PHASE 9 — BILLING (= Phase produit P3, post-beta — §20.6 absolu)

> ⚠️ AUCUNE tâche de cette phase ne démarre avant que Phase 7 (beta) ne
> soit validée. Aucune table `subscriptions/payments/pay_links` créée
> avant ce point.

- [ ]  **9.1** Migrations `subscriptions`, `payments`, `pay_links`
  (DATA_MODEL §2.16-2.18).
- [ ]  **9.1bis** 🚨 **BLOQUANT — à faire dans la même migration que 9.1.**
  Mettre à jour `public.has_active_premium(uuid)`, créée en ROADMAP 2.2
  (`supabase/migrations/20260725140000_create_custom_exercises.sql`), pour
  ajouter le `OR` sur un abonnement actif de la table `subscriptions` que
  9.1 vient de créer. **Tant que ce n'est pas fait, la fonction ne regarde
  que `trial_expires_at` : tout abonné Lyxo+ dont l'essai est expiré est
  traité comme gratuit et reste bloqué à 5 exercices custom**, alors que
  PRICING.md le promet illimité — on facture un déblocage qui n'arrive
  jamais. La fonction est volontairement le seul point de vérité du statut
  premium en base : tout garde-fou premium ajouté d'ici là doit passer par
  elle (et non réimplémenter le test), pour que ce correctif unique les
  débloque tous d'un coup. Test de non-régression attendu : abonné actif
  sans essai en cours → 6e exercice custom accepté.
- [ ]  **9.2** PawaPay : Dashboard configuré (callback URLs → token
  sandbox → signed callbacks → active-configuration vérifiée CM).
- [ ]  **9.3** Backend : `/v1/billing/checkout` (POST /v2/deposits,
  depositId, metadata user_id) + webhook `/v1/webhooks/pawapay/ deposits` (signature + re-GET + idempotence).
- [ ]  **9.4** Page web `lyxo.app/pay/:token` (+ tests Playwright dédiés).
- [ ]  **9.5** Emails Resend (domaine vérifié) : J12/J14/J21 + confirmation.
- [ ]  **9.6** Écran informatif in-app Afrique (zéro mention de paiement,
  conforme §9 BILLING_FLOW) + trial manuel.
- [ ]  **9.7** RevenueCat : Play Console produits/base plans/offers
  (ordre réel : Payments profile → Billing Library → .aab uploadé →
  produits créés), intégration SDK, paywall international,
  Restaurer les achats, lien Annulation.
- [ ]  **9.8** Webhook `/v1/webhooks/revenuecat` + états
  GRACE_PERIOD/ON_HOLD gérés.
- [ ]  **9.9** Triple filet paiement web + offline (push → /sync forcé,
  bouton Actualiser, sync foreground) — tests dédiés.
- [ ]  **9.10** Sandbox complet testé (License Testing Google, temps
  accéléré, carte refusée, expiration/reverrouillage).
- [ ]  **9.11** Uptime monitoring activé (webhooks ne doivent jamais
  tomber en silence).

---

## PHASE 10 — MARKETPLACE COACH (V2, post-Phase 9)

- [ ]  **10.1** Devis écrit PawaPay payouts (frais, KYC) — prérequis
  avant tout code de cette phase.
- [ ]  **10.2** Migration `coach_wallets` (ledger interne).
- [ ]  **10.3** Vente de programmes : split commission, écran checkout.
- [ ]  **10.4** Payout : `/v2/payouts`, file `payout_requests`, cron
  batch, rétention 48-72h, seuil 5000 FCFA.
- [ ]  **10.5** Coach Pro (tier payant) activé.

---

*Documents liés : IMPLEMENTATION_PLAN.md (le récit stratégique complet
par bloc, avec l'outillage détaillé) · PRD.md (le détail feature par
feature) · toutes les tâches ci-dessus référencent les sections exactes
de CLAUDE_LYXO_V3.md, DATA_MODEL.md, API_SPEC.md, BILLING_FLOW.md citées
entre parenthèses.*
