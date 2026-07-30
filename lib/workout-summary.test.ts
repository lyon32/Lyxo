import { dayLabel, formatDurationLabel, volumeDeltaKg } from './workout-summary';

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
