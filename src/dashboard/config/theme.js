// src/config/theme.ts
'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#0f172a', // Slate 900 - professional, dark tone for enterprise
      light: '#e2e8f0', // Slate 200 - used for selected sidebar items
      dark: '#020617',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3b82f6', // Blue 500 - good for accents like the Lambda output
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Slate 50 - subtle off-white background
      paper: '#ffffff',
    },
  },
  typography: {
    // Inherit whatever font Next.js is providing (e.g., Inter or Roboto)
    fontFamily: 'inherit',
    h3: {
      fontWeight: 800,
    },
    h4: {
      fontWeight: 900,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 700,
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 16, // Matches the `borderRadius: 4` (4 * 4px = 16px) in your components
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});