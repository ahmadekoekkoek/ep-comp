import {
  createDefaultLCState,
  spendLC,
  applyInjury,
  upgradeMaxLC,
  applyMorningReset,
  previewMorningLC,
  canSpend,
  lcSpentToday,
  LC_BASE,
  LC_MAX_UPGRADED,
  BURNOUT_PENALTY,
  INJURY_PENALTY,
} from './LCDataModel';

describe('LCDataModel', () => {
  describe('createDefaultLCState', () => {
    it('creates state with base LC by default', () => {
      const s = createDefaultLCState();
      expect(s.currentLC).toBe(LC_BASE);
      expect(s.maxLC).toBe(LC_BASE);
      expect(s.burnoutFlag).toBe(false);
      expect(s.injuryFlag).toBe(false);
    });

    it('accepts custom maxLC', () => {
      const s = createDefaultLCState(12);
      expect(s.currentLC).toBe(12);
      expect(s.maxLC).toBe(12);
    });
  });

  describe('spendLC', () => {
    it('deducts LC correctly', () => {
      const s = createDefaultLCState();
      const next = spendLC(s, 3);
      expect(next.currentLC).toBe(7);
    });

    it('throws on insufficient LC', () => {
      const s = createDefaultLCState();
      expect(() => spendLC(s, 11)).toThrow('Insufficient LC');
    });

    it('sets burnoutFlag when LC reaches 0', () => {
      const s = createDefaultLCState();
      const next = spendLC(s, 10);
      expect(next.currentLC).toBe(0);
      expect(next.burnoutFlag).toBe(true);
    });

    it('preserves existing burnoutFlag', () => {
      const s = { ...createDefaultLCState(), burnoutFlag: true };
      const next = spendLC(s, 5);
      expect(next.burnoutFlag).toBe(true);
    });

    it('does not mutate original state', () => {
      const s = createDefaultLCState();
      spendLC(s, 3);
      expect(s.currentLC).toBe(10);
    });
  });

  describe('applyInjury', () => {
    it('sets injuryFlag', () => {
      const s = createDefaultLCState();
      expect(applyInjury(s).injuryFlag).toBe(true);
    });
  });

  describe('upgradeMaxLC', () => {
    it('increments maxLC by 1', () => {
      const s = createDefaultLCState();
      expect(upgradeMaxLC(s).maxLC).toBe(11);
    });

    it('caps at LC_MAX_UPGRADED', () => {
      const s = createDefaultLCState(12);
      expect(upgradeMaxLC(s).maxLC).toBe(LC_MAX_UPGRADED);
    });
  });

  describe('applyMorningReset', () => {
    it('restores LC to maxLC when no flags', () => {
      const s = { ...createDefaultLCState(), currentLC: 3 };
      expect(applyMorningReset(s).currentLC).toBe(10);
    });

    it('applies burnout penalty (-2)', () => {
      const s = { ...createDefaultLCState(), currentLC: 0, burnoutFlag: true };
      expect(applyMorningReset(s).currentLC).toBe(10 - BURNOUT_PENALTY);
    });

    it('applies injury penalty (-1)', () => {
      const s = { ...createDefaultLCState(), currentLC: 5, injuryFlag: true };
      expect(applyMorningReset(s).currentLC).toBe(10 - INJURY_PENALTY);
    });

    it('stacks burnout + injury penalties', () => {
      const s = { ...createDefaultLCState(), currentLC: 0, burnoutFlag: true, injuryFlag: true };
      expect(applyMorningReset(s).currentLC).toBe(10 - BURNOUT_PENALTY - INJURY_PENALTY);
    });

    it('clears both flags after reset', () => {
      const s = { ...createDefaultLCState(), burnoutFlag: true, injuryFlag: true };
      const next = applyMorningReset(s);
      expect(next.burnoutFlag).toBe(false);
      expect(next.injuryFlag).toBe(false);
    });

    it('clamps to 0 if penalties exceed maxLC', () => {
      const s = { ...createDefaultLCState(2), burnoutFlag: true, injuryFlag: true };
      expect(applyMorningReset(s).currentLC).toBe(0);
    });
  });

  describe('previewMorningLC', () => {
    it('returns maxLC when no flags', () => {
      const s = createDefaultLCState();
      expect(previewMorningLC(s)).toBe(10);
    });

    it('previews burnout deduction', () => {
      const s = { ...createDefaultLCState(), burnoutFlag: true };
      expect(previewMorningLC(s)).toBe(8);
    });
  });

  describe('canSpend', () => {
    it('returns true when sufficient', () => {
      expect(canSpend(createDefaultLCState(), 5)).toBe(true);
    });
    it('returns false when insufficient', () => {
      expect(canSpend(createDefaultLCState(), 11)).toBe(false);
    });
  });

  describe('lcSpentToday', () => {
    it('returns 0 at start of day', () => {
      expect(lcSpentToday(createDefaultLCState())).toBe(0);
    });
    it('returns correct spend after actions', () => {
      const s = spendLC(createDefaultLCState(), 4);
      expect(lcSpentToday(s)).toBe(4);
    });
  });
});
