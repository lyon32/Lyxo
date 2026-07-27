const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    // backend/ a son propre eslint.config.js + script lint (package Node
    // distinct) — ESLint flat config ne cascade pas les sous-dossiers.
    ignores: ['dist/*', 'backend/**'],
  },
  {
    // CONVENTIONS.md : "console.log en production" interdit — Sentry
    // (client) uniquement. `warn`/`error` tolérés nulle part non plus :
    // un console.* qui traîne est un signal d'oubli (audit doc).
    rules: {
      'no-console': 'error',
    },
  },
];
