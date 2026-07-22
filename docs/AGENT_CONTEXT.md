# AGENT_CONTEXT.md — LYXO · À lire EN PREMIER, à chaque session
# Version : 1.0 — fin Juillet 2026
# Ce fichier est le point d'entrée. Il ne réexplique rien en détail —
# il pointe vers le bon document et résume les règles qui ne doivent
# JAMAIS être redécouvertes ou redébattues en session. En cas de
# question non couverte ici, ouvrir le document pointé — ne jamais
# improviser une réponse qui contredirait un des 13 documents.

---

## 0. TA TÂCHE POUR CETTE SESSION (à remplir à chaque nouvelle session)

```
Tâche du jour : [coller ici la case ROADMAP.md correspondante, ex. "2.4"]
Bloc concerné : [ex. Bloc B — Logger]
Fichiers autorisés à toucher : [ex. components/logger/, lib/units.ts]
Hors scope explicite : [ex. ne pas toucher à la sync, ne pas commencer 2.5]
```

> Règle non négociable : **une session = une tâche ROADMAP.md cochée.**
> Si la tâche est finie avant la fin de la session, on s'arrête ou on
> consulte IDEAS_BACKLOG.md — on ne glisse jamais vers la tâche suivante
> sans validation explicite de Lionel.

---

## 1. CARTE DES DOCUMENTS — quoi chercher où

| Besoin | Document |
|---|---|
| Pourquoi ce produit existe, pour qui, ce qu'on NE construit PAS | `PROJECT_BRIEF.md` |
| Quelle feature, quel statut (MVP/V2), quels edge cases | `PRD.md` |
| Combien ça coûte, quels tiers, quelles règles de trial | `PRICING.md` |
| Comment le paiement fonctionne techniquement (les deux voies) | `BILLING_FLOW.md` |
| Vue système, stack et pourquoi, déploiement | `ARCHITECTURE.md` |
| Schéma de données complet, tables, RLS, cardinalités | `DATA_MODEL.md` |
| Contrat des endpoints, format d'erreur, codes HTTP | `API_SPEC.md` |
| Structure de dossiers exacte, responsabilités, signatures clés | `LLD.md` |
| Style de code, versions pinnées, patterns à suivre/éviter | `CONVENTIONS.md` |
| Variables d'env, setup local, dépendances | `ENV_SETUP.md` |
| Quoi tester, comment, avec quelles fixtures | `TESTING.md` |
| Qui peut faire quoi, validation, edge cases sécurité | `SECURITY_NOTES.md` |
| Pipeline CI/CD, gates, release | `CICD.md` |
| Découpage en tâches, phase par phase | `ROADMAP.md` |
| **Toutes les règles produit/techniques détaillées + leur historique** | `CLAUDE_LYXO_V3.md` (§16-20 en particulier) |
| Design pixel-défini des 16 écrans MVP | Mockup Claude Design (`§19.16` de CLAUDE_LYXO_V3.md pour le lien) |
| Idées hors-scope à garder pour plus tard | `IDEAS_BACKLOG.md` |

**Ordre de lecture recommandé pour une session nouvelle sur un module
inconnu** : ce fichier → ROADMAP.md (situer la tâche) → PRD.md (la
feature précise) → LLD.md (où coder) → CLAUDE_LYXO_V3.md (la règle
détaillée si besoin) → CONVENTIONS.md (comment l'écrire).

---

## 2. TOUJOURS FAIRE

1. **Stocker les poids en kg**, toujours — jamais lbs. Convertir
   uniquement à l'affichage (`lib/units.ts`).
2. **Soft-delete** (`deleted_at`) sur toute table listée SYNC dans
   DATA_MODEL.md — jamais un DELETE SQL physique.
3. **Dériver le statut premium** (`subscriptions` + `trial_expires_at`)
   — jamais une colonne `is_premium` écrite.
4. **Recalculer côté serveur** tout montant/prix/user_id cible d'un
   paiement — ne jamais faire confiance à une valeur envoyée par le
   client pour une décision sensible.
5. **Passer par i18next** pour toute string UI, dès la première ligne
   — zéro texte en dur, même "juste pour tester".
6. **Suivre le format d'erreur standard** (`{error:{code,message,
   details}}`, API_SPEC §2) sur toute route API, sans exception.
7. **Valider un webhook par signature + re-vérification** (jamais
   confiance au seul événement reçu) — PawaPay: re-GET; RevenueCat:
   Bearer secret.
8. **Passer par Expo MCP `add_library`** pour toute nouvelle dépendance
   (versions compatibles SDK garanties).
9. **Écrire les tests unitaires** sur toute logique dans `lib/`
   (pr-detection, units, billing-region, conflict-resolution) —
   TESTING.md §1.1.
10. **Consulter le mockup Claude Design** avant de coder un écran —
    matcher pixel-perfect, implémenté en NativeWind (pas copié en
    structure HTML).
11. **Utiliser lucide-react-native** pour toute icône — exclusif.
12. **Palette Braise, sans exception** : ember `#C73E3A` (1 CTA + 1
    badge max/écran), acier `#3A3F47`, fond `#0B0A0A` — zéro bleu, zéro
    rouge vif, zéro autre accent.

