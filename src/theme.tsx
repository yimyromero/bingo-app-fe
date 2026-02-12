import { createTheme } from '@mui/material/styles'
import { green, lightGreen, teal } from '@mui/material/colors'

const theme = createTheme({
  palette: {
    mode: 'light',

    background: {
      default: '#F4F8FF',
      paper: '#FFFFFF',
    },

    primary: {
      main: '#5DA9F6',
      light: '#E8F3FF',
      dark: '#3D8DE3',
    },

    success: {
      main: green[500],
    },

    secondary: {
      main: '#7ED957',
    },

    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
    },

    divider: '#E3EAF5',
  },

  shape: {
    borderRadius: 10,
  },

  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1F2937',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
})

export default theme
