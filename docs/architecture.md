# Architecture and engineering decisions

The central problem in this game is **coordinating state transitions**, not adding a framework. The earlier implementation split movement, drawing, locking, spawning and scoring across effects in several hooks. Updating other state from a board updater made the ordering hard to reason about and unsafe to replay.

The current implementation uses one deterministic game engine and a small React adapter. It preserves the original 12-by-20 board, palette, font and background while making the rules independently executable and the controls usable on narrow screens.

## Boundaries

| Module                 | Responsibility                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| `game/engine.ts`       | Pure state transitions, collision checks, rotation, row clearing, scoring and spawn validity |
| `game/pieces.ts`       | Readonly shape definitions, cell types and palette                                           |
| `game/seed.ts`         | Runtime validation of the optional unsigned 32-bit URL seed                                  |
| `hooks/useGame.ts`     | React reducer integration, round seed creation and browser lifecycle events                  |
| `hooks/useInterval.ts` | One gravity timer, latest callback and teardown                                              |
| `components/`          | Typed presentation, accessible controls and input translation                                |
| `components/styles/`   | Original desktop presentation plus narrow-screen layout rules                                |

There is no module-global mutable game state, persistence service, global state framework or worker. A single board has 240 cells; speculative caching and concurrency infrastructure would add more complexity than value here.

## One authoritative transition

The settled board and active piece are separate. Rendering overlays the active piece into a fresh projected board; it never turns visual cells into the source of game truth.

A downward collision or hard drop performs all of these in one reducer transition:

1. Merge the active piece into a new settled board.
2. Remove completed rows and prepend independent empty rows.
3. Award line points using the level **before** the clear.
4. Update total rows; derive the next level from that total.
5. Advance explicit random state and attempt the next spawn.
6. Enter game-over state if the spawn is blocked.

No effect is responsible for finishing another effect's work. Consecutive clears of the same size are separate commands, not changes to a `rowsCleared` value that React may batch together. A level change cannot accidentally score an old clear again.

Movement and rotation do not mutate old snapshots. State, board rows and piece matrices are readonly at the type boundary; frozen-input tests exercise the rule implementation. Invalid moves return the current state.

## State and timing contracts

| State     | Accepted gameplay behavior                                                     |
| --------- | ------------------------------------------------------------------------------ |
| Idle      | Wait for an explicit start                                                     |
| Running   | Move, rotate, soft drop, hard drop or pause; a blocked spawn ends the game     |
| Paused    | Keep the board unchanged until an explicit resume or restart                   |
| Game over | Keep the final board and statistics; reject movement and gravity until restart |

Start is an explicit reset from any state. Level is `floor(totalRows / 10)`, not another independently writable state field. Line points retain the learning project's 40/100/300/1200 schedule multiplied by the pre-clear level plus one; movement and drop distance do not award extra points.

The React adapter owns one interval while running. The reducer and its initializer have no clock reads, ambient randomness or state-setting side effects, so React Strict Mode can replay them safely.

Soft drop is a normal downward command and never disables gravity. Pause clears the interval. Resume starts a fresh full gravity delay; it does not preserve a fractional deadline or catch up on time spent away. This is a deliberate, forgiving policy rather than a competitive timing simulation.

Focus leaving the game, window blur or a hidden document pauses a running round. Returning focus does not resume automatically. Duplicate pause events are harmless. Unmounting releases both the clock and browser listeners.

## Determinism without pretending to provide a full replay system

The engine stores its 32-bit generator state explicitly. A linear congruential generator produces repeatable piece choices using integer arithmetic, with no ambient `Math.random` or browser dependency inside the reducer.

Normal rounds receive a fresh browser-generated seed. `?seed=12345` selects a validated seed and restarts reproduce its sequence. The same seed **and action sequence** produce the same state, including gravity actions.

This is not a recorded replay player, a cryptographic generator or a fairness guarantee. There is no seven-piece bag, so piece droughts remain possible. A shared seed alone does not reproduce another player's input timing or completed round.

## Input and accessibility

Keyboard commands are handled only when the game region itself has focus. Space or arrows on a native button cannot bubble into an accidental gameplay action. Repeating P or Space is ignored to prevent repeated pause toggles or unintended hard drops; ordinary movement can repeat.

Controls provide visible focus, native disabled states, named on-screen actions and documented shortcuts. Narrow layouts support pointer/touch move, rotate and hard drop without horizontal overflow. A status region announces phase and score/row changes rather than every falling-cell tick. Final statistics remain visible after game over.

The board is one named graphic instead of 240 focusable cells. This is **not** a claim of fully nonvisual playability. Automated axe checks and viewport emulation do not replace manual screen-reader testing, Safari/Firefox checks or real-device evaluation.

## Verification

- **Node rule tests:** immutable inputs, collision bounds and padding, one-to-four-line clears, pre-clear scoring, blocked spawning, rotation, pause, restart and deterministic action replay.
- **React integration:** Strict Mode clock ownership, soft-drop/gravity interaction, keyboard focus, lifecycle pause, explicit resume and teardown.
- **Production browsers:** actual rendered cell changes, controlled gravity, seed restarts, terminal-state rejection, mouse/touch controls, narrow-width overflow and axe checks.
- **Quality gates:** strict TypeScript covers app, tests and tooling; shared formatting, focused-test protection, flaky-test failure, bounded CI runtime and retained browser failure artifacts.

Browser tests start their own fresh production server and will not reuse an unrelated process on the port. Tests manipulate time and use the public seed feature rather than exposing test-only game-state mutation APIs.

The original desktop board and statistics were compared against deterministic before-change browser captures. Full-page screenshots intentionally differ where pause controls were added and where the narrow layout was improved. Local screenshot parity is not a cross-platform visual regression suite.

## Deliberate limits

This remains a personal learning implementation, not official Tetris rules or a commercial game. Rotation tries horizontal collision adjustments, not the standard rotation system or floor kicks. There is no next-piece preview, hold, lock delay, score persistence, authenticated leaderboard, analytics or backend.

Those features would need their own rules and tests. They are not implied by the TypeScript migration or by a green CI badge.
