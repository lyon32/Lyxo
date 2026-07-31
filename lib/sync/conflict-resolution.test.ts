import { resolveConflict, type SyncableRecord } from './conflict-resolution';

// TESTING.md §1.2 : "LWW simple, égalité de timestamp, suppression qui doit
// gagner sur une modif plus ancienne" — les trois cas explicitement exigés.

const NOW = 1_700_000_000_000;

function record(overrides: Partial<SyncableRecord> = {}): SyncableRecord {
  return {
    id: 'row-1',
    updatedAt: new Date(NOW),
    deletedAt: null,
    ...overrides,
  };
}

describe('resolveConflict', () => {
  it('LWW simple : le plus récent gagne (remote)', () => {
    const local = record({ updatedAt: new Date(NOW) });
    const remote = record({ updatedAt: new Date(NOW + 1000) });
    expect(resolveConflict(local, remote)).toBe(remote);
  });

  it('LWW simple : le plus récent gagne (local)', () => {
    const local = record({ updatedAt: new Date(NOW + 1000) });
    const remote = record({ updatedAt: new Date(NOW) });
    expect(resolveConflict(local, remote)).toBe(local);
  });

  it('égalité de timestamp : remote gagne (convergence stable au rejeu)', () => {
    const local = record({ updatedAt: new Date(NOW) });
    const remote = record({ updatedAt: new Date(NOW) });
    expect(resolveConflict(local, remote)).toBe(remote);
  });

  it('une suppression gagne sur une modification plus ancienne', () => {
    const local = record({ updatedAt: new Date(NOW), deletedAt: null });
    const remote = record({ updatedAt: new Date(NOW + 1000), deletedAt: new Date(NOW + 1000) });
    expect(resolveConflict(local, remote)).toBe(remote);
  });

  it("une modification plus récente gagne sur une suppression plus ancienne (la suppression ne prime pas par nature)", () => {
    const local = record({ updatedAt: new Date(NOW), deletedAt: new Date(NOW) });
    const remote = record({ updatedAt: new Date(NOW + 1000), deletedAt: null });
    expect(resolveConflict(local, remote)).toBe(remote);
  });
});
