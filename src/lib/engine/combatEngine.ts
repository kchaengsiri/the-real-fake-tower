import type { EnemyEntity, PlayerState, Position } from "./entityTypes";
import { calculateNewLevel, isEntityDefeatable } from "./entityTypes";

export interface CombatResult {
  success: boolean;
  newPlayerLevel: number;
  message: string;
}

export function resolveCombat(
  player: PlayerState,
  enemy: EnemyEntity,
): CombatResult {
  if (isEntityDefeatable(player.level, enemy)) {
    return {
      success: true,
      newPlayerLevel: calculateNewLevel(player.level, enemy.level),
      message: `Victory! Gained ${enemy.level} levels.`,
    };
  }

  return {
    success: false,
    newPlayerLevel: player.level,
    message: "Defeat! You challenged an enemy too powerful.",
  };
}

export function canDefeatEnemy(
  playerLevel: number,
  enemyLevel: number,
): boolean {
  return playerLevel >= enemyLevel;
}

export function getLevelGain(currentLevel: number, enemyLevel: number): number {
  return enemyLevel;
}

export function getAdditiveLevel(
  currentLevel: number,
  defeatedEnemies: EnemyEntity[],
): number {
  return defeatedEnemies.reduce(
    (total, enemy) => total + enemy.level,
    currentLevel,
  );
}
