import {
  dayLabel,
  formatDurationLabel,
  groupPRsByExercise,
  volumeDeltaKg,
} from './workout-summary';

describe('dayLabel', () => {
  it('capitalise le jour en français', () => {
    // 2026-07-31 est un vendredi.
    expect(dayLabel(new Date('2026-07-31T12:00:00Z'), 'fr')).toBe('Vendredi');
  });

  it('capitalise le jour en anglais', () => {
    expect(dayLabel(new Date('2026-07-31T12:00:00Z'), 'en')).toBe('Friday');
  });
});

describe('formatDurationLabel', () => {
  it('affiche des minutes en dessous d une heure', () => {
    expect(formatDurationLabel(45 * 60_000)).toBe('45 min');
  });

  it('affiche heures et minutes au dela d une heure', () => {
    expect(formatDurationLabel(72 * 60_000)).toBe('1 h 12');
  });

  it('omet les minutes quand elles sont nulles', () => {
    expect(formatDurationLabel(120 * 60_000)).toBe('2 h');
  });

  it('ne descend jamais sous zero', () => {
    expect(formatDurationLabel(-1000)).toBe('0 min');
  });
});

describe('volumeDeltaKg', () => {
  it('retourne null sans seance precedente', () => {
    expect(volumeDeltaKg(1000, null)).toBeNull();
  });

  it('calcule le delta positif', () => {
    expect(volumeDeltaKg(1000, 680)).toBe(320);
  });

  it('calcule le delta negatif', () => {
    expect(volumeDeltaKg(500, 680)).toBe(-180);
  });
});

describe('groupPRsByExercise', () => {
  const pr = (exerciseId: string, type: string) => ({ exerciseId, type });

  it('regroupe les records du meme exercice', () => {
    const groups = groupPRsByExercise([
      pr('curl', 'weight'),
      pr('curl', '1rm'),
      pr('crunch', 'reps'),
      pr('curl', 'volume'),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0]!.exerciseId).toBe('curl');
    expect(groups[0]!.prs).toHaveLength(3);
    expect(groups[1]!.exerciseId).toBe('crunch');
    expect(groups[1]!.prs).toHaveLength(1);
  });

  it("conserve l'ordre d'apparition des exercices, pas un tri", () => {
    // On relit la seance dans l'ordre ou on l'a vecue : le premier exercice
    // rencontre reste en tete, meme s'il a moins de records que le suivant.
    const groups = groupPRsByExercise([pr('b', 'reps'), pr('a', 'reps'), pr('a', 'weight')]);
    expect(groups.map((g) => g.exerciseId)).toEqual(['b', 'a']);
  });

  it("conserve l'ordre des records a l'interieur d'un groupe", () => {
    const groups = groupPRsByExercise([pr('a', 'weight'), pr('b', 'reps'), pr('a', 'volume')]);
    expect(groups[0]!.prs.map((p) => p.type)).toEqual(['weight', 'volume']);
  });

  it('rend un tableau vide sans record', () => {
    expect(groupPRsByExercise([])).toEqual([]);
  });
});
