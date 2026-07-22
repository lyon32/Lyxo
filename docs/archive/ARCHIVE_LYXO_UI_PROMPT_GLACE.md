# ⛔⛔⛔ ARCHIVE — NE JAMAIS UTILISER POUR GÉNÉRER DES ÉCRANS ⛔⛔⛔
# Ce prompt est PÉRIMÉ et NON CONFORME :
# 1. L'écran 16 contient "Pour t'abonner, rends-toi sur lyxo.app" —
#    VIOLATION Google Play (verbe "s'abonner" + URL in-app = rejet ;
#    conformité écrite : BILLING_FLOW.md §4.1/§9).
# 2. L'écran 3 place le sélecteur de langue dans l'Auth — contredit la
#    règle language.tsx = premier écran absolu (CLAUDE.md §7/§8).
# 3. Palette Glace abandonnée (décision Braise, §19.11) et incohérente en
#    interne ("single red CTA" écran 2, "blue accent" écran 1, avatars
#    "amber" — couleurs interdites par sa propre palette).
# VERSION ACTIVE ET UNIQUE : LYXO_UI_PROMPT.md (v5 "Braise").
# Conservé uniquement pour l'historique des décisions design.
# ⛔⛔⛔ FIN DE L'AVERTISSEMENT ⛔⛔⛔

# LYXO_UI_PROMPT.md — Prompt de génération UI · v3 "Glace"
# Palette C (monochrome froid, cyan glacial) · Juillet 2026
# Conforme à : LYXO_Audit_Design_V2 (règles §3) + CLAUDE_LYXO_V3 §19 + IMPLEMENTATION_PLAN
# Rappel de méthode : générer UN SEUL écran par requête, plein cadre —
# jamais une grille de 20 miniatures. Coller d'abord Design Style +
# Palette + STRICT RULES, puis l'écran voulu.

---

Generate a complete modern mobile app UI design system and all screen designs for a social fitness tracking app called "LYXO".

LYXO is an offline-first gym workout tracker for everyone, everywhere, with a social layer that turns gym rivalry into motivation. Users log sets in under 3 seconds, track PRs and progression, follow friends, compete on leaderboards, and coaches manage their clients' programs.

The app helps users:
- Log gym workouts (weight × reps) extremely fast, fully offline
- Track personal records (PRs) and estimated 1RM progression
- View training consistency heatmaps and progress charts
- Follow friends and see their completed workouts in a feed
- Compete on PR leaderboards between mutual friends
- Receive "Conquest" notifications when a friend beats their record
- Reclaim lost titles ("Titre à reprendre" rivalry cards)
- Share workout stories (stat cards, optional personal photo + stats overlay)
- Follow coach-created training programs and track planned vs actual
- Coaches: build programs, invite clients via link, monitor client sessions

