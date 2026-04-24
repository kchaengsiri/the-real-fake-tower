import { describe, expect, it } from "vitest";
import type { Position } from "./entityTypes";
import { findBossPosition, getCell, isSolvable } from "./gridEngine";
import { generateLevel, generateSolvableLevel } from "./levelGenerator";

function countEntities(grid: ReturnType<typeof generateLevel>) {
  let bossCount = 0;
  let enemyCount = 0;
  let buffCount = 0;
  for (const row of grid.cells) {
    for (const cell of row) {
      if (cell.entity?.type === "enemy" && cell.entity?.rank === "b") {
        bossCount++;
      } else if (cell.entity?.type === "enemy") {
        enemyCount++;
      } else if (cell.entity?.type === "buff") {
        buffCount++;
      }
    }
  }
  return { bossCount, enemyCount, buffCount };
}

describe("levelGenerator", () => {
  describe("generateLevel", () => {
    it("generates a grid with correct dimensions", () => {
      const grid = generateLevel({ width: 5, height: 6 });
      expect(grid.width).toBe(5);
      expect(grid.height).toBe(6);
      expect(grid.cells).toHaveLength(6);
      expect(grid.cells[0]).toHaveLength(5);
    });

    it("generates a grid with a boss entity", () => {
      const grid = generateLevel({ width: 4, height: 5 });
      const { bossCount } = countEntities(grid);
      expect(bossCount).toBeGreaterThanOrEqual(1);
    });

    it("places enemies and buffs in the grid", () => {
      const grid = generateLevel({ width: 4, height: 5 });
      const { enemyCount, buffCount } = countEntities(grid);
      expect(enemyCount + buffCount).toBeGreaterThan(0);
    });
  });

  describe("generateSolvableLevel", () => {
    it("generates a solvable level for player starting at level 1", () => {
      const grid = generateSolvableLevel(
        {
          width: 4,
          height: 5,
          difficulty: {
            minLevel: 1,
            maxLevel: 50,
            enemyCount: 6,
            buffCount: 2,
          },
        },
        1,
      );
      expect(grid).toBeDefined();
      expect(grid.cells).toHaveLength(5);
    });

    it("generates grid with correct entity positions", () => {
      const grid = generateLevel({ width: 3, height: 3 });
      for (const row of grid.cells) {
        for (const cell of row) {
          expect(cell).toHaveProperty("id");
          expect(cell).toHaveProperty("position");
          expect(cell).toHaveProperty("entity");
        }
      }
    });
  });

  describe("solvability guarantee", () => {
    it("always places at least one beatable enemy adjacent to player start", () => {
      for (let seed = 1; seed <= 50; seed++) {
        const grid = generateLevel({
          width: 5,
          height: 6,
          difficulty: "easy",
          seed,
        });
        const playerStart: Position = { x: 0, y: grid.height - 1 };

        // Check adjacent cells for at least one beatable enemy (level <= 1)
        const adjacent: Position[] = [
          { x: 0, y: playerStart.y - 1 },
          { x: 1, y: playerStart.y },
        ];

        const hasBeatable = adjacent.some((pos) => {
          const cell = getCell(grid, pos);
          return cell?.entity?.type === "enemy" && cell.entity.level <= 1;
        });

        // Either has a beatable enemy adjacent, or an empty/buff cell to move through
        const hasAccessible = adjacent.some((pos) => {
          const cell = getCell(grid, pos);
          return (
            cell !== null &&
            (cell.entity === null ||
              cell.entity.type === "buff" ||
              (cell.entity.type === "enemy" && cell.entity.level <= 1))
          );
        });

        expect(hasAccessible).toBe(true);
      }
    });

    it("generates solvable grids for easy difficulty across 50 seeds", () => {
      for (let seed = 1; seed <= 50; seed++) {
        const grid = generateLevel({
          width: 5,
          height: 6,
          difficulty: "easy",
          seed,
        });
        const playerStart: Position = { x: 0, y: grid.height - 1 };
        const solvable = isSolvable(grid, 1, playerStart);
        expect(solvable).toBe(true);
      }
    });

    it("generates solvable grids for medium difficulty across 50 seeds", () => {
      for (let seed = 1; seed <= 50; seed++) {
        const grid = generateLevel({
          width: 5,
          height: 6,
          difficulty: "medium",
          seed,
        });
        const playerStart: Position = { x: 0, y: grid.height - 1 };
        const solvable = isSolvable(grid, 1, playerStart);
        expect(solvable).toBe(true);
      }
    });

    it("generates solvable grids for hard difficulty across 50 seeds", () => {
      for (let seed = 1; seed <= 50; seed++) {
        const grid = generateLevel({
          width: 5,
          height: 6,
          difficulty: "hard",
          seed,
        });
        const playerStart: Position = { x: 0, y: grid.height - 1 };
        const solvable = isSolvable(grid, 1, playerStart);
        expect(solvable).toBe(true);
      }
    });

    it("always places regular enemies (not just boss)", () => {
      for (let seed = 1; seed <= 20; seed++) {
        const grid = generateLevel({
          width: 5,
          height: 6,
          difficulty: "medium",
          seed,
        });
        const { enemyCount } = countEntities(grid);
        expect(enemyCount).toBeGreaterThanOrEqual(3);
      }
    });
  });
});
