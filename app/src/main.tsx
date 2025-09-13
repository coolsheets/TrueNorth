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

// Register the service worker using VitePWA
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New content available, click on reload button to update.');
    // Add your own update UI notification logic here
    // For example, show a banner/modal with an "Update Now" button
    // The update button handler should call:
    // updateSW(true); // this sends the SKIP_WAITING message and triggers controllerchange
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

// Export updateSW for use in other components
export { updateSW };

// Add a global listener to refresh once when the new SW takes control
let hasRefreshed = false;
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  if (hasRefreshed) return;
  hasRefreshed = true;
  window.location.reload();
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
      <BrowserRouter basename={basePath} {...routerOptions}>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
