import { StyledDisplay } from './styles/StyledDisplay';

const Display = ({ gameOver = false, text }: { gameOver?: boolean; text: string }) => (
  <StyledDisplay $gameOver={gameOver}>{text}</StyledDisplay>
)

export default Display;
