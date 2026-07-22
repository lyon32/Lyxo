# PROJECT_BRIEF.md — LYXO · Vision & Définition du Problème
# Version : 2.0 — fin Juillet 2026 (réécriture : cible MONDIALE assumée)
# Rôle : le POURQUOI du projet. À lire avant CLAUDE_LYXO_V3.md (le COMMENT)
# et PRICING.md (le COMBIEN). En cas de doute sur une décision produit,
# ce fichier est l'arbitre : si une feature ne sert pas le problème défini
# ici, elle n'entre pas dans le scope.

---

## 0. POSITION FONDAMENTALE — Cible mondiale, entrée africaine

**LYXO cible tout le monde, partout.** Ce n'est pas une "app africaine" —
c'est une app mondiale dont le fondateur possède un avantage terrain
décisif sur un marché d'entrée que les incumbents ignorent.

- **Produit** : universel dès la V1 — FR + EN au choix de l'user, kg + lbs,
  design sans aucun marqueur régional (§19.8), deux voies de paiement
  couvrant Mobile Money ET cartes/IAP.
- **Go-to-market** : Afrique francophone d'abord — parce que c'est le
  terrain du fondateur (coachs, salles, culture), que la concurrence y est
  nulle, et que l'effet de réseau social se construit mieux dans des
  communautés denses qui se connaissent. Pas parce que le produit y serait
  limité.
- La distinction est stricte : les spécificités marché vivent dans la
  LOGIQUE (billing_region, Data Saver, formats par locale), jamais dans le
  produit lui-même ni son esthétique.

---

## 1. PROBLEM STATEMENT — Le problème qu'on résout

**Les trackers de musculation existants sont solitaires, et les réseaux
sociaux fitness ne trackent rien.** Trois douleurs, mondiales, avec une
intensité maximale sur le marché d'entrée :

1. **Tracker seul ne tient pas dans la durée — nulle part.** La motivation
   en salle est profondément sociale : on s'entraîne entre amis, on se
   compare, on se défie. Strong, Hevy et Jefit sont d'excellents carnets de
   notes numériques *solitaires* — leur rétention s'effondre quand la
   motivation individuelle flanche. Aucune app ne transforme la rivalité
   réelle de salle — le défi, le titre à défendre, la revanche — en
   mécanique produit. C'est LE trou du marché mondial.

2. **Les apps existantes supposent un contexte premium qui exclut une
   énorme partie du monde** : connexion stable en salle, carte bancaire,
   prix calibrés sur le pouvoir d'achat occidental (9,99 $/mois). Résultat :
   des centaines de millions de pratiquants — Afrique, Asie du Sud, Amérique
   latine — n'ont AUCUNE option sérieuse. L'offline-first et le pricing
   localisé ne sont pas des features régionales : c'est de l'ingénierie de
   robustesse qui sert aussi le métro parisien et la salle en sous-sol de
   Brooklyn.

3. **Les coachs indépendants travaillent avec des PDF et des messageries** —
   partout. Programmes envoyés en PDF/vocaux, suivi de mémoire, zéro
   visibilité sur ce que font les clients entre les séances. Les outils
   dédiés (Trainerize, 30-100 $/mois) sont chers, complexes, et ignorent
   des moyens de paiement entiers.

**En une phrase :** LYXO est le tracker de musculation social et
offline-first qui transforme la rivalité de salle en moteur de progression —
pour tous les pratiquants, partout, en commençant là où personne ne regarde.

---

## 2. TARGET USERS — Personas

### Persona primaire — "Le pratiquant sérieux" (mondial)
Le même être humain existe à Douala, Paris, Lagos, Montréal et New York :
- 18-35 ans, s'entraîne 3-5x/semaine en salle, **avec un groupe** — amis,
  collègues, habitués de la même salle.
- Suit ses charges de tête, dans les notes du téléphone, ou dans un tracker
  solitaire qu'il abandonne au bout d'un mois.
- Motivations universelles : progresser, battre ses potes, montrer ses PRs
  — le statut dans le groupe est réel. Les stories et le partage font
  partie de sa routine.
