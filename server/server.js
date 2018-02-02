const express = require('express')
const ccxt = require('ccxt')
const includes = require('lodash').includes

const app = express()
const port = process.env.PORT || 5000

const hasValidExchange = (req, res, next) => {
  const { exchange_name } = req.params

  if (!exchange_name) {
    res.send({ error: 'Must provide exchange name' })
  } else if (!includes(ccxt.exchanges, exchange_name)) {
    res.send({ error: `${exchange_name} is not a valid exchange name` })
  } else {
    next()
  }
}

app.get('/api/markets/:exchange_name', hasValidExchange, async (req, res) => {
  const { exchange_name } = req.params

  try {
    const xchg = new ccxt[exchange_name]()
    await xchg.loadMarkets()
    res.send({ exchange_name: xchg.id, exchange_order_books: xchg })
  } catch (error) {
    res.send({ error })
  }
})

app.listen(port, () => console.log(`Listening on port ${port}`))
