import { describe, it, expect } from 'vitest';
import {
  morningReset,
  clearPenaltyFlags,
  LC_BASE,
  LC_MAX,
  PlayerLCState,
} from '../MorningReset';

const noBuffs = { food: 0, sleep: 0 };
const noPenalties = { burnout: false, injury: false };

describe('morningReset', () => {
  it('resets LC to base when no penalties or buffs', () => {
    const state: PlayerLCState = { current: 3, penalties: noPenalties, buffs: noBuffs };
    const result = morningReset(state);
    expect(result.finalLC).toBe(LC_BASE); // 10
  });

  it('applies burnout penalty (-2)', () => {
    const state: PlayerLCState = {
      current: 10,
      penalties: { burnout: true, injury: false },
      buffs: noBuffs,
    };
    const result = morningReset(state);
    expect(result.finalLC).toBe(8); // 10 - 2
    expect(result.penaltiesApplied.burnout).toBe(-2);
  });

  it('applies injury penalty (-1)', () => {
    const state: PlayerLCState = {
      current: 10,
      penalties: { burnout: false, injury: true },
      buffs: noBuffs,
    };
    const result = morningReset(state);
    expect(result.finalLC).toBe(9); // 10 - 1
    expect(result.penaltiesApplied.injury).toBe(-1);
  });

  it('applies both burnout and injury penalties (-3 total)', () => {
    const state: PlayerLCState = {
      current: 10,
      penalties: { burnout: true, injury: true },
      buffs: noBuffs,
    };
    const result = morningReset(state);
    expect(result.finalLC).toBe(7); // 10 - 2 - 1
  });

  it('applies food buff', () => {
    const state: PlayerLCState = {
      current: 10,
      penalties: noPenalties,
      buffs: { food: 1, sleep: 0 },
    };
    const result = morningReset(state);
    expect(result.finalLC).toBe(11); // 10 + 1
  });

  it('clamps max LC to LC_MAX (12)', () => {
    const state: PlayerLCState = {
      current: 10,
      penalties: noPenalties,
      buffs: { food: 3, sleep: 3 },
    };
    const result = morningReset(state);
    expect(result.finalLC).toBe(LC_MAX); // clamped to 12
  });

  it('clamps minimum LC to 0', () => {
    const state: PlayerLCState = {
      current: 10,
      penalties: { burnout: true, injury: true },
      buffs: { food: -20, sleep: 0 }, // edge case: negative buff
    };
    const result = morningReset(state);
    expect(result.finalLC).toBeGreaterThanOrEqual(0);
  });

  it('does not mutate input state', () => {
    const state: PlayerLCState = {
      current: 10,
      penalties: { burnout: true, injury: false },
      buffs: noBuffs,
    };
    morningReset(state);
    // penalties should still be true — morningReset does not mutate
    expect(state.penalties.burnout).toBe(true);
  });
});

describe('clearPenaltyFlags', () => {
  it('returns all flags as false', () => {
    const cleared = clearPenaltyFlags();
    expect(cleared.burnout).toBe(false);
    expect(cleared.injury).toBe(false);
  });
});
