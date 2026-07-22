> # ⛔ STATUT : ARCHIVE HISTORIQUE (audit doc, Juillet 2026)
> Ce document retrace l'évolution du projet (V1→V16) et contient de
> nombreuses strates PÉRIMÉES (Stripe, Branch.io, Flutterwave, nutrition
> MVP, Discover MVP, DMs, prix 1 500 FCFA, coach gratuit 5/15 clients,
> light mode, roadmap 8 semaines...). **AUCUNE règle opérationnelle ici ne
> prime sur les 13 documents canoniques** : PROJECT_BRIEF, PRD, PRICING,
> BILLING_FLOW, ARCHITECTURE, DATA_MODEL, API_SPEC, LLD, CONVENTIONS,
> ENV_SETUP, TESTING, SECURITY_NOTES, CICD (+ ROADMAP, CLAUDE_LYXO_V3
> §18-20). Seules les SECTIONS 24-26 (fin de fichier) et les notes V16.2/
> V16.3 reflètent l'état actuel. Un agent ne doit JAMAIS implémenter
> depuis ce fichier.

## **LYXO** 

Plan Complet de Développement — Version 16.0 (Référence Finale · Juillet 2026) 

lyxo.app · com.lyxo.app · Android-first · Marché Mondial 

**Fonctionnalités · Architecture · Stack · MVP · Go-to-Market · Monétisation** 

||**2**<br>Langues FR / EN|**500+**<br>Exercices V1 bibliothèque|**5**<br>Onglets navigation|**0**<br>API externe nutrition||
|---|---|---|---|---|---|



|**Version**|**Date**|**Changements**|
|---|---|---|
|1.0→9.0|Juin 2026|Évolution progressive : stack, DB, offline, Go-to-Market, Deep Links, Cache<br>Social, Monétisation, Paiement géolocalisé, Audit prototype Stitch, Palette<br>anti-drapeau, Décisions Lift Card, Framework 5 étapes, Soumission stores|
|10.0|Juin 2026|Renommage KILO→LYXO (lyxo.app), modèle Spotify (dual payment: stores<br>Occident + Mobile Money Afrique sans commission store), paywall géolocalisé<br>dynamique (Écran A Europe/USA, Écran B Afrique FCFA), features inédites<br>(35 idées), SOSA 2026 intégré|
|11.0|Juin 2026|Structure tarifaire officielle en 3 tiers (Lyxo gratuit, Lyxo+, Lyxo Coach Pro),<br>pricing FCFA détaillé (3000/15000 FCFA Lyxo+, 7000/25000 FCFA Coach Pro<br>+ 15% commission programmes), CLAUDE.md Lyxo complet|
|12.0|Juin 2026|Plan de référence final : tous les tiers documentés en détail avec features<br>exactes, tunnel de vente programmes coach (5 étapes), pricing Occident vs<br>Afrique,<br>features<br>inédites<br>intégrées<br>au<br>plan<br>(V2/V3),<br>SOSA<br>2026<br>recommandations (trial 14j, annuel default, Android billing grace period)|
|13.0|Juin 2026|Section 20 entièrement réécrite : 3 tiers avec chaque feature documentée<br>individuellement, exemple visuel de la Notification de Conquête et de la Trace<br>Permanente, tableau comparatif complet 24 features x 3 tiers, pricing Pass<br>Trimestriel 3 000 FCFA Afrique|



|14.0|Juin 2026|3 analyses expertes intégrées : corrections UX Workout Logger (clavier inline,<br>bannière offline contextuelle), remplacement de CinetPay par le hub<br>unique Afrique francophone (devenu PawaPay en V16 — nom restauré, audit doc), format AAB obligatoire (pas APK pour Play<br>Store), iOS App Store restriction paywall strict, Supabase Edge Function<br>nettoyage médias stories, FTS debounce 300ms nutrition, notification push<br>silencieuse webhook Mobile Money PENDING, désactivation animations Data<br>Saver mode, schéma DB payments mis à jour, section 23 Pièges Techniques à<br>éviter|
|16.0|Juillet 2026|VERSION MAJEURE DE CORRECTION — brainstorm de convergence : (1) PRICING.md créé comme source unique — mensuel 3 500 FCFA + annuel 15 000 FCFA, trimestriel supprimé, trial 14 jours partout (flag backend en Afrique), Coach Découverte gratuit (3 clients / 1 programme / 20%) ; (2) section paywall légal réécrite après vérification de la politique Google Play juillet 2026 (programme alternative billing indisponible en Afrique avant 30/09/2027, ~10% de commission même sur paiements externes) → canal officiel = vente web lyxo.app/plus via PawaPay ; (3) PawaPay supprimé du projet, PawaPay unique ; (4) anti-triche PRs sociaux (plafond plausibilité, delta +15%, ancienneté 3 séances) ; (5) Trace expirable 6 mois + opt-outs Conquête ; (6) soft-delete deleted_at sur toutes tables synchronisées + pagination /sync ; (7) suppression de compte (exigence Play Store) ; (8) planning MVP recadré S1-S12 sans Discover public, S13-S16 Discover + soumission — 16 semaines = scénario optimiste ; (9) section Coûts d'infrastructure ajoutée. Détail des règles : CLAUDE_LYXO_V3.md section 18.|
|---|---|---|



Document confidentiel — Usage interne 

Lionel Mayi Mayi · Juin 2026 

## **Table des Matières** 

|**01**|**Vision & Positionnement**|**03**|
|---|---|---|
||Différenciateurs concurrentiels · Angle unique · Nom||
|**02**|**Fonctionnalités Complètes**|**04**|
||2.1 Workout Core · 2.2 Progress & Analytics · 2.3 Stories||
||2.4 Page Discover · 2.5 Nutrition · 2.6 Coach Mode||
||2.7 Social Graph · 2.8 UX & Features Transversales||
|**03**|**Architecture & Infrastructure**|**09**|
||Vue globale · Flux de données · Offline-first détaillé||
||Sync WatermelonDB↔Supabase · Gestion conflits||
|**04**|**Stack Technique Complète**|**11**|
||Mobile · Backend · Base de données · Services tiers||
||Justification de chaque choix vs alternatives||
|**05**|**Schéma Base de Données PostgreSQL**|**14**|
||Tables complètes · Index · Relations · Triggers||
|**06**|**Design Système**|**17**|
||Palette · Typographie · Composants · 5 onglets||
|**07**|**Feature MVP — Version 1.0**|**19**|
||Features incluses avec justification · Features V2||
|**08**|**Gestion des Risques**|**21**|
||Risques identifiés · Corrections · Anticipation||
|**09**|**Roadmap**|**22**|
||Phase 1 MVP · Phase 2 Croissance · Phase 3 Scale||
|**10**|**Go-to-Market — Stratégie Coach**|**24**|
||Kit Coach · Commission · Micro-influenceurs · Expansion mondiale||
|**11**|**Deferred Deep Links — Stratégie Virale**|**25**|
||WhatsApp Share · Deep Link par contenu · Branch.io · Flux||
|**12**|**Cache Social & Règles de Développement**|**26**|
||4 états nuage · Nettoyage auto · Limites Android · Priorités dev||
|**13**|**Stratégie de Monétisation Mondiale**|**28**|
||Freemium multi-devise · RevenueCat · Pricing localisé · Coach Pro B2B||
|**14**|**Architecture Freemium — Implémentation**|**30**|



||Feature flags · Masquage non-destructif · Colonne is_premium · Roadmap||
|---|---|---|
|**15**|**Audit du Prototype Stitch V1**|**32**|
||Points forts · Points faibles par écran · Écrans manquants · Corrections||
|**16**|**Palette Corrigée & Discipline Colorimétrique**|**34**|
||Anti-drapeau · Inspiration Lift Card · DESIGN.md final||
|**17**|**Décisions Produit — Analyse Fonctionnelle Lift Card**|**36**|
||Inscription obligatoire · UI unifiée Stories/Discover · Gym Matching V2||
|**18**|**Framework de Design 5 Étapes Appliqué à LYXO**|**38**|
||Core function · Core loop · Accessory features · Surface area · Retention hook||
|**19**|**Soumission App Store & Play Store**|**40**|
||EAS Submit · Privacy policy · Comptes développeur · Audit sécurité en boucle||
|**20**|**Structure des 3 Tiers Lyxo — Détail Complet**|**42**|
||Lyxo Gratuit · Lyxo+ · Lyxo Coach Pro · Pricing Occident vs Afrique||
|**21**|**Paywall Géolocalisé — Modèle Spotify**|**44**|
||Détection pays · Écran A Europe/USA · Écran B Afrique · Code React Native||
|**22**|**Features Inédites & SOSA 2026 — Insights**|**46**|
||35 idées originales priorisées · Recommandations SOSA 2026 pour Lyxo||
|**23**|**Pièges Techniques & Corrections — Analyses Expertes**|**48**|
||PawaPay · AAB vs APK · iOS strict · Clavier inline · Edge Function · Sécurité||



> **01 VISION & POSITIONNEMENT** 

LYXO est le premier tracker de musculation social conçu pour l'Afrique francophone et sa diaspora. 

## **Pourquoi LYXO existe** 

Les apps fitness existantes (Lift Card, Strong, Hevy) sont conçues pour le marché américain et européen anglophone. Elles ignorent trois réalités fondamentales de notre marché : la connexion internet instable, le français comme langue première, et l'écosystème Mobile Money pour les paiements. LYXO est construit depuis le départ pour ces contraintes — pas adapté après coup. 

|**Concurrent**|**Problème critique**|**Ce que LYXO résout**|
|---|---|---|
|Lift Card|iOS uniquement (Android = waitlist), anglais<br>seul, pas d'offline|Android + iOS simultanément, FR natif, offline-first<br>absolu|
|Strong|Payant ($9.99/mois), zero social, pas<br>d'offline|Tracker Core gratuit à vie, social complet, offline-first|
|Hevy|Pas de stories, pas de coach local africain,<br>anglais|Stories, Coach Mode, coachs camerounais/ivoiriens|
|MyFitnessPal|Nutrition trop complexe, payant, pas de<br>fitness tracker|Nutrition simple (recherche + grammes), workout<br>intégré|
|Strava|Cardio seulement, pas de musculation, pas<br>de stories fitness|Musculation + cardio, stories workout, social fitness<br>complet|



## **Les 5 angles uniques de LYXO** 

1. Offline-first absolu — WatermelonDB local, sync silencieux. Critique pour le Cameroun, Côte d'Ivoire, Sénégal. 

2. Francophone natif — FR par défaut, EN optionnel. Interface, exercices, notifications, support en français. 

3. Android-first — 85% des smartphones en Afrique subsaharienne sont Android. iOS en parallèle. 

4. Nutrition sans friction — Recherche alimentaire + grammes = calories. Pas d'IA, pas d'abonnement, fonctionne offline. 

5. Coach africain — Coachs de Douala, Abidjan, Dakar peuvent vendre leurs programmes et suivre leurs clients dans l'app. 

## **Nom : LYXO** 

Court (4 lettres), mémorisable en 1 seconde, universel en FR et EN, évoque immédiatement la salle de sport et la progression. Tagline : **"Soulève plus. Ensemble."** / **"Lift more. Together."** 

**02** 

## **FONCTIONNALITÉS COMPLÈTES** 

Toutes les features documentées — V1 (MVP) et V2. Chaque feature a une justification de rétention. 

## **2.1 — Workout Core** 

Le cœur absolu de l'app. Tout le reste (social, nutrition) est secondaire. Un user qui ne peut pas logger facilement ses séances désinstalle l'app en 24h. 

## **Log de séance en temps réel** 

- **Sets / reps / poids** — clavier numérique custom (pas le clavier système), optimisé pour la salle. Swipe up/down pour incrémenter rapidement le poids (+2.5kg, +5kg). 

- **Autofill intelligent** — pré-remplit automatiquement le dernier poids et reps utilisés pour chaque exercice. Stocké localement dans WatermelonDB. Zéro friction, zéro mémoire requise de l'user. 

- **Timer de repos configurable** — compte à rebours de 30s à 5min. Lance automatiquement après chaque set validé. Vibration haptic + son au terme. L'user reste dans l'app entre les sets. 

- **Supersets** — grouper deux exercices pour les alterner. Interface dédiée avec flèche de navigation entre les deux. 

- **Drop sets** — réduire le poids immédiatement sans quitter l'exercice. Marqué visuellement différent dans le log. 

- **Warmup sets** — marqués séparément, ne comptent pas dans le volume total de la séance. 

- **RPE (Rate of Perceived Exertion)** — optionnel, échelle 1-10, pour les users avancés. 

- **Notes par set** — texte libre (ex : 'forme parfaite', 'douleur épaule droite'). 

- **Cardio logging** — durée, distance, type (course, vélo, corde, elliptique). Calories estimées par formule standard. 

- **Workout en pause** — l'user peut quitter l'app, recevoir un appel, revenir — la séance est exactement où il l'a laissée (WatermelonDB persiste en local). 

## **Bibliothèque d'exercices** 

- **500+ exercices en V1** — importés depuis ExerciseDB Pro (dataset Kaggle, achat unique, droits commerciaux inclus). 2000+ en V2. 

- **Animations GIF** — mouvement correct pour chaque exercice. Hébergées sur Supabase Storage. En mode Data Saver → image statique JPG à la place. 

- **Noms bilingues** — name_fr (Développé couché barre) + name_en (Barbell Bench Press). Affiché selon la langue du profil. 

- **Instructions step-by-step** — traduites FR/EN pour les 500 exercices via script Claude API (exécuté une seule fois au setup, ~$3). 

- **Filtres** — groupe musculaire, équipement (barre/haltères/machine/poids du corps), niveau, favori. 

- **Exercice custom** — l'user crée ses propres exercices (nom, muscle ciblé, équipement). Visible uniquement par lui. 

- **Favoris** — épingler les exercices fréquents en haut de la liste. 

## **Programmes & Splits** 

- **Workout templates** — créer des modèles réutilisables (ex : 'Lundi — Chest'). Lancer en un tap. 

- **Splits configurables** — PPL (Push/Pull/Legs), Upper/Lower, Full Body, Bro Split, ou custom. 

- **Rotation automatique** — cycler entre splits semaine après semaine. L'app propose le bon workout chaque jour. 

- **Historique complet** — chaque séance stockée avec date, durée, volume total, exercices. Consultable à tout moment. 

## **2.2 — Progress & Analytics** 

La progression visible est le moteur de rétention long terme. Un user qui voit son bench press augmenter sur un graphe revient chaque semaine. 

- **Courbe de progression par exercice** — 1RM estimé, max weight, volume total sur 30j / 90j / 1 an / tout. Graphes Victory Native XL (60fps natif). 

- **Volume par séance** — total kg soulevés (sets × reps × poids). Affiché en fin de séance avec comparaison vs séance précédente. 

- **Heatmap de consistance** — calendrier annuel style GitHub. Chaque carré = une séance. Couleur selon le volume. 

- **Stats lifetime** — total séances, total kg soulevés, record streak, jours actifs. 

- **Objectif hebdomadaire** — 'X séances par semaine'. Taux d'atteinte affiché. 

- **Muscle groups heatmap** — silhouette du corps colorée selon les muscles travaillés cette semaine. 

- **Force relative** — ratio poids soulevé / poids du corps. Permet de se comparer objectivement. 

- **Détection automatique de PR** — 4 types : max_weight, estimated_1rm, max_volume, max_reps. Détectés à chaque fin de set. 

- **Célébration de PR** — animation confetti plein écran + vibration haptic + son. Le moment émotionnel le plus fort de l'app. Carte PR générée automatiquement, partageable. 

- **Monthly Recap** — story auto-générée début de chaque mois : volume, exercices préférés, muscles, streaks, PRs. Format swipeable partageable WhatsApp/Instagram. 

- **Bodyweight tracking** — log quotidien optionnel, courbe sur 30j / 90j. 

- **Progress photos** — album before/after, comparaison côte à côte. (V2) 

## **2.3 — Social : Stories** 

Moteur d'engagement quotidien. 24h de durée = urgence de revenir voir les stories des amis. Différence majeure vs Lift Card : les stories sont le seul format de partage quotidien intime. 

|**Type de story**|**Déclencheur**|**Description**|
|---|---|---|
|Photo fin de workout|Proposé auto en fin de<br>séance|Photo + stats overlay généré (volume, durée, PRs). L'user<br>choisit son fond.|
|PR Celebration|Auto quand PR détecté|Carte visuelle du record. 1 tap pour partager.|
|Graphe de progression|Manuel depuis l'écran Stats|Screenshot du graphe avec branding LYXO.|
|Repas / nutrition|Manuel|Photo du repas + macros du log nutrition.|
|Texte / motivation|Manuel|Fond coloré + texte custom. Style WhatsApp.|
|Vidéo courte|Manuel (V2)|15-60 secondes. Form check, highlight de séance.|



## **Interactions sur les stories** 

- **Réactions emojis** — 6 emojis rapides (I I hI I I I). Affichées publiquement sous la story dans l'ordre des abonnés. 

- **Commentaires en DM** — envoyer un commentaire = ouvrir un fil de discussion privé avec l'auteur. Moins de toxicité, plus d'intimité (modèle WhatsApp). 

- **Vu par** — l'auteur voit la liste de qui a vu sa story + nombre total. 

- **Mentions** — @pseudo dans une story. La personne mentionnée reçoit une notification. 

- **Highlights** — épingler les meilleures stories sur son profil (PRs historiques, transformations). (V2) 

- **Durée** — expire automatiquement après 24h. Nettoyage via Supabase Edge Function cron quotidien. 

## **2.4 — Social : Page Discover** 

Feed public permanent de la communauté. Contrairement aux stories (24h, abonnés seulement), les posts Discover sont visibles par toute la communauté et ne disparaissent pas. 

- **Feed Trending** — algorithme score = likes + (comments×2) + (saves×3) avec decay temporel. Recalculé toutes les heures via Edge Function. 

- **Feed Recent** — chronologique pur. Pour découvrir de nouveaux utilisateurs. 

- **Filtres** — par groupe musculaire, par exercice, par équipement. 

- **Recherche utilisateur** — par pseudo, par nom. 

- **Post public** — photo ou vidéo (V2) avec caption, hashtags, mentions, stats overlay. 

- **Réactions publiques** — cumul de I visible par tous. 

- **Commentaires publics** — fil avec réponses et mentions. Contrairement aux stories. 

- **Sauvegarder** — bookmark dans des collections (Inspiration, Programmes, Objectifs). (V2) 

- **Signalement** — bouton 'Signaler' sur chaque post/commentaire. Raisons : spam, inapproprié, harcèlement. 

- **Ma Salle (V2)** — tab supplémentaire dans Discover : voir les posts des users du même gym. Géolocalisation du gym à l'inscription. 

## **2.5 — Nutrition (Calcul simple, 100% offline)** 

Zéro API externe. Zéro IA. L'utilisateur cherche un aliment, entre la quantité en grammes, l'app calcule les calories et macros instantanément. Fonctionne 100% offline. 

- **Base alimentaire locale** — 5 000 aliments courants importés depuis Open Food Facts (gratuit, open source) + USDA FoodData. Aliments africains inclus (attiéké, ndolé, plantain, eru, thiéboudienne...). 

- **Recherche full-text** — PostgreSQL FTS (GIN index) côté serveur, cache WatermelonDB local pour offline. 

- **Calcul auto** — l'user entre X grammes → app calcule calories, protéines, glucides, lipides instantanément. Formule : valeur_pour_100g × quantité / 100. 

- **Scan barcode** — scanner l'emballage via caméra → correspondance avec Open Food Facts → autofill des valeurs. 

- **Aliment custom** — créer un aliment non trouvé (nom, calories/100g, macros). Sauvegardé localement pour réutilisation. 

- **Log par repas** — Petit-déjeuner, Déjeuner, Dîner, Collation. Un ou plusieurs aliments par repas. 

- **Dashboard nutrition** — total journalier de calories et macros vs objectif. Historique sur 7j / 30j. 

- **Objectif eau** — tracker la consommation d'eau en verres (250ml) ou litres. Rappels configurables. 

- **Lien workout-nutrition** — après une séance, affiche 'Objectif protéines aujourd'hui : X g' basé sur le volume d'entraînement. 

## **2.6 — Coach Mode & Marketplace** 

Modèle de monétisation principal de LYXO. Les coachs africains n'ont pas d'outils professionnels — ils gèrent tout sur WhatsApp. LYXO leur donne une vraie plateforme. 

- **Profil coach vérifié** — badge officiel, bio longue, certifications, spécialités, tarifs. 

- **Builder de programmes** — créer des programmes semaine par semaine, jour par jour, exercice par exercice. Notes de coach par exercice. 

- **Vente de programmes** — prix libre en FCFA ou EUR. Livraison directe dans l'app au client après paiement. 

- **Suivi clients en temps réel** — voir les logs de ses clients, commenter leurs séances, envoyer des ajustements. 

- **Messagerie coach-client** — fil dédié, partage de vidéos de forme, feedback. 

- **Analytics coach** — revenus, programmes vendus, taux de completion des clients, clients actifs. 

- **Partage WhatsApp** — bouton 'Partager mon programme sur WhatsApp' → deep link vers l'app. Canal d'acquisition gratuit. 

