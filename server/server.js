const express = require('express')
const ccxt = require('ccxt')
// lodash
const includes = require('lodash').includes
const intersection = require('lodash').intersection
const sortBy = require('lodash').sortBy

const app = express()
const port = process.env.PORT || 5000

const validateExchangeNames = (req, res, next) => {
  const { exchanges } = req.query

  const hasValidExchanges = () => {
    return exchanges.every((exchange) => includes(ccxt.exchanges, exchange))
  }

  if (!exchanges || !exchanges.length) {
    res.send({ error: 'Must provide at least one exchange name' })
  } else if (!hasValidExchanges()) {
    res.send({ error: 'Invalid exchange name(s) provided' })
  } else {
    next()
  }
}

// make sure to only return symbols shared by all exchanges
const scrubSymbols = (sharedSymbols, symbols) => {
  if (!sharedSymbols.length) {
    return [...symbols]
  } else {
    return intersection(sharedSymbols, symbols)
  }
}

const combineOrders = (orders) => {
  let combinedOrders = []
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

app.get(
  '/api/markets/order-books?:exchanges?:symbol',
  validateExchangeNames,
  async (req, res) => {
    const { exchanges, symbol } = req.query

    try {
      const asks = {}
      const bids = {}
      let sharedSymbols = []

      await Promise.all(
        exchanges.map(async (exchangeName) => {
          let exchange = new ccxt[exchangeName]()
          await exchange.loadMarkets()
          const { id, symbols } = exchange
          const symbolIndex = symbols.indexOf(symbol)
          sharedSymbols = [...scrubSymbols(sharedSymbols, symbols)]
          // fetchOrderBooks return 2d arrays for bid and ask
          // e.g. 'ETH/USDT' returns asks: [ [ price, amount ] ]
          const orderBook = await exchange.fetchOrderBook(
            exchange.symbols[symbolIndex]
          )
          asks[id] = orderBook.asks
          bids[id] = orderBook.bids
        })
      )
      res.send({
        asks: combineOrders(asks),
        bids: combineOrders(bids),
        symbols: sharedSymbols
      })
    } catch (error) {
      console.error('ERROR:::', error)
      res.send({ error: error })
    }
  }
)

app.listen(port, () => console.log(`Listening on port ${port}`))
