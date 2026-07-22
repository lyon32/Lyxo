# BILLING_FLOW.md — LYXO · Système de Paiement à Deux Voies
# Version : 1.0 — Juillet 2026
# Rôle : spécification technique du flux de facturation Lyxo+.
# Complète PRICING.md (les prix) — ce fichier décrit le COMMENT technique.
# Scope V1 : abonnement Lyxo+ uniquement. Marketplace coach = V2 (voir §7).
# ⚠️ VOCABULAIRE DES PHASES (audit doc) : toute mention "Phase 3" dans les
# docs billing = Phase PRODUIT 3 (monétisation, post-beta) = Phase 9 de
# ROADMAP.md. À ne JAMAIS confondre avec la Phase 3 de ROADMAP.md (= SYNC).
# Rien de ce fichier ne se code avant ROADMAP Phase 9 (§20.6 CLAUDE.md).

---

## 1. PRINCIPE — Deux voies selon la localisation

| Voie | Users | Mécanisme | Prestataire |
|---|---|---|---|
| **A. Afrique (CEMAC/Cameroun)** | Détectés à l'inscription | ZÉRO bouton de paiement in-app. Texte informatif + email avec lien personnalisé → paiement web Mobile Money | PawaPay |
| **B. Reste du monde** | Tous les autres | IAP standard Google Play Billing / Apple StoreKit | RevenueCat |

Conformité : la voie A ne contient AUCUN lien ni bouton de paiement dans
l'app Android — uniquement un texte informatif. Le lien de paiement voyage
par email, entièrement hors app. iOS : IAP uniquement, les deux voies
n'existent pas (pas de texte informatif non plus sur iOS — Apple interdit
même l'allusion à un paiement externe).

---

## 2. DÉTECTION DE LA VOIE — à l'inscription, stockée, jamais recalculée en douce

