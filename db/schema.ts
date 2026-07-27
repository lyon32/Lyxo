import { appSchema, tableSchema } from '@nozbe/watermelondb';

// Schéma WatermelonDB local — ROADMAP 2.6, miroir de DATA_MODEL §2.5-2.7.
//
// ⚠️ RISQUE PRINCIPAL DE CETTE TÂCHE. Les tables Postgres correspondantes
// (`supabase/migrations/20260727120000_create_workout_tables.sql`) sont
// INERTES jusqu'à la Phase 3 : aucun code serveur ne les lit ni ne les écrit
// avant. Une colonne renommée, un type élargi ou une nullabilité inversée
// d'un seul côté ne casserait donc RIEN aujourd'hui — et se découvrirait des
// semaines plus tard, en plein Bloc C, quand la sync est déjà le module le
// plus délicat du projet.
//
// D'où la table de correspondance ci-dessous : à relire et à mettre à jour
// À CHAQUE modification de l'un des deux schémas, jamais l'un sans l'autre.
//
// ┌─ workouts (§2.5) ───────────────┬──────────────────┬───────────────────┐
// │ Postgres                        │ WatermelonDB     │ Note              │
// ├─────────────────────────────────┼──────────────────┼───────────────────┤
// │ id uuid pk                      │ (aucune)         │ id serveur, connu │
// │                                 │                  │ après le 1er push │
// │ local_id text not null          │ `id` du record   │ l'id Watermelon   │
// │                                 │                  │ EST le local_id   │
// │ profile_id uuid not null        │ profile_id str   │                   │
// │ title text                      │ title str?       │                   │
// │ program_id uuid (sans FK)       │ program_id str?  │ FK en Phase 6     │
// │ started_at timestamptz not null │ started_at num   │ epoch ms          │
// │ completed_at timestamptz        │ completed_at n?  │ null = en cours   │
// │ total_volume_kg numeric(10,2)   │ total_volume_kg? │ calculé à la fin  │
// │ is_private bool not null        │ is_private bool  │ défaut false      │
// │ deleted_at timestamptz          │ deleted_at num?  │ soft delete       │
// │ created_at / updated_at         │ idem, num        │ gérés par WMDB    │
// └─────────────────────────────────┴──────────────────┴───────────────────┘
//
// ┌─ workout_exercises (§2.6) ──────┬──────────────────┬───────────────────┐
// │ workout_id uuid not null        │ workout_id str   │ indexé            │
// │ exercise_id uuid                │ exercise_id str? │ référentiel       │
// │ custom_exercise_id uuid         │ custom_ex_id str?│ exercice perso    │
// │ order_index int not null        │ order_index num  │                   │
// │ deleted_at / created_at / upd.  │ idem, num        │                   │
// │ CHECK (exercise_id or custom)   │ (aucun)          │ ⚠️ non exprimable  │
// │                                 │                  │ en WMDB — tenu    │
// │                                 │                  │ par le code       │
// └─────────────────────────────────┴──────────────────┴───────────────────┘
//
// ┌─ sets (§2.7) ───────────────────┬──────────────────┬───────────────────┐
// │ workout_exercise_id not null    │ workout_ex_id str│ indexé            │
// │ set_number int not null         │ set_number num   │ 1-based           │
// │ weight_kg numeric(8,2) not null │ weight_kg num    │ CANONIQUE §19.15  │
// │ reps int not null               │ reps num         │                   │
// │ rpe numeric CHECK 1..10         │ rpe num?         │ ⚠️ CHECK non       │
// │                                 │                  │ exprimable en WMDB │
// │ is_completed bool not null      │ is_completed b   │ défaut false      │
// │ deleted_at / created_at / upd.  │ idem, num        │                   │
// └─────────────────────────────────┴──────────────────┴───────────────────┘
//
// Deux écarts STRUCTURELS, assumés et non corrigeables :
// 1. WatermelonDB n'a que trois types de colonnes (string/number/boolean).
//    Les `timestamptz` deviennent des nombres (epoch ms), les `numeric` des
//    nombres flottants — la précision `numeric(8,2)` exigée par
//    CLAUDE_LYXO_V3 §17bis.2 n'est donc garantie QUE côté serveur. Le total
//    de volume doit être recalculé/arrondi au push, pas repris tel quel.
// 2. Les contraintes CHECK n'existent pas en WatermelonDB. Les deux du
//    schéma serveur (au moins un id d'exercice ; RPE entre 1 et 10) doivent
//    être tenues par le code applicatif, sans quoi le push Phase 3 sera
//    rejeté par Postgres pour des lignes déjà écrites en local.

export const workoutSchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'workouts',
      columns: [
        { name: 'profile_id', type: 'string', isIndexed: true },
        { name: 'title', type: 'string', isOptional: true },
        { name: 'program_id', type: 'string', isOptional: true },
        { name: 'started_at', type: 'number' },
        { name: 'completed_at', type: 'number', isOptional: true },
        { name: 'total_volume_kg', type: 'number', isOptional: true },
        { name: 'is_private', type: 'boolean' },
        { name: 'deleted_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'workout_exercises',
      columns: [
        { name: 'workout_id', type: 'string', isIndexed: true },
        { name: 'exercise_id', type: 'string', isOptional: true },
        { name: 'custom_exercise_id', type: 'string', isOptional: true },
        { name: 'order_index', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'sets',
      columns: [
        { name: 'workout_exercise_id', type: 'string', isIndexed: true },
        { name: 'set_number', type: 'number' },
        { name: 'weight_kg', type: 'number' },
        { name: 'reps', type: 'number' },
        { name: 'rpe', type: 'number', isOptional: true },
        { name: 'is_completed', type: 'boolean' },
        { name: 'deleted_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
