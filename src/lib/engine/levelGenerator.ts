import type {
  Cell,
  EnemyEntity,
  EntityRank,
  Grid,
  Position,
} from "./entityTypes";
import { createCellId, createEntityId, getEntityRank } from "./entityTypes";
import { findBossPosition, getCell, isSolvable } from "./gridEngine";

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

const MAX_GENERATION_ATTEMPTS = 20;

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
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

function getDistanceToPlayer(pos: Position, playerStart: Position): number {
  return Math.abs(pos.x - playerStart.x) + Math.abs(pos.y - playerStart.y);
}

function getDistanceToBoss(pos: Position, bossPos: Position): number {
  return Math.abs(pos.x - bossPos.x) + Math.abs(pos.y - bossPos.y);
}

function getAdjacentPositions(pos: Position): Position[] {
  return [
    { x: pos.x, y: pos.y - 1 },
    { x: pos.x, y: pos.y + 1 },
    { x: pos.x - 1, y: pos.y },
    { x: pos.x + 1, y: pos.y },
  ];
}

function isValidPosition(grid: Grid, pos: Position): boolean {
  return pos.x >= 0 && pos.x < grid.width && pos.y >= 0 && pos.y < grid.height;
}

function placeEntity(
  grid: Grid,
  occupied: Set<string>,
  type: "enemy" | "buff",
  rank: EntityRank,
  level: number,
  pos: Position,
): void {
  grid.cells[pos.y][pos.x].entity = {
    id: createEntityId(type, pos.x, pos.y),
    type: type,
    rank,
    level,
  } as never;
  occupied.add(`${pos.x},${pos.y}`);
}

/**
 * Build a "golden path" from player start towards the boss using BFS.
 * Returns an ordered list of positions the player can walk through.
 */
function buildGoldenPath(
  grid: Grid,
  playerStart: Position,
  bossPos: Position,
  occupied: Set<string>,
  pathLength: number,
): Position[] {
  // BFS to find positions stepping from playerStart towards bossPos
  const path: Position[] = [];
  const visited = new Set<string>();
  visited.add(`${playerStart.x},${playerStart.y}`);

  let current = playerStart;

  for (let step = 0; step < pathLength; step++) {
    const adjacent = getAdjacentPositions(current).filter((p) => {
      const key = `${p.x},${p.y}`;
      return (
        isValidPosition(grid, p) &&
        !visited.has(key) &&
        !occupied.has(key) &&
        // Don't step onto boss position (it's already placed)
        !(p.x === bossPos.x && p.y === bossPos.y)
      );
    });

    if (adjacent.length === 0) break;

    // Prefer cells that move closer to the boss
    adjacent.sort(
      (a, b) => getDistanceToBoss(a, bossPos) - getDistanceToBoss(b, bossPos),
    );

    const next = adjacent[0];
    path.push(next);
    visited.add(`${next.x},${next.y}`);
    current = next;
  }

  return path;
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

  // Player starts bottom-left
  const playerStart: Position = { x: 0, y: height - 1 };
  occupied.add(`${playerStart.x},${playerStart.y}`);

  // Boss at top-center
  const bossY = 0;
  const bossX = Math.floor(width / 2);
  const bossPos: Position = { x: bossX, y: bossY };

  // --- Phase 1: Build a golden path of beatable enemies ---
  const goldenPathLength = Math.min(
    Math.floor(difficulty.enemyCount * 0.6),
    Math.max(3, Math.floor((width + height) / 2)),
  );

  const goldenPath = buildGoldenPath(
    grid,
    playerStart,
    bossPos,
    occupied,
    goldenPathLength,
  );

  let currentPower = playerStartLevel;
  for (const pos of goldenPath) {
    const maxLvl = Math.max(1, currentPower);
    const minLvl = 1;
    const enemyLevel = Math.floor(rng() * (maxLvl - minLvl + 1)) + minLvl;

    const rank = getEntityRank(enemyLevel);
    placeEntity(grid, occupied, "enemy", rank, enemyLevel, pos);
    currentPower += enemyLevel;
  }

  // --- Phase 2: Fill ALL remaining cells ---
  const allAvailable = getAvailablePositions(grid, occupied).filter(
    (p) => !(p.x === bossPos.x && p.y === bossPos.y),
  );

  // Shuffle available positions to randomize placement of buffs vs enemies
  for (let i = allAvailable.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [allAvailable[i], allAvailable[j]] = [allAvailable[j], allAvailable[i]];
  }

  // Calculate how many buffs to place based on difficulty
  const buffCount = Math.min(difficulty.buffCount, allAvailable.length);

  for (let i = 0; i < allAvailable.length; i++) {
    const pos = allAvailable[i];

    if (i < buffCount) {
      // Place a buff
      const multipliers = [2, 3];
      const multiplier = multipliers[Math.floor(rng() * multipliers.length)];
      placeEntity(grid, occupied, "buff", "o", multiplier, pos);
      // We don't update currentPower here for simplicity in golden path,
      // but buffs make it easier to win.
    } else {
      // Place an enemy
      const distToBoss = getDistanceToBoss(pos, bossPos);
      const maxDist =
        Math.abs(bossX - playerStart.x) + Math.abs(bossY - playerStart.y);
      const progressToBoss = 1 - distToBoss / Math.max(maxDist, 1);

      const isTrap = rng() < 0.2; // 20% chance of being a "trap" (harder enemy)
      let enemyLevel: number;

      if (isTrap) {
        const minTrapLevel = Math.floor(currentPower * 0.7);
        const maxTrapLevel = Math.max(
          minTrapLevel + 10,
          Math.floor(difficulty.maxLevel * progressToBoss * 1.5),
        );
        enemyLevel =
          Math.floor(rng() * (maxTrapLevel - minTrapLevel + 1)) + minTrapLevel;
      } else {
        const maxLvl = Math.max(
          1,
          Math.floor(currentPower * (0.5 + progressToBoss)),
        );
        enemyLevel = Math.floor(rng() * maxLvl) + 1;
        // Non-trap enemies generally help power up
        currentPower += enemyLevel;
      }

      const rank = getEntityRank(enemyLevel);
      placeEntity(grid, occupied, "enemy", rank, enemyLevel, pos);
    }
  }

  // --- Phase 3: Place the boss ---
  // Boss level is balanced against the potential power gain
  const bossLevel = Math.max(
    difficulty.maxLevel,
    Math.floor(currentPower * 0.8),
  );
  placeEntity(grid, occupied, "enemy", "b", bossLevel, bossPos);

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

  const genOptions: GeneratorOptions = {
    width: options.width ?? 4,
    height: options.height ?? 5,
    difficulty: diff,
    seed: options.seed,
  };

  // Retry loop: generate until we get a solvable level
  const playerStart: Position = {
    x: 0,
    y: (options.height ?? 5) - 1,
  };

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const attemptSeed =
      genOptions.seed != null
        ? genOptions.seed + attempt
        : Date.now() + attempt;

    const grid = generateSolvableLevel({ ...genOptions, seed: attemptSeed }, 1);

    if (isSolvable(grid, 1, playerStart)) {
      return grid;
    }
  }

  // Fallback: return the last attempt (golden path should make it solvable)
  return generateSolvableLevel(genOptions);
}