## Design Style
- Dark mode ONLY — this is a night-gym, high-contrast aesthetic
- Ultra modern 2026 fitness startup, NOT corporate, NOT generic gym-bro clipart
- **Numbers ARE the visuals**: big bold data (weights, reps, PRs) is the hero of every screen — no stock photography, no AI-generated photos, no photos with embedded text
- Brutal simplicity: the workout logger must be usable mid-set with shaky hands at 2 meters distance
- Soft rounded corners (12–16px radius), cards floating on pure dark
- Large tap targets (minimum 56px) for anything used during a workout
- Skeleton loading states (#141414 animated), never blank screens
- Confident, competitive, energetic vibe — "the seum", rivalry, earned pride

## Color Palette "Glace" (STRICT — do not deviate)
- Background: #0A0A0C · Cards: #131316 · Inputs: #1B1B1F · Borders: #26262B
- Secondary text: #85858E · Primary text: PURE WHITE #FFFFFF — the data
  itself is the brightest thing on screen, always
- **Glacial cyan #4FD8EB** = the ONLY accent in the entire app:
  MAXIMUM 1 CTA button + 1 badge per screen. PR deltas (+5 kg), active
  states, focus underlines, chart line, story rings, heatmap
  (4 opacities of #4FD8EB, off cells #1B1B1F)
- Everything that is not the single accent is white, gray, or background —
  a strictly monochrome cold system with one ice-cyan voice
- The rivalry energy comes from TYPOGRAPHIC WEIGHT and SCALE, not color:
  Conquest/Trace cards use huge Inter Black white numbers, tight dark
  cards, sharp 1px #26262B borders — cold, clinical, intimidating
- Cyan buttons: dark text #0A0A0C on cyan fill (contrast)
- FORBIDDEN: red, amber, gold, green, lime, pink, purple, warm tints of
  any kind, gradients, neon glow effects, nebula/cosmic backgrounds
- Destructive actions (delete account): muted gray text, not red

## Typography
- Inter (or SF Pro style), sentence case EVERYWHERE
- FORBIDDEN: ALL-CAPS letterspaced labels, developer notation ("PROGRAM.HYPERTROPHY"), technical badges ("WEBP-OPTIMIZED")
- NO human faces anywhere: avatars are INITIALS on night-blue or amber circles
- Values always bigger than their labels: 82,5 kg in Inter Black 36px+, label 12px below
- French UI, French number formats: 3 500 · 15 000 · 82,5 kg (comma decimal, space thousands)
- Only English words allowed: "LYXO" wordmark, "Log", "Discover", "RPE"

## Navigation (identical on every screen, sentence case)
Accueil · Log · Progrès · Discover · Profil

## Screens

### 1. Splash
LYXO wordmark centered on #0A0A0A, subtle blue accent, no photography.

### 2. Onboarding (3 cards)
- "Log ta séance en 3 secondes, même sans réseau" — big numbers mockup
- Country selector + Data Saver proposal card ("Économiser tes données ?")
- History rule announcement: "Ton historique complet est conservé pour toujours. L'affichage gratuit couvre les 90 derniers jours."
- Progress dots, single red CTA "Continuer"

### 3. Auth
Connexion / Inscription, email + Google + Apple, rounded #1B1B1F inputs, one cyan CTA, pseudo field with suggestion hints, **language selector (Français / English) — Français pre-selected**, chosen by the user at account creation.

### 4. Accueil (Home)
- Header: date, SAVER badge (if Data Saver on), sync dot
- "Séance du jour" card: program name ("Hypertrophie"), workout title max 28px, exercise preview
- Single cyan CTA: "Commencer la séance" (dark text on #4FD8EB)
- Conquest notification card: "Ton record au développé couché a été battu par @massalifts" + white outline button "Récupérer mon titre"
- "Ton activité" compact weekly stats, gray track with cyan fill

### 5. Workout Logger (THE critical screen)
- Header: exercise name + "Série 3/5", recording dot, chrono, "Synchronisé ✓"
- Weight and reps as EQUAL side-by-side hero blocks: "82,5 kg | 8 reps", focused block underlined cyan, tap-to-edit
- Custom sticky number keyboard, ±2,5 kg steppers at 56px minimum
- Cyan CTA "Valider la série" (only cyan element), done sets marked with white checks on gray
- Session history list below, "Terminer la séance" with flag icon
- Micro-confirmation toast: "Enregistré sur ton téléphone ✓"

### 6. Rest Timer (full screen)
- Giant countdown readable at 2 meters, progress ring in cyan on gray track, BEHIND digits at 30% opacity (ring drains with time)
- ±15 s buttons, "Passer le repos" — all values pure white, never neon
- "Prochaine série" preloaded card: next exercise, target "82,5 kg × 8"

### 7. PR Celebration
- Cyan badge "Record de force", the shareable PR card AS the visual: #131316 card with 1px #26262B border, "Développé couché", 105 kg in Inter Black 64px pure white, "+5 kg" in cyan, date, LYXO wordmark
- "RPE 10" (never "100% RPE")
- Cyan CTA "Partager en story", ghost "Continuer"

### 8. Progrès (reference screen)
- Cyan 1RM trend line on subtle gray grid, segmented control (active segment: white text on #1B1B1F pill) "Mois · Trimestre · Année · Tout"
- Personal records list with cyan deltas
- Consistency heatmap: 4 opacities of #4FD8EB, kg units
- Free-tier boundary: sessions older than 90 days shown locked with soft Lyxo+ hint

### 9. Feed (Abonnés)
- Compact auto-published workout cards: user, workout name, Volume · Durée · PRs stats row
- Story ring row at top (thin cyan rings)
- Manual share = stories only; report action in overflow menu

### 10. Stories viewer + composer
- Composer: default "Carte stats" (dark data card) OR "Ajouter ma photo" (photo with stats overlay: volume, duration, PRs, wordmark)
- Data Saver mode: blurred placeholder, photo loads on tap

### 11. Leaderboard & Rivalités
- PR leaderboard between mutual follows, raw weight, "hors classement" badge for implausible entries
- Trace card on profile: "Développé couché — 100 kg · Record battu par @massalifts le 12 juin 2026 · [Récupérer mon titre]"

### 12. Profil
- Avatar = white initials on #1B1B1F circle with 1px cyan ring, verified badge in cyan, neutral bio (no city/region markers)
- Stats in 3-column grid: values Inter Black 28px, labels 12px below
- Cyan heatmap (same style as Progrès), tabs, private account lock state
- "(90 derniers jours) · Offre gratuite" subtle freemium reminder
- Cyan allowed here only on "Récupérer mon titre" if it is the sole cyan CTA

### 13. Coach — Dashboard clients
- Client cards (3 max shown + "Découverte" tier hint): last session, assiduity mini-heatmap, PR count
- WhatsApp button on client card (no in-app chat)
- "Inviter un client" cyan CTA generating lyxo.app/invite/{code}

### 14. Coach — Programme builder
- Free-structure program: exercises + séries × reps + charge cible ou %1RM, cycle length chosen by coach
- Assign-to-client flow, planned vs actual comparison view (cyan = done, muted gray = missed)

### 15. Paramètres
- Data Saver toggle, "Séances privées par défaut", "Notifications de rivalité" opt-out, "Masquer les titres perdus", language, "Supprimer mon compte" (destructive, muted gray text — no red in this palette)

### 16. Paywall Afrique (informative — NO payment button, NO payment brands)
- "Lyxo+" benefits list in French: "Historique illimité", "Progression automatique", "Programmes de coachs"
- Prices: "Pass Mensuel — 3 500 FCFA / mois" · "Pass Annuel — 15 000 FCFA / an" with badge "Meilleure valeur" (cyan)
- CTA "Commencer mes 14 jours gratuits" (trial — the single cyan button)
- Informational line only: "Pour t'abonner, rends-toi sur lyxo.app — lien envoyé par email"
- STRICT: no payment-provider names, no operator logos, no "paiement sécurisé" wording anywhere IN THE APP — all trust markers live exclusively on the lyxo.app web payment page
- French number formats strictly: 3 500, never 3,500

## Direction
Design like a real global Play Store fitness startup product. UNIVERSAL design: no regional, cultural, or geographic markers of any kind — the app must feel equally native in Paris, Lagos, New York, or Douala. Every screen connected through one cohesive dark design system where DATA IS THE HERO. The experience should feel: fast, competitive, proud, trustworthy, offline-solid, premium without luxury clichés — built for real gyms anywhere — solid offline, strong friendships.

STRICT RULES — NEVER BREAK:
1. French UI on mockups (except LYXO, Log, Discover, RPE) · French number
   formats. (In the real app the user picks FR/EN at signup — mockups
   are generated in French, the launch-market default.)
2. Sentence case everywhere · no ALL-CAPS letterspacing (except wordmark)
3. Identical nav on all screens: Accueil · Log · Progrès · Discover · Profil
4. Glacial cyan #4FD8EB: max 1 CTA button + 1 badge per screen ·
   EVERYTHING else is pure white / gray / background — strict monochrome
5. No red/amber/green/lime/pink/purple/warm tints · heatmaps = 4 opacities
   of #4FD8EB only · rivalry intensity through typographic scale, not color
6. No AI photos, no stock photos, no human faces (initials avatars only),
   no text embedded in images, no glow/nebula/cosmic decor, no anatomy art,
   no technical badges — visuals are data cards: big Inter Black numbers
7. No developer notation in labels · no payment brands/logos anywhere in-app
8. Tap targets ≥ 56px for in-workout controls
9. Values always larger than labels · max information density ~60%,
   generous negative space
10. Only these neutrals: #0A0A0C background, #131316 cards, #1B1B1F inputs,
    #26262B borders, #85858E secondary text, #FFFFFF primary text
11. ONE single full-frame screen per generation — never a grid of thumbnails
