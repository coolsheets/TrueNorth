import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, UNSAFE_useScrollRestoration } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import App from './App';
import theme from './styles/theme';
import './styles/index.css';
import './registerSW';
// Import virtual module from VitePWA
import { registerSW } from 'virtual:pwa-register';

// Register the service worker using VitePWA
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New content available, click on reload button to update.');
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
  onRegistered(registration) {
    console.log('Service worker has been registered', registration);
  },
  onRegisterError(error) {
    console.error('Service worker registration error', error);
  }
});

// Opt into future behavior for React Router
const routerOptions = {
  // Opt into v7 behavior now
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter {...routerOptions}>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
