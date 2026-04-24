import { describe, expect, it } from "vitest";
import { canDefeatEnemy, getLevelGain, resolveCombat } from "./combatEngine";
import type { PlayerState } from "./entityTypes";

describe("combatEngine", () => {
  describe("resolveCombat", () => {
    it("returns victory when player level >= enemy level", () => {
      const player: PlayerState = { level: 10, position: { x: 0, y: 0 } };
      const enemy = {
        id: "e1",
        type: "enemy" as const,
        rank: "o" as const,
        level: 5,
      };

      const result = resolveCombat(player, enemy);

      expect(result.success).toBe(true);
      expect(result.newPlayerLevel).toBe(15);
      expect(result.message).toContain("Victory");
    });

    it("returns defeat when player level < enemy level", () => {
      const player: PlayerState = { level: 5, position: { x: 0, y: 0 } };
      const enemy = {
        id: "e1",
        type: "enemy" as const,
        rank: "o" as const,
        level: 10,
      };

      const result = resolveCombat(player, enemy);

      expect(result.success).toBe(false);
      expect(result.newPlayerLevel).toBe(5);
      expect(result.message).toContain("Defeat");
    });

    it("returns victory when player level equals enemy level", () => {
      const player: PlayerState = { level: 10, position: { x: 0, y: 0 } };
      const enemy = {
        id: "e1",
        type: "enemy" as const,
        rank: "o" as const,
        level: 10,
      };

      const result = resolveCombat(player, enemy);

      expect(result.success).toBe(true);
      expect(result.newPlayerLevel).toBe(20);
    });
  });

  describe("canDefeatEnemy", () => {
    it("returns true when player can defeat enemy", () => {
      expect(canDefeatEnemy(10, 5)).toBe(true);
      expect(canDefeatEnemy(10, 10)).toBe(true);
    });

    it("returns false when player cannot defeat enemy", () => {
      expect(canDefeatEnemy(5, 10)).toBe(false);
    });
  });

  describe("getLevelGain", () => {
    it("returns the enemy level as the level gain", () => {
      expect(getLevelGain(10, 5)).toBe(5);
      expect(getLevelGain(1, 100)).toBe(100);
    });
  });
});
