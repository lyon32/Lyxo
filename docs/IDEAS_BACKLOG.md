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

---

*Documents liés : AGENT_CONTEXT.md §3.11 (règle d'usage de ce fichier) ·
ARCHITECTURE.md §3 (stack fermé et raisons) · CLAUDE_LYXO_V3.md §20.4
(triple filet paiement/push).*
