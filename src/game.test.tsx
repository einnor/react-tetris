import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import App from './App';
import { useGame } from './hooks/useGame';

afterEach(() => { cleanup(); vi.useRealTimers(); });

it('starts a seeded game and focuses its controls without letting a button key bubble into play', () => {
  render(<App seed={12345} />);
  const button = screen.getByRole('button', { name: 'Start Game' });
  fireEvent.click(button);
  expect(screen.getByRole('region', { name: 'Tetris game' })).toHaveFocus();
  fireEvent.keyDown(button, { key: 'ArrowDown' });
  expect(screen.getByText('Score: 0')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Tetris playfield' })).toBeVisible();
});

it('owns a single gravity clock under Strict Mode and stops it when paused', () => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
  const { result } = renderHook(() => useGame(12345), { wrapper: StrictMode });
  act(() => result.current.start());
  act(() => { vi.advanceTimersByTime(1000); });
  expect(result.current.state.active?.y).toBe(1);
  act(() => result.current.dispatch({ type: 'step' }));
  act(() => { vi.advanceTimersByTime(1000); });
  expect(result.current.state.active?.y).toBe(3);
  act(() => result.current.dispatch({ type: 'pause' }));
  const paused = result.current.state;
  act(() => { vi.advanceTimersByTime(5000); });
  expect(result.current.state).toBe(paused);
});
