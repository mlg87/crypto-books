import React, { Component } from 'react'
import Grid from 'material-ui/Grid'
import Button from 'material-ui/Button'
import {
  FormLabel,
  FormControl,
  FormGroup,
  FormControlLabel,
  FormHelperText
} from 'material-ui/Form'
import CircularProgress from 'material-ui/Progress/CircularProgress'
import Checkbox from 'material-ui/Checkbox'
import MenuItem from 'material-ui/Menu/MenuItem'
import Sync from 'material-ui-icons/Sync'
import TextField from 'material-ui/TextField'
import Typography from 'material-ui/Typography'
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from 'material-ui/Table'
import includes from 'lodash/includes'
import slice from 'lodash/slice'

export default class App extends Component {
  state = {
    isLoading: true,
    // TODO move this to mobx
    selectedSymbol: 'ETH/BTC',
    selectedExchanges: ['bittrex', 'poloniex'],
    bids: [],
    asks: [],
    symbols: []
  }

  componentWillMount() {
    this.getMarkets()
  }

  getMarkets = async () => {
    const { selectedExchanges, selectedSymbol } = this.state
    let exchangesQuery = ''
    selectedExchanges.map(
      (exchange, i) =>
        (exchangesQuery += `exchanges=${exchange}${
          selectedExchanges.length - 1 === i ? '' : '&'
        }`)
    )

    const res = await fetch(
      `/api/markets/order-books?${exchangesQuery}&symbol=${selectedSymbol}`
    )
    const body = await res.json()
    this.setState({ isLoading: false, symbols: body.sharedSymbols })
    console.log('body', body)
  }

  _handleExchangeSelection = (exchange) => {
    const { selectedExchanges } = this.state
    const index = selectedExchanges.indexOf(exchange)
    const isSelected = index > -1

    if (!isSelected) {
      this.setState({ selectedExchanges: [...selectedExchanges, exchange] })
    } else {
      this.setState({
        selectedExchanges: [
          ...slice(selectedExchanges, 0, index),
          ...slice(selectedExchanges, index + 1)
        ]
      })
    }
  }

  _handleSymbolSelection = (event) => {
    this.setState({
      selectedSymbol: event.target.value
    })
  }

  _handleSync = () => {
    this.setState({ isLoading: true })
    this.getMarkets()
  }

  render() {
    const {
      asks,
      bids,
      isLoading,
      symbols,
      selectedSymbol,
      selectedExchanges
    } = this.state

    return isLoading ? (
      <CircularProgress />
    ) : (
      <Grid container style={styles.root}>
        <Grid item xs={12}>
          <Grid container spacing={40}>
            <Grid item xs={6}>
              <FormControl>
                <FormLabel>Exchanges to Include in Order Books</FormLabel>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includes(selectedExchanges, 'bittrex')}
                        onChange={() =>
                          this._handleExchangeSelection('bittrex')
                        }
                        value="bittrex"
                      />
                    }
                    label="Bittrex"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includes(selectedExchanges, 'poloniex')}
                        onChange={() =>
                          this._handleExchangeSelection('poloniex')
                        }
                        value="poloniex"
                      />
                    }
                    label="Poloniex"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includes(selectedExchanges, 'binance')}
                        onChange={() =>
                          this._handleExchangeSelection('binance')
                        }
                        value="binance"
                      />
                    }
                    label="Binance"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includes(selectedExchanges, 'kraken')}
                        onChange={() => this._handleExchangeSelection('kraken')}
                        value="kraken"
                      />
                    }
                    label="Kraken"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <form style={styles.form.container}>
                <TextField
                  select
                  label="Currencies to Compare"
                  value={selectedSymbol}
                  onChange={this._handleSymbolSelection}
                  helperText="Select the currencies you would like to get the order books for"
                  margin="normal"
                  style={styles.form.select}
                >
                  {symbols.map((symbol) => (
                    <MenuItem key={`${symbol}`} value={symbol}>
                      {symbol}
                    </MenuItem>
                  ))}
                </TextField>
              </form>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Button
            raised
            color="secondary"
            disabled={!selectedExchanges.length}
            onClick={this._handleSync}
            fullWidth
          >
            Update Order Books
            <Sync />
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Typography align="center" gutterBottom type="display1">
            Bids
          </Typography>
          <Table style={styles.table.bids}>
            <TableHead>
              <TableRow>
                <TableCell>Exchange</TableCell>
                <TableCell numeric>BTC</TableCell>
                <TableCell numeric>ETH</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bids.map((bid, i) => (
                <TableRow key={`bid${i}`}>
                  <TableCell numeric>{bid[0]}</TableCell>
                  <TableCell numeric>{bid[1]}</TableCell>
                  <TableCell>{bid.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>
        <Grid item xs={6}>
          <Typography align="center" gutterBottom type="display1">
            Asks
          </Typography>
          <Table style={styles.table.asks}>
            <TableHead>
              <TableRow>
                <TableCell>Exchange</TableCell>
                <TableCell numeric>BTC</TableCell>
                <TableCell numeric>ETH</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {asks.map((ask, i) => (
                <TableRow key={`ask${i}`}>
                  <TableCell numeric>{ask[0]}</TableCell>
                  <TableCell numeric>{ask[1]}</TableCell>
                  <TableCell>{ask.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    )
  }
}

const styles = {
  root: {
    flexGrow: 1
  },
  form: {
    container: {
      display: 'flex',
      flexWrap: 'wrap'
    },
    select: {
      width: '50%'
    }
  },
  table: {
    asks: {
      backgroundColor: 'rgba(72, 140, 73, 0.5)'
    },
    bids: {
      backgroundColor: 'rgba(182, 74, 73, 0.5)'
    }
  }
}