Décision interview (Q1c) : AUCUN numéro de téléphone à l'inscription.
Ordre de priorité :
1. **Pays déclaré** dans l'onboarding (liste config/billing-regions.ts).
2. **IP de la première session** en confirmation (jamais seule décisive
   contre le pays déclaré — VPN fréquents ; en cas de conflit, le pays
   déclaré gagne et l'écart est loggé pour revue).
Le téléphone n'apparaît qu'au paiement web (le prompt MoMo l'exige) —
il met alors à jour profiles.phone mais ne recalcule PAS billing_region.

Résultat stocké : `profiles.billing_region` = `'africa_momo'` | `'intl_iap'`.
- Immutable côté client. Modifiable uniquement par un endpoint admin
  (cas support : diaspora inscrite avec un numéro camerounais, etc.).
- RÈGLE : le client (app) LIT billing_region pour savoir quel écran
  afficher, mais ne participe JAMAIS à la décision.

---

## 3. SCHÉMA DE BASE DE DONNÉES

```sql
-- Ajouts sur la table existante profiles
alter table profiles add column billing_region text not null default 'intl_iap'
  check (billing_region in ('africa_momo','intl_iap'));
alter table profiles add column trial_expires_at timestamptz;  -- déjà prévu (PRICING.md §2)
alter table profiles add column trial_used boolean not null default false;

-- Source de vérité de l'accès premium (les deux voies convergent ici)
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  source text not null check (source in ('pawapay','revenuecat')),
  plan text not null check (plan in ('monthly','annual')),
  status text not null check (status in
    ('pending','provisional_access','active','expired','failed','refunded','canceled')),
  current_period_start timestamptz,
  current_period_end timestamptz,          -- fin d'accès. NULL = indéterminé
  external_ref text,                        -- pawapay depositId OU revenuecat app_user_id
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz                    -- règle 18.3 soft-delete
);
create unique index one_active_sub on subscriptions(user_id)
  where status in ('active','provisional_access') and deleted_at is null;

-- Journal des paiements PawaPay (voie A uniquement ; RevenueCat garde son propre ledger)
create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  subscription_id uuid references subscriptions(id),
  provider text not null default 'pawapay',
  amount integer not null,                  -- en FCFA entiers
  currency text not null default 'XAF',
  status text not null check (status in ('pending','complete','failed','refunded')),
  deposit_id uuid unique,                   -- notre UUIDv4 (idempotence PawaPay native)
  pay_token text,                           -- le token du lien email (traçabilité)
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Tokens de lien de paiement (email)
create table pay_links (
  token text primary key,                   -- généré crypto-random, 32+ chars
  user_id uuid not null references profiles(id),
  plan text not null check (plan in ('monthly','annual')),
  expires_at timestamptz not null,          -- 7 jours
  used_at timestamptz,
  created_at timestamptz not null default now()
);
```

**Règle d'or : `is_premium` n'est jamais une colonne écrite à la main** —
c'est une fonction dérivée : `exists(subscription active|provisional_access
where current_period_end > now())` OU `trial_expires_at > now()`. Exposée
au client via le payload de sync. Une seule source de vérité, deux
alimenteurs (webhook PawaPay / webhook RevenueCat).

---

## 4. VOIE A — FLUX AFRIQUE (PawaPay) pas à pas

### 4.0 Déclenchement du trial (rappel)
Le trial est MANUEL (PRICING.md §2) : bouton "Essayer Lyxo+ 14 jours"
au contact d'une feature premium → set trial_expires_at = now()+14j,
trial_used = true. Aucun paiement demandé, aucune donnée bancaire.

### 4.1 Fin de trial (J14) — côté app
⚠️ CONFORMITÉ CONFIRMÉE PAR ÉCRIT par Google Play Support (Juillet 2026,
citée intégralement en annexe §9) : ce flux est conforme SI l'app reste
"consumption-only" pour ces users — càd information de statut de compte
uniquement, JAMAIS un lien ou un texte qui pointe vers où/comment payer.
L'invitation à payer (lien, marque, CTA) doit vivre EXCLUSIVEMENT dans
l'email — jamais dans l'app, pas même sous forme de texte ("rends-toi
sur lyxo.app" est TROP — à corriger dans le prompt UI, voir 19.8).

- L'app détecte `trial_expires_at < now()` ET `billing_region = 'africa_momo'`.
- Affiche l'écran informatif (AUCUN bouton/lien/mention de paiement) :
  > **Ton essai Lyxo+ est terminé.**
  > Ton compte repasse en version gratuite — tes données sont intactes.
  > Consulte l'email que nous venons de t'envoyer pour les prochaines
  > étapes.
- Le bouton unique de l'écran : "Continuer en version gratuite".
- Le nom du site (lyxo.app), le mot "payer/abonnement/activer", et toute
  URL sont BANNIS de cet écran — réservés à l'email uniquement.

### 4.2 Email automatique — côté backend
Déclencheurs : J12 du trial (rappel avant fin), J14 (fin), J21 (relance douce).
1. Backend génère `pay_links.token` (crypto-random, expire 7 jours).
2. Envoi via service transactionnel (Resend / SendGrid / Mailgun — choisir
   au setup, Resend recommandé pour la simplicité + free tier).
3. Lien : `https://lyxo.app/pay?token={token}` — le token SUFFIT
   (jamais d'uid en clair dans l'URL ; le token résout l'user côté serveur).

Texte email (J14) :
> Objet : Ton Pass Lyxo+ t'attend
> Salut {prenom}, ton essai de 14 jours est terminé. Pour garder
> [historique illimité, progression automatique, programmes de coachs] :
> **[Activer mon Pass Annuel — 15 000 FCFA/an]** (bouton, lien tokenisé)
> Ou le Pass Mensuel à 3 500 FCFA/mois.
> Paiement MTN MoMo / Orange Money via PawaPay. Reçu par SMS.
> Sans engagement. — L'équipe LYXO

### 4.2bis Mécanisme anti-fraude — principe et garde-fous (gravé)
Le lien envoyé par email n'est PAS un lien de paiement générique : il
encode le `user_id` cible dans les métadonnées transmises à PawaPay
(`metadata: { user_id }`). Ce user_id revient intact dans le webhook de
confirmation — c'est LUI, et seulement lui, qui reçoit `is_premium`.
Conséquence importante : **même si le lien est transféré à un tiers et
payé par quelqu'un d'autre, c'est TOUJOURS le compte original
(user_id encodé) qui se débloque, jamais celui du payeur.** Il n'y a
donc pas de vecteur de fraude par transfert de lien — au pire un ami
paie généreusement pour le compte de l'autre, ce qui n'est pas un abus.

Garde-fous à implémenter (obligatoires, pas automatiques par défaut) :
1. **Marquer `pay_links.used_at` dès la confirmation webhook** — sans
   ça, revenir sur `/pay?token=xxx` après paiement réussi permettrait de
   relancer un second checkout avec le même token. Vérification
   systématique à l'entrée sur la page : `used_at IS NOT NULL` →
   afficher "Paiement déjà effectué. Ton compte est déjà à jour Lyxo+."
   au lieu de reproposer un plan.
2. **Un seul token actif à la fois par user** — générer un nouveau token
   invalide silencieusement le précédent (`UPDATE pay_links SET
   expires_at = now() WHERE user_id = X AND used_at IS NULL`), pour
   qu'un vieil email retrouvé dans une boîte de réception ne mène jamais
   à un token à la fois valide ET obsolète.
3. **Ne jamais faire confiance au webhook seul** — toujours re-GET le
   statut du paiement via l'API PawaPay avant d'activer (déjà en §4.4,
   règle non négociable, protège contre un faux webhook rejoué/forgé).
4. **Le sync (WatermelonDB) fait foi, pas l'app locale** — un utilisateur
   qui modifierait son app pour forcer `is_premium: true` en local se
   verra corrigé au prochain pull de sync, puisque le backend est la
   seule source de vérité et que le client ne peut jamais écrire ce
   champ lui-même (RLS : colonne en lecture seule côté client).
5. **Rate limiting sur `/billing/checkout`** — un même token ne peut
   déclencher qu'un nombre limité de tentatives de paiement (ex. 5) sur
   une fenêtre courte, pour freiner un script qui spammerait l'endpoint.

### 4.3 Page web lyxo.app/pay — côté web
RÈGLE UI (décision Juil. 2026) : les marqueurs de paiement (logos MTN
MoMo / Orange Money, mention PawaPay, "Reçu par SMS") vivent UNIQUEMENT
sur cette page web — JAMAIS dans l'app. Le paywall in-app est purement
informatif (bénéfices, prix, trial — et RIEN d'autre : ni URL, ni nom de
site, ni verbe payer/activer/s'abonner, conformément à §4.1 ; la mention
"rends-toi sur lyxo.app" est INTERDITE in-app).
1. Valide le token (existe, non expiré, non utilisé) → affiche
   l'utilisateur reconnu ("Compte : @{pseudo}") + choix Mensuel/Annuel.
2. Au clic : backend crée `payments(status='pending')` +
   `subscriptions(status='pending')`, génère un **depositId UUIDv4**
   (stocké AVANT l'appel — règle PawaPay), puis appelle
   `POST /v2/deposits` avec :
   - `depositId` (notre UUID — idempotence native : un rejeu du même
     depositId renvoie DUPLICATE_IGNORED, jamais un double paiement)
   - `payer: { type: "MMO", accountDetails: { phoneNumber, provider } }`
     — phoneNumber au format MSISDN (indicatif pays, sans +, sans zéro
     initial) ; provider prédit via l'endpoint `predict-provider` à
     partir du numéro saisi (ex. MTN_MOMO_CMR / ORANGE_CMR)
   - `amount` en STRING ("3500" / "15000"), `currency: "XAF"`
   - `clientReferenceId: payment.id` (réconciliation)
   - `customerMessage: "LYXO Pass Annuel"` (4-22 chars alphanum,
     visible dans le SMS/l'historique du client — confiance MoMo)
   - `metadata: [{ userId: <user_id supabase>, isPII: true },
     { plan: "annual" }]` — LE mécanisme anti-fraude (§4.2bis) : le
     user_id voyage dans le paiement et revient intact dans le callback.
3. Réponse à vérifier : `ACCEPTED` (prompt MoMo envoyé au téléphone,
   l'user confirme avec son code PIN) · `REJECTED` (afficher le
   failureReason proprement : INVALID_PHONE_NUMBER, AMOUNT_OUT_OF_BOUNDS,
   PROVIDER_TEMPORARILY_UNAVAILABLE…) · `DUPLICATE_IGNORED` (déjà
   soumis — ne rien recréer).

### 4.3bis RÉSILIENCE RÉSEAU DU CHECKOUT (ajout audit deep-tech) — le cas
NOMINAL du terrain : l'user clique "Payer" en 3G, la réponse HTTP ne
revient jamais, il re-clique. Sans garde : 2 checkouts = 2 depositId
légitimes = 2 prompts MoMo = double débit possible. Le rate limiting
(5/h) ne protège PAS contre 2 clics à 10 s d'écart. Règles obligatoires :
1. **Verrou serveur "un seul pending par token"** : un second
   `POST /v1/billing/checkout` sur le même token alors qu'un payment
   `pending` non expiré (< 5 min) existe → répondre 200 avec LE paiement
   en cours (no-op, pattern DUPLICATE_REQUEST API_SPEC §2) — JAMAIS créer
   un second deposit.
2. **UI de la page web** : dès le clic, bouton verrouillé + passage
   immédiat en mode polling `GET /v1/pay/:token/status` (le payment.id
   est créé côté serveur AVANT l'appel PawaPay, donc le statut est
   interrogeable même si la réponse du POST s'est perdue). États affichés :
   "Vérifie ton téléphone — prompt envoyé" → COMPLETED/FAILED.
3. **TTL sur pending** : cron → `pending` de plus de 30 min sans callback
   ni Check-Status positif → `failed` (failure_reason='timeout_30m').
   L'user peut alors relancer proprement.
4. **Test Playwright dédié** (suite /pay, IMPLEMENTATION_PLAN Phase 3
   outillage) : "réseau coupé juste après le clic Payer → re-clic →
   un SEUL deposit créé" — obligatoire avant la mise en prod billing.
   Alternative V1 encore plus simple à évaluer à l'implémentation :
   la **Payment Page hébergée PawaPay** (produit "payment-page" de
   l'API) — page de paiement gérée par PawaPay, mêmes depositId/metadata,
   zéro UI de paiement à construire. À trancher au Bloc billing selon
   l'UX voulue.

### 4.4 Confirmation — webhook + accès provisoire
1. Callback PawaPay (URL "Deposits" configurée dans le Dashboard —
   ⚠️ prérequis : les callback URLs doivent être configurées AVANT de
   pouvoir générer le token API, cf. écran Dashboard) → statut final
   `COMPLETED` ou `FAILED`. Activer les **signed callbacks** (RFC-9421)
   dans le Dashboard et vérifier la signature.
2. **Re-vérifier par `GET /v2/deposits/{depositId}` (Check Deposit
   Status)** avant toute activation — ne jamais se fier au callback
   seul. Ce même endpoint sert de polling de secours si le callback
   tarde (> 60s → provisional_access, cf. point 4).
2bis. Idempotence : `depositId` unique en base — un callback rejoué ne
   crée jamais deux abonnements (contrainte DB + statut déjà `complete`
   = no-op).
3. `payments.status='complete'` → `subscriptions.status='active'`,
   `current_period_end = now() + 1 mois|12 mois`.
4. **Filet de sécurité `provisional_access`** (règle existante V14) :
   si l'user a confirmé sur son téléphone mais que le webhook tarde
   (> 60s), le polling de la page web accorde `provisional_access`
   24h en attendant la confirmation définitive.
5. Push + email de confirmation : "Ton Pass Lyxo+ est actif ✓" — la
   réception du push déclenche un /sync EXPLICITE côté app (règle
   CLAUDE.md §20.4 : sans ça, un user offline croit son paiement perdu).

### 4.5 Déblocage dans l'app
Au prochain pull de sync WatermelonDB, le payload inclut
`is_premium: true` (champ CALCULÉ du payload de sync, pas une colonne — §20.1) + `premium_until` → l'app débloque les features
Lyxo+ sans réinstallation ni relogin. Prévoir aussi un bouton
"Actualiser mon statut" sur l'écran Profil (force un sync) pour
l'impatient qui vient de payer.

### 4.4ter Setup Dashboard PawaPay (prérequis techniques, ordre réel)
1. **Callback URLs d'abord** (Dashboard → API Tokens → Callback URLs) —
   obligatoire AVANT la génération du token API :
   - Deposits  → https://api.lyxo.app/v1/webhooks/pawapay/deposits
   - Refunds   → https://api.lyxo.app/v1/webhooks/pawapay/refunds
   - Checkouts → (si Payment Page retenue) https://api.lyxo.app/v1/webhooks/pawapay/checkouts
   ⚠️ Préfixe /v1/ OBLIGATOIRE (API_SPEC §0) — une URL Dashboard sans /v1/
   = webhooks en 404 silencieux = paiements non crédités.
2. Générer le token API **Sandbox** (api.sandbox.pawapay.io) — tout le
   développement Phase 3 se fait en sandbox, avec les numéros de test
   PawaPay, avant tout token production.
3. Activer "signed callbacks" (et éventuellement "only accept signed
   requests") dans API Security.
4. Vérifier la config compte via `GET active-configuration` : providers
   Cameroun actifs (MTN_MOMO_CMR, ORANGE_CMR), limites de montants XAF,
   support des décimales.
5. Payouts (V2 marketplace) : vérifier que "Payouts" est activé sur le
   compte (sinon PAYOUTS_NOT_ALLOWED) — même écosystème, API /v2/payouts.

### 4.5bis Structure Play Console (référence exacte, voie B)
```
Subscription "lyxo_plus"
├── Base plan "monthly" (auto-renewing)
│   └── Offer "trial-new-users" — éligibilité "New customer acquisition"
│       Phase 1: Free trial, 14 jours → puis prix du base plan
└── Base plan "annual" (auto-renewing)
    └── Offer "trial-new-users" — même règle
```
Setup Play Console, ordre officiel (support.google.com/googleplay,
réponse confirmée) :
1. Payments profile (Paramètres → Profil de paiements) — ⚠️ vérifier
   éligibilité Cameroun ET compte bancaire de virement AVANT tout.
2. Billing Library intégrée (RevenueCat) + permission
   `com.android.vending.BILLING` déclarée dans le manifest Android
   (normalement automatique via le plugin Expo RevenueCat — à vérifier
   explicitement à l'intégration, pas au premier rejet de build).
3. Produits créés : Monetize with Play → Products → Subscriptions.
4. Au moins 1 base plan par abonnement, ACTIVÉ (statut Draft → Active).
5. License testing (Paramètres → testeurs autorisés, achats gratuits).
6. .aab signé uploadé sur Internal Testing + testeurs ajoutés à la
   liste email du track.
⚠️ ORDRE RÉEL (2e réponse Google Support, corrige la 1re) : pour une app
NEUVE, la création d'abonnements ne se débloque qu'APRÈS l'upload d'un
build contenant la permission `com.android.vending.BILLING` (fournie par
l'intégration RevenueCat). Séquence pratique : Payments profile →
intégration RevenueCat → .aab sur Internal Testing → ALORS créer les
abonnements → base plans actifs → license testing. Et le test réel des
achats exige : app ET produits publiés sur un track ET abonnement au
statut "Active" — aucun raccourci en local/émulateur.
Références Google : answer/140504 (créer/gérer les abonnements) et
answer/12154973 (concepts base plans/offers, déjà intégré §4.5bis).

### 4.6 Renouvellement (pas d'auto-renew en Mobile Money)
Le MoMo ne se débite pas tout seul — le "renouvellement" est un
nouveau paiement volontaire :
- J-7 avant `current_period_end` : email + push "Ton Pass expire le
  {date}" avec nouveau lien tokenisé.
- J0 : expiration → `status='expired'`, retour au tier gratuit
  (données intactes, règle des 90 jours s'applique).
- J+3 : dernière relance douce. Puis silence (pas de harcèlement).

---

## 5. VOIE B — FLUX INTERNATIONAL (RevenueCat)

Flux 100% standard, rien d'exotique :
1. `billing_region='intl_iap'` → le paywall in-app affiche les produits
   RevenueCat (Google Play Billing / StoreKit), trial 14 jours natif.
2. Achat → RevenueCat valide le reçu → webhook RevenueCat vers le
   backend → upsert `subscriptions(source='revenuecat',
   status='active', external_ref=app_user_id)`.
3. `app_user_id` RevenueCat = le `user_id` Supabase (à configurer au
   login SDK) — c'est ce qui lie les deux mondes.
4. Renouvellements/annulations/refunds : gérés par les webhooks
   RevenueCat (RENEWAL, CANCELLATION, EXPIRATION) → mise à jour de
   `current_period_end` / `status`.
5. L'app peut lire l'entitlement RevenueCat localement (SDK) pour un
   déblocage instantané, mais le backend reste la source de vérité
   (le sync fait foi en cas de divergence).
6. **Bouton "Restaurer les achats" OBLIGATOIRE sur le paywall IAP**
   (exigence de validation Apple ; indispensable en cas de
   réinstallation ou changement d'appareil) — Purchases.restorePurchases()
   → re-sync de l'entitlement → mise à jour subscriptions.
7. **Bouton/lien "Annuler mon abonnement" OBLIGATOIRE** (politique Google
   Subscriptions — méthode d'annulation en libre-service) : lien vers le
   Subscription Center Google Play (voie B) ou accès direct au parcours
   d'annulation lyxo.app (voie A). À placer dans Paramètres, visible sans
   contacter le support.
8. **États de renouvellement raté à écouter (webhooks RevenueCat)** :
   `GRACE_PERIOD` (paiement échoué, Google retente, l'user garde l'accès
   — afficher "Ton paiement a échoué, mets à jour ta carte") puis
   `ON_HOLD` (accès coupé, abonnement récupérable) avant expiration
   définitive. Géré automatiquement par Google/RevenueCat ; LYXO doit
   juste refléter ces trois états dans subscriptions.status et informer
   l'user — ne pas les traiter comme une simple expiration.
9. **Protection anti-contournement du trial : native, gratuite.** Google
   ("Play protection for offers") détecte les tentatives de réinstallation
   pour re-profiter d'un trial et bloque automatiquement l'utilisateur non
   éligible sur le base plan sans offre. Rien à coder côté LYXO pour la
   voie B ; pour la voie A (PawaPay), c'est `trial_used` qui joue ce rôle
   (déjà en place).

---

## 6. ENDPOINTS API À IMPLÉMENTER (backend Node/Express)

| Endpoint | Rôle | Auth |
|---|---|---|
| `POST /v1/billing/pay-link` | Génère token + envoie l'email (appelé par cron trial J12/J14/J21 et par le bouton "Renvoyer l'email" du Profil) | interne/user |
| `GET /v1/pay/:token` (web) | Page de paiement — valide token, affiche plans (token en PATH — forme unique, API_SPEC §4.5 ; le lien email `lyxo.app/pay?token=` est réécrit vers cette route par le site web) | token |
| `POST /v1/billing/checkout` | Crée payment+subscription pending, init PawaPay, renvoie authorization_url | token |
| `POST /v1/webhooks/pawapay/deposits` | Callback deposits COMPLETED/FAILED — signature RFC-9421 + Check Deposit Status + idempotence | signature |
| `POST /v1/webhooks/revenuecat` | Événements RevenueCat → subscriptions | Bearer secret |
| `GET /v1/billing/status` | Statut premium consolidé (utilisé par le sync et le bouton Actualiser) | JWT user |
| `POST /v1/admin/billing-region` | Correction manuelle de la voie d'un user (support) | admin |

> ⚠️ Préfixe `/v1/` obligatoire sur TOUTES les routes (API_SPEC §0) —
> y compris dans la config Dashboard PawaPay (§4.4ter).

Règles transverses :
- Webhooks : répondre 200 vite, traiter en asynchrone si besoin.
- Tout montant en FCFA entiers, jamais de float.
- Logs Sentry sur chaque échec webhook (un webhook raté = un client
  payé non servi = le pire bug possible).
- Render : plan payant OBLIGATOIRE avant l'activation des webhooks
  (règle 18.8 — un cold start de 60s peut faire expirer un webhook).

---

## 7. HORS SCOPE V1 — MARKETPLACE COACH (V2)

Repoussé par décision Juillet 2026 (PRICING.md §4) :
- Wallet coach (`coach_wallets`, solde comptable interne)
- Vente de programmes + split commission 15-20%
- Payout à la demande via PawaPay Transfers (`POST /transfers`,
  `/transfers/bulk`, auth X-Grant + IP whitelist)
- File `payout_requests` + cron batch + rétention 48-72h + seuil 5 000 FCFA
L'architecture est déjà spécifiée dans CLAUDE_LYXO_V3.md §18.9 — ne pas
l'implémenter en V1, ne pas créer les tables en avance.

---

## 8bis. App Access (Play Console) — prérequis review, non négociable
Google (Policy and programs → App access) exige des identifiants de
connexion ACTIFS et RÉUTILISABLES fournis dans Play Console pour que les
reviewers puissent tester l'app dans ses deux états (billing_region
africa_momo ET intl_iap) — sans ça, rejet automatique à la soumission.
Créer un compte de test permanent pour chaque billing_region avant le
premier envoi en review (Bloc G).

## 9bis. RÉPONSE OFFICIELLE #2 — SDK de paiement tiers rendu dans l'app
Question posée (formelle, follow-up) : un SDK de paiement tiers (Mobile
Money) peut-il être rendu DANS l'interface de l'app (pas un renvoi
externe) pour les users où Play Billing ne supporte pas le paiement local ?

Réponse citée intégralement :
> "You can integrate a third-party payment interface directly within
> your app for users in eligible countries if you enroll in the
> appropriate alternative billing program. For digital goods and
> services, Google Play allows developers in certain regions, including
> the European Economic Area (EEA), India, and South Korea, to offer an
> alternative billing system alongside or instead of Google Play's
> billing system.
>
> In these programs, the third-party payment experience must remain
> within the app. [...]
>
> To implement this for digital goods, you must:
> 1. Enroll in the alternative billing program for your specific region
> in the Play Console under Settings > Alternative billing.
> 2. Integrate the alternative billing APIs [...]
> 3. Pay the applicable service fee, typically reduced by 3-4% for
> transactions made through an alternative system.
>
> If your app sells physical goods or services (like groceries or
> transportation), you are not required to use Google Play's billing
> system and can use any third-party SDK or interface within your app
> without enrolling in these specific programs. For digital content,
> however, you must follow the alternative billing program requirements
> for the interface to be permitted inside the app."

CONCLUSION DÉFINITIVE (3e confirmation écrite, cohérente avec §9 et
§19.13) : le Cameroun/CEMAC n'appartient à aucune région éligible
(EEA/Inde/Corée du Sud uniquement) — aucun SDK de paiement ne peut être
rendu dans l'app pour ces users tant que ce statut ne change pas
(réévaluation 30/09/2027). L'abonnement Lyxo+ est un bien numérique :
l'exception "biens physiques" ne s'applique pas à lui. Elle pourrait
théoriquement s'appliquer à un futur produit LYXO clairement requalifié
comme service physique (hors scope actuel) — à réévaluer séparément,
jamais assumée pour Lyxo+.
DOSSIER PAIEMENT AFRIQUE : CLOS. Architecture BILLING_FLOW voie A
(§4) = seule voie légale, ~97% de marge, validée par 3 réponses écrites
de Google Play Support sur 3 angles différents (User Choice Billing,
flux consumption-only, SDK in-app). Ne plus rouvrir sans changement de
politique Google annoncé publiquement.

## 9ter. RÉPONSE OFFICIELLE #4 — Affichage des prix sur l'écran informatif (Juillet 2026)
Question posée (texte : GOOGLE_PLAY_QUESTION_4.md) : l'écran
consumption-only Afrique peut-il afficher la grille tarifaire (features,
prix FCFA, badge "Meilleure valeur") sans bouton/lien/URL/CTA ?

Réponse citée intégralement :
> "Displaying subscription tier information, including feature lists and
> local prices, is acceptable for consumption-only apps, provided there
> are no direct links, URLs, or buttons leading to an external payment
> method.
> According to Google Play's Payments policy, for apps that are
> consumption-only (apps that do not enable users to purchase access to
> digital goods or services from within the app), you may provide
> additional information about purchasing options without direct links.
> This includes using language that refers users to your website to
> manage or upgrade their subscriptions.
> Since you've indicated that the screen will contain no buttons, links,
> or specific calls to action that lead directly to a prohibited payment
> method, displaying the price and benefits as product information is
> permitted. You can find more details on how to communicate with your
> users about alternative ways to pay in the Understanding Google Play's
> Payments policy article
> (support.google.com/googleplay/android-developer/answer/10281818)."

CONSÉQUENCES ACTÉES :
1. ✅ L'écran 16 (LYXO_UI_PROMPT) GARDE sa grille tarifaire + badge
   "Meilleure valeur" — zone grise levée, 4e confirmation écrite.
2. La variante sans prix (feature flag) reste en réserve mais n'est plus
   le défaut.
3. ⚠️ NUANCE NON EXPLOITÉE : cette réponse tolère même "language that
   refers users to your website" pour les apps consumption-only — plus
   permissif que la réponse #1 (§9). DÉCISION : on CONSERVE la règle
   stricte existante (zéro URL/nom de site/verbe in-app, §4.1) — plus
   robuste en review, aucun besoin produit d'y renoncer. Ne pas rouvrir.

## 9. RÉPONSE OFFICIELLE GOOGLE PLAY SUPPORT (Juillet 2026) — archive
Question posée : conformité du flux "écran informatif in-app + paiement
externe par email, zéro lien dans l'app" pour les pays où Play Billing
ne supporte pas le Mobile Money.

Réponse citée intégralement :
> "Google Play's billing system is required for developers offering
> in-app purchases of digital goods and services in countries where the
> system is available. However, as long as Google Play's billing system
> is not available in a particular country, the requirement to use it
> does not apply in that country.
>
> 1. The flow you described is compliant if the app remains
> consumption-only for those users. You may allow users to log in and
> access content paid for elsewhere. Within the app, you can refer users
> to administrative information like a help center or account management
> page, but you must not directly link to a webpage that leads to an
> alternate payment method or use language that encourages an out-of-app
> purchase. Outside of your app, such as via email marketing, you are
> free to communicate with your users about alternative purchase options
> and provide payment links.
>
> 2. You only need to integrate the Google Play Billing Library for
> users in countries where Google Play's billing system is supported and
> where you intend to offer in-app purchases of digital products. For
> users in countries where Play billing is unavailable, you do not need
> to use the library.
>
> 3. You do not need to configure specific settings for this flow in the
> Play Console, but you must provide active, reusable login credentials
> in the App access section (under Policy and programs) so that
> reviewers can access and verify your app's functionality. Make sure
> your app's behavior (such as showing the informational screen versus a
> payment button) correctly matches the user's location or account state
> to remain compliant with the Payments policy."

Conséquences actées : voir §4.1 (correction de l'écran informatif) et
§8bis (App Access). Référence : Understanding Google Play's Payments
policy — support.google.com/googleplay/android-developer/answer/10281818

## 8. CHECKLIST DE MISE EN PRODUCTION BILLING

- [ ] `billing_region` calculé et stocké à l'inscription (jamais côté client)
- [ ] Écran fin de trial Afrique : AUCUN lien/bouton/MENTION de paiement (ni URL, ni nom de site, ni verbe "payer/activer/s'abonner" — audit manuel avant chaque release, conformité écrite Google §9)
- [ ] Garde-fou automatisé : grep CI sur les fichiers d'écrans Afrique — chaînes interdites `rends-toi`, `lyxo.app`, `payer`, `activer`, `abonner`, `PawaPay`, `MoMo`, `Orange Money` → build rouge (règle aussi dans .coderabbit.yaml)
- [x] Question écrite n°4 : RÉSOLUE (Juillet 2026, réponse archivée §9ter) — l'affichage des prix FCFA + badge "Meilleure valeur" sur l'écran informatif est CONFORME tant qu'il n'y a ni bouton, ni lien, ni URL, ni CTA de paiement. L'écran 16 garde sa grille tarifaire ; la variante sans prix reste en réserve (feature flag)
- [ ] Webhook Dashboard PawaPay configuré avec le préfixe /v1/ exact (§4.4ter) et testé par un deposit sandbox de bout en bout
- [ ] Résilience checkout (§4.3bis) : verrou "un pending par token" + polling /pay/:token/status + TTL 30 min testés, incluant le test Playwright "réseau coupé après clic Payer → un seul deposit"
- [ ] App Access configuré en Play Console AVANT la première soumission review (§8bis)
- [ ] iOS : aucune mention de paiement externe nulle part
- [ ] Emails J12/J14/J21 testés (spam check, rendu mobile)
- [ ] Token pay_link : expiration 7j, usage unique, crypto-random
- [ ] Webhook PawaPay : signature vérifiée + re-GET + idempotence testée (rejouer 2x le même webhook)
- [ ] provisional_access : testé avec webhook artificiellement retardé
- [ ] Webhook RevenueCat configuré + app_user_id = user_id Supabase
- [ ] Render plan payant actif AVANT le premier paiement réel
- [ ] Sentry alertes sur webhooks failed
- [ ] Test de bout en bout avec un vrai paiement MoMo de 100 FCFA (compte test)

---
*Documents liés : PRICING.md (prix, canaux, décisions) · CLAUDE_LYXO_V3.md
§18 (règles techniques) · PROJECT_BRIEF.md (vision).*
