# React Tetris

[![CI](https://github.com/einnor/react-tetris/actions/workflows/ci.yml/badge.svg)](https://github.com/einnor/react-tetris/actions/workflows/ci.yml)

A keyboard-controlled falling-block game built with React, custom hooks and styled-components. A small learning project for exploring collision detection, immutable state transitions and timer-driven rendering, now running on React 19 and Vite.

![A real game in progress, captured from the local application](screenshots/gameplay.png)

## Try it locally

Requires Node.js 24 and npm. No account, API keys or backend.

```sh
git clone https://github.com/einnor/react-tetris.git
cd react-tetris
npm ci
npm start
```

Open the localhost URL printed by Vite, then select **Start Game**. The game receives keyboard focus automatically.

| Key | Action |
| --- | --- |
| Left / right | Move the active piece |
| Up | Rotate clockwise, with horizontal collision adjustment |
| Down | Soft drop; releasing resumes the timer |
| Start Game | Start or reset the board, score and level |

## Engineering walkthrough

- `usePlayer` owns piece position, rotation and spawning. Movement preserves previous state snapshots rather than mutating them.
- `gameHelpers.js` defines the 12-by-20 board and checks walls, floor and merged cells before movement.
- `useStage` draws the active piece, merges landed pieces and removes complete rows.
- `useGameStatus` scores each line-clear event once. Re-rendering or advancing a level must not score the same event again.
- `useInterval` separates timer lifecycle from the latest drop callback. Speed increases after each ten cleared rows.

The UI and game rules are deliberately kept separate enough to exercise collision and state regressions without a browser. This is a compact hook-based implementation, not a complete implementation of the official Tetris rules.

## Verification

```sh
npm test
npm run build
npm run preview
```

Vitest and Testing Library cover line-clear scoring, level-change regressions, immutable movement, collisions and keyboard focus. GitHub Actions runs tests and a production build on Node.js 24. Vite emits a static site in `dist/`; the relative asset base also supports subdirectory hosting.

## Scope and trade-offs

No backend, persistence or analytics: game state lives entirely in memory. Desktop keyboard input is the supported control scheme; touch controls, pause/resume, next-piece preview, seeded replays and a standard rotation system are not implemented. The original visual assets and learning-project identity are preserved rather than presenting this as a commercial game.

The screenshot above was captured from the running app with real keyboard input, without injected game state. Older screenshots remain in `screenshots/` as historical assets.

Tetris is a trademark of its respective owners; this personal learning project is unaffiliated.
