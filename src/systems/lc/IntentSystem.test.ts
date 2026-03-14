import { describe, it, expect } from "vitest";
import {
  createIntentState,
  declareFocus,
  getLCMultiplier,
  applyFocusBonus,
  resetIntent,
  getFocusLabel,
  FOCUS_EFFICIENCY_BONUS,
  FOCUS_CATEGORIES,
} from "./IntentSystem";

describe("IntentSystem", () => {
  // --- Factory ---
  describe("createIntentState", () => {
    it("defaults to free category", () => {
      const state = createIntentState();
      expect(state.focusCategory).toBe("free");
    });

    it("defaults declared to false", () => {
      const state = createIntentState();
      expect(state.declared).toBe(false);
    });
  });

  // --- declareFocus ---
  describe("declareFocus", () => {
    it("sets the focus category", () => {
      const state = createIntentState();
      const updated = declareFocus(state, "farming");
      expect(updated.focusCategory).toBe("farming");
    });

    it("marks declared true for non-free categories", () => {
      const state = createIntentState();
      const updated = declareFocus(state, "mining");
      expect(updated.declared).toBe(true);
    });

    it("marks declared false when choosing free", () => {
      const state = createIntentState();
      const updated = declareFocus(state, "free");
      expect(updated.declared).toBe(false);
    });

    it("does not mutate original state", () => {
      const state = createIntentState();
      declareFocus(state, "fishing");
      expect(state.focusCategory).toBe("free");
    });

    it("supports all non-free categories", () => {
      const nonFree = FOCUS_CATEGORIES.filter((c) => c !== "free");
      for (const cat of nonFree) {
        const updated = declareFocus(createIntentState(), cat);
        expect(updated.focusCategory).toBe(cat);
        expect(updated.declared).toBe(true);
      }
    });
  });

  // --- getLCMultiplier ---
  describe("getLCMultiplier", () => {
    it("returns 0.9 when focus matches action category", () => {
      const state = declareFocus(createIntentState(), "farming");
      expect(getLCMultiplier(state, "farming")).toBe(0.9);
    });

    it("returns 1.0 when focus does not match", () => {
      const state = declareFocus(createIntentState(), "farming");
      expect(getLCMultiplier(state, "mining")).toBe(1.0);
    });

    it("returns 1.0 when focus is free", () => {
      const state = createIntentState();
      expect(getLCMultiplier(state, "farming")).toBe(1.0);
    });

    it("bonus equals FOCUS_EFFICIENCY_BONUS constant", () => {
      const state = declareFocus(createIntentState(), "social");
      expect(getLCMultiplier(state, "social")).toBe(1 - FOCUS_EFFICIENCY_BONUS);
    });
  });

  // --- applyFocusBonus ---
  describe("applyFocusBonus", () => {
    it("reduces cost by 10% when focus matches (floor)", () => {
      const state = declareFocus(createIntentState(), "farming");
      // 3 * 0.9 = 2.7 → floor → 2
      expect(applyFocusBonus(state, "farming", 3)).toBe(2);
    });

    it("does not reduce cost when focus does not match", () => {
      const state = declareFocus(createIntentState(), "farming");
      expect(applyFocusBonus(state, "mining", 3)).toBe(3);
    });

    it("floors the result", () => {
      const state = declareFocus(createIntentState(), "animal");
      // 5 * 0.9 = 4.5 → floor → 4
      expect(applyFocusBonus(state, "animal", 5)).toBe(4);
    });

    it("never returns less than 1", () => {
      const state = declareFocus(createIntentState(), "fishing");
      expect(applyFocusBonus(state, "fishing", 1)).toBe(1);
    });
  });

  // --- resetIntent ---
  describe("resetIntent", () => {
    it("returns a fresh free state", () => {
      const state = declareFocus(createIntentState(), "mining");
      const reset = resetIntent();
      expect(reset.focusCategory).toBe("free");
      expect(reset.declared).toBe(false);
    });
  });

  // --- getFocusLabel ---
  describe("getFocusLabel", () => {
    it("returns correct labels for all categories", () => {
      expect(getFocusLabel("farming")).toBe("Farming");
      expect(getFocusLabel("animal")).toBe("Animal Husbandry");
      expect(getFocusLabel("mining")).toBe("Mining");
      expect(getFocusLabel("fishing")).toBe("Fishing");
      expect(getFocusLabel("social")).toBe("Social");
      expect(getFocusLabel("free")).toBe("Free Day");
    });
  });
});
