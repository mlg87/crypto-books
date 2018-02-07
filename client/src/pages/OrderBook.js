import React, { Component } from 'react'
// mui
import Button from 'material-ui/Button'
import CircularProgress from 'material-ui/Progress/CircularProgress'
import Checkbox from 'material-ui/Checkbox'
import { FormControl, FormGroup, FormControlLabel } from 'material-ui/Form'
import Grid from 'material-ui/Grid'
import Hidden from 'material-ui/Hidden'
import MenuItem from 'material-ui/Menu/MenuItem'
import Paper from 'material-ui/Paper'
import Sync from 'material-ui-icons/Sync'
import Tabs, { Tab } from 'material-ui/Tabs'
import TextField from 'material-ui/TextField'
import Typography from 'material-ui/Typography'
// lodash
import includes from 'lodash/includes'
import upperFirst from 'lodash/upperFirst'
import sortBy from 'lodash/sortBy'
import slice from 'lodash/slice'
import uniq from 'lodash/uniq'
// moment
import moment from 'moment'

import { OrderTable } from '../components'

export default class OrderBook extends Component {
  state = {
    asks: [],
    bids: [],
    currentMarket: null,
    exchanges: [],
    isError: false,
    isLoading: true,
    isUpdatingTable: true,
    // default per project specs
    selectedExchanges: ['bittrex', 'poloniex'],
    selectedSymbol: 'ETH/BTC',
    selectedTab: 'bids',
    symbols: []
  }

  componentWillMount() {
    this.startSocket()
  }

  componentWillUnmount() {
    this.socket.close()
  }

  startSocket() {
    // REACT_APP_WS_ENDPOINT for dev
    this.socket = new WebSocket(
      `ws://${process.env.REACT_APP_WS_ENDPOINT ||
        'crypto-books.herokuapp.com/'}`
    )
    this.socket.onopen = (event) => {
      console.log('::: SOCKET_OPEN :::', event)
      this.setState({ isError: false, isLoading: true })
    }
    this.socket.onerror = (error) => {
      console.log('::: SOCKET_ERROR :::', error)
    }
    this.socket.onclose = (event) => {
      console.log('::: SOCKET_CLOSE :::', event)
      this.setState({ isError: true, isLoading: false })
      setTimeout(() => {
        this.startSocket()
      }, 5000)
    }
    this.socket.addEventListener('message', (event) => {
      const { type, data } = JSON.parse(event.data)
      switch (type) {
        case 'exchangeInfo':
          this.handleExchangeInfo(data)
          break
        case 'orderInfo':
          this.handleOrderInfo(data)
          break
        default:
          break
      }
    })
  }

  handleExchangeInfo({ exchanges }) {
    if (!exchanges) {
      this.setState({ isError: true })
      return
    }

    const exchangesArr = []
    let symbolsArr = []

    Object.keys(exchanges).map((exchangeName) => {
      // keep track of which symbols each exchange has
      exchangesArr.push({
        name: exchangeName,
        symbols: exchanges[exchangeName]
      })
      return (symbolsArr = [...symbolsArr, ...exchanges[exchangeName]])
    })

    this.setState({
      exchanges: sortBy(exchangesArr, 'name'),
      symbols: uniq(symbolsArr).sort()
    })
  }

  handleOrderInfo({ asks, bids, symbol, timestamp }) {
    if (!asks || !bids || !symbol || !timestamp) {
      this.setState({ isError: true })
      return
    }

    this.setState({
      asks,
      bids,
      currentMarket: symbol,
      lastUpdated: timestamp,
      isLoading: false,
      isUpdatingTable: false
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
      selectedSymbol: event.target.value,
      // reset exchanges so only those with the new symbol can be
      // selected
      selectedExchanges: []
    })
  }

  _handleSync = () => {
    const { selectedExchanges, selectedSymbol } = this.state
    this.socket.send(
      JSON.stringify({
        type: 'updateOrderBook',
        data: { exchanges: selectedExchanges, symbol: selectedSymbol }
      })
    )
    this.setState({ isUpdatingTable: true })
  }

  _handleTabChange = (event, selectedTab) => {
    this.setState({ selectedTab })
  }

  exchangeHasSymbol = (exchangeName) => {
    const { exchanges, selectedSymbol } = this.state
    return includes(exchanges[exchangeName], selectedSymbol)
  }

  render() {
    const {
      asks,
      bids,
      currentMarket,
      exchanges,
      isError,
      isLoading,
      isUpdatingTable,
      lastUpdated,
      symbols,
      selectedSymbol,
      selectedTab,
      selectedExchanges
    } = this.state

    return isLoading ? (
      <div style={styles.loading.container}>
        <CircularProgress style={styles.loading.indicator} />
        <Typography style={styles.loading.description}>
          Hang tight, getting you that sweet, sweet market data...
        </Typography>
      </div>
    ) : isError ? (
      <Grid container style={styles.root}>
        <Grid item xs={12}>
          <Typography>
            Well this is embarassing. We appear to have encountered an error.
            Attempting to reconnect the socket to the server...
          </Typography>
        </Grid>
      </Grid>
    ) : (
      <Grid container justify="center" style={styles.root}>
        <Grid item xs={12} md={8}>
          <Grid container justify="center">
            <Grid item xs={12}>
              <Grid container spacing={40}>
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
                  <FormControl>
                    <FormGroup row>
                      {exchanges.map(({ name, symbols }) => (
                        <FormControlLabel
                          key={`exchange-label-${name}`}
                          control={
                            <Checkbox
                              checked={includes(selectedExchanges, name)}
                              onChange={() =>
                                this._handleExchangeSelection(name)
                              }
                              value={name}
                            />
                          }
                          label={upperFirst(name)}
                          disabled={!includes(symbols, selectedSymbol)}
                        />
                      ))}
                    </FormGroup>
                  </FormControl>
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
            <Grid item xs={12}>
              <Typography type="caption">
                {`Last Updated: ${moment(lastUpdated).format(
                  'MM/DD/YYYY @ kk:mm:ss ZZ'
                )}`}
              </Typography>
            </Grid>
            {/* table for larger screens, tabs for smaller */}
            <Hidden smDown>
              <Grid item xs={12} sm={6}>
                <OrderTable
                  type="bids"
                  currentMarket={currentMarket}
                  data={bids}
                  pointOfComparison={asks[0].price}
                  isUpdatingTable={isUpdatingTable}
                  showTitle
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <OrderTable
                  type="asks"
                  currentMarket={currentMarket}
                  data={asks}
                  pointOfComparison={bids[0].price}
                  isUpdatingTable={isUpdatingTable}
                  showTitle
                />
              </Grid>
            </Hidden>
            <Hidden mdUp>
              <Grid item xs={12}>
                <Paper style={{ flexGrow: 1 }}>
                  <Tabs
                    value={selectedTab}
                    onChange={this._handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    centered
                    fullWidth
                  >
                    <Tab value="bids" label="Bids" />
                    <Tab value="asks" label="Asks" />
                  </Tabs>
                </Paper>
                <OrderTable
                  type={selectedTab}
                  currentMarket={currentMarket}
                  data={this.state[selectedTab]}
                  pointOfComparison={this.state[selectedTab][0].price}
                  isUpdatingTable={isUpdatingTable}
                  denseCells={true}
                />
              </Grid>
            </Hidden>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

const styles = {
  root: {
    overflowX: 'hidden'
  },
  loading: {
    container: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    description: {
      marginTop: '20px'
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
  }
}
