import React from 'react'
import { shallow } from 'enzyme'
import renderer from 'react-test-renderer'
import OrderBook from '../OrderBook'
import { WebSocket } from 'mock-socket'

global.WebSocket = WebSocket

describe('OrderBook', () => {
  test('renders correctly', () => {
    const tree = renderer.create(<OrderBook />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
