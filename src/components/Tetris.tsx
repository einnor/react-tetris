import { useRef } from 'react';
import type { KeyboardEvent } from 'react';
import Stage from './Stage';
import Display from './Display';
import StartButton from './StartButton';
import { getLevel } from '../game/engine';
import type { GameAction } from '../game/engine';
import { useGame } from '../hooks/useGame';
import { StyledTetrisWrapper, StyledTetris } from './styles/StyledTetris';

export default function Tetris({ seed }: { seed?: number }) {
  const { state, stage, dispatch, start } = useGame(seed);
  const gameRef = useRef<HTMLDivElement>(null);
  const startGame = () => { start(); gameRef.current?.focus(); };
  const move = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || state.status !== 'running') return;
    let action: GameAction;
    switch (event.key) {
      case 'ArrowLeft': action = { type: 'move', direction: -1 }; break;
      case 'ArrowRight': action = { type: 'move', direction: 1 }; break;
      case 'ArrowDown': action = { type: 'step' }; break;
      case 'ArrowUp': action = { type: 'rotate' }; break;
      default: return;
    }
    event.preventDefault();
    dispatch(action);
  };
  const gameOver = state.status === 'over';
  return (
    <StyledTetrisWrapper ref={gameRef} role="region" aria-label="Tetris game" tabIndex={0} onKeyDown={move}>
      <StyledTetris>
        <Stage stage={stage} />
        <aside>
          {gameOver ? <Display gameOver text="Game Over" /> : (
            <div className="statistics">
              <Display text={`Score: ${state.score}`} />
              <Display text={`Rows: ${state.rows}`} />
              <Display text={`Level: ${getLevel(state.rows)}`} />
            </div>
          )}
          <StartButton callback={startGame} />
        </aside>
      </StyledTetris>
    </StyledTetrisWrapper>
  );
}
