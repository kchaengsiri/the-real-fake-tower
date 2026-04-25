import type { Cell, EnemyEntity, Grid, Position } from "./entityTypes";
import { isAdjacent } from "./entityTypes";

export function isValidPosition(position: Position, grid: Grid): boolean {
  return (
    position.x >= 0 &&
    position.x < grid.width &&
    position.y >= 0 &&
    position.y < grid.height
  );
}

export function getCell(grid: Grid, position: Position): Cell | null {
  if (!isValidPosition(position, grid)) {
    return null;
  }
  return grid.cells[position.y]?.[position.x] ?? null;
}

export function getAdjacentPositions(position: Position): Position[] {
  return [
    { x: position.x, y: position.y - 1 },
    { x: position.x, y: position.y + 1 },
    { x: position.x - 1, y: position.y },
    { x: position.x + 1, y: position.y },
  ];
}

export function getValidAdjacentCells(
  grid: Grid,
  playerPosition: Position,
): Cell[] {
  return getAdjacentPositions(playerPosition)
    .map((pos) => getCell(grid, pos))
    .filter((cell): cell is Cell => cell !== null);
}

export function findPathToBoss(
  grid: Grid,
  start: Position,
  targetPosition: Position,
): Position[] | null {
  const visited = new Set<string>();
  const queue: { position: Position; path: Position[] }[] = [
    { position: start, path: [start] },
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    const key = `${current.position.x},${current.position.y}`;

    if (visited.has(key)) {
      continue;
    }
    visited.add(key);

    if (
      current.position.x === targetPosition.x &&
      current.position.y === targetPosition.y
    ) {
      return current.path;
    }

    for (const adjacent of getAdjacentPositions(current.position)) {
      if (
        isValidPosition(adjacent, grid) &&
        !visited.has(`${adjacent.x},${adjacent.y}`)
      ) {
        queue.push({ position: adjacent, path: [...current.path, adjacent] });
      }
    }
  }

  return null;
}

export function findBossPosition(grid: Grid): Position | null {
  for (const row of grid.cells) {
    for (const cell of row) {
      if (cell.entity?.type === "enemy" && cell.entity.rank === "b") {
        return cell.position;
      }
    }
  }
  return null;
}

/**
 * Checks if the grid is solvable using a greedy reachability search.
 * It repeatedly identifies all reachable enemies or buffs the player can currently defeat,
 * collects the "best" one (prioritizing buffs then weakest enemies), and expands.
 */
export function isSolvable(
  grid: Grid,
  playerStartLevel: number,
  playerStartPosition: Position,
): boolean {
  const bossPosition = findBossPosition(grid);
  if (!bossPosition) return false;

  let currentLevel = playerStartLevel;
  const defeatedPositions = new Set<string>();

  // Helper to find all entities reachable from the start through empty or defeated cells
  function getReachableEntities(): { pos: Position; entity: any }[] {
    const reachable: { pos: Position; entity: any }[] = [];
    const visited = new Set<string>();
    const queue: Position[] = [playerStartPosition];
    visited.add(`${playerStartPosition.x},${playerStartPosition.y}`);

    while (queue.length > 0) {
      const curr = queue.shift();
      if (!curr) continue;

      for (const adj of getAdjacentPositions(curr)) {
        const key = `${adj.x},${adj.y}`;
        if (!isValidPosition(adj, grid) || visited.has(key)) continue;

        visited.add(key);
        const cell = getCell(grid, adj);
        if (!cell) continue;

        if (cell.entity && !defeatedPositions.has(key)) {
          // Found an entity! This is the boundary of our current reach.
          reachable.push({ pos: adj, entity: cell.entity });
        } else {
          // Empty cell or already defeated, we can pass through
          queue.push(adj);
        }
      }
    }
    return reachable;
  }

  while (true) {
    const reachable = getReachableEntities();
    const beatable = reachable.filter((e) => {
      if (e.entity.type === "enemy") return currentLevel >= e.entity.level;
      return true; // Buffs are always collectible
    });

    if (beatable.length === 0) break;

    // Can we beat the boss?
    const boss = beatable.find((e) => e.entity.rank === "b");
    if (boss) return true;

    // Pick the best target: buffs first, then weakest enemies
    beatable.sort((a, b) => {
      if (a.entity.type === "buff" && b.entity.type !== "buff") return -1;
      if (a.entity.type !== "buff" && b.entity.type === "buff") return 1;
      return a.entity.level - b.entity.level;
    });

    const target = beatable[0];
    const targetKey = `${target.pos.x},${target.pos.y}`;

    if (target.entity.type === "enemy") {
      currentLevel += target.entity.level;
    } else {
      // Buff logic
      const val = target.entity.level;
      if (val === 2 || val === 3) {
        currentLevel *= val;
      } else {
        currentLevel += val;
      }
    }

    defeatedPositions.add(targetKey);
  }

  return false;
}
