import React, { useState } from 'react';

import Stage from './Stage';
import Display from './Display';
import StartButton from './StartButton';

import { createStage, checkCollision } from '../gameHelpers';
import { useInterval } from '../hooks/useInterval';
import { usePlayer } from '../hooks/usePlayer';
import { useStage } from '../hooks/useStage';
import { useGameStatus } from '../hooks/useGameStatus';

import { StyledTetrisWrapper, StyledTetris } from './styles/StyledTetris';

const Tetris = () => {
  const [dropTime, setDropTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const [player, updatePlayerPosition, resetPlayer, rotatePlayer] = usePlayer();
  const [stage, setStage, rowsCleared] = useStage(player, resetPlayer);
  const [score, setScore, rows, setRows, level, setLevel] = useGameStatus(rowsCleared);

  const startGame = () => {
    // Reset everything;
    setStage(createStage());
    setDropTime(1000);
    resetPlayer();
    setGameOver(false);
    setScore(0);
    setLevel(0);
    setRows(0);
  };

  const move = ({ keyCode }) => {
    if (!gameOver) {
      if (keyCode === 37) { // Left arrow
        movePlayerAlongXAxis(-1); // Move one step to the left on the x-axis
      } else if (keyCode === 39) { // Right arrow
        movePlayerAlongXAxis(1); // Move one step to the right on the x-axis
      } else if (keyCode === 40) { // Down arrow
        dropPlayerAlongYAxisByUser(); // Drop the player
      } else if (keyCode === 38) { // Up arrow
        rotatePlayer(stage, 1); // Rotate the player clockwise
      }
    }
  };

  const movePlayerAlongXAxis = (direction) => {
    if (!checkCollision(player, stage, { x: direction, y: 0 })) {
      updatePlayerPosition({ x: direction, y: 0 });
    }
  };

  const dropPlayerAlongYAxisByUser = () => {
    // Clear interval
    setDropTime(null);

    dropPlayerAlongYAxis();
  }

  const dropPlayerAlongYAxis = () => {
    if (rows > (level + 1) * 10) {
      // Increase the level
      setLevel((prev) => prev + 1);

      // Increase the speed
      setDropTime(1000 / (level + 1) + 200);
    }
    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      updatePlayerPosition({ x: 0, y: 1, collided: false });
    } else {
      // Game Over
      if (player.pos.y < 1) {
        console.log("GAME OVER!!!");
        setGameOver(true);
        setDropTime(null);
      }
      updatePlayerPosition({ x: 0, y: 0, collided: true });
    }
  };

  const keyUp = ({ keyCode }) => {
    if (!gameOver) {
      if (keyCode === 40) {
        // Start interval
        setDropTime(1000 / (level + 1) + 200);
      }
    }
  };

  useInterval(() => {
    dropPlayerAlongYAxis();
  }, dropTime);

  return (
    <StyledTetrisWrapper role="button" tabIndex={0} onKeyDown={move} onKeyUp={keyUp}>
      <StyledTetris>
        <Stage stage={stage} />
        <aside>
          {
            gameOver ? (
              <Display gameOver={gameOver} text="Game Over" />
            ) : (
              <div>
                <Display text={`Score: ${score}`} />
                <Display text={`Rows: ${rows}`}/>
                <Display text={`Level: ${level}`}/>
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
