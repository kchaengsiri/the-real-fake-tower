"use client";

import { useGameSounds } from "@/hooks/useGameSounds";
import { type Difficulty, useGameStore } from "@/lib/store/gameStore";
import { useStatsStore } from "@/lib/store/statsStore";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const DIFFICULTY_COLORS = {
  easy: "bg-green-500 hover:bg-green-600",
  medium: "bg-yellow-500 hover:bg-yellow-600",
  hard: "bg-red-500 hover:bg-red-600",
};

export default function GameUI() {
  const {
    status,
    player,
    resetGame,
    startGameWithDifficulty,
    difficulty,
    startTime,
  } = useGameStore();
  const {
    bestTimes,
    highestLevels,
    totalWins,
    totalLosses,
    history,
    username,
    setUsername,
  } = useStatsStore();
  const { setSoundEnabled, isSoundEnabled } = useGameSounds();
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(username);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTempName(username);
  }, [username]);

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

          <div className="flex flex-col items-center">
            {isEditingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={15}
                />
                <button
                  type="button"
                  onClick={() => {
                    setUsername(tempName);
                    setIsEditingName(false);
                  }}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="flex items-center gap-2 group cursor-pointer bg-transparent border-none"
                onClick={() => setIsEditingName(true)}
              >
                <span className="text-lg text-gray-600">Welcome, </span>
                <span className="text-lg font-bold text-blue-600 border-b-2 border-transparent group-hover:border-blue-600 transition-all">
                  {username}
                </span>
                <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  ✎ Edit
                </span>
              </button>
            )}
          </div>

          <p className="text-gray-600 max-w-md">
            Your power grows with each victory!
          </p>

          <div className="flex gap-4 justify-center">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Total Wins</p>
              <p className="text-2xl font-bold text-green-600">
                {mounted ? totalWins : 0}
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Best Time (Med)</p>
              <p className="text-2xl font-bold text-blue-600">
                {mounted && bestTimes.medium
                  ? `${bestTimes.medium.toFixed(1)}s`
                  : "--"}
              </p>
            </div>
          </div>

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

          <div className="flex gap-4 justify-center mt-4">
            <button
              type="button"
              onClick={toggleSound}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg"
            >
              {soundEnabled ? "🔊 Sound: ON" : "🔈 Sound: OFF"}
            </button>
            <button
              type="button"
              onClick={() => setShowStats(!showStats)}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg"
            >
              📊 Stats
            </button>
          </div>

          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-white rounded-2xl shadow-inner border border-gray-200 text-left"
            >
              <h3 className="font-bold text-gray-800 mb-2">Recent Runs</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-gray-400 text-sm">No games played yet.</p>
                ) : (
                  history.map((run, i) => (
                    <div
                      key={run.date}
                      className="text-sm flex justify-between border-b border-gray-50 pb-1"
                    >
                      <span className="capitalize text-gray-600">
                        {run.difficulty}
                      </span>
                      <span className="font-mono text-blue-500">
                        {run.time.toFixed(1)}s
                      </span>
                      <span className="font-bold text-green-600">
                        LV {run.level}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
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
