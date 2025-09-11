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
import { subscribeToSWUpdates, updateServiceWorker } from "./registerSW";
import ServiceWorkerDebug from "./components/ServiceWorkerDebug";

export default function App() {
  const { pathname } = useLocation();
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  
  useEffect(() => {
    // Check local storage on mount to see if an update is available
    const checkForStoredUpdate = () => {
      try {
        const storedUpdate = localStorage.getItem('sw-update-available');
        if (storedUpdate) {
          console.log('Found stored update notification on app load');
          setShowUpdateNotification(true);
        }
      } catch (e) {
        console.warn('Failed to check localStorage for SW updates', e);
      }
    };
    
    checkForStoredUpdate();
    
    // Listen for service worker updates
    const handleSWUpdate = () => {
      console.log("SERVICE WORKER UPDATE DETECTED: Showing notification");
      setShowUpdateNotification(true);
    };
    
    console.log("Subscribing to service worker updates");
    const unsubscribe = subscribeToSWUpdates(handleSWUpdate);
    
    return () => {
      console.log("Unsubscribing from service worker updates");
      unsubscribe();
    };
  }, []);
  
  // Handle the refresh action when user clicks update
  const handleRefresh = () => {
    console.log("User clicked to update service worker");
    // Hide notification immediately for better UX
    setShowUpdateNotification(false);
    
    // Also clear the localStorage flag
    try {
      localStorage.removeItem('sw-update-available');
      console.log('Cleared sw-update-available flag from localStorage in handleRefresh');
    } catch (e) {
      console.warn('Failed to clear localStorage flag', e);
    }
    
    // Then update the service worker
    updateServiceWorker()
      .then(() => {
        console.log("Service worker update initiated");
        // Force reload after short delay if the service worker update doesn't trigger a reload
        setTimeout(() => {
          console.log("Force reloading after timeout");
          window.location.reload();
        }, 3000);
      })
      .catch(error => {
        console.error("Error updating service worker:", error);
        // Force reload even on error after a delay
        setTimeout(() => {
          console.log("Force reloading after error");
          window.location.reload();
        }, 1000);
      });
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
            <ServiceWorkerDebug />
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
