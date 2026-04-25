import { describe, expect, it } from "vitest";
import type { Grid, PlayerState } from "./entityTypes";
import { solveGame } from "./solver";

describe("solveGame", () => {
  it("should find a path to the boss in a simple grid", () => {
    const grid: Grid = {
      width: 3,
      height: 3,
      cells: [
        [
          {
            position: { x: 0, y: 0 },
            entity: { id: "b1", type: "enemy", rank: "b", level: 10 },
          },
          {
            position: { x: 1, y: 0 },
            entity: { id: "e2", type: "enemy", rank: "h", level: 5 },
          },
          { position: { x: 2, y: 0 }, entity: null },
        ],
        [
          {
            position: { x: 0, y: 1 },
            entity: { id: "e1", type: "enemy", rank: "o", level: 2 },
          },
          { position: { x: 1, y: 1 }, entity: null },
          { position: { x: 2, y: 1 }, entity: null },
        ],
        [
          { position: { x: 0, y: 2 }, entity: null },
          { position: { x: 1, y: 2 }, entity: null },
          { position: { x: 2, y: 2 }, entity: null },
        ],
      ],
    };

    const player: PlayerState = {
      level: 5,
      position: { x: 2, y: 2 },
    };

    const path = solveGame(grid, player);
    expect(path).not.toBeNull();
    // Potential path: (2,2) -> (1,2) -> (0,2) -> (0,1) [LV 5+2=7] -> (1,1) -> (1,0) [LV 7+5=12] -> (0,0) [LV 12 >= 10, WIN]
    expect(path?.length).toBeGreaterThan(0);
    const lastPos = path?.[path.length - 1];
    expect(lastPos).toEqual({ x: 0, y: 0 });
  });

  it("should return null if no path to boss exists", () => {
    const grid: Grid = {
      width: 3,
      height: 3,
      cells: [
        [
          {
            position: { x: 0, y: 0 },
            entity: { id: "b1", type: "enemy", rank: "b", level: 100 },
          },
          { position: { x: 1, y: 0 }, entity: null },
          { position: { x: 2, y: 0 }, entity: null },
        ],
        [
          { position: { x: 0, y: 1 }, entity: null },
          { position: { x: 1, y: 1 }, entity: null },
          { position: { x: 2, y: 1 }, entity: null },
        ],
        [
          { position: { x: 0, y: 2 }, entity: null },
          { position: { x: 1, y: 2 }, entity: null },
          { position: { x: 2, y: 2 }, entity: null },
        ],
      ],
    };

    const player: PlayerState = {
      level: 1,
      position: { x: 2, y: 2 },
    };

    const path = solveGame(grid, player);
    expect(path).toBeNull();
  });
});
