"use client";

import { useGameStore } from "@/lib/store/gameStore";
import { motion } from "framer-motion";

export default function PlayerAvatar() {
  const { player } = useGameStore();

  return (
    <motion.div
      layoutId="player"
      className="absolute w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center player-avatar z-10"
      animate={{
        x: player.position.x * 80,
        y: player.position.y * 80,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <span className="text-white font-bold text-lg">LV{player.level}</span>
    </motion.div>
  );
}
