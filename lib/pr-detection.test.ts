import {
  computeVolumeKg,
  detectPRs,
  estimatedOneRepMax,
  evaluatePRSocialEligibility,
  type PreviousBests,
} from './pr-detection';

describe('estimatedOneRepMax', () => {
  it('vaut le poids soulevé pour 1 répétition', () => {
    expect(estimatedOneRepMax(100, 1)).toBe(100);
  });

  it('vaut le poids soulevé même pour 0 répétition (garde-fou)', () => {
    expect(estimatedOneRepMax(100, 0)).toBe(100);
  });

  it('applique Epley au-delà de 1 répétition', () => {
    // 100 * (1 + 5/30) = 116,666...
    expect(estimatedOneRepMax(100, 5)).toBeCloseTo(116.67, 1);
  });
});

describe('computeVolumeKg', () => {
  it('multiplie poids et répétitions', () => {
    expect(computeVolumeKg({ weightKg: 80, reps: 10 })).toBe(800);
  });
});

describe('detectPRs', () => {
  const noPreviousBests: PreviousBests = {
    weightKg: null,
    volumeKg: null,
    reps: null,
    estimated1RmKg: null,
  };

  it('bat les 4 types quand aucun record n existe encore', () => {
    const detected = detectPRs({ weightKg: 100, reps: 5 }, noPreviousBests);
    const types = detected.map((d) => d.type).sort();
    expect(types).toEqual(['1rm', 'reps', 'volume', 'weight']);
  });

  it('ne detecte que le poids quand seul le poids progresse', () => {
    const previousBests: PreviousBests = {
      weightKg: 90,
      volumeKg: 1000, // 90*5=450 < 1000 : le nouveau volume ne bat pas ça
      reps: 10, // 5 < 10 : ne bat pas
      estimated1RmKg: 1000, // largement au-dessus : ne bat pas
    };
    const detected = detectPRs({ weightKg: 100, reps: 5 }, previousBests);
    expect(detected).toEqual([{ type: 'weight', value: 100, previousBest: 90 }]);
  });

  it('n detecte rien quand rien ne progresse', () => {
    const previousBests: PreviousBests = {
      weightKg: 100,
      volumeKg: 500,
      reps: 5,
      estimated1RmKg: 200,
    };
    expect(detectPRs({ weightKg: 100, reps: 5 }, previousBests)).toEqual([]);
  });

  it('egaler un record existant ne le bat pas (strictement superieur requis)', () => {
    const previousBests: PreviousBests = {
      weightKg: 100,
      volumeKg: null,
      reps: null,
      estimated1RmKg: null,
    };
    const detected = detectPRs({ weightKg: 100, reps: 1 }, previousBests);
    expect(detected.some((d) => d.type === 'weight')).toBe(false);
  });
});

describe('evaluatePRSocialEligibility', () => {
  const candidate = { exerciseId: 'ex-1', weightKg: 100, reps: 5, achievedAt: new Date() };

  it('eligible quand tout est plausible', () => {
    const result = evaluatePRSocialEligibility(candidate, {
      bodyWeightKg: 80,
      previousBestKg: 95,
      sessionsLoggedOnExercise: 5,
    });
    expect(result).toEqual({ isSocialEligible: true, reason: null });
  });

  it('rejette un poids implausible (> 4x le poids de corps)', () => {
    const result = evaluatePRSocialEligibility(candidate, {
      bodyWeightKg: 20, // 100 > 4*20=80
      previousBestKg: 95,
      sessionsLoggedOnExercise: 5,
    });
    expect(result).toEqual({ isSocialEligible: false, reason: 'implausible_weight' });
  });

  it('rejette un delta trop eleve (> +15% vs record precedent)', () => {
    const result = evaluatePRSocialEligibility(candidate, {
      bodyWeightKg: 80,
      previousBestKg: 80, // +25% : au dessus du seuil de 15%
      sessionsLoggedOnExercise: 5,
    });
    expect(result).toEqual({ isSocialEligible: false, reason: 'delta_too_high' });
  });

  it('rejette un historique insuffisant (< 3 seances)', () => {
    const result = evaluatePRSocialEligibility(candidate, {
      bodyWeightKg: 80,
      previousBestKg: 95,
      sessionsLoggedOnExercise: 2,
    });
    expect(result).toEqual({ isSocialEligible: false, reason: 'insufficient_history' });
  });

  it("priorise la plausibilite sur le delta", () => {
    // Les deux motifs seraient valides ; la plausibilite doit gagner
    // (ordre fixe par LLD §3.1 : plausibilite > delta > anciennete).
    const result = evaluatePRSocialEligibility(candidate, {
      bodyWeightKg: 20, // implausible
      previousBestKg: 1000, // delta negatif, ne devrait meme pas se declencher
      sessionsLoggedOnExercise: 5,
    });
    expect(result.reason).toBe('implausible_weight');
  });

  it('ignore la plausibilite si le poids de corps n a jamais ete renseigne', () => {
    const result = evaluatePRSocialEligibility(candidate, {
      bodyWeightKg: null,
      previousBestKg: 95,
      sessionsLoggedOnExercise: 5,
    });
    expect(result).toEqual({ isSocialEligible: true, reason: null });
  });

  it('ignore le delta pour le tout premier record sur l exercice', () => {
    const result = evaluatePRSocialEligibility(candidate, {
      bodyWeightKg: 80,
      previousBestKg: null,
      sessionsLoggedOnExercise: 5,
    });
    expect(result).toEqual({ isSocialEligible: true, reason: null });
  });
});
