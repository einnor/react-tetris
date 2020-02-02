import React from 'react';

import Cell from './Cell';
import { StyledStage } from './styles/StyledStage';

const Stage = ({ stage }) => (
  <StyledStage>
    {
      stage.map(row => row.map((cell, x) =>
        <Cell key={x} type={cell[0]} />
      ))
    }
  </StyledStage>
);

export default Stage;
