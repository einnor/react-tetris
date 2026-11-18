import { useId, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import Stage from './Stage';
import Display from './Display';
import { GameControls } from './GameControls';
import type { PlayAction } from './GameControls';
import { getLevel } from '../game/engine';
import type { GameAction } from '../game/engine';
import { useGame } from '../hooks/useGame';
import { StyledTetrisWrapper, StyledTetris } from './styles/StyledTetris';

export default function Tetris({ seed }: { seed?: number }) {
  const { state, stage, dispatch, start } = useGame(seed);
  const gameRef = useRef<HTMLDivElement>(null);
  const instructionsId = useId();
  const startGame = () => { start(); gameRef.current?.focus(); };
  const play = (action: PlayAction) => { dispatch(action); gameRef.current?.focus(); };
  const pause = () => {
    dispatch({ type: state.status === 'paused' ? 'resume' : 'pause' });
    gameRef.current?.focus();
  };
  const move = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key.toLowerCase() === 'p' || event.key === 'Escape') {
      if (state.status !== 'running' && state.status !== 'paused') return;
      event.preventDefault();
      if (!event.repeat) {
        if (event.key === 'Escape') dispatch({ type: 'pause' });
        else pause();
      }
      return;
    }
    if (state.status !== 'running') return;
    let action: GameAction;
    switch (event.key) {
      case 'ArrowLeft': action = { type: 'move', direction: -1 }; break;
      case 'ArrowRight': action = { type: 'move', direction: 1 }; break;
      case 'ArrowDown': action = { type: 'step' }; break;
      case 'ArrowUp': action = { type: 'rotate' }; break;
      case ' ':
        event.preventDefault();
        if (!event.repeat) dispatch({ type: 'hard-drop' });
        return;
      default: return;
    }
    event.preventDefault();
    dispatch(action);
  };
  const gameOver = state.status === 'over';
  return (
    <StyledTetrisWrapper
      ref={gameRef} role="region" aria-label="Tetris game" aria-describedby={instructionsId} tabIndex={0}
      onKeyDown={move} onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) dispatch({ type: 'pause' });
      }}
    >
      <p className="sr-only" id={instructionsId}>Use left and right arrows to move, up to rotate, down to soft drop, Space to hard drop, and P to pause or resume. Escape pauses. Leaving the game pauses it; resume explicitly to continue.</p>
      <StyledTetris as="main">
        <h1 className="sr-only">React Tetris</h1>
        <Stage stage={stage} />
        <aside>
          <div className="statistics">
              <Display text={`Score: ${state.score}`} />
              <Display text={`Rows: ${state.rows}`} />
              <Display text={`Level: ${getLevel(state.rows)}`} />
          </div>
          {(gameOver || state.status === 'paused') && <Display gameOver={gameOver} text={gameOver ? 'Game Over' : 'Paused'} />}
          <GameControls status={state.status} onStart={startGame} onPause={pause} onAction={play} />
          <p className="sr-only" role="status">{state.status === 'idle' ? 'Ready to start.' : state.status === 'over' ? `Game over. Final score ${state.score}.` : state.status === 'paused' ? 'Game paused. Resume when ready.' : `Game running. Score ${state.score}. Rows ${state.rows}.`}</p>
        </aside>
      </StyledTetris>
    </StyledTetrisWrapper>
  );
}
