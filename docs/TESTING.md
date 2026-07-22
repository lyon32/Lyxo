# TESTING.md — LYXO · Testing Strategy
# Version : 1.0 — fin Juillet 2026
# Rôle : où placer l'effort de test pour un solo dev — pas "tout tester",
# mais tester ce qui casse silencieusement et coûte cher. Aligné sur la
# DoD (CLAUDE_LYXO_V3 §19.6) : tests unitaires sur la logique critique,
# PAS d'E2E exhaustif.

---

## 0. PHILOSOPHIE — le budget de test d'un solo dev

Le risque n'est pas égal partout. Un bug visuel se voit et se corrige
vite ; un bug de sync ou de calcul de PR se voit tard (parfois jamais,
juste une perte de confiance silencieuse). **L'effort de test suit le
risque, pas la couverture pour la couverture.** Trois niveaux, budgets
différents :

```
UNIT           → logique métier pure, budget ÉLEVÉ (c'est là que ça casse)
INTEGRATION    → frontières entre modules (sync, API, DB), budget MOYEN
E2E            → parcours critiques bout en bout, budget FAIBLE et ciblé
                 (7 flows Maestro, §Bloc G IMPLEMENTATION_PLAN)
```

---

## 1. CE QUI A BESOIN DE QUOI

### 1.1 UNIT tests — obligatoires, sans exception

| Module | Pourquoi c'est critique | Cas à couvrir |
|---|---|---|
| `lib/pr-detection.ts` (+ service serveur miroir) | Un faux PR corrompt tout le système social (leaderboard, Conquête, Trace) | Poids plausible/implausible (limite exacte 4×), delta ±15% (pile sur la limite), < 3 vs ≥ 3 séances, combinaison de plusieurs raisons d'inéligibilité |
| `lib/sync/conflict-resolution.ts` | Bug ici = perte de données silencieuse, le pire scénario du projet | LWW simple, égalité de timestamp, suppression qui doit gagner sur une modif plus ancienne |
| `lib/units.ts` | Erreur de conversion = mauvaise donnée affichée à vie si mal stockée | kg→lbs arrondis, formats FR/EN, steppers par unité, jamais de dérive kg stocké |
| `lib/billing-region.ts` | Détermine tout le parcours de paiement d'un user | pays déclaré prioritaire, IP discordante loggée pas décisive, région invalide/inconnue |
| `services/pawapay.service.ts` (idempotence webhook) | Un double traitement = double facturation ou incohérence subscriptions | Callback rejoué, callback avec depositId inconnu, montant/devise incohérents |
| `middlewares/error-handler.middleware.ts` | Le format d'erreur DOIT être invariant (API_SPEC §2) | Chaque type d'AppError produit exactement la forme attendue |
| Config des limites freemium (90j, 5 exercices custom, 3 clients Découverte) | Un seuil mal appliqué = soit on brade Lyxo+, soit on frustre un gratuit | Pile à la limite, un de plus, un de moins |

**Cible de couverture** : ~90-100% sur ces modules précis — pas une
métrique globale de coverage sur tout le repo (une couverture globale de
80% avec ces modules à 40% serait un mauvais résultat déguisé en bon
chiffre).

### 1.2 INTEGRATION tests — aux frontières

| Frontière | Ce qu'on vérifie |
|---|---|
| `/v1/sync/pull` + `/v1/sync/push` (backend, DB de test réelle) | Un cycle complet create→push→pull sur un 2e "appareil" simulé retrouve les mêmes données ; pagination `has_more` correcte sur > 500 rows ; `deleted_at` bien propagé, jamais de DELETE physique |
| RLS Supabase (comptes privés) | Un user A ne peut PAS lire les données d'un user B privé non-follow ; peut après follow approuvé |
| Webhook PawaPay → activation subscription | Callback COMPLETE valide → subscription passe active ET is_premium dérivé répond true à l'appel suivant |
| Auth middleware | JWT valide → passe ; JWT expiré/forgé → 401 UNAUTHENTICATED, jamais un crash 500 |
| Coach invite → liaison | Code d'invitation valide → coach_clients créé ; limite 3 clients Découverte → 403 correct |

Ces tests tournent contre une **vraie base Supabase de test** (branche
dédiée, pas de mock de Postgres — RLS ne se teste pas avec un mock).

### 1.2bis Événements PostHog — funnel de la beta (branché Bloc G, jamais avant)
Liste FERMÉE des événements (tout ajout = décision écrite) — noms en
snake_case, taggés par environnement (ENV_SETUP §1.5), comptes
`is_reviewer` exclus :
| Événement | Déclencheur |
|---|---|
| `onboarding_language_selected` | Écran langue validé (pré-auth) |
| `onboarding_goal_selected` | Écran objectif validé (pré-auth) |
| `onboarding_split_selected` | Écran split validé (pré-auth) |
| `signup_completed` | Compte créé (profil inséré) — props : `method` ('email'\|'google'\|'apple') |
| `signup_failed` | Échec de création — props : `reason` ('network'\|'exists'\|'oauth_cancelled'\|'weak_password') |
| `onboarding_completed` | Arrivée sur l'Accueil |
| `first_workout_completed` | 1re séance terminée (le aha moment) |
| `workout_completed` | Chaque séance terminée (props : offline_logged bool) |
| `pr_celebrated` | Écran célébration PR affiché |
| `story_shared` | Story publiée (props : type carte/photo) |
| `invite_sent` | Lien coach ou partage WhatsApp émis |
| `follow_added` | Follow créé |
| `trial_started` | Trial déclenché manuellement (Phase 9) |
| `password_reset_requested` | Email de reset envoyé (écran 3quater étape 1) |
| `password_reset_completed` | Nouveau mot de passe enregistré (écran 3quater étape 3) |
Funnel de décision beta : signup → onboarding_completed →
first_workout_completed → J1/J7 retention (PostHog natif). Les chutes
entre goal/split/signup mesurent le coût du nouvel onboarding pré-auth.

