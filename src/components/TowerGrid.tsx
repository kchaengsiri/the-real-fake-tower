"use client";

import { useGameSounds } from "@/hooks/useGameSounds";
import type { BuffEntity, EnemyEntity } from "@/lib/engine/entityTypes";
import { getCell } from "@/lib/engine/gridEngine";
import { useGameStore } from "@/lib/store/gameStore";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import EntityTile from "./EntityTile";
import PlayerAvatar from "./PlayerAvatar";

export default function TowerGrid() {
  const { grid, player, movePlayer, getMovablePositions, floatingText } =
    useGameStore();
  const movablePositions = getMovablePositions();
  const { playMove, playBuff, playLevelUp, playVictory } = useGameSounds();

  const handleCellClick = (x: number, y: number) => {
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

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-slate-200 p-6 rounded-2xl shadow-2xl border border-slate-300">
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
        </div>
      </div>

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

      <div className="mt-4 text-center text-gray-600">
        <p className="text-sky-700 font-semibold mt-2">Sky Blue = Buff (multiplier)</p>
      </div>
    </div>
  );
}
