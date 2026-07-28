import { clampedEndsAt, elapsedRatio, remainingSeconds } from './rest-timer';

// Le temps restant et l'anneau sont RECALCULÉS depuis un timestamp, jamais
// décomptés (PRD §1.2, correctif #56). Une erreur ici ne se voit pas à l'œil :
// le timer paraît fonctionner et dérive silencieusement. D'où ces tests, avec
// une horloge injectée plutôt que `Date.now()`.

const NOW = 1_700_000_000_000;

describe('remainingSeconds', () => {
  it('rend 0 quand aucun repos n est en cours', () => {
    expect(remainingSeconds(null, NOW)).toBe(0);
  });

  it('arrondit au-dessus pour ne jamais afficher 0 trop tot', () => {
    // 90,4 s restantes doivent s'afficher 91, sinon la derniere seconde
    // disparait avant d'etre ecoulee.
    expect(remainingSeconds(NOW + 90_400, NOW)).toBe(91);
  });

  it('ne descend jamais sous zero, meme largement depasse', () => {
    expect(remainingSeconds(NOW - 60_000, NOW)).toBe(0);
  });

  it("reflete le temps ecoule en arriere-plan", () => {
    // C'est LE cas d'usage : 60 s lancees, 30 s d'ecran verrouille.
    const endsAt = NOW + 60_000;
    expect(remainingSeconds(endsAt, NOW + 30_000)).toBe(30);
  });
});

describe('elapsedRatio', () => {
  it('vaut 0 au demarrage', () => {
    expect(elapsedRatio(NOW + 90_000, 90, NOW)).toBe(0);
  });

  it('vaut 1 a la fin, et jamais plus', () => {
    expect(elapsedRatio(NOW, 90, NOW)).toBe(1);
    expect(elapsedRatio(NOW - 10_000, 90, NOW)).toBe(1);
  });

  it('vaut environ la moitie a mi-parcours', () => {
    expect(elapsedRatio(NOW + 45_000, 90, NOW)).toBeCloseTo(0.5, 2);
  });

  it('ne divise pas par zero sur une duree nulle', () => {
    expect(elapsedRatio(NOW + 1000, 0, NOW)).toBe(0);
  });
});

describe('clampedEndsAt', () => {
  it('ajoute 15 secondes', () => {
    expect(clampedEndsAt(NOW + 30_000, 15, NOW)).toBe(NOW + 45_000);
  });

  it('retire 15 secondes', () => {
    expect(clampedEndsAt(NOW + 30_000, -15, NOW)).toBe(NOW + 15_000);
  });

  it('ne remonte jamais avant maintenant', () => {
    // -15 s sur un repos qui n'en a plus que 5 : on s'arrete a 0, on ne part
    // pas dans le passe (ce qui rendrait la notification indelivrable).
    expect(clampedEndsAt(NOW + 5_000, -15, NOW)).toBe(NOW);
  });
});
