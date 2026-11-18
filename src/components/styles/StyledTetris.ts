import styled from 'styled-components';

import bgImage from '../../img/bg.png';

export const StyledTetrisWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background: url(${bgImage}) #000;
  background-size: cover;
  overflow: hidden;
  &:focus-visible {
    outline: 3px solid #aaa;
    outline-offset: -3px;
  }
  @media (max-width: 760px) {
    height: auto;
    min-height: 100dvh;
    overflow: auto;
  }
`;

export const StyledTetris = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 40px;
  margin: 0 auto;
  max-width: 900px;

  aside {
    width: 100%;
    max-width: 200px;
    display: block;
    padding: 0 20px;
  }
  .touch-controls { display: none; }
  @media (max-width: 760px) {
    flex-direction: column;
    align-items: center;
    padding: 20px;
    gap: 16px;
    aside { max-width: 360px; padding: 0; }
    .statistics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
    .statistics > div { padding: 12px 8px; font-size: 0.65rem; margin-bottom: 12px; }
    .game-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .game-actions button { padding: 14px 8px; font-size: 0.75rem; }
    .touch-controls { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
    .touch-controls button { padding: 12px 4px; min-height: 44px; margin: 0; font-size: 0.65rem; }
  }
`;
