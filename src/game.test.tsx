import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import App from './App';
import { useGame } from './hooks/useGame';

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });

it('starts a seeded game and focuses its controls without letting a button key bubble into play', () => {
  render(<App seed={12345} />);
  const button = screen.getByRole('button', { name: 'Start Game' });
  fireEvent.click(button);
  expect(screen.getByRole('region', { name: 'Tetris game' })).toHaveFocus();
  const board = screen.getByRole('img', { name: 'Tetris playfield' });
  const before = board.innerHTML;
  button.focus();
  fireEvent.keyDown(button, { key: 'ArrowDown' });
  expect(board.innerHTML).toBe(before);
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

it('pauses on focus loss and only resumes through an explicit control or non-repeating P', () => {
  render(<App seed={12345} />);
  fireEvent.click(screen.getByRole('button', { name: 'Start Game' }));
  const region = screen.getByRole('region', { name: 'Tetris game' });
  fireEvent.keyDown(region, { key: 'p' });
  expect(screen.getByRole('status')).toHaveTextContent('Game paused');
  fireEvent.keyDown(region, { key: 'p', repeat: true });
  expect(screen.getByRole('status')).toHaveTextContent('Game paused');
  fireEvent.keyDown(region, { key: 'p' });
  expect(screen.getByRole('status')).toHaveTextContent('Game running');
  fireEvent.blur(region, { relatedTarget: document.body });
  fireEvent.focus(region);
  expect(screen.getByRole('status')).toHaveTextContent('Game paused');
  fireEvent.click(screen.getByRole('button', { name: 'Resume game' }));
  expect(region).toHaveFocus();
  expect(screen.getByRole('status')).toHaveTextContent('Game running');
});

it('pauses hidden documents, does not auto-resume, and ignores duplicate pause events', () => {
  const { result } = renderHook(() => useGame(12345));
  act(() => result.current.start());
  const visible = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
  act(() => document.dispatchEvent(new Event('visibilitychange')));
  const paused = result.current.state;
  act(() => window.dispatchEvent(new Event('blur')));
  visible.mockReturnValue('visible');
  act(() => document.dispatchEvent(new Event('visibilitychange')));
  expect(result.current.state).toBe(paused);
  expect(result.current.state.status).toBe('paused');
});

it('unmounting releases the gravity timer and browser lifecycle listeners', () => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
  const clear = vi.spyOn(window, 'clearInterval');
  const windowRemove = vi.spyOn(window, 'removeEventListener');
  const documentRemove = vi.spyOn(document, 'removeEventListener');
  const view = renderHook(() => useGame(12345));
  act(() => view.result.current.start());
  view.unmount();
  expect(clear).toHaveBeenCalledOnce();
  expect(windowRemove).toHaveBeenCalledWith('blur', expect.any(Function));
  expect(documentRemove).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
});
