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
// lodash
import upperFirst from 'lodash/upperFirst'

export class OrderTable extends Component {
  render() {
    const { currentMarket, data, isUpdatingTable, title } = this.props

    return (
      <div>
        <Typography align="center" gutterBottom type="display1">
          {title}
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
                    <TableRow key={`title${i}`}>
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
