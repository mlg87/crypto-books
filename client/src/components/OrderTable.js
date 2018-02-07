import React, { Component } from 'react'
import PropTypes from 'prop-types'
// mui
import CircularProgress from 'material-ui/Progress/CircularProgress'
import Typography from 'material-ui/Typography'
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from 'material-ui/Table'
import green from 'material-ui/colors/green'
// lodash
import upperFirst from 'lodash/upperFirst'

export default class OrderTable extends Component {
  static propTypes = {
    currentMarket: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    denseCells: PropTypes.bool,
    showTitle: PropTypes.bool,
    isUpdatingTable: PropTypes.bool,
    pointOfComparison: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired
  }

  static defaultProps = {
    denseCells: false,
    showTitle: false,
    isUpdatingTable: true
  }

  isOverlapped(price) {
    const { pointOfComparison, type } = this.props
    const actions = {
      asks: () => price < pointOfComparison,
      bids: () => price > pointOfComparison
    }
    return actions[type] ? actions[type]() : false
  }

  render() {
    const {
      currentMarket,
      data,
      denseCells,
      showTitle,
      isUpdatingTable,
      type
    } = this.props

    return (
      <div>
        {showTitle && (
          <Typography align="center" gutterBottom type="display1">
            {upperFirst(type)}
          </Typography>
        )}
        {isUpdatingTable ? (
          <div style={styles.loading.container}>
            <CircularProgress style={styles.loading.indicator} />
          </div>
        ) : (
          <div style={styles.table.container}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding={denseCells ? 'dense' : 'default'}>
                    Exchange
                  </TableCell>
                  <TableCell
                    numeric
                    padding={denseCells ? 'dense' : 'default'}
                  >{`Price (${currentMarket})`}</TableCell>
                  <TableCell numeric padding={denseCells ? 'dense' : 'default'}>
                    Amount
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((order, i) => {
                  const { amount, exchange, price } = order
                  return (
                    <TableRow
                      key={`title${i}`}
                      style={
                        this.isOverlapped(price) ? styles.table.overlap : null
                      }
                    >
                      <TableCell padding={denseCells ? 'dense' : 'default'}>
                        {upperFirst(exchange)}
                      </TableCell>
                      <TableCell
                        numeric
                        padding={denseCells ? 'dense' : 'default'}
                      >
                        {price}
                      </TableCell>
                      <TableCell
                        numeric
                        padding={denseCells ? 'dense' : 'default'}
                      >
                        {amount}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    )
  }
}

const styles = {
  table: {
    container: {
      maxHeight: '800px',
      overflow: 'scroll'
    },
    overlap: {
      backgroundColor: green[500]
    }
  },
  loading: {
    container: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '40px'
    },
    indicator: {
      color: '#fff'
    }
  }
}
