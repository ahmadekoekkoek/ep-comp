/**
 * JAM-71 — LC Data Model
 *
 * Defines the canonical PlayerState shape for Labor Capacity,
 * plus all pure functions that operate on it.
 *
 * Rules:
 *   - Base LC per day: 10
 *   - Max LC (with upgrades): 12
 *   - Burnout penalty: -2 LC next morning (triggered when LC hits 0)
 *   - Injury penalty: -1 LC next morning (applied externally by event system)
 *   - Both flags are cleared after MorningReset applies them
 *   - LC is clamped to [0, maxLC] at all times
 */

// ─── Constants ────────────────────────────────────────────────────────────────

export const LC_BASE = 10;
export const LC_MAX_UPGRADED = 12;
export const BURNOUT_PENALTY = 2;
export const INJURY_PENALTY = 1;
export const BURNOUT_TRIGGER_THRESHOLD = 0; // LC must reach 0 to trigger burnout

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LCState {
  /** Current available LC for today */
  currentLC: number;
  /** Maximum LC ceiling (10 base, up to 12 with upgrades) */
  maxLC: number;
  /** If true, next morning reset applies -2 LC penalty */
  burnoutFlag: boolean;
  /** If true, next morning reset applies -1 LC penalty */
  injuryFlag: boolean;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Create a fresh default LC state (new game / new save).
 */
export function createDefaultLCState(maxLC: number = LC_BASE): LCState {
  return {
    currentLC: maxLC,
    maxLC,
    burnoutFlag: false,
    injuryFlag: false,
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Returns the effective LC after applying any carry-over penalties,
 * without mutating state. Used by MorningReset preview UI.
 */
export function previewMorningLC(state: LCState): number {
  let lc = state.maxLC;
  if (state.burnoutFlag) lc -= BURNOUT_PENALTY;
  if (state.injuryFlag) lc -= INJURY_PENALTY;
  return Math.max(0, lc);
}

/**
 * Returns true if spending `amount` LC is possible given current state.
 */
export function canSpend(state: LCState, amount: number): boolean {
  return state.currentLC >= amount;
}

/**
 * Returns how many LC points have been spent today.
 */
export function lcSpentToday(state: LCState): number {
  return state.maxLC - state.currentLC;
}

// ─── Mutations (pure — return new state) ──────────────────────────────────────

/**
 * Spend LC for an action. Throws if insufficient.
 * Automatically sets burnoutFlag if currentLC drops to 0.
 */
export function spendLC(state: LCState, amount: number): LCState {
  if (!canSpend(state, amount)) {
    throw new Error(
      `Insufficient LC: need ${amount}, have ${state.currentLC}`
    );
  }
  const newLC = state.currentLC - amount;
  return {
    ...state,
    currentLC: newLC,
    burnoutFlag: state.burnoutFlag || newLC <= BURNOUT_TRIGGER_THRESHOLD,
  };
}

/**
 * Apply an injury flag (called by event/combat system).
 */
export function applyInjury(state: LCState): LCState {
  return { ...state, injuryFlag: true };
}

/**
 * Upgrade max LC (e.g. via barn upgrade, stamina training).
 * Caps at LC_MAX_UPGRADED.
 */
export function upgradeMaxLC(state: LCState): LCState {
  const newMax = Math.min(state.maxLC + 1, LC_MAX_UPGRADED);
  return { ...state, maxLC: newMax };
}

/**
 * Perform morning reset: restore LC to maxLC, apply penalties, clear flags.
 * This is the canonical reset — MorningReset.ts calls this internally.
 */
export function applyMorningReset(state: LCState): LCState {
  let lc = state.maxLC;
  if (state.burnoutFlag) lc -= BURNOUT_PENALTY;
  if (state.injuryFlag) lc -= INJURY_PENALTY;
  return {
    ...state,
    currentLC: Math.max(0, lc),
    burnoutFlag: false,
    injuryFlag: false,
  };
}
