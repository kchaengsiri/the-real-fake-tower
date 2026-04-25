"use client";

import type { Cell } from "@/lib/engine/entityTypes";
import { motion } from "framer-motion";
import PixelSprite from "./PixelSprite";

interface EntityTileProps {
  cell: Cell;
  isDefeatable?: boolean;
  isPlayerPosition: boolean;
  onClick?: () => void;
}

const RANK_COLORS: Record<string, string> = {
  o: "bg-emerald-600", // Minion - Rich Green
  h: "bg-amber-500", // Elite - Vibrant Gold/Amber
  c: "bg-rose-600", // Captain - Strong Red/Rose
  b: "bg-indigo-700", // Boss - Deep Indigo/Purple
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
        border-2 transition-all cursor-pointer relative overflow-hidden
        ${isPlayerPosition ? "bg-blue-200 ring-2 ring-blue-500 ring-offset-2 z-10 border-blue-600" : "bg-white"}
        ${isBoss ? "boss-entity ring-4 ring-indigo-600 ring-offset-2 z-10 border-indigo-900" : ""}
        ${isBuff ? "bg-sky-500 shadow-inner border-sky-700" : ""}
        ${
          !isPlayerPosition && entity !== null && entity?.type === "enemy"
            ? `${RANK_COLORS[entity.rank] ?? ""} border-black/20`
            : ""
        }
        ${entity === null && !isPlayerPosition ? "bg-slate-100 shadow-inner opacity-60 border-slate-300" : ""}
      `}
      onClick={onClick}
      whileHover={{ scale: 1.05, zIndex: 20 }}
      whileTap={{ scale: 0.95 }}
      animate={
        isDefeatable && !isPlayerPosition && entity
          ? {
              boxShadow: isBoss
                ? [
                    "0 0 20px rgba(255, 215, 0, 0.4)",
                    "0 0 40px rgba(255, 215, 0, 0.8)",
                    "0 0 20px rgba(255, 215, 0, 0.4)",
                  ]
                : [
                    "inset 0 0 10px rgba(255, 255, 255, 0.2)",
                    "inset 0 0 20px rgba(255, 255, 255, 0.5)",
                    "inset 0 0 10px rgba(255, 255, 255, 0.2)",
                  ],
              scale: isBoss ? [1, 1.02, 1] : [1, 1.05, 1],
            }
          : {}
      }
      transition={
        isDefeatable
          ? {
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }
          : {}
      }
    >
      {isBoss && isDefeatable && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-yellow-400/20 to-transparent pointer-events-none"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />
      )}

      {entity?.spriteId && (
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <PixelSprite
            id={entity.spriteId}
            className="w-full h-full drop-shadow-lg"
          />
        </div>
      )}

      {entity?.type === "enemy" && (
        <div className="absolute top-1 right-1 flex flex-col items-end drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] z-10">
          <span className="text-white font-black text-xl leading-none">
            {entity.level}
          </span>
          <span className="text-white text-[8px] font-bold uppercase tracking-tighter opacity-95">
            {RANK_LABELS[entity.rank] ?? ""}
          </span>
        </div>
      )}
      {isBuff && (
        <div className="absolute top-1 right-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] z-10">
          <span className="text-white font-black text-xl leading-none">
            x{entity.level}
          </span>
        </div>
      )}
      {entity === null && !isPlayerPosition && (
        <div className="w-full h-full flex items-center justify-center opacity-20">
          <div className="w-12 h-12 bg-[url('https://api.dicebear.com/7.x/shapes/svg?seed=Floor')] bg-contain" />
        </div>
      )}
    </motion.div>
  );
}
