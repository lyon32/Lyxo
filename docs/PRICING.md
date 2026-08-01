# PRICING.md — LYXO · Source de Vérité Unique du Pricing
# Version : 1.0 — Juillet 2026
# Statut : OFFICIEL. Ce fichier prime sur toute autre mention de prix
# dans LYXO_Plan_Complet, CLAUDE.md, les maquettes Stitch, la landing page.
# Toute modification de prix se fait ICI et uniquement ici.

> Règle Claude Code : ne jamais hardcoder un prix dans le code.
> Tous les prix vivent dans `config/pricing.ts`, généré depuis ce fichier.
> Si un document contredit ce fichier, ce fichier gagne.

---

## 1. LES 3 TIERS — Vue d'ensemble

| Tier | Cible | Rôle stratégique |
|---|---|---|
| Lyxo Gratuit | Tous | Acquisition + effet de réseau. Le social est 100% gratuit. |
| Lyxo+ | Pratiquants sérieux | Monétisation principale B2C |
| Lyxo Coach Pro | Coachs professionnels | Monétisation B2B + canal d'acquisition |

Règle marketing permanente : ne JAMAIS écrire "100% gratuit".
Formulation officielle : **"Tracker Core gratuit à vie"**.

---

## 2. LYXO+ — Pricing officiel

### Afrique (FCFA — Cameroun, CI, Sénégal, zone CEMAC/UEMOA)

| Offre | Prix | Affichage |
|---|---|---|
| Pass Mensuel | **3 500 FCFA / mois** | Option secondaire |
| Pass Annuel | **15 000 FCFA / an** | **DEFAULT — mis en avant** |

- Équivalent annuel : 1 250 FCFA/mois → argument affiché : "Soit 1 250 FCFA/mois"
- Badge annuel : **"Meilleure valeur"** (PAS "Économisez 15%" — le vrai delta est ~64%)
- **Ordre d'affichage gravé (ancrage)** : l'annuel apparaît TOUJOURS
  avant le mensuel dans le layout — sur tous les écrans, toutes régions
  (le premier prix vu devient la règle de mesure ; UI prompt règle 17)
- ❌ Le Pass Trimestriel (3 000 FCFA/3 mois) **n'existe plus**. Supprimé partout.
- Format des nombres : **3 500 · 15 000** (espace insécable, JAMAIS 3,500 / 15,000)
- Devise affichée : FCFA uniquement. Aucun équivalent EUR/USD visible.

### Europe / USA / Reste du monde

| Offre | Prix | Affichage |
|---|---|---|
| Mensuel | 4,99 € / mois ($5.99) | Option secondaire |
| Annuel | 34,99 € / an ($39.99) | **DEFAULT** — "Soit 2,92 €/mois" |

### Trial — Règle unifiée

**14 jours gratuits, PARTOUT — déclenché MANUELLEMENT.** (Décisions Juillet 2026.)
Le trial ne démarre JAMAIS automatiquement à l'inscription : l'user le
déclenche lui-même ("Essayer Lyxo+ 14 jours gratuits") quand il rencontre
une feature premium — le trial commence au moment du désir, pas pendant
l'apprentissage de l'app.

Deux implémentations techniques distinctes, une seule promesse marketing :

| Marché | Mécanisme | Fin du trial |
|---|---|---|
| Occident | Trial RevenueCat natif (carte enregistrée) | Débit automatique à J14 sauf annulation |
| Afrique | Flag backend `trial_expires_at` (+14 jours), AUCUN paiement demandé à l'activation | Retour au tier Gratuit + notification "Continue avec le Pass Annuel" |

- CTA paywall Afrique : **"Commencer mes 14 jours gratuits"**
- Sous-texte : "Puis 15 000 FCFA/an. Sans engagement. Annulation à tout moment."
- Un seul trial par compte, à vie (`trial_used: boolean` sur profiles).

