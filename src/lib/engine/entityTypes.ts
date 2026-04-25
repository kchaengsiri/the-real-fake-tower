export type EntityRank = "o" | "h" | "c" | "b";
export type EntityType = "player" | "enemy" | "buff";
export type GameStatus = "idle" | "playing" | "won" | "gameover";

export interface Position {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  type: EntityType;
  rank: EntityRank;
  level: number;
  spriteId?: string;
}

export interface PlayerEntity extends Entity {
  type: "player";
  rank: never;
}

export interface EnemyEntity extends Entity {
  type: "enemy";
  rank: EntityRank;
}

export interface BuffEntity extends Entity {
  type: "buff";
  rank: never;
}

export type GameEntity = PlayerEntity | EnemyEntity | BuffEntity;

export type BuffType = "multiplier" | "levelBoost" | "shield";
export type BuffEffect = {
  type: BuffType;
  value: number;
  duration?: number;
};

export const BUFF_MULTIPLIERS = [2, 3] as const;
export const BUFF_LEVEL_BOOSTS = [5, 10, 15] as const;

export interface BuffConfig {
  type: BuffType;
  value: number;
}

export interface Cell {
  id: string;
  position: Position;
  entity: GameEntity | null;
}

export interface Grid {
  cells: Cell[][];
  width: number;
  height: number;
}

export interface PlayerState {
  level: number;
  position: Position;
  spriteId?: string;
}

export interface GameState {
  player: PlayerState;
  grid: Grid;
  status: GameStatus;
  floatingText: string | null;
  isSolving: boolean;
  startTime: number | null;
  vfx: {
    shake: boolean;
    lastCombatPosition: Position | null;
  };
}

export const ENTITY_LEVEL_RANGES: Record<
  EntityRank,
  { min: number; max: number }
> = {
  o: { min: 1, max: 20 },
  h: { min: 21, max: 50 },
  c: { min: 51, max: 99 },
  b: { min: 100, max: Number.POSITIVE_INFINITY },
};

export function isEntityDefeatable(
  playerLevel: number,
  enemy: EnemyEntity,
): boolean {
  return playerLevel >= enemy.level;
}

export function calculateNewLevel(
  currentLevel: number,
  enemyLevel: number,
): number {
  return currentLevel + enemyLevel;
}

export function createCellId(x: number, y: number): string {
  return `cell-${x}-${y}`;
}

let entityIdCounter = 0;

export function createEntityId(type: EntityType, x: number, y: number): string {
  return `${type}-${x}-${y}-${entityIdCounter++}`;
}

export function resetEntityIdCounter(): void {
  entityIdCounter = 0;
}

export function isAdjacent(pos1: Position, pos2: Position): boolean {
  const dx = Math.abs(pos1.x - pos2.x);
  const dy = Math.abs(pos1.y - pos2.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

export function getEntityRank(level: number): EntityRank {
  if (level >= 100) return "b";
  if (level >= 51) return "c";
  if (level >= 21) return "h";
  return "o";
}

export function applyBuffMultiplier(
  currentLevel: number,
  multiplier: number,
): number {
  return currentLevel * multiplier;
}

export function applyLevelBoost(currentLevel: number, boost: number): number {
  return currentLevel + boost;
}

export function getRandomBuffConfig(): BuffConfig {
  const rand = Math.random();
  if (rand < 0.7) {
    const multiplier =
      BUFF_MULTIPLIERS[Math.floor(Math.random() * BUFF_MULTIPLIERS.length)];
    return { type: "multiplier", value: multiplier };
  }
  const boost =
    BUFF_LEVEL_BOOSTS[Math.floor(Math.random() * BUFF_LEVEL_BOOSTS.length)];
  return { type: "levelBoost", value: boost };
}

export function applyBuffEffect(
  currentLevel: number,
  buffConfig: BuffConfig,
): { newLevel: number; message: string } {
  switch (buffConfig.type) {
    case "multiplier":
      return {
        newLevel: applyBuffMultiplier(currentLevel, buffConfig.value),
        message: `x${buffConfig.value} multiplier activated!`,
      };
    case "levelBoost":
      return {
        newLevel: applyLevelBoost(currentLevel, buffConfig.value),
        message: `+${buffConfig.value} level boost!`,
      };
    default:
      return { newLevel: currentLevel, message: "No effect" };
  }
}
