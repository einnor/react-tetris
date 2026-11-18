import Cell from './Cell';
import { StyledStage } from './styles/StyledStage';
import type { Board } from '../game/engine';
import { BOARD_WIDTH } from '../game/engine';

const Stage = ({ stage }: { stage: Board }) => (
  <StyledStage $width={stage[0]?.length ?? BOARD_WIDTH} $height={stage.length} role="img" aria-label="Tetris playfield">
    {
      stage.map((row, y) => row.map((cell, x) =>
        <Cell key={`${y}-${x}`} type={cell} />
      ))
    }
  </StyledStage>
);

export default Stage;
