import { createTheme } from '@mui/material/styles';

export const adminTheme = createTheme({
  palette: {
    primary: {
      main: '#1a56db', // Blue for admin
    },
    secondary: {
      main: '#4a5568', // Dark gray
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  components: {
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#e2e8f0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});