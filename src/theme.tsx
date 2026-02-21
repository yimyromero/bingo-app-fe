import { createTheme } from '@mui/material/styles'
import { green, lightBlue, lightGreen, teal, blue } from '@mui/material/colors'

const theme = createTheme({
  palette: {
    mode: 'light',

    background: {
      default: '#F4F8FF',
      paper: '#FFFFFF',
    },
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
