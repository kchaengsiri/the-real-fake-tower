"use client";

import { useGameSounds } from "@/hooks/useGameSounds";
import { type Difficulty, useGameStore } from "@/lib/store/gameStore";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const DIFFICULTY_COLORS = {
  easy: "bg-green-500 hover:bg-green-600",
  medium: "bg-yellow-500 hover:bg-yellow-600",
  hard: "bg-red-500 hover:bg-red-600",
};

export default function GameUI() {
  const { status, player, resetGame, startGameWithDifficulty, difficulty } =
    useGameStore();
  const { setSoundEnabled, isSoundEnabled } = useGameSounds();
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(true);

  const handleDifficultySelect = (diff: Difficulty) => {
    startGameWithDifficulty(diff);
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabledState(newState);
    setSoundEnabled(newState);
  };

  if (status === "idle") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-gray-900">
            The Real Fake Tower
          </h1>
          <p className="text-gray-600 max-w-md">
            Climb the tower by defeating enemies with lower levels than yours.
            Your power grows with each victory!
          </p>

          {showDifficulty ? (
            <div className="space-y-4">
              <p className="text-gray-700 font-semibold">Select Difficulty:</p>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => handleDifficultySelect("easy")}
                  className={`px-6 py-3 text-white font-semibold rounded-lg transition-colors ${DIFFICULTY_COLORS.easy}`}
                >
                  Easy - Smaller enemies, more buffs
                </button>
                <button
                  type="button"
                  onClick={() => handleDifficultySelect("medium")}
                  className={`px-6 py-3 text-white font-semibold rounded-lg transition-colors ${DIFFICULTY_COLORS.medium}`}
                >
                  Medium - Balanced challenge
                </button>
                <button
                  type="button"
                  onClick={() => handleDifficultySelect("hard")}
                  className={`px-6 py-3 text-white font-semibold rounded-lg transition-colors ${DIFFICULTY_COLORS.hard}`}
                >
                  Hard - Bigger enemies, fewer buffs
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDifficulty(true)}
              className="px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Game
            </button>
          )}

          <button
            type="button"
            onClick={toggleSound}
            className="mt-4 px-4 py-2 text-gray-500 hover:text-gray-700"
          >
            {soundEnabled ? "Sound: ON" : "Sound: OFF"}
          </button>
        </div>
      </div>
    );
  }

  if (status === "won") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold text-green-600">Victory!</h1>
          <p className="text-2xl text-gray-700">You conquered the tower!</p>
          <p className="text-xl text-gray-600">Final Level: {player.level}</p>
          <button
            type="button"
            onClick={resetGame}
            className="px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  if (status === "gameover") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold text-red-600">Game Over</h1>
          <p className="text-2xl text-gray-700">
            You challenged an enemy too powerful!
          </p>
          <p className="text-xl text-gray-600">Your Level: {player.level}</p>
          <button
            type="button"
            onClick={resetGame}
            className="px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}
