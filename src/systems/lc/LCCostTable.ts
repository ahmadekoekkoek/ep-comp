/**
 * JAM-72 — LC Cost Table
 *
 * Single source of truth for all Labor Capacity costs.
 * Every action system must import from here — never hardcode costs.
 *
 * Costs per unit of work:
 *   Farm tile    = 1 LC
 *   Animal care  = 2 LC
 *   Mining       = 3 LC
 *   Fishing      = 2 LC
 *   Social       = 1 LC
 *
 * Unused LC is wasted at end of day (no carry-over).
 */

export const LC_COSTS = {
  FARM: 1,
  ANIMAL: 2,
  MINE: 3,
  FISH: 2,
  SOCIAL: 1,
} as const;

export type ActionType = keyof typeof LC_COSTS;

/**
 * Look up the LC cost for a given action type.
 * Throws if the action type is not recognised.
 */
export function getLCCost(action: ActionType): number {
  return LC_COSTS[action];
}

/**
 * Check whether a player has enough LC to perform an action.
 */
export function canAfford(currentLC: number, action: ActionType): boolean {
  return currentLC >= getLCCost(action);
}

/**
 * Deduct the LC cost of an action from the current LC total.
 * Returns the new LC value.
 * Throws if the player cannot afford the action.
 */
export function spendLC(currentLC: number, action: ActionType): number {
  if (!canAfford(currentLC, action)) {
    throw new Error(
      `Cannot afford action ${action}: requires ${getLCCost(action)} LC, have ${currentLC}`
    );
  }
  return currentLC - getLCCost(action);
}

/**
 * Given a current LC total, return all actions the player can still afford.
 */
export function affordableActions(currentLC: number): ActionType[] {
  return (Object.keys(LC_COSTS) as ActionType[]).filter((action) =>
    canAfford(currentLC, action)
  );
}

/**
 * Calculate the total LC cost of a planned sequence of actions.
 * Useful for the Daily Planner UI to show running totals.
 */
export function totalCost(actions: ActionType[]): number {
  return actions.reduce((sum, action) => sum + getLCCost(action), 0);
}
