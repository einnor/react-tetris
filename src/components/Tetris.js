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

  const [player] = usePlayer();
  const [stage, setStage] = useStage(player);

  const move = ({ keyCode }) => {
    if (!gameOver) {
      if (keyCode === 37) { // Left arrow
        movePlayer(-1); // Move one step to the left on the x-axis
      } else if (keyCode === 39) { // Right arrow
        movePlayer(1); // Move one step to the right on the x-axis
      } else if (keyCode === 38) { // Down arrow
        dropPlayer(); // Drop the player
      }
    }
  };

  const movePlayer = (direction) => {};

  const drop = () => {};

  const dropPlayer = () => {};


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
          <StartButton />
        </aside>
      </StyledTetris>
    </StyledTetrisWrapper>
  );
};

export default Tetris;