- **Ce qu'il doit pouvoir faire :** logger sa séance en 3 secondes par set,
  quelles que soient les conditions réseau, voir sa progression, et
  défier/être défié par ses amis.

**Déclinaison marché d'entrée — "Massa" (Douala/Abidjan/Dakar)** : Android
milieu de gamme (2-4 Go RAM), forfait data compté, réseau instable en
salle, paie tout en MTN MoMo/Orange Money, n'a jamais payé un abonnement
par carte, se méfie des paiements sans reçu. C'est le stress-test du
produit : **si LYXO marche pour Massa, il marche pour tout le monde** —
l'inverse n'est pas vrai, et c'est exactement pourquoi on commence par lui.

**Déclinaison Occident — "Yann" (Paris/Bruxelles/Montréal/NY)** : iPhone ou
Android récent, carte bancaire, paie 4,99 €/mois sans y penser. Souvent
connecté à des amis restés au pays (diaspora) ou à son crew de salle local.
Rôle stratégique : l'ARPU élevé qui finance la croissance, et la preuve que
le produit est mondial, pas régional.

### Persona secondaire — "Coach Éric" · le coach indépendant (mondial)
- 25-45 ans, coache 5-30 clients, en salle, à domicile ou à distance.
- Gère tout par messagerie : programmes en PDF/vocaux, suivi de mémoire,
  encaissement manuel, zéro visibilité inter-séances.
- **Ce qu'il doit pouvoir faire :** créer un programme une fois, inviter
  ses clients par lien, suivre leurs séances en temps réel (prévu vs
  réalisé), et — en V2 — vendre ses programmes proprement.
- **Rôle stratégique double** : client B2B (Coach Pro) ET canal
  d'acquisition n°1 — 1 coach = 5-30 users amenés. Le recrutement terrain
  des 10 premiers coachs (Douala, S1) est le levier de lancement.

### Anti-personas (on ne construit PAS pour eux en V1-V2)
- Le crossfitteur/runner/yogi — LYXO est musculation/force, pas multisport.
- La salle de sport en tant qu'entreprise (gestion d'abonnements, badges,
  planning de cours) — autre produit, autre client.
- Le powerlifter d'élite exigeant la programmation avancée (périodisation
  par blocs, RPE %1RM complet) — Lyxo+ en donne une partie, on ne rivalise
  pas avec TrainHeroic en V1.

---

## 3. SUCCESS CRITERIA — À quoi ressemble "réussi"

### Beta coachs (fin S12) — terrain : Douala
- ≥ 10 coachs actifs recrutés (terrain démarré S1) et ≥ 100 users réels
  qui loggent des séances.
- **J7 retention ≥ 40% = excellent · 25-40% = itérer · < 20% après 2
  cycles d'amélioration = pivot Coach Mode B2B pur** (métrique de
  décision, pas de vanité).
- ≥ 60% des séances loggées contiennent ≥ 1 set validé offline puis syncé
  sans perte (la promesse offline-first tient en conditions réelles).
- **Zéro perte de données de séance signalée.** Une séance perdue = un
  user perdu. C'est LE critère de confiance absolu.
- Log d'un set en < 5 secondes en conditions réelles de salle (mesuré).

### Lancement public (fin S16) — mondial dès le jour 1
- App publiée sur Play Store (.aab accepté, suppression de compte, App
  Access configuré), FR + EN, kg + lbs — **aucune barrière pour un user
  de n'importe quel pays**. App Store ensuite.
- Crash-free ≥ 99,5% (Sentry). App < 30 Mo à l'installation.
- Discover non-vide au jour 1 : les programmes des 10+ coachs beta et le
  contenu de leurs clients constituent le fond de catalogue.

### Monétisation (Phase 3, dès activation des paiements)
- ≥ 3% de conversion gratuit → Lyxo+ à 90 jours après activation.
- ≥ 25% des coachs Découverte passent Coach Pro dans les 60 jours.
- Premier mois à ≥ 500 000 FCFA (~760 €) de revenus récurrents +
  commissions = le modèle respire.

### Étoile polaire (12-18 mois)
- LYXO est l'app qu'un pratiquant recommande à son partenaire
  d'entraînement — mesuré par ≥ 40% d'inscriptions via parrainage/lien
  coach (croissance organique > paid), sur au moins deux continents.

