import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import './index.css';
import { readSeed } from './game/seed';

const root = document.getElementById('root');
if (!root) throw new Error('React Tetris requires a root element.');
const seed = readSeed(window.location.search);
createRoot(root).render(
  <StrictMode>
    <App {...(seed === undefined ? {} : { seed })} />
  </StrictMode>,
);
