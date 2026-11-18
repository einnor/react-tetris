import Tetris from './components/Tetris';

const App = ({ seed }: { seed?: number }) => (
  <div className="app">
    <Tetris {...(seed === undefined ? {} : { seed })} />
  </div>
);

export default App;
