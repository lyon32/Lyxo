const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    // backend/ a son propre eslint.config.js + script lint (package Node
    // distinct) — ESLint flat config ne cascade pas les sous-dossiers.
    ignores: ['dist/*', 'backend/**'],
  },
];