- **Commission LYXO** — 15% sur chaque vente de programme (source de revenu principale de l'app). 

## **2.7 — Social Graph & Interactions** 

- **Follow / Unfollow** — profils publics par défaut. Option profil privé (abonnés doivent être approuvés). 

- **Block** — bloquer un utilisateur. Ses posts et stories disparaissent. Il ne peut plus voir le profil. 

- **Signalement** — signaler post, commentaire, profil. Stocké en base, reviewé manuellement + filtre auto. 

- **Filtre anti-spam basique** — Supabase Edge Function filtre les mots-clés injurieux avant publication. 

- **Notifications** — nouveau follower, like sur post, commentaire, mention, réaction story, PR d'un ami. 

- **DMs** — messagerie directe entre utilisateurs (réponse à story, coach-client). 

- **Leaderboard amis (V2)** — classement hebdomadaire entre ses abonnés sur le volume total. 

## **2.8 — UX & Features Transversales** 

- **Choix de langue à l'onboarding** — premier écran avant même l'inscription. FR (défaut) ou EN. Sauvegardé immédiatement en local. Modifiable dans Paramètres. 

- **Data Saver mode** — GIFs remplacés par images statiques JPG en 3G/4G. Détection auto via NetInfo + option manuelle dans Paramètres. 

- **Indicateur sync offline** — icône nuage discret dans la nav bar. Gris = hors ligne (données sauvegardées). Vert = synchronisé. Sync automatique au retour du réseau. 

- **Dark mode** — activé par défaut. Optionnel light mode dans Paramètres. 

- **Unités kg / lbs** — switchable à tout moment. Conversion automatique de tout l'historique. 

- **Import CSV** — migration depuis Hevy, Strong, ou CSV standard. (V2) 

- **Export PDF stats** — rapport mensuel ou annuel téléchargeable. (V2) 

- **Apple Health / Google Fit sync** — séances envoyées vers la santé native. (V2) 

> **03 ARCHITECTURE & INFRASTRUCTURE** 

Vue complète du système — de l'appareil de l'utilisateur jusqu'aux bases de données. 

## **Vue Globale de l'Architecture** 

LYXO repose sur une architecture à 3 couches : (1) App mobile locale (offline-first), (2) Backend API Node.js sur Render.com, (3) Supabase (PostgreSQL + Auth + Storage + Realtime). 

|**Couche**|**Technologie**|**Rôle**|
|---|---|---|
|Mobile Local|React Native + WatermelonDB<br>(SQLite)|Stockage local de TOUT : workouts, sets, exercises, nutrition.<br>Fonctionne sans internet.|
|App Layer|Expo Router + Zustand +<br>i18next|Navigation, état global de l'app, internationalisation FR/EN.|
|API Backend|Node.js + Express sur<br>Render.com|Logique métier, endpoints REST, validation, webhooks paiement.|
|Base de données|PostgreSQL via Supabase|Source de vérité distante. Sync depuis le mobile quand connecté.|
|Auth|Supabase Auth|JWT tokens. Google, Apple, email/password. Sessions gérées<br>côté Supabase.|
|Storage fichiers|Supabase Storage|GIFs exercices, photos profil, médias stories/posts, progress<br>photos.|
|Realtime|Supabase Realtime|Feed social live, notifications, mises à jour de likes en temps réel.|
|Cache|(différé) Redis/Upstash|REPORTÉ jusqu'à 10 000 DAU (voir CLAUDE.md 16.6). Trending via vue matérialisée PostgreSQL. Aucune ligne Redis avant ce seuil.|
|Push Notifications|Expo Notifications + FCM/APNs|Notifications iOS et Android depuis un seul SDK.|
|Paiements|⛔ PÉRIMÉ — RevenueCat (intl) + PawaPay (Afrique, vente web)|Décision finale : RevenueCat UNIQUEMENT à l'international (Stripe écarté) ; PawaPay unique en Afrique (CinetPay/NotchPay supprimés). Source : BILLING_FLOW.md.|
|CDN|Cloudflare (via Supabase)|Distribution des assets (GIFs, images) au plus proche de<br>l'utilisateur.|
|Monitoring|Sentry + PostHog|Erreurs en production (Sentry), comportement users et funnels<br>(PostHog).|



## **Flux de données — Workout en offline puis sync** 

```
1. USER HORS LIGNE :
```

`App` → `WatermelonDB (SQLite local)` → `données sauvegardées immédiatement` 

```
[synced: false] stocké sur chaque record
```

```
2. RETOUR DU RÉSEAU (NetInfo détecte la connexion) :
```

`App` → `SyncQueue` → `Backend Node.js` → `Supabase PostgreSQL` 

```
[synced: true] mis à jour sur chaque record synchronized
```

```
3. CONFLIT (user a logué sur 2 appareils offline) :
```

```
Stratégie : Last Write Wins (updated_at le plus récent gagne)
```

`local_id unique par record` → `UPSERT PostgreSQL (ON CONFLICT DO UPDATE)` 

```
4. FEED SOCIAL :
```

`Pull-to-refresh` → `GET /api/feed` → `Supabase Realtime WebSocket` 

`Nouveaux posts` → `push Realtime` → `update Zustand store` → `re-render` 

## **Architecture Offline-First — Détail WatermelonDB** 

WatermelonDB est choisi plutôt que SQLite direct ou AsyncStorage car il est conçu spécifiquement pour les données relationnelles complexes sur mobile, avec lazy loading et observables réactifs. Un historique de 500 séances avec 10 000 sets se charge en quelques millisecondes. 

- **Tables locales** — workouts, workout_exercises, sets, exercises, meal_logs, meal_items, stories (draft). 

- **Champ synced** — boolean sur chaque record. false = en attente de sync. 

- **Champ local_id** — UUID généré côté app avant même la sync. Permet l'UPSERT sans collision. 

- **Observables** — l'UI réagit automatiquement aux changements de la DB locale. Pas de refresh manuel. 

- **Migration schema** — WatermelonDB gère les migrations de schema entre versions de l'app. Critique pour les mises à jour. 

## **Infrastructure Paiements Mobile Money** 

Le Mobile Money n'est pas instantané. Un paiement peut rester en PENDING 2-5 minutes. L'app ne débloque jamais le contenu avant confirmation du callback. 

- **Flux** : User initie paiement → Backend crée ligne payments (status=PENDING) → PawaPay envoie prompt sur téléphone user → User confirme sur son téléphone → PawaPay envoie webhook au backend → Backend met à jour status=SUCCESS → App débloque le programme. 

- **Page 'Mes paiements'** — l'user peut revenir vérifier le statut si il a quitté l'app. 

- **Support intégré** — email pré-rempli avec l'ID de transaction pour les échecs. 

- **Idempotence webhook** — le backend ignore les webhooks en double (même provider_tx_id déjà traité). 

> **04 STACK TECHNIQUE COMPLÈTE** 

Chaque choix justifié face aux alternatives — avec les raisons concrètes. 

## **Frontend Mobile** 

|**Technologie**|**Choix retenu**|**Alternative rejetée**|**Pourquoi ce choix**|
|---|---|---|---|
|Framework|React Native + Expo|Flutter|RN = JS/TS que tu connais déjà (AdsFacile). Flutter<br>impose Dart. Expo ajoute builds simplifiés, OTA<br>updates, notifications en un SDK.|
|Navigation|Expo Router<br>(file-based)|React Navigation v6|Expo Router est le standard 2025 pour Expo. File-based<br>routing = structure claire, deep links natifs automatiques.|
|State<br>management|Zustand|Redux Toolkit / Jotai|Zustand = 2kb, API minimaliste, parfait pour l'état global<br>(user, workout en cours). Redux = surengineering pour<br>ce projet.|
|DB locale|WatermelonDB|AsyncStorage /<br>MMKV|WatermelonDB = SQLite haute performance avec lazy<br>loading et observables. AsyncStorage = clé-valeur, pas<br>relationnel. MMKV = pas de requêtes complexes.|
|Animations|React Native<br>Reanimated 3|Animated API native|Reanimated 3 = thread natif, 60fps garantis même sur<br>Android bas de gamme. Indispensable pour les<br>célébrations de PR.|
|UI/Styling|NativeWind (Tailwind<br>RN)|StyleSheet natif /<br>Tamagui|NativeWind = Tailwind CSS sur mobile. Développement<br>rapide, classes cohérentes. Tamagui = trop complexe<br>pour un solo dev.|
|Charts|Victory Native XL|Recharts /<br>react-native-chart-kit|Victory Native XL = seule lib de charts performante sur<br>le thread natif mobile. Les autres lagguent sur les<br>graphes de progression longs.|
|Caméra /<br>Scan|Expo Camera + expo-<br>barcode-scanner|react-native-camera|Expo packages = plus simples à configurer, maintenus<br>par l'équipe Expo, pas de native module à linker<br>manuellement.|
|Réseau|@react-native-commu<br>nity/netinfo|Manual fetch check|Détecte le type de réseau (WiFi, 3G, 4G) pour activer<br>automatiquement le Data Saver mode.|
|i18n|i18next +<br>react-i18next|react-intl / LinguiJS|i18next = le standard industrie, documentation<br>exhaustive, lazy loading des fichiers de langue,<br>formatage de dates/nombres intégré.|



## **Backend** 

|**Technologie**|**Choix retenu**|**Alternative**|**Pourquoi**|
|---|---|---|---|
|Runtime|Node.js 20 LTS|Bun / Deno|Stack identique à AdsFacile. Patterns réutilisables, pas de<br>courbe d'apprentissage. Bun est plus rapide mais<br>écosystème encore immature.|



|**Technologie**|**Choix retenu**|**Alternative**|**Pourquoi**|
|---|---|---|---|
|Framework|Express.js|Fastify / Hono|Express = documentation abondante, middlewares pour tout,<br>zéro surprise. Fastify est plus rapide mais moins d'exemples<br>disponibles.|
|ORM|Prisma|Drizzle / Knex|Prisma = migrations auto, type safety TypeScript parfaite,<br>Studio GUI pour visualiser la DB. Idéal pour un solo dev.|
|Validation|Zod|Joi /<br>express-validator|Zod = TypeScript natif, schémas réutilisables côté frontend et<br>backend.|
|Auth middleware|Supabase JWT<br>verify|Passport.js|Supabase gère l'auth. Le backend vérifie juste le JWT<br>Supabase sur chaque requête. Pas besoin de Passport.|
|Hosting|Render.com|Railway / Heroku<br>/ Fly.io|Render = identique à AdsFacile. Deploy GitHub auto, SSL,<br>scaling. Heroku mort (payant sans free tier). Railway ok mais<br>moins mature.|



## **Base de Données & Services** 

|**Service**|**Choix retenu**|**Alternative**|**Pourquoi**|
|---|---|---|---|
|BDD principale|PostgreSQL via<br>Supabase|Firebase Firestore /<br>MongoDB|PostgreSQL = relationnel, requêtes complexes (stats,<br>leaderboard, analytics). Firestore NoSQL = schema<br>ingérable sur le long terme. Supabase = open source,<br>migratable, pas de vendor lock-in Google.|
|Auth|Supabase Auth|Auth0 / Firebase Auth|Supabase Auth = inclus dans Supabase, pas de coût<br>supplémentaire. Google Sign-In, Apple Sign-In,<br>email/password, OTP. Auth0 = payant au-delà de 7<br>500 users.|
|Storage|Supabase Storage|AWS S3 / Cloudinary|Supabase Storage = inclus, CDN Cloudflare intégré,<br>politiques RLS identiques à la BDD. S3 = setup<br>complexe, coût supplémentaire. Cloudinary = payant<br>pour les transformations.|
|Realtime|Supabase Realtime|Pusher / Socket.io|Supabase Realtime = inclus, PostgreSQL CDC natif.<br>Pusher = payant au-delà de 200 connexions.<br>Socket.io = self-managed, coût d'infra.|
|Cache|(différé ≥ 10k DAU)|Redis/Upstash plus tard|Trending = vue matérialisée PostgreSQL rafraîchie par cron (CLAUDE.md 16.6/17.5). Redis interdit avant 10 000 DAU.|
|Paiements Africa|PawaPay (unique)|Flutterwave /<br>Paystack|PawaPay couvre CM, CI, SN, ML, BF, TG, BJ en une intégration. PawaPay supprimé.|
|Paiements intl|Stripe|PayPal / Braintree|Stripe = standard mondial, SDK React Native solide,<br>documentation parfaite, webhooks fiables.|
|Monitoring<br>erreurs|Sentry|Bugsnag / Crashlytics|Sentry = open source, plan gratuit généreux (5k<br>erreurs/mois), React Native SDK officiel, source maps<br>automatiques.|



|**Service**|**Choix retenu**|**Alternative**|**Pourquoi**|
|---|---|---|---|
|Analytics|PostHog|Mixpanel / Amplitude|PostHog = open source, self-hostable si besoin,<br>gratuit jusqu'à 1M events/mois. Mixpanel = payant<br>rapidement. Amplitude = cher.|
|Exercises<br>dataset|ExerciseDB Pro<br>(Kaggle)|API RapidAPI live /<br>créer soi-même|Dataset statique = zéro dépendance externe, zéro<br>coût récurrent, offline possible. RapidAPI = 10<br>req/jour en free tier (inutilisable). Créer soi-même =<br>$5k+.|
|Aliments<br>(nutrition)|Open Food Facts +<br>USDA|Nutritionix API /<br>Edamam|Open Food Facts = open source, gratuit, 3M+<br>aliments, aliments africains inclus, téléchargeable.<br>Nutritionix = payant. Edamam = limité en free.|



**05** 

## **SCHÉMA BASE DE DONNÉES POSTGRESQL** 

Schéma Supabase complet — optimisé pour les requêtes sociales et l'offline sync. 

## **Principes de conception du schéma** 

- **Dénormalisation stratégique** — les compteurs (likes_count, comments_count) sont stockés directement sur la table posts pour éviter des COUNT(*) lents sur les grandes tables. 

- **JSONB pour les données flexibles** — stats_overlay (données workout d'un post) stocké en JSONB pour lecture rapide sans JOIN supplémentaire. 

- **Index ciblés** — index sur les colonnes de filtrage fréquent (user_id + created_at pour le feed, score pour trending). 

- **local_id** — UUID généré sur l'appareil avant la sync. Permet UPSERT PostgreSQL sans collision. 

- **RLS Supabase** — Row Level Security sur toutes les tables. Un user ne peut lire/modifier que ses propres données ou celles publiques. 

## **Tables principales** 

```
-- PROFILES
```

```
create table profiles (
```

```
id uuid references auth.users primary key,
```

```
username text unique not null,
display_name text,
```

```
avatar_url text, -- Supabase Storage URL
```

```
bio text,
```

```
language text default 'fr' check (language in ('fr','en')),
```

```
unit text default 'kg' check (unit in ('kg','lbs')),
```

```
data_saver boolean default false,
```

```
is_coach boolean default false,
```

```
gym_id uuid references gyms(id), -- V2 Ma Salle
```

```
created_at timestamptz default now()
```

```
);
```

```
-- WORKOUTS
```

```
create table workouts (
```

```
id uuid primary key default gen_random_uuid(),
```

```
user_id uuid references profiles(id) on delete cascade,
local_id text unique, -- UUID WatermelonDB (sync key)
title text, -- 'Chest Day', 'PPL Lundi'
started_at timestamptz,
finished_at timestamptz,
duration_secs int,
total_volume_kg float, -- Dénormalisé, calculé à la fin
total_sets int,
```

```
notes text,
```

```
is_template boolean default false,
```

```
synced_at timestamptz
```

```
);
```

```
create index idx_workouts_user on workouts(user_id, started_at desc);
```

```
-- SETS
```

```
create table sets (
```

```
id uuid primary key default gen_random_uuid(),
```

```
workout_exercise_id uuid references workout_exercises(id) on delete cascade,
```

```
local_id text,
```

```
set_number int not null,
```

```
reps int,
weight_kg float,
duration_secs int, -- Isométrique (planche, etc.)
set_type text default 'normal'
check (set_type in ('normal','warmup','dropset','superset')),
```

```
rpe float, -- Rate of Perceived Exertion 1-10
```

```
completed_at timestamptz
```

```
);
```

```
-- PERSONAL RECORDS
```

```
create table personal_records (
```

```
id uuid primary key default gen_random_uuid(),
```

```
user_id uuid references profiles(id) on delete cascade,
```

```
exercise_id uuid references exercises(id),
```

```
workout_id uuid references workouts(id),
```

```
pr_type text check (pr_type in
```

```
('max_weight','estimated_1rm','max_volume','max_reps')),
```

```
value float not null,
```

```
previous_value float, -- Pour afficher '+5kg vs record précédent'
```

```
achieved_at timestamptz default now(),
```

```
unique (user_id, exercise_id, pr_type)
```

```
);
```

```
-- POSTS (Discover)
```

```
create table posts (
```

```
id uuid primary key default gen_random_uuid(),
```

```
user_id uuid references profiles(id) on delete cascade,
```

```
workout_id uuid references workouts(id),
```

```
media_url text,
```

```
media_type text check (media_type in ('photo','video')),
```

```
caption text,
```

```
stats_overlay jsonb, -- {volume:8400, sets:24, duration:4320, prs:[...]}
```

```
is_public boolean default true,
```

```
likes_count int default 0, -- Dénormalisé
```

```
comments_count int default 0, -- Dénormalisé
saves_count int default 0, -- Dénormalisé
```

```
score float default 0, -- Trending: recalculé chaque heure
```

```
created_at timestamptz default now()
);
```

```
create index idx_posts_score on posts(score desc) where is_public = true;
create index idx_posts_recent on posts(created_at desc) where is_public = true;
```

```
-- NUTRITION
```

```
create table foods (
id uuid primary key default gen_random_uuid(),
external_id text unique, -- ID Open Food Facts
name_fr text not null,
name_en text,
brand text,
calories_per_100g float not null,
protein_per_100g float default 0,
carbs_per_100g float default 0,
fat_per_100g float default 0,
fiber_per_100g float default 0,
is_custom boolean default false,
```

```
created_by uuid references profiles(id)
```

```
);
```

```
create index idx_foods_fr on foods using gin(to_tsvector('french', name_fr));
```

```
create table meal_items (
```

```
id uuid primary key default gen_random_uuid(),
```

```
meal_log_id uuid references meal_logs(id) on delete cascade,
food_id uuid references foods(id),
quantity_g float not null,
calories float not null, -- quantity_g/100 * calories_per_100g
protein_g float not null,
carbs_g float not null,
```

```
fat_g float not null
```

```
);
```

```
-- PAIEMENTS
```

```
create table payments (
```

```
id uuid primary key default gen_random_uuid(),
```

```
user_id uuid references profiles(id),
```

```
program_id uuid references coach_programs(id),
```

```
amount int not null,
```

```
currency text check (currency in ('XAF','EUR','USD')),
provider text check (provider in ('pawapay','revenuecat')),
provider_tx_id text unique, -- Idempotence : ignore doublons
status text default 'pending'
check (status in ('pending','provisional_access','complete','failed','refunded')),  -- enum harmonisé §20.2
failure_reason text,
created_at timestamptz default now(),
updated_at timestamptz default now()
```

```
);
```

**06** 

## **DESIGN SYSTÈME** 

Identité visuelle, principes UX, composants — tout le système de design de LYXO. 

## **Identité Visuelle** 

LYXO doit évoquer la salle de sport, pas une app de bien-être. Bold, sombre, contrastes forts. L'énergie d'un vestiaire, pas d'un studio de yoga. Chaque élément visuel renforce la culture fitness : effort, progression, communauté. 

## **Palette de couleurs** 

_Note : palette corrigée en V7 — voir section 16 pour le détail complet de la correction anti-drapeau._ 

|**Nom**|**Hex**|**Usage détaillé**|
|---|---|---|
|Background primaire|#0A0A0A|Fond de toutes les pages. Noir quasi-pur pour réduire la fatigue oculaire en salle<br>(souvent éclairage faible).|
|Background secondaire|#141414|Cards de workout, modals, bottom sheets. Légèrement plus clair pour créer de<br>la profondeur.|
|Surface|#1E1E1E|Champs de saisie, items de liste, séparateurs de sections.|
|Accent principal|#C73E3A (Braise, décision finale — voir CLAUDE.md §19.11)|RÉSERVÉ aux CTAs primaires, deltas PR, marqueurs de rivalité. Mat, jamais fluo.|
|Texte primaire|#FFFFFF|Titres, noms d'exercices, chiffres de stats (ex: 100 KG).|
|Texte secondaire|#888888|Sous-titres, timestamps, meta-infos, labels inactifs.|
|Succès / PR|#C73E3A (ember) + #3A3F47 (acier, structure)|PRs en ember ; sync/structure en gris acier. ZÉRO bleu dans la palette finale Braise (§19.11).|
|Warning / Info|#A78BFA|Alertes, rappels, informations importantes non critiques. (Anciennement orange<br>— corrigé en V7)|
|Border / Divider|#2A2A2A|Séparateurs entre cards, bordures de champs de saisie.|



## **Typographie** 

- **Police unique : Inter** — Disponible gratuitement (Google Fonts), excellente lisibilité sur petit écran, weights Bold et Black très impactants pour les chiffres de stats. 

- **Titres / Stats** — Inter Bold 28-36px. Ex : '100 KG', 'CHEST DAY'. Impact visuel immédiat. 

- **Labels / Corps** — Inter Regular 14-16px. Lisible, aéré, pas fatiguant. 

- **Méta / Timestamps** — Inter Regular 12px, couleur secondaire (#888888). 

- **Zéro serif. Zéro script.** Une police unique = cohérence totale et bundle plus léger. 

## **Principes UX fondamentaux** 

|**Principe**|**Règle concrète**|**Raison**|
|---|---|---|
|Vitesse avant tout|Logger un set en < 3 secondes. Clavier<br>custom numérique, autofill, 0 friction.|En salle, l'user a 60-90 secondes de repos.<br>L'app doit être utilisée en 10 secondes.|
|One thumb friendly|Tous les éléments interactifs dans la zone<br>basse de l'écran (zone pouce droit).|85% des users tiennent leur téléphone d'une<br>main. Accessibilité = engagement.|
|Feedback immédiat|Haptic + son + animation sur chaque PR, fin<br>de set, like reçu, sync réussie.|Le feedback immédiat crée le sentiment de<br>contrôle et de progression.|
|Offline transparent|Jamais de spinner bloquant. Queue locale,<br>sync silencieux en background.|Un spinner = frustration = désinstallation sur<br>connexion instable.|
|Célébrer chaque victoire|PRs, streaks, monthly recap = cérémonial.<br>Confetti + son + haptic.|La dopamine loop (effort→récompense<br>visuelle) est le moteur de rétention principal.|
|Dark mode par défaut|Mode sombre activé par défaut. Light mode<br>optionnel.|La salle de sport est souvent un environnement<br>sombre. Réduit la fatigue oculaire.|
|Data Saver intelligent|GIFs→JPG automatiquement en 3G/4G.<br>Option manuelle.|L'utilisateur africain paie ses données mobiles.<br>Respecter ça = trust.|



## **Architecture des 5 Onglets** 

|**Onglet**|**Icôn**<br>**e**|**Contenu**|**Actions principales**|
|---|---|---|---|
|Home|I|Workout en cours ou bouton 'Démarrer'.<br>Streak du jour. Activité récente des abonnés.|Démarrer séance, voir workout du jour selon split,<br>accéder au feed rapide.|
|Log|I|Logger une séance active : sélection<br>exercices, sets, timer de repos, volume en<br>temps réel.|Ajouter exercice, valider set, démarrer timer, terminer<br>séance, partager.|
|Progress|I|Graphes de progression, heatmap, PRs, stats<br>globales, bodyweight, monthly recap.|Sélectionner exercice, changer période, partager<br>graphe, voir tous les PRs.|
|Discover|I|Feed public Trending / Recent. Filtres. Posts<br>de la communauté.|Liker, commenter, sauvegarder, suivre l'auteur,<br>signaler, chercher.|
|Profil|I|Mon profil public : historique séances, splits,<br>PRs, abonnés, stories highlights.|Éditer profil, voir mes stats, gérer mes abonnés,<br>paramètres.|



## **07 FEATURE MVP — VERSION 1.0** 

La version minimale qui crée une habitude. Critère unique d'inclusion : est-ce que cette feature fait revenir l'user demain ? 

## **Métriques de succès du MVP** 

J7 retention >= 40% — 40% des users inscrits reviennent 7 jours après. 

3 séances loggées dans les 14 premiers jours = user retenu long terme (benchmark industrie). 

1 story ou post Discover dans les 7 premiers jours = user social actif. 

< 2 secondes pour logger un set = expérience workout satisfaisante. 

## **Features incluses dans le MVP** 

|**Feature MVP**|**Justification détaillée**|**Impact**<br>**rétention**|
|---|---|---|
|Choix de langue (FR/EN) au premier<br>lancement|Avant même l'inscription. Sauvegardé localement<br>immédiatement.|Critique J1|
|Inscription (email + Google + Apple)|Point d'entrée. Apple requis pour l'App Store Review.|Critique J1|
|Onboarding (objectif, niveau, split préféré)|Personnalisation immédiate. Réduit le churn J1 en<br>donnant un workout suggéré dès le premier jour.|Critique J1|
|Log workout complet (sets, reps, poids)|Core value proposition absolue. Sans ça l'app n'existe<br>pas.|Critique J1-J7|
|Autofill dernier poids / reps|Réduire la friction = plus de séances loggées. L'user n'a<br>pas à se souvenir de son dernier poids.|Fort J2-J7|
|Timer de repos configurable (30s-5min)|Garde l'user dans l'app entre les sets. Haptic + son en fin<br>de timer.|Fort J1-J7|
|Bibliothèque 200 exercices + animations GIF|200 exercices couvrent 95% des besoins d'un<br>débutant/intermédiaire. GIFs = forme correcte.|Critique J1|
|Exercice custom|Les powerlifters et athletes ont des exercices spécifiques<br>non listés.|Modéré|
|Workout templates & splits configurables|Permettre de réutiliser une séance crée une routine. La<br>routine = rétention.|Fort J7-J30|
|Historique complet des séances|Voir ses séances passées = motivation de continuer.<br>L'user voit sa progression dans le temps.|Fort J7+|
|Graphe de progression par exercice|Visualiser sa croissance = la raison principale de revenir.<br>'3 mois de progression en un coup d'œil'.|Critique J7+|
|Détection et célébration de PR|Le moment émotionnel le plus fort de l'app. Confetti +<br>haptic + son. Impossible d'oublier.|Critique J7+|



|**Feature MVP**|**Justification détaillée**|**Impact**<br>**rétention**|
|---|---|---|
|Heatmap de consistance (calendrier annuel)|Le 'streak shame' : peur de briser une série de jours<br>consécutifs = mécanisme de rétention puissant.|Fort J14+|
|Stats globales lifetime|Fierté et sentiment d'accomplissement. 'Tu as soulevé<br>500,000 kg en 3 mois'.|Fort J30+|
|Profil public (pseudo, photo, stats)|Base du social graph. Sans profil, pas de social.|Critique J1|
|Suivre des utilisateurs (follow system)|Crée le feed social. Sans follows, pas de feed. Sans feed,<br>pas de social.|Critique J3+|
|Feed social (workouts des abonnés)|Voir ses amis s'entraîner = motivation externe. 'Massa<br>vient de soulever 120kg'.|Fort J3-J7|
|Stories (photo + stats overlay auto)|Engagement quotidien. 24h = urgence de revenir voir.<br>Partage viral sur WhatsApp/Instagram.|Fort J3-J7|
|Réactions emojis sur stories|Interaction légère (1 tap). Crée le lien social sans<br>modération complexe.|Modéré|
|Page Discover (feed public communauté)|Découverte de nouveaux users, contenu inspirant,<br>viralité. Trending + Recent.|Fort J7+|
|Post public (photo + légende)|Contenu permanent sur Discover. L'user veut montrer sa<br>progression.|Fort J7+|
|Commentaires publics sur posts Discover|Engagement communautaire. Fil de discussion autour<br>d'un PR ou d'une transformation.|Modéré|
|Signalement (post, commentaire, profil)|Modération basique dès le MVP. Sans ça, le Discover<br>devient toxique rapidement.|Critique<br>(sécurité)|
|Offline-first complet (WatermelonDB)|Critique pour l'Afrique. Connexion coupée = aucune perte<br>de données. Sync automatique au retour.|Critique J1|
|Data Saver mode (GIFs→JPG en 3G)|Respecter le budget data de l'utilisateur africain = trust =<br>rétention.|Fort (Afrique)|
|Dark mode natif (défaut)|Culture salle de sport. Réduit fatigue oculaire. Standard<br>2025.|Modéré J1|
|Multi-langue FR / EN|FR pour Afrique francophone + diaspora Europe. EN pour<br>le reste.|Critique J1|
|Unités kg / lbs switchable|Europe et US utilisent lbs. Afrique et France utilisent kg.|Modéré|
|Push notifications (rappel séance, PR ami)|Re-engagement passif. 'Tu n'as pas encore fait ta séance<br>aujourd'hui'.|Fort J7+|
|Indicateur sync offline (icône nuage)|L'user doit savoir que ses données sont sauvegardées<br>même hors ligne. Confiance = rétention.|Fort (Afrique)|



## **Features exclues du MVP (V2+)** 

|**Feature**|**Raison d'exclusion**|**Version**|
|---|---|---|
|Nutrition complète (recherche +<br>calcul)|Complexité d'import du dataset alimentaire + UI. Pas core<br>de la rétention J7.|V2|
|Scan barcode nutrition|Dépend du module caméra + base Open Food Facts —<br>ajout de complexité.|V2|
|Coach Mode & Marketplace|Requiert système paiement (PawaPay/Stripe webhooks) +<br>vérification coach + UI builder programmes.|V2|
|Monthly Recap story animée|Nice-to-have. Rétention directe sur J7 non démontrée.|V2|
|Import CSV (Hevy, Strong)|Utile pour la migration mais pas pour les nouveaux users<br>natifs.|V2|
|Export PDF stats|Feature de reporting, pas de rétention directe.|V2|
|Progress photos (before/after)|Stockage élevé, UI de comparaison complexe.|V2|
|Bodyweight tracking|Secondaire vs le workout tracking. Le formulaire<br>d'onboarding capture le poids initial.|V2|
|Apple Health / Google Fit sync|Complexité technique des Health APIs iOS/Android. Pas<br>bloquant au lancement.|V2|
|Widgets iOS / Android|Bonus de confort, pas critique à l'adoption initiale.|V2|
|Leaderboard entre amis|Nécessite une masse critique d'utilisateurs d'abord.|V2|
|Défis / Challenges|Feature avancée de gamification. Ajouter après validation<br>du core social.|V2|
|Stories vidéo (15-60 sec)|Upload vidéo = infrastructure complexe (transcoding, CDN<br>coût élevé).|V2|
|Ma Salle (feed local gym)|Nécessite géolocalisation + masse critique de users par<br>gym.|V2|
|Collections / Saves Discover|Feature de confort, pas de rétention directe en J7.|V2|
|DMs généraux|Les DMs comme réponse à story suffisent pour le MVP<br>social.|V2|



> **08 GESTION DES RISQUES** 

Risques identifiés, corrections planifiées, anticipation avant le lancement. 

|**Risque**|**Probabil**<br>**ité**|**Impac**<br>**t**|**Correction / Mitigation**|
|---|---|---|---|
|Fragmentation Android<br>— téléphones bas de<br>gamme (peu de RAM,<br>vieux CPU)|Élevée<br>(Afrique)|Fort|Bundle size < 30MB. GIFs chargés lazy (pas au démarrage). Images<br>WebP à la place de PNG. Éviter les animations lourdes sur les listes<br>longues. Tester sur Samsung A15, Tecno Spark.|
|Conflits de sync offline<br>(user logue sur 2<br>appareils sans internet)|Moyenne|Moye<br>n|Stratégie Last Write Wins (updated_at le plus récent gagne). local_id<br>unique = UPSERT PostgreSQL sans collision. Tests d'intégration dédiés à<br>ce cas.|
|Toxicité / spam sur<br>Discover|Élevée<br>(long<br>terme)|Fort|Bouton Signaler dès la V1. Edge Function filtre mots-clés injurieux. Block<br>utilisateur. Revue manuelle des signalements. Bannissement automatique<br>après X signalements.|
|Échecs paiements<br>Mobile Money<br>(PENDING interminable)|Élevée<br>(Afrique)|Fort|Status PENDING visible dans 'Mes paiements'. Webhook idempotent<br>(ignore les doublons). Support email pré-rempli avec transaction ID.<br>Expiration auto après 30min si pas de confirmation.|
|Coût Supabase Storage<br>(GIFs exercices)|Moyenne|Moye<br>n|500 GIFs × 500KB moy = 250MB. Supabase Free = 1GB inclus. En V2 :<br>compression WebP, Data Saver livrant JPG à la place.|
|Acquisition d'users<br>(chicken-and-egg social)|Élevée|Fort|Lancement avec un groupe de beta users (coaches Douala + leurs clients).<br>Chaque coach = 10-50 clients potentiels. WhatsApp share = canal<br>d'acquisition gratuit.|
|Violation de license<br>exercices dataset|Faible|Critiqu<br>e|Utiliser uniquement ExerciseDB Pro (droits commerciaux inclus dans<br>l'achat). Vérifier la license avant l'import.|
|Performance feed<br>Discover sur large<br>volume|Faible<br>(MVP)|Moye<br>n|Index score + created_at sur posts. Pagination (20 posts max par page).<br>Redis cache des 100 top trending posts (TTL 1h).|



> **09 ROADMAP** 

3 phases de développement — de la configuration initiale au lancement commercial. 

## **Phase 1 — MVP (Semaines 1-8)** — ⛔ ROADMAP PÉRIMÉE : SECTION 24 FAIT FOI
> ⚠️ Cette roadmap (8 semaines, Discover S7, nutrition S9-10, paiements
> S13-14) est REMPLACÉE par la SECTION 24 (MVP S1-S12 sans Discover,
> billing = Phase 9 ROADMAP.md, nutrition hors scope). Ne pas l'utiliser.


|**Semai**<br>**ne**|**Livrables détaillés**|
|---|---|
|S1|Setup projet Expo + Supabase + Render. Configuration WatermelonDB. Auth (email, Google, Apple). Écran choix de<br>langue. Onboarding (objectif, niveau, split).|
|S2|Navigation 5 onglets. Profil user basique. Bibliothèque exercices (import dataset + upload GIFs Supabase Storage).<br>Exercice custom.|
|S3|Workout logger : sélection exercices, ajout sets, autofill, timer de repos, types de sets. WatermelonDB local complet.|
|S4|Templates & splits. Fin de séance (résumé volume). Historique séances. Sync WatermelonDB→Supabase.<br>Indicateur offline.|
|S5|Progress : graphes Victory Native XL, détection PR, célébration confetti, heatmap, stats lifetime. Bodyweight<br>basique.|
|S6|Social : follow system, feed abonnés, stories (photo + stats overlay), réactions emojis, DM basique.|
|S7|Discover : feed public, trending score, posts publics, commentaires, signalement, Data Saver mode.|
|S8|Push notifications. Tests end-to-end. Fix bugs critiques. Optimisation performance Android. Soumission TestFlight<br>(iOS) + APK beta.|



## **Phase 2 — Croissance (Semaines 9-16)** 

|**Semaine**|**Livrables**|
|---|---|
|S9-S10|Nutrition : import Open Food Facts (5000 aliments), recherche full-text, calcul par grammes, scan barcode,<br>aliment custom, dashboard macros, objectif eau.|
|S11-S12|Coach Mode : profil coach vérifié, builder de programmes, vente, suivi clients, messagerie coach-client.|
|S13-S14|Paiements : intégration PawaPay (XAF, vente web lyxo.app/plus), Stripe/RevenueCat (EUR/USD), webhooks, page 'Mes paiements', support<br>email.|
|S15-S16|Monthly Recap story animée. Stories vidéo. Import CSV. Widgets iOS + Android. Ma Salle (V2 géo).|



## **Phase 3 — Scale & Monétisation (Semaines 17+)** 

- **Expansion anglophone** — Nigeria, Ghana, Kenya. Traduction EN complète vérifiée. 

- **Partenariats gyms** — LYXO comme app officielle de tracking pour des salles partenaires au Cameroun et en Côte d'Ivoire. 

- **Programme d'affiliation coachs** — referral system pour recruter les meilleurs coachs. 

- **Leaderboard entre amis** — classement hebdo sur volume total. 

- **Défis / Challenges** — 30 days squat challenge, challenge volume mensuel entre amis. 

- **Dashboard web coach** — interface web pour les coachs uniquement (pas de tracker web pour les users). 

> **01 GO-TO-MARKET — STRATÉGIE COACH 0** 

Les coachs sont ton canal d'acquisition principal. Chaque coach = 20 à 50 users d'un coup. 

## **Pourquoi les coachs d'abord** 

Une app sociale sans users = déserte. Le piège du chicken-and-egg. La solution : ne pas cibler les users directement au lancement — cibler les coachs. Un coach qui adopte LYXO amène immédiatement tous ses clients. 20 coachs actifs = 400 à 1000 users dès le jour 1. 

## **Profil du coach cible — Micro-influenceur de salle** 

Ne pas chercher les coachs certifiés internationaux avec 100k abonnés. Chercher les coachs locaux avec 50 à 500 clients réels : 

- **Qui** — Coach salle de sport à Douala, Yaoundé, Abidjan, Dakar. 2-8 ans d'expérience. Gère ses clients sur WhatsApp aujourd'hui. 

- **Problème actuel** — Messages perdus dans les groupes WhatsApp, impossible de suivre 20 clients en même temps, paiements oubliés, aucun outil professionnel. 

- **Ce qu'il veut** — Être pris au sérieux, gagner du temps, gagner plus d'argent sans chercher de nouveaux clients. 

- **Comment le trouver** — Instagram local (hashtags #coach237, #fitnessDouala), salles de sport partenaires, bouche-à-oreille entre coachs. 

## **Kit de Démarrage Coach — Contenu** 

Un PDF d'une page + une vidéo de 2 minutes maximum. Objectif : convaincre un coach en 5 minutes sans démonstration technique. Le coach doit comprendre immédiatement ce qu'il gagne. 

|**Élément du Kit**|**Contenu détaillé**|**Format**|
|---|---|---|
|Page 1 — Problème|Avant LYXO : messages perdus WhatsApp, impossible suivre 20<br>clients, paiements oubliés. Avec LYXO : logs clients en temps réel,<br>vente programmes en 1 clic, paiement Mobile Money auto.|PDF 1 page|
|Page 2 — Commission|Tu gardes 85% de chaque vente. LYXO prend 15%. Sur un<br>programme à 10,000 FCFA vendu à 30 clients = 255,000 FCFA<br>pour toi. Zéro FCFA pour commencer.|PDF 1 page|
|Vidéo 2 min|Screen recording : créer un programme en 60 secondes, partager le<br>lien WhatsApp, voir un client logger sa séance en temps réel.|MP4 / Lien YouTube|
|Lien deep link|lyxo.app/coach→Page d'inscription coach directement. Pré-rempli<br>avec le code de parrainage du coach qui a référé.|URL Branch.io|
|Template WhatsApp|Message pré-rédigé pour que le coach partage LYXO à ses clients :<br>texte + lien deep link + argument clé.|Texte copiable|



## **Modèle de commission — Détail** 

|**Prix programme**|**Part coach (85%)**|**Part LYXO (15%)**|**Exemple volume mensuel**|
|---|---|---|---|
|5,000 FCFA|4,250 FCFA|750 FCFA|30 ventes = 127,500 FCFA coach / 22,500 FCFA<br>LYXO|
|10,000 FCFA|8,500 FCFA|1,500 FCFA|30 ventes = 255,000 FCFA coach / 45,000 FCFA<br>LYXO|
|25,000 FCFA|21,250 FCFA|3,750 FCFA|20 ventes = 425,000 FCFA coach / 75,000 FCFA<br>LYXO|
|50 EUR|42.50 EUR|7.50 EUR|20 ventes = 850 EUR coach / 150 EUR LYXO|



## **Stratégie d'expansion mondiale via les coachs** 

|**Phase**|**Marché cible**|**Langue**|**Canal coach**|**Objectif users**|
|---|---|---|---|---|
|Phase 1|Cameroun, CI, Sénégal|FR|Instagram local, salles partenaires|5,000 users actifs|
|Phase 2|Diaspora FR/BE/CH/CA|FR + EN|Réseaux diaspora, associations<br>sportives|20,000 users actifs|
|Phase 3|Nigeria, Ghana, Kenya|EN|Fitness influencers locaux|100,000 users actifs|
|Phase 4|Brésil, Inde, Monde|PT + EN|App Store organic + referral coach|500,000 users actifs|



## **Règle Go-to-Market non négociable** 

Ne pas lancer l'app publiquement avant d'avoir 10 coachs actifs avec leurs clients. 

Lancement privé beta : 10 coachs x 20 clients minimum = 200 users avant le jour J public. Ces 200 users créent le contenu initial du Discover et du feed social. 

Sans ce contenu initial, un nouveau user ouvre l'app, voit un Discover vide, désinstalle. 

> **01 DEFERRED DEEP LINKS — STRATÉGIE VIRALE 1** 

Chaque lien partagé sur WhatsApp doit transformer un clic en utilisateur inscrit. 

## **Qu'est-ce qu'un Deferred Deep Link** 

Un deep link classique ouvre un contenu précis dans l'app si elle est installée. Un deferred deep link fait la même chose MÊME si l'app n'est pas encore installée : il mémorise la destination, envoie l'user sur le Play Store, attend l'installation, puis ouvre directement le bon contenu au premier lancement. 

|**Scénario**|**Sans Deferred Deep Link**|**Avec Deferred Deep Link**|
|---|---|---|
|User A a l'app|Ouvre le contenu directement|Ouvre le contenu directement|
|User B n'a pas l'app|Lien brise — page web ou erreur|Play Store→Installe→Ouvre le contenu exact|
|Taux de conversion|Faible — friction maximale|Élevé — zero friction post-install|
|Tracking|Impossible de savoir qui a partagé|Coach A a amené 23 nouveaux users ce mois|



## **Contenu partageable avec deep link** 

|**Contenu**|**URL Deep Link**|**Message WhatsApp type**|**Déclencheur**|
|---|---|---|---|
|Programme coach|lyxo.app/p/{id}|Voici mon programme PPL 12 semaines.<br>Suis-le directement sur LYXO (gratuit)|Bouton 'Partager sur<br>WhatsApp' dans Coach<br>Mode|
|Profil utilisateur|lyxo.app/u/{username}|Regarde ma progression sur LYXO !|Bouton 'Partager mon<br>profil'|
|PR célébration|lyxo.app/pr/{id}|Je viens de soulever 100kg au bench ! Mon<br>nouveau record sur LYXO|Automatique après<br>chaque PR|
|Post Discover|lyxo.app/post/{id}|Regarde cette transformation incroyable|Bouton share sur<br>chaque post|
|Invitation salle|lyxo.app/gym/{id}|Rejoins notre salle sur LYXO pour voir nos<br>performances|V2 - Ma Salle|



## **Librairie : Branch.io** 

Branch.io est le standard industrie pour les deferred deep links mobile. Gratuit jusqu'à 10,000 clicks/mois. SDK React Native officiel maintenu. Dashboard de tracking intégré (qui a partagé quoi, combien d'installs générées). 

```
// lib/deeplink.ts — Créer un deep link pour un programme coach
import Branch from 'react-native-branch'
export async function createProgramLink(programId: string, coachName: string) {
const buo = await Branch.createBranchUniversalObject(`program/${programId}`, {
title: `Programme de ${coachName}`,
```

```
contentMetadata: {
```

`customMetadata: { program_id: programId, type: 'coach_program' } } }) const { url } = await buo.generateShortUrl({ feature: 'whatsapp_share', channel: 'coach' }) return url //` → `https://lyxo.app/p/abc123 } // Quand l'app s'ouvre depuis un deep link (même après install) export function handleDeepLink(url: string) {` 

```
const { path } = Linking.parse(url)
```

```
if (path?.startsWith('p/')) router.push(`/program/${path.split('/')[1]}`)
if (path?.startsWith('u/')) router.push(`/profile/${path.split('/')[1]}`)
if (path?.startsWith('pr/')) router.push(`/pr/${path.split('/')[1]}`)
```

```
if (path?.startsWith('post/')) router.push(`/post/${path.split('/')[1]}`)
}
```

## **Flux complet — Coach partage sur WhatsApp** 

```
ÉTAPE 1 — Coach crée son programme dans LYXO
```

→ `Bouton 'Partager sur WhatsApp'` 

→ `Branch.io génère : https://lyxo.app/p/abc123` 

```
ÉTAPE 2 — Message WhatsApp envoyé automatiquement :
```

```
'Mon programme PPL 12 semaines est sur LYXO (gratuit).
```

```
Télécharge l'app et suis mon programme : https://lyxo.app/p/abc123'
```

```
ÉTAPE 3A — Destinataire a LYXO installé :
```

→ `Tap sur le lien` 

→ `App s'ouvre directement sur le programme` 

→ `Bouton 'Suivre ce programme'` I 

```
ÉTAPE 3B — Destinataire n'a PAS LYXO :
```

→ `Tap sur le lien` 

- → `Branch.io détecte : pas d'app installée` 

→ `Redirige vers Play Store` 

→ `User installe LYXO` 

→ `Premier lancement` → `Branch.io récupère le contexte` 

→ `App ouvre directement le programme abc123` 

→ `Bouton 'Suivre ce programme'` I 

```
RÉSULTAT : Zéro friction. Le user atterrit toujours sur le bon contenu.
```

```
TRACKING : Branch dashboard montre que Coach X a généré 23 installs ce mois.
```

> **01 CACHE SOCIAL & RÈGLES DE DÉVELOPPEMENT 2** 

Gestion du cache pour Android bas de gamme + règles de priorité pour le développement solo. 

## **Les 4 États de l'Indicateur Réseau (Icône Nuage)** 

L'icône nuage dans la barre de navigation a 4 états distincts. L'utilisateur comprend toujours où en sont ses données sans message technique. 

|**État**|**Icône**|**Couleur**|**Signification**|**Quand**|
|---|---|---|---|---|
|Synchronisé|Nuage vert plein|#2DC653|Tout est à jour. Toutes les données locales<br>sont synced avec Supabase.|Connecté + sync<br>terminée|
|Sync en cours|Nuage + éclair|#F4A261|Sync en cours en arrière-plan. Ne pas<br>couper le réseau.|Pendant la<br>synchronisation|
|Hors ligne frais|Nuage gris plein|#888888|Hors ligne mais le cache social date de<br>moins d'1 heure. Feed fiable.|Offline, cache <<br>1h|
|Hors ligne périmé|Nuage gris hachuré|#555555|Hors ligne et cache > 1h. Le feed Discover<br>peut ne pas être à jour.|Offline, cache ><br>1h|



## **Banner Offline sur le Feed Social** 

Quand l'user ouvre Discover hors ligne avec un cache > 1h, un banner discret s'affiche en haut du feed. Pas un message d'erreur — juste une information. L'user continue de scroller normalement. 

## IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII 

I II `Feed hors ligne · Mis à jour il y a 2h` I IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII 

← `Fond #1E1E1E, bordure gauche #555555, texte 12px Inter` 

← `Affiché seulement si hors ligne ET cache > 1 heure` 

← `Disparaît automatiquement dès que la connexion revient` 

## **Message Onboarding Offline — Premier Lancement** 

S'affiche une seule fois après le choix de langue, avant l'inscription. Stocké dans AsyncStorage (onboarding_offline_shown: true) pour ne jamais réapparaître. 

## IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII 

I II I 

I I 

I `LYXO fonctionne partout` I 

I I 

I `Même sans réseau, tes séances` I 

I `sont sauvegardées sur ton` I I `téléphone.` I I I 

I `Dès que tu as du signal, tout` I 

I `se met à jour automatiquement.` I 

I I 

I `Tu ne perdras jamais une séance.` I 

I I 

I `[ Commencer` → `]` I 

IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII 

## **Limites de Cache — Protection Android Bas de Gamme** 

Les appareils Android d'entrée de gamme (Tecno Spark, Samsung A15, Infinix) ont souvent 32GB de stockage avec peu d'espace libre. Ces limites sont non négociables pour protéger l'expérience utilisateur. 

|**Type de cache**|**Limite max**|**Expiration auto**|**Stratégie si dépassement**|
|---|---|---|---|
|Posts Discover|50 posts|24 heures|Supprimer les plus anciens (LRU)|
|Stories|30 stories|24 heures|Supprimer les expirées en premier|
|Commentaires|100<br>commentaires|24 heures|Supprimer les plus anciens|
|Images / médias sociaux|100 MB total|48 heures|LRU — supprimer les moins vus|
|GIFs exercices (Data<br>Saver)|JPG statiques<br>uniquement|Jamais (données<br>statiques)|Pas de nettoyage nécessaire|
|Données workout|ILLIMITÉ|JAMAIS|Données utilisateur critiques — jamais supprimées|
|Données nutrition|ILLIMITÉ|JAMAIS|Données utilisateur critiques — jamais supprimées|



```
// config/cache-limits.ts — Règles de cache non modifiables
export const CACHE_LIMITS = {
MAX_CACHED_POSTS: 50,
MAX_CACHED_STORIES: 30,
MAX_CACHED_COMMENTS: 100,
MAX_MEDIA_CACHE_MB: 100,
STORY_EXPIRY_MS: 86_400_000, // 24h
POST_EXPIRY_MS: 86_400_000, // 24h
MEDIA_EXPIRY_MS: 172_800_000, // 48h
WORKOUT_DATA: 'NEVER_DELETE',
NUTRITION_DATA: 'NEVER_DELETE',
}
```

```
// Appelé au lancement de l'app + cron toutes les 12h
async function cleanExpiredCache(db: Database) {
const now = Date.now()
```

```
// Supprimer stories expirées
const expired = await db.get('cached_stories')
.query(Q.where('expires_at', Q.lt(now))).fetch()
await db.write(async () => {
for (const s of expired) await s.destroyPermanently()
```

```
})
// Supprimer médias > 48h + vérifier quota 100MB
await pruneMediaCache(CACHE_LIMITS.MAX_MEDIA_CACHE_MB)
}
```

## **Timeout Paiement Mobile Money — UX** 

IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII 

I I `Paiement en attente` I 

I I 

I `Nous attendons la confirmation de` I 

I `ton opérateur Mobile Money.` I 

I `Cela peut prendre 2 à 5 minutes.` I 

I I 

I IIIIIIIIIIIIIIIIIIIIIII `4:32` I 

I ↑ `Timer 5min` I 

I I 

I `Si rien n'arrive, contacte-nous :` I 

I `support@lyxo.app` I I I 

I `Ton ID transaction : #KL-2026-00847` I 

I `[ Copier l'ID ]` I 

I I 

I `[ Vérifier plus tard ]` I 

IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII 

- ← `Timer compte jusqu'à 5 minutes` 

- ← `Après expiration : message avec ID pré-copié` 

- ← `Webhook backend idempotent (ignore les doublons)` 

## **Règles de Priorité de Développement — Solo Dev** 

Seul, tu vas vouloir tout coder en même temps. C'est le chemin vers le burnout et un produit médiocre. Ces règles de priorité sont non négociables. Si une feature Niveau 1 n'est pas parfaite, on ne touche pas au Niveau 2. 

|**Niveau**|**Features**|**Règle**|**Si en retard**|
|---|---|---|---|
|NIVEAU 1<br>Jamais<br>sacrifié|Workout logger (sets/reps/poids)<br>Autofill + timer de repos Sync<br>WatermelonDB↔Supabase PRs<br>+ graphes de progression<br>Offline-first parfait|Ces features doivent fonctionner<br>mieux que Strong en offline avant de<br>passer à la suite.|Couper tout le reste.<br>Perfectionner le Niveau 1.|
|NIVEAU 2<br>Sacrifié si en<br>retard|Stories (photo seulement) Feed<br>social basique Profil public Suivi<br>des abonnés|Implémenté seulement si Niveau 1 est<br>complet et testé sur Pixel 8 +<br>Samsung A15.|Reporter à S9. Livrer le<br>MVP sans social complet.|
|NIVEAU 3<br>Reporté en V2<br>si besoin|Discover complet Commentaires<br>DMs généraux Signalement Data<br>Saver mode|Nice-to-have pour le MVP. Pas de<br>rétention J7 directement prouvée.|V2 automatiquement.<br>Aucune pression.|



## **Règle d'or du développement solo LYXO** 

Un tracker de musculation qui fonctionne parfaitement offline = utilisateurs retenus. 

Un social parfait sans tracker fiable = désinstallation en 24h. 

Priorité absolue : logger un set en moins de 3 secondes, même sans réseau, même sur un Tecno Spark. Tout le reste est secondaire. 

> **01 STRATÉGIE DE MONÉTISATION MONDIALE 3** 

Un modèle freemium qui fonctionne en Afrique, en Europe et en Amérique sans dénaturer l'avantage gratuit. 

## **Principe directeur** 

LYXO reste gratuit à vie pour toutes les fonctionnalités essentielles, partout dans le monde. La monétisation cible deux profils distincts : les power users prêts à payer pour des outils avancés (LYXO+), et les coachs professionnels prêts à payer pour des outils de gestion business (Coach Pro). Le tracker de musculation, le social complet et la nutrition de base ne sont JAMAIS limités. 

## **Niveau 1 — Gratuit à vie (partout dans le monde)** 

|**Fonctionnalité**|**Limite gratuite**|
|---|---|
|Tracker de séances (sets, reps, poids)|Illimité|
|Templates et splits|Illimité|
|Historique des séances|90 jours visibles|
|Stats de base + détection PR|Illimité|
|Social complet (Stories, Discover, follow)|Illimité|
|Offline-first|Complet, aucune restriction|
|Nutrition (recherche + grammes)|Illimité|



**Niveau 2 — LYXO+ (abonnement individuel, multi-devise)** 

|**Fonctionnalité LYXO+**|**Valeur pour l'utilisateur**|
|---|---|
|Historique illimité (au-delà de 90 jours)|Voir toute sa progression depuis le premier jour|
|Cloud backup multi-device automatique|Ne jamais perdre ses données, changer de téléphone sans<br>souci|
|Analytics avancés (1RM trends, comparaisons longue durée)|Comprendre sa progression sur plusieurs mois/années|
|Export PDF / CSV|Partager ou archiver ses données hors de l'app|
|Apple Health / Google Fit sync|Centraliser ses données santé|
|Badge Supporter sur le profil|Statut social, reconnaissance dans la communauté|



## **Pricing localisé — Pas un prix unique converti** 

Un abonnement à prix fixe en euros est inadapté mondialement. Un prix raisonnable en France est inaccessible au Cameroun ; un prix adapté à l'Afrique est dérisoire aux États-Unis. LYXO+ utilise un pricing localisé par marché. 

|**Marché**|**Prix mensuel suggéré**|**Logique**|
|---|---|---|
|Afrique francophone (Cameroun, CI,<br>Sénégal)|1 500 - 2 000 FCFA (~2,5-3€)|Adapté au pouvoir d'achat local|
|France / Belgique / Suisse|4,99 €|Standard apps fitness sur le marché EU|
|USA / Canada|$5.99|Standard marché nord-américain|
|Reste du monde|Purchasing Power Parity (PPP)<br>automatique|Géré par App Store / Play Store / Stripe selon<br>le pays|



## **Trois systèmes de paiement à faire cohabiter** 

|**Marché**|**Méthode dominante**|**Récurrence automatique ?**|
|---|---|---|
|Afrique francophone|Mobile Money (PawaPay)|Non — paiement manuel<br>uniquement|
|Europe / USA / Canada|Carte bancaire (Stripe, Apple Pay, Google Pay)|Oui — prélèvement automatique<br>natif|
|Reste du monde|Variable (PIX Brésil, UPI Inde, etc.)|Variable selon le pays|



## **Solution technique pour la cohabitation** 

Champ renewal_type sur chaque abonnement : 'auto' (Stripe/App Store/Play Store) ou 'manual' (Mobile Money). 

Si auto : l'app affiche 'Renouvellement automatique le [date]'. 

Si manual : l'app affiche 'Ton abonnement expire le [date] — renouveler maintenant' + rappel push 3 jours avant. 

Le statut premium expire automatiquement si non renouvelé — aucune action manuelle requise côté backend. 

## **Routage du paiement par pays — Détail complet** 

Le pays choisi par l'utilisateur à l'inscription détermine automatiquement quelles méthodes de paiement lui sont proposées au moment de l'achat. Un utilisateur ne voit jamais une option de paiement qui ne fonctionne pas pour lui — zéro confusion, zéro tentative de paiement vouée à l'échec. 

## **Mapping pays** → **moyens de paiement** 

|**Pays**|**Méthodes affichées**|
|---|---|
|Cameroun (CM)|MTN Mobile Money, Orange Money|
|Côte d'Ivoire (CI)|Orange Money, MTN Mobile Money, Wave, Moov Money|
|Sénégal (SN)|Orange Money, Wave, Free Money|
|Mali (ML) / Burkina Faso (BF)|Orange Money, Moov Money|
|Bénin (BJ) / Togo (TG)|MTN Mobile Money, Moov Money|
|Ghana (GH)|MTN Mobile Money, Vodafone Cash, Airtel Money|



|**Pays**|**Méthodes affichées**|
|---|---|
|Nigeria (NG)|Paystack (carte), virement bancaire, USSD|
|Kenya (KE)|M-Pesa|
|France / Europe / USA / Canada / Reste du<br>monde|Carte bancaire, Apple Pay, Google Pay (Stripe)|



## **Agrégateurs — Une intégration, plusieurs opérateurs** 

Plutôt que d'intégrer chaque opérateur Mobile Money séparément, LYXO passe par des agrégateurs qui routent automatiquement vers le bon opérateur selon le choix de l'utilisateur dans leur interface. 

|**Agrégateur**|**Pays couverts**|**Opérateurs inclus**|
|---|---|---|
|PawaPay|CM, CI, SN, ML, BF, TG, BJ|MTN MoMo, Orange Money, Wave|
|PawaPay|CI, Sénégal, Mali, Burkina, Togo,<br>Bénin|Orange Money, MTN MoMo, Wave, Moov Money, Free<br>Money|
|Flutterwave|Nigeria, Ghana, Kenya + 30 pays<br>africains|Mobile Money, cartes, virement, USSD|
|Stripe|France, USA, Canada, Europe + 40+<br>pays|Carte bancaire, Apple Pay, Google Pay|



PawaPay couvre déjà la majorité de l'Afrique francophone (CI, Sénégal, Mali, Burkina, Togo, Bénin) en une seule intégration — pas besoin de gérer chaque opérateur séparément dans le code. 

## **Flux UX — Ce que voit l'utilisateur selon son pays** 

```
CAS 1 — Utilisateur au Cameroun :
Passer à LYXO+ — 1 500 FCFA / mois
```

```
[ MTN Mobile Money ] [ Orange Money ]
```

```
CAS 2 — Utilisateur en Côte d'Ivoire :
Passer à LYXO+ — 1 500 FCFA / mois
```

```
[ Orange Money ] [ MTN Mobile Money ] [ Wave ] [ Moov Money ]
```

```
CAS 3 — Utilisateur en France ou aux USA :
Passer à LYXO+ — 4,99 € / mois
```

```
[ Carte bancaire ] [ Apple Pay ] [ Google Pay ]
```

## **Implémentation technique** 

```
// config/payment-methods-by-country.ts
```

```
export const PAYMENT_METHODS_BY_COUNTRY = {
```

```
CM: ['mtn_momo', 'orange_money'],
```

```
CI: ['orange_money', 'mtn_momo', 'wave', 'moov_money'],
```

```
SN: ['orange_money', 'wave', 'free_money'],
```

```
ML: ['orange_money', 'moov_money'],
BF: ['orange_money', 'moov_money'],
```

```
BJ: ['mtn_momo', 'moov_money'],
TG: ['mtn_momo', 'moov_money'],
```

```
GH: ['mtn_momo', 'vodafone_cash', 'airtel_money'],
```

```
NG: ['paystack_card', 'bank_transfer', 'ussd'],
```

```
KE: ['mpesa'],
```

```
DEFAULT: ['stripe_card', 'apple_pay', 'google_pay'],
```

```
}
```

```
export function getPaymentMethodsForCountry(countryCode) {
```

```
return PAYMENT_METHODS_BY_COUNTRY[countryCode] || PAYMENT_METHODS_BY_COUNTRY.DEFAULT
```

```
}
```

```
// Au moment du paiement
```

```
async function initiatePayment(method, price) {
```

```
if (['stripe_card','apple_pay','google_pay'].includes(method)) {
```

```
await RevenueCat.purchaseSubscription('lyxo_plus_monthly')
```

```
} else {
```

```
const payment = await initiatePawaPayPayment({
```

```
amount: price.amount, currency: price.currency,
```

```
method: method, userId: user.id,
```

```
})
```

```
navigateToScreen('PaymentPending', { transactionId: payment.id })
```

```
}
}
```

## **Schéma DB mis à jour** 

```
alter table profiles add column country text; -- Code ISO (CM, CI, FR, US...)
```

```
alter table payments add column payment_method text
```

```
check (payment_method in (
```

```
'mtn_momo','orange_money','wave','moov_money','free_money',
```

```
'vodafone_cash','airtel_money','mpesa','paystack_card',
```

```
'stripe_card','apple_pay','google_pay'
));
```

## **Points de vigilance — Reality check** 

|**Risque**|**Détail**|**Mitigation**|
|---|---|---|
|Délais PENDING Mobile<br>Money|Contrairement à la carte bancaire, la<br>confirmation peut prendre 2-5 minutes voire<br>plus.|Interface dédiée expliquant clairement<br>d'attendre sans fermer l'app + timer 5min +<br>ID transaction copiable (déjà couvert<br>section 12).|
|Frais de transaction des<br>agrégateurs|Chaque agrégateur prélève une commission<br>(1-3% selon le fournisseur et le pays).|Intégrer ces frais dans le calcul du prix<br>d'abonnement local dès la fixation du<br>pricing par marché.|
|Géolocalisation faussée<br>par VPN|Se fier uniquement à l'IP pour déterminer le pays<br>de paiement peut afficher les mauvaises<br>méthodes si l'utilisateur utilise un VPN.|Toujours faire confirmer le pays par<br>l'utilisateur à l'étape de paiement, ne<br>jamais se fier uniquement à la détection<br>automatique IP.|



## **Pourquoi cette approche est la bonne stratégie** 

Réduction de la friction : proposer MTN MoMo, Orange Money ou Wave directement élimine la barrière psychologique de la carte bancaire, frein majeur dans de nombreuses régions d'Afrique. 

Expérience localisée : un utilisateur au Sénégal ou en Côte d'Ivoire qui voit 'Wave' affiché se sent immédiatement en confiance et en terrain connu. 

Flexibilité globale : conserver la carte bancaire pour les utilisateurs hors zone Afrique garantit qu'aucune opportunité de revenu mondiale n'est perdue, via les agrégateurs universels (Stripe). 

C'est ce type de détail qui sépare une application 'importée' d'une application 'taillée pour le marché local'. 

## **RevenueCat — Outil de gestion unifiée des abonnements** 

Plutôt que coder à la main la gestion des abonnements sur 3 plateformes différentes, RevenueCat unifie App Store, Play Store et Stripe web dans un seul SDK et un seul dashboard. Gratuit jusqu'à $2,500 MRR — largement suffisant pour le lancement de LYXO+. 

|**Plateforme**|**Géré par RevenueCat ?**|**Commission prélevée**|
|---|---|---|
|App Store (iOS)|Oui|15-30% Apple|
|Play Store (Android)|Oui|15-30% Google|
|Stripe (web checkout)|Oui|~2,9% Stripe uniquement|
|Mobile Money (PawaPay)|Non — vente web lyxo.app/plus|Commission PawaPay (~2-3,5%)|



## **Éviter la commission Apple/Google sur Android** 

Pour Android (priorité absolue de LYXO), proposer le paiement Stripe via web checkout en dehors du Play Store. 

C'est légal et pratiqué par Spotify, Netflix, et la majorité des apps d'abonnement majeures. 

Évite la commission de 15-30% prélevée par Google sur les achats in-app. 

Sur iOS, plus restrictif mais s'assouplit dans plusieurs juridictions (Union Européenne notamment). 

## **Niveau 3 — Coach Pro (B2B, partout dans le monde)** 

L'abonnement des coachs professionnels est souvent plus rentable que celui des utilisateurs finaux. Au lieu de faire payer l'athlète, LYXO fait payer le coach pour des outils de gestion avancés — l'app reste gratuite pour tous les athlètes, gratuite pour les coachs débutants (jusqu'à 5 clients), payante uniquement pour les coachs qui en tirent un vrai revenu. 

|**Fonctionnalité Coach Pro**|**Coach gratuit**|**Coach Pro**|
|---|---|---|
|Nombre de clients simultanés|5 maximum|Illimité|
|Analytics de revenus avancées|Basique|Complet (tendances, prévisions)|
|Branding personnalisé sur les programmes|Non|Oui (logo, couleurs)|
|Commission LYXO sur les ventes|15%|10% (au-delà d'un seuil de ventes<br>mensuel)|



|**Fonctionnalité Coach Pro**|**Coach gratuit**|**Coach Pro**|
|---|---|---|
|Prix|Gratuit|9,99 €/mois ou commission réduite<br>seule|



## **Synthèse du modèle de revenu** 

```
NIVEAU 1 — Gratuit à vie, partout :
```

```
Tracker illimité, templates illimités, historique 90j, social complet,
```

```
nutrition de base, offline-first complet
```

```
NIVEAU 2 — LYXO+ (athlètes power users) :
Historique illimité, cloud backup, analytics avancés, export, Health sync
Prix : 1500 FCFA / 4,99€ / $5.99 selon marché
Paiement : RevenueCat (stores + Stripe web) + flux manuel Mobile Money
```

```
NIVEAU 3 — Coach Pro (B2B) :
Clients illimités, analytics revenus, branding, commission réduite
Prix : 9,99€/mois OU commission seule (au choix du coach)
RÈGLE D'OR : Le MVP reste entièrement gratuit (aucun paywall actif en Phase 1). LYXO+ et Coach Pro arrivent
uniquement après preuve de rétention organique du tracker gratuit (Phase 2/3).
```

> **01 ARCHITECTURE FREEMIUM — IMPLÉMENTATION 4** 

Construire toutes les fonctionnalités en illimité maintenant, activer les limites plus tard sans réécrire le code. 

## **Le principe : construire sans limite, limiter après** 

Toutes les fonctionnalités de LYXO sont codées en illimité dès le MVP. Aucun système de paywall n'est développé en Phase 1. Les limites freemium arrivent en V2 sous forme d'une simple couche de vérification ajoutée par-dessus le code métier existant — pas une réécriture. C'est la méthode utilisée par Notion, Figma, Hevy et la quasi-totalité des apps freemium reconnues. 

## **Étape 1 — Aujourd'hui (MVP) : tout est illimité** 

```
// Aucune vérification de limite nulle part dans le MVP
async function createTemplate(userId, templateData) {
return await db.workouts.create({
user_id: userId, is_template: true, ...templateData
})
}
async function getWorkoutHistory(userId) {
return await db.workouts
.query(Q.where('user_id', userId))
.fetch() // Retourne TOUT l'historique, aucune limite
}
```

## **Étape 2 — V2 : une vérification ajoutée, le code métier ne change pas** 

```
async function createTemplate(userId, templateData) {
const user = await getUser(userId)
const limits = getLimitsFor(user)
if (!limits.UNLIMITED_TEMPLATES) {
const count = await countUserTemplates(userId)
if (count >= limits.MAX_TEMPLATES) {
throw new PaywallError('Limite atteinte', { upgrade_url: '/lyxo-plus' })
}
}
// Le reste du code est identique au MVP — aucune réécriture
return await db.workouts.create({
user_id: userId, is_template: true, ...templateData
})
}
```

## **Architecture centralisée — Un seul fichier de vérité** 

Plutôt que d'éparpiller des conditions is_premium partout dans le code, toutes les limites sont centralisées dans un seul fichier de configuration. Modifier une limite (90 jours → 60 jours) se fait en changeant une seule ligne, sans toucher au reste de l'application. 

```
// config/feature-limits.ts
export const FREE_LIMITS = {
HISTORY_DAYS: 90,
CLOUD_BACKUP: false,
ADVANCED_ANALYTICS: false,
EXPORT_PDF: false,
HEALTH_SYNC: false,
}
```

```
export const PREMIUM_LIMITS = {
HISTORY_DAYS: Infinity,
CLOUD_BACKUP: true,
ADVANCED_ANALYTICS: true,
EXPORT_PDF: true,
HEALTH_SYNC: true,
}
export function getLimitsFor(user: User) {
return hasActiveSubscription(user) || trialActive(user) ? PREMIUM_LIMITS : FREE_LIMITS  // statut DÉRIVÉ (§20.1), jamais une colonne
}
```

## **Schéma base de données — Une seule colonne suffit** 

```
-- SUPPRIMÉ (correction §20.1) : pas de colonne is_premium.
-- Le statut premium est dérivé de subscriptions + trial_expires_at (BILLING_FLOW §3).
```

```
alter table profiles add column premium_expires_at timestamptz;
```

```
alter table profiles add column premium_source text
```

```
check (premium_source in ('stripe','app_store','play_store','mobile_money', null));
alter table profiles add column renewal_type text
```

```
check (renewal_type in ('auto','manual', null));
```

Le statut premium est DÉRIVÉ à chaque vérification : existence d'une subscription active (current_period_end > now()) OU trial_expires_at > now() — jamais une colonne écrite (§20.1). Un abonnement Mobile Money expiré redevient automatiquement gratuit sans action manuelle. 

## **Règle critique — Masquer, ne jamais supprimer** 

Une limite freemium ne doit jamais détruire des données. Elle doit uniquement les masquer à l'affichage. Si un utilisateur gratuit repasse premium plus tard, tout son historique doit réapparaître instantanément. 

|**Approche**|**Exemple**|**Verdict**|
|---|---|---|
|Destructive (interdite)|Supprimer les séances de plus de 90 jours pour les users<br>gratuits|IJamais — perte de<br>données réelle et<br>irréversible|
|Masquage (correcte)|Filtrer la requête : where(started_at >= cutoffDate) pour les<br>users gratuits|ILa donnée existe<br>toujours, juste filtrée à<br>l'affichage|



## **Argument marketing intégré** 

Le masquage non-destructif devient un argument de vente naturel. 

Un utilisateur qui repasse à LYXO+ voit immédiatement : 'Bienvenue — ton historique complet est de retour.' 

Zéro friction technique, zéro perte de confiance, conversion plus naturelle. 

## **Roadmap d'implémentation** 

|**Phase**|**Action**|**Durée**|
|---|---|---|
|Phase 1 — MVP (S1-S12)|Tout développé en illimité. Seules les colonnes trial_used /<br>trial_expires_at / billing_region existent (§20.6) — aucune table billing, aucun statut vérifié.|Aucun coût<br>additionnel|
|Phase 2 — Activation monétisation<br>(mois 4-5)|Création de feature-limits.ts. Ajout de 5-6 vérifications<br>getLimitsFor() aux endroits stratégiques.|~1 semaine de dev|
|Phase 2 — Intégration paiements|Connexion RevenueCat (stores + Stripe web) + flux manuel<br>Mobile Money (PawaPay, vente web).|~2-3 semaines de dev|
|Phase 3 — Coach Pro|Ajout des limites côté coach (nombre de clients, branding,<br>commission réduite).|~1 semaine de dev|



**01 5** 

## **AUDIT DU PROTOTYPE STITCH V1** 

Premier prototype visuel généré sur stitch.withgoogle.com à partir du plan — 8 écrans audités et corrections spécifiées. 

## **Verdict global** 

Le prototype respecte fidèlement le système de design documenté : dark mode, rouge accent #E63946, typographie Inter bold pour les chiffres, indicateur de sync à 4 états. La cohérence visuelle est réelle et le DESIGN.md généré va même au-delà des attentes (thumb-zone, accessibilité daltonien sur l'icône sync). Cependant plusieurs problèmes d'UX et des écrans stratégiques manquants doivent être corrigés avant le développement, sous peine de coûter cher en rétention. 

## **Points forts confirmés** 

- **Cohérence visuelle réelle** — palette respectée sur les 8 écrans, Inter bold pour les chiffres, rouge réservé exclusivement aux CTA, exactement conforme au système de design du plan. 

- **Sync indicator bien implémenté** — icône nuage à 4 états visible et cohérente sur Dashboard, Séance et Profil, conforme à la section 12. 

- **Workout logger rapide** — clavier numérique custom en bas d'écran, timer de repos visible en permanence, structure conforme à la règle des 3 secondes par set. 

- **Discover différenciant** — stats overlay intégré directement dans le post visuel (220 KG, NOUVEAU PR), fidèle au concept de carte PR automatique du plan. 

- **Coach Dashboard crédible** — revenus, clients actifs, % de complétion par programme, bouton de relance sur client inactif : répond directement au besoin 'remplacer WhatsApp' du Go-to-Market. 

- **Nutrition fidèle au plan** — recherche + grammes sans IA, aliments africains représentés (Attiéké, Poulet braisé), conforme à la stratégie nutrition sans friction. 

## **Points faibles identifiés par écran** 

## **Home / Dashboard** 

- Le flux "Activité récente" mélange workout complété et PR d'un ami sans hiérarchie visuelle distincte — le PR, moment le plus émotionnel du plan, est sous-exploité. 

- Le bandeau "CONNECTÉ • SYNCHRONISATION EN TEMPS RÉEL" occupe une bande permanente même quand tout est synchronisé, alors que le plan prévoit un indicateur discret en état synced. 

## **Séance en cours** 

- Aucun swipe +2.5kg/+5kg visible sur les inputs de poids, alors que c'est une feature clé documentée pour accélérer la saisie. 

- Le clavier numérique occupe la moitié de l'écran : avec 4-5 sets sur un exercice, l'utilisateur devra scroller énormément pendant la séance, ce qui contredit la règle des 3 secondes par set. 

- Bouton "Terminer la séance" et "Ajouter un exercice" éloignés dans le flux, pas de sticky button visible. 

## **Progress** 

- La heatmap "Assiduité" n'a aucune légende de couleur — l'intensité du rouge ne représente rien d'explicite (volume ? présence ?). 

- Le bloc "Prochain Défi" n'affiche qu'un logo en fond, sans contenu réel (quel défi, quelle récompense) — ressemble à un encart vide. 

- Le schéma "Focus Musculaire" apparaît flouté/vide sur le prototype, signe que cette feature n'est pas encore conçue visuellement. 

## **Discover** 

- Aucune distinction visuelle claire entre Stories (24h, privé) et posts Discover (permanent, public) — pourtant fondamentale dans le plan. Les avatars en haut ressemblent à des stories Instagram sans anneau coloré distinctif. 

- Les réactions emoji affichées (IIII) ne correspondent pas aux 6 emojis spécifiés dans le plan (IIhIIII). 

## **Profil** 

- Aucun accès rapide visible à la langue (FR/EN), aux unités (kg/lbs) ou au mode Data Saver — pourtant des features critiques pour le marché africain selon le plan. 

- Tags "Powerlifter" / "Team Lyxo" présents mais non documentés dans le plan — à clarifier si c'est un nouveau système de badges à spécifier. 

## **Coach Dashboard** 

- Pas de bouton "Partager sur WhatsApp" visible, alors que c'est LE levier d'acquisition identifié en section 11 (Deferred Deep Links) — devrait être presque aussi visible que "Vendre un programme". 

- Pas d'indication claire du split de commission (15% LYXO / 85% coach) sur l'écran financier. 

## **Nutrition** 

- Pas de bouton "Scanner code-barres" visible alors que c'est une feature clé documentée en section 2.5. 

## **Écrans stratégiques absents du premier prototype** 

## **Le problème le plus important** 

Aucun écran ne montre le choix de langue FR/EN au premier lancement (section 2.8). 

Aucun écran ne montre l'onboarding offline-first ("LYXO fonctionne partout, même sans réseau", section 12). 

Aucun écran ne montre le paywall / écran LYXO+ (sections 13-14). 

Aucun écran ne montre le flux de paiement Mobile Money localisé par pays (section 5 du plan V5). 

Ces 4 écrans sont parmi les plus stratégiques du plan — les deux premiers sont les tout premiers écrans vus par un nouvel utilisateur, les deux derniers conditionnent toute la monétisation mondiale. 

## **Spécifications de correction pour le prototype V2** 

|**Priorité**|**Écran / Zone**|**Action requise**|
|---|---|---|
|ICritique|Onboarding|Créer l'écran de choix de langue FR/EN (premier écran, avant inscription)|
|ICritique|Onboarding|Créer l'écran offline-first ("LYXO fonctionne partout") avec illustration nuage|
|ICritique|Monétisation|Créer l'écran paywall LYXO+ avec comparatif Gratuit vs Premium|



|**Priorité**|**Écran / Zone**|**Action requise**|
|---|---|---|
|ICritique|Paiement|Créer l'écran de paiement avec méthodes localisées selon le pays (MTN MoMo<br>/ Orange / carte)|
|ICritique|Séance en cours|Repenser le layout pour réduire le scroll — clavier fixe en bas, sticky bouton<br>Terminer|
|IImportant|Séance en cours|Ajouter le swipe +2.5kg/+5kg sur les inputs de poids|
|IImportant|Discover|Ajouter un anneau coloré distinctif sur les avatars Stories vs posts Discover<br>permanents|
|IImportant|Coach Dashboard|Ajouter un bouton "Partager sur WhatsApp" visible au même niveau que<br>"Vendre un programme"|
|IMoyen|Progress|Légender la heatmap Assiduité (préciser ce que représente l'intensité de<br>couleur)|
|IMoyen|Home|Réduire le bandeau "Connecté" à un indicateur discret quand l'état est synced|
|IMoyen|Discover|Aligner les emojis de réaction sur les 6 prévus dans le plan (IIhIIII)|
|IMineur|Profil|Ajouter un accès rapide langue / unités / Data Saver|
|IMineur|Nutrition|Ajouter le bouton Scanner code-barres visible|



## **Méthode de validation** 

Avant de lancer le développement Expo, régénérer un second prototype Stitch incluant explicitement les 4 écrans manquants critiques en priorité, en citant les sections exactes du plan pour chaque écran. 

Valider le nouveau prototype avec la même grille d'audit (points forts / points faibles / écrans manquants) avant de passer au code. 

> **01 PALETTE CORRIGÉE & DISCIPLINE COLORIMÉTRIQUE 6** 

Le rouge est conservé comme signature de marque, mais la palette est corrigée pour éliminer toute lecture drapeau. 

## **Le problème identifié** 

La palette initiale (rouge + vert + jaune/orange sur fond noir) pouvait être lue comme une référence au drapeau du Cameroun lorsque les trois couleurs apparaissaient ensemble à l'écran. Le rouge en lui-même n'est pas le problème — c'est la combinaison des trois teintes côte à côte qui crée cette lecture involontaire. La décision a été prise de conserver le rouge comme signature de marque tout en remplaçant le vert et le jaune/orange par des teintes qui cassent complètement l'association. 

## **Palette corrigée — Détail complet** 

|**Rôle**|**Avant**|**Après (V7)**|**Justification**|
|---|---|---|---|
|Accent principal|#E63946|#C73E3A depuis (historique : conservé un temps, puis palette Braise finale §19.11)|L'énergie du rouge conservée, assombrie et matifiée|
|Succès / PR|#2DC653 (vert)|#3D9DF6 puis #C73E3A/#3A3F47 (palette finale Braise)|Historique : vert → bleu (V7) → ember/acier (final §19.11)|
|Warning / Info|#F4A261 (orange/jaune)|#A78BFA (violet doux)|Élimine la composante jaune, reste<br>distinct du rouge et du bleu|
|Fond / Texte|Inchangés|Inchangés|#0A0A0A, #141414, #1E1E1E,<br>#FFFFFF, #888888 restent identiques|



## **Pourquoi cette combinaison fonctionne** 

Avec seulement rouge et bleu comme couleurs vives, l'app n'a plus que deux familles de couleurs visibles ensemble — ce qui casse complètement toute association drapeau tout en gardant l'identité salle de sport intense que le rouge porte naturellement. 

Le bleu électrique évoque la précision et la performance technique, cohérent avec l'univers fitness/tracking. 

Le violet doux pour les warnings reste suffisamment distinct du rouge et du bleu pour ne jamais créer de confusion. 

## **Discipline colorimétrique — Inspiration Lift Card** 

L'étude du design de Lift Card (concurrent direct, landing page liftcard.app) révèle une discipline stricte : une seule couleur saturée active à l'écran à la fois, le reste en noir/gris neutre, et l'accent réservé exclusivement aux éléments d'action. C'est cette discipline — pas la palette elle-même — qui rend leur interface premium malgré un nombre de couleurs très limité. 

|**Principe observé chez Lift Card**|**Application dans LYXO**|
|---|---|
|Une seule couleur saturée active à la fois|Rouge ou bleu visible à l'écran, jamais les deux en avant-plan<br>simultanément sur le même élément|
|Le reste en noir/gris neutre|Déjà en place — fond #0A0A0A, texte secondaire #888888|
|L'accent n'apparaît que sur les éléments d'action|Le rouge doit être restreint aux CTA primaires uniquement — voir règle<br>stricte ci-dessous|
|Pas de couleur saturée pour les stats neutres|Stats neutres restent blanc os, seul le PR utilise l'ember #C73E3A (Braise)|
|Beaucoup d'espace négatif entre les blocs|Réduire la densité d'information sur Dashboard, laisser respirer chaque<br>card|
|Graphiques de progression minimalistes|Courbe simple sans grille chargée, une seule ligne, pas de légendes<br>multiples|



## **Règle de discipline colorimétrique — Non négociable** 

```
RÈGLE DE COULEUR — Discipline stricte pour tout l'écosystème LYXO
```

`Rouge #E63946` → `UNIQUEMENT :` 

- `Bouton CTA principal (Démarrer séance, Terminer, Publier, Vendre)` 

- `Logo et wordmark LYXO` 

- `Badge "Nouveau PR" (un seul élément visible par écran)` 

`Ember #C73E3A / Acier #3A3F47 (ex-bleu #3D9DF6)` → `UNIQUEMENT :` 

- `Stats de succès, record battu, confirmation de synchronisation` 

`Violet #A78BFA` → `UNIQUEMENT :` 

- `Alertes et informations non critiques` 

`Tout le reste` → `blanc, gris, ou transparent` 

- `INTERDIT : rouge sur les bordures de cards` 

- `INTERDIT : rouge sur les tags secondaires ou décoratifs` 

- `INTERDIT : rouge sur les highlights non liés à une action` 

- `INTERDIT : plus d'une couleur saturée visible sur le même composant` 

## **Correction à appliquer sur le prototype Stitch existant** 

L'audit de la section 15 a révélé que le rouge est actuellement utilisé de façon décorative à plusieurs endroits du premier prototype (tags "Powerlifter"/"Team Lyxo" sur le Profil, bordures actives sur les inputs de la Séance). Conformément à la discipline ci-dessus, ces usages décoratifs doivent migrer vers le gris ou le blanc, et le rouge doit être retiré partout sauf sur les CTA et le badge PR. 

## **DESIGN.md — Section couleurs finale** 

Le fichier DESIGN.md généré avec le premier prototype Stitch doit être mis à jour avec ces valeurs avant de régénérer le second prototype. Voici le bloc de configuration final à utiliser. 

```
colors:
background: '#0A0A0A'
surface-container-low: '#141414'
```

```
surface-input: '#1E1E1E'
on-background: '#FFFFFF'
text-muted: '#888888'
border-subtle: '#2A2A2A'
primary: '#C73E3A' # ember mat — CTA, deltas PR, rivalité (Braise §19.11)
on-primary: '#FFFFFF'
tertiary: '#3A3F47' # gris acier — structure, sync, segments (zéro bleu)
on-tertiary: '#04254F'
status-warning: '#A78BFA' # Remplace l'orange/jaune
offline-stale: '#555555'
color_discipline_rule:
max_saturated_colors_visible_simultaneously: 2
red_usage: ['primary_cta', 'logo', 'pr_badge']
blue_usage: ['success_state', 'pr_record', 'sync_confirmed']
forbidden: ['decorative_tags', 'card_borders', 'secondary_highlights']
```

## **Résultat attendu** 

Aucun jaune, aucun vert dans toute l'interface LYXO. 

Le rouge reste l'unique signature de marque, mais utilisé avec parcimonie — jamais plus présent à l'écran que nécessaire pour guider l'action. 

Cette discipline, combinée à la suppression du vert et du jaune, élimine complètement le risque de lecture drapeau tout en renforçant l'impression de produit premium, à l'image de Lift Card. 

**01 DÉCISIONS PRODUIT — ANALYSE FONCTIONNELLE 7 LIFT CARD** 

Une description fonctionnelle détaillée de Lift Card a révélé 3 décisions produit à trancher pour LYXO. 

## **Contexte** 

Une description fonctionnelle de Lift Card par un utilisateur a mis en lumière des comportements précis de l'app concurrente : ajout d'exercice immédiat, photo/vidéo post-séance qui alimente automatiquement un feed unique pour les amis, un Discover orienté matching de partenaires d'entraînement, un calendrier avec graphes par exercice, et surtout un mode d'utilisation sans création de compte, réservé au tracking pur. Trois de ces points nécessitaient une décision produit explicite pour LYXO. 

## **Décision 1 — Inscription obligatoire confirmée** 

Lift Card permet d'utiliser l'app entièrement sans créer de compte, pour le tracking pur, sans aucune feature sociale. LYXO ne propose pas de mode invité équivalent. 

|**Option envisagée**|**Décision**|
|---|---|
|Mode invité/local complet (comme Lift Card)|Rejeté|
|Inscription obligatoire dès l'onboarding|Retenu|
|Compromis — essai limité dans le temps puis inscription|Rejeté|



## **Justification** 

L'architecture offline-first de LYXO repose sur la synchronisation multi-device via Supabase (sections 3 et 14) — un compte est nécessaire dès le départ pour que cette synchronisation ait un sens. 

Le Coach Mode, le Discover et les Stories nécessitent tous un profil identifié — proposer un mode sans compte fragmenterait l'expérience entre deux populations d'utilisateurs aux besoins très différents. 

Contrairement à Lift Card qui vise d'abord un usage solo, LYXO est pensé social et communautaire dès le MVP (section 2.7) — l'inscription immédiate aligne mieux l'onboarding avec la proposition de valeur réelle de l'app. 

## **Décision 2 — UI unifiée en façade, architecture à 2 niveaux conservée** 

Lift Card présente un flux social unique : la photo/vidéo de fin de séance alimente directement un seul feed visible par les amis. LYXO distingue Stories (24h, privé, abonnés) et Discover (permanent, public) — une architecture plus riche mais qui peut sembler plus complexe à l'utilisateur si elle est mal présentée. 

|**Option envisagée**|**Décision**|
|---|---|
|Garder 2 niveaux distincts avec UI séparée (plan initial)|Rejeté tel quel|
|Simplifier en un seul flux unique comme Lift Card|Rejeté|



|**Option envisagée**|**Décision**|
|---|---|
|Garder les 2 niveaux techniques mais unifier l'UI en façade|Retenu|



## **Implémentation concrète de l'unification UI** 

- **Après une séance** — un seul bouton de partage "Partager ma séance" est proposé, pas un choix Story vs Post. Le type de destination (Story 24h ou Discover permanent) est déterminé par un toggle simple et secondaire dans le même écran de partage, pas par deux flux distincts. 

- **Dans le flux Discover** — les Stories actives des abonnés apparaissent en haut sous forme de cercles avatar (format proche Instagram), directement au-dessus du feed permanent, donnant l'impression d'un flux continu unique malgré la distinction technique sous-jacente. 

- **Données et schéma DB** — aucun changement sur le schéma PostgreSQL existant (tables stories et posts restent séparées, section 5) — la simplification est uniquement une question de présentation visuelle, pas d'architecture technique. 

## **Pourquoi garder les 2 niveaux techniques** 

Les Stories en 24h créent l'urgence quotidienne de revenir (section 2.3) — un flux unique permanent perdrait ce mécanisme de rétention. 

Les commentaires privés en DM sur les Stories vs publics sur Discover (section 2.3-2.4) sont un vrai différenciateur anti-toxicité — fusionner les deux flux forcerait à choisir une seule politique de modération. 

L'unification ne se fait qu'en surface UI — le bénéfice de simplicité perçue par l'utilisateur est conservé sans sacrifier la richesse fonctionnelle ni la architecture déjà validée en section 5. 

## **Décision 3 — Gym Matching ajouté en V2, couplé à Ma Salle** 

Lift Card propose un Discover orienté recherche de partenaires d'entraînement compatibles, au-delà de la simple découverte de contenu. LYXO n'avait pas formalisé cette logique de matching actif. 

|**Option envisagée**|**Décision**|
|---|---|
|Ajouter le matching dès le MVP|Rejeté — hors scope Niveau 1 (section 12)|
|Ne pas ajouter cette feature|Rejeté — bon différenciateur de rétention<br>sociale|
|Ajouter en V2, couplé à la feature Ma Salle|Retenu|



## **Spécification — Gym Matching V2** 

- **Critères de matching** — niveau d'expérience déclaré (débutant/intermédiaire/avancé), créneaux horaires habituels d'entraînement, salle de sport (via la géolocalisation de la feature Ma Salle déjà prévue en V2), groupes musculaires favoris. 

- **Découverte** — un onglet dédié dans Discover, distinct du feed de contenu, présentant des profils suggérés avec un score de compatibilité simple (ex: "3 points communs : même salle, même créneau, niveau similaire"). 

- **Action** — bouton "Proposer un entraînement ensemble" qui ouvre un DM pré-rempli, réutilisant l'infrastructure de messagerie déjà prévue pour le Coach Mode (section 2.6). 

- **Confidentialité** — opt-in explicite requis dans les paramètres ("Être visible pour le matching"), désactivé par défaut pour respecter la vie privée des utilisateurs qui ne cherchent pas de partenaire. 

## **Pourquoi en V2 et pas au MVP** 

Le matching nécessite une masse critique d'utilisateurs par zone géographique pour être pertinent — au lancement avec un nombre limité d'utilisateurs, les suggestions seraient trop pauvres pour créer de la valeur. 

Cohérent avec la règle de priorité Niveau 1/2/3 de la section 12 — le MVP reste concentré sur le tracker et le social de base, sans complexité additionnelle non prouvée. 

Le couplage avec Ma Salle (déjà prévue en V2 pour la géolocalisation) évite de construire deux fois une logique de localisation similaire. 

## **Synthèse des 3 décisions** 

|**Décision**|**Verdict**|**Impact roadmap**|
|---|---|---|
|Mode invité sans compte|Rejeté — inscription reste obligatoire|Aucun changement de roadmap|
|UI Stories/Discover unifiée|UI simplifiée en façade, architecture technique<br>inchangée|Ajustement design uniquement,<br>pas de coût dev additionnel|
|Gym Matching|Ajouté en roadmap V2, couplé à Ma Salle|Nouvelle feature V2 — section 2.7<br>et roadmap section 9 à mettre à<br>jour|



> **01 FRAMEWORK DE DESIGN 5 ÉTAPES APPLIQUÉ À LYXO 8** 

Un framework simple en 5 étapes pour valider qu'une app a une vraie colonne vertébrale avant de coder. 

## **Origine et principe** 

Ce framework vient d'une méthode de conception d'app couramment utilisée par les développeurs solo travaillant avec des agents IA. L'idée centrale : toute app réussie peut se décomposer en 5 couches. Si une de ces couches manque ou est mal définie, l'app risque de devenir soit trop pauvre, soit trop complexe sans direction claire. LYXO a été conçu de façon itérative à travers ce document, mais ce framework permet de vérifier formellement que chaque pièce est bien à sa place avant le développement. 

## **1. Core Function — La fonction qui ne peut pas être retirée** 

La fonction core est ce qui resterait si on retirait absolument tout le reste de l'app. Pour LYXO : logger un set d'entraînement (exercice, poids, reps) en une action rapide. Sans cette fonction, LYXO n'existe pas — tout le social, la nutrition, le Coach Mode ne sont que des couches supplémentaires autour de cette colonne vertébrale. 

## **2. Core Loop — Le cycle action** → **récompense** 

Le core loop est la boucle qui transforme la fonction core en habitude. Idéalement sous 30 secondes, comme dans tout bon design de jeu ou de produit à forte rétention. 

|**Étape du loop**|**Implémentation LYXO**|
|---|---|
|Action|L'utilisateur tape le poids et les reps sur le clavier numérique custom|
|Validation|Tap sur le bouton de validation du set — moins de 3 secondes (section 2.1)|
|Récompense immédiate|Timer de repos démarre automatiquement, vibration haptic|
|Récompense différée|Détection automatique de PR avec célébration confetti + haptic + son (section 2.2)|
|Boucle complète|Action (taper)→Validation (tap)→Récompense (vibration/son)→PR éventuel<br>(confetti) en moins de 10 secondes|



## **3. Accessory Features — Tout ce qui soutient le loop sans le remplacer** 

Les features accessoires ne changent pas la fonction ou le loop core, elles les enrichissent. Toutes les fonctionnalités du plan LYXO (sections 2.2 à 2.7) sont par définition des accessory features : graphes de progression, Stories, Discover, Coach Mode, Nutrition. Le risque classique identifié dans ce framework est l'accumulation excessive de features accessoires qui finit par diluer le core loop — c'est exactement ce que les règles de priorité Niveau 1/2/3 de la section 12 du plan LYXO préviennent déjà. 

## **4. Surface Area Check — Limiter le nombre d'écrans** 

Une app avec trop d'écrans et de chemins de navigation perd l'utilisateur. La recommandation standard est de 5 à 7 écrans principaux maximum pour un MVP. 

|**Vérification**|**Statut LYXO**|
|---|---|
|Nombre d'onglets de navigation principaux|5 — Home, Log, Progress, Discover, Profil (section 6, conforme)|
|Écrans critiques additionnels identifiés|Onboarding langue, onboarding offline, paywall LYXO+, paiement (section<br>15, à ajouter au prototype)|
|Verdict du surface area check|Conforme — le MVP reste dans la fourchette recommandée même avec<br>les écrans manquants ajoutés|



## **5. Retention Hook — Ce qui ramène l'utilisateur** 

Le retention hook est le mécanisme qui crée un état inachevé que l'utilisateur doit revenir terminer. LYXO a déjà plusieurs retention hooks identifiés dans le plan, mais ce framework permet de les lister explicitement comme un ensemble cohérent. 

- **Streak de consistance** — la peur de briser une série de jours consécutifs (heatmap, section 2.2). 

- **Stories 24h** — urgence de revenir voir le contenu des abonnés avant expiration (section 2.3). 

- **Notifications de rappel** — push quotidien si la séance du jour n'est pas encore loguée (section 2.8). 

- **PR d'un ami** — notification sociale qui crée un FOMO compétitif sain (section 2.7). 

- **Monthly Recap** — rendez-vous mensuel automatique qui ramène l'utilisateur consulter son bilan (section 2.2). 

## **Verdict global du framework appliqué à LYXO** 

## **LYXO valide les 5 étapes du framework** 

Core function claire et non négociable — logger un set rapidement (Niveau 1, section 12). 

Core loop sous 10 secondes avec récompense immédiate et différée (autofill, timer, PR). 

Accessory features riches mais hiérarchisées par les règles de priorité Niveau 1/2/3. 

Surface area conforme à la fourchette 5-7 écrans recommandée. 

5 retention hooks distincts et complémentaires, pas un seul mécanisme fragile. 

Le plan LYXO, construit itérativement à travers 9 versions, satisfait ce framework sans qu'aucune restructuration ne soit nécessaire — confirmation que l'architecture produit est solide avant le développement. 

**01 9** 

## **SOUMISSION APP STORE & PLAY STORE** 

Le processus complet, de l'app prête en local jusqu'à la soumission effective sur les stores. 

## **Vue d'ensemble du processus** 

Une fois l'app testée end-to-end (Chrome local, mirroring téléphone, Expo sur device réel), trois grandes étapes restent avant la mise en ligne : préparer l'app pour la production, construire un build de production via EAS, puis soumettre ce build aux stores avec toutes les informations de conformité requises. 

|**Étape**|**Action**|**Outil**|
|---|---|---|
|1. Préparation<br>production|Génération de app.json et eas.json — nom, identifiant,<br>version, icônes, permissions|Claude Code|
|2. Build de production|Compilation de l'app en version figée et optimisée|EAS Build (Expo)|
|3. Comptes développeur|Création des comptes Apple Developer et Google Play<br>Console|Manuel — une fois|
|4. Conformité et<br>confidentialité|Privacy policy hébergée, support URL, captures d'écran,<br>descriptions|Claude Code + hébergement<br>web|
|5. Soumission|Envoi du build aux stores avec toutes les métadonnées<br>requises|EAS Submit|
|6. Revue|Attente de validation par les équipes Apple/Google|Externe — 1 à 5 jours<br>typiquement|



## **Préparation — Fichiers de configuration** 

Claude Code peut générer automatiquement ces fichiers à partir d'une simple demande, mais il est important de comprendre ce qu'ils contiennent pour vérifier leur exactitude avant soumission. 

```
app.json — contient :
```

- `Nom de l'app (LYXO)` 

- `Identifiant unique (ex: com.lyxo.app)` 

- `Numéro de version (1.0.0)` 

- `Icônes (1024x1024px minimum)` 

- `Écran de démarrage (splash screen)` 

- `Permissions requises (caméra pour scan barcode, notifications)` 

```
eas.json — contient :
```

- `Profils de build (development, preview, production)` 

- `Configuration spécifique iOS et Android` 

## **Comptes développeur — À créer une seule fois** 

|**Plateforme**|**Lien d'inscription**|**Coût**|**Recommandation**|
|---|---|---|---|
|Apple Developer|developer.apple.com/account|99 USD/an|Nécessaire dès la première<br>soumission iOS|
|Google Play Console|play.google.com/console/signup|25 USD one-time|Confirmé dans le plan V1 — déjà<br>budgété|



## **Conseil pratique pour Google Play Console** 

Utiliser une adresse email professionnelle (ex: contact@lyxo.app) plutôt qu'une adresse Gmail générique accélère la vérification du compte développeur. 

Un compte Google Workspace à faible coût mensuel suffit pour obtenir cette adresse professionnelle et donne une image plus sérieuse pour le Coach Mode et les partenariats futurs. 

## **Conformité — Privacy Policy et pages requises** 

Les deux stores exigent une page de politique de confidentialité accessible publiquement sur le web, ainsi qu'une page de support. Ces pages peuvent être générées rapidement via Claude Code à partir des guidelines officielles des stores, puis hébergées sur le domaine lyxo.app. 

|**Page requise**|**Contenu attendu**|**URL suggérée**|
|---|---|---|
|Privacy Policy|Données collectées (profil, workout, paiement), usage,<br>partage tiers, droits utilisateur|lyxo.app/privacy|
|Support|Contact support, FAQ basique, lien email|lyxo.app/support|
|Marketing / Landing|Page d'accueil publique de l'app, requise pour le champ<br>Marketing URL|lyxo.app|



## **Build et soumission — Commandes clés** 

```
# Connexion à EAS (une fois)
eas login
```

```
# Build de production
```

```
eas build --platform android --profile production
```

```
eas build --platform ios --profile production
```

```
# Soumission directe aux stores
```

```
eas submit --platform android
eas submit --platform ios
```

```
# Alternative : soumission via l'interface web Expo
```

`# expo.dev` → `Builds` → `sélectionner le build` → `Submit to store` 

## **Informations à fournir lors de la soumission** 

|**Champ**|**Détail pour LYXO**|
|---|---|
|Nom de l'app|LYXO|
|Description|Texte FR/EN décrivant le tracker offline-first, social, et la communauté coach africaine|



|**Champ**|**Détail pour LYXO**|
|---|---|
|Mots-clés|musculation, fitness, tracker, gym, offline, coach, Afrique|
|Captures d'écran|6.5 pouces (iPhone) + tablette + Android — générées via le prototype Stitch corrigé (section<br>15-16)|
|Compte de test reviewer|Email et mot de passe dédiés permettant au reviewer Apple/Google de tester l'app sans créer<br>de vrai compte|
|Catégorie|Santé et Fitness|
|Prix|Gratuit (conforme section 13 — modèle freemium, achat in-app pour LYXO+ en Phase 2)|



## **Audit de sécurité en boucle — Avant toute soumission** 

Avant la soumission finale, un audit de sécurité méthodique doit être exécuté au moins deux fois, avec un nettoyage de contexte entre chaque passage. La raison : corriger un problème de sécurité peut parfois en introduire un autre ailleurs dans le code, qu'un second passage avec un contexte neuf permet de détecter. 

```
PROCESSUS D'AUDIT SÉCURITÉ — Non négociable avant soumission
```

`1. Nettoyer le contexte de conversation (/clear)` 

`2. Lancer le prompt d'audit sécurité complet` 

`3. Vérifier les points suivants au minimum :` 

- `Secrets et clés API jamais en dur dans le code (utiliser .env)` 

- `Row Level Security (RLS) activé sur toutes les tables Supabase` 

- `Validation des données côté serveur, pas uniquement côté client` 

- `Routes API protégées par vérification du token JWT` 

- `Pas de fuite d'information dans les messages d'erreur affichés à l'utilisateur` 

`4. Faire corriger tous les findings Critical et High` 

`5. Nettoyer le contexte à nouveau (/clear)` 

`6. Relancer l'audit complet une seconde fois` 

`7. Vérifier qu'aucune nouvelle vulnérabilité n'a été introduite par les corrections` 

`8. Répéter jusqu'à ce que les findings restants soient uniquement Low ou Informational` 

## **Délai de revue et après soumission** 

|**Plateforme**|**Délai de revue typique**|**En cas de rejet**|
|---|---|---|
|Apple App Store|24 à 48 heures en général|Motif détaillé fourni — corriger et<br>resoumettre|
|Google Play Store|Quelques heures à 7 jours selon les cas|Motif détaillé fourni — corriger et<br>resoumettre|



## **TestFlight — Tester avant la mise en ligne publique** 

Avant la soumission publique définitive, TestFlight (iOS) permet de distribuer l'app à un groupe restreint de testeurs réels sans passer par la revue complète du store. 

Recommandé pour LYXO avec les 10 coachs beta identifiés dans la stratégie Go-to-Market (section 10) — ils peuvent tester l'app avant le lancement public et remonter les derniers bugs. 

## **Résumé exécutif** 

App : LYXO — lyxo.app — Tracker de musculation social, offline-first, marché mondial. Cible : Afrique francophone (lancement) + diaspora Europe + expansion mondiale. Stack : React Native + Expo / Claude Code / Supabase / WatermelonDB / Branch.io / RevenueCat. Framework validé : 5 étapes (core function, core loop, accessory, surface area, retention). Monétisation : 3 tiers (Gratuit / Lyxo+ / Coach Pro) + paywall géolocalisé modèle Spotify. Tagline : Soulève plus. Ensemble. / Lift more. Together. 

LYXO — Plan Complet V14 · lyxo.app · Lionel Mayi Mayi · Juin 2026 · Confidentiel 

**02 0** 

## **STRUCTURE DES 3 TIERS LYXO — DÉTAIL COMPLET** 

Chaque tier documenté feature par feature, avec le pricing officiel Occident et Afrique. 

## **Tier 1 — Lyxo Gratuit** 

L'essentiel pour s'entraîner sans friction. Remplace le carnet papier. Gratuit à vie, sans limitation de durée ni de données. Ce tier est stratégiquement complet : il crée l'effet de réseau, génère la croissance organique, et rend l'upgrade naturel — pas forcé. 

## **1. Création de routines** 

Conception et organisation complète de ses programmes d'entraînement. PPL (Push/Pull/Legs), Full Body, Upper/Lower, Bro Split, ou entièrement custom. Splits configurables avec rotation automatique hebdomadaire — l'app propose le bon workout chaque jour sans que l'utilisateur ne réfléchisse. 

## **2. Log de séance en temps réel** 

Clavier numérique custom optimisé pour la salle (pas le clavier système). Autofill automatique du dernier poids et reps utilisés pour chaque exercice. Chronomètre de repos configurable (30 secondes à 5 minutes) avec vibration haptic et son à la fin. Logger un set prend moins de 3 secondes. 

## **3. Historique des séances** 

Accès à la liste complète de tous les entraînements passés — date, durée, volume total, exercices. Permet de voir ce qui a été fait, quand, avec quels poids. Limite gratuite : 90 derniers jours visibles. Au-delà de 90 jours → nécessite Lyxo+ (données conservées, juste masquées). 

## **4. Bibliothèque d'exercices standard** 

Accès aux 500+ mouvements de musculation classiques avec animations GIF du mouvement correct, instructions step-by-step en FR et EN, filtres par groupe musculaire et équipement. Exercices custom créables par l'utilisateur. Favoris épinglables en haut de la liste. 

## **5. Accès à Discover — Réseau Social Complet** 

Le social est entièrement gratuit — c'est intentionnel et stratégique. Les users gratuits génèrent le contenu du Discover, recrutent les coachs, et créent l'effet de réseau sans lequel l'app n'a aucune valeur. Un Discover vide au lancement = 0 rétention. Le social gratuit est le moteur d'acquisition de Lyxo. 

- Partage de séances publiques avec stats overlay automatique 

- Stories 24h (photo + stats générées automatiquement en fin de séance) 

- Feed des entraînements de la communauté — Trending et Recent 

- Interactions : likes, commentaires publics, follow/unfollow 

- Signalement de contenu — disponible dès le MVP 

## **6. Leaderboard de PRs entre amis** 

Classement dynamique basé uniquement sur les Records Personnels (PRs) des membres de son cercle d'amis. Pas un classement de volume ou de fréquence — uniquement les records pour que tout niveau puisse compétir. Mis à jour en temps réel dès qu'un PR est battu. 

## **7. Notifications de Conquête — Friendly Competition** 

Quand tu bats le PR d'un ami, le système envoie une notification push instantanée et personnalisée à cet ami : 

```
EXEMPLE DE NOTIFICATION :
```

```
Massa vient de dépasser ton record au bench
```

```
102 kg vs ton 100 kg
```

```
Cette notification crée une urgence émotionnelle immédiate.
```

```
L'ami retourne à la salle pour récupérer son titre.
```

```
C'est le retention hook le plus puissant de l'app.
```

## **8. La Trace Permanente — Le Seum Visuel** 

Quand ton PR est battu par un ami, ce record historique reste gravé et visible sur TON profil sous la forme : 

```
Sur le profil de l'ami :
Bench Press — 100 kg
Record battu par @massalifts le 12 juin 2026
```

```
C'est visible par tout le monde qui visite son profil.
```

```
C'est permanent — jamais supprimé.
```

```
C'est le levier parfait pour le forcer à retourner
à la salle pour récupérer son titre.
```

## **Grille tarifaire — Lyxo Gratuit** 

|**Marché**|**Prix**|**Note stratégique**|
|---|---|---|
|Monde entier|0 FCFA / 0€ / $0|Acquisition massive via Leaderboard, PRs, Conquête|



## **Tier 2 — Lyxo+ (Intelligence Contextuelle & Immersion)** 

Destiné aux pratiquants intermédiaires et avancés qui veulent optimiser leurs performances, automatiser leurs calculs et s'entraîner connectés. Chaque feature répond à un problème réel que les athlètes sérieux ont mais que les apps actuelles ne résolvent pas. 

## **1. Historique illimité** 

Accès à l'intégralité des séances depuis le tout premier jour d'utilisation. Les données sont toujours stockées côté Lyxo — la limite des 90 jours ne supprime rien, elle masque simplement l'affichage. Upgrader vers Lyxo+ restaure instantanément tout l'historique. 

## **2. Automated Workout Progression — Le Guide IA** 

L'application analyse les performances passées exercice par exercice et dicte des objectifs exacts (poids et reps précis) au début de chaque série pour appliquer la surcharge progressive automatiquement — sans que l'athlète n'ait à réfléchir ni à calculer. 

```
EXEMPLE EN SÉANCE :
Développé couché — Série 3
Objectif suggéré : 82,5 kg x 8 reps
(basé sur tes 3 dernières séances + tendance)
L'athlète valide ou ajuste, Lyxo adapte la prochaine session.
```

## **3. Velocity & Fatigue Tracking simplifié** 

Analyse basée sur l'effort ressenti (RPE de 1 à 10) croisé avec le volume hebdomadaire total pour calculer un score de récupération musculaire. Alerte automatique si risque de stagnation ou de surentraînement détecté. Pas un wearable, pas une caméra — juste l'effort ressenti saisi par l'utilisateur, suffisant pour une alerte utile. 

## **4. Analytics Discover Exclusifs** 

Possibilité de cloner instantanément le programme complet d'un athlète ou d'un coach populaire depuis le fil Discover, avec réadaptation automatique des charges selon son propre 1RM personnel. Un débutant voit un programme de champion — il le clone, Lyxo ajuste automatiquement tous les poids à son niveau. 

## **5. Séance Fantôme — Ghost Session** 

Rejoindre virtuellement la séance d'un ami qui s'entraîne en direct, à distance. Ses exercices et séries défilent en temps réel dans un coin de l'écran (et inversement). Sans chat, sans distraction — juste la présence silencieuse d'un partenaire d'entraînement à distance. Résout la solitude de la salle pour les athlètes qui s'entraînent seuls. 

## **6. Le Pont Coach-Élève** 

Débloque la synchronisation avancée nécessaire pour recevoir, exécuter et valider en direct les programmes interactifs envoyés à distance par un entraîneur équipé du tier Coach Pro. Sans Lyxo+, l'élève peut acheter le programme mais ne reçoit pas le suivi personnalisé en temps réel. 

## **7. Bibliothèque de Programmes Certifiés** 

Accès illimité et exclusif aux plans d'entraînement officiels créés par les meilleurs coachs professionnels de la plateforme Lyxo. Programmes vérifiés, structurés semaine par semaine, avec notes de coach par exercice. 

## **8. Sauvegarde Cloud Automatique Multi-Device** 

Synchronisation permanente de l'intégralité des données sur Supabase. Restauration complète en un clic si changement ou perte du téléphone. La version gratuite stocke localement sur l'appareil (WatermelonDB) et sync les données récentes — mais sans garantie de restauration complète en cas de réinitialisation de l'appareil. 

## **9. Création d'Exercices Personnalisés Illimitée** 

Ajout d'un nombre illimité d'exercices spécifiques ou de variantes de machines absents de la bibliothèque standard. La version gratuite permet de créer des exercices custom, mais avec une limite de 5. Au-delà → Lyxo+ requis. 

**Grille tarifaire officielle — Lyxo+** 

|**Marché**|**Pass Mensuel**|**Pass Annuel (default)**|**Équivalent/mois (annuel)**|**Trial**|
|---|---|---|---|---|
|Europe / USA / Reste|—|34,99 €/$39.99|2,92 €/mois|14 jours<br>gratuits|
|Europe mensuel (option)|4,99 €/mois|—|—|14 jours<br>gratuits|
|Afrique (FCFA)|3 500 FCFA / mois|15 000 FCFA / an|1 250 FCFA/mois|14 jours<br>gratuits (flag backend, aucun paiement à l'activation)|
|Commission store|15-30% (Google/Apple)|15-30% (Google/Apple)|—|—|
|Commission Mobile Money|~2-3,5%<br>(PawaPay)|~2-3,5%|—|—|



## **Tier 3 — Lyxo Coach Pro (SaaS B2B Professionnels)** 

L'outil de travail ultime pour les coachs en salle ou en ligne. Gérer leur business, retenir leurs clients et prospecter facilement via la communauté Lyxo. Les coachs africains n'ont aujourd'hui aucun outil professionnel — ils gèrent tout sur WhatsApp. Lyxo leur donne une vraie plateforme. 

## **1. Tableau de bord de Gestion Clients** 

Interface centralisée pour piloter et suivre jusqu'à 15 clients simultanément avec la version gratuite de Coach Pro, illimité avec l'abonnement actif. Vue globale de tous les clients : dernière séance, prochaine séance programmée, taux de completion du programme en cours, clients inactifs signalés. 

## **2. Assignation de Programmes à Distance** 

Création d'un programme complet sur son propre appareil (exercices, jours, séries, repos, notes de coach pour chaque mouvement) puis injection instantanée directement dans l'application Lyxo du client. Le client reçoit une notification et voit le programme dans son tableau de bord. 

## **3. Suivi des Performances en Temps Réel** 

Réception d'une notification push dès qu'un client termine une séance, avec le résumé exact : exercices réalisés, poids validés, RPE moyen, volume total, durée, et comparaison avec la séance précédente. Le coach peut intervenir immédiatement si un client a eu du mal. 

## **4. Messagerie Privée Coach-Client** 

Canal de communication dédié dans l'application pour chaque client. Envoi de feedbacks rapides : message audio, vidéo d'exécution de mouvements commentée, notes textuelles, ajustements de programme. Remplace WhatsApp pour la relation coach-client. 

## **5. Stories éphémères de programmes — FOMO Lead Gen** 

Le coach partage son entraînement du jour sous forme de story visible uniquement pendant 24 heures. Les utilisateurs qui le suivent peuvent copier instantanément cette séance en 1 tap pour la faire eux-mêmes. Cela crée une urgence quotidienne de suivre le coach et sert de tunnel de vente idéal pour convertir les followers gratuits en clients payants. 

## **6. Vente de Programmes + Dashboard de Revenus** 

Le coach crée un programme, fixe son prix librement en FCFA ou EUR, Lyxo génère un lien unique partageable partout. Lyxo prélève 15% sur chaque vente (10% au-delà d'un seuil mensuel). Le dashboard affiche en temps réel : total des ventes, nombre de programmes achetés, net à reverser au coach après déduction des 15%. 

## **Tunnel de vente des programmes coach — 5 étapes** 

```
ÉTAPE 1 — CRÉATION
```

```
Le coach conçoit le programme complet (exercices, jours, repos, notes)
ÉTAPE 2 — PRICING
Le coach fixe son prix en FCFA (ex: 5 000 FCFA) et enregistre
ÉTAPE 3 — PARTAGE
Lyxo génère : lyxo.app/p/prog-coach-massa
Partage SUR Lyxo : Fil Discover, Stories éphémères 24h
Partage HORS Lyxo : WhatsApp, Instagram, TikTok
ÉTAPE 4 — ACHAT
Client clique le lien
```

`Sans compte Lyxo` → `obligation de s'inscrire (acquisition gratuite pour Lyxo)` 

`Paiement via Mobile Money ou carte` → `Lyxo prélève 15%` 

```
ÉTAPE 5 — LIVRAISON
```

```
Programme ajouté automatiquement dans le tableau de bord du client
```

`Accessible uniquement via Lyxo` → `chaque vente = user actif sur Lyxo` 

```
Rétention maximale : le programme force l'usage de l'app pendant des semaines
```

## **Pourquoi le Coach Pro est le cœur de la monétisation de Lyxo** 

Chaque programme vendu par un coach = un nouvel utilisateur inscrit sur Lyxo (si pas encore inscrit). 

Ces nouveaux utilisateurs deviennent des prospects naturels pour Lyxo+ une fois accrochés au tracker. 

Le coach est un ambassadeur gratuit qui recrute pour Lyxo à chaque vente de programme. 

Lyxo gagne 15% sans effort d'acquisition — le coach fait tout le travail de vente. 

Un coach actif avec 30 clients = 30 utilisateurs Lyxo actifs qui ne seraient pas là sans lui. 

## **Grille tarifaire officielle — Lyxo Coach Pro** 

|**Marché**|**Mensuel**|**Annuel**|**Commission programmes**|
|---|---|---|---|
|Afrique (FCFA)|7 000 FCFA/mois|25 000 FCFA/an|15% par vente→10% au<br>seuil|
|Europe / USA|$11.99/mois|$89.99/an|15% par vente→10% au<br>seuil|
|Commission store|15-30% (Google/Apple)|15-30%|Stripe 2,9% si web checkout|



## **Tableau comparatif complet des 3 tiers** 

|**Feature**|**Gratuit**|**Lyxo+**|**Coach Pro**|
|---|---|---|---|
|Log de séance complet|Oui|Oui|Oui|
|Bibliothèque exercices|500+ standards|500+ + illimité<br>custom|500+ + illimité custom|
|Historique des séances|90 jours|Illimité|Illimité|
|Création routines et splits|Oui illimité|Oui illimité|Oui illimité|
|Exercices personnalisés|5 maximum|Illimité|Illimité|
|Social (Discover, Stories)|Complet et gratuit|Complet|Complet|
|Leaderboard PRs amis|Oui|Oui|Oui|
|Notifications de Conquête|Oui|Oui|Oui|
|Trace permanente des PRs|Oui|Oui|Oui|
|Automated Workout Progression|Non|Oui|Oui|
|Velocity & Fatigue Tracking|Non|Oui|Oui|



|**Feature**|**Gratuit**|**Lyxo+**|**Coach Pro**|
|---|---|---|---|
|Analytics Discover (clone 1RM)|Non|Oui|Oui|
|Séance Fantôme|Non|Oui|Oui|
|Pont Coach-Élève|Non|Oui (côté élève)|Oui (côté coach)|
|Bibliothèque programmes certifiés|Non|Oui illimité|Oui illimité|
|Cloud Backup multi-device|Non|Oui|Oui|
|Export PDF/CSV stats|Non|Oui|Oui|
|Tableau de bord clients|Non|Non|15→illimité|
|Assignation programmes à distance|Non|Non|Oui|
|Suivi performance clients temps réel|Non|Non|Oui|
|Messagerie privée coach-client|Non|Non|Oui|
|Stories FOMO Lead Gen (24h)|Non|Non|Oui|
|Vente de programmes|Non|Non|Oui (15% commission<br>Lyxo)|
|Dashboard de revenus|Non|Non|Oui|



> **02 PAYWALL GÉOLOCALISÉ — MODÈLE SPOTIFY 1** 

Une seule app, deux interfaces de paiement complètement différentes selon la géographie. 

## **Le principe** 

Spotify propose deux options quand tu veux payer : payer directement chez eux (carte bancaire, Stripe) ou payer via Google Play (carte déjà liée au compte Google). Lyxo adopte exactement ce modèle, en ajoutant un troisième canal : Mobile Money pour l'Afrique. Une seule app publiée, une seule codebase — c'est le code qui détecte le pays et adapte l'interface. 

## **Flux de détection** 

`[ Bouton 'Passer à Lyxo+' ]` I M `Vérification pays (IP + indicatif téléphone inscrit)` I III `Europe / USA / Canada / Reste du monde` I III `ÉCRAN A — Prix EUR/$ + Google Play / Stripe` I 

III `Cameroun / CI / Sénégal / Zone Afrique` III `ÉCRAN B — Prix FCFA + MTN MoMo / Orange Money / Wave` 

## **Écran A — Utilisateur en Europe / USA** 

## IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII 

I `Passer à Lyxo+` I 

I I 

I I `ANNUEL (recommandé)` I 

I `2,92 € / mois` I 

I `Facturé 34,99 € aujourd'hui` I 

I `Après 14 jours d'essai gratuit` I 

I I 

I `[ S'abonner — Google Pay / Apple Pay ]` ← `1 tap, FaceID` 

I I 

I `Ou choisir le mensuel à 4,99 €/mois` I 

IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII 

```
Psychologie : annuel en default (SOSA 2026)
```

```
Commission : 15-30% Google/Apple selon durée abonnement
Expérience : 1 tap avec biométrie, zéro friction
```

## **Écran B — Utilisateur en Afrique francophone** — ⛔ MAQUETTE ILLÉGALE, NE JAMAIS IMPLÉMENTER
> ⚠️ Les boutons [Payer avec MTN MoMo / Orange Money / Wave] IN-APP
> ci-dessous sont l'exact anti-pattern interdit par Google (BILLING_FLOW
> §9/§9bis, 3 confirmations écrites). Écran conforme : informatif strict,
> zéro bouton/lien/mention de paiement (BILLING_FLOW §4.1). Conservé pour
> l'historique uniquement.


## IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII 

I `Passer à Lyxo+` I 

I I 

I I `Pass Annuel` I 

I `15 000 FCFA / an` I 

I `Soit 1 250 FCFA / mois` I 

I I 

I `[` I `Payer avec MTN MoMo ]` I 

I `[` I `Payer avec Orange Money ]` I 

I `[` I `Payer avec Wave ]` I 

I I 

I `Ou Pass Mensuel : 3 500 FCFA/mois` I 

IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII 

```
Psychologie : prix FCFA uniquement (pas d'euros visibles)
```

`Commission : ~2-3,5% PawaPay (vente web)` → `Lyxo garde ~97%` 

`Expérience : notification téléphone` → `code secret #126# ou #150#` 

## **Implémentation React Native** 

```
// config/payment-methods-by-country.ts
```

```
const AFRICA_COUNTRIES = ['CM','CI','SN','ML','BF','BJ','TG','GH','NG','KE']
```

```
// screens/PaywallScreen.tsx
```

```
function PaywallScreen() {
```

```
const user = useCurrentUser()
```

```
const isAfrica = AFRICA_COUNTRIES.includes(user.country)
```

```
return isAfrica ? AfricaPaywall() : WesternPaywall()
```

```
}
```

```
function WesternPaywall() {
```

```
// Prix EUR/USD, Google Pay / Apple Pay, RevenueCat
```

```
// AnnualPlanCard price='34,99 EUR' monthly='2,92 EUR/mois' recommended
```

```
// MonthlyOption price='4,99 EUR/mois'
```

`// GooglePayButton` → `RevenueCat.purchase('lyxo_plus_annual')` 

```
}
```

```
function AfricaPaywall() {
```

```
const methods = getPaymentMethodsForCountry(user.country)
```

```
// AnnualPlanCard price='15 000 FCFA' monthly='1 250 FCFA/mois' recommended
```

```
// MonthlyOption price='3 500 FCFA/mois'
```

`// MobileMoneyButton pour chaque method` → `initiatePawaPay(method)` 

```
}
```

## **Légalité — Google accepte ce modèle** 

⚠️ SECTION RÉVISÉE (Juillet 2026) — l'hypothèse "Google tolère" est SUPPRIMÉE.
Politique vérifiée : le programme Google Play "expanded billing choice" (paiement
alternatif in-app / liens web externes) est déployé US/UK/EEA (30/06/2026),
Australie (30/09/2026), Japon/Corée (31/12/2026), et RESTE DU MONDE — dont
Cameroun/CI/Sénégal — au plus tôt le 30/09/2027. Même via ce programme, Google
prélève une commission de service (~10% sur les abonnements auto-renouvelables),
y compris sur les transactions externes. Conséquence : le canal officiel LYXO
Afrique est la VENTE WEB (lyxo.app/plus → PawaPay), hors app. Le paywall in-app
présente l'offre sans bouton de paiement direct. Détail complet : PRICING.md §4.
Réévaluation du canal : octobre 2027. 

En 2026, la politique Google a évolué avec les directives sur les systèmes de facturation alternatifs (Alternative Billing). Sur Android, proposer Stripe en parallèle du Play Store est 100% légal, pratiqué par Spotify, Netflix, et la majorité des grandes apps fitness. 

Résultat : Lyxo ne perd aucun utilisateur occidental (1 tap Google Pay) tout en gardant ~97% des revenus africains via la vente web PawaPay (aucune commission store sur ce canal, conforme car hors app). 

**02 2** 

## **FEATURES INÉDITES & INSIGHTS SOSA 2026** 

35 idées originales priorisées pour Lyxo + recommandations du rapport RevenueCat 2026. 

## **Features inédites — Top 10 priorisées pour Lyxo** 

|**Feature**|**Description**|**Version**|
|---|---|---|
|Séance Fantôme de<br>soi-même|Voir en grisé ce qu'on soulevait exactement au même exercice,<br>même set, il y a 90 jours. Competition contre soi-même dans le<br>passé.|V2|
|Bataille de ville|Lyxo agrège le volume total soulevé par ville. Douala vs Abidjan vs<br>Paris en temps réel. Quand ta ville monte, tout le monde est notifié.|V2|
|Jumeaux de progression|Trouve l'utilisateur avec la courbe de progression la plus similaire aux<br>6 premiers mois. Montre où ce jumeau en est aujourd'hui.|V2|
|Saisons Lyxo|Toutes les 3 mois : nouvelle saison thématique, défis exclusifs,<br>badges limités dans le temps (disparaissent à la fin). Urgence<br>cyclique.|V2|
|Programme<br>communautaire|Coach fixe un seuil : si 50 personnes achètent ensemble, prix réduit<br>pour tout le monde. Acheteurs recrutent eux-mêmes leurs amis.|V2|
|Empreinte de force|Forme géométrique unique générée à partir des ratios<br>bench/squat/deadlift/OHP. Visible sur le profil public, unique comme<br>une empreinte digitale.|V2|
|Réseau de salles<br>partenaires|Salles qui partenèrent avec Lyxo reçoivent une page de profil.<br>Check-in via QR code. Salle voit ses stats agrégées. Réductions<br>croisées.|V2|
|Récit automatique de<br>progression|Paragraphe narratif mensuel auto-généré : pas des chiffres, une vraie<br>histoire. 'En mars, tu as traversé une période difficile...'|V3|
|Mode salle partagée<br>offline|Plusieurs users dans la même salle se lient via Bluetooth/QR code.<br>Voient en temps réel ce que les autres soulèvent. 100% offline.|V3|
|Partage programme par<br>SMS|Coach envoie son programme par SMS structuré. Destinataire entre<br>un code court dans Lyxo et le programme se charge. Zéro data<br>requise.|V3|



## **Features inédites — Top 10 suivantes (V3+)** 

|**Feature**|**Description**|
|---|---|
|Tempo tracker audio|L'app dicte le tempo via oreillette pendant un set : 'Descends... tiens... pousse...' Rythme<br>configurable.|
|Abonnement coach à la<br>performance|Coach propose : 'Tu paies 5 000 FCFA/mois, mais si tu bats 3 PRs ce mois, le suivant est<br>offert.' Lyxo vérifie automatiquement.|



|**Feature**|**Description**|
|---|---|
|Météo de ta forme personnelle|Prévision de forme pour les 2 prochaines semaines basée sur les patterns historiques.<br>'Cette semaine tu es probablement à 90% de ta forme.'|
|Tutorat de force gratuit|User avancé devient mentor d'un débutant. Voit ses logs, commente ses séances, reçoit<br>un badge quand le mentoré bat un PR.|
|Arbre généalogique de force|Quand tu bats le PR d'un ami tu deviens son descendant. Chaque profil a un arbre<br>généalogique visuel de qui a battu qui.|
|Lyxo Radio|Stream audio communautaire : sons d'ambiance de salle. Quand quelqu'un bat un PR<br>dans ta ville pendant ta séance, tu entends une cloche.|
|Score d'équilibre musculaire|Calcule en permanence les ratios entre muscles antagonistes. Alerte si déséquilibre<br>dangereux se développe.|
|Mode famille|1 abonnement Lyxo+ partageable entre 3-5 membres de la même famille. 6 000<br>FCFA/mois pour la famille entière.|
|Défi intergénérationnel|Performance normalisée par âge. Un homme de 55 ans peut battre un homme de 25 ans<br>selon le % de leur max relatif.|
|Quête de l'exercice impossible|Exercice rare accompli par moins de 5% des users. Ceux qui y arrivent ce mois reçoivent<br>un badge Pionnier permanent.|



## **SOSA 2026 — Insights appliqués à Lyxo** 

Le rapport State of Subscription Apps 2026 de RevenueCat (115 000+ apps, 16 milliards$ de revenus, 1 milliard+ de transactions) fournit des benchmarks directement applicables à la stratégie de monétisation de Lyxo. 

|**Insight SOSA 2026**|**Chiffre clé**|**Application pour Lyxo**|
|---|---|---|
|Health & Fitness = meilleure<br>catégorie|RPI D60 : 0,66$ médian. RLTV Y1 :<br>35,64$. Trial-to-paid : 37,7%<br>médian.|Lyxo est dans la bonne catégorie. Le marché<br>valide le choix produit.|
|Day 0 est le seul moment qui<br>compte|55% des annulations de trial 3j<br>arrivent Jour 0. 82,1% des trial<br>starts H&F; sont Jour 0.|L'onboarding Lyxo doit permettre de logger le<br>premier set en moins de 5 minutes. C'est la priorité<br>absolue.|
|Plans annuels = 2x plus de RPI|Annuel : 0,46$ D60 RPI. Mensuel :<br>0,29$. 5x hebdo.|Annuel en DEFAULT sur le paywall. Mensuel en<br>option secondaire. Déjà implémenté dans l'Écran<br>A.|
|Trial 14 jours vs 3 jours : +70%<br>conversion|42,5% vs 25,5% trial-to-paid selon<br>durée.|Trial Lyxo+ = 14 jours. Pas 3 jours comme le font la<br>plupart des apps à tort.|
|MEA (Afrique) = seule<br>géographie à MRR négatif|Médiane MRR growth : -9,7% pour<br>MEA.|Diaspora Europe/USA = cible de monétisation<br>premium. Afrique = acquisition et volume. Structure<br>pricing validée.|
|31% annulations Android =<br>billing failure|Google Play : 31% involontaire.<br>App Store : 14%.|Configurer grace periods RevenueCat dès Phase 2<br>pour Android. Critique pour ne pas perdre des<br>abonnés sans qu'ils le veuillent.|



|**Insight SOSA 2026**|**Chiffre clé**|**Application pour Lyxo**|
|---|---|---|
|Freemium justifié quand réseau<br>social|Freemium 2,1% vs Hard paywall<br>10,7% D35. Rétention à 1 an<br>identique.|Lyxo gratuit = justifié car les users gratuits<br>génèrent le Discover, les PRs, et recrutent les<br>coachs.|
|Top 41% apps utilisent web<br>revenue|31x plus de web revenue pour les<br>top apps vs les petites.|Phase 3 : web checkout Stripe sur Android pour<br>éviter 30% commission Google. Lyxo garde 97%<br>sur ces transactions.|



## **02 PIÈGES TECHNIQUES & CORRECTIONS — ANALYSES 3 EXPERTES** 

Points critiques identifiés par analyse experte — à corriger avant de coder pour éviter des bugs coûteux. 

Chaque point ci-dessous est une décision technique non négociable. Ces corrections doivent être intégrées dans le CLAUDE.md et vérifiées lors de l'audit de sécurité en double passage (section 19). 

## **1. Format de build Android — AAB obligatoire, APK interdit sur Play Store** 

Google Play exige le format .aab (Android App Bundle) pour toutes les nouvelles applications depuis 2021. Un .apk soumis en production sera rejeté automatiquement. Les .apk ne sont tolérés que pour les tests locaux ou la distribution directe hors store. 

|**Format**|**Usage**|**Ce que Google génère**|**Taille pour l'user**|
|---|---|---|---|
|.apk|Tests locaux uniquement, beta<br>privée hors store|Rien — fichier direct|Lourd — toutes les ressources<br>incluses|
|.aab (OBLIGAT<br>OIRE)|Play Store production|APK optimisé pour chaque appareil|Léger — ressources de<br>l'appareil seulement|



## **Pourquoi c'est critique pour Lyxo** 

Le plan impose une taille de bundle < 30 MB pour les téléphones Android bas de gamme en Afrique (Tecno Spark, Infinix, Samsung A15 — peu de stockage disponible). 

Avec .aab, Google Play génère un APK sur mesure pour chaque téléphone : si l'user a un téléphone d'entrée de gamme, il ne télécharge que les ressources strictement nécessaires. 

Avec .apk, l'user reçoit toutes les ressources pour toutes les tailles d'écran et tous les processeurs — bundle inutilement lourd, risque de refus d'installation sur appareils saturés. 

```
# COMMANDE CORRECTE — génère un .aab automatiquement
```

```
eas build --platform android --profile production
```

```
# Le fichier .aab est disponible sur expo.dev après le build
```

```
# Soumettre via :
```

```
eas submit --platform android
```

```
# JAMAIS faire ça pour le Play Store :
```

```
# eas build --platform android --profile production --local
```

```
# (génère un .apk local, non acceptable pour le Play Store)
```

## **2. PawaPay remplace CinetPay/NotchPay comme hub principal Afrique francophone**
<!-- Phrase restaurée (audit doc) : un chercher/remplacer automatique avait
     produit "PawaPay remplace PawaPay". Historique : CinetPay → NotchPay →
     PawaPay (décision finale fin juillet 2026, PRICING.md §6). --> 

DÉCISION FINALE (fin Juillet 2026) : **PawaPay est le prestataire unique** pour toute l'Afrique — API v2 moderne (deposits avec idempotence native par depositId, metadata user_id dans les callbacks, payouts /v2/payouts pour la V2 marketplace), ~1% + frais MNO, et une couverture de 20+ marchés (Cameroun, CI, Sénégal inclus) sous UN seul contrat — le multi-pays Phase 3 ne demandera aucune réintégration. CinetPay puis NotchPay ont été écartés successivement (historique complet : PRICING.md §6). Le flux de facturation détaillé fait foi dans BILLING_FLOW.md ; la marketplace coach est repoussée en V2 (PRICING.md §4). 

|**Fournisseur**|**Couverture**|**Opérateurs inclus**|**Recommandation**|
|---|---|---|---|
|CinetPay / NotchPay|—|—|SUPPRIMÉS du projet (Juillet 2026 — nom restauré, audit doc)|
|PawaPay<br>(PRIMARY)|CI, Sénégal, Mali, Burkina,<br>Togo, Bénin, Cameroun|Orange Money, MTN MoMo, Wave,<br>Moov Money, Free Money|Principal — une seule<br>intégration couvre tout le<br>marché|
|Flutterwave|Nigeria, Ghana, Kenya + 30<br>pays|Mobile Money, cartes, virement|Expansion anglophone<br>Phase 3|



```
// Correction dans CLAUDE.md — Section 4 Stack Technique
```

```
// AVANT :
```

```
// Paiements Afrique : PawaPay (AVANT correction)
```

```
// APRÈS :
```

```
// Paiements Afrique : PawaPay UNIQUE (PawaPay supprimé)
```

```
// PawaPay = hub unique couvrant CI, SN, ML, BF, TG, BJ, CM en une API
```

## **3. iOS App Store — Restriction paywall strict** 

Contrairement à Android où proposer Stripe en parallèle de Google Play est légal, iOS impose des règles beaucoup plus strictes. Le modèle Spotify dual-paiement est moins applicable sur iOS hors Union Européenne. 

|**Plateforme**|**Règle**|**Action Lyxo**|
|---|---|---|
|Android (Play Store)|Stripe en parallèle 100% légal depuis décision Epic vs<br>Google|Proposer Stripe + Google Pay côte à<br>côte — modèle Spotify complet|
|iOS (App Store) — UE|Digital Markets Act force Apple à autoriser les liens<br>externes|Lien vers lyxo.app/subscribe dans les<br>pays UE uniquement|
|iOS (App Store) — hors<br>UE|Apple exige IAP exclusivement pour les abonnements<br>in-app|RevenueCat uniquement, pas de Stripe<br>direct possible|



## **Stratégie iOS recommandée pour le lancement** 

Au MVP : RevenueCat pour iOS partout dans le monde. Pas de Stripe direct. 

Phase 2 : Activer le lien web checkout uniquement pour les utilisateurs détectés en UE (via pays du compte Apple). 

Ne jamais mettre un bouton 'Payer moins cher sur notre site' sur iOS hors UE — banissement immédiat de l'App Store. 

Android reste la priorité absolue pour le marché africain (85% des devices) — iOS est secondaire au lancement. 

## **4. Workout Logger — Clavier numérique inline, pas modal** 

L'écran de séance doit afficher le clavier numérique custom directement intégré dans le bas de l'écran (inline), pas dans une modal qui s'ouvre et se ferme. Une modal ajoute un tap supplémentaire à chaque set — contraire à la règle des 3 secondes. 

```
// MAUVAIS — modal qui s'ouvre
```

`// User tape sur le champ` → `modal s'ouvre` → `saisit` → `ferme modal` 

```
// = 3 interactions pour saisir un poids
```

```
// CORRECT — clavier inline sticky en bas d'écran
```

```
// Le clavier numérique est TOUJOURS visible en bas
```

`// User tape directement sur le chiffre` → `validé` 

```
// = 1 interaction pour saisir un poids
```

```
// Implémentation React Native :
```

```
// KeyboardAvoidingView avec position='absolute' bottom=0
```

```
// Le clavier custom remplace totalement le clavier système
```

`// Swipe up/down sur l'input` → `+2.5kg / -2.5kg` 

## **5. Stories — Nettoyage des médias expiré via Edge Function** 

Les stories expirent après 24h. Il ne suffit pas de masquer les stories côté UI — les fichiers médias (photos, vidéos) doivent être physiquement supprimés de Supabase Storage pour éviter une accumulation de coûts de stockage. 

```
-- Supabase Edge Function (cron quotidien à 3h00 UTC)
```

```
-- Supprime les médias des stories expirées
SELECT storage.delete_object('stories', story_media_url)
FROM stories
WHERE expires_at < NOW() - INTERVAL '1 hour'
AND media_url IS NOT NULL;
```

```
DELETE FROM stories
WHERE expires_at < NOW() - INTERVAL '1 hour';
```

```
-- Règle : supprimer les médias AVANT les enregistrements DB
```

```
-- pour ne jamais avoir d'orphelins en storage
```

## **6. Nutrition — Recherche full-text avec debounce 300ms** 

La recherche d'aliments dans la base Open Food Facts ne doit pas déclencher une requête Supabase à chaque frappe de touche. Sans debounce, 1 mot de 5 lettres = 5 requêtes simultanées = surcharge de la DB et mauvaise expérience offline. 

```
// lib/nutrition/searchFoods.ts
import { useMemo } from 'react'
import debounce from 'lodash/debounce'
```

```
// Recherche déclenchée uniquement 300ms après le dernier caractère
```

```
const debouncedSearch = useMemo(
```

```
() => debounce(async (query: string) => {
```

```
if (query.length < 2) return // Min 2 caractères
```

```
// 1. Chercher d'abord dans WatermelonDB local (offline)
```

```
const localResults = await searchLocalFoods(query)
```

```
if (localResults.length >= 5) return setResults(localResults)
```

```
// 2. Si insuffisant, compléter avec Supabase
const remoteResults = await supabase
```

```
.from('foods')
.textSearch('name_fr', query, { type: 'websearch' })
.limit(20)
setResults([...localResults, ...remoteResults.data])
}, 300),
[]
)
```

## **7. Mobile Money PENDING — Notification push silencieuse au lieu de polling** 

Quand un paiement Mobile Money est en status PENDING, ne jamais faire de polling (vérification répétée toutes les X secondes). La bonne approche : le webhook PawaPay appelle le backend Lyxo qui envoie une notification push silencieuse à l'app pour débloquer le contenu. 

```
// MAUVAIS — polling toutes les 5 secondes
```

```
// setInterval(() => checkPaymentStatus(txId), 5000)
```

`//` → `épuise la batterie, surcharge l'API, mauvaise UX` 

```
// CORRECT — notification push silencieuse depuis le webhook
```

`// 1. PawaPay confirme le paiement` → `appelle POST /webhooks/pawapay/deposits` 

```
// 2. Backend met à jour payments.status = 'complete'  (§20.2)
```

```
// 3. Backend envoie push silencieuse via Expo Notifications :
await expo.sendPushNotificationsAsync([{
```

```
to: user.push_token,
```

```
_contentAvailable: true, // iOS silent push
priority: 'normal',
data: { type: 'PAYMENT_SUCCESS', program_id: programId }
}])
// 4. App reçoit la notification en background
```

```
// 5. App débloque le contenu sans que l'user ait rien fait
```

## **8. Data Saver Mode — Désactiver les animations Reanimated** 

En mode Data Saver, il ne suffit pas de remplacer les GIFs par des images statiques. Les animations React Native Reanimated (célébrations de PR, transitions) consomment du CPU sur les appareils bas de gamme. En mode Data Saver, toutes les animations non essentielles doivent être désactivées. 

```
// hooks/useAnimationConfig.ts
import { useAppStore } from '@/store/useAppStore'
export function useAnimationConfig() {
const dataSaver = useAppStore(s => s.dataSaver)
return {
enableAnimations: !dataSaver,
// En Data Saver : PR celebration = simple texte, pas confetti
prCelebrationStyle: dataSaver ? 'text' : 'confetti',
// En Data Saver : transitions = coupe franche, pas smooth
transitionDuration: dataSaver ? 0 : 300,
```

`// GIFs exercices` → `JPG statique` 

```
exerciseMediaType: dataSaver ? 'image' : 'gif',
```

```
}
}
```

## **9. Schéma DB — Champ payment_provider unifié** 

Le schéma DB de la section 5 référençait PawaPay et PawaPay séparément. Avec PawaPay comme hub principal, le champ payment_provider de la table payments doit être mis à jour. 

```
-- Correction table payments (section 5 du plan)
```

```
-- AVANT :
```

```
-- provider text CHECK (provider IN ('pawapay','revenuecat'))
```

```
-- APRÈS :
```

```
ALTER TABLE payments
```

```
DROP CONSTRAINT payments_provider_check,
```

```
ADD CONSTRAINT payments_provider_check
```

```
CHECK (provider IN ('pawapay','revenuecat'));
```

```
-- pawapay = prestataire unique Afrique (20+ marchés dont CM, CI, SN)
```

```
-- stripe = Europe, USA, web checkout Android
```

```
-- flutterwave = Afrique anglophone Phase 3 (NG, GH, KE)
```

```
-- revenuecat = App Store et Play Store (iOS/Android natif)
```

## **10. Bannière offline contextuelle — Pas systématique** 

La bannière 'hors ligne' ne doit s'afficher que dans les contextes où le contenu affiché dépend du réseau (Discover, Stories des abonnés). Sur l'écran de workout en cours, elle ne doit jamais apparaître — le tracker est 100% offline-first, afficher une bannière 'hors ligne' pendant une séance crée une anxiété inutile chez l'utilisateur. 

|**Écran**|**Bannière offline**|**Raison**|
|---|---|---|
|Home (workout en cours)|Jamais|Tracker offline-first — l'utilisateur n'a pas besoin de savoir|
|Log (séance active)|Jamais|Critique de ne pas distraire pendant l'entraînement|
|Progress (graphes)|Jamais|Données locales WatermelonDB — toujours disponibles|
|Discover (feed public)|Oui si cache > 1h|Contenu dépend du réseau — l'utilisateur doit savoir|
|Stories des abonnés|Oui si cache > 1h|Même raison — contenu temps réel|
|Profil public d'un autre user|Oui si hors ligne|Données distantes non disponibles hors ligne|



## **Récapitulatif des corrections à ajouter au CLAUDE.md** 

1. Build Android → toujours .aab via EAS, jamais .apk pour le Play Store. 

2. Paiement Afrique → PawaPay (UNIQUE) couvre CI/SN/ML/BF/TG/BJ/CM. PawaPay supprimé. 

3. iOS → RevenueCat uniquement hors UE. Lien web checkout UE seulement en Phase 2. 

4. Workout Logger → clavier inline sticky, jamais modal. Swipe +/-2.5kg sur les inputs. 

5. Stories → Edge Function cron quotidien supprime les médias expirés de Supabase Storage. 

6. Nutrition search → debounce 300ms, min 2 chars, local d'abord puis Supabase. 

7. Mobile Money PENDING → push silencieuse depuis webhook, jamais polling. 

8. Data Saver → désactiver Reanimated animations + GIFs + transitions simultanément. 

9. Table payments → provider CHECK updated : pawapay / revenuecat (source de vérité : BILLING_FLOW.md §3). 

10. Bannière offline → uniquement sur Discover et Stories, JAMAIS sur Workout/Progress. 

## **Résumé exécutif final — LYXO V14** 

App : LYXO — lyxo.app — Tracker de musculation social, offline-first, marché mondial. Cible : Afrique francophone (lancement) + diaspora Europe + expansion mondiale Phase 3+. Stack : React Native + Expo / Claude Code / Supabase / WatermelonDB / PawaPay / RevenueCat. 3 Tiers : Gratuit (réseau + tracker) / Lyxo+ (intelligence + immersion) / Coach Pro (SaaS B2B). Pricing : voir PRICING.md (source unique) — 3 500 FCFA/mois · 15 000 FCFA/an (Afrique), 34,99€/an default (Europe), Coach Découverte gratuit → Coach Pro 7 000 FCFA/mois. Paywall géolocalisé : RevenueCat (iOS partout + Android Occident) + vente web PawaPay lyxo.app/plus (Android Afrique). 

Build : .aab obligatoire pour Play Store. .apk uniquement pour tests locaux. 

Pièges évités : clavier inline, bannière contextuelle, push silencieuse, Edge Function nettoyage. Features inédites V2 : Séance Fantôme, Bataille de ville, Jumeaux de progression, Saisons Lyxo. SOSA 2026 : Trial 14j, annuel default, grace periods Android, Day 0 = priorité absolue onboarding. Domaine : lyxo.app | Bundle ID : com.lyxo.app | Tagline : Soulève plus. Ensemble. 

LYXO — Plan Complet V14 · lyxo.app · Lionel Mayi Mayi · Juin 2026 · Confidentiel 



---



> *NOTE V16.4 (audit doc, Juillet 2026) : corrections additionnelles faisant foi — (a) **Coach** : tier gratuit "Coach Découverte" = **3 clients / 1 programme / 20%** et Coach Pro = **7 000 FCFA/mois · 25 000 FCFA/an · $11.99/$89.99** (PRICING.md §3 — les mentions "5 clients", "15 clients" et "9,99 €/mois" dans ce document sont PÉRIMÉES) ; (b) **Dark mode ONLY** — le "light mode optionnel" (§2.8/§6) est abandonné (décision Braise) ; (c) prix Lyxo+ **3 500/15 000 FCFA** — les mentions "1 500-2 000 FCFA" sont périmées ; (d) bibliothèque = **200 exercices** ExerciseDB (pack 50 embarqué + 150 à la demande) — "500+" périmé ; (e) `expo-barcode-scanner` INTERDIT (deprecated, CLAUDE.md §16.4) — de toute façon lié à la nutrition, hors scope V1 ; (f) deep links = **App Links natifs**, Branch.io écarté (§19.4).*
> *NOTE V16.3 : PALETTE FINALE = "Braise" (fond #0B0A0A, cards #151312, ember mat #C73E3A accent unique, acier #3A3F47 structure, blanc os #F5F1EC — CLAUDE.md §19.11 + LYXO_UI_PROMPT.md font foi). Toute mention historique de #E63946/#3D9DF6 dans ce document décrit des itérations antérieures. De même : is_premium est un statut DÉRIVÉ (§20.1), les statuts payments utilisent 'complete' (§20.2), la langue FR/EN est choisie au signup (§19.5), les poids sont stockés en kg et affichés kg/lbs (§19.15).*
> *NOTE V16.2 : prestataire de paiement officiel : **PawaPay** (décision finale fin juillet 2026, remplace successivement CinetPay puis NotchPay — les mentions dans ce document ont été corrigées automatiquement). Détails faisant foi : PRICING.md §4 + BILLING_FLOW.md + CLAUDE_LYXO_V3.md §18-19.*
# SECTION 24 — ROADMAP OFFICIELLE V16 (remplace toute roadmap antérieure)

## MVP beta coachs — S1-S12 (SANS Discover public)

| Bloc | Contenu |
|---|---|
| S1-S2 | Setup projet, auth (email/Google/Apple), onboarding 2 étapes, i18n dès l'écran 1, design system |
| S3-S5 | Workout Logger complet (clavier custom, autofill, rest timer, PR detection + règles anti-triche), bibliothèque exercices + cache natif |
| S5-S7 | Sync WatermelonDB bidirectionnelle (soft-delete deleted_at, pagination 500 rows, idempotence) — LA partie la plus dure, ne pas la compresser |
| S8-S9 | Progress (graphes, heatmap ember 4 opacités #C73E3A — §19.11, PRs), profils, follow, suppression de compte |
| S10-S11 | Feed abonnés, stories 24h + overlay stats, Conquête + Trace + Leaderboard amis, push, signalement, Data Saver |
| S12 | Beta fermée : 10 coachs + leurs clients (APK direct / Play beta privée). Le recrutement des coachs a commencé à S1, en parallèle du code. |

## Phase 2 — S13-S16 (scénario optimiste)
- Discover public (trending via vue matérialisée, posts/commentaires publics, modération auto-hide 3 signalements)
- Polissage beta, écran résumé fin de séance (peak-end), skeletons
- Soumission Play Store (.aab) + App Store

## Phase 3 — post-lancement
- Paiements (vente web PawaPay + RevenueCat), paywalls, trial
- Coach Mode + marketplace (prérequis : vérification payouts PawaPay §18.9)
- Nutrition, Séance Fantôme, EN → Nigeria/Ghana

## Métrique de décision beta
J7 ≥ 40% = excellent · 25-40% = itérer · < 20% après 2 cycles = pivot Coach Mode B2B pur.

---

# SECTION 25 — COÛTS D'INFRASTRUCTURE (à tenir à jour)

| Poste | 0-100 users | ~1 000 users | ~10 000 users |
|---|---|---|---|
| Supabase | Free | Pro ~$25/mois (storage stories + Realtime) | Pro + usage ~$50-100/mois |
| Render (API) | Free (cold starts OK sans paiements) | Starter $7-25/mois (OBLIGATOIRE dès webhooks PawaPay) | $25-85/mois |
| RevenueCat | Free (< $2.5k MTR) | Free | ~1% MTR au-delà du seuil |
| Sentry / PostHog | Free | Free | Free → ~$26+/mois |
| Branch.io | Vérifier limites free tier AVANT intégration ; fallback liens web simples | idem | budget à valider |
| Comptes stores | $25 Google (one-time) + $99/an Apple | — | — |
| Traductions IA + relecture | ~$3 + relecture humaine (30 exos) | — | — |

Règle : aucune nouvelle dépendance payante sans ajout à ce tableau. Réviser ce tableau chaque fin de phase.

---

# SECTION 26 — RISQUES PRODUIT CHALLENGÉS (Juillet 2026)

1. **Triche leaderboard** : couverte par les règles anti-triche (CLAUDE.md 18.1). Sans elles, la Conquête et la Trace sont des jouets cassables en 1 minute.
2. **Trace = double tranchant** : expirable 6 mois + toggle masquage (18.2). À valider en beta AVANT d'en faire le pilier marketing.
3. **Conquête & RGPD** : opt-out + mention privacy policy (diaspora UE).
4. **Mur des 90 jours** : annoncé à l'onboarding + notif J75 — jamais de surprise.
5. **Chicken-and-egg coachs** : le recrutement des 10 coachs est une tâche de TERRAIN qui démarre S1 (kit coach PDF, visites de salles Douala, pitch en personne). Une app finie sans coachs = échec assuré.
6. **Charge solo** : 16 semaines est OPTIMISTE avec MboaTV + études + soutenance en parallèle. Tout glissement se gère en coupant du scope Phase 2, jamais en compressant la sync (S5-S7).
