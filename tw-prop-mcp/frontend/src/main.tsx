import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Failed to find the root element. Is index.html missing #root?');
}

const root = createRoot(container);
root.render(<App />);
