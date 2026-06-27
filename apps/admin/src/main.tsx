import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_API_MOCKING === 'true') {
    const { worker } = await import('./apis/mocks/browser');
    worker.start();
  }
}

// TODO: Remove this once API is ready, remove before deploying to production
enableMocking()
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error(error);
  });
