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

export function isSolvable(
  grid: Grid,
  playerStartLevel: number,
  playerStartPosition: Position,
): boolean {
  const bossPosition = findBossPosition(grid);
  if (!bossPosition) {
    return false;
  }

  const path = findPathToBoss(grid, playerStartPosition, bossPosition);
  if (!path) {
    return false;
  }

  let currentLevel = playerStartLevel;
  const defeatedEnemies: EnemyEntity[] = [];

  for (const pos of path) {
    const cell = getCell(grid, pos);
    if (cell?.entity?.type === "enemy") {
      const enemy = cell.entity as EnemyEntity;
      if (currentLevel < enemy.level) {
        return false;
      }
      currentLevel += enemy.level;
      defeatedEnemies.push(enemy);
    }
  }

  return true;
}
