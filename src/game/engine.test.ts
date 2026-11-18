import { describe, expect, it } from 'vitest';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  canPlace,
  createBoard,
  createInitialState,
  gameReducer,
  getDropDelay,
  getLevel,
  projectBoard,
} from './engine';
import type { ActivePiece, GameAction, GameState } from './engine';
import { PIECES } from './pieces';
import type { CellValue } from './pieces';

const start = (seed = 12345) => gameReducer(createInitialState(), { type: 'start', seed });

function clearFixture(count: number, rows = 0): GameState {
  const board = Array.from({ length: BOARD_HEIGHT }, (_, y) =>
    Array.from({ length: BOARD_WIDTH }, (_, x): CellValue =>
      y >= BOARD_HEIGHT - count && x !== 5 ? 'J' : 0,
    ),
  );
  return { ...start(), board, rows, active: { kind: 'I', shape: PIECES.I.shape, x: 4, y: 16 } };
}

describe('atomic game rules', () => {
  it('replays identical seeds and action streams without consuming ambient randomness', () => {
    const actions: GameAction[] = [
      { type: 'move', direction: -1 },
      { type: 'rotate' },
      { type: 'hard-drop' },
      { type: 'hard-drop' },
    ];
    const first = actions.reduce(gameReducer, start(42));
    expect(actions.reduce(gameReducer, start(42))).toEqual(first);
    expect(first).not.toEqual(actions.reduce(gameReducer, start(43)));
  });

  it('does not mutate previous board or piece snapshots', () => {
    const state = start();
    state.board.forEach(Object.freeze);
    Object.freeze(state.board);
    if (state.active) Object.freeze(state.active);
    Object.freeze(state);
    const before = JSON.stringify(state);
    gameReducer(state, { type: 'rotate' });
    gameReducer(state, { type: 'hard-drop' });
    expect(JSON.stringify(state)).toBe(before);
  });

  it.each([
    [0, -1],
    [-1, 0],
    [BOARD_WIDTH, 0],
    [0, BOARD_HEIGHT],
  ])('rejects a solid cell outside the board at %s,%s', (x, y) => {
    const piece: ActivePiece = { kind: 'I', shape: [['I']], x: x ?? 0, y: y ?? 0 };
    expect(canPlace(createBoard(), piece)).toBe(false);
  });

  it('allows empty shape padding at an edge but rejects occupied board cells', () => {
    const piece: ActivePiece = { kind: 'I', shape: PIECES.I.shape, x: -1, y: 0 };
    expect(canPlace(createBoard(), piece)).toBe(true);
    expect(canPlace(projectBoard(createBoard(), piece), piece)).toBe(false);
  });

  it.each([
    [1, 40],
    [2, 100],
    [3, 300],
    [4, 1200],
  ])('clears %s lines and scores the lock event once', (count, points) => {
    const after = gameReducer(clearFixture(count ?? 1), { type: 'step' });
    expect(after.rows).toBe(count);
    expect(after.score).toBe(points);
    expect(after.board).toHaveLength(BOARD_HEIGHT);
    expect(
      after.board.every((row) => row.length === BOARD_WIDTH && row.some((cell) => cell === 0)),
    ).toBe(true);
    expect(gameReducer(after, { type: 'move', direction: 1 }).score).toBe(points);
  });

  it('uses the pre-clear level for scoring and derives the new level without a second event', () => {
    const after = gameReducer(clearFixture(2, 9), { type: 'step' });
    expect(after.score).toBe(100);
    expect(after.rows).toBe(11);
    expect(getLevel(after.rows)).toBe(1);
    expect(getDropDelay(after.rows)).toBeLessThan(getDropDelay(0));
    const again = gameReducer(
      { ...clearFixture(1, after.rows), score: after.score },
      { type: 'step' },
    );
    expect(again.score).toBe(180);
  });

  it('ends the game when the next spawn is blocked, not just when a piece locks near the top', () => {
    const board = createBoard().map((row, y) =>
      row.map((value, x) => (y < 4 && x >= 4 && x <= 8 ? ('Z' as const) : value)),
    );
    const after = gameReducer(
      { ...start(), board, active: { kind: 'O', shape: PIECES.O.shape, x: 5, y: 18 } },
      { type: 'step' },
    );
    expect(after.status).toBe('over');
    expect(after.active).toBeNull();
  });

  it('pauses idempotently and rejects movement, rotation and gravity until explicitly resumed', () => {
    const paused = gameReducer(start(), { type: 'pause' });
    for (const action of [
      { type: 'step' },
      { type: 'hard-drop' },
      { type: 'rotate' },
      { type: 'move', direction: 1 },
      { type: 'pause' },
    ] as const) {
      expect(gameReducer(paused, action)).toBe(paused);
    }
    expect(gameReducer(paused, { type: 'resume' }).status).toBe('running');
  });

  it('rejects a blocked rotation and performs a horizontal wall adjustment when space exists', () => {
    const state = {
      ...start(),
      active: { kind: 'I' as const, shape: PIECES.I.shape, x: -1, y: 0 },
    };
    const rotated = gameReducer(state, { type: 'rotate' });
    expect(rotated.active?.x).toBe(0);
    expect(rotated.active && canPlace(rotated.board, rotated.active)).toBe(true);
    const surrounded = { ...state, board: createBoard().map((row) => row.map(() => 'J' as const)) };
    expect(gameReducer(surrounded, { type: 'rotate' })).toBe(surrounded);
  });

  it('resets board, counters, pause and random state on restart', () => {
    const played = gameReducer(gameReducer(start(), { type: 'hard-drop' }), { type: 'pause' });
    expect(
      gameReducer({ ...played, score: 1200, rows: 10 }, { type: 'start', seed: 12345 }),
    ).toEqual(start());
  });
});
