import { StyledStartButton } from './styles/StyledStartButton';

const StartButton = ({ callback }: { callback: () => void }) => (
  <StyledStartButton onClick={callback}>Start Game</StyledStartButton>
);

export default StartButton;
