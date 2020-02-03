import React, { useState } from 'react';

import Stage from './Stage';
import Display from './Display';
import StartButton from './StartButton';

import { createStage } from '../gameHelpers';
import { usePlayer } from '../hooks/usePlayer';
import { useStage } from '../hooks/useStage';

import { StyledTetrisWrapper, StyledTetris } from './styles/StyledTetris';

const Tetris = () => {
  const [dropTime, setDropTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const [player, updatePlayerPosition, resetPlayer] = usePlayer();
  const [stage, setStage] = useStage(player, resetPlayer);

  const startGame = () => {
    // Reset everything;
    setStage(createStage());
    resetPlayer();
  };

  const move = ({ keyCode }) => {
    if (!gameOver) {
      if (keyCode === 37) { // Left arrow
        movePlayerAlongXAxis(-1); // Move one step to the left on the x-axis
      } else if (keyCode === 39) { // Right arrow
        movePlayerAlongXAxis(1); // Move one step to the right on the x-axis
      } else if (keyCode === 40) { // Down arrow
        dropPlayer(); // Drop the player
      }
    }
  };

  const movePlayerAlongXAxis = (direction) => {
    updatePlayerPosition({ x: direction, y: 0 });
  };

  const drop = () => {
    updatePlayerPosition({ x: 0, y: 1, collided: false });
  };

  const dropPlayer = () => {
    drop();
  };


  return (
    <StyledTetrisWrapper role="button" tabIndex={0} onKeyDown={(e) => move(e)}>
      <StyledTetris>
        <Stage stage={stage} />
        <aside>
          {
            gameOver ? (
              <Display gameOver={gameOver} text="Game Over" />
            ) : (
              <div>
                <Display text="Score" />
                <Display text="Rows" />
                <Display text="Level" />
              </div>
            )
          }
          <StartButton callback={startGame} />
        </aside>
      </StyledTetris>
    </StyledTetrisWrapper>
  );
};

export default Tetris;
