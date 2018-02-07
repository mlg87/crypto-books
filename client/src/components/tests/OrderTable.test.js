import React from 'react'
import { shallow } from 'enzyme'
import renderer from 'react-test-renderer'
import OrderTable from '../OrderTable'

const props = {
  currentMarket: 'ETH/BTC',
  data: [1, 2, 3],
  pointOfComparison: 1,
  type: 'bid'
}

describe('OrderTable', () => {
  test('renders correctly', () => {
    const tree = renderer.create(<OrderTable {...props} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
