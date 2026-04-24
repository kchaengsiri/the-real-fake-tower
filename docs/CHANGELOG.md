# Changelog

All notable changes to this project will be documented in this file.

## [0.3.0] - 2026-04-24

### Added
- **Packed Grid Generation**: Every cell is now filled with an enemy or buff at game start.
- **Greedy Solvability Engine**: Replaced DFS with a greedy reachability search that accounts for backtracking through empty cells.
- **Visual Overhaul**:
  - Removed green/red win/loss borders to encourage player strategic thinking.
  - Significantly increased enemy and buff level font sizes and readability.
  - Added subtle "floor tile" visuals for visited and cleared cells.
- **UI Polish**:
  - Refined entity tiles with inner shadows and better color contrast.
  - Simplified grid legend to focus only on buffs.
  - Improved boss and player highlights.

## [0.2.0] - 2026-04-24

### Added

- **Procedural Level Generation**
  - `levelGenerator.ts` with solvability-guaranteed level generation
  - Seeded random generation for reproducible levels
  - Difficulty presets (easy, medium, hard)

- **Buff/Item System**
  - Buff type definitions (multiplier, levelBoost, shield)
  - Chest items with x2 and x3 multipliers
  - Buff effects applied on cell entry

- **8-bit Sound Effects**
  - Web Audio API-based sound engine
  - Victory, level-up, defeat, buff, move sounds
  - Toggle sound on/off

- **Game Difficulty Selection**
  - Easy: Smaller enemies, more buffs
  - Medium: Balanced challenge
  - Hard: Bigger enemies, fewer buffs

- **UI Enhancements**
  - Difficulty selection screen
  - Buff tile styling (cyan)
  - Sound toggle button

- **New Tests**
  - Buff function tests
  - Level generator tests

## [0.1.0] - 2026-04-24

### Added

- **Core Logic Engine**
  - Entity types with discriminating unions (`Player`, `Enemy`, `Boss`, `Buff`)
  - Level ranges: Minion (1-20), Elite (21-50), Captain (51-99), Boss (100+)
  - Combat engine with additive progression
  - Movement engine with adjacent cell validation
  - Grid engine with solvability checking

- **Game State Management**
  - Zustand store for game state
  - Player state tracking (level, position)
  - Grid state management
  - Game status tracking (idle, playing, won, gameover)

- **UI Components**
  - GameUI container with start/win/gameover screens
  - TowerGrid component with visual entity display
  - PlayerAvatar component with animated movement
  - EntityTile component with rank-based styling

- **Visual Features**
  - Green/red highlighting for defeatable/non-defeatable cells
  - Framer Motion animations for cell transitions
  - Floating text animations for level absorption
  - Boss cell special styling

- **Testing**
  - Unit tests for entityTypes
  - Unit tests for combatEngine
  - Unit tests for gridEngine
  - Unit tests for movementEngine

- **Configuration**
  - Next.js 15 with App Router
  - TypeScript strict mode
  - Tailwind CSS v4
  - Framer Motion
  - Zustand state management
  - Vitest testing
  - Biome linting