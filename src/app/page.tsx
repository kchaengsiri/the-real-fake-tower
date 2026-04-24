"use client";

import GameUI from "@/components/GameUI";
import TowerGrid from "@/components/TowerGrid";
import { useGameStore } from "@/lib/store/gameStore";

export default function Home() {
  const { status } = useGameStore();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200">
      <GameUI />
      {status === "playing" && <TowerGrid />}
    </main>
  );
}
