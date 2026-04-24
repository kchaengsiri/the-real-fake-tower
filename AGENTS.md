# The Real Fake Tower: Agent Instructions

## Project Overview
You are working on **The Real Fake Tower**, a mathematical puzzle game that brings "false advertising" mobile game mechanics to life. The goal is to climb a tower by defeating enemies with lower levels than the player.

## Tech Stack
* **Package Manager:** Bun
* **Framework:** Next.js (App Router)
* **Routing & State:** Next.js File Routing, Zustand (Client Game State)
* **Styling & UI:** Tailwind CSS, Framer Motion (for smooth cell transitions)
* **Format & Lint:** Biome
* **Testing:** Vitest (Core Logic & Solver Validation)

## Project State & Documentation
* To understand requirements and game mechanics, you **must** read `PRD.md`.
* To understand the mathematical progression and entity types, refer to the **Entity Table** in `PRD.md`.
* To track progress and recent logic changes, you **must** read `CHANGELOG.md`.

## Critical Directives for the Agent
1.  **Logic-UI Separation:** Keep the core game engine (math, pathfinding, combat logic) in pure TypeScript files (`src/lib/engine/`). React components should only handle rendering and user input.
2.  **Mathematical Integrity:** Every move must strictly follow the rule: `Win if Player_LV >= Enemy_LV`. If a player moves to a cell they cannot defeat, trigger the `GameOver` state immediately.
3.  **Framer Motion for UX:** All character movements between grid cells must be animated using `layoutId` or `animate` props to mimic the "sliding" effect seen in ads.
4.  **Strict Typing:** Ensure 100% type safety. Use discriminating unions for `Entity` types (e.g., `Player | Enemy | Boss | Buff`).
5.  **Terminal Commands:** Always use flags to bypass interactive prompts (e.g., `bunx @biomejs/biome check --write .`).

## Coding Agent Workflow (Strict Logic-First)
You must follow this workflow for every feature or mechanic update:
1.  **Logic Update:** If changing game rules, update the core engine functions first.
2.  **Unit Tests:** Run Vitest (`bun test`) to ensure the math and win/loss conditions are still valid.
3.  **UI Implementation:** Update the React components to reflect logic changes.
4.  **Format & Lint:** Run Biome (`bunx @biomejs/biome check --write ./src`).
5.  **Verification:** Ensure no Biome errors and all tests pass before declaring a task complete.
6.  **Update Changelog:** Log the change in `docs/CHANGELOG.md` using the format:
    `- **HH:MM** <feat|fix|math|style|docs> <Brief Description>`
7.  **Git Workflow:** Work on feature branches (`feat/logic-engine`, `feat/grid-ui`). Use Conventional Commits.

## Specific Logic Constraints
* **Additive Power:** When the player wins, the new level is `Current_LV + Enemy_LV`.
* **Grid Validation:** Before rendering a level, verify it is "Solvable" by checking if a path to the Boss exists where the player can accumulate enough levels to win.

