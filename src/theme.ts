import { createTheme, type ThemeOptions } from '@mui/material/styles';

// Material Design 3 theme configuration
export const getTheme = (mode: 'default' | 'lowstim' = 'default') => {
  const baseTheme: ThemeOptions = {
    palette: {
      mode: mode === 'lowstim' ? 'dark' : 'light',
      primary: {
        main: mode === 'lowstim' ? '#B3B3B3' : '#6750A4',
      },
      secondary: {
        main: mode === 'lowstim' ? '#808080' : '#625B71',
      },
      background: {
        default: mode === 'lowstim' ? '#1A1A1A' : '#FFFBFE',
        paper: mode === 'lowstim' ? '#1A1A1A' : '#FFFBFE',
      },
      text: {
        primary: mode === 'lowstim' ? '#B3B3B3' : '#1C1B1F',
        secondary: mode === 'lowstim' ? '#808080' : '#49454F',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: mode === 'lowstim' ? 16.8 : 14, // 20% increase for lowstim
      h1: {
        fontSize: mode === 'lowstim' ? '6rem' : '5rem',
      },
      h2: {
        fontSize: mode === 'lowstim' ? '4.32rem' : '3.6rem',
      },
      h3: {
        fontSize: mode === 'lowstim' ? '3.6rem' : '3rem',
      },
      h4: {
        fontSize: mode === 'lowstim' ? '2.52rem' : '2.1rem',
      },
      h5: {
        fontSize: mode === 'lowstim' ? '1.8rem' : '1.5rem',
      },
      h6: {
        fontSize: mode === 'lowstim' ? '1.5rem' : '1.25rem',
      },
      body1: {
        fontSize: mode === 'lowstim' ? '1.2rem' : '1rem',
      },
      body2: {
        fontSize: mode === 'lowstim' ? '1.08rem' : '0.9rem',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === 'lowstim' ? 'none' : '0px 2px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
    },
  };

  return createTheme(baseTheme);
};