⚠️ **PRÉCISION SCOPE MVP V1 : Android uniquement (décision Juillet 2026).**
Le MVP V1 cible **Android uniquement** — non-goal 10 (PROJECT_BRIEF.md).
Le flux réel couvert par ce document en V1 est donc :
- **Android Afrique** : trial déclenché par le bouton in-app (tableau
  ci-dessus), paiement futur via **PawaPay** (voie web, BILLING_FLOW.md
  §4).
- **Android Occident** : paiement carte via **Google Play Billing
  (RevenueCat)**.
La contrainte "iOS = RevenueCat partout" (voir §4 ci-dessous et
BILLING_FLOW.md §1, ligne iOS) **ne s'applique pas encore** : iOS est
hors scope du MVP actuel (aucun build iOS, aucun compte développeur
Apple ouvert avant la validation de la rétention Android). Cette
contrainte est documentée par anticipation pour la Phase iOS future et
sera reprécisée/retraitée quand iOS sera formellement scopé — ce n'est
pas un bug à corriger aujourd'hui, juste une zone à ne pas coder avant
son heure.

---

## 3. LYXO COACH PRO — Pricing officiel

### Structure : 2 niveaux (décision Juillet 2026)

**Coach Découverte — GRATUIT** (le tier d'essai du métier)
- Jusqu'à **3 clients actifs** suivis
- **1 programme en vente** maximum
- Commission LYXO : **20%** par vente
- Messagerie coach-client : texte uniquement (⚠️ V2 — en V1, bouton
  WhatsApp uniquement, non-goal 3 PROJECT_BRIEF)
- Objectif : le coach prouve la valeur avec ses 3 premiers clients, puis upgrade naturellement.

**Coach Pro — PAYANT** 🔵 **V2, non actif en V1** (dépend de la
marketplace coach — §4 ci-dessous, PRD.md §1.5. En V1, le tier Coach
Découverte gratuit est le seul niveau coach actif.)

| Marché | Mensuel | Annuel |
|---|---|---|
| Afrique | 7 000 FCFA / mois | 25 000 FCFA / an |
| Europe / USA | $11.99 / mois | $89.99 / an |

- Clients illimités · programmes en vente illimités
- Commission LYXO : **barème marginal par tranche mensuelle** (jamais un
  effet de seuil/cliff) — **15% sur les premiers 100 000 FCFA de ventes
  brutes/mois, puis 10% uniquement sur la tranche au-delà de 100 000
  FCFA**, calculé par mois calendaire. Exemple : un coach à 150 000 FCFA
  de ventes brutes sur le mois paie 15% × 100 000 (= 15 000 FCFA) + 10% ×
  50 000 (= 5 000 FCFA) = **20 000 FCFA de commission totale** (13,3%
  effectif), jamais 10% appliqué à la totalité des 150 000 FCFA.
- Messagerie complète (texte, audio, vidéo) [V2 — avec la marketplace]
- Stories FOMO 24h, dashboard revenus temps réel [V2], suivi push fin de séance
- Pas de trial Coach Pro : le tier Découverte EST le trial (illimité dans le temps).

### Tableau des commissions — récapitulatif

| Situation | Commission LYXO |
|---|---|
| Coach Découverte (gratuit) | 20% (sur la totalité des ventes, pas de palier) |
| Coach Pro — tranche 0 à 100 000 FCFA de ventes brutes/mois | 15% sur cette tranche |
| Coach Pro — tranche au-delà de 100 000 FCFA de ventes brutes/mois | 10% sur la tranche excédentaire UNIQUEMENT (barème marginal, jamais rétroactif sur la totalité du mois) |

Voir exemple de calcul ci-dessus (150 000 FCFA → 20 000 FCFA de
commission, 13,3% effectif).

---

## 4. CANAUX DE VENTE — Décision légale Juillet 2026

> Contexte vérifié : le programme Google Play "expanded billing choice"
> (paiement alternatif in-app / liens web) est déployé US/UK/EEA au 30/06/2026,
> Australie 30/09/2026, Japon/Corée 31/12/2026, **reste du monde (dont
> Cameroun/CI/Sénégal) : 30/09/2027**. Même via ce programme, Google prélève
> une commission de service (~10% sur les abonnements) y compris sur les
> paiements externes. L'hypothèse V14 "Google tolère, Lyxo garde 98% in-app"
> est INVALIDE et supprimée.

```
CANAL DE VENTE LYXO+ — SYSTÈME À DEUX VOIES (révisé, détail : BILLING_FLOW.md)
├── ANDROID AFRIQUE (détection : pays déclaré à l'onboarding + IP en
│   confirmation — AUCUN téléphone demandé à l'inscription ; le numéro
│   n'est saisi qu'au paiement web, où le prompt MoMo l'exige) :
│   AUCUN bouton de paiement in-app. Fin de trial → écran informatif
│   STRICT (BILLING_FLOW §4.1 : zéro URL, zéro nom de site, zéro verbe
│   payer/activer/s'abonner — seule ligne autorisée : "Consulte l'email
│   que nous venons de t'envoyer") + EMAIL automatique avec lien
│   personnalisé (lyxo.app/pay?token=... — token seul, JAMAIS d'uid en
│   clair, BILLING_FLOW §4.2) → page web PawaPay Mobile Money
│   → webhook payment.complete → is_premium activé dans Supabase
│   → débloqué au prochain sync WatermelonDB.
│   Canaux de vente réels : email, site web, WhatsApp, coachs.
│   Marge : ~97% après frais PawaPay.
├── ANDROID OCCIDENT : Google Play Billing (IAP) via RevenueCat.
│   Flux standard, commission Google 15% (abonnements < $1M).
├── iOS PARTOUT (Afrique incluse) : IAP via RevenueCat UNIQUEMENT.
│   Aucun lien de paiement externe sur iOS. Prix FCFA convertis par les
│   price points Apple. Perte 15-30% assumée (iOS ≈ 10% du marché africain).
└── RÉÉVALUATION : 30/09/2027 (programme Google alternative billing
    reste du monde). Décision aux chiffres, pas avant.
```

### Paiement Mobile Money — règles opérationnelles
- Prestataire : **PawaPay** (DÉCISION FINALE fin Juillet 2026 — remplace NotchPay).
  Raisons : API v2 moderne (idempotence native par depositId, metadata avec user_id
  dans les callbacks = anti-fraude natif, Check Deposit Status, sandbox complet),
  frais transparents ~1% + frais MNO, couverture 20+ marchés africains (Cameroun
  inclus : MTN MoMo + Orange Money) — le multi-pays Phase 3 (CI/Sénégal) est couvert
  par le MÊME contrat, zéro réintégration. Payouts (V2 marketplace) natifs dans le
  même écosystème (/v2/payouts).
- Statuts : `pending → provisional_access (24h) → success | failed | refunded`
- Confiance : sous les opérateurs, afficher "Paiement sécurisé par PawaPay · Reçu par SMS"
- Logos officiels MTN MoMo / Orange Money autorisés tels quels (exception charte couleurs).
- Email transactionnel (lien de paiement personnalisé) : Resend / SendGrid / Mailgun,
  à choisir au moment de l'implémentation (BILLING_FLOW.md).

### MARKETPLACE COACH — REPOUSSÉE EN V2 (décision Juillet 2026)
Le MVP (V1) ne contient NI wallet coach, NI vente de programmes, NI payout.
- V1 : seul l'abonnement Lyxo+ est monétisé (flux à deux voies ci-dessus).
  Coach Découverte reste tel quel côté produit (3 clients, 1 programme) mais
  la VENTE de programmes n'est pas active.
- Prérequis V2 : devis écrit frais Transfers PawaPay + statut juridique
  des reversements (fiscalité Cameroun).

### 🔵 V2 — non implémenté : mécanique détaillée de vente de programmes coach
> Explicitement confirmé par Lionel : **tout ce qui suit est V2, pas MVP
> V1.** Documenté ici par anticipation pour que la Phase 10 (ROADMAP.md,
> marketplace) n'invente rien en session. Précise/actualise le paragraphe
> ci-dessus (les chiffres ci-dessous — notamment le seuil de retrait
> Afrique — sont la version à jour et priment en cas d'écart).

- **Achat programme coach : 100% in-app**, sans jamais faire sortir
  l'acheteur de l'app (contrairement à l'abonnement Lyxo+ individuel qui,
  lui, reste hors-app en Afrique — voir §2 ci-dessus et BILLING_FLOW.md §1).
  - **Afrique** : achat via **PawaPay directement in-app** (checkout
    Mobile Money rendu dans l'interface, pas de redirection navigateur).
    Le coach est notifié du paiement et voit le montant crédité sur son
    **wallet** visible dans son profil, **commission LYXO déjà déduite à
    la source** (barème §3 : 20% Découverte, 15%/10% marginal Pro).
  - **Occident** : achat via **Google Play (IAP)**.
- **Retrait (payout) coach** :
  - **Afrique** : le coach choisit dans l'app le moyen — **Orange Money**
    ou **MTN Money** — PawaPay gère l'envoi (mêmes rails que l'encaissement,
    écosystème /v2/payouts). **Minimum de retrait : 20 000 FCFA.**
  - **Occident** : retrait par **virement bancaire** (alternative à
    évaluer techniquement à l'implémentation si un prestataire plus
    simple existe). **Minimum de retrait : 100 $/€.**
- **Invariant critique anti-fraude (non négociable)** : la DB doit tracer
  CHAQUE transaction (vente, commission, crédit wallet, débit retrait) de
  façon atomique. **Un coach ne doit JAMAIS pouvoir retirer plus que son
  solde wallet réel** — exemple : wallet à 8 000 FCFA, demande de retrait
  de 10 000 FCFA → DOIT être bloquée, ne doit JAMAIS passer, quel que
  soit le chemin emprunté (app, retry réseau, requête rejouée). Cette
  règle se fait respecter **au niveau DB/transaction** (contrainte SQL
  ou vérification atomique dans la même transaction que le débit —
  jamais une simple validation côté UI/client, qui peut être contournée).

---

## 5. FRONTIÈRES FREEMIUM — Ce que chaque tier limite exactement

| Feature | Gratuit | Lyxo+ | Coach Découverte | Coach Pro |
|---|---|---|---|---|
| Log de séance complet | ✅ | ✅ | ✅ | ✅ |
| Historique séances (consultation) | 90 jours (masqué au-delà, jamais supprimé) | Illimité | 90 jours | Illimité |
| PRs & 1RM estimé | ✅ calculés sur TOUT l'historique (un PR est une vérité, pour tous) | ✅ | ✅ | ✅ |
| Exercices custom | 5 max | Illimité | 5 max | Illimité |
| Social V1 (feed abonnés, stories) — Discover public = Phase 8 | ✅ | ✅ | ✅ | ✅ |
| Leaderboard PRs amis · Conquête · Trace | ✅ | ✅ | ✅ | ✅ |
| Automated Workout Progression | ❌ | ✅ | ❌ | ✅ |
| Velocity & Fatigue Tracking | ❌ | ✅ | ❌ | ✅ |
| Clone programme + réadaptation 1RM | ❌ | ✅ | ❌ | ✅ |
| Séance Fantôme (V2 — jamais listée sur le paywall avant livraison) | ❌ | ✅ | ❌ | ✅ |
| Cloud Backup multi-device garanti | ❌ | ✅ | ❌ | ✅ |
| Export PDF/CSV mis en forme | ❌ | ✅ | ❌ | ✅ |
| Export JSON brut (conformité RGPD, via page web compte) | ✅ | ✅ | ✅ | ✅ |
| Appareils actifs simultanés | 1 (nouveau login déconnecte l'ancien) | Multi | 1 | Multi |
| Clients suivis | — | — | 3 | Illimité |
| Programmes en vente | — | — | 1 (commission 20%) | Illimité (15%→10%) |

Règle UX de la limite 90 jours (anti-review 1 étoile) :
- Annoncée dès l'onboarding : "Ton historique complet est conservé pour toujours. L'affichage gratuit couvre les 90 derniers jours."
- Notification douce à J75. Jamais de paywall surprise à J91.

---

## 6. JOURNAL DES DÉCISIONS PRICING

| Date | Décision | Remplace |
|---|---|---|
| Juil. 2026 | Mensuel 3 500 + Annuel 15 000 FCFA, trimestriel supprimé | V11-V14 (3 000/3 mois), V15 (3 500 mensuel seul) |
| Juil. 2026 | Trial 14 jours partout (implémentation flag backend en Afrique) | V14 (7 jours Afrique) |
| Juil. 2026 | Coach Découverte gratuit (3 clients, 1 programme, 20%) | V14 ("15 clients gratuits" ambigu) |
| Juil. 2026 | Seuil commission 10% = 100 000 FCFA ventes brutes/mois, appliqué en **barème marginal** (10% uniquement sur la tranche au-delà, jamais un effet de seuil rétroactif sur la totalité — §3) | "au seuil" non défini, puis corrigé de l'effet de seuil (cliff) initial |
| Juil. 2026 | Android Afrique = vente web ; iOS = IAP only ; réévaluation 30/09/2027 | V14 "Google tolère / 98% in-app" |
| Juil. 2026 | Système à deux voies : détection Afrique (tél/pays/IP), texte informatif + email lien personnalisé, zéro bouton in-app Afrique | Paywall in-app avec bouton MoMo |
| Juil. 2026 | NotchPay retenu un temps comme prestataire unique (encaissement + payout) | CinetPay |
| Juil. 2026 | Marketplace coach (wallet, vente programmes, payout) → V2. V1 = Lyxo+ uniquement. Le reste du Coach Mode (programmes, suivi clients, invitations) RESTE en V1 | Paiements coachs en Phase 2/3 du plan |
| Fin juil. 2026 | Trial déclenché manuellement (jamais auto à l'inscription) | Trial auto implicite |
| Fin juil. 2026 | Détection région = pays déclaré + IP (pas de téléphone à l'inscription) | Indicatif téléphonique en signal n°1 |
| Fin juil. 2026 | Export JSON brut gratuit (RGPD) ; PDF/CSV mis en forme = Lyxo+ | Export = premium sans nuance |
| Fin juil. 2026 | Gratuit = 1 appareil actif ; Lyxo+ = multi-device simultané | "Cloud Backup garanti" flou |
| 1 août 2026 | **Révision** : multi-device simultané pour TOUS les tiers, gratuit inclus — plus de déconnexion automatique au login. La déconnexion d'un appareil devient une action manuelle depuis un écran "Mes appareils" (sécurité de session, type Netflix/Instagram), jamais un levier de monétisation. Décidé en testant 3.7 (torture tests sync) : la coupure automatique n'était pas instantanée, ce qui créait une fenêtre où deux appareils du même compte pouvaient diverger silencieusement | Gratuit = 1 appareil actif |
| Fin juil. 2026 | **Rationale remise annuelle asymétrique Afrique/Occident documenté** : Afrique ~64% de remise annuelle (15 000 FCFA/an vs 3 500×12=42 000 FCFA) contre ~42% en Occident (34,99 €/an vs 4,99×12=59,88 €). Écart voulu, pas une incohérence : le Mobile Money n'a AUCUN auto-renew natif (§4, "pas d'auto-renew en Mobile Money") — chaque renouvellement Afrique est un acte manuel (re-cliquer un lien, ressaisir le code PIN MoMo). Une remise annuelle nettement plus agressive réduit le nombre de fois par an où l'user affronte cette friction de re-paiement manuel (1×/an au lieu de 12×/an), alors qu'en Occident l'auto-renew carte/IAP rend cette friction inexistante — la remise y sert seulement l'ancrage prix classique, pas une compensation de friction | Écart non justifié à l'audit |
