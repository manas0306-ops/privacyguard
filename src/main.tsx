import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PrivacyProvider } from './context/PrivacyContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrivacyProvider>
      <App />
    </PrivacyProvider>
  </React.StrictMode>,
);
