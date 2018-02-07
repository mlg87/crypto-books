import React from 'react'
// mui
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles'
import AppBar from 'material-ui/AppBar'
import Grid from 'material-ui/Grid'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'
import Reboot from 'material-ui/Reboot'
import green from 'material-ui/colors/green'
import red from 'material-ui/colors/red'

import { OrderBook } from './pages'

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      light: green[300],
      main: green[500],
      dark: green[800],
      contrastText: '#fff'
    },
    secondary: {
      light: red[300],
      main: red[500],
      dark: red[800],
      contrastText: '#fff'
    }
  }
})

const App = () => (
  <MuiThemeProvider theme={theme}>
    <AppBar position="static">
      <Grid container justify="center">
        <Grid item xs={12} md={8}>
          <Toolbar>
            <Typography type="title" color="inherit">
              Crypto-Books
            </Typography>
          </Toolbar>
        </Grid>
      </Grid>
    </AppBar>
    <div style={{ overflowX: 'hidden', padding: 10 }}>
      {/* necessary for dark them background to apply to all elements */}
      <Reboot />
      <OrderBook />
    </div>
  </MuiThemeProvider>
)

export default App
