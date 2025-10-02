import { createTheme } from '@mui/material/styles';

// Default light theme (Material 3)
export const defaultTheme = createTheme({
  palette: {
    mode: 'light',
  },
  typography: {
    fontFamily: ['Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
  },
});

// Low-Stimulation Theme
export const lowStimTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1A1A1A',
      paper: '#1A1A1A',
    },
    text: {
      primary: '#B3B3B3',
      secondary: '#8e8e8e',
    },
  },
  typography: {
    fontFamily: ['Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
    // Increase font sizes by 20%
    h1: { fontSize: '6.72rem' },
    h2: { fontSize: '4.2rem' },
    h3: { fontSize: '3.36rem' },
    h4: { fontSize: '2.4rem' },
    h5: { fontSize: '1.68rem' },
    h6: { fontSize: '1.4rem' },
    subtitle1: { fontSize: '1.2rem' },
    body1: { fontSize: '1.2rem' },
    body2: { fontSize: '1.05rem' },
    button: { fontSize: '1.05rem' },
  },
});