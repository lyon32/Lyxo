import { readFileSync } from 'fs';
import { join } from 'path';

// GARDE-FOU CONTRE LA DÉRIVE DES DEUX SCHÉMAS (ROADMAP 2.6).
//
// Les tables Postgres `workouts`/`workout_exercises`/`sets` sont INERTES
// jusqu'à la Phase 3 : aucun code serveur ne les touche. Une colonne
// renommée, ajoutée ou dont la nullabilité change d'un seul côté ne casserait
// donc rien aujourd'hui, et se découvrirait des semaines plus tard, en plein
// Bloc C, quand la sync est déjà le module le plus délicat du projet.
//
// Ce test compare le schéma WatermelonDB (`db/schema.ts`) aux types Postgres
// GÉNÉRÉS depuis la vraie base (`backend/src/types/supabase.ts`, produit par
// `npm run supabase:generate-types`). Il échoue dès que l'un des deux bouge
// sans l'autre — y compris si quelqu'un applique une migration sans mettre à
// jour le schéma local.
//
// S'il casse : ne pas "réparer" le test. Décider lequel des deux schémas a
// raison, corriger l'autre, et mettre à jour la table de correspondance en
// tête de `db/schema.ts`.

const ROOT = join(__dirname, '..');
const TABLES = ['workouts', 'workout_exercises', 'sets', 'personal_records'] as const;

// Colonnes présentes côté Postgres et volontairement absentes en local.
// `id` : uuid serveur, inconnu tant que la ligne n'a pas été poussée.
// `local_id` : c'est l'`id` du record WatermelonDB lui-même (même principe
// pour les 4 tables depuis ROADMAP 3.3/3.6 — voir la table de
// correspondance en tête de `db/schema.ts`), jamais un second uuid généré.
const EXPECTED_LOCAL_ABSENT: Record<string, string[]> = {
  workouts: ['id', 'local_id'],
  workout_exercises: ['id', 'local_id'],
  sets: ['id', 'local_id'],
  personal_records: ['id', 'local_id'],
};

interface LocalColumn {
  type: string;
  optional: boolean;
}

function watermelonColumns(source: string, table: string): Record<string, LocalColumn> {
  const afterName = source.split(`name: '${table}'`)[1];
  const columnsBlock = afterName.split('columns: [')[1].split(']')[0];
  const columns: Record<string, LocalColumn> = {};
  const pattern = /\{\s*name:\s*'([^']+)',\s*type:\s*'([^']+)'([^}]*)\}/g;
  for (const match of columnsBlock.matchAll(pattern)) {
    columns[match[1]] = { type: match[2], optional: /isOptional:\s*true/.test(match[3]) };
  }
  return columns;
}

function postgresColumns(source: string, table: string): Record<string, boolean> {
  const afterTable = source.split(new RegExp(`\\n {6}${table}: \\{`))[1];
  if (!afterTable) throw new Error(`Table ${table} absente des types Postgres générés`);
  const rowBlock = afterTable.split('Row: {')[1].split('\n        }')[0];
  const columns: Record<string, boolean> = {};
  for (const line of rowBlock.split('\n')) {
    const match = line.match(/^\s*(\w+):\s*(.+?)$/);
    if (!match) continue;
    columns[match[1]] = /\| null/.test(match[2]);
  }
  return columns;
}

describe('schéma WatermelonDB aligné sur Postgres', () => {
  const watermelonSource = readFileSync(join(ROOT, 'db/schema.ts'), 'utf8');
  const postgresSource = readFileSync(join(ROOT, 'backend/src/types/supabase.ts'), 'utf8');

  it.each(TABLES)('%s : mêmes colonnes des deux côtés', (table) => {
    const local = watermelonColumns(watermelonSource, table);
    const remote = postgresColumns(postgresSource, table);
    const skipped = EXPECTED_LOCAL_ABSENT[table];

    const expectedLocalNames = Object.keys(remote).filter((name) => !skipped.includes(name));
    expect(Object.keys(local).sort()).toEqual(expectedLocalNames.sort());
  });

  it.each(TABLES)('%s : même nullabilité des deux côtés', (table) => {
    const local = watermelonColumns(watermelonSource, table);
    const remote = postgresColumns(postgresSource, table);
    const skipped = EXPECTED_LOCAL_ABSENT[table];

    // Une colonne NOT NULL côté serveur qui serait `isOptional` en local
    // laisserait écrire une ligne que le push Phase 3 ferait rejeter.
    for (const [name, nullable] of Object.entries(remote)) {
      if (skipped.includes(name)) continue;
      expect({ name, optional: local[name]?.optional }).toEqual({ name, optional: nullable });
    }
  });
});
