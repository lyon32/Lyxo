module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // Conservé pour la config validée par le spike (ARCHITECTURE.md #46).
      // Sans effet aujourd'hui : `db/models/` n'utilise plus de décorateurs.
      //
      // ⚠️ NE PAS ajouter `@babel/plugin-transform-class-properties` ici pour
      // faire fonctionner des décorateurs. Matrice testée le 2026-07-27 :
      //   - class-properties seul -> casse RN à la COMPILATION ("Class
      //     private methods are not enabled", PerformanceObserver.js) ;
      //   - le trio en SPEC       -> compile, puis casse VirtualizedList au
      //     RUNTIME ("property is not configurable") ;
      //   - le trio en LOOSE      -> écarté par le spike ("Cannot assign to
      //     read-only property 'NONE'", Event.js) ;
      //   - `overrides` ciblé     -> Metro appelle Babel sans nom de fichier
      //     pour sa clé de cache et refuse tout motif `test`.
      // Les models WatermelonDB écrivent donc leurs accesseurs à la main.
      ['@babel/plugin-proposal-decorators', { legacy: true }],
    ],
  };
};
