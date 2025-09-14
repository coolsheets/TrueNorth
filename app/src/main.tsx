import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, UNSAFE_useScrollRestoration } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import App from './App';
import theme from './styles/theme';
import './styles/index.css';
// import './registerSW';

// Handle GitHub Pages path issue for SPA routing
const basePath = import.meta.env.BASE_URL;
// Import virtual module from VitePWA
import { registerSW } from 'virtual:pwa-register';

// Create an event bus for service worker updates
export const swEvents = {
  updateAvailable: new CustomEvent('sw:update-available'),
  offlineReady: new CustomEvent('sw:offline-ready')
};

// Register the service worker using VitePWA
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New content available, click on reload button to update.');
    // Dispatch event for App component to show update notification
    window.dispatchEvent(swEvents.updateAvailable);
  },
  onOfflineReady() {
    console.log('App ready to work offline');
    window.dispatchEvent(swEvents.offlineReady);
  },
  onRegistered(registration) {
    console.log('Service worker has been registered', registration);
  },
  onRegisterError(error) {
    console.error('Service worker registration error', error);
  }
});

// Export updateSW for use in other components
export { updateSW };

// Import service worker helper to handle updates
import { setupServiceWorkerMessageHandling } from './utils/serviceWorkerHelpers';

// Setup service worker messaging
if ('serviceWorker' in navigator) {
  setupServiceWorkerMessageHandling();
}

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
      <BrowserRouter basename={basePath} {...routerOptions}>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
