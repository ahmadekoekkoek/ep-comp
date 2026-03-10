import { describe, it, expect } from 'vitest';
import {
  LC_COSTS,
  getLCCost,
  canAfford,
  spendLC,
  affordableActions,
  totalCost,
} from './LCCostTable';

describe('LC_COSTS table', () => {
  it('has correct cost for FARM', () => expect(LC_COSTS.FARM).toBe(1));
  it('has correct cost for ANIMAL', () => expect(LC_COSTS.ANIMAL).toBe(2));
  it('has correct cost for MINE', () => expect(LC_COSTS.MINE).toBe(3));
  it('has correct cost for FISH', () => expect(LC_COSTS.FISH).toBe(2));
  it('has correct cost for SOCIAL', () => expect(LC_COSTS.SOCIAL).toBe(1));
});

describe('getLCCost', () => {
  it('returns correct cost for each action type', () => {
    expect(getLCCost('FARM')).toBe(1);
    expect(getLCCost('ANIMAL')).toBe(2);
    expect(getLCCost('MINE')).toBe(3);
    expect(getLCCost('FISH')).toBe(2);
    expect(getLCCost('SOCIAL')).toBe(1);
  });
});

describe('canAfford', () => {
  it('returns true when LC exactly equals cost', () => {
    expect(canAfford(3, 'MINE')).toBe(true);
  });
  it('returns true when LC exceeds cost', () => {
    expect(canAfford(10, 'FARM')).toBe(true);
  });
  it('returns false when LC is below cost', () => {
    expect(canAfford(2, 'MINE')).toBe(false);
  });
  it('returns false at 0 LC', () => {
    expect(canAfford(0, 'FARM')).toBe(false);
  });
});

describe('spendLC', () => {
  it('deducts correct cost and returns new LC', () => {
    expect(spendLC(10, 'FARM')).toBe(9);
    expect(spendLC(10, 'MINE')).toBe(7);
  });
  it('allows spending down to exactly 0', () => {
    expect(spendLC(3, 'MINE')).toBe(0);
  });
  it('throws when LC is insufficient', () => {
    expect(() => spendLC(2, 'MINE')).toThrow('Cannot afford action MINE');
  });
  it('throws at 0 LC', () => {
    expect(() => spendLC(0, 'SOCIAL')).toThrow('Cannot afford action SOCIAL');
  });
});

describe('affordableActions', () => {
  it('returns all actions at full LC (10)', () => {
    const result = affordableActions(10);
    expect(result).toContain('FARM');
    expect(result).toContain('ANIMAL');
    expect(result).toContain('MINE');
    expect(result).toContain('FISH');
    expect(result).toContain('SOCIAL');
  });
  it('excludes MINE at LC=2', () => {
    const result = affordableActions(2);
    expect(result).not.toContain('MINE');
    expect(result).toContain('FARM');
    expect(result).toContain('SOCIAL');
  });
  it('returns only FARM and SOCIAL at LC=1', () => {
    const result = affordableActions(1);
    expect(result).toEqual(expect.arrayContaining(['FARM', 'SOCIAL']));
    expect(result).not.toContain('ANIMAL');
    expect(result).not.toContain('MINE');
    expect(result).not.toContain('FISH');
  });
  it('returns empty array at LC=0', () => {
    expect(affordableActions(0)).toEqual([]);
  });
});

describe('totalCost', () => {
  it('sums costs for a mixed action plan', () => {
    // FARM(1) + ANIMAL(2) + MINE(3) = 6
    expect(totalCost(['FARM', 'ANIMAL', 'MINE'])).toBe(6);
  });
  it('returns 0 for empty plan', () => {
    expect(totalCost([])).toBe(0);
  });
  it('handles repeated actions', () => {
    // FARM x3 = 3
    expect(totalCost(['FARM', 'FARM', 'FARM'])).toBe(3);
  });
  it('max day plan: 10 FARM tiles = 10 LC', () => {
    const plan = Array(10).fill('FARM') as any[];
    expect(totalCost(plan)).toBe(10);
  });
});
