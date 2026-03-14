/**
 * JAM-70 — Intent System
 *
 * Players declare a focus category at the start of each day.
 * Declaring a focus gives a +10% efficiency bonus to all LC costs
 * in that category for the day. Players are NOT locked — they can
 * still perform any action. Skipping defaults to "Free" (no bonus/penalty).
 *
 * UI: simple category picker on the morning screen (after MorningReset).
 */

export type FocusCategory =
  | "farming"
  | "animal"
  | "mining"
  | "fishing"
  | "social"
  | "free";

export const FOCUS_CATEGORIES: FocusCategory[] = [
  "farming",
  "animal",
  "mining",
  "fishing",
  "social",
  "free",
];

export interface IntentState {
  /** The declared focus for today. Defaults to "free" if skipped. */
  focusCategory: FocusCategory;
  /** Whether the player explicitly chose a category (false = defaulted to free). */
  declared: boolean;
}

export const FOCUS_EFFICIENCY_BONUS = 0.1; // 10% LC cost reduction

/**
 * Creates a fresh IntentState (default: free, not declared).
 * Call at day start before the player picks a focus.
 */
export function createIntentState(): IntentState {
  return {
    focusCategory: "free",
    declared: false,
  };
}

/**
 * Player explicitly declares a focus category.
 * Returns a new IntentState — does not mutate the original.
 */
export function declareFocus(
  state: IntentState,
  category: FocusCategory
): IntentState {
  return {
    focusCategory: category,
    declared: category !== "free",
  };
}

/**
 * Returns the LC cost multiplier for a given action category,
 * factoring in the player's declared focus.
 *
 * - If focus matches the action category: 0.9 (10% cheaper)
 * - If focus is "free" or doesn't match: 1.0 (no change)
 */
export function getLCMultiplier(
  intent: IntentState,
  actionCategory: FocusCategory
): number {
  if (
    intent.focusCategory !== "free" &&
    intent.focusCategory === actionCategory
  ) {
    return 1 - FOCUS_EFFICIENCY_BONUS;
  }
  return 1.0;
}

/**
 * Applies the intent multiplier to a raw LC cost and returns
 * the adjusted cost (floored to nearest integer, minimum 1).
 */
export function applyFocusBonus(
  intent: IntentState,
  actionCategory: FocusCategory,
  rawCost: number
): number {
  const multiplier = getLCMultiplier(intent, actionCategory);
  return Math.max(1, Math.floor(rawCost * multiplier));
}

/**
 * Resets intent state at the start of a new day.
 * Called by MorningReset before presenting the focus picker.
 */
export function resetIntent(): IntentState {
  return createIntentState();
}

/**
 * Returns a human-readable label for a focus category.
 */
export function getFocusLabel(category: FocusCategory): string {
  const labels: Record<FocusCategory, string> = {
    farming: "Farming",
    animal: "Animal Husbandry",
    mining: "Mining",
    fishing: "Fishing",
    social: "Social",
    free: "Free Day",
  };
  return labels[category];
}
