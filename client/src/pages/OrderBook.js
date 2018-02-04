import React, { Component } from 'react'
// mui
import Button from 'material-ui/Button'
import CircularProgress from 'material-ui/Progress/CircularProgress'
import Checkbox from 'material-ui/Checkbox'
import { FormControl, FormGroup, FormControlLabel } from 'material-ui/Form'
import Grid from 'material-ui/Grid'
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
// lodash
import includes from 'lodash/includes'
import upperFirst from 'lodash/upperFirst'
import slice from 'lodash/slice'

export default class OrderBook extends Component {
  state = {
    isLoading: true,
    // TODO move this to mobx
    selectedSymbol: 'ETH/BTC',
    selectedExchanges: ['bittrex', 'poloniex'],
    bids: [],
    asks: [],
    symbols: []
  }

  // could be dynamically set by server
  exchanges = [
    'binance',
    'bitfinex',
    'bithumb',
    'bittrex',
    'exmo',
    'gdax',
    'gemini',
    'hitbtc',
    'huobi',
    'kraken',
    'okex',
    'poloniex'
  ]

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
    const { asks, bids, symbols } = await res.json()

    this.setState({
      symbols,
      asks,
      bids,
      isLoading: false
    })
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

    console.log('this.context', this.context)

    return isLoading ? (
      <div style={styles.loading.container}>
        <CircularProgress style={styles.loading.indicator} />
      </div>
    ) : (
      <Grid container style={styles.root}>
        <Grid item xs={12}>
          <Grid container spacing={40}>
            <Grid item xs={6}>
              <FormControl>
                <FormGroup row>
                  {this.exchanges.map((exchange) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={includes(selectedExchanges, exchange)}
                          onChange={() =>
                            this._handleExchangeSelection(exchange)
                          }
                          value={exchange}
                        />
                      }
                      label={upperFirst(exchange)}
                    />
                  ))}
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
                  fullWidth
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
          <div style={styles.table.container}>
            <Table style={styles.table.bids}>
              <TableHead>
                <TableRow>
                  <TableCell>Exchange</TableCell>
                  <TableCell numeric>Price</TableCell>
                  <TableCell numeric>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bids.map((bid, i) => {
                  const { amount, exchange, price } = bid
                  return (
                    <TableRow key={`bid${i}`}>
                      <TableCell>{upperFirst(exchange)}</TableCell>
                      <TableCell numeric>{price}</TableCell>
                      <TableCell numeric>{amount}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </Grid>
        <Grid item xs={6}>
          <Typography align="center" gutterBottom type="display1">
            Asks
          </Typography>
          <div style={styles.table.container}>
            <Table style={styles.table.asks}>
              <TableHead>
                <TableRow>
                  <TableCell>Exchange</TableCell>
                  <TableCell numeric>Price</TableCell>
                  <TableCell numeric>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {asks.map((ask, i) => {
                  const { amount, exchange, price } = ask
                  return (
                    <TableRow key={`ask${i}`}>
                      <TableCell>{upperFirst(exchange)}</TableCell>
                      <TableCell numeric>{price}</TableCell>
                      <TableCell numeric>{amount}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </Grid>
      </Grid>
    )
  }
}

const styles = {
  root: {
    flexGrow: 1,
    maxWidth: '1300px',
    margin: 'auto'
  },
  loading: {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    indicator: {
      color: '#fff'
    }
  },
  form: {
    container: {
      display: 'flex',
      flexWrap: 'wrap'
    }
  },
  table: {
    container: {
      maxHeight: '800px',
      overflow: 'scroll'
    },
    asks: {},
    bids: {}
  }
}
