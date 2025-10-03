import { createTheme } from '@mui/material/styles';

// A more complete Material 3 Light Theme
export const defaultTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6750A4', // A standard M3 purple
    },
    secondary: {
      main: '#625B71',
    },
    tertiary: {
      main: '#7D5260',
    },
    background: {
      default: '#FFFBFE',
      paper: '#FFFBFE',
    },
    text: {
      primary: '#1C1B1F',
      secondary: '#49454F',
    },
  },
  typography: {
    fontFamily: ['Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
  },
});

// A more complete Material 3 Dark Theme for Low Stimulation
export const lowStimTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4A4458', // Muted purple for dark mode
    },
    secondary: {
      main: '#484450', // Muted grey for dark mode
    },
    background: {
      default: '#1A1A1A',
      paper: '#1A1A1A',
    },
    text: {
      primary: '#CAC4D0', // M3 standard on-dark text color
      secondary: '#938F99',
    },
  },
  typography: {
    fontFamily: ['Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
    // Increased font sizes for accessibility
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