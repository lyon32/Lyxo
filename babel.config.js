module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // Requis par les décorateurs @field/@date/@children de WatermelonDB
      // (SPIKE audit technique 2026-07-25 — db/models/, ARCHITECTURE.md #46).
      // Config MINIMALE documentée par WatermelonDB : SEUL le plugin
      // decorators (legacy) est ajouté. babel-preset-expo gère déjà
      // class-properties / private-methods / private-property-in-object
      // dans son mode cohérent (spec, PAS loose) — y ajouter nos propres
      // versions en `loose: true` cassait le code interne de RN New Arch
      // ("Cannot assign to read-only property 'NONE'" dans Event.js).
      ['@babel/plugin-proposal-decorators', { legacy: true }],
    ],
  };
};
