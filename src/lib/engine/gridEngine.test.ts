import { describe, expect, it } from "vitest";
import type { Grid, Position } from "./entityTypes";
import { findBossPosition, getAdjacentPositions } from "./gridEngine";

describe("gridEngine", () => {
  const testGrid: Grid = {
    width: 3,
    height: 3,
    cells: [
      [
        { id: "c0-0", position: { x: 0, y: 0 }, entity: null },
        { id: "c1-0", position: { x: 1, y: 0 }, entity: null },
        { id: "c2-0", position: { x: 2, y: 0 }, entity: null },
      ],
      [
        { id: "c0-1", position: { x: 0, y: 1 }, entity: null },
        { id: "c1-1", position: { x: 1, y: 1 }, entity: null },
        { id: "c2-1", position: { x: 2, y: 1 }, entity: null },
      ],
      [
        { id: "c0-2", position: { x: 0, y: 2 }, entity: null },
        { id: "c1-2", position: { x: 1, y: 2 }, entity: null },
        { id: "c2-2", position: { x: 2, y: 2 }, entity: null },
      ],
    ],
  };

  describe("getAdjacentPositions", () => {
    it("returns all four adjacent positions", () => {
      const pos: Position = { x: 1, y: 1 };
      const adjacent = getAdjacentPositions(pos);

      expect(adjacent).toHaveLength(4);
      expect(adjacent).toContainEqual({ x: 1, y: 0 });
      expect(adjacent).toContainEqual({ x: 1, y: 2 });
      expect(adjacent).toContainEqual({ x: 0, y: 1 });
      expect(adjacent).toContainEqual({ x: 2, y: 1 });
    });

    it("returns correct adjacent positions for corner", () => {
      const pos: Position = { x: 0, y: 0 };
      const adjacent = getAdjacentPositions(pos);

      expect(adjacent).toHaveLength(4);
      expect(adjacent).toContainEqual({ x: 0, y: -1 });
      expect(adjacent).toContainEqual({ x: 0, y: 1 });
      expect(adjacent).toContainEqual({ x: -1, y: 0 });
      expect(adjacent).toContainEqual({ x: 1, y: 0 });
    });
  });

  describe("findBossPosition", () => {
    it("returns position of boss entity", () => {
      const gridWithBoss: Grid = {
        ...testGrid,
        cells: [
          [
            { id: "c0-0", position: { x: 0, y: 0 }, entity: null },
            {
              id: "c1-0",
              position: { x: 1, y: 0 },
              entity: { id: "boss", type: "enemy", rank: "b", level: 100 },
            },
            { id: "c2-0", position: { x: 2, y: 0 }, entity: null },
          ],
          testGrid.cells[1],
          testGrid.cells[2],
        ],
      };

      const bossPos = findBossPosition(gridWithBoss);

      expect(bossPos).toEqual({ x: 1, y: 0 });
    });

    it("returns null when no boss exists", () => {
      const bossPos = findBossPosition(testGrid);
      expect(bossPos).toBeNull();
    });
  });
});
