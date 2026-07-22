# LYXO_UI_PROMPT.md — Prompt de génération UI · v5 "Braise" — PALETTE OFFICIELLE
# Décision finale Juillet 2026 (Glace archivée). Logos fournis (voir §Brand).
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

## Brand Assets (real logos exist — describe, match, never reinvent)
- MONOGRAM: "LX" — heavy angular geometric letterforms, the L and X
  interlocking/overlapping in one solid block, sharp diagonal cuts,
  stencil-like construction. Used for: app icon, splash, avatars
  fallback, favicon.
- WORDMARK: "LYXO" — bold industrial stencil typeface, sharp angular
  cuts and notched joints, heavy uniform weight, slightly condensed.
  Used for: splash, headers, shareable PR/story cards.
- Both render in bone white #F5F1EC on dark backgrounds (source files
  are black on white — invert for the app). Never stretch, never add
  effects/glows/gradients, never recolor in ember (logo stays neutral;
  ember is for actions).
- App icon: LX monogram bone-white on #0B0A0A, generous padding.

## Design Style
- Dark mode ONLY — this is a night-gym, high-contrast aesthetic
- Ultra modern 2026 fitness startup, NOT corporate, NOT generic gym-bro clipart
- **Numbers ARE the visuals**: big bold data (weights, reps, PRs) is the hero of every screen INSIDE the app — no photos with embedded text, no AI-generated photos EVER
- **⚡ DÉCISION Juillet 2026 — EXCEPTION PHOTO HERO (écrans d'entrée uniquement)** :
  la photographie RÉELLE (stock licenciée, vrais humains, visages autorisés)
  est permise comme hero sur les écrans PRÉ-AUTH uniquement (Splash
  variante, Welcome/pitch, écrans marketing/store listing). Règles :
  - Photos RÉELLES uniquement — **les photos générées par IA restent
    INTERDITES partout, sans exception** (licence stock vérifiée)
  - Traitement sombre obligatoire : gradient overlay #0B0A0A ≥ 60 % du
    bas vers le haut (le texte reste sur zone sombre, contraste AA)
  - Ambiance salle authentique, universelle — aucun marqueur régional/
    culturel (règle §19.8 inchangée), jamais de texte incrusté
  - Asset embarqué (WebP, ≤ 200 Ko), jamais téléchargé au premier
    lancement (offline-first, Data Saver)
  - DANS l'app (logger, feed, PR cards, résumés, profils), rien ne
    change : data is the hero, avatars = INITIALES (jamais de photo de
    profil imposée), zéro photo décorative
- Brutal simplicity: the workout logger must be usable mid-set with shaky hands at 2 meters distance
- Soft rounded corners (12–16px radius), cards floating on pure dark
- Large tap targets (minimum 56px) for anything used during a workout
- Skeleton loading states (#141414 animated), never blank screens
- Confident, competitive, energetic vibe — "the seum", rivalry, earned pride

## Color Palette "Braise" (STRICT — do not deviate)
- Background: #0B0A0A (charcoal, faintly warm) · Cards: #151312 ·
  Inputs: #1E1B1A · Borders: #2C2826
- Secondary text: #8E8781 · Primary text: bone white #F5F1EC
- **Ember red #C73E3A** = the ONE accent: deep, MATTE, like heated metal —
  never fluorescent, never #FF0000, never glossy.
  MAXIMUM 1 CTA button + 1 badge per screen. PR deltas (+5 kg), focus
  underlines, chart line, story rings, heatmap (4 opacities of #C73E3A,
  off cells #1E1B1A), Conquest/Trace rivalry markers
- **Steel gray #3A3F47** = secondary structure: active segments, tags,
  chart grids, verified badges — there is NO blue in this system, ember
  red is the only voice of emotion
- The mood: smoldering embers — quiet effort, a revenge being prepared.
  Rivalry cards ("Record battu par…") carry the ember accent naturally;
  this palette IS the seum.
- Ember buttons: bone-white text on #C73E3A fill
- FORBIDDEN: bright orange, yellow, green, pink, purple, neon, warm
  gradients, glow effects, nebula/cosmic backgrounds
- Destructive actions (delete account): muted gray text — the ember red
  is reserved for competition, never for danger

## Typography
- Inter (or SF Pro style), sentence case EVERYWHERE
- FORBIDDEN: ALL-CAPS letterspaced labels, developer notation ("PROGRAM.HYPERTROPHY"), technical badges ("WEBP-OPTIMIZED")
- NO human faces anywhere: avatars are bone-white INITIALS on #1E1B1A circles with a thin steel-gray ring (LX monogram as default avatar fallback)
- Values always bigger than their labels: 82,5 kg in Inter Black 36px+, label 12px below
- French UI, French number formats: 3 500 · 15 000 · 82,5 kg (comma decimal, space thousands)
- Only English words allowed: "LYXO" wordmark, "Log", "Discover", "RPE"

## Navigation (identical on every screen, sentence case)
Accueil · Log · Progrès · Discover · Profil
> ⚠️ Discover pendant le MVP (Phases 1-7) : l'onglet ne doit JAMAIS être
> un écran mort (guidelines Material/Apple 4.2 — risque de rejet
> "fonctionnalité inachevée"). Deux options actées : (a) masquer l'onglet
> (nav à 4 items) tant que la Phase 8 n'est pas livrée, ou (b) placeholder
> à contenu réel : les programmes des 10 coachs beta (cohérent avec
> "Discover non-vide au jour 1", PROJECT_BRIEF §3). Décision à trancher
> au Bloc A3 — jamais un écran vide.

## Screens

### 1. Splash
LYXO stencil wordmark (real brand asset) centered in bone white on #0B0A0A, LX monogram above it, a single thin ember underline accent, no photography, no glow.

### 1bis. Language (PREMIER écran absolu, avant tout — CLAUDE.md règle
language.tsx : ce choix précède même l'auth/inscription)
Full-screen minimal, LYXO wordmark small at top. Two large pill buttons:
"Français" (pre-selected/highlighted) and "English". Single ember CTA
"Continuer" below, disabled until a language is picked. No skip option —
this screen is mandatory and blocking before Auth.

### 1ter. Welcome (pitch — the ONLY photo-hero screen, PHOTO HERO EXCEPTION)
Full-bleed REAL stock photo hero (authentic dark gym atmosphere, real
human, universal — no regional markers, NEVER AI-generated), #0B0A0A
gradient overlay ≥ 60 % bottom-up so all text sits on dark:
- "Passer" skip link, muted, top-right (skips ONLY this pitch — lands on
  Objectif, which is never skippable)
- Headline Inter Black 36 px bone white: "Soulève plus. Ensemble."
- Subtitle 16 px muted: "Tes séances enregistrées même sans réseau.
  Tu ne perdras jamais une séance."
- Progress dots ● ○ ○
- Single ember CTA "Commencer" (thumb zone) + muted link below:
  "Déjà un compte ? Se connecter" (→ Login screen)
- Hero asset: bundled WebP ≤ 200 Ko — LOCAL, therefore zero data cost
  (Data Saver is not yet configured at first launch and is irrelevant
  here — fiche 11 comité)
- Alternative data-hero variant (animated fake logger block: a weight
  incrementing, a set validating) kept ONLY as a post-beta A/B test
  (PostHog)
- **ARBITRAGE (fiche 5 comité) : this Welcome screen IS `offline.tsx`**
  (pitch + offline promise fused in ONE screen — CLAUDE.md §7/§15.6
  annotated accordingly). The offline message lives HERE and nowhere
  else in the pre-auth flow.

### 2. Onboarding PRÉ-auth (pattern IKEA : l'user CONSTRUIT avant de s'inscrire)
Séquence complète pré-auth : Langue (1bis) → Welcome/Offline fusionné
(1ter, voir PHOTO HERO EXCEPTION) → Objectif → Split → Auth (3). Choix
stockés en AsyncStorage (`onboarding_goal`/`onboarding_split`, LLD §4)
puis poussés via PATCH post-login (API_SPEC §4.2 — pas seulement au
signup email : l'OAuth ne transporte pas raw_user_meta_data).
- (La promesse offline vit sur le Welcome 1ter UNIQUEMENT — pas de card
  offline redondante ici, fiche 5 comité)
- **Objectif screen**: 3 large selectable cards (Force · Masse ·
  Régularité) — data-card style, selected card gets thin ember underline
- **Split screen**: PPL / Upper-Lower / Full Body as data-cards (days
  preview inside each card), selected = ember underline
- **Progress gauge NEVER at 0%** (goal gradient): la jauge démarre avec
  la première étape déjà cochée — **3 étapes visibles au total**
  (Objectif → Split → Compte) : "Étape 1/3 ✓" dès l'écran Objectif
- Progress dots, single ember CTA "Continuer"

### 2bis. Onboarding POST-auth (trou de spec comblé — fiche 15/18 comité)
Après la création du compte (écran 3), avant l'Accueil. **Aucune jauge
de progression ici** (décision fiche 18 : ce sont des écrans
administratifs courts < 15 s, pas des étapes "de construction" — la
jauge 3/3 de l'onboarding pré-auth reste acquise, on ne la prolonge ni
ne la réaffiche à 0). Continuité visuelle simple (même style de card),
transition directe vers l'écran suivant :
- Country selector + weight unit selector (kg pre-selected · lbs) —
  alimente `billing_region` (calculé serveur, §19.1) et `weight_unit`
- Data Saver proposal card ("Économiser tes données ?")
- History rule announcement: "Ton historique complet est conservé pour toujours. L'affichage gratuit couvre les 90 derniers jours."
- Pseudo field with suggestion hints (si pas déjà saisi à l'écran 3)
- Single ember CTA "Continuer" → Accueil

### 3. Auth — Inscription (Sign Up hub)
(Language already chosen on the mandatory Language screen — NOT
re-selected here.)
- **Endowment framing**: the screen opens with a recap card of what the
  user just built — "✓ Ton programme Push/Pull/Legs est prêt" + subtitle
  "Crée ton compte pour le sauvegarder". Micro-interaction: the chosen
  split card slides up from the previous screen into this recap
  (continuité de possession). Progress gauge shows momentum (never 0 %).
- **Social logins first** (56 px, surface #1E1B1A, official monochrome
  logos, bone-white text — NEVER ember): "Continuer avec Google" ·
  "Continuer avec Apple". ⚠️ Platform rule (fiche 9 comité): **Android
  V1 = Google + email ONLY — the Apple button exists ONLY on the iOS
  build**, where it is FIRST and strictly equal in size/style to Google
  (App Store Review 4.8 — never visually diminished). No Apple web-flow
  on Android (cost + friction for zero users).
- Pseudo field: uniqueness checked with a 300 ms debounce (light
  endpoint) ; the entered pseudo travels in raw_user_meta_data (email
  path) AND in the post-login PATCH (universal path, API_SPEC §4.2) —
  the SQL fallback generation only serves OAuth users who skip it
- Divider "ou" (muted) → email + password inputs (56 px, #1E1B1A,
  password visibility toggle 👁), pseudo field with suggestion hints
- Single ember CTA: "Continuer" — never "S'inscrire" as primary label
  (commitment weight); loading state = spinner INSIDE the button
  (disabled), never a full-screen overlay
- Legal reassurance 12 px muted (NO checkbox — implicit consent on CTA
  is the standard, a checkbox is pure friction): "En continuant tu
  acceptes les Conditions et la Politique de confidentialité" (both are
  tappable links → lyxo.app/privacy)
- Muted switch link: "Déjà un compte ? Se connecter"

### 3bis. Auth — Connexion (Log In)
- Back chevron. Title 24 px: "Content de te revoir" · subtitle muted:
  "Tes barres t'attendent."
- Same social buttons + platform order rules as screen 3
- Divider "ou" → email + password (visibility toggle) ; muted link
  "Mot de passe oublié ?" placed BEFORE the CTA
- Single ember CTA "Se connecter"
- Muted switch link: "Pas encore de compte ? Créer mon compte"
  (→ screen 3 ; passes through Objectif/Split only if not yet chosen)

### 3ter. Auth — États d'erreur (mapping Supabase → UX)
- Errors are INLINE under the faulty field (never a toast for form
  errors), 14 px, bone white on card — NEVER ember (ember = competition,
  never errors/danger) ; field border turns #8E8781 ; 200 ms horizontal
  shake + error haptic
- `invalid_credentials` → "Email ou mot de passe incorrect." (never
  reveal WHICH field is wrong — security)
- `user_already_exists` → "Un compte existe déjà avec cet email.
  Se connecter ?" (the error becomes a shortcut — tappable)
- weak password → "8 caractères minimum."
- OFFLINE (the Lyxo case): dedicated state — "Connexion requise pour
  créer ton compte. Tes choix sont gardés — réessaie dès que tu as du
  signal." + "Réessayer" button + auto-retry on network return (NetInfo).
  Objectif/split live in AsyncStorage: NOTHING is lost, say it.
- **OAuth cancelled** (user taps back on the Google/Apple system sheet):
  silent return to the auth screen, state intact, NO error message —
  cancelling is not an error (fiche 8 comité)
- App killed between screens: the flow resumes exactly where it was
  (AsyncStorage) — never back to zero (gauge-never-at-0 coherence)

### 3quater. Mot de passe oublié (flux complet — fiche 7 comité)
Décision : confirmation d'email Supabase DÉSACTIVÉE en V1 (PRD 3.1).
Le reset est le seul flux email d'auth :
1. Screen "Mot de passe oublié" (from 3bis link): single email input +
   ember CTA "Envoyer le lien" → success state: "Email envoyé. Vérifie
   ta boîte de réception." (specific, no infinite spinner)
2. Email deep link `lyxo.app/reset/{token}` (added to the App Links
   list — PROJECT_BRIEF non-goal 6 web pages) opens the app on:
3. Screen "Nouveau mot de passe": password input + visibility toggle +
   "8 caractères minimum" helper + ember CTA "Enregistrer" → auto-login
   → Accueil. Expired token → "Lien expiré" + CTA "Renvoyer l'email".

### 4. Accueil (Home)
- Header: date, SAVER badge (if Data Saver on), sync dot
- **Week strip** (directly under header): 7 day pills — ember checks on
  completed workout days (the checks ARE the streak, visible in 200 ms),
  steel #3A3F47 pill on today, muted dots on planned rotation days.
  Tap a past day = that day's history. Remaining-goal line under the
  strip: "Plus qu'1 séance pour ta semaine" (muted, specific number).
  Micro-interaction: today's check animates in when a workout is finished.
  (This strip REPLACES the old "Ton activité" text block.)
- "Séance du jour" card: program name ("Hypertrophie"), workout title max 28px, exercise preview — PRE-RESOLVED by the split rotation (smart default)
- Single ember CTA: "Commencer la séance" (bone-white text on #C73E3A) —
  launches the resolved workout DIRECTLY, zero selection step. Secondary
  muted text link below: "Changer de séance"
- Conquest notification card: "Ton record au développé couché a été battu par @massalifts" + white outline button "Récupérer mon titre" (keeps its visual priority — hook n°1)

### 4bis. Historique d'un jour (tap on a week-strip day)
Small focused screen — one screen does one thing:
- Header: named day ("Vendredi 18 juillet"), back chevron
- Workout cards of that day (usually one): title, Volume · Durée · PRs
  compact stat row — tap opens the full workout detail
- Empty state (planned day, no workout): "Aucune séance ce jour-là" +
  muted context line ("Jour prévu : Push") — never a blank screen
- No CTA on past days (history is consultation, not action)

### 5. Workout Logger (THE critical screen)
- Header: exercise name + "Série 3/5" (position in EXERCISE), recording dot, chrono, "Synchronisé ✓"
- **Session ring** (right side of header, 24 px): ember arc on steel
  track, "12/18" sets at center — position in the SESSION, readable in
  peripheral vision. Micro-interaction: the arc increments with a slight
  overshoot + haptic at each validated set (continuous visual reward
  between PRs). Never a second ring on this screen (1-accent discipline).
- Weight and reps as EQUAL side-by-side hero blocks: "82,5 kg | 8 reps", focused block underlined ember, tap-to-edit
- **PR proximity micro-line** under the weight block (when relevant):
  "PR : 100 kg — à 2,5 kg" in muted #8E8781 ; the delta turns ember ONLY
  if the entered set beats it (goal gradient, single number never a range)
- **Swipe up/down on the weight block = ±2,5 kg** (±2.5/±5 lbs in lbs
  mode) — in addition to steppers
- Custom sticky number keyboard, unit-aware steppers at 56px minimum (±2,5 kg in kg mode; ±2.5/±5 lbs in lbs mode)
- **Exercise & template selection = BOTTOM SHEETS over the logger**
  (sticky search field at top of sheet, recent exercises first, muscle/
  equipment chips) — NEVER a separate screen that breaks session context
- **Bottom nav HIDDEN during an active session** — only "Valider la
  série" (ember) and "Terminer la séance" (sticky bottom, thumb zone)
  exist; nav reappears on session end
- **Long-press on a past set row** = secondary actions (modifier /
  supprimer) with background blur — mobile right-click, zero UI clutter
- Ember CTA "Valider la série" (only ember element), done sets marked with bone-white checks on steel gray
- Session history list below, "Terminer la séance" with flag icon
- Micro-confirmation toast: "Enregistré sur ton téléphone ✓" ; rest
  countdown always numeric and specific ("Prochaine série dans 90 s")

### 5bis. Résumé de fin de séance (peak-end — the dopamine screen)
Transporter, pas informer. One scroll direction, zero double-nested cards:
- HERO: total volume in Inter Black 64 px bone white ("8 400 kg"),
  comparison delta vs previous same workout in ember ("+320 kg")
- Named day + workout: "Vendredi — Push day" (day names make it real)
- Duration · sets · exercises as compact stat row
- PRs of the session as stacked cards (same style as PR card, screen 7)
- Week-strip check animation plays here (today's ember check pops in)
- Ember CTA "Partager en story", ghost "Terminer"

### 6. Rest Timer (full screen)
- Giant countdown readable at 2 meters, progress ring in ember on steel-gray track, BEHIND digits at 30% opacity (ring drains with time)
- ±15 s buttons, "Passer le repos" — all values bone white, never neon
- "Prochaine série" preloaded card: next exercise, target "82,5 kg × 8"

### 7. PR Celebration
- Ember badge "Record de force", the shareable PR card AS the visual: #151312 card with 1px #2C2826 border, "Développé couché", 105 kg in Inter Black 64px bone white, "+5 kg" in ember, date, LYXO wordmark
- "RPE 10" (never "100% RPE")
- Ember CTA "Partager en story", ghost "Continuer"

### 8. Progrès (reference screen)
- Ember 1RM trend line on steel-gray grid, segmented control (active segment: bone-white text on #3A3F47 pill) "Mois · Trimestre · Année · Tout"
- **1RM estimé = ONE number, never a range**: "1RM est. 112,5 kg" —
  jamais "110-115" (a range = mental negotiation = hesitation)
- Personal records list with ember deltas
- **Stat tiles with micro-sparklines**: 20 px steel #3A3F47 sparkline
  under each value (volume/sem, séances/sem) — ember only on an active
  record trend
- Consistency heatmap: 4 opacities of #C73E3A, kg units — **with a
  4-level legend** ("moins → plus", 4 ember opacity swatches, off cells
  #1E1B1A)
- **Current streak as a specific number**: "3 semaines consécutives"
  (specificity is trust — never "belle régularité !")
- Free-tier boundary: sessions older than 90 days shown locked with soft Lyxo+ hint (verrou + hint, jamais un mur)

### 9. Feed (Abonnés)
- Compact auto-published workout cards: user, workout name, Volume · Durée · PRs stats row
- Story ring row at top (thin ember rings)
- Manual share = stories only; report action in overflow menu

### 10. Stories viewer + composer
- Composer: default "Carte stats" (dark data card) OR "Ajouter ma photo" (photo with stats overlay: volume, duration, PRs, wordmark)
- Data Saver mode: blurred placeholder, photo loads on tap

### 11. Leaderboard & Rivalités
- PR leaderboard between mutual follows, raw weight, "hors classement" badge for implausible entries
- Trace card on profile: "Développé couché — 100 kg · Record battu par @massalifts le 12 juin 2026 · [Récupérer mon titre]"

### 12. Profil
- Avatar = bone-white initials on #1E1B1A circle with 1px steel-gray ring, verified badge in steel gray, neutral bio (no city/region markers)
- Stats in 3-column grid: values Inter Black 28px, labels 12px below
- Ember heatmap (same style as Progrès), tabs, private account lock state
- "(90 derniers jours) · Offre gratuite" subtle freemium reminder
- Ember allowed here only on "Récupérer mon titre" if it is the sole ember CTA — this is the screen where the palette earns its name

### 13. Coach — Dashboard clients (vue PRIVÉE du coach)
- Client cards (3 max shown + "Découverte" tier hint): last session, assiduity mini-heatmap, PR count
- WhatsApp button on client card (no in-app chat)
- "Inviter un client" ember CTA generating lyxo.app/invite/{code}
- (La vue PUBLIQUE du coach est un écran distinct — voir 13bis.)

### 13bis. Profil coach public (vu par un client potentiel — trou de spec comblé)
- Avatar = bone-white initials on #1E1B1A circle, verified badge in
  steel gray #3A3F47 — NEVER a photo
- 3-column stats grid, REAL numbers only (Inter Black 28 px): clients
  suivis · programmes créés · PRs battus par ses clients
- Program list rows: title + "suivi par N clients" (real count as social
  proof). ⛔ NO star ratings before marketplace V2 — empty stars are
  anti-proof
- Contextual CTA (the single ember element): "Suivre" (visitor) /
  "Inviter un client" (own profile)

### 14. Coach — Programme builder
- Free-structure program: exercises + séries × reps + charge cible ou %1RM, cycle length chosen by coach
- Assign-to-client flow, planned vs actual comparison view (ember = done, muted gray = missed)

### 14bis. Programme du jour (vue client — écran sous-spécifié, comblé)
The spine of the coach→client experience. ONE component, two uses:
interactive for the client, read-only for the coach (= the planned vs
actual view of screen 14 — same semantics, same code).
- Day title + thin progress bar under it (steel track, ember fill)
- Exercise rows: 40 px GIF thumbnail (local pack), exercise name,
  target "4×8 · 80 kg" right-aligned (single numbers, never ranges) —
  ember check when target sets are validated, muted gray when skipped
- Sticky bottom CTA (single ember element): "Commencer la séance" —
  opens the logger pre-filled with this program
- Skeleton state: 3 row silhouettes in #141414 (exact final shape)

### 15. Paramètres
- Data Saver toggle, weight unit (kg / lbs), "Séances privées par défaut", "Notifications de rivalité" opt-out, "Masquer les titres perdus", language, "Supprimer mon compte" (destructive, muted gray text — no red in this palette)
- **"Objectif hebdo" (1-7 séances, stepper)** + **"Mon split"** (fiche 4
  comité) — with the product reminder inline: changing the weekly goal
  never recalculates past weeks (PRD 1.2bis)
- **"Partage de statistiques d'usage" opt-out** (analytics PostHog —
  fiche 10 comité, base légale intérêt légitime + opt-out)
- Account deletion requires re-authentication before the API call
  (SECURITY_NOTES §3bis.2)

### 16. Paywall Afrique (informative — NO payment button, NO payment brands)
- "Lyxo+" benefits list in French: "Historique illimité", "Progression automatique", "Programmes de coachs"
- Prices: "Pass Mensuel — 3 500 FCFA / mois" · "Pass Annuel — 15 000 FCFA / an" with badge "Meilleure valeur" (ember)
- CTA "Commencer mes 14 jours gratuits" (trial — the single ember button)
- **Trial transparency sub-text (under the CTA)**: "Aucun paiement
  demandé. À J14, retour au gratuit — tes données restent intactes."
  (addresses the "paiement sans reçu" distrust of the Massa persona —
  the ONLY trial on the market with zero real risk, say it)
- **Trial timeline** (vertical, 3 steps — steel #3A3F47 line, ember
  dots): "Aujourd'hui — tout Lyxo+ débloqué" · "J12 — on te prévient
  que l'essai se termine" · "J14 — retour au gratuit, tes données
  restent intactes" (transparency bias: announcing the end builds trust)
- Informational line only: "Consulte l'email que nous venons de t'envoyer pour les prochaines étapes" — NO site name, NO URL, NO verb like "payer/activer/s'abonner", NO mention of where/how to pay anywhere in-app (Google Play compliance, confirmed in writing July 2026 — see BILLING_FLOW.md §9)
- STRICT: no payment-provider names, no operator logos, no "paiement sécurisé" wording, no external link or URL of any kind anywhere IN THE APP — all trust markers AND the actual payment call-to-action live exclusively in the email and on the web payment page
- ALT STATE (required): if `trial_used = true`, the trial CTA is REMOVED (it would 409 TRIAL_ALREADY_USED) — the screen shows benefits + the informational line only
- PRICE DISPLAY: ✅ CONFIRMED COMPLIANT IN WRITING (4th Google Play Support answer, July 2026 — archived BILLING_FLOW §9ter): the FCFA price grid + "Meilleure valeur" badge IS permitted as product information on this consumption-only screen, provided there is no button, link, URL, or payment CTA. Keep the price grid; the price-free variant stays available behind a feature flag as a safety fallback only
- French number formats strictly: 3 500, never 3,500

### 16bis. Paywall international (billing_region = intl_iap — RevenueCat)
The "safety net, not sales pitch" paywall (winning A/B pattern):
- Headline: "Comment fonctionne ton essai" — NOT a feature pitch
- **Trial timeline** (vertical, 3 steps — steel line, ember dots):
  "Aujourd'hui — tout débloqué" · "J12 — on t'envoie un rappel avant la
  fin" · "J14 — premier débit. Annulable à tout moment avant."
  (the J12 line does more psychological work than any feature list)
- Price anchoring: **Annual plan FIRST in the layout** (34,99 € — "Soit
  2,92 €/mois", badge "Meilleure valeur" ember), monthly as secondary
  TEXT option below ("Ou le mensuel à 4,99 €/mois")
- Single ember CTA: "Commencer mon essai — 2 taps" (start verb + "mon"
  possessive + numeric specificity ; never "S'abonner" as primary label)
- Discreet muted links (required): "Restaurer les achats" · "Annuler mon
  abonnement" (Paramètres link)
- Benefits list SHORT and only features live at this date (never a V2
  feature on the paywall)

## Direction
Design like a real global Play Store fitness startup product. UNIVERSAL design: no regional, cultural, or geographic markers of any kind — the app must feel equally native in Paris, Lagos, New York, or Douala. Every screen connected through one cohesive dark design system where DATA IS THE HERO. The experience should feel: fast, competitive, proud, trustworthy, offline-solid, premium without luxury clichés — built for real gyms anywhere — solid offline, strong friendships.

STRICT RULES — NEVER BREAK:
1. French UI on mockups (except LYXO, Log, Discover, RPE) · French number
   formats. (In the real app the user picks FR/EN at signup — mockups
   are generated in French, the launch-market default.)
2. Sentence case everywhere · no ALL-CAPS letterspacing (except wordmark)
3. Identical nav on all screens: Accueil · Log · Progrès · Discover · Profil
4. Ember red #C73E3A: max 1 CTA button + 1 badge per screen · secondary
   structure in steel gray #3A3F47 · everything else bone white — the
   ember must stay MATTE, never fluorescent
5. No bright-orange/yellow/green/pink/purple/neon · heatmaps = 4 opacities
   of #C73E3A only · ember is reserved for competition and action, never
   for errors or danger (destructive = muted gray)
6. No AI-generated photos EVER. Real stock photography with human faces
   is allowed ONLY on pre-auth entry screens (Welcome/pitch — see the
   PHOTO HERO EXCEPTION in Design Style). Inside the app: no photos,
   initials avatars only, no text embedded in images, no glow/nebula/
   cosmic decor, no anatomy art, no technical badges — visuals are data
   cards: big Inter Black numbers
7. No developer notation in labels · no payment brands/logos anywhere in-app
8. Tap targets ≥ 56px for in-workout controls
9. Values always larger than labels · max information density ~60%,
   generous negative space
10. Only these neutrals: #0B0A0A background, #151312 cards, #1E1B1A inputs,
    #2C2826 borders, #8E8781 secondary text, #F5F1EC primary text
11. ONE single full-frame screen per generation — never a grid of thumbnails
12. In-session context is sacred: exercise/template pickers are BOTTOM
    SHEETS over the logger (sticky search on top, recents first, steel
    filter chips) — never a separate screen; bottom nav is HIDDEN during
    an active session; long-press = secondary actions with background blur
13. Numbers are always SINGLE and SPECIFIC: one 1RM value (never a
    range), "90 s", "2 taps", "3 semaines consécutives" — specificity is
    trust; remaining-goal framing preferred ("plus qu'1 séance")
14. Gauges/progress NEVER start at 0% (goal gradient): onboarding gauge
    starts with step 1 checked; profile never shows "0 séance" — the
    empty state invitation replaces it
15. Empty states are invitations, skeletons are silhouettes: empty feed =
    "Ton feed attend tes partenaires d'entraînement" + outline CTA
    "Inviter par WhatsApp"; empty exercise search = suggestion ("Essaie
    'développé'") + "Créer cet exercice"; skeleton = the EXACT silhouette
    of the final card in #141414 animated — never a generic spinner
16. Assumed ANTI-patterns (never debate again): no full-ember hero card
    (Inter Black typography IS the hierarchy), no floating FAB (conflicts
    with 1-ember-CTA rule — the Log tab may only be slightly larger/
    bolder), no photo/video hero INSIDE the app (data is the hero —
    exception: real-photo hero on pre-auth entry screens per the PHOTO
    HERO EXCEPTION, AI photos banned everywhere), no cardio/calories/
    water/steps metrics (non-goal 1), no smartwatch (non-goal 14), no
    artificial countdowns or guilt-tripping dismiss buttons ("I'll risk
    it") — loss-aversion lives ONLY in Conquête/Trace
17. Trial screens always show the 3-step transparency timeline
    (Aujourd'hui / J12 rappel / J14 fin) — steel line, ember dots;
    annual price always laid out BEFORE monthly (anchoring)
18. Accessibility floor: muted text #8E8781 is ~4.6:1 on cards #151312
    (AA borderline) — muted text is NEVER smaller than 14 px; below
    14 px, use bone white #F5F1EC only
