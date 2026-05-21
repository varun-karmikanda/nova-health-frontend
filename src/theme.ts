import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

const baseOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 700 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    subtitle1: { fontSize: '1rem', fontWeight: 500 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
};

export const getTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';

  return createTheme({
    ...baseOptions,
    palette: {
      mode,
      primary: {
        main: isDark ? '#00bfa5' : '#00796b',
        light: isDark ? '#5df2d6' : '#48a999',
        dark: isDark ? '#008e76' : '#004c40',
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? '#ffb300' : '#f57c00',
        light: isDark ? '#ffe54c' : '#ffad42',
        dark: isDark ? '#c68400' : '#bb4d00',
        contrastText: '#000000',
      },
      background: {
        default: isDark ? '#0f172a' : '#f8fafc',
        paper: isDark ? '#1e293b' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f8fafc' : '#0f172a',
        secondary: isDark ? '#94a3b8' : '#475569',
      },
      divider: isDark ? '#334155' : '#e2e8f0',
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: isDark
              ? '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)'
              : '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
            border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: isDark
                ? '0 10px 15px -3px rgb(0 0 0 / 0.7), 0 4px 6px -4px rgb(0 0 0 / 0.7)'
                : '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
          },
          head: {
            fontWeight: 600,
            backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
            backgroundImage: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            borderRight: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
          },
        },
      },
    },
  });
};

// Default export for convenience (light theme)
export const theme = getTheme('light');
