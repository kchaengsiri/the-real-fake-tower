import { create } from "zustand";
import type { EnemyEntity, GameState, Position } from "../engine/entityTypes";
import { calculateNewLevel } from "../engine/entityTypes";
import { applyBuffEffect } from "../engine/entityTypes";
import { findBossPosition, getCell } from "../engine/gridEngine";
import { type Difficulty, generateLevel } from "../engine/levelGenerator";
import { validateMove } from "../engine/movementEngine";
import { useStatsStore } from "./statsStore";

export type { Difficulty } from "../engine/levelGenerator";

interface GameStore extends GameState {
  difficulty: Difficulty;
  startGame: () => void;
  startGameWithDifficulty: (difficulty: Difficulty) => void;
  movePlayer: (targetPosition: Position) => void;
  resetGame: () => void;
  getMovablePositions: () => { position: Position; defeatable: boolean }[];
  getFloatingText: () => string | null;
  autoSolve: () => void;
  triggerVFX: (type: "shake" | "combat", position?: Position) => void;
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
      spriteId: "hero",
    },
    grid,
    status: "idle",
    floatingText: null,
    isSolving: false,
    startTime: null,
    vfx: {
      shake: false,
      lastCombatPosition: null,
    },
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState("medium"),
  difficulty: "medium",

  startGame: () => {
    const state = get();
    set({
      status: "playing",
      grid: createInitialGrid(state.difficulty),
      startTime: Date.now(),
    });
  },

  startGameWithDifficulty: (difficulty: Difficulty) => {
    set({
      difficulty,
      ...createInitialState(difficulty),
      status: "playing",
      startTime: Date.now(),
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
      useStatsStore.getState().recordLoss(state.difficulty, state.player.level);
      return;
    }

    const targetCell = getCell(state.grid, targetPosition);
    const entityType = targetCell?.entity?.type;
    let newLevel = state.player.level;
    let floatingText: string | null = null;

    if (entityType === "enemy" && targetCell?.entity) {
      const enemy = targetCell.entity as EnemyEntity;
      newLevel = calculateNewLevel(state.player.level, enemy.level);
      floatingText = `+${enemy.level}`;
    }

    if (entityType === "buff" && targetCell?.entity) {
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
      const duration = (Date.now() - (state.startTime || Date.now())) / 1000;
      useStatsStore.getState().recordWin(state.difficulty, duration, newLevel);
      return;
    }

    if (entityType) {
      get().triggerVFX(
        entityType === "enemy" ? "shake" : "combat",
        targetPosition,
      );
    }
  },

  triggerVFX: (type, position) => {
    if (type === "shake") {
      set((state) => ({
        vfx: {
          ...state.vfx,
          shake: true,
          lastCombatPosition: position ?? null,
        },
      }));
      setTimeout(
        () => set((state) => ({ vfx: { ...state.vfx, shake: false } })),
        300,
      );
    } else {
      set((state) => ({
        vfx: { ...state.vfx, lastCombatPosition: position ?? null },
      }));
      // Reset position after a short delay so particles can finish
      setTimeout(
        () =>
          set((state) => ({ vfx: { ...state.vfx, lastCombatPosition: null } })),
        1000,
      );
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

  autoSolve: async () => {
    const { grid, player, movePlayer, status, isSolving } = get();
    if (status !== "playing" || isSolving) return;

    const { solveGame } = await import("../engine/solver");
    const path = solveGame(grid, player);

    if (!path) {
      console.log("No solution found");
      return;
    }

    set({ isSolving: true });

    for (const pos of path) {
      if (get().status !== "playing") break;
      movePlayer(pos);
      // Wait for animation to complete
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    set({ isSolving: false });
  },
}));
