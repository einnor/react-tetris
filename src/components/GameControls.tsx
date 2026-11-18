import type { GameAction, GameStatus } from '../game/engine';
import { StyledStartButton } from './styles/StyledStartButton';

export type PlayAction = Exclude<GameAction, { type: 'start' | 'pause' | 'resume' }>;

interface GameControlsProps {
  status: GameStatus;
  onStart(): void;
  onPause(): void;
  onAction(action: PlayAction): void;
}

export function GameControls({ status, onStart, onPause, onAction }: GameControlsProps) {
  const active = status === 'running' || status === 'paused';
  return (
    <>
      <div className="game-actions">
        <StyledStartButton onClick={onStart}>
          {active ? 'Restart Game' : 'Start Game'}
        </StyledStartButton>
        {active && (
          <StyledStartButton onClick={onPause}>
            {status === 'paused' ? 'Resume game' : 'Pause game'}
          </StyledStartButton>
        )}
      </div>
      <div className="touch-controls" role="group" aria-label="On-screen game controls">
        <StyledStartButton
          disabled={status !== 'running'}
          aria-label="Move left"
          onClick={() => onAction({ type: 'move', direction: -1 })}
        >
          Left
        </StyledStartButton>
        <StyledStartButton
          disabled={status !== 'running'}
          aria-label="Rotate piece"
          onClick={() => onAction({ type: 'rotate' })}
        >
          Rotate
        </StyledStartButton>
        <StyledStartButton
          disabled={status !== 'running'}
          aria-label="Move right"
          onClick={() => onAction({ type: 'move', direction: 1 })}
        >
          Right
        </StyledStartButton>
        <StyledStartButton
          disabled={status !== 'running'}
          aria-label="Hard drop"
          onClick={() => onAction({ type: 'hard-drop' })}
        >
          Drop
        </StyledStartButton>
      </div>
    </>
  );
}
