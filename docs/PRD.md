# PRD.md — LYXO · Product Requirements Document
# Version : 1.0 — fin Juillet 2026
# Rôle : le QUOI précis. PROJECT_BRIEF dit pourquoi, CLAUDE_LYXO_V3 dit
# comment techniquement, IMPLEMENTATION_PLAN dit quand. Ce document liste
# chaque feature, son statut (MVP/V2/Future), ses user stories, ses flows
# et ses edge cases — le niveau de détail qui évite qu'une session Claude
# Code invente un comportement non spécifié.

---

## 1. CORE FEATURES — Priorisées

Légende : 🟢 MVP (S1-S12, obligatoire) · 🟡 Nice-to-have MVP (coupé en
premier si le planning glisse) · 🔵 V2 (Phase 2-3, planifié) · ⚪ Future
(non planifié, idée seulement)

### 1.1 Compte & Onboarding
| Feature | Statut | Notes |
|---|---|---|
| Auth email + Google + Apple | 🟢 | Supabase Auth |
| Choix langue FR/EN à l'inscription | 🟢 | §19.5 — pas de 3e langue avant traction |
| Détection billing_region (pays + IP) | 🟢 | Jamais de téléphone à l'inscription — §19.1 |
| Choix unité kg/lbs | 🟢 | kg pré-sélectionné — §19.15 |
| Onboarding (objectif, pays, Data Saver, annonce 90j) | 🟢 | 2-3 écrans |
| Compte privé (approbation follow) | 🟢 | Structurant pour RLS — Q8 |
| Suppression de compte + export JSON | 🟢 | Exigence Play Store — §18.5 |
| Mode invité (log sans compte) | ⚪ | Rejeté Q2 — friction offline-first trop coûteuse |

### 1.2 Workout Logger (le cœur)
| Feature | Statut | Notes |
|---|---|---|
| Logger poids×reps, offline-first | 🟢 | < 5s par set — critère de succès §3 |
| Templates/splits/rotation de séances | 🟢 | |
| Rest timer plein écran | 🟢 | Anneau derrière les chiffres, ±15s. ⚠️ Background (cas majoritaire en salle : écran verrouillé/appel pendant le repos) : timer par TIMESTAMP (`endsAt = now + duration` persisté, recalcul au foreground — jamais un setInterval qui meurt en background) + notification locale programmée (`expo-notifications.scheduleNotificationAsync` à `endsAt`) pour le son/vibration app fermée — zéro service background, zéro batterie |
| Détection PR (4 types) | 🟢 | + règles anti-triche §18.1 |
| Célébration PR + carte partageable | 🟢 | Zéro photo IA — audit design 1.6 |
| Écran résumé fin de séance (peak-end) | 🟢 | Audit §4.5 |
| Pack 50 exercices embarqué + 150 à la demande | 🟢 | Assumption : liste à valider coachs beta |
| Exercices custom (5 max gratuit) | 🟢 | |
| Unités kg/lbs (stockage kg canonique) | 🟢 | §19.15 |
| Séance Fantôme (ghost du dernier entraînement) | 🔵 | V2 — coût Realtime élevé |

### 1.2bis Objectif hebdo & streak — FORMULES FAISANT FOI (décision Juillet 2026)
Toute la gamification affichée (week strip, streak, framing du restant)
dérive de DEUX règles écrites — jamais réinventées en session :
- **Objectif hebdo (`profiles.weekly_goal`)** : nombre de séances visées
  par semaine. Défaut fixé par le split choisi à l'onboarding — PPL → 3,
  Upper/Lower → 4, Full Body → 3, Custom → 3. Modifiable dans Paramètres
  (1 à 7). Alimente la week strip de l'Accueil ("Plus qu'1 séance pour
  ta semaine" = weekly_goal − séances terminées cette semaine).
