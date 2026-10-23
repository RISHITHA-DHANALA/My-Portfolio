import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/themes.css';
import './styles/global.css';
import './styles/game.css';

createRoot(document.getElementById('root')!).render(<App />);
