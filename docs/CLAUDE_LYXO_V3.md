# CLAUDE.md — LYXO Project Context
# Version : 3.0 — Synchronisé avec LYXO_Plan_Complet_V16.md + PRICING.md
# Dernière mise à jour : Juillet 2026
# RÈGLE ABSOLUE : tout prix, trial, commission ou canal de vente vit dans
# PRICING.md. Ce fichier n'en contient AUCUNE copie. Si un chiffre pricing
# apparaît ailleurs, c'est un bug de documentation à corriger.
# Lead Architect : Lionel Mayi Mayi

> Ce fichier est lu automatiquement par Claude Code à chaque session.
> Il est la source de vérité opérationnelle du projet.
> En cas de conflit entre ce fichier et une instruction orale, ce fichier a la priorité.
> En cas de doute non couvert ici : STOP — demander à Lionel avant d'agir.

---

## 0. IDENTITÉ DU PROJET — Lire en premier

| Champ | Valeur |
|---|---|
| Nom de l'app | LYXO |
| Domaine | lyxo.app |
| Bundle ID Android | com.lyxo.app |
| Bundle ID iOS | com.lyxo.app |
| Tagline FR | Soulève plus. Ensemble. |
| Tagline EN | Lift more. Together. |
| Plateforme prioritaire | Android (85% des devices en Afrique) |
| Marché de lancement | Afrique francophone (Cameroun, CI, Sénégal) |
| Marché secondaire | Diaspora Europe, USA, Canada |
| Ambition | Marché mondial Phase 3+ |
| Développeur | Lionel Mayi Mayi — solo dev |
| Device de test principal | Google Pixel 8, Android 16 |

### Ce qu'est LYXO en une phrase
LYXO est un tracker de musculation social, offline-first, à cible mondiale
avec entrée Afrique francophone (PROJECT_BRIEF §0) — avec une couche sociale
(feed abonnés, Stories 24h ; Discover public = Phase 8) et un Coach Mode V1
(programmes, suivi clients — la VENTE de programmes est V2, §18.9).
La nutrition est HORS MVP (PROJECT_BRIEF non-goal 8 — aucun code, aucune
table nutrition avant décision écrite).

### Ce que LYXO n'est PAS
- Pas une app de cardio ou de running (Strava = concurrent cardio, pas notre cible)
- Pas une app de bien-être ou de méditation
- Pas une app avec IA pour la nutrition (calcul par grammes uniquement, sans IA)
- Pas une app avec mode invité sans compte (inscription obligatoire dès le premier lancement)

---

## 1. STRUCTURE DES 3 TIERS — Comprendre le produit

### Tier 1 — LYXO Gratuit (acquisition)
Gratuit à vie ("Tracker Core gratuit à vie" — ne jamais écrire "100% gratuit" en marketing). Le social est entièrement gratuit — c'est intentionnel pour créer l'effet de réseau.

Fonctionnalités exactes :
1. Création de routines (PPL, Full Body, Upper/Lower, custom)
2. Log de séance en temps réel (clavier custom, autofill, timer repos haptic)
3. Historique des séances (90 derniers jours — masqué au-delà, jamais supprimé)
4. Bibliothèque 200 exercices ExerciseDB (pack ~50 GIFs embarqué + 150 à la
   demande — §19.5 ; PRD 1.2 fait foi)
5. Exercices custom (limité à 5 en gratuit)
6. Social V1 : feed abonnés + Stories 24h (Discover public, likes,
   commentaires publics = Phase 8, jamais en MVP — §18.11)
