# IMPLEMENTATION_PLAN.md — LYXO · Plan d'Implémentation MVP (S1-S12)
# Version : 1.0 — Juillet 2026
# Rôle : LA séquence d'exécution. Chaque bloc = 1 à 3 sessions Claude Code.
# Hiérarchie : PROJECT_BRIEF → PRICING → BILLING_FLOW → CLAUDE_LYXO_V3 (§18-19) → ce fichier.
# Règle : on ne commence pas un bloc tant que le précédent n'atteint pas sa DoD (§19.6).

---

## PRINCIPES D'EXÉCUTION

1. **L'ordre suit les dépendances, pas l'envie.** La sync (Bloc C) est le
   socle — tout ce qui vient après suppose qu'elle marche. Ne JAMAIS la
   compresser pour rattraper du retard : on coupe en aval (§18.11).
2. **Une session Claude Code = un objectif du plan, pas deux.** Toute idée
   hors scope → IDEAS_BACKLOG.md.
3. **Chaque bloc se termine par ses tests DoD** (mode avion, device bas de
   gamme, Sentry propre) avant de merger.
4. **En parallèle du code, dès S1 (tâches terrain, non délégables) :**
   recrutement des 10 coachs, achat du device de test (Tecno/Itel ≤ 3 Go),
   vérification merchant registration Play Console.

---

## BLOC A — FONDATIONS (S1-S2)

### A1. Setup projet (1 session)
- Monorepo ou 2 repos (app + backend) — recommandé : 2 repos simples.
- App : Expo (dev build), TypeScript strict, NativeWind v4, lucide-react-native
  (icônes, exclusif), ESLint/Prettier,
  **Recette NativeWind v4 exacte (doc officielle, vérifiée janv. 2026)** :
  1. `npm install nativewind react-native-reanimated react-native-safe-area-context`
     + `npm install --dev tailwindcss@^3.4.17 prettier-plugin-tailwindcss babel-preset-expo`
     ⚠️ PIÈGE 1 : Tailwind **v3.4.x**, PAS Tailwind v4 (incompatible avec
     NativeWind v4). ⚠️ PIÈGE 2 : rester sur NativeWind **v4 stable** — la
     v5 est en pre-release, ne pas la prendre même si npm la propose.
  2. `npx tailwindcss init` → tailwind.config.js : `presets:
     [require("nativewind/preset")]`, content couvrant app/ et components/,
     et les TOKENS BRAISE (§19.11 CLAUDE.md) dans theme.extend.colors.
  3. global.css avec les 3 directives @tailwind → importé dans le layout
     racine.
  4. babel.config.js : `["babel-preset-expo", { jsxImportSource:
     "nativewind" }]` + `"nativewind/babel"`.
  5. metro.config.js : `withNativeWind(config, { input: './global.css' })`.
  6. Types : fichier `nativewind-env.d.ts` avec
     `/// <reference types="nativewind/types" />` — ⚠️ PIÈGE 3 : ne JAMAIS
     le nommer `nativewind.d.ts` ni du nom d'un dossier existant (app.d.ts
     avec un dossier /app), sinon les types sont silencieusement ignorés
     et className paraît invalide partout.
  7. Test de validation : un écran bg/card/ember qui rend correctement.
  Bonus sessions : la doc NativeWind expose `nativewind.dev/llms.txt` et
  `llms-full.txt` — à donner à Claude Code en complément de Context7.
  i18next câblé AVANT le premier écran (règle 18.7), expo-router
  (layout (tabs) à 5 onglets : Accueil · Log · Progrès ·
  Discover[placeholder — voir note LYXO_UI_PROMPT nav] · Profil —
  ⚠️ jamais react-navigation en direct, stack fermée CLAUDE.md §2).
- Backend : Node/Express TypeScript sur Render, Prisma → Supabase Postgres,
  healthcheck, Sentry (app + backend) dès ce jour (§19.6).
- Workflow Supabase (règle §19.9) : Supabase CLI dans le projet, migrations
  SQL obligatoires dans supabase/migrations/, script
  `supabase:generate-types` → src/types/supabase.ts exécuté après chaque
  migration, RLS en SQL testées via Supabase MCP. Pas de Docker local V1.
