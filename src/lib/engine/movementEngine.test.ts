import { describe, expect, it } from "vitest";
import type { Grid, PlayerState } from "./entityTypes";
import { validateMove } from "./movementEngine";

describe("movementEngine", () => {
  const testGrid: Grid = {
    width: 4,
    height: 4,
    cells: [
      [
        { id: "c0-0", position: { x: 0, y: 0 }, entity: null },
        { id: "c1-0", position: { x: 1, y: 0 }, entity: null },
        { id: "c2-0", position: { x: 2, y: 0 }, entity: null },
        { id: "c3-0", position: { x: 3, y: 0 }, entity: null },
      ],
      [
        { id: "c0-1", position: { x: 0, y: 1 }, entity: null },
        { id: "c1-1", position: { x: 1, y: 1 }, entity: null },
        { id: "c2-1", position: { x: 2, y: 1 }, entity: null },
        { id: "c3-1", position: { x: 3, y: 1 }, entity: null },
      ],
      [
        { id: "c0-2", position: { x: 0, y: 2 }, entity: null },
        { id: "c1-2", position: { x: 1, y: 2 }, entity: null },
        { id: "c2-2", position: { x: 2, y: 2 }, entity: null },
        { id: "c3-2", position: { x: 3, y: 2 }, entity: null },
      ],
      [
        { id: "c0-3", position: { x: 0, y: 3 }, entity: null },
        { id: "c1-3", position: { x: 1, y: 3 }, entity: null },
        { id: "c2-3", position: { x: 2, y: 3 }, entity: null },
        { id: "c3-3", position: { x: 3, y: 3 }, entity: null },
      ],
    ],
  };

  describe("validateMove", () => {
    it("allows move to empty adjacent cell", () => {
      const player: PlayerState = { level: 10, position: { x: 1, y: 1 } };
      const result = validateMove(testGrid, player, { x: 2, y: 1 });

      expect(result.canMove).toBe(true);
      expect(result.willWin).toBe(false);
      expect(result.willLose).toBe(false);
    });

    it("rejects move to non-adjacent cell", () => {
      const player: PlayerState = { level: 10, position: { x: 0, y: 0 } };
      const result = validateMove(testGrid, player, { x: 2, y: 2 });

      expect(result.canMove).toBe(false);
    });

    it("rejects move outside grid", () => {
      const player: PlayerState = { level: 10, position: { x: 0, y: 0 } };
      const result = validateMove(testGrid, player, { x: -1, y: 0 });

      expect(result.canMove).toBe(false);
    });

    it("allows move to defeatable enemy", () => {
      const gridWithEnemy: Grid = {
        ...testGrid,
        cells: testGrid.cells.map((row, y) =>
          row.map((cell, x) => {
            if (x === 2 && y === 1) {
              return {
                ...cell,
                entity: {
                  id: "e1",
                  type: "enemy" as const,
                  rank: "o" as const,
                  level: 5,
                },
              };
            }
            return cell;
          }),
        ),
      };

      const player: PlayerState = { level: 10, position: { x: 1, y: 1 } };
      const result = validateMove(gridWithEnemy, player, { x: 2, y: 1 });

      expect(result.canMove).toBe(true);
      expect(result.willWin).toBe(true);
      expect(result.willLose).toBe(false);
    });

    it("rejects move to too powerful enemy", () => {
      const gridWithEnemy: Grid = {
        ...testGrid,
        cells: testGrid.cells.map((row, y) =>
          row.map((cell, x) => {
            if (x === 2 && y === 1) {
              return {
                ...cell,
                entity: {
                  id: "e1",
                  type: "enemy" as const,
                  rank: "b" as const,
                  level: 100,
                },
              };
            }
            return cell;
          }),
        ),
      };

      const player: PlayerState = { level: 10, position: { x: 1, y: 1 } };
      const result = validateMove(gridWithEnemy, player, { x: 2, y: 1 });

      expect(result.canMove).toBe(true);
      expect(result.willWin).toBe(false);
      expect(result.willLose).toBe(true);
    });
  });
});
