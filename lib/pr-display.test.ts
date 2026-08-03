import { personalRecordToSessionPR, prDeltaLabel, type PersonalRecordRow } from './pr-display';

// Ces deux fonctions sont le seul endroit testable de la chaîne d'affichage
// d'un record : ni `db/use-workout-summary.ts` ni `db/pr-recording.ts` ne le
// sont (pas d'infra de test WatermelonDB dans le repo).

function row(overrides: Partial<PersonalRecordRow> = {}): PersonalRecordRow {
  return {
    exerciseId: 'curl',
    prType: 'weight',
    weightKg: 50,
    reps: 10,
    estimated1RmKg: null,
    previousBest: null,
    isSocialEligible: true,
    ineligibilityReason: null,
    ...overrides,
  };
}

describe('personalRecordToSessionPR — valeur derivee par type', () => {
  it("'weight' rend le poids brut", () => {
    expect(personalRecordToSessionPR(row({ prType: 'weight' })).value).toBe(50);
  });

  it("'reps' rend le nombre de repetitions", () => {
    expect(personalRecordToSessionPR(row({ prType: 'reps' })).value).toBe(10);
  });

  it("'volume' rend poids x reps", () => {
    expect(personalRecordToSessionPR(row({ prType: 'volume' })).value).toBe(500);
  });

  it("'1rm' rend le 1RM estime quand il existe", () => {
    expect(personalRecordToSessionPR(row({ prType: '1rm', estimated1RmKg: 66.7 })).value).toBe(66.7);
  });

  it("'1rm' retombe sur le poids quand le 1RM estime est absent", () => {
    expect(personalRecordToSessionPR(row({ prType: '1rm', estimated1RmKg: null })).value).toBe(50);
  });

  it('propage previousBest sans le transformer', () => {
    // Le contrat qui compte : `previousBest` est deja dans la meme unite que
    // la valeur derivee (volume vs volume, pas volume vs poids brut).
    const pr = personalRecordToSessionPR(row({ prType: 'volume', previousBest: 400 }));
    expect(pr.value).toBe(500);
    expect(pr.previousBest).toBe(400);
  });
});

describe('prDeltaLabel', () => {
  const pr = (type: 'weight' | 'volume' | 'reps' | '1rm', value: number, previousBest: number | null) => ({
    type,
    value,
    previousBest,
  });

  it('rend null quand le record precedent est inconnu', () => {
    // Premier record sur cet exercice, ou ligne anterieure au schema v4 :
    // les deux cas sont indiscernables et s'affichent pareil.
    expect(prDeltaLabel(pr('weight', 50, null), 'kg', 'fr')).toBeNull();
  });

  it('rend null quand le delta est nul', () => {
    expect(prDeltaLabel(pr('weight', 50, 50), 'kg', 'fr')).toBeNull();
  });

  it('rend null quand le delta est negatif', () => {
    // Possible sur une ligne venue d'un autre appareil dont l'historique
    // differait — on n'affiche pas une "progression" negative.
    expect(prDeltaLabel(pr('weight', 45, 50), 'kg', 'fr')).toBeNull();
  });

  // \u00A0 = espace INSÉCABLE, pas une espace ordinaire : `formatWeight`
  // l'impose pour qu'un nombre ne soit jamais separe de son unite en fin de
  // ligne (lib/units.ts). Ecrite en echappement plutot qu'en caractere brut,
  // sinon la difference est invisible a la relecture.
  it('formate un delta de poids avec son unite', () => {
    expect(prDeltaLabel(pr('weight', 52.5, 50), 'kg', 'fr')).toBe('+2,5\u00A0kg');
  });

  it('formate un delta de repetitions sans unite', () => {
    expect(prDeltaLabel(pr('reps', 12, 10), 'kg', 'fr')).toBe('+2');
  });

  it('formate un delta de volume en poids', () => {
    expect(prDeltaLabel(pr('volume', 500, 400), 'kg', 'fr')).toBe('+100\u00A0kg');
  });
});
