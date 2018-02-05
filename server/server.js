// setup
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const path = require('path')

app.use('/', express.static(`${__dirname}/client/build`))

const port = process.env.PORT || 5000
// exchange info pkg
const ccxt = require('ccxt')
// lodash
const { includes, intersection, findIndex, sortBy, slice } = require('lodash')

// make sure to only return symbols shared by all exchanges requested
const scrubSymbols = (sharedSymbols, symbols) => {
  if (!sharedSymbols.length) {
    return [...symbols]
  }
  return intersection(sharedSymbols, symbols)
}

const combineOrders = (orders) => {
  const combinedOrders = []
  Object.keys(orders).forEach((exchange) => {
    orders[exchange].forEach((order) => {
      combinedOrders.push({
        exchange,
        price: order[0], // [0] === price
        amount: order[1] // [1] === amount
      })
    })
  })
  return sortBy(combinedOrders, 'price')
}

const getExchangeInfoAsync = async () => {
  const popularExchanges = [
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

  try {
    const exchanges = {}

    await Promise.all(
      popularExchanges.map(async (exchangeName) => {
        const exchange = new ccxt[exchangeName]()
        await exchange.loadMarkets()
        const { id, symbols } = exchange
        exchanges[id] = symbols
      })
    )
    return {
      exchanges
    }
  } catch (error) {
    console.error('error getting exchange info', error)
    return error
  }
}

const getMarketDataAsync = async (exchanges, symbol) => {
  try {
    const asks = {}
    const bids = {}

    await Promise.all(
      exchanges.map(async (exchangeName) => {
        const exchange = new ccxt[exchangeName]()
        await exchange.loadMarkets()
        const { id, symbols } = exchange
        const symbolIndex = symbols.indexOf(symbol)
        // fetchOrderBooks return 2d arrays for bid and ask
        // e.g. 'ETH/USDT' returns asks: [ [ price, amount ] ]
        const orderBook = await exchange.fetchOrderBook(
          exchange.symbols[symbolIndex]
        )
        asks[id] = orderBook.asks
        bids[id] = orderBook.bids
      })
    )
    return {
      timestamp: new Date(),
      asks: combineOrders(asks),
      bids: combineOrders(bids),
      symbol
    }
  } catch (error) {
    console.error('error getting market data', error)
    return error
  }
}

let clients = []
io.on('connection', (client) => {
  clients.push(client)

  // event cbs /////////////////////////////////////////////////////
  const subscribeToExchangeInfo = async () => {
    client.emit('exchangeInfo', await getExchangeInfoAsync())
  }

  let marketDataInterval // store interval so same event can handle initial subs and resubs
  const subscribeToMarketUpdates = async (exchanges, symbol) => {
    if (marketDataInterval) clearInterval(marketDataInterval)

    // send initial response
    client.emit('marketUpdate', await getMarketDataAsync(exchanges, symbol))

    // update client every 10 seconds
    marketDataInterval = setInterval(async () => {
      client.emit('marketUpdate', await getMarketDataAsync(exchanges, symbol))
    }, 10000)
  }
  ///////////////////////////////////////////////////////////////////

  client.on('subscribeToMarketUpdates', subscribeToMarketUpdates)

  client.on('subscribeToExchangeInfo', subscribeToExchangeInfo)

  client.on('disconnect', () => {
    const index = findIndex(clients, (c) => c.id === client.id)
    // get rid of client on disconnect
    clients = [...slice(clients, 0, index), ...slice(clients, index + 1)]
  })
})

server.listen(port)
console.log(`Listening on port ${port}`)
