"use client";

import { useGameStore } from "@/lib/store/gameStore";
import { motion } from "framer-motion";

export default function PlayerAvatar() {
  const { player } = useGameStore();

  return (
    <motion.div
      layoutId="player"
      className="absolute w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center player-avatar z-20 shadow-lg border-2 border-blue-400"
      animate={{
        x: player.position.x * 80 + 2, // Centered in the 80px cell
        y: player.position.y * 80 + 2,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <span className="text-white font-black text-xl drop-shadow-md">LV{player.level}</span>
    </motion.div>
  );
}
