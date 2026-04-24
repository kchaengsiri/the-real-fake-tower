"use client";

import { soundEngine } from "@/lib/engine/soundEngine";
import { useGameStore } from "@/lib/store/gameStore";
import { useEffect, useRef } from "react";

export function useGameSounds() {
  const status = useGameStore((state) => state.status);
  const prevStatusRef = useRef(status);

  useEffect(() => {
    const prevStatus = prevStatusRef.current;

    if (prevStatus === "playing" && status === "won") {
      soundEngine.playGameWon();
    }

    if (prevStatus === "playing" && status === "gameover") {
      soundEngine.playDefeat();
    }

    prevStatusRef.current = status;
  }, [status]);

  return {
    playVictory: () => soundEngine.playVictory(),
    playLevelUp: () => soundEngine.playLevelUp(),
    playDefeat: () => soundEngine.playDefeat(),
    playBuff: () => soundEngine.playBuff(),
    playMove: () => soundEngine.playMove(),
    setSoundEnabled: (enabled: boolean) => soundEngine.setEnabled(enabled),
    isSoundEnabled: () => soundEngine.isEnabled(),
  };
}
