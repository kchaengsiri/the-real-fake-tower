"use client";

import type { Cell } from "@/lib/engine/entityTypes";
import { motion } from "framer-motion";

interface EntityTileProps {
  cell: Cell;
  isDefeatable?: boolean;
  isPlayerPosition: boolean;
  onClick?: () => void;
}

const RANK_COLORS: Record<string, string> = {
  o: "bg-green-500",
  h: "bg-yellow-500",
  c: "bg-orange-500",
  b: "bg-purple-600",
};

const RANK_LABELS: Record<string, string> = {
  o: "Minion",
  h: "Elite",
  c: "Captain",
  b: "Boss",
};

export default function EntityTile({
  cell,
  isDefeatable = false,
  isPlayerPosition,
  onClick,
}: EntityTileProps) {
  const { entity } = cell;
  const isBoss = entity?.type === "enemy" && entity?.rank === "b";
  const isBuff = entity?.type === "buff";

  return (
    <motion.div
      className={`
        w-20 h-20 rounded-lg flex flex-col items-center justify-center
        border-2 transition-all cursor-pointer
        ${isPlayerPosition ? "bg-blue-100" : "bg-white"}
        ${isBoss ? "boss-entity" : ""}
        ${isBuff ? "bg-cyan-400" : ""}
        ${
          !isPlayerPosition && entity !== null && entity?.type === "enemy"
            ? (RANK_COLORS[entity.rank] ?? "")
            : ""
        }
        ${!isPlayerPosition && isDefeatable ? "defeatable" : ""}
        ${
          !isPlayerPosition && !isDefeatable && entity?.type === "enemy"
            ? "not-defeatable"
            : ""
        }
      `}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {entity?.type === "enemy" && (
        <>
          <span className="text-white font-bold text-lg">{entity.level}</span>
          <span className="text-white text-xs">
            {RANK_LABELS[entity.rank] ?? ""}
          </span>
        </>
      )}
      {isBuff && (
        <>
          <span className="text-white font-bold text-2xl">?</span>
          <span className="text-white text-xs">x{entity.level}</span>
        </>
      )}
      {entity === null && !isPlayerPosition && (
        <span className="text-gray-300 text-2xl">.</span>
      )}
    </motion.div>
  );
}
