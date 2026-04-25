"use client";

interface PixelSpriteProps {
  id: string;
  className?: string;
}

export default function PixelSprite({ id, className = "" }: PixelSpriteProps) {
  // 16x16 grid pixel art
  switch (id) {
    case "hero":
      return (
        <svg
          viewBox="0 0 16 16"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
        >
          <title>Hero</title>
          {/* Body/Armor */}
          <rect x="4" y="6" width="8" height="8" fill="#2563eb" />
          <rect x="5" y="7" width="6" height="6" fill="#3b82f6" />
          {/* Helmet */}
          <rect x="5" y="2" width="6" height="4" fill="#1e40af" />
          <rect x="4" y="3" width="8" height="2" fill="#1e40af" />
          {/* Horns */}
          <rect x="4" y="1" width="2" height="2" fill="#fbbf24" />
          <rect x="10" y="1" width="2" height="2" fill="#fbbf24" />
          {/* Eyes */}
          <rect x="6" y="4" width="1" height="1" fill="black" />
          <rect x="9" y="4" width="1" height="1" fill="black" />
          {/* Shield */}
          <rect x="11" y="7" width="3" height="5" fill="#f59e0b" />
          <rect x="12" y="8" width="1" height="3" fill="#fbbf24" />
        </svg>
      );
    case "slime":
      return (
        <svg
          viewBox="0 0 16 16"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
        >
          <title>Slime</title>
          {/* Body */}
          <rect x="4" y="8" width="8" height="6" fill="#10b981" />
          <rect x="3" y="10" width="10" height="3" fill="#10b981" />
          <rect x="5" y="7" width="6" height="1" fill="#10b981" />
          {/* Eyes */}
          <rect x="6" y="10" width="1" height="1" fill="#064e3b" />
          <rect x="9" y="10" width="1" height="1" fill="#064e3b" />
          {/* Shine */}
          <rect x="5" y="9" width="1" height="1" fill="#34d399" />
        </svg>
      );
    case "skeleton":
      return (
        <svg
          viewBox="0 0 16 16"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
        >
          <title>Skeleton</title>
          {/* Ribs/Body */}
          <rect x="6" y="8" width="4" height="6" fill="#d1d5db" />
          <rect x="5" y="9" width="6" height="1" fill="#9ca3af" />
          <rect x="5" y="11" width="6" height="1" fill="#9ca3af" />
          {/* Head */}
          <rect x="5" y="3" width="6" height="5" fill="#f3f4f6" />
          {/* Helmet */}
          <rect x="4" y="2" width="8" height="2" fill="#eab308" />
          {/* Eyes */}
          <rect x="6" y="5" width="1" height="1" fill="#dc2626" />
          <rect x="9" y="5" width="1" height="1" fill="#dc2626" />
        </svg>
      );
    case "knight":
      return (
        <svg
          viewBox="0 0 16 16"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
        >
          <title>Knight</title>
          {/* Cape */}
          <rect x="3" y="6" width="10" height="9" fill="#991b1b" />
          {/* Armor */}
          <rect x="5" y="5" width="6" height="9" fill="#1f2937" />
          <rect x="6" y="6" width="4" height="7" fill="#374151" />
          {/* Helmet */}
          <rect x="5" y="2" width="6" height="4" fill="#111827" />
          {/* Visor */}
          <rect x="5" y="4" width="6" height="1" fill="#dc2626" />
          {/* Shield */}
          <rect x="10" y="7" width="4" height="6" fill="#4b5563" />
        </svg>
      );
    case "demon":
      return (
        <svg
          viewBox="0 0 16 16"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
        >
          <title>Demon</title>
          {/* Wings */}
          <rect x="2" y="4" width="12" height="6" fill="#4c1d95" />
          <rect x="1" y="5" width="14" height="4" fill="#5b21b6" />
          {/* Body */}
          <rect x="5" y="5" width="6" height="10" fill="#7c3aed" />
          <rect x="6" y="6" width="4" height="8" fill="#8b5cf6" />
          {/* Horns */}
          <rect x="4" y="2" width="2" height="3" fill="#dc2626" />
          <rect x="10" y="2" width="2" height="3" fill="#dc2626" />
          {/* Eyes */}
          <rect x="6" y="8" width="1" height="1" fill="red" />
          <rect x="9" y="8" width="1" height="1" fill="red" />
        </svg>
      );
    case "chest":
      return (
        <svg
          viewBox="0 0 16 16"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
        >
          <title>Treasure Chest</title>
          {/* Chest Body */}
          <rect x="3" y="6" width="10" height="8" fill="#713f12" />
          <rect x="2" y="7" width="12" height="6" fill="#854d0e" />
          {/* Trim */}
          <rect x="2" y="6" width="12" height="2" fill="#eab308" />
          <rect x="2" y="12" width="12" height="1" fill="#eab308" />
          {/* Lock */}
          <rect x="7" y="9" width="2" height="2" fill="black" />
        </svg>
      );
    default:
      return null;
  }
}
