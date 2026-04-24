import type {
  Cell,
  EnemyEntity,
  EntityRank,
  EntityType,
  GameEntity,
  Grid,
  Position,
} from "./entityTypes";
import { createCellId, createEntityId, getEntityRank } from "./entityTypes";
import { getCell, isSolvable } from "./gridEngine";

export type Difficulty = "easy" | "medium" | "hard";

export interface LevelDifficulty {
  minLevel: number;
  maxLevel: number;
  enemyCount: number;
  buffCount: number;
}

export interface GeneratorOptions {
  width: number;
  height: number;
  difficulty: LevelDifficulty;
  seed?: number;
}

const DIFFICULTY_PRESETS: Record<string, LevelDifficulty> = {
  easy: { minLevel: 1, maxLevel: 50, enemyCount: 6, buffCount: 2 },
  medium: { minLevel: 5, maxLevel: 100, enemyCount: 8, buffCount: 3 },
  hard: { minLevel: 10, maxLevel: 200, enemyCount: 10, buffCount: 4 },
};

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function generateEnemyLevel(
  rng: () => number,
  min: number,
  max: number,
): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function getAvailablePositions(grid: Grid, occupied: Set<string>): Position[] {
  const positions: Position[] = [];
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        positions.push({ x, y });
      }
    }
  }
  return positions;
}

function placeEntity(
  grid: Grid,
  occupied: Set<string>,
  rng: () => number,
  type: EntityType,
  rank: EntityRank,
  level: number,
): Position | null {
  const available = getAvailablePositions(grid, occupied);
  if (available.length === 0) return null;

  const pos = available[Math.floor(rng() * available.length)];
  const entity: GameEntity = {
    id: createEntityId(type, pos.x, pos.y),
    type: type,
    rank,
    level,
  } as GameEntity;
  grid.cells[pos.y][pos.x].entity = entity;

  occupied.add(`${pos.x},${pos.y}`);
  return pos;
}

function placeEnemy(
  grid: Grid,
  occupied: Set<string>,
  maxLevel: number,
  minLevel: number,
  rng: () => number,
): EnemyEntity | null {
  const level = generateEnemyLevel(rng, minLevel, maxLevel);
  const rank = getEntityRank(level);

  const pos = placeEntity(grid, occupied, rng, "enemy", rank, level);
  if (!pos) return null;

  const cell = getCell(grid, pos);
  return cell?.entity as EnemyEntity;
}

function placeBuff(
  grid: Grid,
  occupied: Set<string>,
  rng: () => number,
): Position | null {
  const multipliers = [2, 3];
  const multiplier = multipliers[Math.floor(rng() * multipliers.length)];
  return placeEntity(grid, occupied, rng, "buff", "o", multiplier);
}

export function generateSolvableLevel(
  options: GeneratorOptions,
  playerStartLevel = 1,
): Grid {
  const { width, height, difficulty, seed } = options;
  const rng = seededRandom(seed ?? Date.now());

  const cells: Cell[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({
        id: createCellId(x, y),
        position: { x, y },
        entity: null,
      });
    }
    cells.push(row);
  }

  const grid: Grid = { cells, width, height };
  const occupied = new Set<string>();

  const playerStart: Position = { x: 0, y: height - 1 };
  occupied.add(`${playerStart.x},${playerStart.y}`);

  const bossY = 0;
  const bossX = Math.floor(width / 2);
  const bossLevel = difficulty.maxLevel + 50;
  grid.cells[bossY][bossX].entity = {
    id: createEntityId("enemy", bossX, bossY),
    type: "enemy",
    rank: "b",
    level: bossLevel,
  };
  occupied.add(`${bossX},${bossY}`);

  const totalEnemies = difficulty.enemyCount;
  const placedEnemies: EnemyEntity[] = [];

  for (
    let i = 0;
    i < totalEnemies * 5 && placedEnemies.length < totalEnemies;
    i++
  ) {
    const enemy = placeEnemy(
      grid,
      occupied,
      difficulty.maxLevel,
      difficulty.minLevel,
      rng,
    );
    if (enemy) {
      placedEnemies.push(enemy);
    }
  }

  for (let i = 0; i < difficulty.buffCount; i++) {
    placeBuff(grid, occupied, rng);
  }

  let attempts = 0;
  while (attempts < 50) {
    if (isSolvable(grid, playerStartLevel, playerStart)) {
      return grid;
    }

    occupied.clear();
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = grid.cells[y][x];
        if (cell.entity?.type === "enemy" && cell.entity.rank === "b") {
          occupied.add(`${x},${y}`);
        } else {
          grid.cells[y][x].entity = null;
        }
      }
    }
    occupied.add(`${playerStart.x},${playerStart.y}`);

    for (const enemy of placedEnemies) {
      const pos = getAvailablePositions(grid, occupied);
      if (pos.length === 0) break;

      const newPos = pos[Math.floor(rng() * pos.length)];
      grid.cells[newPos.y][newPos.x].entity = {
        id: createEntityId("enemy", newPos.x, newPos.y),
        type: "enemy",
        rank: enemy.rank,
        level: enemy.level,
      };
      occupied.add(`${newPos.x},${newPos.y}`);
    }

    attempts++;
  }

  return grid;
}

export function generateLevel(
  options: {
    width?: number;
    height?: number;
    difficulty?: Difficulty;
    seed?: number;
  } = {},
): Grid {
  let diff: LevelDifficulty;
  const diffKey = options.difficulty;
  if (diffKey === "easy" || diffKey === "medium" || diffKey === "hard") {
    diff = DIFFICULTY_PRESETS[diffKey];
  } else {
    diff = DIFFICULTY_PRESETS.medium;
  }

  const defaults: GeneratorOptions = {
    width: options.width ?? 4,
    height: options.height ?? 5,
    difficulty: diff,
    seed: options.seed,
  };

  return generateSolvableLevel(defaults);
}
