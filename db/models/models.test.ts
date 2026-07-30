import { PersonalRecord } from './PersonalRecord';
import { Workout } from './Workout';
import { WorkoutExercise } from './WorkoutExercise';
import { WorkoutSet } from './WorkoutSet';

// Les décorateurs WatermelonDB s'appliquent AU CHARGEMENT DU MODULE : importer
// ces classes suffit à faire échouer une configuration Babel incorrecte, avec
// "Decorating class property failed. Please ensure that
// transform-class-properties is enabled and runs after the decorators
// transform."
//
// Ce test existe parce que cette panne a coûté un aller-retour complet sur
// appareil le 2026-07-27 : `tsc`, `eslint` et la construction du bundle
// passaient tous, et l'app échouait quand même au runtime. Un simple import
// dans jest — qui utilise le même `babel.config.js` — la reproduit en deux
// secondes.

describe('models WatermelonDB', () => {
  it('se chargent sans erreur de décorateur', () => {
    expect(Workout.table).toBe('workouts');
    expect(WorkoutExercise.table).toBe('workout_exercises');
    expect(WorkoutSet.table).toBe('sets');
    expect(PersonalRecord.table).toBe('personal_records');
  });

  it('exposent les associations attendues', () => {
    expect(Workout.associations).toHaveProperty('workout_exercises');
    expect(WorkoutExercise.associations).toHaveProperty('workouts');
    expect(WorkoutExercise.associations).toHaveProperty('sets');
    expect(WorkoutSet.associations).toHaveProperty('workout_exercises');
    expect(PersonalRecord.associations).toHaveProperty('exercises');
    expect(PersonalRecord.associations).toHaveProperty('sets');
  });
});
