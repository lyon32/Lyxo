# ENV_SETUP.md — LYXO · Environment & Config
# Version : 1.0 — fin Juillet 2026
# Rôle : tout ce qu'il faut pour faire tourner LYXO en local, sans jamais
# committer un secret réel. Ce fichier liste les NOMS et le PROPOS de
# chaque variable — les valeurs vivent dans des .env non versionnés
# (voir .gitignore) ou dans les secrets GitHub Actions / Render / EAS.

---

## 1. REQUIRED ENV VARS

### 1.1 App mobile (`lyxo-app/.env`)
| Variable | Propos |
|---|---|
| `EXPO_PUBLIC_API_URL` | URL du backend (local / staging / prod) |
| `EXPO_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase (anon, safe côté client) |
| `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS` | Clé publique RevenueCat iOS (Phase 3) |
| `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID` | Clé publique RevenueCat Android (Phase 3) |
| `EXPO_PUBLIC_SENTRY_DSN` | DSN Sentry côté app |
| `EXPO_PUBLIC_POSTHOG_API_KEY` | Clé PostHog (branché au Bloc G, pas avant) |
| `EXPO_PUBLIC_POSTHOG_HOST` | Host EU PostHog (conformité RGPD, §19) |
| `EAS_PROJECT_ID` | ID du projet EAS (déjà créé — `5c9066f1-...`) |

> Préfixe `EXPO_PUBLIC_` obligatoire pour toute variable lue côté client
> (Expo l'inline au build) — RIEN de secret ne doit porter ce préfixe.
> Les clés ci-dessus sont toutes des clés PUBLIQUES par nature (anon key,
> clé publique RevenueCat, DSN Sentry) — sûres à exposer dans le bundle.

### 1.2 Backend (`lyxo-api/.env`)
| Variable | Propos |
|---|---|
| `DATABASE_URL` | Connexion Postgres (Supabase, pooling activé) |
| `DIRECT_URL` | Connexion directe Postgres (migrations Prisma) |
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service (bypass RLS) — **SECRET, backend only** |
| `SUPABASE_JWT_SECRET` | Vérification des JWT côté middleware auth |
| `PAWAPAY_API_TOKEN_SANDBOX` | Token API PawaPay sandbox (dev/staging, Phase 3) |
| `PAWAPAY_API_TOKEN_PROD` | Token API PawaPay production (Phase 3, jamais en local) |
| `PAWAPAY_CALLBACK_SIGNING_KEY` | Vérification signature RFC-9421 des callbacks |
| `REVENUECAT_WEBHOOK_SECRET` | Bearer secret pour vérifier les webhooks RevenueCat |
| `RESEND_API_KEY` | Envoi d'emails transactionnels |
| `RESEND_FROM_EMAIL` | Adresse d'expédition (hello@lyxo.app ou pass@lyxo.app) |
| `SENTRY_DSN` | DSN Sentry côté backend |
| `POSTHOG_API_KEY` | Événements serveur (funnel signup, etc.) |
| `ADMIN_API_KEY` | Header `X-Admin-Key` pour les routes `/v1/admin/*` |
| `PORT` | Port d'écoute local (défaut 3000) |
| `NODE_ENV` | `development` / `staging` / `production` |

### 1.3 Web (`lyxo-web/.env`) — Phase 3 principalement
| Variable | Propos |
|---|---|
| `NEXT_PUBLIC_API_URL` (ou équivalent selon le framework choisi) | URL du backend pour la page /pay |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Si la page a besoin de lire un profil public |

### 1.5 Environnements par profil de build (ajout audit deep-tech)
Les variables `EXPO_PUBLIC_*` sont inlinées AU BUILD — chaque profil EAS
porte donc SON jeu de valeurs dans `eas.json` (`build.<profile>.env`) :
| Profil | `EXPO_PUBLIC_API_URL` | Sentry `environment` | PostHog |
|---|---|---|---|
| development | backend local / staging | development | désactivé |
| preview | Render preview (staging) | staging | clé staging (ou désactivé) |
| production | https://api.lyxo.app | production | clé prod (EU) |
- RÈGLE : un build preview ne peut JAMAIS contenir l'URL API de prod —
  assert au boot (hors production : `if (!__DEV__ && url.includes
  ('api.lyxo.app') && profile !== 'production') throw`).
- Sentry/PostHog tagués par environnement : un crash de staging ne
  pollue jamais le crash-free de prod ; un event de test ne pollue
  jamais les funnels de décision beta.

### 1.6 Incident "clé fuitée" — procédure de rotation (à exécuter sous 1h)
| Secret fuité | Rotation | Impact/ordre |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Régénérer dans Supabase Dashboard | Invalide l'ancienne IMMÉDIATEMENT → mettre à jour Render et redéployer dans la foulée (sinon backend down) |
| `SUPABASE_JWT_SECRET` | Rotation Supabase | Invalide toutes les sessions → users re-login (acceptable, prévenir si possible) |
| `PAWAPAY_API_TOKEN_*` | Révoquer + régénérer dans le Dashboard PawaPay | Mettre à jour Render AVANT le prochain paiement |
| `ADMIN_API_KEY` / `REVENUECAT_WEBHOOK_SECRET` / `RESEND_API_KEY` | Régénérer côté service | Render env + redeploy |
Prévention : `gitleaks` en pre-commit (une ligne dans le hook husky déjà
prévu, CONVENTIONS §2) — aucun secret ne part dans un commit.

### 1.4 CI/CD (secrets GitHub Actions, jamais dans un fichier .env)
| Secret | Propos |
|---|---|
| `EXPO_TOKEN` | Auth EAS depuis la CI |
| `CODECOV_TOKEN` (si utilisé plus tard) | Coverage reporting |

---

## 2. LOCAL DEV SETUP STEPS

### 2.1 Prérequis machine
1. **Node.js 20 LTS** (`node -v` pour vérifier).
2. **Git** configuré avec ton compte GitHub.
3. **Android Studio** (émulateur + SDK) — nécessaire même sur Windows,
   Java (`JAVA_HOME`) en découle pour Maestro.
4. **Expo CLI** : pas d'install globale requise, `npx expo` suffit.
5. **EAS CLI** : `npm install --global eas-cli`.
6. Un **appareil Android physique** configuré en mode développeur (Pixel
   8) + un **device bas de gamme ≤ 3 Go RAM** (Tecno/Itel — DoD point 4,
   à acquérir si pas encore fait).

### 2.2 Cloner et installer
```bash
git clone <repo-app-url> lyxo-app && cd lyxo-app
npm install
cp .env.example .env    # puis remplir avec tes valeurs de dev/staging
```
Répéter pour `lyxo-api` (backend) et `lyxo-web` si travaillé en parallèle.

### 2.3 Outillage Claude Code (une fois, sur la machine)
Voir IMPLEMENTATION_PLAN.md Bloc A1 pour le détail complet et les
commandes exactes : Context7 MCP, Resend MCP, Maestro MCP, GitHub MCP,
Supabase MCP, Expo MCP, CodeRabbit (GitHub App).

### 2.4 Setup Supabase
```bash
cd lyxo-api
npm install supabase --save-dev
npx supabase login
npx supabase link --project-ref <ton-project-ref>
npm run supabase:generate-types   # génère src/types/supabase.ts + prisma db pull
```
Pas de Docker local (§20.5/§19.9) — les migrations et la génération de
types ciblent la branche Supabase distante (staging).

### 2.5 Lancer l'app
```bash
cd lyxo-app
npx expo start --dev-client   # PAS `expo start` seul : WatermelonDB
                               # exige un dev build, pas Expo Go
```
Si aucun dev build n'existe encore sur ton appareil :
```bash
eas build --profile development --platform android
# installer l'APK généré sur le Pixel 8, puis relancer expo start --dev-client
```

### 2.6 Lancer le backend
```bash
cd lyxo-api
npm run dev   # nodemon/tsx watch sur src/index.ts
```

### 2.7 Vérifier le setup
- L'app boot sur le Pixel 8 ET le device bas de gamme.
- `npx tsc --noEmit` (app et backend) : zéro erreur.
- `npm run lint` : zéro erreur.
- Un écran de test NativeWind (bg/card/ember Braise) s'affiche
  correctement (valide la recette NativeWind, §A1).
- Sentry reçoit une erreur de test (`Sentry.captureException(new
  Error('test'))` retiré ensuite).

---

## 3. DEPENDENCY LIST (versions clés — le détail exhaustif vit dans
   `package.json`, ceci est le résumé des choix structurants)

### 3.1 App mobile
| Dépendance | Version | Rôle |
|---|---|---|
| expo | dernière stable | Framework |
| react-native | bundlée par Expo SDK | — |
| typescript | ^5.4 | |
| nativewind | ^4.x (jamais v5) | Styling |
| tailwindcss | ^3.4.17 (jamais v4) | Requis par NativeWind v4 |
| react-native-reanimated | peer de NativeWind | |
| react-native-safe-area-context | peer de NativeWind | |
| @nozbe/watermelondb | dernière stable compatible New Arch | Offline-first |
| expo-router | version Expo SDK | Navigation |
| lucide-react-native | dernière stable | Icônes, exclusif (§19.10) |
| @sentry/react-native | dernière stable | Erreurs |
| posthog-react-native | dernière stable | Analytics (branché Bloc G) |
| react-purchases (RevenueCat) | dernière stable, Billing Library 8+ compatible | IAP (Phase 3) |
| i18next / react-i18next | dernière stable | i18n dès l'écran 1 |
| zustand | dernière stable | State management éphémère (LLD §4) |
| expo-updates | version Expo SDK | OTA |
| expo-secure-store | version Expo SDK | Session Supabase (Keystore/Keychain — SECURITY_NOTES §3bis.1, OBLIGATOIRE) |
| expo-image | version Expo SDK | Images/GIFs exclusif (CONVENTIONS §5.7) |
| @shopify/flash-list | dernière stable compatible SDK | Listes longues par défaut (CONVENTIONS §5.7) |
| expo-local-authentication | version Expo SDK | Re-auth biométrique avant suppression de compte (SECURITY_NOTES §3bis.2) |
| expo-notifications | version Expo SDK | Push + notification locale du rest timer (PRD 1.2) |

### 3.2 Backend
| Dépendance | Version | Rôle |
|---|---|---|
| node | 20 LTS | |
| typescript | ^5.4 | |
| express | ^4.x | |
| @prisma/client + prisma | dernière stable | ORM (aligné sur migrations SQL, §20.5) |
| @supabase/supabase-js | dernière stable | Auth verification, Storage |
| @sentry/node | dernière stable | Erreurs |
| posthog-node | dernière stable | Analytics serveur |
| resend | dernière stable | Emails |
| node-cron (ou équivalent) | dernière stable | Jobs planifiés |
| pino | dernière stable | Logger structuré JSON + rédaction PII (CONVENTIONS §6) |

### 3.3 Dev-only
| Dépendance | Rôle |
|---|---|
| eslint + @typescript-eslint | Lint |
| prettier + prettier-plugin-tailwindcss | Format |
| supabase (CLI) | Migrations, types |
| eas-cli | Build/OTA |
| maestro (CLI, hors npm) | E2E |

---

## 4. FICHIERS À NE JAMAIS COMMITTER
```
.env
.env.local
.env.*.local
supabase/.temp/
*.keystore
*.jks
google-service-account.json   # clé service Play Console (RevenueCat)
```
`.env.example` (sans valeurs réelles, juste les noms de variables
ci-dessus) EST committé — c'est le contrat pour tout nouvel environnement.

---

*Documents liés : IMPLEMENTATION_PLAN.md Bloc A1 (setup détaillé outillage
Claude Code) · ARCHITECTURE.md (rôle de chaque service externe) ·
BILLING_FLOW.md (détail des clés PawaPay/RevenueCat, Phase 3).*
