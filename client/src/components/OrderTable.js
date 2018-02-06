import React, { Component } from 'react'
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

export class OrderTable extends Component {
  isOverlapped(price) {
    const { pointOfComparison, type } = this.props
    const actions = {
      asks: () => price < pointOfComparison,
      bids: () => price > pointOfComparison
    }
    return actions[type] ? actions[type]() : false
  }

  render() {
    const { currentMarket, data, isUpdatingTable, type } = this.props

    return (
      <div>
        <Typography align="center" gutterBottom type="display1">
          {upperFirst(type)}
        </Typography>
        {isUpdatingTable ? (
          <div style={styles.loading.container}>
            <CircularProgress style={styles.loading.indicator} />
          </div>
        ) : (
          <div style={styles.table.container}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Exchange</TableCell>
                  <TableCell numeric>{`Price (${currentMarket})`}</TableCell>
                  <TableCell numeric>Amount</TableCell>
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
                      <TableCell>{upperFirst(exchange)}</TableCell>
                      <TableCell numeric>{price}</TableCell>
                      <TableCell numeric>{amount}</TableCell>
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
      alignItems: 'center'
    },
    indicator: {
      color: '#fff'
    }
  }
}
