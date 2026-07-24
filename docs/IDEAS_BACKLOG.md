# IDEAS_BACKLOG.md — LYXO · Déversoir anti scope-creep
# Version : 1.0 — Juillet 2026
# Rôle : toute idée hors scope de la tâche du jour atterrit ICI, jamais
# dans le code (AGENT_CONTEXT §3.11, PROJECT_BRIEF garde-fous). Une idée
# ne sort de ce fichier que par une décision écrite et datée de Lionel,
# évaluée ENTRE deux blocs — jamais à chaud en session.
# Chaque entrée DOIT avoir un déclencheur de réévaluation MESURABLE :
# pas de "ce serait bien", seulement "si X mesuré, alors réévaluer".

---

## Entrées

| # | Idée | Déclencheur de réévaluation (mesurable) | Périmètre si adoptée | Ajouté |
|---|---|---|---|---|
| 1 | **FCM direct** (`@react-native-firebase/messaging`) en remplacement d'Expo Push | Taux de délivrance des push < 80 % sur les devices Tecno/Infinix, MESURÉ en beta (Sentry + logs backend : push envoyée → /sync déclenché §20.4). Rappel : Expo Push utilise déjà FCM sous le capot sur Android, et le triple filet §20.4 protège les paiements même à 0 % de délivrance — donc jamais un changement préventif. | Module **messaging SEUL**. Jamais : Firebase Analytics (RGPD diaspora UE — PostHog EU décidé, ARCHITECTURE §3), Crashlytics (Sentry décidé, couvre app + backend + KPI crash-free), Remote Config (kill switch = table `feature_flags` via sync, offline-first), App Distribution (la règle Google 20 testeurs/14 jours exige le track Play Internal Testing). Coût à chiffrer avant décision : module natif → nouveau `.aab`, +poids bundle sur budget < 30 Mo. | Juil. 2026 |
| 2 | **Critères de compatibilité du Gym Matching** (salle, horaires d'entraînement, split, niveau) — nécessaires avant d'implémenter ROADMAP 5bis.2, jamais définis pendant le brainstorm référence. | À trancher AVANT le début du dev de 5bis.2 (pas un vrai trigger mesurable — c'est un blocage de spec, pas une réévaluation différée). | Écran swipe matching (LLD.md §6.8) — sans ces critères l'algo de suggestion n'a pas de base. | 2026-07-24 |
| 3 | **Champs additionnels sur les cartes du feed** (au-delà d'avatar/handle/timestamp/titre/durée/like/comment — Lionel veut "plus d'infos" mais n'a jamais précisé lesquelles pendant le brainstorm référence). | À clarifier avec Lionel avant l'implémentation de l'écran feed (ROADMAP 5.2 / LLD.md §6.3 pour le format de référence). | Composant carte feed (Search › Feed). | 2026-07-24 |
| 4 | **Production des 2 assets anatomiques face/dos** (LLD.md §6.3/§6.8) — illustration réelle, zones musculaires mappées aux slugs `muscle_group`, palette de highlight par groupe. Pas de fournisseur/outil choisi. | À trancher avant ROADMAP 4.10 (asset bloquant, pas un vrai trigger différé). | Écran détail Workout — schéma anatomique. | 2026-07-24 |
| 5 | **Validation de la liste exacte des 50 exercices embarqués offline** (PRD.md §1.2, CLAUDE_LYXO_V3.md §19.5) — liste actuellement une ASSUMPTION (classiques PPL), jamais validée par un praticien réel. | À valider AVANT ROADMAP 7.6 (recrutement des 10 coachs finalisé, Phase 7 BETA) — pas un trigger différé, un blocage de spec à lever avant la distribution beta. | Contenu du pack embarqué (~8-12 Mo, offline-first E13 PRD §3.5) — pas de refonte de code, juste la liste finale des 50 slugs. | 2026-07-24 |

---

*Documents liés : AGENT_CONTEXT.md §3.11 (règle d'usage de ce fichier) ·
ARCHITECTURE.md §3 (stack fermé et raisons) · CLAUDE_LYXO_V3.md §20.4
(triple filet paiement/push).*