- CI GitHub Actions : lint + typecheck + tests sur PR.
- Copier les 6 docs canoniques dans /docs du repo + /docs/licenses/ (ExerciseDB).
- **Outillage Claude Code (une fois, sur ta machine — commandes vérifiées
  dans les docs officielles, juillet 2026) :**
  - Context7 MCP (doc à jour version-exacte) : `npx ctx7 setup --claude`
    (ou `claude mcp add context7 -- npx -y @upstash/context7-mcp`).
    Usage : ajouter "use context7" au prompt sur tout code touchant Expo,
    WatermelonDB, NativeWind v4, Supabase, RevenueCat — les libs où la
    mémoire des modèles est le plus souvent périmée. Critique Blocs B et C.
    API key gratuite sur context7.com/dashboard si rate-limit atteint.
  - Resend MCP (serveur hébergé officiel, OAuth — recommandé) :
    `claude mcp add --transport http resend https://mcp.resend.com/mcp`
    puis `/mcp` dans Claude Code → sélectionner resend → login OAuth.
    (Alternative plugin : `claude plugin install resend@claude-plugins-official`.)
    Le MCP couvre : envoi/templates/broadcasts/automations/webhooks/logs —
    utile dès la Phase 3 (BILLING_FLOW §4.2) pour créer et tester les
    templates d'emails trial J12/J14/J21 en langage naturel.
  - ⚠️ Prérequis Resend AVANT le premier envoi réel (à faire en Phase 3,
    pas maintenant) : créer l'API key + VÉRIFIER LE DOMAINE lyxo.app
    (DNS SPF/DKIM) — sans domaine vérifié, les emails partent de
    onboarding@resend.dev et finissent en spam. L'adresse d'envoi cible :
    hello@lyxo.app ou pass@lyxo.app.
  - Maestro CLI + MCP (E2E mobile + vérification UI par l'agent) :
    installer le Maestro CLI (⚠️ Windows : vérifier si WSL2 est requis —
    30 min de setup en plus, émulateur accessible depuis WSL ; JAVA_HOME
    exigé, déjà présent via Android Studio), puis
    `claude mcp add maestro -- maestro mcp`.
    DEUX rôles, pas plus : (1) en session, Claude Code vérifie ses propres
    écrans (inspect_screen, take_screenshot, run YAML inline) sur
    l'émulateur ; (2) la suite smoke du Bloc G (7 flows — voir G).
    `setAirplaneMode` (Android) automatise le test de torture offline
    de la DoD. Au-delà de 10 flows = scope creep, refuser.
    Workflow officiel (docs.maestro.dev) : l'agent appelle `cheat_sheet`
    avant d'écrire des commandes inconnues ; `inspect_screen` avant de
    cibler un élément, re-appelé après chaque changement d'UI.
    Maestro Viewer (`open_maestro_viewer`) = émulateur embarqué dans le
    navigateur, montre les commandes en temps réel — demander simplement
    "open the maestro viewer". Mise à jour : upgrade du CLI puis
    `/mcp` → maestro → Reconnect dans Claude Code. Maestro Cloud
    (run_on_cloud) : IGNORER en V1 — l'émulateur local + ton Pixel 8 +
    le device bas de gamme suffisent, pas de dépendance cloud payante.
  - GitHub MCP (serveur officiel) : issues, PRs, lecture CI — l'agent
    diagnostique lui-même sa CI rouge.
  - Supabase MCP (officiel) : inspection du schéma réel, migrations,
    test des RLS policies — critique pour les comptes privés (Q8),
    l'agent ne devine plus l'état de la base.
  - EAS CLI : installé et loggé (builds, updates OTA, Internal Testing).
  - Expo MCP (serveur distant officiel — exception justifiée à la règle de
    fermeture : Expo est le cœur du stack, pas un outil périphérique) :
    `claude mcp add --transport http expo https://mcp.expo.dev/mcp`
    puis `/mcp` → authentification (access token Expo recommandé,
    expo.dev/accounts/[account]/settings/access-tokens).
    Rôles : `add_library` (installe les packages aux versions compatibles
    SDK — la source n°1 de galères Expo éliminée), gestion EAS
    (build_run/build_logs/build_info/workflow_* — "pourquoi mon build a
    échoué" auto-diagnostiqué), `read_documentation`/`learn` pour la doc
    Expo pointue. ⚠️ `search_documentation` exige un plan EAS payant —
    ne pas payer : Context7 couvre la recherche gratuitement.
    NE PAS installer les capacités locales (`expo-mcp` +
    EXPO_UNSTABLE_MCP_SERVER=1) en V1 : Maestro couvre l'automation UI
    en stable ; réévaluer quand le flag perd son "UNSTABLE".
    Frontières du trio : Expo MCP = dépendances + builds + doc Expo ·
    Context7 = doc des autres libs · Maestro = vérification UI + E2E.

  **RÈGLE DE FERMETURE DE L'OUTILLAGE** : le stack outils est CLOS —
  Context7, Resend MCP, Maestro MCP, GitHub MCP, Supabase MCP, Sentry,
  EAS (+ Phase 3 : Playwright, PostHog, uptime monitoring). Tout nouvel
  outil découvert en route → IDEAS_BACKLOG.md, évalué ENTRE deux blocs,
  jamais installé à chaud. Écartés délibérément : Flutter (§19.12 CLAUDE.md
  — WatermelonDB, vélocité React, qualité Claude Code sur RN),
  Detox (Maestro suffit),
  Storybook (impôt de maintenance solo), feature flags SaaS (table
  feature_flags Supabase maison = kill switch DoD 8), Docker local
  (tout est cloud/mobile), Tamagui (universel web+native inutile — LYXO
  est mobile-only, non-goal 6 ; courbe d'apprentissage vs NativeWind
  déjà maîtrisé), Unistyles (perf extrême C++ invisible sur des cards
  de données ; syntaxe propriétaire = friction Claude Code), twrnc
  (parsing runtime vs compilation NativeWind), kits de composants
  Gluestack/Paper/Restyle (UI LYXO 100% custom — logger, cartes PR,
  heatmap n'existent dans aucun kit). MOTEUR DE STYLE FERMÉ :
  NativeWind v4 — le style ne sera jamais le goulot de LYXO, la vélocité
  d'écriture des écrans si.
✅ Sortie : app vide qui boot sur Pixel 8 + device bas de gamme, API hello, CI verte, MCP/plugins installés.

### A2. Schéma de base + Auth (1-2 sessions)
- Migrations Supabase : profiles (billing_region, trial_expires_at,
  trial_used, is_coach, is_private, weight_unit 'kg'|'lbs', goal,
  preferred_split, weekly_goal, deleted_at…), devices (règle 1 appareil
  actif Q11b), tables workout de base — TOUTES avec deleted_at (18.3).
- RLS policies dès maintenant, comptes privés inclus (Q8 — structurant).
- Auth : email + Google via Supabase Auth (**PAS d'Apple Sign-In sur
  Android V1** — Apple réservé au build iOS, phase ultérieure,
  PROJECT_BRIEF non-goal 10, fiche 9 comité), trigger de création de
  profil (avec username depuis raw_user_meta_data si fourni, sinon
  fallback généré), écrans login/signup FR (UI prompt écrans 3/3bis) +
  reset password (écran 3quater — Resend configuré en SMTP custom
  Supabase dès ce bloc, fiche 14 comité, pas seulement Phase 9).
- Après le premier login (tout provider) : PATCH `/v1/profiles/me` pousse
  goal/preferred_split/weekly_goal/username depuis AsyncStorage
  (API_SPEC §4.2 — l'OAuth ne transporte pas raw_user_meta_data).
- billing_region calculé serveur à l'inscription (pays déclaré + IP, §19.1).
✅ Sortie : inscription (Google ou email) → profil créé (avec goal/split
si construits en A1bis) → région stockée → reset password testé → RLS testées.

### A1bis. Onboarding PRÉ-auth (1 session, précède A2)
- Écrans : Langue (1bis, déjà en A1) → Welcome/offline fusionné (1ter —
  photo hero réelle, PHOTO HERO EXCEPTION CLAUDE §19.8bis) → Objectif
  (3 cards) → Split (PPL/UL/FB). Stockage AsyncStorage uniquement
  (`onboarding_goal`/`onboarding_split`, LLD §4) — aucun compte requis.
✅ Sortie : parcours langue→welcome→objectif→split fonctionnel, choix
persistés localement, jauge 3 étapes jamais à 0% (UI prompt règle 14).

### A3. Onboarding POST-auth (1 session)
- 2-3 écrans (2bis, UI prompt) : pays, unité (kg), carte Data Saver (région Afrique),
  carte annonce des 90 jours (18.6). Pseudo avec suggestions (Q10).
✅ Sortie : parcours signup → onboarding → Accueil vide propre (états vides DoD).

---

## MOCKUP DE RÉFÉRENCE (à consulter dès le Bloc A3, tout du long)
Le design pixel-défini des 16 écrans MVP existe (CLAUDE.md §19.16) :
`LYXO Screens Braise.dc.html` — accessible via le MCP `claude_design` en
session, ou le bundle dans `/design/handoff/`. Chaque écran codé dans
les Blocs A3 à F doit matcher ce mockup pixel-perfect (dimensions,
couleurs, layout) — implémenté en NativeWind, pas copié en structure
HTML. En cas de doute visuel : le mockup prime sur LYXO_UI_PROMPT.md.

## BLOC B — LE LOGGER (S3-S5) · le cœur du aha moment

### B1. Bibliothèque d'exercices (1-2 sessions)
- Import ExerciseDB : 200 exos traduits FR (relecture échantillon, 18.10).
- Pack embarqué ~50 GIFs (assumption §19.5) + téléchargement arrière-plan
  wifi + cache pour le reste. Exos custom (5 max gratuit).
✅ Sortie : recherche/liste exos fonctionne en mode avion (pack de base).

### B2. Workout Logger (2-3 sessions) — LA zone critique
- Écran séance : poids | reps côte à côte (audit design 2.8), clavier
  custom sticky, steppers ≥ 56px sensibles à l'unité (±2,5 kg / ±2.5-5 lbs),
  valider en 1 tap, formats par locale. RÈGLE §19.15 : stockage weight_kg
  canonique, lbs = affichage pur.
- Rest timer plein écran (anneau-jauge derrière, ±15s, skip).
- Templates de séance + splits + rotation.
- Détection PR locale (4 types) + règles anti-triche sociales (18.1)
  dans lib/pr-detection.ts + tests unitaires (DoD 5).
- Célébration PR (carte partageable, pas de photo IA — audit 1.6).
- Écran résumé de fin de séance (peak-end, audit §4.5).
- TOUT fonctionne 100% offline sur WatermelonDB local (pas encore de sync).
✅ Sortie : log d'un set < 5s chrono en salle, mode avion complet.

---

## BLOC C — LA SYNC (S5-S7) · le socle, ne jamais compresser

### C1. Backend /sync (1-2 sessions)
- Protocole WatermelonDB pull/push : deleted_at partout, pagination 500
  rows + has_more (18.4), idempotence push, LWW silencieux (Q12a).
- Enforcement 1 appareil actif (devices, invalidation de l'ancien token).
✅ Sortie : tests d'intégration du protocole (création/édition/suppression
offline sur 2 comptes, rejeu, pagination).

### C2. Intégration app (1-2 sessions)
- Sync auto (ouverture, fin de séance, retour réseau), indicateur SYNCED
  discret, micro-texte "Enregistré sur ton téléphone ✓" (3 premières
  séances, audit §4.2).
- Torture tests DoD : mode avion pendant séance complète → sync ; kill
  app mid-séance ; login sur 2e appareil.
✅ Sortie : ZÉRO perte de données sur les scénarios de torture. Kill switch
sync (DoD 8) en place.

---

## BLOC D — PROGRÈS & PROFIL (S8-S9)

### D1. Écran Progrès (1 session)
- Graphes 1RM estimé (calcul sur TOUT l'historique — Q13b), volume,
  heatmap ember (4 opacités #C73E3A — §19.11, "bleue" = vestige Glace
  corrigé), segmented control périodes.
- Masquage consultation > 90 jours (gratuit) + upsell doux, notif J75 (18.6).
### D2. Profil + compte (1-2 sessions)
- Profil (grille stats 3 colonnes, heatmap ember §19.11), édition, compte privé,
  paramètres (Data Saver, "séances privées", opt-out rivalités 18.2).
- Suppression de compte in-app + page web + export JSON gratuit (18.5, Q14).
- Note : la page web compte/suppression rejoint la liste des 3 pages
  couvertes par Playwright en Phase 3 (/pay, /invite, /account).
✅ Sortie : profil complet, RLS privé vérifiées, suppression testée bout en bout.

---

## BLOC E — LE SOCIAL (S10-S11) · dense, surveiller le planning

### E1. Graphe social + feed (1-2 sessions)
- Follow asymétrique, demandes pour comptes privés, follows mutuels
  (matérialisés — base des rivalités).
- Feed abonnés : séances auto en format compact (Q7c), pull-to-refresh,
  skeletons #141414.
### E2. Rivalités — les différenciateurs (1-2 sessions)
- Leaderboard PRs entre follows mutuels (poids brut, anti-triche 18.1).
- Conquête : détection de dépassement → notif au détrôné + follows communs
  (Q9b). Trace "Titre à reprendre" sur le profil, expiration 6 mois,
  toggle masquage (18.2).
### E3. Stories (1-2 sessions) — Q23a avec garde-fous
- Carte-stats par défaut (offline-safe) ; photo perso optionnelle :
  compression ≤ 300 Ko WebP, file offline + retry, NSFW-check à l'upload,
  Data Saver = photo au tap, purge cron 24h.
- Partage externe (image générée → WhatsApp/Instagram).
### E4. Push + modération (1 session)
- Expo Push : Conquête, demandes de follow, coach. Signalement + auto-hide
  à 3 + écran admin minimal (liste des signalés) pour toi.
⚠️ Soupape : si E3 déborde → la photo perso glisse en S13, la carte reste (§19.7.5).
✅ Sortie : boucle sociale complète entre 3 comptes de test.

---

## BLOC F — COACH MODE V1 (S11-S12, chevauche E)

### F1. Programmes (1-2 sessions)
- Builder de programme libre (exos + séries × reps + charge cible ou %1RM,
  cycle au choix du coach — Q18), assignation à un client.
- Côté client : suivre le programme dans le logger (pré-rempli), écart
  prévu/réalisé visible coach.
### F2. Liaison coach-client (1 session)
- coach_clients many-to-many (Q20), invitation lyxo.app/invite/{code} +
  Android App Links natifs + page web fallback Play Store (Q21b, Q16a).
- Consentement explicite ("Ton coach verra tes séances…" Q17), limite
  3 clients (Découverte), bouton WhatsApp (Q19b — pas de messagerie).
✅ Sortie : parcours réel coach → lien WhatsApp → client installé → lié →
programme assigné → séance suivie → coach voit l'écart.

---

## BLOC G — BETA (S12)

- Play Console : app créée, Internal Testing track, Play App Signing
  activé au premier upload (§19.6), fiche minimale, suppression de compte OK.
- ⚠️ RÈGLE GOOGLE COMPTES PERSONNELS RÉCENTS (à vérifier sur TON compte) :
  20 testeurs minimum en test fermé pendant 14 jours consécutifs AVANT
  l'autorisation de publication publique. Ta beta la remplit naturellement
  (10 coachs + clients ≥ 20) — mais compter ces 14 jours dans le calendrier
  S12 → lancement, et recruter les testeurs avec adresses Gmail.
- Canal de retour unique : formulaire Tally/Google Forms (modèle téléphone,
  quoi, capture) — pas de bugs éparpillés sur WhatsApp. Questions d'USAGE
  ("as-tu réussi X du premier coup ?"), pas d'avis design. Beta bornée :
  2-4 semaines max, date de fin annoncée dès le départ.
- UpdateChecker (expo-updates) : composant racine qui télécharge l'OTA en
  arrière-plan et propose "Mettre à jour maintenant" via reloadAsync —
  avec garde __DEV__. Livré ici (les OTA commencent avec la beta).
- Discipline OTA gravée : OTA = JS uniquement ; toute nouvelle lib native
  = nouveau .aab ; toute OTA touchant les appels backend doit être
  compatible avec l'ANCIENNE et la nouvelle version du schéma (les deux
  coexistent sur le terrain).
- EAS Update configuré (hotfix JS OTA).
- Onboarding des 10 coachs (recrutés depuis S1) + leurs clients.
- Suite smoke Maestro (7 flows, lancée avant chaque release, pas à
  chaque commit) : signup→onboarding · séance complète offline→sync
  (setAirplaneMode) · célébration PR · follow→feed · invitation coach→
  liaison · suppression de compte · mot de passe oublié→reset→auto-login
  (TESTING.md §1.3, audit doc passe 6).
- PostHog branché MAINTENANT (pas avant — instrumenter des écrans qui
  changent chaque semaine = travail jeté) : événements du funnel
  (signup, première séance, J1/J7, partage story, invitation coach).
- Dashboard de métriques : J1/J7 retention, séances/user, taux offline,
  crash-free (Sentry), funnel invitation coach (PostHog).
✅ Sortie : beta vivante. Critères PROJECT_BRIEF §3 en observation
(J7 ≥ 40% excellent · 25-40 itérer · < 20% après 2 cycles = pivot).

---

## HORS MVP — RAPPEL DES PORTES FERMÉES
Discover public (S13-S16) · billing (Phase 3, BILLING_FLOW.md prêt — ne
créer AUCUNE table subscriptions/payments avant) · marketplace/wallet/payout
(V2, §18.9) · messagerie · nutrition · iOS · EN.

## OUTILLAGE PHASE 3 (avec le billing, pas avant)
- Playwright : tests E2E des 3 pages web critiques — /pay (parcours token
  → plan → PawaPay simulé → confirmation + cas d'erreur token expiré/
  utilisé), /invite/{code} (fallback web → Play Store), /account
  (suppression + export JSON). ~1 journée, au moment où ces pages
  encaissent de l'argent réel.
- Uptime monitoring (Better Stack ou UptimeRobot, free tier) : ping de
  l'API Render + endpoint webhook — si Render tombe, le savoir AVANT
  qu'un client paie dans le vide.
- Resend : vérification domaine lyxo.app (prérequis §A1) + templates
  J12/J14/J21 via le MCP.
- Tests IAP Sandbox (voie RevenueCat) AVANT toute mise en prod du billing :
  License Testing Google (Gmail du device de test, RESP_LICENSE_APPROVED),
  achats sur VRAI appareil via le track de test (jamais l'émulateur),
  temps accéléré des abonnements (1 mois = 5 min, 1 an = 30 min Android —
  vérifier les renouvellements ET l'expiration/reverrouillage propre des
  features premium), carte de test refusée → message d'erreur propre.
- ⚠️ BOUTON "RESTAURER LES ACHATS" obligatoire sur le paywall IAP
  (exigence Apple de validation, et nécessaire au changement de téléphone)
  — restoration via RevenueCat, à ajouter au BILLING_FLOW voie B.
- ⚠️ LIEN "ANNULER MON ABONNEMENT" obligatoire (politique Google
  Subscriptions, libre-service) dans Paramètres — voir BILLING_FLOW §4.5bis.
- ⚠️ Permission `com.android.vending.BILLING` : vérifier explicitement
  sa présence dans le manifest généré (normalement automatique via le
  plugin Expo RevenueCat) — ne pas découvrir son absence à un rejet.
- Setup Play Console (produits AVANT ou APRÈS le .aab, les deux marchent —
  séquence complète : BILLING_FLOW §4.5bis) : Payments profile d'abord
  (⚠️ vérifier Cameroun), puis Billing Library, produits, license testing,
  upload .aab Internal Testing.

## ORDRE DE LECTURE D'UNE SESSION CLAUDE CODE
1. PROJECT_BRIEF.md (le pourquoi + non-goals)
2. CLAUDE_LYXO_V3.md §18-19 (les règles)
3. Ce fichier — le bloc du jour uniquement
4. PRICING.md / BILLING_FLOW.md si le bloc touche au premium
