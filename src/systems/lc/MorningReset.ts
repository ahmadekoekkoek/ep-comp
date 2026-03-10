/**
 * JAM-69 — Morning State Reset + Burnout Carry-over Logic
 *
 * Execution order each morning (before any player actions):
 *   1. Reset LC to base value (10)
 *   2. Apply carry-over penalties (burnout -2, injury -1)
 *   3. Clear penalty flags
 *   4. Apply buffs (food, sleep bonuses)
 *
 * The result is clamped to [0, LC_MAX] where LC_MAX = 12.
 */

export const LC_BASE = 10;
export const LC_MAX = 12;

export const PENALTIES = {
  burnout: -2,
  injury: -1,
} as const;

export interface PenaltyFlags {
  burnout: boolean;
  injury: boolean;
}

export interface Buffs {
  /** Bonus LC from eating a meal the previous evening */
  food: number;
  /** Bonus LC from sleeping in a upgraded bed */
  sleep: number;
}

export interface PlayerLCState {
  current: number;
  penalties: PenaltyFlags;
  buffs: Buffs;
}

export interface MorningResetResult {
  lcAfterReset: number;
  lcAfterPenalties: number;
  lcAfterBuffs: number;
  penaltiesApplied: Partial<typeof PENALTIES>;
  buffsApplied: Buffs;
  /** Final clamped LC value — use this for the day */
  finalLC: number;
}

/**
 * Run the morning LC reset sequence.
 * Returns a detailed result object for logging/UI feedback.
 * Mutates nothing — caller must apply `finalLC` to game state.
 */
export function morningReset(state: PlayerLCState): MorningResetResult {
  // Step 1 — reset to base
  let lc = LC_BASE;

  // Step 2 — apply carry-over penalties
  const penaltiesApplied: Partial<typeof PENALTIES> = {};

  if (state.penalties.burnout) {
    lc += PENALTIES.burnout;
    penaltiesApplied.burnout = PENALTIES.burnout;
  }

  if (state.penalties.injury) {
    lc += PENALTIES.injury;
    penaltiesApplied.injury = PENALTIES.injury;
  }

  const lcAfterPenalties = lc;

  // Step 3 — clear flags (reflected in result; caller must persist)
  // (no mutation here — caller clears flags after reading result)

  // Step 4 — apply buffs
  const buffsApplied: Buffs = {
    food: state.buffs.food ?? 0,
    sleep: state.buffs.sleep ?? 0,
  };
  lc += buffsApplied.food + buffsApplied.sleep;

  // Clamp to [0, LC_MAX]
  const finalLC = Math.min(Math.max(lc, 0), LC_MAX);

  return {
    lcAfterReset: LC_BASE,
    lcAfterPenalties,
    lcAfterBuffs: finalLC,
    penaltiesApplied,
    buffsApplied,
    finalLC,
  };
}

/**
 * Returns a cleared penalty flags object — call this after applying the reset result.
 */
export function clearPenaltyFlags(): PenaltyFlags {
  return { burnout: false, injury: false };
}
