import { PIECES, PIECE_KINDS } from './pieces';
import type { CellValue, Matrix, PieceKind } from './pieces';

export const BOARD_WIDTH = 12;
export const BOARD_HEIGHT = 20;
export type Board = readonly (readonly CellValue[])[];
export type GameStatus = 'idle' | 'running' | 'paused' | 'over';

export interface ActivePiece {
  readonly kind: PieceKind;
  readonly shape: Matrix;
  readonly x: number;
  readonly y: number;
}

export interface GameState {
  readonly board: Board;
  readonly active: ActivePiece | null;
  readonly status: GameStatus;
  readonly score: number;
  readonly rows: number;
  readonly randomState: number;
}

export type GameAction =
  | { readonly type: 'start'; readonly seed: number }
  | { readonly type: 'move'; readonly direction: -1 | 1 }
  | { readonly type: 'rotate' }
  | { readonly type: 'step' }
  | { readonly type: 'hard-drop' }
  | { readonly type: 'pause' }
  | { readonly type: 'resume' };

export const createBoard = (): Board =>
  Array.from({ length: BOARD_HEIGHT }, () => Array<CellValue>(BOARD_WIDTH).fill(0));

export const createInitialState = (): GameState => ({
  board: createBoard(), active: null, status: 'idle', score: 0, rows: 0, randomState: 0,
});

export const getLevel = (rows: number) => Math.floor(rows / 10);
export const getDropDelay = (rows: number) =>
  getLevel(rows) === 0 ? 1000 : 1000 / (getLevel(rows) + 1) + 200;

export function canPlace(board: Board, piece: ActivePiece): boolean {
  return piece.shape.every((row, y) => row.every((value, x) =>
    value === 0 || board[piece.y + y]?.[piece.x + x] === 0,
  ));
}

export function projectBoard(board: Board, piece: ActivePiece | null): Board {
  if (!piece) return board;
  const result = board.map(row => [...row]);
  piece.shape.forEach((row, y) => row.forEach((value, x) => {
    const target = result[piece.y + y];
    if (value !== 0 && target && piece.x + x >= 0 && piece.x + x < BOARD_WIDTH) {
      target[piece.x + x] = value;
    }
  }));
  return result;
}

function spawn(state: GameState): GameState {
  const randomState = (Math.imul(state.randomState, 1664525) + 1013904223) >>> 0;
  const kind = PIECE_KINDS[Math.floor(randomState / 0x100000000 * PIECE_KINDS.length)] ?? 'I';
  const shape = PIECES[kind].shape;
  const active = { kind, shape, x: Math.floor((BOARD_WIDTH - (shape[0]?.length ?? 0)) / 2), y: 0 };
  return canPlace(state.board, active)
    ? { ...state, active, status: 'running', randomState }
    : { ...state, active: null, status: 'over', randomState };
}

function lock(state: GameState, active: ActivePiece): GameState {
  const merged = projectBoard(state.board, active);
  const remaining = merged.filter(row => row.some(value => value === 0));
  const cleared = BOARD_HEIGHT - remaining.length;
  const board = [
    ...Array.from({ length: cleared }, () => Array<CellValue>(BOARD_WIDTH).fill(0)),
    ...remaining,
  ];
  const points = [0, 40, 100, 300, 1200][cleared] ?? 0;
  return spawn({
    ...state, board, active: null,
    rows: state.rows + cleared,
    score: state.score + points * (getLevel(state.rows) + 1),
  });
}

function rotate(shape: Matrix): Matrix {
  return shape.map((_, x) => shape.map(row => row[x] ?? 0).reverse());
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'start') {
    return spawn({ ...createInitialState(), randomState: action.seed >>> 0 });
  }
  if (action.type === 'pause') return state.status === 'running' ? { ...state, status: 'paused' } : state;
  if (action.type === 'resume') return state.status === 'paused' ? { ...state, status: 'running' } : state;
  if (state.status !== 'running' || !state.active) return state;
  const active = state.active;
  switch (action.type) {
    case 'move': {
      const candidate = { ...active, x: active.x + action.direction };
      return canPlace(state.board, candidate) ? { ...state, active: candidate } : state;
    }
    case 'rotate': {
      const shape = rotate(active.shape);
      for (const offset of [0, 1, -1, 2, -2, 3, -3]) {
        const candidate = { ...active, shape, x: active.x + offset };
        if (canPlace(state.board, candidate)) return { ...state, active: candidate };
      }
      return state;
    }
    case 'step': {
      const candidate = { ...active, y: active.y + 1 };
      return canPlace(state.board, candidate) ? { ...state, active: candidate } : lock(state, active);
    }
    case 'hard-drop': {
      let candidate = active;
      while (canPlace(state.board, { ...candidate, y: candidate.y + 1 })) {
        candidate = { ...candidate, y: candidate.y + 1 };
      }
      return lock(state, candidate);
    }
  }
}
