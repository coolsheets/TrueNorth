// app/src/App.tsx
import { Link as RouterLink, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, Box, Container, Link, Stack } from "@mui/material";
import OfflineBadge from "./components/OfflineBadge";
import SyncIndicator from "./components/SyncIndicator";
import Logo from "./components/Logo";
import Routes from "./routes";

export default function App() {
  const { pathname } = useLocation();
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Link 
            component={RouterLink} 
            to="/" 
            color="primary" 
            underline="none" 
          >
            <Logo variant="full" color="white" />
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
          </Stack>
        </Toolbar>
      </AppBar>

      <OfflineBadge />

      <Container component="main" sx={{ flexGrow: 1, py: 2, maxWidth: 'md' }}>
        <Routes />
      </Container>
      
      <SyncIndicator />

      <Box component="footer" sx={{ 
        py: 2, 
        borderTop: 1, 
        borderColor: 'divider',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1
      }}>
        <Logo variant="full" size="small" />
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} PPI Canada - Pre-Purchase Inspection Services
        </Typography>
      </Box>
    </Box>
  );
}
