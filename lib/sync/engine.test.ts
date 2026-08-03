// Ordonnancement des déclencheurs de sync (ROADMAP 3.5, correctif de
// latence inter-appareils du 2026-08-01). Ces tests ne valident PAS le
// contenu d'un cycle (push/pull, couverts ailleurs) mais QUAND un cycle est
// déclenché — c'est là que se jouait le bug : un exercice ajouté sur un
// appareil mettait jusqu'à 6 min à apparaître sur l'autre.
//
// On compte les appels à `apiFetch`, PAS un espion sur `syncNow` : le
// moteur s'appelle lui-même via sa référence locale de module, qu'un
// `jest.spyOn` sur l'objet exporté n'intercepte pas (constaté, tous les
// tests passaient à côté). `SYNC_TABLES` est vide ici, donc un cycle
// complet vaut exactement un appel réseau — celui du pull.

const mockApiFetch = jest.fn();

jest.mock('../../db/index', () => ({ database: {} }));
jest.mock('../api-client', () => ({ apiFetch: (...args: unknown[]) => mockApiFetch(...args) }));
jest.mock('../supabase', () => ({ supabase: { auth: { signOut: jest.fn() } } }));
jest.mock('@sentry/react-native', () => ({ captureException: jest.fn() }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
}));
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(async () => ({ isConnected: true, type: 'wifi', details: {} })),
  addEventListener: jest.fn(() => () => undefined),
}));
jest.mock('./tables', () => ({
  SYNC_TABLES: [],
  fetchChangedRows: jest.fn(async () => ({ created: [], deletedLocalIds: [] })),
  buildRawFromPulledRow: jest.fn(),
  rememberPulledRows: jest.fn(async () => undefined),
  prunePullEcho: jest.fn(async () => undefined),
}));

/* eslint-disable import/first -- les `jest.mock` ci-dessus doivent précéder
   cet import dans le source : ils sont hoistés à l'exécution, mais la règle
   lit l'ordre écrit. */
import { acquireFastSync, requestSync, stopAutoSync } from './engine';

function pullResponse() {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      data: {},
      next_cursor: null,
      has_more: false,
      server_timestamp: new Date().toISOString(),
    }),
  };
}

// Le cooldown anti-flap du moteur est de 3 s : sans l'attendre entre deux
// scénarios, le second serait reporté et fausserait le compte.
const COOLDOWN_MS = 3000;

function cycles(): number {
  return mockApiFetch.mock.calls.length;
}

beforeEach(() => {
  jest.useFakeTimers();
  mockApiFetch.mockReset();
  mockApiFetch.mockImplementation(async () => pullResponse());
});

afterEach(async () => {
  stopAutoSync();
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe('requestSync — debounce par classe', () => {
  it("'structural' déclenche un cycle à 400 ms, pas avant", async () => {
    requestSync('structural');
    // Ce que ce test protège : PAS de push à chaque frappe. La borne haute
    // est volontairement lâche — le déclenchement passe par deux minuteries
    // (debounce puis ordonnanceur), donc le cycle part quelques
    // millisecondes après l'échéance, pas pile dessus.
    await jest.advanceTimersByTimeAsync(399);
    expect(cycles()).toBe(0);
    await jest.advanceTimersByTimeAsync(50);
    expect(cycles()).toBe(1);
  });

  it("'value' martelé : le debounce de 2 s empêche un push par tap", async () => {
    // Le cas du stepper de poids : ~40 taps en 6 s. Chaque tap relance le
    // debounce, donc aucun cycle pendant le martèlement.
    for (let i = 0; i < 40; i += 1) {
      requestSync('value');
      await jest.advanceTimersByTimeAsync(150);
    }
    expect(cycles()).toBeLessThanOrEqual(1); // au plus le déclenchement du maxWait

    await jest.advanceTimersByTimeAsync(2000);
    expect(cycles()).toBeGreaterThanOrEqual(1);
  });

  it("'value' martelé sans relâche est quand même poussé (maxWait 10 s)", async () => {
    // 100 × 150 ms = 15 s de martèlement continu. Sans `maxWaitMs`, chaque
    // tap repousserait l'échéance et RIEN ne partirait jamais — c'est le
    // seul test qui protège contre ce mode de défaillance.
    for (let i = 0; i < 100; i += 1) {
      requestSync('value');
      await jest.advanceTimersByTimeAsync(150);
    }
    expect(cycles()).toBeGreaterThanOrEqual(1);
  });
});

describe('acquireFastSync — compteur de références', () => {
  it('deux prises, une libération : la cadence continue', async () => {
    const releaseA = acquireFastSync();
    acquireFastSync();
    releaseA();

    await jest.advanceTimersByTimeAsync(5000);
    expect(cycles()).toBeGreaterThanOrEqual(1);
  });

  it('toutes les références libérées : plus aucun cycle rapide', async () => {
    const releaseA = acquireFastSync();
    const releaseB = acquireFastSync();
    releaseA();
    releaseB();
    await jest.advanceTimersByTimeAsync(COOLDOWN_MS);
    mockApiFetch.mockClear();

    await jest.advanceTimersByTimeAsync(60_000);
    expect(cycles()).toBe(0);
  });

  it('libérer deux fois la même référence ne décrémente pas deux fois', async () => {
    const releaseA = acquireFastSync();
    acquireFastSync();
    releaseA();
    releaseA(); // no-op attendu
    await jest.advanceTimersByTimeAsync(COOLDOWN_MS);
    mockApiFetch.mockClear();

    await jest.advanceTimersByTimeAsync(10_000);
    expect(cycles()).toBeGreaterThanOrEqual(1);
  });
});
