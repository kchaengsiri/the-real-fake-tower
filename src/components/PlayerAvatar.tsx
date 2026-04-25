"use client";

import { useGameStore } from "@/lib/store/gameStore";
import { motion } from "framer-motion";
import PixelSprite from "./PixelSprite";

export default function PlayerAvatar() {
  const { player } = useGameStore();

  return (
    <motion.div
      layoutId="player"
      className="absolute w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center player-avatar z-20 shadow-lg border-2 border-blue-400 overflow-hidden"
      animate={{
        x: player.position.x * 80 + 2, // Centered in the 80px cell
        y: player.position.y * 80 + 2,
        scale: [1, 1.1, 0.9, 1],
        scaleX: [1, 0.8, 1.2, 1],
        scaleY: [1, 1.2, 0.8, 1],
      }}
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        y: { type: "spring", stiffness: 300, damping: 30 },
        scale: { duration: 0.3 },
        scaleX: { duration: 0.3 },
        scaleY: { duration: 0.3 },
      }}
    >
      <PixelSprite id="hero" className="w-full h-full p-1 drop-shadow-md" />
      <div className="absolute bottom-1 bg-black/60 px-1.5 rounded-md">
        <span className="text-white font-black text-xs">LV{player.level}</span>
      </div>
    </motion.div>
  );
}
