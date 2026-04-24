# PRD: The Real Fake Tower (MVP)

## 1. Project Overview
**The Real Fake Tower** is a web-based puzzle strategy game that transforms the infamous "false advertising" mobile game ads into a functional, playable experience. The game focuses on mathematical logic, strategic pathfinding, and power scaling within a tower-climbing context.

## 2. Core Game Loop
1. **Analyze:** Player assesses the current level ($X$) against adjacent enemies ($O, H, C, B$).
2. **Move:** Player selects a valid adjacent cell to move into.
3. **Resolve:** - If $Player_{LV} \ge Enemy_{LV}$: **Victory.** Player moves to the cell and absorbs the enemy's level ($X = X + Enemy_{LV}$).
   - If $Player_{LV} < Enemy_{LV}$: **Defeat.** Game Over.
4. **Ascend:** Clear levels and move upward until the Boss at the top floor is defeated.

---

## 3. Functional Requirements

### 3.1 Combat Logic & Mechanics
* **Additive Progression:** The core mechanic is simple addition. Winning a fight makes the player stronger by the exact level of the defeated foe.
* **Grid Movement:** Turn-based movement restricted to adjacent cells (Up, Down, Left, Right).
* **Permadeath:** If a player loses a fight, the session ends, and they must restart from Level 1.

### 3.2 Entity Definitions
| Code | Type | Level Range | Description |
| :--- | :--- | :--- | :--- |
| **X** | **Player** | Starts at 1 | The protagonist. |
| **O** | **Minion** | 1 – 20 | Entry-level guards and scouts. |
| **H** | **Elite** | 21 – 50 | Squad leaders and specialized units. |
| **C** | **Captain** | 51 – 99 | High-ranking commanders. |
| **B** | **Boss** | 100+ | The ultimate floor guardian. |

---

## 4. Technical Specifications

### 4.1 The Tech Stack
* **Framework:** Next.js 15+ (App Router)
* **Styling:** Tailwind CSS (Responsive Design)
* **State Management:** Zustand (for global game state: levels, grid status, and history)
* **Animations:** Framer Motion (for smooth cell transitions and "power-up" pop-up effects)
* **Logic/Testing:** TypeScript & Vitest (for core math and win-condition validation)

### 4.2 Data Schema (System Architecture)
```typescript
interface GameState {
  player: {
    level: number;
    position: { x: number; y: number };
  };
  grid: Cell[][];
  status: 'idle' | 'playing' | 'won' | 'gameover';
}

interface Cell {
  id: string;
  entity: {
    id: string;
    type: 'enemy' | 'buff' | 'player';
    rank: 'o' | 'h' | 'c' | 'b';
    level: number;
  } | null;
}
```

---

## 5. UI/UX Requirements
* **Tower Layout:** A vertical grid system optimized for mobile aspect ratios.
* **Visual Cues:** * Highlight cells the player *can* defeat in green.
    * Highlight cells that lead to Game Over in red.
* **Animations:** * Smooth sliding when moving between cells.
    * Numerical "Floating Text" (e.g., "+10") when a level is absorbed.

---

## 6. Implementation Roadmap (Phases)

### Phase 1: MVP (Current)
* Static level design (manual grid creation).
* Core combat logic and level accumulation.
* Basic Win/Loss screens.

### Phase 2: Polish & Features
* **Procedural Generation:** Algorithm to generate "winnable" towers automatically.
* **Items:** Add chests containing multipliers (e.g., $X \times 2$) or equipment.
* **Sound Effects:** Retro 8-bit sounds for combat and leveling up.

### Phase 3: Backend Integration (Lead Backend Focus)
* **Leaderboards:** Store high scores and "Fastest Clear" times.
* **Authentication:** Allow users to save progress across devices.
* **Agentic UI:** Implement an AI "Auto-Solver" to demonstrate the optimal path to users.

---

**Developer's Note:**
This PRD focuses on the "Logic-First" approach. By keeping the Game Engine decoupled from the UI, we ensure that the project is maintainable and scalable—fitting.

