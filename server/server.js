// setup
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const WebSocket = require('ws')
const wss = new WebSocket.Server({ server })
const path = require('path')
// exchange info pkg
const ccxt = require('ccxt')
// lodash
const {
  includes,
  intersection,
  findIndex,
  orderBy,
  sortBy,
  slice
} = require('lodash')
const port = process.env.PORT || 5000

app.use(express.static(path.join(__dirname, '/../client/build')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/../client/build/index.html'))
})

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
  return combinedOrders
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
    // 'huobi',
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

const getOrderBookAsync = async (
  exchanges = ['bittrex', 'poloniex'],
  symbol = 'ETH/BTC'
) => {
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
      asks: orderBy(combineOrders(asks), 'price', 'asc'),
      bids: orderBy(combineOrders(bids), 'price', 'desc'),
      symbol
    }
  } catch (error) {
    console.error('error getting market data', error)
    return error
  }
}

const sendMessageToClient = (ws, type, data) => {
  ws.send(JSON.stringify({ type, data }), (error) => {
    if (error) console.log(`::: ERROR SENDING ${type} :::`, error)
  })
}

wss.on('connection', async (ws, req) => {
  console.log('::: CLIENT CONNECTED :::')
  let orderBookInterval

  // send exchange and market info on initial connection
  const exchanges = await getExchangeInfoAsync()
  const initalOrderBook = await getOrderBookAsync()
  sendMessageToClient(ws, 'exchangeInfo', exchanges)
  sendMessageToClient(ws, 'orderInfo', initalOrderBook)

  orderBookInterval = setInterval(async () => {
    const orderBook = await getOrderBookAsync()
    sendMessageToClient(ws, 'orderInfo', orderBook)
  }, 10000)

  ws.on('message', async (message) => {
    const { type, data } = JSON.parse(message)

    switch (type) {
      case 'updateOrderBook':
        // should be true
        if (orderBookInterval) clearInterval(orderBookInterval)
        const { exchanges, symbol } = data

        // TODO handle bitfinex rate limit

        orderBookInterval = setInterval(async () => {
          const orderBook = await getOrderBookAsync(exchanges, symbol)
          sendMessageToClient(ws, 'orderInfo', orderBook)
        }, 10000) // per ccxt, no rate limit is lower than 3000
        break

      default:
        break
    }
  })
})

wss.on('message', (data) => {
  const message = JSON.parse(data)
  console.log('::: MESSAGE :::', message)
})

wss.on('error', (error) => {
  console.log('::: ERROR :::', error)
})

server.listen(port)
console.log(`Listening on port ${port}`)
