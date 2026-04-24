export type SoundType = "victory" | "levelup" | "defeat" | "buff" | "move";

class SoundEngine {
  private audioContext: AudioContext | null = null;
  private enabled = true;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "square",
    volume = 0.1,
  ): void {
    if (!this.enabled) return;

    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration,
      );

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch {
      // Audio context might be blocked
    }
  }

  private playSequence(
    notes: { freq: number; dur: number; type?: OscillatorType }[],
  ): void {
    if (!this.enabled) return;

    let time = 0;
    for (const note of notes) {
      setTimeout(() => {
        this.playTone(note.freq, note.dur, note.type ?? "square", 0.1);
      }, time);
      time += note.dur * 1000;
    }
  }

  playVictory(): void {
    this.playSequence([
      { freq: 523, dur: 0.1 },
      { freq: 659, dur: 0.1 },
      { freq: 784, dur: 0.1 },
      { freq: 1047, dur: 0.3 },
    ]);
  }

  playLevelUp(): void {
    this.playSequence([
      { freq: 440, dur: 0.1 },
      { freq: 554, dur: 0.1 },
      { freq: 659, dur: 0.15 },
    ]);
  }

  playDefeat(): void {
    this.playSequence([
      { freq: 200, dur: 0.3, type: "sawtooth" },
      { freq: 150, dur: 0.4, type: "sawtooth" },
    ]);
  }

  playBuff(): void {
    this.playSequence([
      { freq: 880, dur: 0.1 },
      { freq: 1100, dur: 0.1 },
      { freq: 1320, dur: 0.2 },
    ]);
  }

  playMove(): void {
    this.playTone(300, 0.05, "square", 0.05);
  }

  playBossDefeated(): void {
    this.playSequence([
      { freq: 200, dur: 0.1 },
      { freq: 300, dur: 0.1 },
      { freq: 400, dur: 0.1 },
      { freq: 500, dur: 0.2 },
      { freq: 600, dur: 0.1 },
      { freq: 700, dur: 0.1 },
      { freq: 800, dur: 0.5 },
    ]);
  }

  playGameWon(): void {
    this.playSequence([
      { freq: 523, dur: 0.15 },
      { freq: 587, dur: 0.15 },
      { freq: 659, dur: 0.15 },
      { freq: 698, dur: 0.15 },
      { freq: 784, dur: 0.3 },
      { freq: 880, dur: 0.3 },
      { freq: 988, dur: 0.4 },
    ]);
  }
}

export const soundEngine = new SoundEngine();

export function playSound(type: SoundType): void {
  switch (type) {
    case "victory":
      soundEngine.playVictory();
      break;
    case "levelup":
      soundEngine.playLevelUp();
      break;
    case "defeat":
      soundEngine.playDefeat();
      break;
    case "buff":
      soundEngine.playBuff();
      break;
    case "move":
      soundEngine.playMove();
      break;
  }
}
