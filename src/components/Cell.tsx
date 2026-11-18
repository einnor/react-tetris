import { memo } from 'react';

import { PIECES } from '../game/pieces';
import type { CellValue } from '../game/pieces';
import { StyledCell } from './styles/StyledCell';

const Cell = ({ type }: { type: CellValue }) => (
  <StyledCell $type={type} $color={PIECES[type].color} aria-hidden="true" />
);

export default memo(Cell);
