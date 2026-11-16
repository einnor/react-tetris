import { useState, useEffect } from 'react';

const linePoints = [40, 100, 300, 1200];

export const useGameStatus = (rowsCleared) => {
  const [score, setScore] = useState(0);
  const [rows, setRows] = useState(0);
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (rowsCleared > 0) {
      setScore(prev => prev + linePoints[rowsCleared - 1] * (level + 1));
      setRows(prev => prev + rowsCleared);
    }
    // A clear is an event; a level change must not score that event again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowsCleared]);

  return [score, setScore, rows, setRows, level, setLevel];
};
