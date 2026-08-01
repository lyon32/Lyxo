# SECURITY_NOTES.md — LYXO · Security & Edge Cases
# Version : 1.0 — fin Juillet 2026
# Rôle : qui peut faire quoi, ce qui doit être validé avant d'entrer dans
# le système, et les cas limites déjà identifiés avec leur traitement
# obligatoire. Ce document consolide des règles déjà écrites ailleurs
# (RLS, anti-fraude, anti-triche) sous l'angle sécurité pur — un agent
# qui code une route doit le vérifier avant de considérer une feature
# "terminée".

---

## 1. AUTH / AUTHORIZATION RULES — qui peut faire quoi

### 1.1 Matrice de rôles
| Rôle | Défini par | Peut |
|---|---|---|
| **User anonyme** (pas de JWT) | — | Rien, sauf : ouvrir `/v1/pay/:token` (auth par le token lui-même), déclencher un webhook signé (auth par signature prestataire) |
| **User authentifié** | JWT Supabase valide | Lire/écrire SES PROPRES données ; lire les données PUBLIQUES d'autres profils (non privés, ou privés + follow approuvé) |
| **Coach** (`is_coach=true`) | Attribut sur profiles, PAS un type de compte séparé (Q20) | Tout ce qu'un user authentifié peut, PLUS : créer des programmes, générer des invitations, voir les données des clients qui ont accepté son invitation |
| **Admin** (toi) | Header `X-Admin-Key` séparé, jamais un JWT user | Routes `/v1/admin/*` : correction manuelle de `billing_region`, review de signalements, actions de support — jamais utilisé par l'app mobile. ⚠️ AJOUT (audit technique 2026-07-25) : toute action de modification via ce rôle est tracée dans `admin_audit_log` (DATA_MODEL.md §2.24). ⚠️ CORRECTION : la traçabilité est un constat *a posteriori*, jamais un substitut à la rotation — une clé partagée non tournante reste valide indéfiniment après une fuite. Prérequis obligatoires avant l'activation de la première route `/v1/admin/*`, détaillés en API_SPEC.md §1 : vérification **fail-closed** (clé serveur absente → 503, jamais d'accès libre), comparaison à **temps constant** (`crypto.timingSafeEqual`), clé **versionnée et tournée** (90 jours, ou immédiatement sur suspicion ; deux versions acceptées pendant 24 h de recouvrement ; version journalisée dans `admin_audit_log.details`), et procédure d'incident (révoquer puis relire le journal sur toute la période d'exposition). La non-rotation indéfinie n'est PAS un état acceptable ; cible de sortie : autorisation par identité à jetons courts. |

### 1.2 Règles précises par ressource

- **profiles** : lecture publique si `is_private=false` ou (`is_private=true` ET follow mutuel/approuvé) ; écriture uniquement par le propriétaire, ET seulement sur les champs listés en API_SPEC §4.2 (`billing_region`, `trial_*`, `is_reviewer` sont **backend/admin only**, jamais modifiables par le client — RLS + validation applicative double verrou).
- **workouts/sets/personal_records** : lecture/écriture strictement par le propriétaire (`profile_id = auth.uid()`). Un coach voit les workouts de SES clients (via `coach_clients` avec `accepted_at` non-null) en LECTURE SEULE — jamais en écriture.
- **follows** : un user ne peut créer une ligne qu'avec `follower_id = auth.uid()` — impossible de faire suivre quelqu'un d'autre en son nom.
- **coach_clients** : création uniquement via le flux d'invitation (le `client_id` s'auto-attribue en acceptant un code, jamais en spécifiant directement l'ID d'un autre user).
- **subscriptions/payments/pay_links** (Phase 3) : lecture par le propriétaire uniquement ; ÉCRITURE exclusivement par le backend (webhooks, endpoints billing) — **aucune route n'autorise un client à modifier son propre statut premium**, sous aucune forme.
- **reports** : création par tout user authentifié ; lecture réservée à l'admin (pas d'API publique de consultation des signalements).
- **feature_flags** : lecture par tous (via payload de sync), écriture réservée à l'admin.

