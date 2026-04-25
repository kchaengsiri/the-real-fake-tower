"use client";

import { useGameSounds } from "@/hooks/useGameSounds";
import type { BuffEntity, EnemyEntity } from "@/lib/engine/entityTypes";
import { getCell } from "@/lib/engine/gridEngine";
import { useGameStore } from "@/lib/store/gameStore";
import { useStatsStore } from "@/lib/store/statsStore";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import EntityTile from "./EntityTile";
import PlayerAvatar from "./PlayerAvatar";

const CombatParticles = ({
  position,
}: { position: { x: number; y: number } }) => {
  return (
    <div
      className="absolute pointer-events-none z-40"
      style={{
        left: position.x * 80 + 40,
        top: position.y * 80 + 40,
      }}
    >
      {[...Array(8)].map((_, i) => (
        <motion.div
          // biome-ignore lint/suspicious/noArrayIndexKey: simple particles
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 100,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute w-2 h-2 rounded-full bg-yellow-400"
        />
      ))}
    </div>
  );
};

export default function TowerGrid() {
  const {
    grid,
    player,
    movePlayer,
    getMovablePositions,
    floatingText,
    autoSolve,
    isSolving,
    vfx,
  } = useGameStore();
  const { hasSeenControlsTutorial, setHasSeenControlsTutorial } =
    useStatsStore();
  const movablePositions = getMovablePositions();
  const { playMove, playBuff, playLevelUp, playVictory } = useGameSounds();

  const handleCellClick = (x: number, y: number) => {
    if (isSolving) return;
    const isMovable = movablePositions.some(
      (pos) => pos.position.x === x && pos.position.y === y,
    );
    if (isMovable) {
      const cell = getCell(grid, { x, y });
      if (cell?.entity?.type === "buff") {
        playBuff();
      }
      movePlayer({ x, y });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSolving) return;

      let targetX = player.position.x;
      let targetY = player.position.y;

      switch (e.key) {
        case "ArrowUp":
          targetY -= 1;
          break;
        case "ArrowDown":
          targetY += 1;
          break;
        case "ArrowLeft":
          targetX -= 1;
          break;
        case "ArrowRight":
          targetX += 1;
          break;
        default:
          return;
      }

      const isMovable = movablePositions.some(
        (pos) => pos.position.x === targetX && pos.position.y === targetY,
      );

      if (isMovable) {
        const cell = getCell(grid, { x: targetX, y: targetY });
        if (cell?.entity?.type === "buff") {
          playBuff();
        }
        movePlayer({ x: targetX, y: targetY });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    player.position,
    movablePositions,
    isSolving,
    movePlayer,
    grid,
    playBuff,
  ]);

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={
          vfx.shake ? { x: [-5, 5, -5, 5, 0], y: [-2, 2, -2, 2, 0] } : {}
        }
        transition={{ duration: 0.3 }}
        className="bg-slate-200 p-6 rounded-2xl shadow-2xl border border-slate-300 relative"
      >
        <div className="flex items-center gap-4 mb-4">
          <span className="text-lg font-semibold">
            Your Level: {player.level}
          </span>
        </div>
        <div
          className="relative grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${grid.width}, 80px)`,
          }}
        >
          {grid.cells.map((row, y) =>
            row.map((cell, x) => {
              const isPlayerPosition =
                player.position.x === x && player.position.y === y;
              const movablePos = movablePositions.find(
                (pos) => pos.position.x === x && pos.position.y === y,
              );

              return (
                <div key={cell.id} className="relative">
                  <EntityTile
                    cell={cell}
                    isDefeatable={movablePos?.defeatable ?? false}
                    isPlayerPosition={isPlayerPosition}
                    onClick={() => handleCellClick(x, y)}
                  />
                </div>
              );
            }),
          )}
          <PlayerAvatar />

          <AnimatePresence>
            {vfx.lastCombatPosition && (
              <CombatParticles position={vfx.lastCombatPosition} />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {floatingText && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -30 }}
            exit={{ opacity: 0, y: -60 }}
            className="absolute text-3xl font-bold text-green-500 floating-text"
          >
            {floatingText}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex flex-col items-center gap-2">
        <p className="text-sky-700 font-semibold">
          Sky Blue = Buff (multiplier)
        </p>

        <button
          type="button"
          onClick={autoSolve}
          disabled={isSolving}
          className={`mt-4 px-6 py-2 rounded-full font-bold transition-all ${
            isSolving
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl active:scale-95"
          }`}
        >
          {isSolving ? "AI Solving..." : "AI Auto-Solve"}
        </button>
      </div>

      <AnimatePresence>
        {!hasSeenControlsTutorial && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center space-y-6">
              <div className="flex justify-center gap-2">
                <div className="w-10 h-10 border-2 border-gray-200 rounded-lg flex items-center justify-center text-xl">
                  ↑
                </div>
              </div>
              <div className="flex justify-center gap-2">
                <div className="w-10 h-10 border-2 border-gray-200 rounded-lg flex items-center justify-center text-xl">
                  ←
                </div>
                <div className="w-10 h-10 border-2 border-gray-200 rounded-lg flex items-center justify-center text-xl">
                  ↓
                </div>
                <div className="w-10 h-10 border-2 border-gray-200 rounded-lg flex items-center justify-center text-xl">
                  →
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                New Controls!
              </h3>
              <p className="text-gray-600">
                You can now use <b>Arrow Keys</b> to control your character and
                climb the tower faster.
              </p>
              <button
                type="button"
                onClick={() => setHasSeenControlsTutorial(true)}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
