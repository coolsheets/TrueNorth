// app/src/App.tsx
/**
 * Main App component for TrueNorth PWA
 * @ai-context See .github/AI_ASSISTANT_CONFIG.md for project standards
 */
import { Link as RouterLink, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, Box, Container, Link, Stack } from "@mui/material";
import OfflineBadge from "./components/OfflineBadge";
import InstallPWA from "./components/InstallPWA";
import UpdateNotification from "./components/UpdateNotification";
import IconDebug from "./components/IconDebug";
import Routes from "./routes";
import { useEffect, useState } from "react";
import { wireServiceWorker, applyUpdate } from "./registerSW";
import { ServiceWorkerDebug } from "./components/ServiceWorkerDebug";

export default function App() {
  const { pathname } = useLocation();
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [serviceWorkerRegistered, setServiceWorkerRegistered] = useState(false);
  const [serviceWorkerError, setServiceWorkerError] = useState<Error | null>(null);
  
  useEffect(() => {
    // Listen for update events from VitePWA (main.tsx)
    const handleUpdateAvailable = () => {
      console.log('Service worker update detected from VitePWA');
      setShowUpdateNotification(true);
    };
    
    window.addEventListener('sw:update-available', handleUpdateAvailable);
    
    // Initialize our custom service worker as a fallback
    if ('serviceWorker' in navigator) {
      wireServiceWorker(() => {
        console.log('Service worker update detected from wireServiceWorker');
        setShowUpdateNotification(true);
      })
      .then(() => {
        setServiceWorkerRegistered(true);
        setServiceWorkerError(null);
        console.log('Service worker initialization complete');
      })
      .catch(err => {
        // Properly track the error state instead of masking it
        setServiceWorkerRegistered(false);
        setServiceWorkerError(err instanceof Error ? err : new Error(String(err)));
        console.error('Service worker initialization had issues:', err);
      });
    } else {
      console.warn('Service worker not supported in this browser');
    }
    
    return () => {
      window.removeEventListener('sw:update-available', handleUpdateAvailable);
    };
  }, []);
  
  // Handle the refresh action when user clicks update
  const handleRefresh = async () => {
    console.log("User clicked to update service worker");
    // Hide notification immediately for better UX
    setShowUpdateNotification(false);
    
    // Apply the update
    await applyUpdate();
    
    // Force reload after short delay if the service worker update doesn't trigger a reload
    setTimeout(() => {
      console.log("Force reloading after timeout");
      window.location.reload();
    }, 3000);
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Link 
            component={RouterLink} 
            to="/" 
            color="primary" 
            underline="none" 
            sx={{ fontWeight: 'bold', letterSpacing: '0.05em' }}
          >
            PPI Canada
          </Link>
          
          <Stack direction="row" spacing={2}>
            <Link
              component={RouterLink}
              to="/start"
              color="inherit"
              underline={pathname === "/start" ? "always" : "none"}
              sx={{ fontSize: '0.875rem', opacity: 0.9 }}
            >
              Start
            </Link>
            <Link
              component={RouterLink}
              to="/review"
              color="inherit"
              underline={pathname === "/review" ? "always" : "none"}
              sx={{ fontSize: '0.875rem', opacity: 0.9 }}
            >
              Review
            </Link>
            <Link
              component={RouterLink}
              to="/export"
              color="inherit"
              underline={pathname === "/export" ? "always" : "none"}
              sx={{ fontSize: '0.875rem', opacity: 0.9 }}
            >
              Export
            </Link>
            <InstallPWA />
          </Stack>
        </Toolbar>
      </AppBar>

      <OfflineBadge />

      <Container component="main" sx={{ flexGrow: 1, py: 2, maxWidth: 'md' }}>
        <Routes />
        {process.env.NODE_ENV === 'development' && (
          <>
            <IconDebug />
            <ServiceWorkerDebug 
              registered={serviceWorkerRegistered}
              error={serviceWorkerError} 
            />
          </>
        )}
      </Container>

      {showUpdateNotification && <UpdateNotification onRefresh={handleRefresh} />}

      <Box component="footer" sx={{ 
        py: 2, 
        borderTop: 1, 
        borderColor: 'divider',
        textAlign: 'center'
      }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} PPI Canada
        </Typography>
      </Box>
    </Box>
  );
}
