import { useCallback, useEffect, useReducer } from 'react';
import { createInitialState, gameReducer, getDropDelay, projectBoard } from '../game/engine';
import { useInterval } from './useInterval';

export function useGame(seed?: number) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const start = useCallback(() => {
    const roundSeed = seed ?? crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
    dispatch({ type: 'start', seed: roundSeed });
  }, [seed]);
  useInterval(
    () => dispatch({ type: 'step' }),
    state.status === 'running' ? getDropDelay(state.rows) : null,
  );
  useEffect(() => {
    const pause = () => dispatch({ type: 'pause' });
    const visibilityChanged = () => {
      if (document.visibilityState === 'hidden') pause();
    };
    window.addEventListener('blur', pause);
    document.addEventListener('visibilitychange', visibilityChanged);
    return () => {
      window.removeEventListener('blur', pause);
      document.removeEventListener('visibilitychange', visibilityChanged);
    };
  }, []);
  return { state, stage: projectBoard(state.board, state.active), dispatch, start };
}
