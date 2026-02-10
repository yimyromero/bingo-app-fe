import { createTheme } from '@mui/material/styles'
import { blue, orange } from '@mui/material/colors'

const theme = createTheme({
  palette: {
    mode: 'light',

    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },

    primary: {
      main: blue[500],
      dark: blue[600],
      light: blue[100],
    },

    secondary: {
      main: blue[400],
    },

    text: {
      primary: '#111827',
      secondary: '#4B5563',
      disabled: '#9CA3AF',
    },

    divider: '#E5E7EB',

    error: {
      main: '#EF4444',
    },
    success: {
      main: '#22C55E',
    },
    warning: {
      main: '#F59E0B',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
  },
})

export default theme
