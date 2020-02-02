import React from 'react';

import { TETROMINOS } from '../tetrominos';
import { StyledCell } from './styles/StyledCell';

const Cell = ({ type }) => (
  <StyledCell type={type} color={TETROMINOS[type].color}>Cell</StyledCell>
);

export default Cell;