### 1.3 E2E (Maestro) — 7 flows, la suite smoke du Bloc G

Déjà définis dans IMPLEMENTATION_PLAN.md Bloc G, rappelés ici comme
référence de stratégie :
1. Signup → onboarding complet (⚠️ inclut les écrans pré-auth objectif
   ET split — flow mis à jour avec l'onboarding IKEA, Juillet 2026)
2. Séance complète en mode avion → retour réseau → sync réussie
   (`setAirplaneMode`)
3. Célébration PR (déclenchement + affichage carte)
4. Follow → apparition dans le feed
5. Invitation coach → acceptation → liaison visible des deux côtés
6. Suppression de compte
7. Mot de passe oublié → email reçu (mock/inbox de test) → nouveau mot
   de passe → auto-login (audit doc passe 6, fiche 22 — chemin d'auth
   critique neuf, marge disponible sous le plafond de 10)

**Règle stricte** : au-delà de 10 flows E2E = scope creep (déjà noté
Bloc A1). Les E2E sont fragiles et coûteux à maintenir — chaque flow
ajouté doit remplacer une vérification manuelle répétitive, pas
dupliquer ce que les tests unitaires couvrent déjà.

### 1.4 CE QU'ON NE TESTE PAS (délibérément, pour un solo dev)
- Le rendu visuel pixel-perfect (snapshot testing) — trop fragile,
  change à chaque ajustement de design, faible valeur pour l'effort.
  Le mockup Claude Design + la revue humaine suffisent.
- Les composants UI purs sans logique (un `<Button>` qui ne fait
  qu'afficher un label et une couleur).
- La couverture exhaustive des écrans coach en V1 (feature moins
  critique que le logger/sync — si le temps manque, coupe ici avant de
  couper les tests sync).

---

## 2. COVERAGE EXPECTATIONS

Pas un pourcentage global unique — des attentes différenciées :

| Zone | Attente |
|---|---|
| `lib/` (logique métier pure) | ~90-100%, quasi sans exception |
| `services/` (backend, logique métier) | ~80-90% |
| `middlewares/` | 100% sur error-handler et auth (ce sont des contrats, pas de la logique métier variable) |
| `routes/` / `controllers/` | Couverts par les tests d'intégration, pas d'unit tests dédiés (fine couche de délégation) |
| Composants UI (`components/`) | Pas de cible chiffrée — tests ciblés seulement sur la logique conditionnelle complexe (ex. un composant qui affiche 5 états différents selon le statut de sync) |
| E2E | Couverture PAR FLOW CRITIQUE, pas par pourcentage (7 flows = 7 flows, point) |

**CI bloquante** : le build échoue si un test échoue, PAS s'il manque du
coverage sur une zone non listée ci-dessus comme critique. Pas de gate
de coverage globale arbitraire (ex. "80% ou le merge est bloqué") — ce
type de règle pousse à écrire des tests inutiles juste pour le chiffre.

---

## 3. TEST DATA / FIXTURES APPROACH

- **Unit tests** : fixtures inline ou dans un fichier `__fixtures__/`
  colocalisé, données minimales et explicites (pas de faker.js
  aléatoire pour les tests de logique métier — un test doit être
  déterministe et lisible : "un user de 70kg qui tente 300kg" doit être
  visible dans le test, pas généré au hasard).
- **Integration tests** : un script de seed dédié
  (`scripts/seed-test-db.ts`) qui peuple la branche Supabase de test
  avec un jeu de données représentatif : quelques profils (dont un privé,
  un coach, un reviewer `is_reviewer=true` exclu des stats), des
  workouts avec PRs à la limite des règles anti-triche, des follows
  mutuels et non-mutuels. Reseedé avant chaque run CI (base jetable,
  jamais un état qui s'accumule entre runs).
- **E2E (Maestro)** : comptes de test dédiés et stables (pas les comptes
  personnels du dev) — au moins un par `billing_region` pour couvrir les
  deux voies de paywall (utile aussi pour l'App Access de la review Play
  Store, §8bis BILLING_FLOW — même compte peut servir aux deux usages).
- **Aucune donnée de test ne doit fuiter en production** — le flag
  `is_reviewer`/comptes de test sont exclus des agrégats analytics
  (PostHog) et du leaderboard public dès leur création.

---

*Documents liés : CONVENTIONS.md (patterns de code testables) · LLD.md
(signatures des fonctions à tester) · API_SPEC.md (contrat d'erreur à
vérifier) · IMPLEMENTATION_PLAN.md (Maestro MCP, DoD, Bloc G).*