### 1.3 Row Level Security (RLS) — principe non négociable
**Toute table exposée au client a une policy RLS, même si l'API semble déjà filtrer.** La RLS est la dernière ligne de défense si un bug applicatif oublie un `WHERE profile_id = ...` — elle doit tenir MÊME si le code au-dessus a un bug. Aucune table sensible n'est créée sans sa policy dans la même migration.

---

## 2. INPUT VALIDATION REQUIREMENTS

### 2.1 Principe général
Toute donnée entrante (body, query, params) est validée **avant** d'atteindre la logique métier — jamais de validation "au milieu" du service. Utiliser un schéma de validation typé (zod ou équivalent) par route, aligné sur les types de DATA_MODEL.md.

### 2.2 Règles spécifiques par type de champ

| Champ | Validation |
|---|---|
| `weight_kg` | Numérique, > 0, < 500 (borne de sécurité — au-delà c'est une erreur de saisie, pas un vrai poids) |
| `reps` | Entier, > 0, < 1000 |
| `rpe` | Numérique, 1-10 inclus (jamais "100%" — déjà une règle produit, aussi une validation technique) |
| `phone_number` (checkout PawaPay) | Format MSISDN, validé AVANT l'appel PawaPay (évite un aller-retour API pour une erreur de saisie évidente) |
| `amount` (billing) | Entier FCFA, doit correspondre exactement à un des deux plans configurés (3500/15000) — **jamais un montant arbitraire envoyé par le client**, le backend recalcule le prix depuis sa propre config, ne fait jamais confiance à un montant reçu du client |
| `username` | Regex restrictive (alphanumérique + underscore, longueur bornée), unique, vérifié contre la liste de recommandations pseudo (§Q10) |
| `email` | Délégué à Supabase Auth (validation native) |
| `country` (onboarding) | Doit exister dans la liste ISO 3166-1 fermée, jamais une string libre |
| Tout ID référencé (`exercise_id`, `workout_id`, etc.) | Doit exister ET appartenir au bon propriétaire (pas juste "exister quelque part en base") — sinon `404` ou `403` selon le cas, jamais un succès silencieux sur une référence orpheline |
| `metadata` envoyé à PawaPay | Le `user_id` inclus est TOUJOURS celui de la session authentifiée du endpoint `/v1/billing/checkout` — jamais une valeur passée librement par le client dans le body (sinon un user pourrait débloquer le compte d'un autre) |

### 2.3 Sanitization
- Tout texte libre affiché à d'autres users (bio, nom de séance,
  commentaire futur V2) : échappé côté rendu (React Native ne fait pas
  d'injection HTML comme le web, mais reste disciplé pour la
  cohérence future si une webview apparaît un jour).
- Filtre de mots-clés sur les pseudos (recommandation, pas blocage dur —
  Q10) appliqué à la création ET à la modification du profil.

---

## 3. KNOWN EDGE CASES — sécurité spécifiquement (au-delà du PRD produit)

> Le PRD.md §3.5 liste les edge cases PRODUIT. Ceux ci-dessous sont
> l'angle SÉCURITÉ — attaques ou abus possibles, pas juste des bugs.

| # | Scénario | Traitement obligatoire |
|---|---|---|
| S1 | Un user modifie son app cliente pour envoyer `is_premium: true` ou un `billing_region` falsifié | Aucun effet : le statut premium est toujours dérivé côté serveur (§20.1), jamais lu depuis une valeur envoyée par le client. `billing_region` n'est modifiable par aucune route user-facing. |
| S2 | Un user rejoue un ancien JWT expiré, ou un JWT volé/copié | Vérification de signature + expiration à CHAQUE requête (pas de cache de "user déjà vérifié" côté backend). Un JWT expiré → 401 immédiat. |
| S3 | Un webhook PawaPay/RevenueCat est falsifié (faux payload envoyé par un tiers) | Vérification de signature (RFC-9421 PawaPay, Bearer secret RevenueCat) AVANT tout traitement — un payload qui échoue la vérif est rejeté silencieusement (log Sentry, pas de 200 qui laisserait deviner le format attendu à un attaquant). |
| S4 | Un user tente de lier son paiement au `user_id` d'un autre en modifiant le body de `/v1/billing/checkout` | Impossible par construction : le `user_id` inclus dans les metadata PawaPay vient de la session JWT du endpoint, jamais d'un champ du body (§2.2). |
| S5 | Un coach malveillant crée un programme "en vente" et disparaît après encaissement (V2 uniquement) | Délai de rétention 48-72h avant qu'un payout coach soit disponible au retrait (déjà prévu §18.9/§4.2bis) — le temps qu'un remboursement client soit possible. |
| S6 | Un script spamme `/v1/billing/checkout` avec le même token pour saturer PawaPay ou provoquer des frais | Rate limiting 5 tentatives/token/heure (API_SPEC §5). |
| S7 | Un user crée un PR délibérément faux (300kg à vide) pour polluer le leaderboard d'un ami | Anti-triche §18.1 : exclu du social si > 4× poids de corps ou delta > +15% — reste dans ses stats perso (pas de "punition", juste une exclusion de la visibilité sociale). |
| S8 | Un user tente d'accéder aux workouts d'un profil privé sans follow approuvé, via un appel API direct (pas l'UI) | RLS bloque au niveau base, indépendamment de ce que l'API "oublie" de filtrer — double verrou (§1.3). |
| S9 | Un lien d'invitation coach (`lyxo.app/invite/{code}`) est deviné/bruteforcé | Code suffisamment long/aléatoire (pas un compteur séquentiel) pour rendre le bruteforce impraticable ; limite de rate sur l'endpoint d'acceptation. |
| S10 | Un utilisateur supprime son compte puis revient sur l'app avant la purge à J+30 | Le compte reste dans un état "désactivé réversible" — reconnecter réactive, la purge définitive n'a lieu qu'à l'échéance (§18.5/§20.3). |
| S11 | Une story avec photo contient du contenu problématique | NSFW-check automatique à l'upload (§19.3) + auto-hide à 3 signalements + review manuelle (toi) sous 48h. Aucune photo ne s'affiche publiquement avant ce filtre initial. |
| S12 | Un compte de test/reviewer (`is_reviewer=true`) pollue les statistiques publiques ou le leaderboard | Exclusion systématique des agrégats analytics ET du leaderboard/Discover dès la création du flag (vérifié dans les mêmes requêtes que le filtre `deleted_at is null`). ⚠️ **Gap trouvé le 2026-07-31 (ROADMAP 3.6, pas encore corrigé)** : la policy `personal_records_select_public` (migration 2.10) filtre `deleted_at is null` et `is_social_eligible = true` mais PAS `is_reviewer` — un compte reviewer avec des PR socialement éligibles apparaîtrait dans le leaderboard. À corriger en Phase 5 avec le volet `follows` (la policy sera de toute façon réécrite pour le follow mutuel) — ne pas l'oublier à cette occasion. |
| S13 | Un script tente un brute-force sur `/auth/login` (mot de passe deviné par essais répétés) | **Pas de couche anti-brute-force additionnelle côté backend pour le MVP** — on s'appuie sur le rate limiting natif de Supabase Auth, qui protège par défaut les endpoints sign-in/sign-up/OTP par IP et par identifiant (configurable dans Dashboard > Authentication > Rate Limits ; valeurs par défaut Supabase de l'ordre de quelques dizaines de tentatives/heure selon l'endpoint — à vérifier dans le dashboard du projet, non modifiées pour le MVP). Réévaluer une couche applicative dédiée (ex. verrouillage progressif, CAPTCHA) uniquement si un abus réel est observé en beta (Sentry/logs), pas en anticipation. |
| S14 (AJOUTÉ, audit technique 2026-07-25) | Un appareil du parc cible a une horloge locale dérivée/désynchronisée (fréquent sur Android d'occasion sans NTP fiable) — son `updated_at` de sync (généré client, WatermelonDB) peut se retrouver dans le futur ou fortement décalé | Le LWW ne doit jamais faire confiance aveuglément à `updated_at` client : clamp contre `server_timestamp` avant résolution de conflit si l'écart dépasse un seuil de tolérance (ex. 5 min), avec log `pino.warn` non bloquant — détail complet LLD.md §3.2. ⚠️ Le `server_timestamp` de référence est généré **à l'entrée de la requête côté serveur** (ou par la base) et n'est JAMAIS lu dans le payload client : un horodatage fourni par le client ne peut pas servir à contrôler un autre horodatage fourni par le même client — l'écart mesuré serait toujours nul et le garde-fou purement décoratif. Sans ce garde-fou, un téléphone mal réglé peut écraser silencieusement une donnée plus récente sur un autre appareil (multi-device Lyxo+), contraire au critère de succès n°1 du produit. |
| S15 (AJOUTÉ, audit technique 2026-07-25) | Une photo NSFW passe le filtre automatique (`nsfwjs`, §19.3) — classifieur open-source avec un taux de faux négatifs connu, en particulier sur du contenu ambigu | Le filet de rattrapage humain (auto-hide à 3 signalements + review sous 48h, S11) reste la vraie ligne de défense — `nsfwjs` seul n'est PAS une garantie de conformité store. Acceptable à l'échelle beta (10 coachs) ; budgétiser une bascule vers une API de modération dédiée (Google Cloud Vision SafeSearch, AWS Rekognition) dès que le volume dépasse ce qu'une review manuelle à 48h peut absorber sereinement — ne pas attendre un incident de contenu pour ré-évaluer. |

---

## 3bis. STOCKAGE DEVICE & SÉCURITÉ LOCALE (ajout audit deep-tech, Juillet 2026)

### 3bis.1 Session Supabase (JWT/refresh token) : SecureStore OBLIGATOIRE
Le client `@supabase/supabase-js` persiste la session dans le storage
qu'on lui fournit — par défaut AsyncStorage, lisible EN CLAIR sur un
appareil rooté ou via backup ADB (OWASP M9). Sur le parc cible (Android
bas de gamme, parfois rooté d'occasion), c'est inacceptable.
RÈGLE : la session Supabase est TOUJOURS stockée via `expo-secure-store`
(Keystore Android / Keychain iOS sous le capot) :
```ts
// lib/supabase.ts — adaptateur de storage OBLIGATOIRE
import * as SecureStore from 'expo-secure-store';
export const supabase = createClient(url, anonKey, {
  auth: {
    storage: {
      getItem: (k) => SecureStore.getItemAsync(k),
      setItem: (k, v) => SecureStore.setItemAsync(k, v),
      removeItem: (k) => SecureStore.deleteItemAsync(k),
    },
    autoRefreshToken: true,
    persistSession: true,
  },
});
```
- ⚠️ SecureStore plafonne à ~2 Ko/valeur sur certains devices — le JWT
  Supabase passe, mais TESTER sur le device bas de gamme de la DoD.
- AsyncStorage reste autorisé UNIQUEMENT pour les données non sensibles
  (choix de langue, `onboarding_offline_shown`, préférences UI).
- JAMAIS un token, un mot de passe ou une clé dans AsyncStorage/MMKV.

### 3bis.2 Re-authentification avant actions destructives
Toute action irréversible ou sensible au vol d'appareil déverrouillé
exige une re-confirmation forte AVANT l'appel API :
- Suppression de compte (`DELETE /v1/profiles/me`) : re-saisie du mot de
  passe (ou re-auth OAuth), OU `expo-local-authentication` (biométrie)
  avec fallback mot de passe.
- Changement d'email : même règle.
La biométrie généralisée (verrouillage de l'app) est HORS SCOPE V1 —
décision explicite : données peu sensibles, friction inutile.

### 3bis.3 SSL Pinning : PAS en V1 — décision explicite, pas un oubli
Rapport risque/rupture défavorable : un certificat épinglé qui tourne
mal = app entièrement morte jusqu'à un nouveau build store, catastrophique
pour un parc offline-first à mise à jour lente. Les décisions sensibles
(montants, statut premium, user_id cible) sont déjà TOUTES revérifiées
côté serveur (§2.2, §4) et le transport reste TLS standard. Réévaluer
uniquement si LYXO manipule un jour des données de santé réglementées.

### 3bis.4 Hardening Android
- R8/ProGuard activé en release (`minifyEnabled` + `shrinkResources`,
  CLAUDE.md §17.4) — le `mapping.txt` de CHAQUE build est uploadé vers
  Sentry (CICD §3.3bis), sinon les crashes natifs sont illisibles.
- Aucune clé secrète dans le bundle : seules les clés `EXPO_PUBLIC_*`
  (publiques par nature, ENV_SETUP §1.1) sont embarquées. L'obfuscation
  n'est JAMAIS considérée comme une protection d'un secret.

---

### 3bis.5 Stockage `physique_photos` — bucket privé, URL signée courte (AJOUTÉ, audit technique 2026-07-25)
Donnée la plus sensible du schéma (photos corporelles, toujours privées,
DATA_MODEL.md §2.23) : bucket Supabase Storage privé (pas de lecture
anonyme même en devinant le chemin), `photo_url` en base = chemin objet
uniquement, URL signée générée à la demande avec TTL court (5-15 min) à
chaque lecture — jamais d'URL permanente ni de cache CDN public sur ce
bucket. ⚠️ CORRECTION : le bucket privé protège le stockage, pas l'accès —
c'est la **signature** qui accorde le droit de lire. Interdiction absolue
de signer un chemin fourni par le client : l'API deviendrait un oracle
(chemin d'autrui en entrée → URL valide en sortie) et le caractère privé
du bucket ne servirait plus à rien. À CHAQUE lecture, sans exception :
partir d'un `physique_photos.id`, charger la ligne, vérifier
`profile_id = auth.uid()` ET `deleted_at is null`, puis ne signer que le
chemin lu dans cette ligne — plus revérifier que le segment `{profile_id}`
du chemin (`physique/{profile_id}/{photo_id}.{ext}`) égale `auth.uid()`,
rejet dur sinon. Aucun cas légitime de signature pour autrui n'existe en
V1 (pas de partage sur cette galerie). Détail complet : DATA_MODEL.md
§2.23.

## 3ter. RGPD — BASE LÉGALE ANALYTICS (fiche 10 comité, ajout)
- **Base légale PostHog (EU)** : intérêt légitime (analytics produit
  first-party, agrégé, jamais revendu à des tiers) — pas de consentement
  cookie-style requis pour du tracking produit interne, MAIS mention
  explicite obligatoire dans `lyxo.app/privacy` (section dédiée :
  quelles données, pourquoi, durée de rétention, droit d'opposition).
- **Opt-out utilisateur** : "Partage de statistiques d'usage" dans
  Paramètres (LYXO_UI_PROMPT écran 15) — désactive l'envoi d'events
  PostHog côté client, `is_reviewer` reste exclu par défaut (§18.3).
- **Google Play Data Safety** : formulaire à compléter avant la 1re
  soumission (CICD/ROADMAP 7.1) — déclarer : données de fitness
  (workouts/PRs), identifiants (email, pseudo), analytics (PostHog EU),
  paiement (Phase 9). Case "chiffré en transit" cochée (TLS standard).

## 4. PRINCIPES TRANSVERSAUX

- **Jamais de confiance dans une donnée envoyée par le client** pour
  une décision sensible (montant, statut premium, user_id cible d'un
  paiement, région de facturation) — toujours recalculé/vérifié côté
  serveur.
- **Defense in depth** : RLS ET validation applicative, pas l'un à la
  place de l'autre.
- **Échec fermé, pas ouvert** : en cas de doute (signature webhook
  douteuse, JWT ambigu, permission incertaine), refuser par défaut —
  jamais "on verra, on autorise et on corrige après".
- **Aucun détail d'implémentation dans les erreurs client** : un 500
  ne renvoie jamais de stack trace ni de détail de requête SQL — le
  détail va dans Sentry, le client reçoit `INTERNAL_ERROR` générique
  (API_SPEC §2/§3).

---

*Documents liés : DATA_MODEL.md (RLS par table) · API_SPEC.md (format
d'erreur, codes) · BILLING_FLOW.md §4.2bis (anti-fraude paiement) ·
CLAUDE_LYXO_V3.md §18.1 (anti-triche PR) · PRD.md §3.5 (edge cases
produit, complémentaires à ceux-ci).*
