import { describe, expect, it } from "vitest";
import {
  BUFF_LEVEL_BOOSTS,
  BUFF_MULTIPLIERS,
  applyBuffEffect,
  applyBuffMultiplier,
  applyLevelBoost,
  calculateNewLevel,
  createCellId,
  getEntityRank,
  getRandomBuffConfig,
  isAdjacent,
  isEntityDefeatable,
} from "./entityTypes";

describe("entityTypes", () => {
  describe("getEntityRank", () => {
    it("returns 'o' for levels 1-20", () => {
      expect(getEntityRank(1)).toBe("o");
      expect(getEntityRank(10)).toBe("o");
      expect(getEntityRank(20)).toBe("o");
    });

    it("returns 'h' for levels 21-50", () => {
      expect(getEntityRank(21)).toBe("h");
      expect(getEntityRank(35)).toBe("h");
      expect(getEntityRank(50)).toBe("h");
    });

    it("returns 'c' for levels 51-99", () => {
      expect(getEntityRank(51)).toBe("c");
      expect(getEntityRank(75)).toBe("c");
      expect(getEntityRank(99)).toBe("c");
    });

    it("returns 'b' for levels 100+", () => {
      expect(getEntityRank(100)).toBe("b");
      expect(getEntityRank(150)).toBe("b");
      expect(getEntityRank(1000)).toBe("b");
    });
  });

  describe("isEntityDefeatable", () => {
    it("returns true when player level equals enemy level", () => {
      expect(
        isEntityDefeatable(10, {
          id: "e1",
          type: "enemy",
          rank: "o",
          level: 10,
        }),
      ).toBe(true);
    });

    it("returns true when player level is greater than enemy level", () => {
      expect(
        isEntityDefeatable(15, {
          id: "e1",
          type: "enemy",
          rank: "o",
          level: 10,
        }),
      ).toBe(true);
    });

    it("returns false when player level is less than enemy level", () => {
      expect(
        isEntityDefeatable(5, {
          id: "e1",
          type: "enemy",
          rank: "o",
          level: 10,
        }),
      ).toBe(false);
    });
  });

  describe("calculateNewLevel", () => {
    it("adds enemy level to current player level", () => {
      expect(calculateNewLevel(10, 5)).toBe(15);
      expect(calculateNewLevel(1, 100)).toBe(101);
      expect(calculateNewLevel(50, 50)).toBe(100);
    });
  });

  describe("isAdjacent", () => {
    it("returns true for positions one step apart horizontally", () => {
      expect(isAdjacent({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(true);
      expect(isAdjacent({ x: 5, y: 3 }, { x: 4, y: 3 })).toBe(true);
    });

    it("returns true for positions one step apart vertically", () => {
      expect(isAdjacent({ x: 0, y: 0 }, { x: 0, y: 1 })).toBe(true);
      expect(isAdjacent({ x: 3, y: 5 }, { x: 3, y: 4 })).toBe(true);
    });

    it("returns false for diagonal positions", () => {
      expect(isAdjacent({ x: 0, y: 0 }, { x: 1, y: 1 })).toBe(false);
    });

    it("returns false for non-adjacent positions", () => {
      expect(isAdjacent({ x: 0, y: 0 }, { x: 2, y: 0 })).toBe(false);
      expect(isAdjacent({ x: 0, y: 0 }, { x: 0, y: 2 })).toBe(false);
    });
  });

  describe("createCellId", () => {
    it("creates unique IDs for different positions", () => {
      expect(createCellId(0, 0)).toBe("cell-0-0");
      expect(createCellId(1, 2)).toBe("cell-1-2");
    });
  });

  describe("applyBuffMultiplier", () => {
    it("multiplies the current level by the given multiplier", () => {
      expect(applyBuffMultiplier(10, 2)).toBe(20);
      expect(applyBuffMultiplier(10, 3)).toBe(30);
      expect(applyBuffMultiplier(5, 2)).toBe(10);
    });
  });

  describe("applyLevelBoost", () => {
    it("adds the boost value to the current level", () => {
      expect(applyLevelBoost(10, 5)).toBe(15);
      expect(applyLevelBoost(10, 10)).toBe(20);
      expect(applyLevelBoost(5, 15)).toBe(20);
    });
  });

  describe("getRandomBuffConfig", () => {
    it("returns a valid buff config with type and value", () => {
      for (let i = 0; i < 10; i++) {
        const config = getRandomBuffConfig();
        expect(config).toHaveProperty("type");
        expect(config).toHaveProperty("value");

        if (config.type === "multiplier") {
          expect(BUFF_MULTIPLIERS).toContain(config.value);
        } else if (config.type === "levelBoost") {
          expect(BUFF_LEVEL_BOOSTS).toContain(config.value);
        }
      }
    });
  });

  describe("applyBuffEffect", () => {
    it("applies multiplier effect correctly", () => {
      const result = applyBuffEffect(10, { type: "multiplier", value: 2 });
      expect(result.newLevel).toBe(20);
      expect(result.message).toContain("x2");
    });

    it("applies level boost effect correctly", () => {
      const result = applyBuffEffect(10, { type: "levelBoost", value: 5 });
      expect(result.newLevel).toBe(15);
      expect(result.message).toContain("+5");
    });

    it("returns no change for unknown type", () => {
      const result = applyBuffEffect(10, {
        type: "shield" as "multiplier" | "levelBoost",
        value: 5,
      });
      expect(result.newLevel).toBe(10);
    });
  });
});
