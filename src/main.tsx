import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import 'react-loading-skeleton/dist/skeleton.css';
import './styles.css';

if (import.meta.env.VITE_SCAN) {
  import('react-scan').then(({ scan }) => scan({ enabled: true }));
}

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
