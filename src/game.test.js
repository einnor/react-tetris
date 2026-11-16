import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { createStage, checkCollision } from './gameHelpers';
import { useGameStatus } from './hooks/useGameStatus';
import { usePlayer } from './hooks/usePlayer';
import App from './App';

afterEach(cleanup);

describe('game regressions', () => {
  it('scores each line-clear event once, including across a level change', () => {
    const { result, rerender } = renderHook(({ cleared }) => useGameStatus(cleared), {
      initialProps: { cleared: 0 },
    });
    rerender({ cleared: 2 });
    expect(result.current[0]).toBe(100);
    expect(result.current[2]).toBe(2);
    act(() => result.current[5](1));
    expect(result.current[0]).toBe(100);
    rerender({ cleared: 0 });
    rerender({ cleared: 1 });
    expect(result.current[0]).toBe(180);
  });

  it('does not mutate previous player snapshots when moving', () => {
    const { result } = renderHook(usePlayer);
    const previous = result.current[0];
    act(() => result.current[1]({ x: 1, y: 1, collided: false }));
    expect(previous.pos).toEqual({ x: 0, y: 0 });
    expect(result.current[0].pos).toEqual({ x: 1, y: 1 });
  });

  it('detects walls, floor and occupied cells without blocking empty cells', () => {
    const stage = createStage();
    const player = { pos: { x: 0, y: 0 }, tetromino: [[1]] };
    expect(checkCollision(player, stage, { x: 0, y: 1 })).toBe(false);
    expect(checkCollision(player, stage, { x: -1, y: 0 })).toBe(true);
    expect(checkCollision(player, stage, { x: 0, y: 20 })).toBe(true);
    stage[1][0] = ['I', 'merged'];
    expect(checkCollision(player, stage, { x: 0, y: 1 })).toBe(true);
  });

  it('starts a game and focuses the keyboard control region', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    expect(screen.getByRole('region', { name: 'Tetris game' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' });
    expect(screen.getByText('Score: 0')).toBeInTheDocument();
  });
});