7. Leaderboard de PRs entre amis
8. Notifications de Conquête ("Massa vient de dépasser ton record au bench — 102kg vs ton 100kg")
9. Trace "Titre à reprendre" ("Record battu par @pseudo le 12 juin") — visible sur le profil,
   EXPIRE après 6 mois si non reprise (archivée dans l'historique de rivalités).
   Toggle Paramètres : "Masquer les titres perdus sur mon profil".
   ⚠️ PRs sociaux soumis aux règles anti-triche (Section 18.1).

### Tier 2 — LYXO+ (monétisation principale)
Trial : 14 jours gratuits (SOSA 2026 — 70% meilleure conversion vs 3 jours).
Prix annuel affiché en default (SOSA 2026 — 2x plus de RPI vs mensuel).

Fonctionnalités SUPPLÉMENTAIRES vs Gratuit (⚠️ le paywall réel n'affiche QUE
les lignes disponibles à date — jamais une feature non livrée, exigence
stores + M7 audit doc) :
1. Historique illimité (débloque ce qui était masqué, rien n'est supprimé) [dispo dès activation billing]
2. Automated Workout Progression — dicte poids/reps exacts basés sur les données passées [dispo dès activation billing]
3. Velocity & Fatigue Tracking (RPE 1-10 + volume hebdo = score de récupération) [dispo dès activation billing]
4. Analytics Discover exclusifs (cloner programme + réadaptation 1RM) [dépend du Discover public — Phase 8+]
5. Séance Fantôme (voir les sets d'un ami en direct, sans chat) [V2 — PRD 1.2]
6. Pont Coach-Élève (programmes interactifs d'un coach Coach Pro) [V2 — dépend marketplace]
7. Bibliothèque programmes certifiés illimitée [V2 — dépend marketplace]
8. Exercices custom illimités [dispo dès activation billing]
9. Cloud Backup automatique multi-device [dispo dès activation billing]
10. Export PDF/CSV stats [dispo dès activation billing]

Pricing officiel : voir PRICING.md (source unique).
Rappel non contractuel : Afrique 3 500 FCFA/mois ou 15 000 FCFA/an (annuel DEFAULT,
le trimestriel N'EXISTE PLUS) · Occident 4,99€/34,99€ · Trial 14 jours partout
(Afrique = flag backend trial_expires_at, AUCUN paiement demandé à l'activation).

### Tier 3 — LYXO Coach Pro (SaaS B2B)
Fonctionnalités SUPPLÉMENTAIRES vs LYXO+ :
1. Tableau de bord gestion clients illimités (le tier gratuit "Coach Découverte" = 3 clients max, 1 programme en vente, commission 20% — voir PRICING.md §3)
2. Assignation de programmes à distance
3. Suivi performances clients en temps réel (push dès fin de séance)
4. Messagerie privée coach-client (audio, vidéo, texte)
5. Stories éphémères FOMO (24h, copiables en 1 tap par les abonnés)
6. Vente de programmes (prix libre, Lyxo prélève 15% → 10% au-delà de 100 000 FCFA de ventes brutes/mois)
7. Dashboard revenus temps réel

Pricing officiel : voir PRICING.md §3 (source unique).
Structure : Coach Découverte (gratuit, 3 clients, 1 programme, 20%) → Coach Pro
(7 000 FCFA/mois · 25 000 FCFA/an · $11.99/$89.99 ; commission 15% → 10% ≥ 100k FCFA/mois).
Pas de trial Coach Pro : le tier Découverte EST le trial.

Tunnel de vente programmes coach (5 étapes) :
1. Coach crée le programme dans l'app
2. Coach fixe son prix en FCFA ou EUR
3. Lyxo génère lyxo.app/p/{id} — partageable WhatsApp/Instagram/TikTok
4. Client clique → s'inscrit si pas de compte → paye (Lyxo prélève 15%)
5. Programme livré automatiquement dans le tableau de bord du client

---

## 2. ARCHITECTURE TECHNIQUE — Non négociable

### Stack complète (ne jamais dévier sans validation de Lionel)

| Couche | Choix imposé | Interdit |
|---|---|---|
| Framework mobile | React Native + Expo SDK 51+ | Flutter, Capacitor, Ionic |
| Navigation | Expo Router v3 (file-based) | React Navigation manuel |
| State management | Zustand | Redux, MobX, Jotai, Context seul |
| DB locale offline | WatermelonDB (SQLite) | AsyncStorage seul, MMKV seul, Realm |
| Animations | React Native Reanimated 3 | Animated API native seule |
| Styling | NativeWind v4 (Tailwind RN) | StyleSheet pur, Tamagui, Restyle |
| Charts | Victory Native XL | Recharts, react-native-chart-kit, Victory Mobile |
| Backend runtime | Node.js 20 LTS + Express | Bun, Deno, Next.js API routes |
| ORM backend | Prisma | Drizzle, Knex, SQL brut direct |
| DB distante | PostgreSQL via Supabase | Firebase Firestore, MongoDB, PlanetScale |
| Auth | Supabase Auth | Auth0, Firebase Auth, Clerk |
| Storage fichiers | Supabase Storage | AWS S3 direct, Cloudinary, Imgur |
| Realtime | Non utilisé en V1 (Séance Fantôme = V2 ; si besoin V2 : Supabase Realtime) | Pusher, Socket.io custom |
| Cache | AUCUN avant 10 000 DAU (vue matérialisée Postgres — §16.6) | Redis/Upstash (interdit < 10k DAU), Memcached |
| Paiement Afrique | PawaPay (UNIQUE — décision finale fin Juil. 2026, API v2 deposits + payouts, 20+ marchés) | CinetPay puis NotchPay (écartés successivement — historique dans PRICING.md §6) |
| Paiement international | RevenueCat UNIQUEMENT (Google Play Billing + StoreKit — BILLING_FLOW voie B) | Stripe direct, PayPal, Braintree |
| Abonnements stores | RevenueCat | IAP direct (trop complexe) |
| Push notifications | Expo Notifications + FCM | OneSignal, Pusher Beams |
| Deep links | Android App Links natifs + page web fallback (§19.4, Q21b) | Branch.io (écarté — risque tarifaire), Firebase Dynamic Links |
| Hosting backend | Render.com | Heroku, Railway, Fly.io |
| Monitoring erreurs | Sentry | Bugsnag, Crashlytics seul |
| Analytics | PostHog | Mixpanel, Amplitude, Firebase Analytics |
| i18n | i18next + react-i18next | react-intl, LinguiJS |

### Règle librairies
JAMAIS installer une nouvelle dépendance sans :
1. Lister la librairie à Lionel avec la raison
2. Vérifier l'impact sur la taille du bundle (critique pour Android bas de gamme)
3. Attendre confirmation avant npm install

---

## 3. ARCHITECTURE OFFLINE-FIRST — Règle absolue

### Ce qui doit fonctionner à 100% SANS internet
- Logger un set (poids, reps, type)
- Créer/modifier/supprimer un workout
- Accéder à l'historique des séances
- Voir les graphes de progression (données locales)
- Naviguer dans la bibliothèque d'exercices
- Calculer le volume et détecter les PRs

### Ce qui peut dégrader gracieusement hors ligne
- Feed Discover (afficher le cache local, bannière discrète si > 1h)
- Stories des abonnés (même règle)
- Profil public d'un autre user

### Bannière offline — règle stricte de contextualisation
- JAMAIS sur l'écran Home workout en cours
- JAMAIS sur l'écran Log (séance active)
- JAMAIS sur Progress (données locales WatermelonDB)
- OUI sur Discover si cache > 1h
- OUI sur Stories des abonnés si cache > 1h
- OUI sur le profil distant d'un autre user

### Stratégie de sync (Last Write Wins)
```
Action user → WatermelonDB local (synced: false)
              ↓ dès que réseau disponible
              Supabase UPSERT ON CONFLICT (local_id)
              ↓ succès
              WatermelonDB local (synced: true)
```
- `local_id` = UUID généré côté appareil AVANT toute sync
- `updated_at` = timestamp de la dernière modification locale
- En cas de conflit : le `updated_at` le plus récent gagne (Last Write Wins)
- JAMAIS de spinner bloquant pendant une action de tracking

---

## 4. DESIGN SYSTEM — Règles strictes

### Palette de couleurs — SOURCE UNIQUE : §19.11 "Braise"

⛔ L'ancien tableau de tokens (fond #0A0A0A, cards #141414, texte #FFFFFF,
warning violet #A78BFA...) est SUPPRIMÉ — il datait des palettes V7/V14.
Les seuls tokens valides sont ceux de §19.11 (et LYXO_UI_PROMPT.md) :
bg #0B0A0A · card #151312 · input #1E1B1A · border #2C2826 ·
muted #8E8781 · fg #F5F1EC (blanc os) · ember #C73E3A · steel #3A3F47.
Warnings/infos : texte blanc os sur fond acier #3A3F47 — ZÉRO bleu,
ZÉRO violet (§12), zéro vert, zéro jaune/orange.

### Règle de discipline colorimétrique — CRITIQUE
Le rouge braise #C73E3A est réservé EXCLUSIVEMENT à :
- Boutons CTA primaires (Démarrer séance, Terminer, Publier, Vendre)
- Logo et wordmark LYXO
- Badge "Nouveau PR" (UN SEUL élément visible par écran)

INTERDIT en rouge :
- Bordures de cards
- Tags décoratifs ou secondaires
- Highlights non liés à une action utilisateur
- Deux éléments rouge visibles simultanément sur le même composant

Le vert et le jaune/orange sont INTERDITS dans toute l'interface.
(Raison : rouge + vert + jaune sur fond noir = lecture drapeau camerounais involontaire)

### Typographie
- Police unique : Inter (Regular, Bold, Black)
- Chiffres de stats : Inter Black 28-36px
- Labels UI : Inter Regular 14-16px
- Pas de serif, pas de script

### Principes UX non négociables
1. Logger un set en moins de 3 secondes (règle absolue)
2. Clavier numérique INLINE sticky en bas d'écran (JAMAIS modal)
3. Swipe up/down sur les inputs de poids = +2.5kg / -2.5kg
4. Vibration haptic sur chaque validation de set
5. Vibration + son + animation confetti sur chaque PR détecté
6. One thumb friendly — éléments interactifs dans la zone basse
7. Dark mode activé par défaut

### Data Saver Mode
Quand activé (auto en 3G/4G ou manuel) :
- GIFs exercices → JPG statiques
- Animations Reanimated désactivées (transitions = 0ms)
- Célébrations PR = texte simple, pas confetti
- Images Discover/Stories = qualité réduite

---

## 5. PAIEMENTS — Architecture géolocalisée

### Détection de la voie de facturation (SOURCE : BILLING_FLOW.md §2)
- AUCUN numéro de téléphone à l'inscription (§19.1, décision Q1c).
- Ordre : 1) pays DÉCLARÉ à l'onboarding (liste `config/billing-regions.ts`,
  marchés PawaPay lancés uniquement) · 2) IP en confirmation (jamais seule
  décisive — VPN ; écart loggé pour revue). Résultat stocké :
  `profiles.billing_region` ('africa_momo'|'intl_iap'), immutable côté client.
- ⛔ L'ancien algorithme "indicatif tél +237 > pays > IP" et la liste
  AFRICA_COUNTRIES incluant GH/NG/KE sont ABANDONNÉS (journal PRICING §6).

### Écran A — International (billing_region = intl_iap)
- Prix en EUR ou $ (jamais de FCFA visible)
- Plan annuel DEFAULT (34,99€ affiché comme 2,92€/mois)
- Paiement : RevenueCat UNIQUEMENT (Google Play Billing / StoreKit) —
  trial 14 j natif, bouton "Restaurer les achats", lien "Annuler mon
  abonnement" (BILLING_FLOW §5). ⛔ AUCUN Stripe web checkout — écarté.
- Option secondaire : plan mensuel 4,99€

### Écran B — Afrique (billing_region = africa_momo) — CONFORMITÉ STRICTE
- Prix en FCFA uniquement, format français : 3 500 · 15 000 (jamais 3,500)
- Pass Mensuel 3 500 FCFA · Pass Annuel 15 000 FCFA (DEFAULT, badge "Meilleure valeur")
- CTA trial (si trial_used=false) : "Commencer mes 14 jours gratuits"
  + "Puis 15 000 FCFA/an. Sans engagement."
- ⚠️ CANAL LÉGAL (BILLING_FLOW §4.1/§9, confirmé PAR ÉCRIT par Google) :
  ZÉRO bouton/lien/mention de paiement in-app. L'écran ne contient
  JAMAIS : une URL, le nom "lyxo.app", les verbes payer/activer/s'abonner,
  un logo d'opérateur (MTN/Orange), une mention PawaPay ou "paiement
  sécurisé". Seule ligne autorisée : "Consulte l'email que nous venons de
  t'envoyer pour les prochaines étapes."
- L'invitation à payer vit EXCLUSIVEMENT dans l'email :
  lien `https://lyxo.app/pay?token={token}` (token seul — JAMAIS d'uid en
  clair, BILLING_FLOW §4.2) → page web PawaPay MoMo (logos/confiance
  UNIQUEMENT sur cette page web) → webhook → subscription active (statut
  premium DÉRIVÉ, §20.1) → sync.
- iOS : IAP RevenueCat uniquement, aucun texte informatif non plus (Apple
  interdit même l'allusion à un paiement externe — BILLING_FLOW §1).

### Règles paiement critiques
- JAMAIS de polling pour vérifier le statut PENDING Mobile Money
- Push silencieuse depuis le webhook PawaPay quand paiement confirmé — la réception de ce push DOIT déclencher un appel explicite à /sync (pas une simple vérification locale), sinon un user offline-first qui a payé sur le web croira son paiement échoué (§20.4)
- Idempotence : ignorer les webhooks en double (provider_tx_id unique)
- Configurer grace periods RevenueCat pour Android (31% annulations = billing failure)
- iOS hors UE : RevenueCat uniquement, jamais de lien Stripe direct

### Table payments — provider valide
```
provider CHECK IN ('pawapay','revenuecat')
```
(pawapay = prestataire unique Afrique ; revenuecat = voie IAP internationale)

---

## 6. SCHÉMA DE DONNÉES — ⛔ SECTION SUPPRIMÉE (audit doc, Juillet 2026)

**LE schéma faisant foi est DATA_MODEL.md — ne jamais recopier de SQL ici.**
L'ancien résumé ci-dessous est PÉRIMÉ et NE DOIT PAS être utilisé : il
contenait des colonnes interdites (`premium_expires_at`, `premium_source`,
`renewal_type` — violation §20.1 : statut premium DÉRIVÉ, jamais stocké),
omettait des colonnes obligatoires (`billing_region`, `trial_used`,
`trial_expires_at`, `weight_unit`, `deleted_at`, `updated_at`), utilisait
des noms divergents (`unit`/`avatar_url` vs `weight_unit`/`avatar_initials`),
un enum pr_type divergent, et des tables hors scope V1 (foods, meal_logs,
meal_items = nutrition non-goal 8 ; posts = Discover Phase 8, à spécifier
dans DATA_MODEL au début de la Phase 8 uniquement).

<!-- ARCHIVE PÉRIMÉE — conservée uniquement pour l'historique, NE PAS UTILISER :
profiles
  id (uuid, PK → auth.users), username (unique), display_name,
  avatar_url, language ('fr'|'en'), unit ('kg'|'lbs'),
  data_saver (bool), is_coach (bool), is_reviewer (bool, exclu des stats),
  premium_expires_at (timestamptz), premium_source ('pawapay'|'revenuecat'),
  renewal_type ('auto'|'manual'), country (ISO code), gym_id

workouts
  id, user_id → profiles, local_id (unique, clé WatermelonDB),
  title, started_at, finished_at, duration_secs,
  total_volume_kg, total_sets, is_template, synced_at

workout_exercises
  id, workout_id → workouts, exercise_id → exercises, order_index

sets
  id, workout_exercise_id → workout_exercises, local_id,
  set_number, reps, weight_kg, duration_secs,
  set_type ('normal'|'warmup'|'dropset'|'superset'), rpe (1-10)

exercises
  id, external_id (ExerciseDB), name_fr, name_en,
  body_part_fr, body_part_en, target_fr, target_en,
  equipment, gif_url (Supabase Storage), difficulty,
  is_custom (bool), created_by → profiles (null si officiel)

personal_records
  id, user_id → profiles, exercise_id → exercises,
  workout_id → workouts,
  pr_type ('max_weight'|'estimated_1rm'|'max_volume'|'max_reps'),
  value, previous_value, achieved_at
  UNIQUE (user_id, exercise_id, pr_type)

posts (Discover)
  id, user_id → profiles, workout_id (nullable),
  media_url, media_type ('photo'|'video'),
  caption, stats_overlay (JSONB),
  likes_count, comments_count, saves_count,
  score (float, trending), is_public (bool)

stories
  id, user_id → profiles, media_url,
  stats_overlay (JSONB), expires_at (now() + 24h),
  views_count

foods
  id, external_id (Open Food Facts), name_fr, name_en,
  calories_per_100g, protein_per_100g, carbs_per_100g,
  fat_per_100g, is_custom, created_by → profiles (nullable)

meal_logs
  id, user_id → profiles, local_id, meal_type
  ('breakfast'|'lunch'|'dinner'|'snack'), logged_at

meal_items
  id, meal_log_id → meal_logs, food_id → foods,
  quantity_g, calories, protein_g, carbs_g, fat_g

payments
  id, user_id → profiles, program_id → coach_programs (nullable),
  amount, currency ('XAF'|'EUR'|'USD'),
  provider ('pawapay'|'revenuecat'),
  provider_tx_id (UNIQUE — idempotence),
  status ('pending'|'provisional_access'|'complete'|'failed'|'refunded'),
  payment_method ('mtn_momo'|'orange_money'|'wave'|'stripe_card'|'apple_pay'|'google_pay'),
  renewal_type ('auto'|'manual')

coach_programs
  id, coach_id → profiles, title, description,
  price_xaf, price_eur, duration_weeks,
  is_published, sales_count

follows
  follower_id → profiles, following_id → profiles
  PRIMARY KEY (follower_id, following_id)
FIN DE L'ARCHIVE PÉRIMÉE -->

---

## 7. CONVENTIONS DE CODE

### Structure des dossiers — ⛔ PÉRIMÉE : LLD.md §1.1 FAIT FOI

⚠️ L'arbre ci-dessous est une ANCIENNE version conservée pour historique.
La structure exacte et opposable est celle de LLD.md §1.1 (qui inclut
désormais `(auth)/language.tsx` et `(auth)/offline.tsx`, décision M8 audit
doc). Divergences connues de l'arbre ci-dessous à NE PAS reproduire :
`lib/payments/stripe.ts` (Stripe écarté), `store/useAppStore`/`useCoachStore`
(stores officiels : LLD §1.1), `locales/` (i18n officiel : `lib/i18n/`).
Seule reste NORMATIVE la règle langue (language.tsx = premier écran absolu,
voir "Langue — Règle stricte" ci-dessous).

```
lyxo-app/
├── app/                      ← Expo Router (file-based routing)
│   ├── (auth)/
│   │   ├── language.tsx      ← PREMIER ÉCRAN (choix FR/EN avant inscription)
│   │   ├── offline.tsx       ← DEUXIÈME ÉCRAN (onboarding offline-first)
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── onboarding.tsx    ← Objectif, niveau, split préféré
│   ├── (tabs)/
│   │   ├── index.tsx         ← Home (workout du jour, activité amis)
│   │   ├── log.tsx           ← Logger une séance (ZONE CRITIQUE UX)
│   │   ├── progress.tsx      ← Graphes, PRs, heatmap, stats
│   │   ├── discover.tsx      ← Feed public communauté
│   │   └── profile.tsx       ← Profil, historique, paramètres
│   ├── workout/
│   │   └── [id].tsx          ← Séance active en cours
│   ├── program/
│   │   └── [id].tsx          ← Programme coach (deep link)
│   └── _layout.tsx
├── components/
│   ├── ui/                   ← Boutons, cards, badges génériques
│   ├── workout/              ← SetRow, ExerciseCard, RestTimer, PRBadge
│   ├── social/               ← StoryCircle, DiscoverPost, ReactionBar
│   └── coach/                ← ClientCard, ProgramBuilder, RevenueWidget
├── store/
│   ├── useAuthStore.ts
│   ├── useWorkoutStore.ts    ← ZONE CRITIQUE
│   ├── useAppStore.ts        ← dataSaver, language, unit, syncStatus
│   └── useCoachStore.ts
├── db/
│   ├── schema.ts             ← Schéma WatermelonDB
│   ├── models/               ← Workout.ts, Set.ts, Exercise.ts...
│   └── sync/                 ← ZONE CRITIQUE — sync offline↔Supabase
├── lib/
│   ├── payments/             ← ZONE CRITIQUE (Phase 9 uniquement)
│   │   ├── pawapay.ts
│   │   └── revenuecat.ts
│   ├── workout-calculations/ ← ZONE CRITIQUE
│   │   ├── volume.ts
│   │   ├── oneRepMax.ts
│   │   └── detectPR.ts
│   ├── auth/                 ← ZONE CRITIQUE
│   ├── supabase.ts
│   └── i18n.ts
├── locales/
│   ├── fr/
│   │   ├── common.json
│   │   ├── exercises.json
│   │   └── notifications.json
│   └── en/
│       └── (mêmes fichiers)
├── types/
│   └── *.types.ts
├── assets/
│   ├── fonts/                ← Inter (Regular, Bold, Black)
│   └── images/
└── CLAUDE.md                 ← CE FICHIER
```

### Langue — Règle stricte

L'app NE démarre PAS en français par défaut.
Le PREMIER écran absolu (avant l'inscription, avant tout) est le choix de langue.

```
Premier lancement
      ↓
app/(auth)/language.tsx  ← OBLIGATOIRE avant tout autre écran
      ↓
  [ 🇫🇷 Français ]   [ 🇬🇧 English ]
      ↓
Choix sauvegardé immédiatement en AsyncStorage (user pas encore connecté)
      ↓
Toute l'app bascule dans la langue choisie dès ce tap
      ↓
app/(auth)/offline.tsx  ← onboarding offline-first
      ↓
app/(auth)/register.tsx
```

Règles dérivées :
- Aucun texte hardcodé dans aucun composant — toujours via i18next
- Si le choix de langue n'est pas encore fait → rediriger vers language.tsx
- Le choix est modifiable dans Paramètres → Langue à tout moment
- Changement de langue en cours de session = rechargement instantané sans redémarrage
- Langue stockée sur le profil Supabase une fois connecté (sync multi-device)
- Noms d'exercices affichés selon la langue du profil (name_fr ou name_en)
- Notifications push générées dans la langue du profil utilisateur
- Composants React : `PascalCase.tsx`
- Hooks : `useNomDuHook.ts`
- Stores Zustand : `useNomStore.ts`
- Utils : `camelCase.ts`
- Types : `nom.types.ts`
- Écrans Expo Router : `kebab-case.tsx` ou `[param].tsx`
- MAX 300 lignes par fichier — découper si dépassé

### Style de code
- Composants fonctionnels uniquement
- Commentaires logique métier → français
- Commentaires techniques génériques → anglais
- Aucun `console.log` en production (utiliser Sentry)
- Aucun `TODO` sans ticket associé

## 8. LANGUE ET LOCALISATION — Règles i18n

- Langue choisie par l'utilisateur au premier lancement (écran language.tsx)
- PAS de langue par défaut imposée — l'utilisateur décide avant même de s'inscrire
- Tout texte visible par l'utilisateur passe par i18next — jamais de texte en dur
- Variables et fonctions en anglais (convention industrie)
- Commentaires logique métier en français, commentaires techniques en anglais
- Fichiers de traduction dans locales/fr/ et locales/en/
- Clés i18n au format snake_case (ex: start_workout, new_pr, rest_timer)

---

### ZONE CRITIQUE — TypeScript strict + tests obligatoires
Fichiers dans `lib/payments/`, `lib/workout-calculations/`, `lib/auth/`, `db/sync/`

Règles :
- `strict: true` en TypeScript (zéro `any` sans commentaire justificatif)
- Tests unitaires obligatoires, couverture ≥ 80%
- Toute logique de calcul doit être une fonction pure (pas d'effet de bord)
- Zéro merge dans `main` sans test correspondant

### ZONE FLEXIBLE — UI et écrans
Fichiers dans `components/`, `app/`, `store/`

Règles :
- TypeScript standard suffit
- Tests optionnels — validation manuelle sur Pixel 8
- Vitesse d'itération > perfectionnisme

---

## 9. COMPORTEMENT ATTENDU DE CLAUDE CODE

### Claude agit seul (sans demander) pour
- Bugs d'affichage, erreurs de syntaxe, typos
- Erreurs de logique mineures dans un composant isolé
- Ajustements de style, spacing, couleurs
- Imports manquants, configurations mineures

### Claude s'ARRÊTE et présente des options pour
- Tout changement de schéma DB (table, colonne, contrainte)
- Tout changement de librairie ou de dépendance
- Toute modification dans les zones critiques (payments, sync, auth)
- Toute décision impactant plusieurs fichiers simultanément
- Toute contradiction avec une règle de ce CLAUDE.md
- Tout problème de sécurité détecté

### Format obligatoire quand Claude s'arrête
```
🛑 DÉCISION REQUISE

Problème : [explication en français simple, sans jargon]
Impact : [ce qui pourrait casser si on fait le mauvais choix]

Option A : [description] → Avantage : X | Inconvénient : Y
Option B : [description] → Avantage : X | Inconvénient : Y

Quelle option tu choisis ?
```

---

## 10. BUILD ET DÉPLOIEMENT

### Format de build Android — OBLIGATOIRE
```bash
# CORRECT — génère un .aab pour le Play Store
eas build --platform android --profile production

# JAMAIS pour le Play Store (.apk = rejeté par Google)
# Les .apk uniquement pour tests locaux / beta privée hors store
```

### Soumission stores
```bash
eas submit --platform android   # Play Store (.aab)
eas submit --platform ios       # App Store (.ipa)
```

### Avant toute soumission
1. Audit sécurité double passage (nettoyer contexte /clear entre les deux)
2. Vérifier : zéro clé API en dur, RLS activé sur toutes les tables Supabase
3. Tester sur Pixel 8 réel (pas émulateur)
4. Tester offline complet (mode avion pendant 10 minutes de tracking)
5. Tester Data Saver mode activé

---

## 11. SÉCURITÉ — Règles permanentes

- JAMAIS de clé API ou secret en dur dans le code → toujours `.env`
- `.env` JAMAIS commité sur Git → vérifier `.gitignore` avant chaque commit
- Row Level Security (RLS) activé sur TOUTES les tables Supabase sans exception
- Validation données côté SERVEUR (pas uniquement côté client)
- provider_tx_id UNIQUE sur la table payments (idempotence webhooks)
- Aucun log de données personnelles en production

---

## 12. PIÈGES À ÉVITER — Décisions déjà validées

| Piège | Décision validée |
|---|---|
| Clavier numérique en modal | NON — clavier inline sticky bottom toujours |
| Bannière offline sur l'écran workout | NON — jamais sur Log/Progress |
| Polling pour vérifier PENDING Mobile Money | NON — push silencieuse webhook uniquement |
| Vert ou orange dans la palette | NON — ember #C73E3A pour succès/PR, gris acier #3A3F47 pour structure, gris chaud pour warnings (palette Braise §19.11 : zéro bleu, zéro violet) |
| Animations Reanimated en Data Saver | NON — toutes désactivées en Data Saver |
| pawapay comme provider principal | OUI — décision finale fin Juil. 2026 (API v2 deposits + payouts, 20+ marchés dont CM, idempotence et metadata natives) |
| .apk pour le Play Store | NON — .aab obligatoire via EAS |
| Lien Stripe direct sur iOS hors UE | NON — RevenueCat uniquement hors UE |
| Supprimer les données > 90j pour les gratuits | NON — masquer, jamais supprimer |
| Mode invité sans compte | NON — inscription obligatoire dès le premier lancement |
| Police multiple (serif, script) | NON — Inter uniquement |
| Plus d'une couleur saturée par composant | NON — discipline Lift Card (1 couleur vive max) |

---

## 13. FEATURES INÉDITES — V2/V3 (ne pas implémenter en MVP)

Ces features sont documentées mais réservées aux phases ultérieures.
Ne pas les implémenter en Phase 1 même si techniquement tentant.

V2 : Séance Fantôme, Bataille de ville, Jumeaux de progression,
     Saisons Lyxo, Programme communautaire, Empreinte de force,
     Réseau de salles partenaires, Gym Matching (couplé à Ma Salle)

V3 : Lyxo Radio, Récit automatique de progression, Mode salle partagée offline,
     Partage programme par SMS, Tempo tracker audio, Abonnement performance

---

## 14. RÉFÉRENCE FINALE

Document de référence historique : LYXO_Plan_Complet_V16.md (ARCHIVE —
aucune règle opérationnelle n'y prime sur les 13 documents canoniques).
Les références opérationnelles sont : DATA_MODEL.md (schéma), API_SPEC.md
(contrats), LLD.md (structure), PRICING.md (prix), BILLING_FLOW.md (paiement).

En cas de doute non couvert par ce CLAUDE.md :
→ STOP. Demander à Lionel. Ne jamais supposer.

---

## 15. SPÉCIFICATIONS TECHNIQUES COMPLÈTES — Extraites des analyses V12/V13

> Ces sections sont directement exécutables par Claude Code sans ambiguïté.

---

### 15.1 Directives de développement strictes

```
PRIORITÉ NIVEAU 1 (Semaines 1-5) — Tracker Core
  → Logging sets/reps/poids, Autofill, Timer repos
  → WatermelonDB → Supabase Sync
  → Graphes Victory Native XL, Confetti PR

PRIORITÉ NIVEAU 2 (planning officiel : §18.11 / ROADMAP.md Phases 5-6) — Social Base
  → Follow system, Feed Abonnés
  → Stories Photo + Stats Overlay
  (⛔ Discover public Trending/Recent = Phase 8, jamais en MVP)

PRIORITÉ NIVEAU 3 (post-beta) — Scale & Paywall
  → Coach Mode V1 = Phase 6 du MVP (ROADMAP) ; marketplace = Phase 10
  → PawaPay/RevenueCat = Phase 9 (BILLING_FLOW.md)
  → Nutrition (non-goal 8), Gym Matching & Ma Salle : V2+, hors roadmap
```

Règle d'or : Un tracker qui fonctionne parfaitement hors ligne retient les
utilisateurs. Un réseau social buggé sans tracker solide provoque la désinstallation
en 24h. Ne jamais sacrifier le Niveau 1 pour avancer le Niveau 2.

**Contraintes techniques non négociables :**
- Saisie d'un set en < 3 secondes via clavier numérique custom — jamais le clavier système
- Bundle final < 30 MB (Android bas de gamme : Tecno Spark, Samsung A15)
- Images au format WebP exclusivement (pas PNG)
- Data Saver auto sur 3G/4G : GIFs exercices → JPG statiques

---

### 15.2 Schéma PostgreSQL complet — Version finale (Supabase RLS Ready)

```sql
-- Extension UUID
create extension if not exists "uuid-ossp";

-- 1. PROFILES
create table public.profiles (
    id uuid references auth.users primary key,
    username text unique not null,
    display_name text,
    avatar_url text,
    bio text,
    language text default 'fr' check (language in ('fr', 'en')),
    unit text default 'kg' check (unit in ('kg', 'lbs')),
    data_saver boolean default false,
    is_coach boolean default false,
    gym_id uuid default null,         -- V2 Ma Salle
    country text not null,            -- ISO 2 lettres (CM, CI, FR...) configuré à l'onboarding
    is_reviewer boolean default false,      -- compte de test review (exclu des stats)
    -- ⚠️ PAS de colonne is_premium NI premium_expires_at NI premium_source
    --    NI renewal_type : statut DÉRIVÉ de la table subscriptions
    --    + trial_expires_at (règle BILLING_FLOW §3), calculé par le backend
    --    dans le payload de sync. Une colonne physique créerait une double
    --    source de vérité (correction §20.1 — colonnes supprimées, audit doc).
    -- ⚠️ Colonnes obligatoires manquantes ici : billing_region, trial_used,
    --    trial_expires_at, weight_unit, is_private, deleted_at, updated_at —
    --    le DDL complet faisant foi est DATA_MODEL.md §2.1.
    created_at timestamptz default now()
);

-- 2. WORKOUTS
create table public.workouts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    local_id text unique not null,    -- UUID WatermelonDB — clé de sync
    title text,
    started_at timestamptz not null,
    finished_at timestamptz,
    duration_secs int default 0,
    total_volume_kg float default 0.0, -- Dénormalisé, calculé en fin de séance
    total_sets int default 0,
    notes text,
    is_template boolean default false,
    synced_at timestamptz default now()
);
create index idx_workouts_user_date on public.workouts (user_id, started_at desc);

-- 3. WORKOUT_EXERCISES (Pivot)
create table public.workout_exercises (
    id uuid primary key default gen_random_uuid(),
    workout_id uuid references public.workouts(id) on delete cascade not null,
    exercise_id uuid not null,        -- ID dataset ExerciseDB Pro
    local_id text unique not null,
    sequence_order int not null
);

-- 4. SETS
create table public.sets (
    id uuid primary key default gen_random_uuid(),
    workout_exercise_id uuid references public.workout_exercises(id)
        on delete cascade not null,
    local_id text unique not null,
    set_number int not null,
    reps int default 0,
    weight_kg float default 0.0,
    duration_secs int default 0,      -- Exercices isométriques (planche...)
    set_type text default 'normal'
        check (set_type in ('normal','warmup','dropset','superset')),
    rpe float check (rpe >= 1.0 and rpe <= 10.0),
    completed_at timestamptz default now()
);

-- 5. PERSONAL RECORDS
create table public.personal_records (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    exercise_id uuid not null,
    workout_id uuid references public.workouts(id) on delete cascade not null,
    pr_type text check (pr_type in
        ('max_weight','estimated_1rm','max_volume','max_reps')),
    value float not null,
    previous_value float,             -- Calcul différentiel immédiat (+5kg)
    achieved_at timestamptz default now(),
    unique (user_id, exercise_id, pr_type)
);

-- 6. POSTS & STORIES (Table unifiée — UI unifiée, distinction technique conservée)
create table public.posts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    workout_id uuid references public.workouts(id) on delete set null,
    media_url text,
    media_type text check (media_type in ('photo','video')),
    caption text,
    stats_overlay jsonb,              -- {volume, sets, duration, prs: []}
    is_public boolean default true,
    is_story boolean default false,   -- true = expire après 24h
    expires_at timestamptz default null, -- now() + '24 hours' si is_story = true
    likes_count int default 0,
    comments_count int default 0,
    saves_count int default 0,
    score float default 0.0,          -- Recalculé par Edge Function cron
    created_at timestamptz default now()
);
create index idx_posts_trending on public.posts (score desc)
    where is_public = true and (is_story = false or expires_at > now());
create index idx_posts_chrono on public.posts (created_at desc)
    where is_public = true;

-- 7. PAYMENTS
create table public.payments (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id),
    program_id uuid,
    amount int not null,
    currency text check (currency in ('XAF','EUR','USD')),
    provider text check (provider in ('pawapay','revenuecat')),
    payment_method text check (payment_method in (
        'mtn_momo','orange_money','wave','moov_money','free_money',
        'vodafone_cash','airtel_money','mpesa','paystack_card',
        'stripe_card','apple_pay','google_pay'
    )),
    provider_tx_id text unique,       -- IDEMPOTENCE : ignore les doublons webhook
    status text default 'pending'
        check (status in ('pending','provisional_access','complete','failed','refunded')),
    failure_reason text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
```

---

### 15.3 Logique métier centralisée — Fichiers de configuration

```typescript
// config/cache-limits.ts
export const CACHE_LIMITS = {
  MAX_CACHED_POSTS: 50,
  MAX_CACHED_STORIES: 30,
  MAX_CACHED_COMMENTS: 100,
  MAX_MEDIA_CACHE_MB: 100,
  STORY_EXPIRY_MS: 86_400_000,    // 24h
  POST_EXPIRY_MS: 86_400_000,     // 24h
  MEDIA_EXPIRY_MS: 172_800_000,   // 48h
  WORKOUT_DATA: 'NEVER_DELETE',   // Données critiques user
  NUTRITION_DATA: 'NEVER_DELETE'
};

// Indicateur sync — 4 états
export interface SyncIndicatorState {
  label: string;
  color: string;
  icon: 'cloud-check' | 'cloud-upload' | 'cloud-sync' | 'cloud-offline';
}
export function getSyncIndicator(
  status: 'synced' | 'syncing' | 'offline_fresh' | 'offline_stale'
): SyncIndicatorState {
  switch (status) {
    case 'synced':
      return { label: 'Synchronisé', color: '#3A3F47', icon: 'cloud-check' }; // acier (Braise §19.11)
    case 'syncing':
      return { label: 'Synchronisation...', color: '#3A3F47', icon: 'cloud-sync' }; // acier — zéro violet (§12, §19.11)
    case 'offline_fresh':
      return { label: 'Hors ligne (Cache récent)', color: '#888888', icon: 'cloud-offline' };
    case 'offline_stale':
      return { label: 'Hors ligne (Flux non actualisé)', color: '#555555', icon: 'cloud-offline' };
  }
}
```

```typescript
// config/feature-limits.ts
export interface AppLimits {
  HISTORY_DAYS_VISIBLE: number;
  CLOUD_BACKUP: boolean;
  ADVANCED_ANALYTICS: boolean;
  EXPORT_FORMATS: boolean;
  HEALTH_API_SYNC: boolean;
}
export const FREE_LIMITS: AppLimits = {
  HISTORY_DAYS_VISIBLE: 90,  // Masqué à l'affichage, JAMAIS supprimé en DB
  CLOUD_BACKUP: false,
  ADVANCED_ANALYTICS: false,
  EXPORT_FORMATS: false,
  HEALTH_API_SYNC: false
};
export const PREMIUM_LIMITS: AppLimits = {
  HISTORY_DAYS_VISIBLE: Infinity,
  CLOUD_BACKUP: true,
  ADVANCED_ANALYTICS: true,
  EXPORT_FORMATS: true,
  HEALTH_API_SYNC: true
};
export function getLimitsForUser(
  isPremium: boolean,
  premiumExpiresAt: string | null
): AppLimits {
  if (isPremium && premiumExpiresAt && new Date(premiumExpiresAt) > new Date()) {
    return PREMIUM_LIMITS;
  }
  return FREE_LIMITS;
}
```

---

### 15.4 Routage paiement géolocalisé — ⛔ SECTION SUPPRIMÉE (audit doc)

⚠️ Le code ci-dessous est PÉRIMÉ et NE COMPILE PAS (valeurs 'Flutterwave'/
'Stripe' hors du type déclaré). Flutterwave et Stripe sont HORS projet.
Routage faisant foi : BILLING_FLOW.md §1-2 — deux voies uniquement :
`africa_momo` → PawaPay (vente web) · `intl_iap` → RevenueCat.
Conservé pour historique uniquement :

```typescript
// config/payment-routing.ts
export interface PaymentProviderConfiguration {
  aggregator: 'PawaPay' | 'RevenueCat';
  methods: string[];
  currency: 'XAF' | 'EUR' | 'USD' | 'GHS' | 'NGN' | 'KES';
}

export const PAYMENT_ROUTING_BY_COUNTRY: Record<string, PaymentProviderConfiguration> = {
  // Afrique : V1 = Cameroun uniquement via PawaPay (multi-pays = Phase 3, réévaluer PawaPay)
  CM: { aggregator: 'PawaPay', methods: ['mtn_momo','orange_money'], currency: 'XAF' },
  // CI/SN/ML/BF/BJ/TG : Phase 3 — prestataire à confirmer (PawaPay candidat)
  // Afrique anglophone → Flutterwave (Phase 3)
  GH: { aggregator: 'Flutterwave', methods: ['mtn_momo','vodafone_cash','airtel_money'], currency: 'GHS' },
  NG: { aggregator: 'Flutterwave', methods: ['paystack_card','bank_transfer','ussd'], currency: 'NGN' },
  KE: { aggregator: 'Flutterwave', methods: ['mpesa'], currency: 'KES' },
  // Occident → Stripe + RevenueCat
  FR: { aggregator: 'Stripe', methods: ['stripe_card','apple_pay','google_pay'], currency: 'EUR' },
  US: { aggregator: 'Stripe', methods: ['stripe_card','apple_pay','google_pay'], currency: 'USD' },
};

export function getPaymentConfiguration(countryCode: string): PaymentProviderConfiguration {
  return PAYMENT_ROUTING_BY_COUNTRY[countryCode?.toUpperCase()] || {
    aggregator: 'Stripe',
    methods: ['stripe_card','apple_pay','google_pay'],
    currency: 'USD'
  };
}
```

---

### 15.5 Deep Links — ⛔ SECTION SUPPRIMÉE : Branch.io ÉCARTÉ (§19.4, Q21b)

⚠️ Décision finale : Android App Links NATIFS + page web fallback
(lyxo.app/invite/{code} → Play Store). PAS de Branch.io (risque tarifaire,
dépendance inutile). Le code Branch ci-dessous est conservé pour
historique uniquement — NE JAMAIS l'implémenter :

```typescript
// lib/deeplink.ts
import Branch from 'react-native-branch';

export async function createProgramLink(programId: string, coachName: string): Promise<string> {
  const buo = await Branch.createBranchUniversalObject(`program/${programId}`, {
    title: `Programme de ${coachName}`,
    contentMetadata: { customMetadata: { program_id: programId, type: 'coach_program' } }
  });
  const { url } = await buo.generateShortUrl({ feature: 'whatsapp_share', channel: 'coach' });
  return url; // lyxo.app/p/{id}
}

export function handleDeepLink(url: string, router: any): void {
  if (!url) return;
  const path = new URL(url).pathname;
  if (path.startsWith('/p/'))    router.push(`/program/${path.split('/')[2]}`);
  if (path.startsWith('/u/'))    router.push(`/profile/${path.split('/')[2]}`);
  if (path.startsWith('/pr/'))   router.push(`/pr/${path.split('/')[2]}`);
  if (path.startsWith('/post/')) router.push(`/post/${path.split('/')[2]}`);
}

// Matrice des routes deep link
// lyxo.app/p/{program_id}  → /screens/program/[id]  (Acquisition coachs)
// lyxo.app/u/{username}    → /screens/profile/[username]
// lyxo.app/pr/{pr_id}      → /screens/records/[id]  (Engagement WhatsApp PR)
// lyxo.app/post/{post_id}  → /screens/discover/[id]
```

---

### 15.6 Spécifications d'interface — Corrections obligatoires

#### Onboarding — Flux pré-auth (révisé audit UX : 4 étapes avant l'inscription)
⚠️ MISE À JOUR (Juillet 2026, décision ONBOARDING-IKEA — UI UX.md §1,
UI prompt écrans 2-3) : le flux pré-auth compte désormais 4 étapes :
Langue → Offline → **Objectif (3 cards)** → **Split préféré (PPL/UL/FB)**
→ Inscription (avec récap de ce qui a été construit + jauge jamais à 0 %).
Objectif/split stockés en AsyncStorage puis poussés via PATCH post-login
universel (API_SPEC §4.2 — l'OAuth ne transporte pas les meta_data).
⚠️ ARBITRAGE (fiche 5 comité) : `offline.tsx` EST l'écran Welcome 1ter
du prompt UI (pitch photo-hero + promesse offline fusionnés en UN écran)
— pas deux écrans distincts. Les 2 étapes ci-dessous restent valides
comme étapes 1-2 (l'étape 2 = le Welcome 1ter) :

```
ÉTAPE 1 — Choix de langue (Premier écran absolu)
  Titre bilingue : "Choose your language / Choisis ta langue"
  [ 🇫🇷 Français ]  [ 🇬🇧 English ]
  → Sauvegarde immédiate AsyncStorage — AVANT inscription

ÉTAPE 2 — Message offline-first (Deuxième écran absolu)
  "LYXO fonctionne partout."
  "Même sans réseau, vos séances sont enregistrées localement
   sur votre téléphone. La mise à jour s'effectue automatiquement
   dès que le signal revient."
  → S'affiche UNE seule fois (AsyncStorage onboarding_offline_shown)
```

#### Workout Logger — Ergonomie obligatoire

- Clavier numérique custom ancré en bas d'écran (STICKY — jamais caché par le scroll)
- Swipe gauche/droite sur cellule de poids → incrément +2.5kg / +5kg
- Boutons "Ajouter un Exercice" et "Terminer la Séance" en zone STICKY BASSE
- (= accessibles sans scroll, au niveau du pouce)

#### Discover & Stories — Refonte visuelle (⚠️ Discover public = Phase 8)

- Stories affichées en bulles d'avatars horizontales EN HAUT du feed
  (feed ABONNÉS en V1 ; Discover public seulement Phase 8 — §18.11)
- Anneau de couleur **#C73E3A (rouge braise)** fin sur les stories actives UNIQUEMENT (§19.11)
- Anneau gris/absent sur les profils sans story active
- ⛔ Réactions emojis sur stories et commentaires→DM : fonctionnalités V2
  (la messagerie est non-goal 3 PROJECT_BRIEF — aucun DM en V1).

---

### 15.7 Règle Go-to-Market — Contrainte de lancement

```
RÈGLE ABSOLUE AVANT DÉPLOIEMENT PUBLIC :

Le déploiement public nécessite IMPÉRATIVEMENT :
→ 10 profils coachs référencés et actifs
→ Feed Discover pré-peuplé avec leurs posts
→ Sans ça : feed vide au jour J = 0 rétention

Processus :
1. Onboarding manuel des 10 premiers coachs (Douala, Abidjan, Dakar)
2. Vérification que chaque coach a posté au minimum 3 posts sur Discover
3. Validation du feed non-vide sur le Pixel 8 avant eas submit
```

---

### 15.8 Audit SecOps — Processus cyclique fermé

```
[ ÉTAPE 1 ] → /clear (vider entièrement le contexte IA)
     ↓
[ ÉTAPE 2 ] → Run Audit SecOps complet
     Vérifier :
     - RLS activé sur TOUTES les tables Supabase
     - JWT tokens vérifiés sur TOUTES les routes backend
     - Zéro variable .env en dur dans le code
     - Fuites d'information dans les messages d'erreur
     - provider_tx_id UNIQUE (idempotence webhooks)
     ↓
[ ÉTAPE 3 ] → Fix Findings (Critical et High UNIQUEMENT)
     ↓
[ ÉTAPE 4 ] → /clear + Re-run Audit
     Valider qu'aucune nouvelle faille n'a été introduite
     ↓
     Répéter jusqu'à zéro finding Critical/High
```

**Conformité stores — Pages obligatoires avant soumission :**
- `lyxo.app/privacy` — Politique de confidentialité hébergée publiquement
- `lyxo.app/support` — Page de support technique
- Compte reviewer statique : email + password pré-remplis pour les validateurs
  Apple/Google (jamais de vrai numéro Mobile Money pour le reviewer)

---

## 16. CORRECTIONS CRITIQUES — Analyse Experte V14

> Points identifiés après audit du document. Chaque correction est non négociable.

---

### 16.1 Correction Business — Positionnement tarifaire cohérent

**Problème identifié :** Le tableau comparatif attaque Strong sur son prix
("payant à $9.99/mois") tout en introduisant un modèle freemium avec Lyxo+.
Un utilisateur qui voit "100% gratuit" puis découvre que son historique est
masqué après 90 jours se sent trompé.

**Correction dans tous les textes marketing et comparatifs :**

```
AVANT (interdit) :
  "LYXO : 100% gratuit"

APRÈS (correct) :
  "LYXO : Modèle Freemium localisé
   → Tracker Core gratuit à vie (logging, PRs, social complet)
   → Historique étendu + analytics avancés via Lyxo+"
```

**Règle Claude Code :** Ne jamais écrire "100% gratuit" dans les textes
de l'app ou la landing page. Toujours préciser "gratuit pour le tracker core".

---

### 16.2 Correction Architecture — Endpoint de sync WatermelonDB/Prisma

**Problème identifié :** WatermelonDB requiert un protocole de sync basé
sur des deltas (created/updated/deleted depuis un timestamp). Prisma ne
génère pas ces deltas nativement — il faut les implémenter manuellement.

⛔ **CODE PÉRIMÉ — NE PAS IMPLÉMENTER TEL QUEL** (audit doc Juillet 2026).
Le contrat faisant foi est API_SPEC.md §4.1 : DEUX routes (`GET /v1/sync/pull`
+ `POST /v1/sync/push`), pagination cursor/has_more (§18.4), soft-delete
`deleted_at` propagé (§18.3), format d'erreur standard API_SPEC §2.
L'exemple ci-dessous (route unique POST /sync, sans pagination, sans
deleted_at) n'illustre que le principe des deltas :

```typescript
// backend/routes/sync.ts
// POST /sync — Endpoint WatermelonDB protocol

router.post('/sync', authenticate, async (req, res) => {
  const { last_pulled_at, changes } = req.body;
  const userId = req.user.id;
  const since = new Date(last_pulled_at || 0);

  // PULL — Récupérer les changements distants depuis last_pulled_at
  const [workouts, sets, exercises, personalRecords] = await Promise.all([
    prisma.workouts.findMany({
      where: {
        user_id: userId,
        updated_at: { gte: since }
      }
    }),
    prisma.sets.findMany({
      where: {
        workout_exercise: { workout: { user_id: userId } },
        updated_at: { gte: since }
      }
    }),
    prisma.exercises.findMany({
      where: {
        OR: [
          { is_custom: false },         // Exercices officiels
          { created_by: userId }         // Exercices custom du user
        ],
        updated_at: { gte: since }
      }
    }),
    prisma.personal_records.findMany({
      where: { user_id: userId, updated_at: { gte: since } }
    })
  ]);

  // PUSH — Appliquer les changements locaux vers Supabase
  if (changes?.workouts?.created?.length) {
    await prisma.workouts.createMany({
      data: changes.workouts.created.map(w => ({ ...w, user_id: userId })),
      skipDuplicates: true  // local_id déjà existant → ignorer
    });
  }
  if (changes?.workouts?.updated?.length) {
    for (const w of changes.workouts.updated) {
      await prisma.workouts.upsert({
        where: { local_id_user_id: { local_id: w.local_id, user_id: userId } },
        update: w,
        create: { ...w, user_id: userId }
      });
    }
  }

  res.json({
    changes: { workouts, sets, exercises, personalRecords },
    timestamp: Date.now()
  });
});
```

**Règle Claude Code :** L'endpoint `/sync` est une ZONE CRITIQUE.
TypeScript strict obligatoire. Tests d'intégration obligatoires couvrant :
- Sync depuis 0 (premier lancement)
- Sync partielle (reconnexion après 2 jours hors ligne)
- Conflit local_id (Last Write Wins via updated_at)
- Requête simultanée depuis 2 appareils (même user_id)

---

### 16.3 Correction Sécurité — Contrainte composite sur local_id

**Problème identifié :** `local_id text UNIQUE` au niveau global de la table
workouts permet une attaque par déni de service — un user malveillant insère
un local_id identique à celui d'un autre user, bloquant sa synchronisation.

**Correction SQL obligatoire :**

```sql
-- SUPPRIMER la contrainte unique globale
ALTER TABLE public.workouts DROP CONSTRAINT IF EXISTS workouts_local_id_key;
ALTER TABLE public.sets DROP CONSTRAINT IF EXISTS sets_local_id_key;
ALTER TABLE public.workout_exercises DROP CONSTRAINT IF EXISTS workout_exercises_local_id_key;

-- REMPLACER par une contrainte composite (user_id + local_id)
ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_user_local_id_unique UNIQUE (user_id, local_id);

-- Pour sets et workout_exercises, remonter via JOIN au user_id :
-- La protection est assurée par la cascade RLS + user_id sur workouts parent
-- Un user ne peut pas insérer un set dans le workout d'un autre (RLS bloque)
```

**Règle Claude Code :** Vérifier systématiquement cette contrainte composite
lors de l'audit SecOps (section 15.8). C'est un finding Critical si absent.

---

### 16.4 Interdictions strictes — Ce que Claude Code ne doit JAMAIS faire

```
❌ INTERDIT PENDANT LE MVP (S1-S12, planning officiel 18.11) :
   → Coder le paywall ou les abonnements
   → Intégrer PawaPay (Afrique) ou RevenueCat (international)
   → Implémenter feature-limits.ts en production
   Raison : si J7 retention < 40%, le système de paiement ne sert à rien.
   Construire d'abord la valeur, monétiser ensuite.

❌ INTERDIT — expo-barcode-scanner (module obsolète/deprecated en 2026)
   → Utiliser à la place : expo-camera avec BarcodeScanningResult intégré
   → Ou react-native-vision-camera pour performances maximales Android

❌ INTERDIT — GIFs d'exercices dans le bundle de l'app
   ⚠️ EXCEPTION ACTÉE (§19.5, décision plus récente) : le pack de ~50 GIFs
   de base (~8-12 Mo) EST embarqué pour garantir le premier lancement
   offline (edge case E13 PRD). L'interdiction ci-dessous vaut pour le
   RESTE du catalogue (150 exercices à la demande) :
   → NE PAS inclure les 150 GIFs restants dans les assets de l'APK/AAB
   → Ils restent sur Supabase Storage
   → Cache agressif via thread natif (expo-file-system + TTL 7 jours)
   → Raison (chiffres corrigés : catalogue = 200 exos, pas 500) :
     150 GIFs × 500KB ≈ 75MB dans le bundle = dépassement du budget
     < 30 Mo, refus d'installation sur Tecno Spark et Samsung A15
```

---

### 16.5 Statut PROVISIONAL_ACCESS — Mobile Money timeout

**Problème identifié :** Les réseaux MTN/Orange peuvent mettre jusqu'à
30 minutes à envoyer le webhook de confirmation en cas de congestion.
Le timer de 5 minutes actuellement prévu fait afficher "Échec" alors que
l'utilisateur a bien été débité.

**Solution : statut intermédiaire PROVISIONAL_ACCESS**

```typescript
// Statuts de paiement officiels (correction du schéma)
// ANCIEN : 'pending' | 'success' | 'failed' | 'refunded' (le terme 'success' est ABANDONNÉ → 'complete', §20.2)
// NOUVEAU :
type PaymentStatus =
  | 'pending'              // STK push envoyé, pas encore de réponse
  | 'provisional_access'  // STK confirmé par opérateur, webhook pas encore reçu
  | 'complete'            // Webhook reçu et validé (terme harmonisé, ex-'success')
  | 'failed'              // Timeout ou refus explicite
  | 'refunded';

// Correction table payments
ALTER TABLE public.payments
  DROP CONSTRAINT payments_status_check,
  ADD CONSTRAINT payments_status_check
    CHECK (status IN ('pending','provisional_access','complete','failed','refunded'));

// Logique backend au moment du callback opérateur initial (avant webhook final)
async function onOperatorSTKConfirmed(txId: string) {
  await prisma.payments.update({
    where: { provider_tx_id: txId },
    data: {
      status: 'provisional_access',
      provisional_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
    }
  });
  // Débloquer le contenu côté app via push silencieuse
  await sendSilentPush(userId, { type: 'PROVISIONAL_ACCESS', txId });
}

// Cron job toutes les heures : expirer les provisional_access sans webhook
async function expireProvisionalAccess() {
  await prisma.payments.updateMany({
    where: {
      status: 'provisional_access',
      provisional_expires_at: { lt: new Date() }
    },
    data: { status: 'failed', failure_reason: 'webhook_timeout_24h' }
  });
}
```

**UX associée :**
```
Écran pendant provisional_access :
  ✅ Accès temporaire accordé
  "Votre paiement est en cours de finalisation.
   Votre accès Lyxo+ est actif pendant 24h.
   ID : #KL-2026-00847  [ Copier ]"

Après confirmation webhook :
  → Statut passe à 'complete', accès permanent, aucune notification
```

---

### 16.6 Redis — Reporter jusqu'à 10 000 DAU

**Problème identifié :** Redis via Upstash sur Render.com US/Europe avec
des users à Douala = 150ms de latence de base sur chaque requête de feed.
Le Discover va lagger dès le MVP.

**Solution pour le MVP :**

```sql
-- Utiliser des vues matérialisées PostgreSQL à la place de Redis
-- Rafraîchies toutes les heures par une Edge Function Supabase (cron)

CREATE MATERIALIZED VIEW trending_posts AS
SELECT
  p.*,
  (p.likes_count + p.comments_count * 2 + p.saves_count * 3)
  / POWER(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 + 2, 1.5)
  AS trending_score
FROM posts p
WHERE p.is_public = true
  AND p.created_at > NOW() - INTERVAL '7 days'
  AND (p.is_story = false OR p.expires_at > NOW())
ORDER BY trending_score DESC
LIMIT 200;

CREATE UNIQUE INDEX ON trending_posts (id);
-- Rafraîchissement : REFRESH MATERIALIZED VIEW CONCURRENTLY trending_posts;
```

**Règle Claude Code :**
- MVP (0→10k DAU) : Vue matérialisée PostgreSQL uniquement
- Phase 2 (10k+ DAU) : Ajouter Redis Upstash pour le cache des trending scores
- Ne jamais ajouter Redis avant d'avoir mesuré le besoin réel avec PostHog

---

### 16.7 Mise à jour — Tableau des pièges (Section 12)

Ajouts au tableau des pièges existant :

| Piège | Décision validée |
|---|---|
| "100% gratuit" dans les textes | NON — toujours préciser "Tracker Core gratuit à vie" |
| expo-barcode-scanner | NON — deprecated. Utiliser expo-camera BarcodeScanningResult |
| GIFs dans le bundle APK/AAB | NON — Supabase Storage + cache natif uniquement |
| UNIQUE global sur local_id | NON — contrainte composite (user_id, local_id) obligatoire |
| Timer 5min Mobile Money strict | NON — statut PROVISIONAL_ACCESS 24h si STK confirmé |
| Redis dès le MVP | NON — vue matérialisée PostgreSQL jusqu'à 10k DAU |
| Paywall en Phase 1 | NON — construire la valeur d'abord, monétiser en Phase 2 |

---

## 17. FEUILLE DE ROUTE CORRECTIVE GLOBALE — Isolation Architecturale

> Chaque correction est isolée pour éviter les effets de bord et régressions.
> À appliquer dans l'ordre exact ci-dessous.

---

### 17.1 Résolution Prisma ↔ Supabase Auth — Trigger d'isolation

**Problème :** Prisma ne peut pas gérer le schéma `auth` interne de Supabase.
Si Prisma tente de migrer la table `auth.users`, cela casse l'authentification.

**Solution :** Prisma ne gère QUE le schéma `public`.
La création du profil est déléguée à un trigger PostgreSQL natif Supabase.

```sql
-- ÉTAPE 1 — Supprimer les contraintes uniques globales (faille DoS)
ALTER TABLE public.workouts DROP CONSTRAINT IF EXISTS workouts_local_id_key;
ALTER TABLE public.sets DROP CONSTRAINT IF EXISTS sets_local_id_key;
ALTER TABLE public.workout_exercises DROP CONSTRAINT IF EXISTS workout_exercises_local_id_key;

-- ÉTAPE 2 — Contrainte composite sécurisée
ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_user_local_id_unique UNIQUE (user_id, local_id);

-- ÉTAPE 3 — Trigger de création automatique du profil (isole Prisma de Supabase Auth)
-- ✅ CORRIGÉ (audit doc) : l'ancienne version avait 5 colonnes pour 6 valeurs
-- (un `false` orphelin) → erreur SQL à chaque inscription. Version alignée
-- sur DATA_MODEL.md §2.1 (colonnes NOT NULL couvertes par leurs defaults).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, country, language, weight_unit, billing_region, goal, preferred_split, weekly_goal)
  VALUES (
    new.id,
    -- Le pseudo saisi à l'inscription VOYAGE dans raw_user_meta_data (fiche 1
    -- comité) ; la génération depuis l'email n'est qu'un FALLBACK (OAuth sans
    -- pseudo). Unicité vérifiée côté client en debounce 300 ms + conflit 409
    -- géré à la création (suggestion alternative).
    coalesce(
      new.raw_user_meta_data->>'username',
      lower(split_part(new.email, '@', 1)) || '_' || floor(random() * 1000)::text
    ),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'country', 'CM'),
    coalesce(new.raw_user_meta_data->>'language', 'fr'),
    coalesce(new.raw_user_meta_data->>'weight_unit', 'kg'),
    coalesce(new.raw_user_meta_data->>'billing_region', 'intl_iap'),  -- recalculé par le backend à l'onboarding (§19.1)
    new.raw_user_meta_data->>'goal',                    -- onboarding pré-auth (IKEA)
    new.raw_user_meta_data->>'preferred_split',         -- idem
    coalesce((new.raw_user_meta_data->>'weekly_goal')::int,
      case new.raw_user_meta_data->>'preferred_split'
        when 'upper_lower' then 4 else 3 end)           -- défaut par split (PRD 1.3)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Test d'intégration obligatoire : un signup de bout en bout en CI
-- (TESTING.md §1.2 "Auth middleware") doit créer le profil sans erreur.

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Configuration Prisma schema.prisma (extrait critique) :**

```prisma
model Profiles {
  id           String     @id @db.Uuid
  username     String     @unique
  display_name String?
  country      String
  language     String     @default("fr")
  isReviewer   Boolean    @default(false) @map("is_reviewer")
  // PAS de is_premium — statut dérivé (subscriptions + trial), cf. §20.1
  workouts     Workouts[]
  // PAS de relation vers auth.users — géré par le trigger SQL ci-dessus
}

model Workouts {
  id         String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id    String    @db.Uuid
  local_id   String
  title      String?
  started_at DateTime
  finished_at DateTime?
  updated_at DateTime  @default(now()) @updatedAt
  profile    Profiles  @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([user_id, local_id], name: "local_id_user_id")
  @@index([user_id, started_at(sort: Desc)], name: "idx_workouts_user_date")
}
```

---

### 17.2 Endpoint Sync — ⛔ EXEMPLE PÉRIMÉ (contrat faisant foi : API_SPEC §4.1)

**Règle :** Cet endpoint est une ZONE CRITIQUE.
TypeScript strict. Tests d'intégration obligatoires.
⚠️ Le code ci-dessous VIOLE quatre règles du projet et ne doit JAMAIS être
copié : pas de gestion `deleted_at` (§18.3), pas de pagination (§18.4),
erreur 500 hors format standard (API_SPEC §2), `console.error` interdit
(CONVENTIONS §6). Implémenter depuis API_SPEC §4.1 + LLD §2 uniquement.

```typescript
// backend/routes/sync.ts
import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/sync', authenticateJWT, async (req, res) => {
  const { last_pulled_at, changes } = req.body;
  const userId = req.user.id;
  const since = new Date(last_pulled_at || 0);
  const currentTimestamp = Date.now();

  try {
    // ── PULL : modifications distantes depuis last_pulled_at ──────────────
    const [workouts, sets] = await Promise.all([
      prisma.workouts.findMany({
        where: { user_id: userId, updated_at: { gte: since } }
      }),
      prisma.sets.findMany({
        where: {
          workout_exercise: { workout: { user_id: userId } },
          updated_at: { gte: since }
        }
      })
    ]);

    // ── PUSH : appliquer les modifications locales (idempotent) ───────────
    if (changes?.workouts?.created?.length) {
      await prisma.workouts.createMany({
        data: changes.workouts.created.map((w: any) => ({
          id: w.id,
          local_id: w.local_id,
          title: w.title,
          started_at: new Date(w.started_at),
          finished_at: w.finished_at ? new Date(w.finished_at) : null,
          user_id: userId,
          updated_at: new Date()
        })),
        skipDuplicates: true  // Réseau coupé au premier envoi → pas de crash
      });
    }

    if (changes?.workouts?.updated?.length) {
      for (const w of changes.workouts.updated) {
        await prisma.workouts.upsert({
          where: {
            local_id_user_id: { local_id: w.local_id, user_id: userId }
          },
          update: {
            title: w.title,
            finished_at: w.finished_at ? new Date(w.finished_at) : null,
            updated_at: new Date()
          },
          create: {
            id: w.id,
            local_id: w.local_id,
            title: w.title,
            started_at: new Date(w.started_at),
            user_id: userId,
            updated_at: new Date()
          }
        });
      }
    }

    return res.status(200).json({
      changes: {
        workouts: { created: workouts, updated: [], deleted: [] },
        sets: { created: sets, updated: [], deleted: [] },
        exercises: { created: [], updated: [], deleted: [] },
        personalRecords: { created: [], updated: [], deleted: [] }
      },
      timestamp: currentTimestamp
    });

  } catch (error) {
    console.error('Sync Error:', error);
    return res.status(500).json({ error: 'Internal sync collapse' });
  }
});

export default router;
```

**Tests d'intégration obligatoires pour `/sync` :**
- Sync depuis 0 (premier lancement, `last_pulled_at = 0`)
- Sync partielle (reconnexion après 2 jours hors ligne)
- Conflit `local_id` (Last Write Wins via `updated_at`)
- Requête simultanée depuis 2 appareils (même `user_id`)
- Réseau coupé en plein PUSH (reprise sans doublon grâce à `skipDuplicates`)

---

### 17.3 Feature limits — Phase 1 sans rupture (variable d'environnement)

**Problème :** Si les limites freemium sont actives en Phase 1 et que
les paiements ne sont pas encore intégrés, l'historique sera masqué
sans possibilité de débloquer → mauvaise UX, utilisateurs perdus.

**Solution :** Flag `IS_PHASE_1` dans `feature-limits.ts`.
Passage en Phase 2 = une seule ligne à changer, zéro refactoring UI.

```typescript
// config/feature-limits.ts
export interface AppLimits {
  HISTORY_DAYS_VISIBLE: number;
  CLOUD_BACKUP: boolean;
  ADVANCED_ANALYTICS: boolean;
  EXPORT_FORMATS: boolean;
  HEALTH_API_SYNC: boolean;
}

const FREE_LIMITS: AppLimits = {
  HISTORY_DAYS_VISIBLE: 90,  // Masqué à l'affichage, JAMAIS supprimé en DB
  CLOUD_BACKUP: false,
  ADVANCED_ANALYTICS: false,
  EXPORT_FORMATS: false,
  HEALTH_API_SYNC: false
};

const PREMIUM_LIMITS: AppLimits = {
  HISTORY_DAYS_VISIBLE: Infinity,
  CLOUD_BACKUP: true,
  ADVANCED_ANALYTICS: true,
  EXPORT_FORMATS: true,
  HEALTH_API_SYNC: true
};

export function getLimitsForUser(
  isPremium: boolean,
  premiumExpiresAt: string | null
): AppLimits {
  // ⚠️ PHASE 1 : accès complet pour tous — basculer à false en Phase 2
  const IS_PHASE_1 = true;

  if (IS_PHASE_1) return PREMIUM_LIMITS;

  if (isPremium && premiumExpiresAt && new Date(premiumExpiresAt) > new Date()) {
    return PREMIUM_LIMITS;
  }
  return FREE_LIMITS;
}
```

---

### 17.4 Optimisation bundle — ProGuard + ExerciseLoader avec cache natif

**Étape A — ProGuard (android/app/build.gradle)**

```groovy
android {
  buildTypes {
    release {
      minifyEnabled true       // Nettoie le code mort natif
      shrinkResources true     // Supprime les ressources non utilisées
      proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'),
                   'proguard-rules.pro'
    }
  }
}
```

**Étape B — ExerciseLoader — ⛔ IMPLÉMENTATION PÉRIMÉE (audit deep-tech)**

⚠️ Le composant ci-dessous NE DOIT PAS être implémenté tel quel :
cache manuel sans TTL réel ni limite de taille, pas d'annulation au
démontage (setState après unmount sur scroll rapide), pas de
déduplication des téléchargements concurrents, `<Image>` RN core risqué
en mémoire avec des GIFs animés en liste sur 3 Go de RAM.
IMPLÉMENTATION OFFICIELLE : **`expo-image`** (CONVENTIONS §5.7) — cache
disque+mémoire natif, `cachePolicy="disk"`, `recyclingKey` en liste.
Seule la logique Data Saver (URL `.jpg` au lieu de `.gif`) est conservée.
Les 150 GIFs hors pack restent sur Supabase Storage, jamais dans le
bundle (règle §16.4 amendée §19.5). Code conservé pour historique :

```typescript
// components/workout/ExerciseLoader.tsx
import React from 'react';
import { Image, ActivityIndicator, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useAppStore } from '../../store/useAppStore';

interface ExerciseLoaderProps {
  exerciseExternalId: string;
  gifUrlFromSupabase: string;
}

export function ExerciseLoader({ exerciseExternalId, gifUrlFromSupabase }: ExerciseLoaderProps) {
  const { dataSaver } = useAppStore();
  const [localUri, setLocalUri] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const manageCache = async () => {
      try {
        // Data Saver actif → JPG statique depuis Supabase, pas de téléchargement GIF
        if (dataSaver) {
          setLocalUri(gifUrlFromSupabase.replace('.gif', '.jpg'));
          setLoading(false);
          return;
        }

        const cacheFolder = `${FileSystem.cacheDirectory}exercises/`;
        const localFilePath = `${cacheFolder}${exerciseExternalId}.gif`;

        // Créer le dossier cache si inexistant
        const folderInfo = await FileSystem.getInfoAsync(cacheFolder);
        if (!folderInfo.exists) {
          await FileSystem.makeDirectoryAsync(cacheFolder, { intermediates: true });
        }

        // Utiliser le cache local si disponible
        const fileInfo = await FileSystem.getInfoAsync(localFilePath);
        if (fileInfo.exists) {
          setLocalUri(localFilePath);
          setLoading(false);
          return;
        }

        // Télécharger depuis Supabase Storage et mettre en cache
        const result = await FileSystem.downloadAsync(gifUrlFromSupabase, localFilePath);
        setLocalUri(result.uri);
      } catch (err) {
        console.error('Failed to load exercise media', err);
      } finally {
        setLoading(false);
      }
    };

    manageCache();
  }, [exerciseExternalId, dataSaver]);

  // Skeleton loader pendant le téléchargement
  if (loading) return (
    <View style={{ width: 100, height: 100, backgroundColor: '#141414',
                   justifyContent: 'center', borderRadius: 8 }}>
      <ActivityIndicator color="#C73E3A" />
    </View>
  );

  if (!localUri) return null;

  return (
    <Image
      source={{ uri: localUri }}
      style={{ width: 100, height: 100, borderRadius: 8 }}
      resizeMode="cover"
    />
  );
}
```

---

### 17.5 Vue matérialisée PostgreSQL — Trending Feed sans Redis

**Remplace Redis pour le MVP (jusqu'à 10 000 DAU)**

```sql
-- Création de la vue matérialisée Discover
CREATE MATERIALIZED VIEW public.trending_posts AS
SELECT
  p.id, p.user_id, p.workout_id, p.media_url, p.media_type,
  p.caption, p.stats_overlay, p.likes_count, p.comments_count,
  p.saves_count, p.created_at,
  -- Algorithme Hacker News modifié : engagement dégressif avec le temps
  (p.likes_count + p.comments_count * 2 + p.saves_count * 3)
  / POWER(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 + 2, 1.5)
  AS trending_score
FROM public.posts p
WHERE
  p.is_public = true
  AND p.created_at > NOW() - INTERVAL '7 days'
  AND (p.is_story = false OR p.expires_at > NOW())
ORDER BY trending_score DESC
LIMIT 200;

-- Index pour lectures < 2ms
CREATE UNIQUE INDEX idx_trending_posts_id ON public.trending_posts (id);

-- Rafraîchissement non-bloquant (à configurer dans Supabase PgCron)
-- Fréquence recommandée : toutes les heures
-- REFRESH MATERIALIZED VIEW CONCURRENTLY public.trending_posts;
```

**Règle de migration Redis :**

| Seuil DAU | Solution |
|---|---|
| 0 → 10 000 | Vue matérialisée PostgreSQL (ci-dessus) |
| 10 000+ | Ajouter Redis Upstash pour le cache trending |
| 50 000+ | Redis Upstash + invalidation par événement (like/comment) |

Ne jamais ajouter Redis avant d'avoir mesuré le besoin réel via PostHog.

---

### 17.6 Ordre d'application des corrections

```
ORDRE OBLIGATOIRE (respecter la séquence pour éviter les régressions)

1. SQL Supabase (17.1) — Trigger + contraintes composites
   → Exécuter directement sur la console Supabase SQL Editor

2. Prisma schema.prisma (17.1) — Retirer la relation auth.users
   → npx prisma db pull → vérifier → npx prisma generate

3. Vue matérialisée (17.5) — Trending feed sans Redis
   → Exécuter sur Supabase SQL Editor
   → Configurer le cron PgCron toutes les heures

4. config/feature-limits.ts (17.3) — IS_PHASE_1 = true
   → À garder true jusqu'au début de la Phase 2

5. ExerciseLoader.tsx (17.4) — Cache GIFs natif
   → Remplace tout usage de <Image source={gifUrl}> direct

6. ProGuard (17.4) — android/app/build.gradle
   → Activer minifyEnabled et shrinkResources

7. Sync endpoint (17.2) — POST /sync
   → Implémenter + tester les 5 cas listés avant tout déploiement
```

---

## 17bis. DERNIERS AJUSTEMENTS AVANT PHASE 1 — Cohérence & SecOps
<!-- Renuméroté 18 → 17bis (audit doc) : le fichier contenait DEUX sections 18.
     Les renvois "§18.x" des autres documents pointent vers la section 18
     "DÉCISIONS STRUCTURANTES" ci-après, pas vers celle-ci. -->


> Ces 3 points finalisent le document avant le premier commit.
> Aucun n'est visible à l'œil nu mais chacun peut provoquer des bugs
> silencieux en production.

---

### 17bis.1 Cohérence i18n — Fichiers de traduction obligatoires

**Problème :** La section 7.1 (Onboarding) contient des chaînes de texte
brutes ("LYXO fonctionne partout.") données comme exemples. Si un développeur
les copie telles quelles dans un composant React Native, cela viole la règle
absolue de la section 8 : jamais de texte en dur dans les composants.

**Règle :** Toute chaîne visible par l'utilisateur passe par i18next.
Toujours. Sans exception.

**Fichiers à créer avant le premier écran :**

```json
// locales/fr/common.json
{
  "onboarding": {
    "language_title": "Choisis ta langue",
    "language_subtitle": "Choose your language",
    "offline_title": "LYXO fonctionne partout.",
    "offline_description": "Même sans réseau, vos séances sont enregistrées localement sur votre téléphone. La mise à jour s'effectue automatiquement dès que le signal revient.",
    "continue": "Continuer"
  },
  "workout": {
    "start": "Démarrer une séance",
    "finish": "Terminer la séance",
    "add_exercise": "Ajouter un exercice",
    "add_set": "Ajouter une série",
    "rest_timer": "Repos",
    "new_pr": "Nouveau record ! 🏆"
  },
  "social": {
    "follow": "Suivre",
    "unfollow": "Ne plus suivre",
    "share_workout": "Partager ma séance",
    "conquest_notification": "{{username}} vient de dépasser ton record au {{exercise}} — {{new_value}}kg vs ton {{old_value}}kg."
  },
  "sync": {
    "synced": "Synchronisé",
    "syncing": "Synchronisation en cours...",
    "offline_fresh": "Hors ligne (Cache récent)",
    "offline_stale": "Hors ligne (Flux non actualisé)"
  },
  "payment": {
    "upgrade_title": "Passer à Lyxo+",
    "provisional_access": "Accès temporaire accordé",
    "provisional_description": "Votre paiement est en cours de finalisation. Votre accès Lyxo+ est actif pendant 24h.",
    "copy_tx_id": "Copier l'ID transaction",
    "contact_support": "Contacter le support"
  },
  "errors": {
    "sync_failed": "Synchronisation échouée. Vos données sont sauvegardées localement.",
    "network_required": "Connexion requise pour cette action.",
    "generic": "Une erreur est survenue. Veuillez réessayer."
  },
  "onboarding_ikea": {
    "goal_title": "Ton objectif ?",
    "goal_force": "Force", "goal_masse": "Masse", "goal_regularite": "Régularité",
    "split_title": "Ton split préféré ?",
    "split_ppl": "Push / Pull / Legs", "split_ul": "Upper / Lower",
    "split_fb": "Full body", "split_custom": "Personnalisé",
    "auth_recap": "Ton programme {{split}} est prêt — crée ton compte pour le sauvegarder",
    "step_done": "Étape {{n}}/{{total}} ✓"
  },
  "home": {
    "week_remaining_one": "Plus qu'{{count}} séance pour ta semaine",
    "week_remaining_other": "Plus que {{count}} séances pour ta semaine",
    "week_done": "Objectif de la semaine atteint ✓",
    "change_workout": "Changer de séance"
  },
  "trial": {
    "timeline_today": "Aujourd'hui — tout Lyxo+ débloqué",
    "timeline_reminder": "J12 — on te prévient que l'essai se termine",
    "timeline_end_africa": "J14 — retour au gratuit, tes données restent intactes",
    "timeline_end_intl": "J14 — premier débit. Annulable à tout moment avant.",
    "no_payment_africa": "Aucun paiement demandé. À J14, retour au gratuit — tes données restent intactes.",
    "start_cta_intl": "Commencer mon essai — 2 taps"
  },
  "program_day": {
    "start_session": "Commencer la séance",
    "followed_by": "Suivi par {{count}} clients",
    "streak_weeks_one": "{{count}} semaine consécutive",
    "streak_weeks_other": "{{count}} semaines consécutives"
  },
  "welcome": {
    "headline": "Soulève plus. Ensemble.",
    "subtitle": "Tes séances enregistrées même sans réseau. Tu ne perdras jamais une séance.",
    "cta": "Commencer",
    "login_link": "Déjà un compte ? Se connecter",
    "skip": "Passer"
  },
  "auth": {
    "save_subtitle": "Crée ton compte pour le sauvegarder",
    "google": "Continuer avec Google",
    "apple": "Continuer avec Apple",
    "or": "ou",
    "continue": "Continuer",
    "login_title": "Content de te revoir",
    "login_subtitle": "Tes barres t'attendent.",
    "login_cta": "Se connecter",
    "forgot": "Mot de passe oublié ?",
    "signup_link": "Pas encore de compte ? Créer mon compte",
    "legal": "En continuant tu acceptes les Conditions et la Politique de confidentialité",
    "err_invalid": "Email ou mot de passe incorrect.",
    "err_exists": "Un compte existe déjà avec cet email. Se connecter ?",
    "err_weak": "8 caractères minimum.",
    "err_network": "Connexion requise pour créer ton compte. Tes choix sont gardés — réessaie dès que tu as du signal.",
    "retry": "Réessayer"
  }
}
```

```json
// locales/en/common.json
{
  "onboarding": {
    "language_title": "Choose your language",
    "language_subtitle": "Choisis ta langue",
    "offline_title": "LYXO works everywhere.",
    "offline_description": "Even without network, your sessions are saved locally on your phone. Updates happen automatically when your signal returns.",
    "continue": "Continue"
  },
  "workout": {
    "start": "Start a session",
    "finish": "Finish session",
    "add_exercise": "Add exercise",
    "add_set": "Add set",
    "rest_timer": "Rest",
    "new_pr": "New record! 🏆"
  },
  "social": {
    "follow": "Follow",
    "unfollow": "Unfollow",
    "share_workout": "Share my session",
    "conquest_notification": "{{username}} just beat your {{exercise}} record — {{new_value}}kg vs your {{old_value}}kg."
  },
  "sync": {
    "synced": "Synced",
    "syncing": "Syncing...",
    "offline_fresh": "Offline (Recent cache)",
    "offline_stale": "Offline (Feed not updated)"
  },
  "payment": {
    "upgrade_title": "Upgrade to Lyxo+",
    "provisional_access": "Temporary access granted",
    "provisional_description": "Your payment is being finalized. Your Lyxo+ access is active for 24h.",
    "copy_tx_id": "Copy transaction ID",
    "contact_support": "Contact support"
  },
  "errors": {
    "sync_failed": "Sync failed. Your data is saved locally.",
    "network_required": "Network required for this action.",
    "generic": "An error occurred. Please try again."
  },
  "onboarding_ikea": {
    "goal_title": "Your goal?",
    "goal_force": "Strength", "goal_masse": "Muscle", "goal_regularite": "Consistency",
    "split_title": "Your preferred split?",
    "split_ppl": "Push / Pull / Legs", "split_ul": "Upper / Lower",
    "split_fb": "Full body", "split_custom": "Custom",
    "auth_recap": "Your {{split}} program is ready — create your account to save it",
    "step_done": "Step {{n}}/{{total}} ✓"
  },
  "home": {
    "week_remaining_one": "{{count}} more session for your week",
    "week_remaining_other": "{{count}} more sessions for your week",
    "week_done": "Weekly goal reached ✓",
    "change_workout": "Change workout"
  },
  "trial": {
    "timeline_today": "Today — all of Lyxo+ unlocked",
    "timeline_reminder": "Day 12 — we remind you the trial is ending",
    "timeline_end_africa": "Day 14 — back to free, your data stays intact",
    "timeline_end_intl": "Day 14 — first charge. Cancel anytime before.",
    "no_payment_africa": "No payment required. On day 14 you go back to free — your data stays intact.",
    "start_cta_intl": "Start my trial — 2 taps"
  },
  "program_day": {
    "start_session": "Start session",
    "followed_by": "Followed by {{count}} clients",
    "streak_weeks_one": "{{count}} consecutive week",
    "streak_weeks_other": "{{count}} consecutive weeks"
  },
  "welcome": {
    "headline": "Lift more. Together.",
    "subtitle": "Your sessions saved even without network. You'll never lose a workout.",
    "cta": "Get started",
    "login_link": "Already have an account? Log in",
    "skip": "Skip"
  },
  "auth": {
    "save_subtitle": "Create your account to save it",
    "google": "Continue with Google",
    "apple": "Continue with Apple",
    "or": "or",
    "continue": "Continue",
    "login_title": "Good to see you back",
    "login_subtitle": "Your bars are waiting.",
    "login_cta": "Log in",
    "forgot": "Forgot password?",
    "signup_link": "No account yet? Create mine",
    "legal": "By continuing you accept the Terms and Privacy Policy",
    "err_invalid": "Wrong email or password.",
    "err_exists": "An account already exists with this email. Log in?",
    "err_weak": "8 characters minimum.",
    "err_network": "Network required to create your account. Your choices are kept — retry when you have signal.",
    "retry": "Retry"
  }
}
```

**Règle d'utilisation dans les composants :**

```typescript
// INTERDIT — texte en dur
<Text>LYXO fonctionne partout.</Text>

// OBLIGATOIRE — toujours via i18next
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
<Text>{t('onboarding.offline_title')}</Text>
```

---

### 17bis.2 Précision numérique — total_volume_kg en NUMERIC(10,2)

**Problème :** Le type `float` en PostgreSQL est sujet à des erreurs
d'arrondi cumulatives. En JavaScript après désérialisation JSON, `float`
peut produire `247.50000000000003` au lieu de `247.50` — ce qui fausse
l'affichage des stats et les comparaisons de PRs.

**Exemple concret du bug silencieux :**
```
82.5 + 82.5 + 82.5 = 247.50000000000003  ← float
82.5 + 82.5 + 82.5 = 247.50              ← numeric(10,2)
```

**Correction SQL — à exécuter sur Supabase avant le premier insert :**

```sql
-- Correction du type de volume pour éviter les dérives de calcul
ALTER TABLE public.workouts
  ALTER COLUMN total_volume_kg TYPE numeric(10, 2);

-- Même correction sur les tables liées
ALTER TABLE public.sets
  ALTER COLUMN weight_kg TYPE numeric(8, 2);

ALTER TABLE public.personal_records
  ALTER COLUMN value TYPE numeric(8, 2),
  ALTER COLUMN previous_value TYPE numeric(8, 2);
```

**Correction côté calcul TypeScript :**

```typescript
// lib/workout-calculations/volume.ts — ZONE CRITIQUE
// Arrondir à 2 décimales avant tout stockage
export function calculateVolume(sets: SetRecord[]): number {
  const raw = sets.reduce((total, set) => {
    if (set.set_type === 'warmup') return total;
    return total + (set.weight_kg ?? 0) * (set.reps ?? 0);
  }, 0);
  // Arrondi à 2 décimales — cohérent avec numeric(10,2) en DB
  return Math.round(raw * 100) / 100;
}
```

---

### 17bis.3 SecOps — Nettoyage automatique du compte reviewer

**Problème :** Le compte reviewer statique configuré pour Apple et Google
(email + password pré-remplis) peut accumuler des séances de test instables
et des PRs fictifs qui polluent :
- Les leaderboards entre amis
- Le feed Discover si le reviewer publie par erreur
- Les requêtes d'agrégation analytics (PostHog, stats globales)

**Solution : Edge Function cron nocturne qui réinitialise le compte reviewer**

> ⚠️ Exception documentée à la règle "jamais de DELETE physique sur une
> table SYNC" (§18.3) : le compte reviewer est un compte interne, jamais
> synchronisé multi-device — les DELETE ci-dessous sont autorisés pour
> LUI SEUL. Ne jamais généraliser ce pattern à un compte utilisateur réel.

```sql
-- Fonction de nettoyage du compte reviewer (SecOps maintenance)
CREATE OR REPLACE FUNCTION public.clean_reviewer_account()
RETURNS void AS $$
DECLARE
  reviewer_id uuid;
BEGIN
  -- Récupérer l'ID du compte reviewer
  SELECT id INTO reviewer_id
  FROM public.profiles
  WHERE username = 'lyxo_reviewer'
  LIMIT 1;

  -- Sortir proprement si le compte n'existe pas encore
  IF reviewer_id IS NULL THEN
    RETURN;
  END IF;

  -- Supprimer les workouts (CASCADE supprime sets + workout_exercises)
  DELETE FROM public.workouts WHERE user_id = reviewer_id;

  -- Réinitialiser les PRs fictifs (ne pas fausser les leaderboards)
  DELETE FROM public.personal_records WHERE user_id = reviewer_id;

  -- Supprimer les posts Discover du reviewer
  DELETE FROM public.posts WHERE user_id = reviewer_id;

  -- Supprimer les stories du reviewer
  DELETE FROM public.stories WHERE user_id = reviewer_id;

  -- Log de l'opération (optionnel mais recommandé pour l'audit)
  RAISE NOTICE 'Reviewer account cleaned at %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Planifier via pg_cron (Supabase Dashboard → Database → Cron Jobs)
-- Fréquence : chaque nuit à 03:00 UTC
-- Commande : SELECT public.clean_reviewer_account();
```

**Compte reviewer — spécifications complètes :**

```
Username  : lyxo_reviewer
Email     : reviewer@lyxo.app  (adresse dédiée, jamais utilisée ailleurs)
Password  : statique, communiqué uniquement aux reviewers Apple/Google
Pays      : CM (pour tester le paywall africain)
statut premium dérivé : aucun abonnement actif = expérience gratuite (tester ainsi)

Ce compte NE doit jamais :
- Apparaître dans les suggestions de suivi
- Avoir ses posts visibles sur le Discover public
- Être inclus dans les calculs de stats globales

Implémentation : ajouter un flag is_reviewer BOOLEAN DEFAULT false
sur la table profiles, et exclure WHERE is_reviewer = true
de toutes les requêtes publiques (leaderboard, Discover, stats).
```

**Ajout SQL du flag reviewer :**

```sql
ALTER TABLE public.profiles
  ADD COLUMN is_reviewer boolean DEFAULT false;

-- Exclure des requêtes publiques
-- Exemple sur trending_posts (vue matérialisée 17.5) :
-- AND p.user_id NOT IN (SELECT id FROM profiles WHERE is_reviewer = true)
```

---

### 17bis.4 Checklist finale avant premier commit

```
AVANT eas build --profile production (Phase 1) :

Fichiers i18n
  ✅ locales/fr/common.json créé avec toutes les clés
  ✅ locales/en/common.json créé avec toutes les clés
  ✅ Zéro texte en dur dans les composants React Native

SQL Supabase (dans l'ordre)
  ✅ Trigger handle_new_user() créé (17.1)
  ✅ Contrainte composite (user_id, local_id) appliquée (17.1)
  ✅ total_volume_kg → numeric(10,2) (18.2)
  ✅ weight_kg → numeric(8,2) sur sets (18.2)
  ✅ Vue matérialisée trending_posts créée (17.5)
  ✅ Fonction clean_reviewer_account() créée (18.3)
  ✅ Colonne is_reviewer ajoutée à profiles (18.3)
  ✅ PgCron configuré (toutes les heures trending + 03:00 UTC reviewer)

Backend Node.js
  ✅ Endpoint POST /sync implémenté et testé (17.2)
  ✅ 5 cas de test sync validés
  ✅ Audit SecOps double passage effectué (15.8)

Mobile React Native
  ✅ ExerciseLoader.tsx avec skeleton loader (17.4)
  ✅ IS_PHASE_1 = true dans feature-limits.ts (17.3)
  ✅ ProGuard activé dans build.gradle (17.4)
  ✅ Langue choisie par l'utilisateur (language.tsx premier écran) (7.1)

Stores
  ✅ lyxo.app/privacy hébergée
  ✅ lyxo.app/support hébergée
  ✅ Compte lyxo_reviewer configuré (is_reviewer = true)
  ✅ Build .aab via eas build --platform android --profile production
```

---

## 18. DÉCISIONS STRUCTURANTES — Brainstorm Juillet 2026
(Ces règles priment sur toute section antérieure qui les contredit.)

### 18.1 Anti-triche PRs sociaux — OBLIGATOIRE avant tout leaderboard
Le leaderboard, la Conquête et la Trace sont attaquables trivialement
(logger "bench 300 kg" offline). Règles dans `lib/pr-detection.ts` :
1. **Plafond de plausibilité** : poids > 4× poids de corps de l'user OU
   > record du monde de l'exercice → le set est loggé normalement dans
   les stats perso, mais EXCLU du social (leaderboard/Conquête/Trace),
   badge "hors classement".
2. **Delta max** : un PR n'entre au social que s'il est ≤ +15% vs le
   précédent PR de l'user sur cet exercice.
3. **Ancienneté** : ≥ 3 séances loggées sur l'exercice avant que ses PRs
   soient éligibles au social.
Un PR exclu du social reste un PR personnel (célébration locale OK).

### 18.2 Trace & Conquête — garde-fous rétention/UX
- Trace : expire après 6 mois non reprise → archivée dans "Rivalités".
  Toggle profil "Masquer les titres perdus" (le duel reste visible chez
  le vainqueur).
- Conquête : opt-out Paramètres "Notifications de rivalité" (ON par défaut).
- Privacy policy : mention explicite que les PRs sont partagés avec les
  abonnés (obligation RGPD — users diaspora UE).

### 18.3 Soft-delete — correction de schéma OBLIGATOIRE
Toutes les tables synchronisées (workouts, workout_exercises, sets,
custom_exercises, … — liste faisant foi : tables marquées [SYNC] dans
DATA_MODEL.md) reçoivent `deleted_at timestamptz NULL`.
- Le client ne fait JAMAIS de DELETE physique : update deleted_at.
- Le protocole de sync WatermelonDB propage les deletes via ce champ.
- Purge physique par cron backend à J+90 après deleted_at.
Sans cette colonne, une suppression offline ne se propage jamais : c'est
un bug de conception du schéma V14, pas une optimisation.

### 18.4 Endpoint /sync — pagination obligatoire
- Pull : max 500 rows par table par réponse + curseur `has_more` /
  `next_since`. Le client boucle jusqu'à has_more=false.
- Raison : un user qui revient après 6 mois ne doit pas déclencher un
  pull de milliers de rows en une requête sur Render.

### 18.5 Suppression de compte — exigence Play Store (motif de rejet)
- Écran Paramètres → "Supprimer mon compte" + page web équivalente.
- Soft-delete 30 jours (compte désactivé, réactivable) puis purge totale.
- À livrer AVANT la première soumission store (S12 du planning).

### 18.6 Historique 90 jours — annoncer le mur
- Dernière carte d'onboarding : "Ton historique complet est conservé pour
  toujours. L'affichage gratuit couvre les 90 derniers jours."
- Notification douce à J75. JAMAIS de paywall surprise à J91.

### 18.7 i18n — aucune string hardcodée
Aucune string UI en dur, même en français. Tout passe par i18next dès le
premier écran. Le FR est la locale par défaut ; l'EN (Phase 3
Nigeria/Ghana) ne doit exiger AUCUNE réécriture de composants.

### 18.8 Infrastructure & coûts
- Render : free tier OK Phase 1 ; plan payant OBLIGATOIRE dès
  l'intégration des webhooks PawaPay (un webhook perdu = un paiement
  non crédité).
- Budget mensuel à tenir à jour dans LYXO_Plan_Complet §Coûts
  (scénarios 0 / 1k / 10k users). Aucune nouvelle dépendance payante
  sans l'ajouter au tableau.
- Branch.io : vérifier les limites du free tier AVANT d'y coupler la
  boucle virale ; fallback = liens web simples lyxo.app/p/{id}.

### 18.9 Marketplace & payouts coachs — REPOUSSÉS EN V2 (révisé)
Le MVP V1 ne contient NI wallet coach NI vente de programmes NI payout.
V1 monétise uniquement Lyxo+ (BILLING_FLOW.md). Architecture V2 actée :
- Wallet coach = solde comptable dans TA base (coach_wallets), l'argent
  physique reste sur ton compte PawaPay jusqu'au payout.
- Vente : webhook payment.complete → commission LYXO + coach_share →
  UPDATE coach_wallets.balance. Rétention 48-72h avant "retirable".
- Retrait : à la demande, seuil min 5 000 FCFA. Le clic crée
  payout_requests(status='pending') — JAMAIS d'appel API direct au clic.
  Cron quotidien → PawaPay POST /v2/payouts (payoutId UUIDv4 généré par
  nous = idempotence native, metadata coach_id), retry backoff
  (1m→5m→30m), circuit breaker après 3 échecs → failed_retry_later +
  alerte admin. Prérequis : Payouts activés sur le compte PawaPay
  (sinon PAYOUTS_NOT_ALLOWED).
- Manuel hebdo tant que < 20 coachs ; automatisé au-delà de 20-30.
- Prérequis avant le code V2 : devis écrit frais Transfers PawaPay,
  statut juridique/fiscalité des reversements au Cameroun.

### 18.10 Modération & contenu
- Auto-hide d'un post à 3 signalements + review manuelle sous 48h.
- Traductions d'exercices générées par IA : relecture humaine d'un
  échantillon de 30 avant prod (instructions fausses = risque blessure).
- Licence ExerciseDB Pro : facture + termes archivés dans /docs/licenses/.

### 18.11 PLANNING OFFICIEL — MVP 16 semaines, Discover coupé
**MVP beta coachs = S1-S12, SANS Discover public.**
- Inclus : auth, onboarding, logger complet, sync (18.3/18.4), progress/
  PR/heatmap, profils, follow, feed abonnés, stories, Conquête + Trace +
  Leaderboard amis (différenciateurs — restent), push, signalement,
  Data Saver, i18n, suppression de compte.
- Phase 2 (S13-S16 → post-beta) : Discover public (trending, posts et
  commentaires publics), puis nutrition, coach mode, paiements.
- Justification : la beta = 10 coachs et leurs clients qui se
  connaissent déjà ; le feed abonnés suffit, un Discover vide dessert.
- Recrutement des 10 coachs : commence en PARALLÈLE du code, dès S1.
- Métrique de décision : J7 ≥ 40% excellent · 25-40% itérer ·
  < 20% après 2 cycles d'amélioration = pivot Coach Mode B2B pur.
- Les 16 semaines sont le scénario OPTIMISTE (MboaTV + études en
  parallèle). Ne pas compresser.


---

## 19. DÉCISIONS PRODUIT — Interview de convergence (fin Juillet 2026)
(25 questions tranchées AVANT le code. Priment sur toute section antérieure.)

### 19.1 Identité & inscription
- Auth email/Google/Apple. AUCUN numéro de téléphone à l'inscription —
  le téléphone n'est demandé qu'au moment du paiement web (prompt MoMo).
- billing_region = pays déclaré à l'onboarding + IP en confirmation
  (jamais décidé côté client, correction via endpoint admin).
- Compte OBLIGATOIRE avant de logger (pas de mode anonyme en V1).
- Pseudos : recommandations/suggestions si pseudo problématique (liste FR/
  camfranglais), pas de blocage dur. Photos de profil : 100% réactif
  (signalement), aucune validation a priori.

### 19.2 Trial & premium
- Trial 14 jours déclenché MANUELLEMENT ("Essayer Lyxo+ 14 jours" au
  contact d'une feature premium) — jamais auto à l'inscription.
- PRs et 1RM estimé calculés sur TOUT l'historique pour TOUT LE MONDE
  (un PR est une vérité). Le gratuit masque uniquement la CONSULTATION
  des séances/graphes > 90 jours.
- Multi-device : gratuit = 1 appareil actif (nouveau login déconnecte
  l'ancien, table devices) ; Lyxo+ = multi-appareils simultanés.
  La sync serveur tourne pour tous (zéro perte de données, promesse brief).
- Export : JSON brut GRATUIT (conformité RGPD, via page web compte) ;
  PDF/CSV mis en forme = Lyxo+.

### 19.3 Social
- Follow ASYMÉTRIQUE (modèle Instagram) ; comptes privés DANS LE MVP
  (structurant pour les RLS — follow sur approbation, stats invisibles
  aux non-abonnés).
- Rivalités (Conquête/Trace/Leaderboard) UNIQUEMENT entre follows
  MUTUELS. Comparaison en poids brut, même exercice. Onglet ratio
  force/poids de corps = V2.
- Notification de Conquête : au détrôné + aux follows mutuels communs.
- Feed : séances terminées auto-publiées aux abonnés en format compact
  (volume/durée/PRs) ; réglage "séances privées par défaut" ; stories et
  célébrations PR = partage manuel uniquement.
- Stories : photo perso OPTIONNELLE + overlay stats (décision Q23a) avec
  garde-fous OBLIGATOIRES : carte-stats par défaut (fallback offline),
  compression client ≤ 300 Ko WebP, file d'attente offline + retry,
  NSFW-check automatique à l'upload (nsfwjs ou équivalent) + auto-hide
  3 signalements, Data Saver = photos au tap (placeholder flou),
  purge Storage à 24h par cron.
- LWW silencieux (pas de toast de conflit) — acceptable car 1 appareil
  actif en gratuit.

### 19.4 Coach Mode V1 (Découverte — SANS argent, cf. §18.9)
- Liaison client→coach : lien d'invitation lyxo.app/invite/{code}
  (WhatsApp) UNIQUEMENT. Recherche de coachs in-app = V2.
- Deep links : Android App Links natifs + page web fallback → Play Store.
  PAS de Branch.io (risque tarifaire, dépendance inutile).
- Le coach voit TOUT par défaut (séances détaillées, assiduité, PRs) —
  mention explicite à l'acceptation de l'invitation : "Ton coach verra
  tes séances et ta progression".
- Programmes : structure LIBRE définie par le coach (exos + séries ×
  reps + charges cibles ou %1RM, durée de cycle au choix — l'app
  n'impose pas de format). Vue écart prévu/réalisé complète côté coach.
- PAS de messagerie in-app en V1 : bouton WhatsApp sur la fiche
  coach/client. Messagerie = V2 (avec la marketplace).
- Relation coach↔client MANY-TO-MANY (table coach_clients) : un user
  peut avoir plusieurs coachs, un coach peut être client d'un autre.
  is_coach = booléen sur le profil unique, pas un type de compte.

### 19.5 Contenu & data
- Exercices : pack de ~50 GIFs embarqué (les classiques PPL, ~8-12 Mo),
  150+ à la demande avec cache (téléchargés en arrière-plan au premier
  lancement wifi). ASSUMPTION : liste exacte des 50 à définir avec les
  coachs beta.
- LANGUE (révision) : choisie par l'USER à la création du compte —
  sélecteur FR/EN dans l'onboarding, FR pré-sélectionné pour
  billing_region africa_momo. FR + EN livrés dès la V1 (i18next câblé
  écran 1 rend le coût marginal ; instructions ExerciseDB déjà EN
  natives). L'expansion Phase 3 (Nigeria/Ghana) devient marketing,
  plus technique.
- Data Saver : OFF par défaut partout ; carte de proposition dans
  l'onboarding pour billing_region africa_momo.
- Push : Expo Push Notifications pour tout le MVP.
- Emails transactionnels : Resend (défaut, interchangeable).

### 19.6 Livraison & qualité
- Local : Expo DEV BUILD (pas Expo Go — WatermelonDB natif).
- Staging : Supabase branch + Render preview + Play Console INTERNAL
  TESTING track pour les 10 coachs (pas d'APK WhatsApp).
- Prod : EAS Build .aab → Play Store. PLAY APP SIGNING activé dès le
  premier upload (irréversible, protège la clé).
- Hotfix JS : EAS Update (OTA). Changement natif = nouveau .aab.
- CI : GitHub Actions (lint + typecheck + tests unitaires sur PR),
  builds EAS déclenchés manuellement.
- Definition of Done (8 points) : (1) offline→sync sans perte testé
  mode avion ; (2) états vide/chargement/erreur ; (3) zéro string hors
  i18next ; (4) testé Pixel 8 + device bas de gamme ≤ 3 Go RAM
  [OPEN : device à acquérir — Tecno/Itel d'occasion] ; (5) tests
  unitaires sur logique critique (pr-detection, sync, billing) ;
  (6) zéro crash Sentry sur le parcours ; (7) budgets perf : cold
  start < 3s bas de gamme, ouverture logger < 1s ; (8) kill switch
  remote pour toute feature touchant sync ou billing.

### 19.7 Risques ouverts (à date)
1. Device de test bas de gamme à acheter.
2. Merchant registration Play Console Cameroun à vérifier (voie RevenueCat).
3. Devis écrit frais PawaPay Transfers (bloquant V2, pas V1).
4. Recrutement des 10 coachs = tâche terrain S1.
5. Si S10-S11 débordent : la photo perso des stories glisse en S13,
   la carte-stats reste.
6. Statut juridique/fiscal des reversements coachs (V2).


### 19.8bis Photo hero — exception écrans d'entrée (DÉCISION Lionel, Juillet 2026)
La photographie RÉELLE (stock licenciée, vrais humains, visages OK) est
autorisée comme hero sur les écrans PRÉ-AUTH uniquement (Welcome/pitch,
splash variante, assets store). **Les photos générées par IA restent
interdites PARTOUT, sans exception.** Traitement : gradient #0B0A0A
≥ 60 %, aucun marqueur régional (§19.8 s'applique aux photos), asset
embarqué WebP ≤ 200 Ko. DANS l'app, rien ne change : data is the hero,
avatars = initiales. Détail : LYXO_UI_PROMPT.md (PHOTO HERO EXCEPTION,
écran 1ter).

### 19.8 Design universel (décision fin Juillet 2026)
LYXO cible tout le monde. La STRATÉGIE reste Afrique-first (go-to-market,
coachs, billing_region) mais le DESIGN est universel : aucun marqueur
régional/culturel/géographique dans l'UI, les mockups, les illustrations
ou les textes d'exemple. Les spécificités marché vivent dans la logique
(Data Saver, billing, formats de nombres par locale), jamais dans
l'esthétique.

### 19.9 Workflow backend Supabase (gravé)
- Supabase CLI installée dans le projet (`npm i supabase --save-dev`,
  `npx supabase init`). TOUTE modification de schéma passe par un
  fichier de migration SQL dans `supabase/migrations/` — jamais par
  l'interface web, jamais par du code applicatif.
- Après CHAQUE migration : `npm run supabase:generate-types` →
  `src/types/supabase.ts`. Le frontend référence exclusivement ces
  types générés (zéro structure de table devinée).
- Scripts package.json : supabase:generate-types cible la branche
  distante (`--project-id`) — PAS de stack Docker locale en V1
  (option notée si besoin de dev 100% offline un jour).
- Les RLS policies sont écrites en SQL dans les migrations, testées
  via le Supabase MCP avant merge.

### 19.10 Icônes
lucide-react-native, exclusivement. Aucune autre bibliothèque d'icônes,
aucun SVG d'icône custom sans décision écrite.


### 19.11 Palette officielle : "Braise" (décision finale Juillet 2026)
Glace/Or de Douala/Volt archivées. Tokens tailwind.config.js du Bloc A1 :
```js
colors: {
  bg:      '#0B0A0A',  // fond
  card:    '#151312',
  input:   '#1E1B1A',
  border:  '#2C2826',
  muted:   '#8E8781',  // texte secondaire
  fg:      '#F5F1EC',  // texte principal (blanc os)
  ember:   '#C73E3A',  // accent unique — 1 CTA + 1 badge max/écran
  steel:   '#3A3F47',  // structure secondaire
}
```
Règles : ember mat jamais fluo · réservé compétition/action, jamais
erreurs (destructif = muted) · heatmaps = 4 opacités d'ember · zéro bleu.
Logos : monogramme LX + wordmark stencil LYXO fournis — blanc os sur
fond sombre, jamais recolorés en ember, jamais d'effets. Icône app =
LX sur #0B0A0A. Fichiers sources dans /assets/brand/.


### 19.12 Framework mobile : React Native + Expo (confirmé, Flutter écarté)
Décision fermée après analyse comparative (Juillet 2026). React Native
gagne sur les 3 facteurs qui décident du succès de LYXO :
(1) WatermelonDB — le socle offline-first n'existe qu'en RN, un
équivalent Flutter (Drift/Isar/PowerSync) exigerait de reconcevoir le
protocole de sync soi-même ; (2) vélocité solo — capital de compétences
React/TypeScript déjà acquis (AdsFacile, MboaTV) ; (3) qualité du code
généré par Claude Code — React/TS est le territoire le mieux couvert,
tout l'outillage (Expo MCP, Context7, NativeWind) est calibré RN.
Flutter gagnerait sur un seul critère (perf brute Android bas de
gamme), neutralisé par la discipline déjà actée dans la DoD (device de
test ≤ 3 Go obligatoire, FlashList, budgets perf mesurés). Écarté
définitivement — ne pas rouvrir sans échec démontré de RN, pas une
préférence théorique.

### 19.12bis CONFORMITÉ CONFIRMÉE PAR ÉCRIT — Google Play Support (Juillet 2026)
Réponse officielle obtenue (texte intégral : BILLING_FLOW.md §9) :
le flux "écran informatif in-app (consumption-only) + paiement externe
par email" est CONFIRMÉ CONFORME pour les pays où Play Billing ne
supporte pas le Mobile Money — exception "billing system not available"
applicable, comme anticipé. RÈGLE CORRIGÉE (plus stricte que prévu) :
l'écran in-app ne doit contenir NI URL NI nom de site NI verbe
d'action de paiement — l'invitation à payer vit EXCLUSIVEMENT dans
l'email, jamais dans l'app, même sous forme de texte. Billing Library
non requise pour ces users. App Access (identifiants de test permanents
en Play Console) obligatoire avant soumission review — voir
BILLING_FLOW §8bis.

### 19.13 Programmes de facturation Google — état des lieux (Juillet 2026)
Tableau de référence (vérifié via developer.android.com et support
Google) pour trancher toute question future sur un paiement in-app
alternatif :
| Programme | Zone couverte | Frais Google sur transactions externes |
|---|---|---|
| User Choice Billing | Pays pilotes élargis (le cas Spotify) | ~11-26% |
| Alternative billing sans choix | EEE, Corée du Sud | réduit, variable |
| External Offers | EEE | réduit + conditions |
| External Content Links | US uniquement (post jugement Epic) | 10% abonnements / 20% autres |
| External Payments | Japon uniquement | 10% abonnements / 20% autres |
| **Cameroun / zone CEMAC** | **Aucun programme ouvert** | Reste du monde : 30/09/2027 |
Conclusion : aucune voie in-app alternative n'existe pour l'Afrique
francophone en 2026 — tous les programmes découlent de contraintes
légales locales (Corée, DMA UE, jugement US, loi japonaise), aucune
n'existe encore en zone CEMAC. L'architecture vente web (BILLING_FLOW
voie A) reste la seule conforme ET la plus rentable (0% vs 10%+ minimum
même dans les programmes ouverts ailleurs). Réponse écrite de Google
Play Support en attente sur l'exception "Play Billing non disponible
localement" (email envoyé) — seule inconnue restante.

### 19.14 Deadline technique Billing Library 8+
Toute nouvelle app/mise à jour doit utiliser Billing Library v8+ au
31/08/2026 (extension possible jusqu'au 01/11/2026). RevenueCat suit
ces obligations ; vérifier la version embarquée par le SDK au moment de
l'intégration Phase 3, ne pas assumer la conformité automatique.


### 19.15 Unités de poids : kg ET lbs (décision fin Juillet 2026)
- **Stockage : TOUJOURS en kg** (numeric, colonne unique `weight_kg` sur
  les sets, PRs, targets de programmes). AUCUNE colonne lbs, AUCUN
  stockage mixte — le kg est l'unité canonique absolue.
- **Affichage : dans l'unité choisie par l'user** — préférence
  `profiles.weight_unit` ('kg' | 'lbs'), sélectionnée à l'onboarding
  (kg pré-sélectionné) et modifiable dans Paramètres à tout moment
  (changer d'unité reconvertit l'affichage instantanément, ne touche
  jamais les données).
- Conversion : 1 kg = 2,20462 lbs. Affichage arrondi intelligemment
  (82,5 kg → 181,9 lbs ; jamais 181,88155).
- **Incréments du logger par unité** : steppers ±2,5 kg en mode kg ;
  ±2.5 lbs et ±5 lbs en mode lbs (les plaques réelles US). La saisie
  directe accepte l'unité active et convertit en kg à l'enregistrement.
- **Social/rivalités : comparaison toujours sur weight_kg** — un user
  lbs et un user kg s'affrontent sur la valeur canonique ; chacun VOIT
  le leaderboard/la Conquête/la Trace dans sa propre unité.
- Cartes PR partageables et stories : rendues dans l'unité de l'AUTEUR.
- i18n des formats : "82,5 kg" (virgule, FR) / "181.9 lbs" (point, EN)
  — la locale et l'unité sont deux préférences indépendantes (un
  francophone peut vouloir des lbs).
- Coach → client : les charges cibles d'un programme sont stockées en
  kg (ou %1RM) ; chaque client les voit dans SON unité.


---

## 20. CORRECTIONS DE COHÉRENCE (audit externe, fin Juillet 2026)
Ces règles PRIMENT sur toute section antérieure contradictoire.

### 20.1 is_premium : DÉRIVÉ, jamais une colonne
La colonne physique `is_premium` est SUPPRIMÉE des schémas SQL et Prisma
(corrigé dans le corps du document). Source de vérité unique : la table
`subscriptions` (BILLING_FLOW §3) + `trial_expires_at`. Le backend calcule
le booléen au moment de construire le payload de sync (fonction/RPC ou
calcul applicatif) et l'app le lit depuis le payload — le client ne peut
jamais l'écrire.

### 20.2 Statuts payments : terme officiel = 'complete'
Enum harmonisé PARTOUT : 'pending' → 'provisional_access' → 'complete' |
'failed' | 'refunded'. Le terme 'success' est aboli (il coexistait avec
'complete' entre le plan V16 et BILLING_FLOW — violation de contrainte
CHECK garantie en prod). BILLING_FLOW §3 fait foi.

### 20.3 Deux purges différentes, deux délais — clarification (pas une contradiction)
- **Soft-delete de DONNÉES synchronisées** (un set/une séance supprimée
  par l'user) : `deleted_at` propagé par la sync, purge physique par cron
  à J+90 (règle 18.3). L'user garde son compte.
- **Suppression de COMPTE** (18.5) : désactivation réversible 30 jours,
  puis purge TOTALE du compte et de toutes ses données (y compris celles
  qui n'avaient pas de deleted_at). Le J+90 ne s'applique pas ici — la
  purge de compte à J+30 emporte tout.
Les deux règles coexistent car elles portent sur des objets différents.

### 20.4 Paiement web + offline-first : le pont obligatoire
Le scénario critique : l'user paie sur le web (ordinateur/navigateur),
puis ouvre l'app avec un réseau faible → sans pont, l'app affiche encore
"gratuit" et l'user croit son paiement perdu. Triple filet obligatoire :
1. Push silencieuse à la confirmation webhook → sa réception DÉCLENCHE
   un /sync explicite (pas une lecture locale).
2. Bouton "Actualiser mon statut" sur le Profil (force un sync manuel).
3. Sync automatique à chaque foreground de l'app (déjà prévu Bloc C2).

### 20.5 Prisma : modèles billing OBLIGATOIRES avant la Phase 3
Le schema.prisma du backend DOIT contenir les modèles `Subscription`,
`Payment`, `PayLink` conformes à BILLING_FLOW §3 (mêmes colonnes, mêmes
enums — dont status 'complete') AVANT toute ligne de code webhook.
L'extrait §17.1 (Profiles/Workouts) n'est PAS le schéma complet — c'est
un exemple pédagogique. Règle de génération : les migrations SQL de
BILLING_FLOW §3 sont la référence ; Prisma est généré/aligné dessus
(`prisma db pull` après migration), jamais l'inverse.

### 20.6 "V1" dans BILLING_FLOW ≠ MVP S1-S12 — clarification de vocabulaire
BILLING_FLOW décrit le "Scope V1 du billing" = la PREMIÈRE ITÉRATION du
système de paiement, qui se code en PHASE 3 (post-beta), jamais pendant
le MVP S1-S12. L'interdiction 16.4 ("ne pas coder paywall/PawaPay/
RevenueCat pendant le MVP") reste pleinement valide. Pendant S1-S12, on
crée UNIQUEMENT les colonnes trial_used/trial_expires_at/billing_region
(nécessaires à l'onboarding et au trial) — AUCUNE table subscriptions/
payments/pay_links, aucun SDK de paiement.


### 19.16 Mockup de référence — Claude Design (fin Juillet 2026)
Le design visuel officiel de LYXO existe désormais sous forme de
prototype HTML/CSS pixel-défini (pas juste un prompt) :

- **Projet Claude Design** :
  https://claude.ai/design/p/d9a9f161-6f55-4f66-a310-037f843e3812?file=LYXO+Screens+Braise.dc.html
- **Fichier de référence** : `LYXO Screens Braise.dc.html` — les 16
  écrans du MVP (Splash, Onboarding, Auth, Accueil, Workout Logger,
  Repos, Record, Progrès, Feed, Story composer, Rivalités, Profil, Coach
  clients, Programme builder, Paramètres, Lyxo+), rendus sur la palette
  Braise exacte (ember #C73E3A, acier #3A3F47, fond #0B0A0A, cards
  #151312, texte #F5F1EC), avec les vrais logos (monogram-bone.png,
  wordmark-bone.png).
- **Fichiers additionnels du bundle** : `LYXO Design System.dc.html`
  (tokens/composants — ⚠️ contient encore d'anciens tokens Or de Douala
  #F2A33C/#1B2A4A, périmés — Braise fait foi), `Workout Logger
  Braise.dc.html` (vue détaillée de l'écran critique).
- **Localisation locale** : bundle complet dans `/design/handoff/` du
  repo (voir README.md du bundle pour les instructions à l'agent).

RÈGLE D'IMPLÉMENTATION (du README du bundle, reprise ici) : c'est un
PROTOTYPE HTML/CSS/JS, pas du code de production. L'objectif est de
recréer PIXEL-PERFECT en React Native/NativeWind — ne pas copier la
structure HTML, matcher le résultat visuel (dimensions, couleurs,
layout). Ne pas rendre les fichiers dans un navigateur pour capturer des
screenshots — tout est déjà lisible dans le HTML/CSS source (couleurs,
tailles, règles de layout). En cas d'ambiguïté entre ce mockup et
LYXO_UI_PROMPT.md, LE MOCKUP FAIT FOI (plus précis, pixel-défini) — le
prompt reste utile pour générer des écrans futurs non couverts (V2).

Accès agent : `claude_design` MCP
(https://api.anthropic.com/v1/design/mcp, auth via /design-login) pour
importer/lire le projet directement en session Claude Code.

⚠️ **DÉCALAGE CONNU prompt > mockup (audit UX, Juillet 2026)** — le
mockup actuel NE CONTIENT PAS les écrans/composants ajoutés depuis :
- Écrans : 2 révisé (objectif + split pré-auth), 3 révisé (récap
  endowment), 5bis Résumé de fin de séance, 4bis Historique d'un jour,
  13bis Profil coach public, 14bis Programme du jour, 16bis Paywall
  international (timeline).
- Composants : week strip (Accueil), anneau de séance (logger), bottom
  sheets exercices/templates, sparklines, légende heatmap, chips filtres.
ACTION LIONEL (avant le Bloc A3) : générer ces écrans dans Claude Design
avec le prompt v5 mis à jour (LYXO_UI_PROMPT.md), un écran par requête.
D'ici là, POUR CES ÉCRANS UNIQUEMENT, le prompt fait foi (exception
temporaire à la règle "le mockup prime").
