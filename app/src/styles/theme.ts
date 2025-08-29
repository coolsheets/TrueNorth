import { createTheme } from '@mui/material/styles';

// A custom theme for this app
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#38bdf8', // sky-400 equivalent
    },
    secondary: {
      main: '#f59e0b', // amber-500 equivalent
    },
    background: {
      default: '#020617', // slate-950 equivalent
      paper: '#0f172a', // slate-900 equivalent
    },
    text: {
      primary: '#f1f5f9', // slate-100 equivalent
      secondary: '#94a3b8', // slate-400 equivalent
    },
    divider: '#1e293b', // slate-800 equivalent
    error: {
      main: '#ef4444', // red-500 equivalent
    },
    warning: {
      main: '#f59e0b', // amber-500 equivalent
    },
    info: {
      main: '#3b82f6', // blue-500 equivalent
    },
    success: {
      main: '#22c55e', // green-500 equivalent
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '0.375rem', // rounded-md equivalent
        },
        containedPrimary: {
          backgroundColor: '#0284c7', // sky-600 equivalent
          '&:hover': {
            backgroundColor: '#0369a1', // sky-700 equivalent
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #1e293b', // border-slate-800
          backgroundColor: '#0f172a', // bg-slate-900
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#0f172a', // bg-slate-900
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#1e293b', // slate-800
            },
            '&:hover fieldset': {
              borderColor: '#334155', // slate-700
            },
            '&.Mui-focused fieldset': {
              borderColor: '#38bdf8', // sky-400
            },
            '& input': {
              backgroundColor: '#1e293b', // slate-800
              borderRadius: 4,
            },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#1e293b', // slate-800
        },
      },
    },
  },
});

export default theme;
