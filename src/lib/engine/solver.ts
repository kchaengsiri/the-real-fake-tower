import type { Grid, PlayerState, Position } from "./entityTypes";
import {
  findBossPosition,
  findPathToBoss,
  getAdjacentPositions,
  getCell,
  isValidPosition,
} from "./gridEngine";

/**
 * AI Solver for The Real Fake Tower.
 * Uses a greedy approach to find a sequence of moves to reach and defeat the boss.
 */
export function solveGame(grid: Grid, player: PlayerState): Position[] | null {
  const bossPosition = findBossPosition(grid);
  if (!bossPosition) return null;

  let currentLevel = player.level;
  let currentPosition = player.position;
  const defeatedPositions = new Set<string>();
  const fullPath: Position[] = [];

  // Helper to find all entities reachable through empty or defeated cells
  function getReachableEntities(
    startPos: Position,
  ): { pos: Position; entity: any; path: Position[] }[] {
    const reachable: { pos: Position; entity: any; path: Position[] }[] = [];
    const visited = new Set<string>();
    const queue: { pos: Position; path: Position[] }[] = [
      { pos: startPos, path: [] },
    ];
    visited.add(`${startPos.x},${startPos.y}`);

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;
      const { pos, path } = current;

      for (const adj of getAdjacentPositions(pos)) {
        const key = `${adj.x},${adj.y}`;
        if (!isValidPosition(adj, grid) || visited.has(key)) continue;

        visited.add(key);
        const cell = getCell(grid, adj);
        if (!cell) continue;

        if (cell.entity && !defeatedPositions.has(key)) {
          // Found an entity! Boundary of reach.
          reachable.push({
            pos: adj,
            entity: cell.entity,
            path: [...path, adj],
          });
        } else {
          // Empty or defeated, pass through
          queue.push({ pos: adj, path: [...path, adj] });
        }
      }
    }
    return reachable;
  }

  // Clone grid to track "defeated" state locally
  // However, we can just use the defeatedPositions set.

  while (true) {
    const reachable = getReachableEntities(currentPosition);
    const beatable = reachable.filter((e) => {
      if (e.entity.type === "enemy") return currentLevel >= e.entity.level;
      return true; // Buffs always collectible
    });

    if (beatable.length === 0) break;

    // Can we beat the boss?
    const boss = beatable.find((e) => e.entity.rank === "b");
    if (boss) {
      fullPath.push(...boss.path);
      return fullPath;
    }

    // Pick the best target: buffs first, then weakest enemies
    beatable.sort((a, b) => {
      if (a.entity.type === "buff" && b.entity.type !== "buff") return -1;
      if (a.entity.type !== "buff" && b.entity.type === "buff") return 1;
      return a.entity.level - b.entity.level;
    });

    const target = beatable[0];
    const targetKey = `${target.pos.x},${target.pos.y}`;

    // Add path to full path
    fullPath.push(...target.path);

    // Update state
    if (target.entity.type === "enemy") {
      currentLevel += target.entity.level;
    } else {
      const val = target.entity.level;
      if (val === 2 || val === 3) {
        currentLevel *= val;
      } else {
        currentLevel += val;
      }
    }

    currentPosition = target.pos;
    defeatedPositions.add(targetKey);
  }

  return null;
}
