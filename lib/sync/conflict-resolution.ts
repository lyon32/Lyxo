// Résolution de conflit de sync — LWW silencieux, Q12a. LLD.md §3.2.
//
// Fonction PURE, mécanisme CLIENT uniquement — zéro appel réseau, zéro
// horloge lue en interne (`updatedAt` est toujours injecté). Le garde-fou
// contre le clock skew (un appareil à l'horloge dérivée qui écraserait une
// donnée plus récente) est une règle SERVEUR distincte
// (`services/sync.service.ts`, ROADMAP Phase 3), appliquée AVANT que cette
// fonction ne s'exécute côté client — elle ne vit pas ici.
//
// ⚠️ Pas de traitement spécial pour `deletedAt` au-delà de la comparaison
// normale : une suppression ne gagne PAS "toujours", elle gagne quand son
// `updatedAt` est le plus récent — exactement comme une modification
// ordinaire. La citer à part (LLD §3.2, TESTING.md §1.2) sert à couvrir
// explicitement le cas à plus fort risque ("perte de séance silencieuse"),
// pas à coder une branche supplémentaire.

export interface SyncableRecord {
  id: string;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Égalité de timestamp : `remote` gagne (`>=`, pas `>`). Nécessaire pour
// que rejouer la MÊME donnée (par ex. un pull qui revoit ce qu'il vient de
// pousser) converge vers un résultat stable plutôt que de dépendre de
// l'ordre d'appel.
export function resolveConflict<T extends SyncableRecord>(local: T, remote: T): T {
  return remote.updatedAt >= local.updatedAt ? remote : local;
}
