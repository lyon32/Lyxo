# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Skills — invoking the matching one is MANDATORY, and it happens FIRST

Before writing code, design, or a doc section, look up the task in the
table below and **invoke the listed skill with the Skill tool**. This is
not a suggestion to weigh: if a row matches, the skill gets loaded before
anything is produced. A skill read afterwards changes nothing about what
is already written. If several rows match, load them all.

Announce it in one short line (`> skill: expo-router`) so the choice is
visible and reviewable — never silently.

Only two ways out, and both must be stated out loud:
- **No row matches.** Say so in one sentence, then proceed. Do not go
  browsing the installed skills for something adjacent. **This table is
  the allowlist for LYXO**, not a starting point. (144 out-of-scope skills
  — Python, Go, Rust, Kubernetes, web3, MLOps, finance, PPTX — were
  deleted on 2026-07-30; the ~50 `seo-*` and web ones were kept on purpose
  for `lyxo-web/` when the site gets built.)
- **A row matches but the skill is wrong here.** Name the conflict and why
  (see "Project docs win" at the end), then proceed without it.

| Task at hand | Skill to invoke |
|---|---|
| Routes, navigation, `app/` layout, groups, modals, headers | `expo-router` |
| Overall RN app architecture, offline sync, native integration | `react-native-architecture` |
| RN styling, navigation patterns, Reanimated animations | `react-native-design` |
| Zustand stores, global state, server-state caching | `react-state-management` |
| Animations, transitions, micro-interactions, "make it feel alive" | `improve-animations`, `apple-design` |
| Naming a motion effect you can describe but not name | `animation-vocabulary` |
| Loading states, feedback, interaction polish | `interaction-design` |
| Auth, JWT, session handling, token refresh | `auth-implementation-patterns` |
| Postgres schema, RLS, migration SQL, slow query | `postgresql`, `sql-optimization-patterns` |
| Complex TS types, generics, utility types | `typescript-advanced-types` |
| Unit tests (Jest / Vitest), mocks, fixtures | `javascript-testing-patterns` |
| Tracking down a bug, profiling, root cause | `debugging-strategies` |
| Design tokens, theming, dark mode | `design-system-patterns`, `cwb-theming` |
| Any network request / API call / caching / offline fetch | `expo-data-fetching` |
| Dev build, dev client, running the app on a device | `expo-dev-client` |
| NativeWind / Tailwind config trouble | `expo-tailwind-setup` |
| Expo SDK upgrade or dependency mismatch | `expo-upgrade` |
| Writing an Expo native module (Swift/Kotlin) | `expo-module` |
| `eas.json` profiles, builds, store submission, TestFlight | `eas-app-stores` |
| Local release APK without EAS (Gradle) | `cwb-local-build` |
| Designing a mobile screen, flow, component, or mockup | `mobile-app-ui-design` |
| Reviewing / polishing the visual design of an existing screen | `design-audit` |
| Any UI code containing visible text (FR **and** EN) | `typography` |
| React Native / Expo perf: lists, animations, native modules, low-end device | `react-native-skills` |
| Designing a component API reused across several surfaces | `composition-patterns` |
| React rendering / re-render / state-shape questions | `react-best-practices` |
| Charts or stat visualisation (Performance tab, Share Lift Card) | `dataviz` |
| Working on `lyxo-web/` (landing, /pay, /invite, /account/delete) | `web-design-guidelines`, `accesslint-scan`, `deploy-to-vercel` |
| Reviewing a diff for bugs | `/code-review` (user-triggered) |
| Simplifying / de-duplicating code just written | `simplify` |

**Never** apply the web-only skills to the app itself: `accesslint-*`
(drives a Chrome DevTools session against a live DOM), `react-view-
transitions` (browser API), `web-design-guidelines`, `responsive-design`
and `web-component-design` (CSS/DOM). React Native has no DOM — these have
nothing to bind to and their advice will be wrong. They apply to
`lyxo-web/` only.

**Never** apply the native-mobile design skills either: `mobile-ios-design`
(SwiftUI / Apple HIG) and `mobile-android-design` (Jetpack Compose /
Material 3). LYXO is a single Expo codebase, Android-first — neither
SwiftUI nor Compose exists in it. `apple-design` is the exception and IS
allowed: it teaches motion and interaction principles translated away from
Apple's own frameworks, not SwiftUI APIs.

## Android skills (`.claude/skills/`, project level)

Google's Android skills, 20 of them. They target **native** Android
(Jetpack Compose, Kotlin), so most do not apply to a React Native app.
These six do:

| Task at hand | Skill to invoke |
|---|---|
| `adb`, emulator, logcat, device inspection from the CLI | `android-cli` |
| Root-causing latency / jank / memory on the low-end device (DoD 2.12) | `perfetto-trace-analysis` |
| Writing a Perfetto trace query | `perfetto-sql` |
| Release build size, R8 / ProGuard keep rules (`minifyEnabled` is on) | `r8-analyzer` |
| Play Store policy audit before publishing (Phase 7) | `play-policy-insights` |
| Auditing deep links / intents (coach invite links, `/invite/:code`) | `android-intent-security` |

**Do not invoke the other fourteen on this app.** `adaptive`, `styles`,
`navigation-3`, `edge-to-edge`, `migrate-xml-views-to-jetpack-compose`,
`camerax`, `wear-compose-m3`, `display-glasses-*`, `appfunctions`,
`engage-sdk-integration`, `verified-email`, `testing-setup` (native JUnit/
Espresso), `play-billing-library-version-upgrade` (LYXO bills through
RevenueCat) and `agp-9-upgrade` (only if an AGP bump ever breaks the Expo
build) all assume a Compose/Kotlin codebase that LYXO does not have.
Edge-to-edge *is* a real Android 15 concern here, but it is handled on the
Expo side — the Compose skill does not apply.

⚠️ `.claude/skills/` is **never committed** (see the end of this file).
The list above documents what is on this machine; a fresh clone will not
have it.

**Duplicates — resolved, do not deliberate:**
- `mobile-app-ui-design` (user level, from
  https://github.com/ceorkm/mobile-app-ui-design) is **the one to use**.
  Ignore `anthropic-skills:mobile-app-ui-design`, which shadows it with a
  near-identical trigger description.
- The `ui-ux-pro-max:*` plugin covers the same ground as `design` /
  `ui-styling`; prefer the plugin, it is the maintained copy.

**Project docs win over any skill.** `docs/` (LLD, DATA_MODEL, API_SPEC,
SECURITY_NOTES, CONVENTIONS) and this file are the source of truth for
LYXO. A skill is generic advice from outside the project — where it
conflicts with a decision already written in `docs/`, the doc wins.
Flag the conflict instead of silently following the skill. This applies
in particular to `bencium-code-conventions` (another developer's personal
conventions) and to the "proactive" reasoning skills
(`human-architect-mindset`, `negentropy-lens`, `renaissance-architecture`,
`adaptive-communication`), which will happily reopen architecture
decisions that are already settled.

Skills live in `~/.claude/skills` (user level), deliberately not in the
repo — `.claude/skills/` is never committed.
