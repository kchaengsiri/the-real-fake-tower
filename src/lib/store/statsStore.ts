import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Difficulty } from "./gameStore";

interface GameStat {
  difficulty: Difficulty;
  time: number; // in seconds
  level: number;
  date: string;
}

interface StatsStore {
  bestTimes: Record<Difficulty, number | null>;
  highestLevels: Record<Difficulty, number>;
  totalWins: number;
  totalLosses: number;
  history: GameStat[];
  username: string;
  hasSeenControlsTutorial: boolean;

  recordWin: (difficulty: Difficulty, time: number, level: number) => void;
  recordLoss: (difficulty: Difficulty, level: number) => void;
  setUsername: (name: string) => void;
  setHasSeenControlsTutorial: (seen: boolean) => void;
  resetStats: () => void;
}

export const useStatsStore = create<StatsStore>()(
  persist(
    (set) => ({
      bestTimes: { easy: null, medium: null, hard: null },
      highestLevels: { easy: 0, medium: 0, hard: 0 },
      totalWins: 0,
      totalLosses: 0,
      history: [],
      username: "Player",
      hasSeenControlsTutorial: false,

      recordWin: (difficulty, time, level) => {
        set((state) => {
          const currentBest = state.bestTimes[difficulty];
          const newBestTime =
            currentBest === null || time < currentBest ? time : currentBest;

          const currentHighest = state.highestLevels[difficulty];
          const newHighestLevel =
            level > currentHighest ? level : currentHighest;

          const newStat: GameStat = {
            difficulty,
            time,
            level,
            date: new Date().toISOString(),
          };

          return {
            totalWins: state.totalWins + 1,
            bestTimes: { ...state.bestTimes, [difficulty]: newBestTime },
            highestLevels: {
              ...state.highestLevels,
              [difficulty]: newHighestLevel,
            },
            history: [newStat, ...state.history].slice(0, 50), // Keep last 50 games
          };
        });
      },

      recordLoss: (difficulty, level) => {
        set((state) => {
          const currentHighest = state.highestLevels[difficulty];
          const newHighestLevel =
            level > currentHighest ? level : currentHighest;

          return {
            totalLosses: state.totalLosses + 1,
            highestLevels: {
              ...state.highestLevels,
              [difficulty]: newHighestLevel,
            },
          };
        });
      },

      setUsername: (username) => set({ username }),

      setHasSeenControlsTutorial: (hasSeenControlsTutorial) =>
        set({ hasSeenControlsTutorial }),

      resetStats: () => {
        set({
          bestTimes: { easy: null, medium: null, hard: null },
          highestLevels: { easy: 0, medium: 0, hard: 0 },
          totalWins: 0,
          totalLosses: 0,
          history: [],
          username: "Player",
          hasSeenControlsTutorial: false,
        });
      },
    }),
    {
      name: "tower-game-stats",
    },
  ),
);
