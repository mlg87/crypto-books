import io from 'socket.io-client'
const socket = io('http://localhost:5000')

const subscribeToMarketUpdates = (exchanges, symbol, cb) => {
  // TODO improve error handling
  socket.on('marketUpdate', (marketData) => cb(null, marketData))
  socket.emit('subscribeToMarketUpdates', exchanges, symbol)
}

const subscribeToExchangeInfo = (cb) => {
  socket.on('exchangeInfo', (exchanges) => cb(null, exchanges))
  socket.emit('subscribeToExchangeInfo')
}

export { subscribeToMarketUpdates, subscribeToExchangeInfo }