- **Streak** : nombre de semaines CALENDAIRES consécutives (lundi→
  dimanche, fuseau du device) où l'user a atteint son weekly_goal.
  La semaine COURANTE compte dans le streak dès que l'objectif y est
  atteint (jamais pénalisée avant dimanche). Une séance = un workout
  terminé (`finished_at` non null) — les templates et séances vides ne
  comptent pas. Changement de weekly_goal : s'applique à partir de la
  semaine courante, ne recalcule jamais le passé.
- Calcul : fonction pure `lib/streak.ts` (client, sur données Watermelon)
  — tests unitaires obligatoires (TESTING §1.1 : limite pile atteinte,
  semaine à cheval sur un changement d'objectif, fuseau horaire).

### 1.3 Progrès & Profil
| Feature | Statut | Notes |
|---|---|---|
| Graphes 1RM, volume (tout historique) | 🟢 | PRs jamais tronqués — Q13b |
| Heatmap consistance | 🟢 | 4 opacités ember |
| Historique > 90j masqué (gratuit) | 🟢 | Annoncé onboarding + notif J75 |
| Profil (stats grille 3col, tabs) | 🟢 | |
| Multi-device : 1 actif (gratuit) / illimité (Lyxo+) | 🟢 | Q11b |

### 1.4bis Permission notifications (Android 13+) — flow obligatoire
`POST_NOTIFICATIONS` est une permission RUNTIME depuis Android 13. La
Conquête, le rest timer background (1.2) et le pont paiement (§20.4)
en dépendent. RÈGLE : la permission est demandée AU MOMENT PERTINENT —
après le premier follow OU à la première fin de séance (contexte : "Sois
prévenu quand un ami bat ton record") — JAMAIS au premier lancement
(taux de refus maximal, pattern anti-Material). Refus = l'app fonctionne
intégralement, avec un rappel doux dans Paramètres.

### 1.4 Social
| Feature | Statut | Notes |
|---|---|---|
| Follow asymétrique | 🟢 | Q6 |
| Feed abonnés (séances auto, format compact) | 🟢 | Q7c |
| Stories 24h (carte stats + photo optionnelle) | 🟢 | Garde-fous §19.3 : compression, NSFW-check, purge cron |
| Leaderboard PRs (follows mutuels, poids brut) | 🟢 | Anti-triche §18.1 |
| Conquête (notif détrônage) | 🟢 | Détrôné + follows communs — Q9b |
| Trace "Titre à reprendre" (expire 6 mois) | 🟢 | §18.2 |
| Opt-outs (rivalité, séances privées, titres perdus) | 🟢 | §19.3 |
| Signalement + auto-hide 3 signalements | 🟢 | §18.10 |
| Discover public (trending, posts publics) | 🔵 | V2 — S13-S16, non-goal 7 |
| Messagerie in-app | 🔵 | V2 avec marketplace — bouton WhatsApp en V1 |
| Recherche de coachs in-app | 🔵 | V2 — Q16 |
| Ratio force/poids de corps (leaderboard) | 🔵 | V2 — Q9 |

### 1.5 Coach Mode
| Feature | Statut | Notes |
|---|---|---|
| Rôle coach (is_coach booléen) | 🟢 | Many-to-many coach↔client — Q20 |
| Créer programmes (structure libre coach) | 🟢 | Q18 |
| Inviter clients (lien lyxo.app/invite/{code}) | 🟢 | App Links natifs, pas Branch — Q21b |
| Suivi client (tout visible par défaut) | 🟢 | Consentement explicite — Q17 |
| Écart prévu/réalisé | 🟢 | |
| Vente de programmes (wallet, commission) | 🔵 | V2 — §18.9, PRICING §4 |
| Payout coach (PawaPay) | 🔵 | V2 |
| Coach Pro (tier payant) | 🔵 | V2 — dépend de la marketplace |

### 1.6 Monétisation
| Feature | Statut | Notes |
|---|---|---|
| Trial 14j manuel (toutes régions) | 🔵 | ROADMAP Phase 9 — jamais pendant MVP §20.6 |
| Paywall informatif Afrique (zéro paiement in-app) | 🔵 | ROADMAP Phase 9 — conforme Google, BILLING_FLOW §9 |
| PawaPay web (Afrique) | 🔵 | ROADMAP Phase 9 |
| RevenueCat IAP (reste du monde) | 🔵 | ROADMAP Phase 9 |
| Export PDF/CSV (Lyxo+) | 🔵 | ROADMAP Phase 9 |

### 1.7 Technique transverse
| Feature | Statut | Notes |
|---|---|---|
| Sync WatermelonDB (soft-delete, pagination) | 🟢 | Le socle — jamais compressé §18.11 |
| i18n complet (FR+EN, zéro string en dur) | 🟢 | |
| Sentry, Data Saver | 🟢 | |
| Push Expo | 🟢 | |
| Redis / cache distribué | ⚪ | Interdit avant 10k DAU — §16.6 |
| IA générative in-app | ⚪ | Non-goal 13 |
| Wearables/Bluetooth | ⚪ | Non-goal 14 |

---

## 2. USER STORIES — par persona, format "En tant que... je veux... afin de..."

### Pratiquant (Massa / persona primaire)
- En tant que pratiquant, je veux logger un set en moins de 5 secondes,
  même sans réseau, afin de ne pas casser mon rythme en salle.
- En tant que pratiquant, je veux qu'un nouveau PR soit détecté et célébré
  automatiquement, afin de ressentir la fierté immédiatement.
- En tant que pratiquant, je veux voir dans mon feed les séances de mes
  amis (follows mutuels), afin de rester motivé par leur activité.
- En tant que pratiquant, je veux être notifié quand un ami bat mon record,
  afin d'avoir un motif concret de revenir m'entraîner et le reprendre.
- En tant que pratiquant au forfait data limité, je veux activer le Data
  Saver, afin de ne pas épuiser mon crédit avec l'app.
- En tant que pratiquant, je veux que mes séances anciennes ne soient
  jamais supprimées même en gratuit, afin de ne pas perdre mon historique
  de progression.

### Coach (Éric / persona secondaire)
- En tant que coach, je veux créer un programme une fois et l'assigner à
  plusieurs clients, afin de ne plus renvoyer le même PDF à la main.
- En tant que coach, je veux inviter un client par un simple lien
  WhatsApp, afin qu'il s'inscrive et soit automatiquement lié à moi.
- En tant que coach, je veux voir les séances réelles de mes clients
  (prévu vs réalisé), afin d'ajuster leur programme en connaissance de
  cause plutôt que de deviner.

### Diaspora (Yann)
- En tant qu'user occidental, je veux payer mon abonnement par carte/Apple
  Pay en un tap, afin de ne pas avoir à gérer un flux différent.
- En tant qu'user de la diaspora, je veux suivre les séances de mes amis
  restés au pays, afin de garder le lien social malgré la distance.

---

## 3. KEY USER FLOWS

### 3.1 Happy path — Premier log de séance (le aha moment)
1. **Choix de langue (language.tsx — PREMIER écran absolu, avant tout)** →
   écran offline-first → **objectif (3 cards) → split préféré (PPL/UL/FB)
   — choisis AVANT l'inscription, pattern IKEA : AsyncStorage →
   raw_user_meta_data au signup** → Inscription (email/Google/Apple)
   avec récap "Ton programme Push/Pull/Legs est prêt — crée ton compte
   pour le sauvegarder", jauge jamais à 0 % → choix pays + unité kg/lbs
   (regroupés sur un écran) → carte Data Saver + annonce règle 90 jours
   (regroupées) → Accueil.
   (Ordre corrigé — audits doc + UX : la langue précède l'inscription
   (CLAUDE.md §7/§8, UI prompt 1bis) ; objectif/split pré-auth = effet
   IKEA/endowment (UI UX.md décision 1, UI prompt écrans 2-3).
   Regroupement des étapes pour la friction Day 0 : premier set loggable
   en < 5 min, insight SOSA.)
   ⚠️ RÈGLE TECHNIQUE (fiche 2 comité) : après le premier login de TOUT
   provider, l'app pousse goal/split/weekly_goal/username depuis
   AsyncStorage via `PATCH /v1/profiles/me` — l'OAuth ne transporte pas
   les meta_data, ce PATCH est le chemin universel.
   DÉCISIONS AUTH (fiches 7/9 comité) : confirmation d'email Supabase
   DÉSACTIVÉE en V1 (friction Day 0 fatale — l'email est vérifié de
   facto par le reset et les emails billing) · Android V1 = Google +
   email uniquement (le bouton Apple n'apparaît que sur le build iOS,
   où il est premier et égal — App Store Review 4.8).
2. Tap "Commencer la séance" → sélection template ou séance libre.
3. Sélection exercice → saisie poids × reps → "Valider la série" (rouge
   ember, seul CTA de l'écran) → toast "Enregistré sur ton téléphone ✓".
4. Répétition pour toutes les séries → "Terminer la séance".
5. Écran résumé (volume, durée, PRs) → option "Partager".
6. **Test critique** : tout ce parcours fonctionne en mode avion complet.

### 3.2 Happy path — Détection PR + Conquête
1. User A bat son propre record au développé couché → célébration PR
   locale immédiate (offline).
2. Sync → backend applique les règles anti-triche (§18.1) → si éligible
   ET si ça dépasse le record d'un follow mutuel (User B) → Conquête
   déclenchée.
3. User B reçoit une push "Ton record a été battu par @userA" → ouvre
   l'app → voit la Trace sur son profil + bouton "Récupérer mon titre".
4. User B s'entraîne, dépasse User A → nouvelle Conquête inversée, Trace
   de User A créée, celle de User B expire/s'archive.

### 3.3 Happy path — Coach invite un client
1. Coach crée un compte, active is_coach, construit un programme.
2. Coach partage lyxo.app/invite/{code} par WhatsApp à son client.
3. Client tape le lien → app installée → App Link ouvre directement
   l'écran d'acceptation ("Coach Éric souhaite te suivre — il verra tes
   séances et ta progression") → client accepte.
4. Coach assigne son programme au client → client le voit pré-rempli
   dans son logger → coach suit l'écart prévu/réalisé.

### 3.4 Happy path — Paiement Afrique (Phase 3)
Voir BILLING_FLOW.md §4 en entier — flow détaillé déjà spécifié
(trial manuel → écran informatif sans mention de paiement → email → web
PawaPay → webhook → sync → déblocage).

### 3.5 EDGE CASES CRITIQUES — à ne jamais oublier en session de dev

| # | Scénario | Comportement attendu |
|---|---|---|
| E1 | User logge une séance complète en mode avion, ferme l'app avant tout réseau | Zéro perte au retour du réseau — sync silencieuse au foreground (Bloc C2, DoD 1) |
| E2 | User modifie la même séance sur 2 appareils (l'un offline) | LWW silencieux, sans toast (Q12a) — rendu possible car gratuit = 1 appareil actif (Q11b) limite le risque |
| E3 | User A (95kg) "bat" le record d'un follow mutuel de 60kg avec un poids disproportionné | Exclu du leaderboard/Conquête si > 4× poids de corps ou delta > +15% (§18.1) — reste dans ses stats perso |
| E4 | User atteint J91 de son historique gratuit sans avoir été prévenu | Ne doit jamais arriver : annonce onboarding + notif J75 (18.6) — si ça arrive quand même, message clair, jamais un mur silencieux |
| E5 | User paie sur le web (Afrique) puis ouvre l'app en réseau faible | Triple filet §20.4 : push → /sync forcé, bouton "Actualiser mon statut", sync au foreground |
| E6 | User tente de rejouer un lien de paiement déjà utilisé | `pay_links.used_at` vérifié → "Paiement déjà effectué" (§4.2bis) |
| E7 | Coach supprime un client / client quitte un coach | Relation many-to-many : suppression de la ligne coach_clients, aucune donnée de séance du client affectée |
| E8 | User signale une story/un post 3 fois (agrégé, pas le même signaleur) | Auto-hide, review manuelle sous 48h (§18.10) |
| E9 | Le webhook de paiement est rejoué (retry réseau du prestataire) | Idempotence stricte (depositId unique, §4 BILLING_FLOW) — jamais de double activation |
| E10 | User change d'unité kg↔lbs après des mois d'usage | Reconversion d'affichage instantanée, AUCUNE donnée réécrite (stockage kg canonique intouché, §19.15) |
| E11 | Deux users se suivent mutuellement puis l'un se re-privatise | Le follow mutuel est rompu → rivalités (leaderboard/Conquête) désactivées entre eux immédiatement |
| E12 | Compte supprimé puis même email ré-utilisé pour un nouveau compte | Purge totale à J+30 (§20.3) doit être terminée avant que l'email soit ré-attribuable, sinon collision |
| E13 | User sans connexion ouvre l'app pour la première fois (jamais synced) | Le pack de 50 exercices embarqué doit suffire à démarrer une séance complète sans réseau (§19.5) |

---

## 4. CONSTRAINTS

### Stack (non négociable, décisions fermées — voir CLAUDE.md §18-20)
- React Native + Expo (Flutter écarté, §19.12) — WatermelonDB, NativeWind
  v4 (Tamagui/Unistyles/twrnc écartés), Supabase (Auth+Postgres+RLS),
  Node/Express + Prisma (backend), Render, PawaPay (Afrique), RevenueCat
  (IAP), Sentry, PostHog (dès beta), lucide-react-native.
- Outillage Claude Code fermé : Context7, Resend MCP, Maestro MCP,
  GitHub MCP, Supabase MCP, Expo MCP, CodeRabbit, EAS. Tout ajout →
  IDEAS_BACKLOG.md, jamais à chaud.

### Budget
- Solo dev, zéro levée de fonds. Coûts phasés 0→1k→10k users
  (Plan V16 §25) : gratuit en MVP, ~$25-100/mois à 1k users.
- Comptes développeur : $25 Google (one-time) + $99/an Apple (Phase iOS).

### Timeline
- MVP beta coachs : **S1-S12**, scénario optimiste vu la charge parallèle
  (MboaTV, études, soutenance) — ne jamais compresser S5-S7 (sync).
- Discover + polissage + soumission stores : S13-S16.
- Paiements : Phase 3, post-beta uniquement (jamais pendant S1-S12,
  §20.6 — règle absolue, aucune exception).

### Légal / conformité
- Architecture de paiement validée PAR ÉCRIT par Google Play (3 réponses
  archivées, BILLING_FLOW §9/9bis) — ne pas dévier sans nouvelle
  vérification écrite.
- RGPD (diaspora UE) : export JSON gratuit, mention Conquête dans la
  privacy policy.
- App Access (identifiants reviewers permanents) configuré avant la 1re
  soumission (§8bis BILLING_FLOW).
- Règle des 20 testeurs / 14 jours Google (compte développeur personnel
  récent) — à vérifier, calendrier S12→lancement à en tenir compte.

### Design
- Palette Braise (ember #C73E3A, acier #3A3F47) — verrouillée, mockup
  pixel-défini disponible (CLAUDE.md §19.16). Design universel — aucun
  marqueur régional (§19.8).

---

*Documents liés : PROJECT_BRIEF.md (vision) · PRICING.md + BILLING_FLOW.md
(monétisation) · CLAUDE_LYXO_V3.md (règles techniques complètes §16-20) ·
IMPLEMENTATION_PLAN.md (séquencement S1-S16) · LYXO_UI_PROMPT.md +
mockup Claude Design (référence visuelle).*
