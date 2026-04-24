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
  o: "bg-emerald-600", // Minion - Rich Green
  h: "bg-amber-500",   // Elite - Vibrant Gold/Amber
  c: "bg-rose-600",    // Captain - Strong Red/Rose
  b: "bg-indigo-700",  // Boss - Deep Indigo/Purple
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
        ${entity === null && !isPlayerPosition ? "bg-slate-300 shadow-inner opacity-40 border-slate-400" : ""}
      `}
      onClick={onClick}
      whileHover={{ scale: 1.05, zIndex: 20 }}
      whileTap={{ scale: 0.95 }}
    >
      {entity?.type === "enemy" && (
        <div className="flex flex-col items-center justify-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
          <span className="text-white font-black text-2xl leading-none">{entity.level}</span>
          <span className="text-white text-[10px] font-bold uppercase tracking-tighter mt-1 opacity-95">
            {RANK_LABELS[entity.rank] ?? ""}
          </span>
        </div>
      )}
      {isBuff && (
        <div className="flex flex-col items-center justify-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
          <span className="text-white font-black text-3xl leading-none">?</span>
          <span className="text-white text-sm font-bold mt-1">x{entity.level}</span>
        </div>
      )}
      {entity === null && !isPlayerPosition && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-4 h-4 border border-slate-300 transform rotate-45 opacity-30" />
        </div>
      )}
    </motion.div>
  );
}
