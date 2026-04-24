import { create } from "zustand";
import type { EnemyEntity, GameState, Position } from "../engine/entityTypes";
import { calculateNewLevel } from "../engine/entityTypes";
import { applyBuffEffect } from "../engine/entityTypes";
import { findBossPosition, getCell } from "../engine/gridEngine";
import { type Difficulty, generateLevel } from "../engine/levelGenerator";
import { validateMove } from "../engine/movementEngine";

export type { Difficulty } from "../engine/levelGenerator";

interface GameStore extends GameState {
  difficulty: Difficulty;
  startGame: () => void;
  startGameWithDifficulty: (difficulty: Difficulty) => void;
  movePlayer: (targetPosition: Position) => void;
  resetGame: () => void;
  getMovablePositions: () => { position: Position; defeatable: boolean }[];
  getFloatingText: () => string | null;
}

function createInitialGrid(
  difficulty: Difficulty,
): ReturnType<typeof generateLevel> {
  const options = {
    width: 5,
    height: 6,
    difficulty,
  };
  return generateLevel(options);
}

function createInitialState(difficulty: Difficulty): GameState {
  const grid = createInitialGrid(difficulty);
  return {
    player: {
      level: 1,
      position: { x: 0, y: grid.height - 1 },
    },
    grid,
    status: "idle",
    floatingText: null,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState("medium"),
  difficulty: "medium",

  startGame: () => {
    const state = get();
    set({ status: "playing", grid: createInitialGrid(state.difficulty) });
  },

  startGameWithDifficulty: (difficulty: Difficulty) => {
    set({
      difficulty,
      ...createInitialState(difficulty),
      status: "playing",
    });
  },

  movePlayer: (targetPosition: Position) => {
    const state = get();
    const validation = validateMove(state.grid, state.player, targetPosition);

    if (!validation.canMove) {
      return;
    }

    if (validation.willLose) {
      set({ status: "gameover" });
      return;
    }

    const targetCell = getCell(state.grid, targetPosition);
    let newLevel = state.player.level;
    let floatingText: string | null = null;

    if (targetCell?.entity?.type === "enemy") {
      const enemy = targetCell.entity as EnemyEntity;
      newLevel = calculateNewLevel(state.player.level, enemy.level);
      floatingText = `+${enemy.level}`;
    }

    if (targetCell?.entity?.type === "buff") {
      const buff = targetCell.entity;
      const result = applyBuffEffect(state.player.level, {
        type:
          buff.level === 2 || buff.level === 3 ? "multiplier" : "levelBoost",
        value: buff.level,
      });
      newLevel = result.newLevel;
      floatingText = result.message;
    }

    const newGrid = { ...state.grid };
    const originalCell = getCell(state.grid, state.player.position);

    if (originalCell) {
      originalCell.entity = null;
    }

    const newTargetCell = getCell(newGrid, targetPosition);
    if (newTargetCell) {
      newTargetCell.entity = null;
    }

    set({
      player: {
        level: newLevel,
        position: targetPosition,
      },
      grid: newGrid,
      floatingText,
    });

    const bossPos = findBossPosition(newGrid);
    if (!bossPos) {
      set({ status: "won" });
      return;
    }

    if (targetPosition.x === bossPos.x && targetPosition.y === bossPos.y) {
      set({ status: "won" });
    }
  },

  resetGame: () => {
    const state = get();
    set({
      ...createInitialState(state.difficulty),
    });
  },

  getMovablePositions: () => {
    const state = get();
    const adjacent = [
      { x: state.player.position.x, y: state.player.position.y - 1 },
      { x: state.player.position.x, y: state.player.position.y + 1 },
      { x: state.player.position.x - 1, y: state.player.position.y },
      { x: state.player.position.x + 1, y: state.player.position.y },
    ];

    return adjacent
      .filter((pos) => {
        const cell = getCell(state.grid, pos);
        return cell !== null;
      })
      .map((pos) => {
        const validation = validateMove(state.grid, state.player, pos);
        return {
          position: pos,
          defeatable: validation.willWin,
        };
      });
  },

  getFloatingText: () => {
    return get().floatingText;
  },
}));
