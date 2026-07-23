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
- [x] **1.5bis** Écrans langue (1bis) + Welcome/offline fusionné (1ter,
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
- [x] **1.6** Auth : email + Google (Supabase Auth) — **Android V1 :
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
  lib/supabase.ts (AsyncStorage + PKCE), lib/auth-store.ts (zustand),
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
  3. Authentication > URL Configuration : autoriser `lyxo://auth/
     callback` et `lyxo://auth/reset-password`.
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
  (`adb shell am start -a android.intent.action.VIEW -d "lyxo://auth/
  reset-password?code=..."`) : l'écran réagit correctement à un deep
  link reçu (tentative d'échange, échec propre sur code invalide,
  écran "Link expired" + "Resend email" affiché, pas de crash) — le
  code app (app/auth/reset-password.tsx) est donc sain, seul le
  transport email→app via schéma personnalisé est en cause.
- [x] **1.7** billing_region : détection pays déclaré + IP (`lib/
  billing-region.ts` + intégration à l'onboarding), stockage serveur.

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
- [ ]  **1.8** Onboarding POST-auth (écran 2bis, UI prompt) : pays +
  unité kg/lbs, carte Data Saver, annonce règle 90 jours, pseudo
  avec suggestions (filtre §Q10). Suite visuelle sans jauge de
  progression (les 3 étapes construites en 1.5bis sont déjà
  cochées — ces écrans sont administratifs, pas "de construction").

## PHASE 2 — LE LOGGER (Bloc B)

- [ ]  **2.1** Migration : `exercises` + import ExerciseDB (200 exos, FR
  traduit — relecture humaine échantillon 30) + pack 50 GIFs embarqués.
- [ ]  **2.2** Migration : `custom_exercises` (limite 5 gratuit).
- [ ]  **2.3** Écran Workout Logger : structure de base (sélection
  exercice, ajout de séries) — sans encore la saisie poids/reps.
- [ ]  **2.4** Composant `WeightRepsInput` : blocs égaux kg|reps,
  steppers unit-aware (56px min), clavier custom sticky.
- [ ]  **2.5** `lib/units.ts` (conversion, formats FR/EN) + tests unitaires.
- [ ]  **2.6** Migrations : `workouts`, `workout_exercises`, `sets` — tout
  offline dans WatermelonDB d'abord (pas encore de sync serveur).
- [ ]  **2.7** Templates de séance / splits / rotation.
- [ ]  **2.8** Rest timer plein écran (anneau, ±15s, skip, next up) —
  implémentation par TIMESTAMP persisté + notification locale
  programmée (PRD 1.2 : doit survivre au verrouillage d'écran/appel).
- [ ]  **2.9** `lib/pr-detection.ts` + tests unitaires (règles §18.1
  complètes : plausibilité, delta, ancienneté).
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

## PHASE 6 — COACH MODE V1 (Bloc F, chevauche Phase 5)

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

---

## PHASE 8 — DISCOVER + POLISSAGE (S13-S16, hors MVP beta)

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
