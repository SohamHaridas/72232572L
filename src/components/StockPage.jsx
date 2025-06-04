import React, { useState, useEffect } from 'react'
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Paper, CircularProgress } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getStocks, getStockPrices, getAuthToken } from '../services/api'

const StockPage = () => {
  const [stocks, setStocks] = useState([])
  const [selectedStock, setSelectedStock] = useState('')
  const [timeFrame, setTimeFrame] = useState(50)
  const [priceData, setPriceData] = useState([])
  const [averagePrice, setAveragePrice] = useState(0)
  const [loading, setLoading] = useState(true)
 
  useEffect(() => {
    const initialize = async () => {
      await getAuthToken()
      const stockList = await getStocks()
      setStocks(stockList)
      if (stockList.length > 0) {
        setSelectedStock(stockList[0].ticker)
      }
      setLoading(false)
    }
    initialize()
  }, [])

  useEffect(() => {
    if (selectedStock) {
      const fetchData = async () => {
        setLoading(true)
        const data = await getStockPrices(selectedStock, timeFrame)
        setPriceData(data)
        if (data.length > 0) {
          setAveragePrice(data.reduce((sum, item) => sum + item.price, 0) / data.length)
        }
        setLoading(false)
      }
      fetchData()
    }
  }, [selectedStock, timeFrame])

  const formatTime = (timeStr) => {
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Stock Price Analysis</Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Select Stock</InputLabel>
          <Select
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
            disabled={loading}
          >
            {stocks.map((stock) => (
              <MenuItem key={stock.ticker} value={stock.ticker}>
                {stock.name} ({stock.ticker})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Frame</InputLabel>
          <Select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            disabled={loading}
          >
            {[10, 30, 50, 60].map((minutes) => (
              <MenuItem key={minutes} value={minutes}>Last {minutes} minutes</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">Average Price: ${averagePrice.toFixed(2)}</Typography>
          </Paper>
          
          <Box sx={{ height: '500px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="lastUpdatedAt" tickFormatter={formatTime} />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                  labelFormatter={formatTime}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey={() => averagePrice}
                  stroke="#82ca9d"
                  strokeDasharray="5 5"
                  name="Average"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </>
      )}
    </Box>
  )
}

export default StockPage