## 3. NE JAMAIS FAIRE

1. **Ne jamais coder une route/table de billing avant la Phase 9**
   (ROADMAP.md) — aucune exception, même "juste pour préparer".
2. **Ne jamais mentionner un moyen de paiement, un lien, ou le mot
   "payer/activer/s'abonner" dans l'écran informatif Afrique** — c'est
   confirmé par écrit par Google (BILLING_FLOW §9/§9bis) : zéro mention
   de paiement in-app, l'invitation vit exclusivement dans l'email.
3. **Ne jamais introduire Flutter, Tamagui, Unistyles, Redux, Docker
   (local), Redis (avant 10k DAU), ou tout autre élément du stack
   "écarté"** (ARCHITECTURE.md §3) sans une nouvelle décision écrite et
   datée de Lionel.
4. **Ne jamais traduire un message d'erreur côté API** — la traduction
   FR/EN se fait côté client via le `code`, jamais en dupliquant l'i18n
   côté serveur.
5. **Ne jamais stocker une colonne dérivable de manière fiable** (le
   piège `is_premium`) — calculer à la volée, sauf preuve mesurée d'un
   problème de perf réel.
6. **Ne jamais dépasser 10 flows Maestro E2E** — au-delà, c'est du
   scope creep de test, pas de la rigueur.
7. **Ne jamais publier une OTA (EAS Update) contenant du code natif** —
   toute nouvelle dépendance native exige un nouveau `.aab`.
8. **Ne jamais laisser un `console.log` ou une string en dur** dans une
   PR prête à merger — CodeRabbit les signale, à corriger avant merge.
9. **Ne jamais faire confiance à un JWT/webhook sans vérification
   active** à chaque requête — pas de cache de "déjà vérifié".
10. **Ne jamais construire le sélecteur de paiement "façon Spotify"**
    (deux tuiles côte à côte) sans être inscrit à un programme Google
    éligible — le Cameroun/CEMAC n'y est pas en 2026 (BILLING_FLOW
    §9bis).
11. **Ne jamais ajouter une feature hors scope de la tâche du jour**
    sans passer par IDEAS_BACKLOG.md — même si l'idée est bonne.
12. **Ne jamais coder Discover public, la messagerie in-app, ou la
    marketplace coach avant leur phase respective** (PROJECT_BRIEF
    non-goals, ROADMAP Phase 8/10).

---

## 4. DEFINITION OF DONE — pour toute tâche, avant de la cocher

Reprise condensée de CLAUDE_LYXO_V3.md §19.6 — les 8 critères :

- [ ] Fonctionne **offline puis sync** sans perte de données (testé
      en mode avion si la tâche touche au logger/sync).
- [ ] États vide / chargement / erreur gérés (jamais un écran blanc).
- [ ] Zéro string UI hors i18next (FR + EN présents, pas juste FR).
- [ ] Testé sur Pixel 8 **et** le device bas de gamme (≤ 3 Go RAM) si
      la tâche touche à l'UI ou la perf.
- [ ] Tests unitaires écrits si la tâche touche `lib/` ou `services/`
      métier (TESTING.md §1.1).
- [ ] Zéro nouveau crash Sentry sur le parcours testé.
- [ ] Budgets perf respectés si applicable (cold start < 3s, logger
      < 1s sur bas de gamme).
- [ ] Kill switch (`feature_flags`) prévu si la tâche touche à la sync
      ou au billing.

**Une tâche n'est jamais "terminée" si elle échoue un seul de ces
critères applicables.** Une tâche partiellement faite reste ouverte
dans ROADMAP.md plutôt que cochée avec une réserve mentale.

---

## 5. LES 3 RÈGLES ABSOLUES (si tout le reste est oublié, celles-ci
   doivent survivre)

1. **Zéro perte de données de séance.** C'est le seul critère de succès
   non négociable du produit (PROJECT_BRIEF §3). En cas de doute entre
   deux implémentations, choisir celle qui protège le mieux contre la
   perte, même si c'est plus lent à coder.
2. **Le MVP s'arrête à la Phase 7 (beta).** Billing, marketplace,
   Discover public, messagerie : plus tard, jamais "en avance parce que
   c'est plus simple maintenant".
3. **Le paywall Afrique ne montre jamais un moyen de paiement dans
   l'app.** C'est une obligation légale confirmée par écrit, pas une
   préférence de design.

---

*Ce fichier est le pointeur. Le détail, les raisons, et l'historique de
chaque décision vivent dans les 13 documents référencés ci-dessus —
ne jamais les dupliquer ici, seulement les indexer.*
