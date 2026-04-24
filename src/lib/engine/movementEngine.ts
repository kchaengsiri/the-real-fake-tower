import type {
  Cell,
  EnemyEntity,
  Grid,
  PlayerState,
  Position,
} from "./entityTypes";
import { isAdjacent, isEntityDefeatable } from "./entityTypes";
import { getAdjacentPositions, getCell, isValidPosition } from "./gridEngine";

export interface MovementResult {
  success: boolean;
  newPosition: Position;
  message: string;
}

export interface MoveValidation {
  canMove: boolean;
  reason: string;
  willWin: boolean;
  willLose: boolean;
}

export function validateMove(
  grid: Grid,
  player: PlayerState,
  targetPosition: Position,
): MoveValidation {
  if (!isValidPosition(targetPosition, grid)) {
    return {
      canMove: false,
      reason: "Position is outside the grid",
      willWin: false,
      willLose: false,
    };
  }

  if (!isAdjacent(player.position, targetPosition)) {
    return {
      canMove: false,
      reason: "Position is not adjacent to current location",
      willWin: false,
      willLose: false,
    };
  }

  const targetCell = getCell(grid, targetPosition);

  if (!targetCell) {
    return {
      canMove: false,
      reason: "Invalid cell",
      willWin: false,
      willLose: false,
    };
  }

  if (targetCell.entity === null) {
    return {
      canMove: true,
      reason: "Empty cell - safe to move",
      willWin: false,
      willLose: false,
    };
  }

  if (targetCell.entity.type === "buff") {
    return {
      canMove: true,
      reason: "Buff cell - safe to move",
      willWin: false,
      willLose: false,
    };
  }

  if (targetCell.entity.type === "enemy") {
    const enemy = targetCell.entity as EnemyEntity;
    if (isEntityDefeatable(player.level, enemy)) {
      return {
        canMove: true,
        reason: `Enemy with level ${enemy.level} - you can defeat`,
        willWin: true,
        willLose: false,
      };
    }
    return {
      canMove: true,
      reason: `Enemy with level ${enemy.level} - too powerful`,
      willWin: false,
      willLose: true,
    };
  }

  return {
    canMove: false,
    reason: "Unknown cell type",
    willWin: false,
    willLose: false,
  };
}

export function getMovablePositions(
  grid: Grid,
  player: PlayerState,
): { position: Position; validation: MoveValidation }[] {
  return getAdjacentPositions(player.position)
    .map((pos) => ({
      position: pos,
      validation: validateMove(grid, player, pos),
    }))
    .filter((m) => m.validation.canMove);
}

export function executeMove(
  grid: Grid,
  player: PlayerState,
  targetPosition: Position,
): MovementResult {
  const validation = validateMove(grid, player, targetPosition);

  if (!validation.canMove) {
    return {
      success: false,
      newPosition: player.position,
      message: validation.reason,
    };
  }

  return {
    success: true,
    newPosition: targetPosition,
    message: validation.reason,
  };
}
