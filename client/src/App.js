import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'

class App extends Component {
  state = {
    msg: null
  }

  componentDidMount() {
    this.getMarkets()
  }

  getMarkets = async () => {
    const res = await fetch('/api/markets/bittrex')
    const body = await res.json()
    console.log('body', body)
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">Coming soon: Something useful!</p>
      </div>
    )
  }
}

export default App
