import { addColumns, createTable, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

import {
  personalRecordsTableSpec,
  setsTableSpec,
  workoutExercisesTableSpec,
  workoutsTableSpec,
} from './schema';

// Migrations du schéma LOCAL (LLD.md §1, `db/migrations.ts`).
//
// Sans ce fichier, changer `db/schema.ts` ne fait rien sur un appareil déjà
// installé : l'adaptateur compare le numéro de version et, s'il n'a pas de
// chemin de migration, laisse la base en l'état. C'est ce qui a produit
// "no such table: workouts" le 2026-07-27, la base du spike (v1) faisant
// écran au nouveau schéma.
//
// Les specs viennent de `db/schema.ts` — jamais recopiées ici. Une définition
// dupliquée serait une occasion de plus de diverger, et la seule qui ne
// serait attrapée ni par `db/schema.test.ts` ni par le typecheck.
export const workoutMigrations = schemaMigrations({
  migrations: [
    {
      // v1 → v2 : création des trois tables du logger (ROADMAP 2.6).
      // `create_table` est sûr ici même sur la base laissée par le spike :
      // celle-ci ne contenait que des tables de test, aucune de ces trois.
      toVersion: 2,
      steps: [
        createTable(workoutsTableSpec),
        createTable(workoutExercisesTableSpec),
        createTable(setsTableSpec),
      ],
    },
    {
      // v2 → v3 : personal_records (ROADMAP 2.10, DATA_MODEL §2.8).
      toVersion: 3,
      steps: [createTable(personalRecordsTableSpec)],
    },
    {
      // v3 → v4 : `previous_best` sur personal_records — la progression
      // affichée sur le résumé de fin de séance. La colonne est ajoutée
      // NULLABLE et sans valeur par défaut : les lignes existantes restent
      // à `null` (= inconnu), aucun backfill.
      //
      // ⚠️ La colonne est ici recopiée à la main plutôt que dérivée de
      // `personalRecordsTableSpec` : `addColumns` attend les colonnes AJOUTÉES,
      // alors que la spec décrit désormais la table COMPLÈTE. Passer la spec
      // entière recréerait toutes les colonnes et échouerait.
      toVersion: 4,
      steps: [
        addColumns({
          table: 'personal_records',
          columns: [{ name: 'previous_best', type: 'number', isOptional: true }],
        }),
      ],
    },
  ],
});