---

## 4. NON-GOALS — Ce qu'on ne construit PAS (anti scope-creep)

> Règle de session Claude Code : si une idée touche cette liste, la
> réponse est NON par défaut. Elle ne devient un OUI que par une décision
> écrite de Lionel, datée, ajoutée au journal des décisions.

### Jamais (hors vision)
1. **Pas de multisport** : ni course, ni natation, ni yoga, ni CrossFit
   WODs. Musculation / force, point.
2. **Pas de gestion de salle de sport** (abonnements membres, contrôle
   d'accès, planning de cours).
3. **Pas de messagerie générale** : la messagerie est strictement
   coach ↔ client (V2, avec la marketplace). En V1 : bouton WhatsApp.
   On ne concurrence pas les messageries, on s'y greffe (partage sortant).
4. **Pas de contenu vidéo long / streaming de cours** — coût CDN
   incompatible avec le Data Saver, et hors problème défini.
5. **Pas de marketplace de suppléments / e-commerce physique.**
6. **Pas de web app utilisateur** : le produit est mobile. Le web se
   limite à lyxo.app (landing, /pay, /invite/{code}, /account,
   /reset/{token} — deep link de réinitialisation de mot de passe,
   fiche 7 comité). Pas de dashboard web coach en V1-V2.

### Pas maintenant (différé, avec date de réévaluation)
7. **Pas de Discover public avant S13** — la beta vit sur le feed abonnés
   (§18.11).
8. **Pas de nutrition en MVP** — le logger nutrition est un produit dans
   le produit ; il n'entre pas tant que le tracking training n'a pas
   prouvé sa rétention.
9. **Pas de paiements avant la beta validée** — Phase 3. Le MVP est
   entièrement gratuit ; seules les colonnes trial_used/trial_expires_at/
   billing_region existent (aucune table billing, aucun SDK — règle
   §20.6). L'architecture est déjà validée par écrit par Google Play
   (BILLING_FLOW §9) : PawaPay web pour les marchés Mobile Money,
   RevenueCat IAP partout ailleurs.
10. **Pas d'iOS au lancement** — Android-first (part de marché du terrain
    beta + coût). iOS arrive dès que la beta Android valide la rétention.
11. **Pas de 3e langue avant traction prouvée** — FR + EN dès la V1
    (choix de l'user à l'inscription, §19.5) ; toute langue
    supplémentaire attendra des données.
12. **Pas de Redis avant 10 000 DAU** (§16.6) — vue matérialisée
    PostgreSQL.
13. **Pas d'IA générative in-app en V1-V2** (coach IA, génération de
    programmes) — le différenciateur est social + offline, pas l'IA.
14. **Pas de wearables / Bluetooth / Apple Watch** avant traction.

### Garde-fous de périmètre par session de dev
- Une session Claude Code = un bloc de la roadmap, pas deux.
- Toute feature nouvelle proposée en cours de session → IDEAS_BACKLOG.md,
  jamais implémentée à chaud.
- Le MVP ne grossit que par ÉCHANGE : une feature entre, une feature sort.

---

## 5. POURQUOI NOUS / POURQUOI MAINTENANT
- **Pourquoi nous** : le trou du marché (rivalité sociale + offline-first)
  est mondial, mais y entrer exige un terrain où construire la première
  communauté dense — le fondateur possède ce terrain (Douala : salles,
  coachs, culture, Mobile Money maîtrisé sur d'autres projets).
- **Pourquoi maintenant** : les incumbents (Strong/Hevy) sont des trackers
  solitaires sans social sérieux ; la pénétration smartphone + Mobile
  Money explose sur les marchés ignorés ; et le coût de développement solo
  a chuté (Claude Code). La fenêtre : construire l'effet de réseau avant
  qu'un incumbent n'ajoute le social ou ne localise.

---

*Documents liés : PRICING.md (pricing officiel) · BILLING_FLOW.md (flux de
paiement) · CLAUDE_LYXO_V3.md (règles techniques §18-20) ·
IMPLEMENTATION_PLAN.md (roadmap S1-S16) · LYXO_UI_PROMPT.md (design
Braise).*
