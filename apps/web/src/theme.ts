import { alpha, createTheme } from '@mui/material/styles';

const navy = '#071526';
const panel = '#10233a';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#249cff', light: '#72c3ff' },
    secondary: { main: '#2bd4c4' },
    background: { default: navy, paper: panel },
    success: { main: '#55d981' },
    warning: { main: '#f5b940' },
    error: { main: '#ff6b73' },
    text: { primary: '#f4f8fc', secondary: '#9eb0c4' },
    divider: alpha('#b7d0eb', 0.13),
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: 'clamp(2rem, 4vw, 3.25rem)',
      fontWeight: 750,
      letterSpacing: '-0.045em',
    },
    h2: {
      fontSize: 'clamp(1.6rem, 2.5vw, 2.25rem)',
      fontWeight: 720,
      letterSpacing: '-0.03em',
    },
    h5: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.01em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(circle at 72% -5%, rgba(36,156,255,.14), transparent 30%), linear-gradient(160deg, #071526 0%, #091a2d 100%)',
        },
      },
    },
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${alpha('#b7d0eb', 0.12)}`,
          backgroundImage:
            'linear-gradient(145deg, rgba(25,52,80,.96), rgba(13,29,48,.98))',
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: '#9eb0c4',
          fontWeight: 700,
          borderBottom: `1px solid ${alpha('#b7d0eb', 0.13)}`,
        },
        root: { borderBottom: `1px solid ${alpha('#b7d0eb', 0.09)}` },
      },
    },
  },
});
