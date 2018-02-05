import React, { Component } from 'react'
// mui
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles'
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

export default class App extends Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        {/* necessary for dark them background to apply to all elements */}
        <Reboot />
        <OrderBook />
      </MuiThemeProvider>
    )
  }
}
