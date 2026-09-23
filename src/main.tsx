// Compatibility safeguard for environments where window.fetch has only a getter
try {
  if (typeof window !== 'undefined') {
    const origFetch = window.fetch;
    let _f = origFetch ? origFetch.bind(window) : undefined;
    Object.defineProperty(window, 'fetch', {
      get: () => _f,
      set: (fn) => { _f = fn; },
      configurable: true,
      enumerable: true
    });
  }
} catch {
  // Ignore if already configured
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { StorageService } from './services/storage';

// Initialize local-first storage with seed data if empty
StorageService.init();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
