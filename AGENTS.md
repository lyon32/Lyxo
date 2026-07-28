# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Skills — invoke the matching one BEFORE starting

Do not work from memory when a skill covers the task. Load the relevant
skill via the Skill tool **before** writing code or design, not after —
a skill read afterwards changes nothing about what was already produced.
If several apply, load them all.

| Task at hand | Skill to invoke |
|---|---|
| Routes, navigation, `app/` layout, groups, modals, headers | `expo-router` |
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
transitions` (browser API), `web-design-guidelines`. React Native has no
DOM — these have nothing to bind to and their advice will be wrong.
They apply to `lyxo-web/` only.

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
