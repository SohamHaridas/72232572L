// src/components/HeatmapPage.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import { getStocks, getStockPrices } from '../services/api';

const HeatmapPage = ({ authToken }) => {
  const [stocks, setStocks] = useState([]);
  const [timeFrame, setTimeFrame] = useState(50);
  const [correlationMatrix, setCorrelationMatrix] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStocks = async () => {
      const data = await getStocks(authToken);
      setStocks(data);
    };
    fetchStocks();
  }, [authToken]);

  useEffect(() => {
    if (stocks.length > 0) {
      const fetchAllPricesAndCalculateCorrelation = async () => {
        // Fetch prices for all stocks
        const allPrices = {};
        for (const stock of stocks) {
          const prices = await getStockPrices(authToken, stock.ticker, timeFrame);
          allPrices[stock.ticker] = prices.map(item => item.price);
        }
        
        // Calculate correlation matrix
        const matrix = [];
        const stockStats = {};
        
        stocks.forEach((stockX) => {
          const row = [];
          const xPrices = allPrices[stockX.ticker];
          const xMean = xPrices.reduce((a, b) => a + b, 0) / xPrices.length;
          const xStdDev = Math.sqrt(
            xPrices.reduce((sq, n) => sq + Math.pow(n - xMean, 2), 0) / (xPrices.length - 1)
          );
          
          stockStats[stockX.ticker] = {
            mean: xMean,
            stdDev: xStdDev,
          };
          
          stocks.forEach((stockY) => {
            const yPrices = allPrices[stockY.ticker];
            const yMean = yPrices.reduce((a, b) => a + b, 0) / yPrices.length;
            
            // Calculate covariance
            let covariance = 0;
            for (let i = 0; i < xPrices.length; i++) {
              covariance += (xPrices[i] - xMean) * (yPrices[i] - yMean);
            }
            covariance /= (xPrices.length - 1);
            
            // Calculate standard deviations
            const yStdDev = Math.sqrt(
              yPrices.reduce((sq, n) => sq + Math.pow(n - yMean, 2), 0) / (yPrices.length - 1)
            );
            
            // Calculate correlation
            const correlation = covariance / (xStdDev * yStdDev);
            row.push(correlation);
          });
          matrix.push(row);
        });
        
        setCorrelationMatrix(matrix);
        setStats(stockStats);
      };
      
      fetchAllPricesAndCalculateCorrelation();
    }
  }, [stocks, timeFrame, authToken]);

  const handleTimeFrameChange = (event) => {
    setTimeFrame(event.target.value);
  };

  const getColor = (value) => {
    if (value >= 0.7) return '#1a9850'; // strong positive
    if (value >= 0.3) return '#91cf60'; // positive
    if (value >= -0.3) return '#ffffbf'; // neutral
    if (value >= -0.7) return '#fc8d59'; // negative
    return '#d73027'; // strong negative
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Correlation Heatmap
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Frame (minutes)</InputLabel>
          <Select
            value={timeFrame}
            onChange={handleTimeFrameChange}
            label="Time Frame (minutes)"
          >
            <MenuItem value={10}>Last 10 minutes</MenuItem>
            <MenuItem value={30}>Last 30 minutes</MenuItem>
            <MenuItem value={50}>Last 50 minutes</MenuItem>
            <MenuItem value={60}>Last 60 minutes</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Correlation Legend
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, backgroundColor: '#1a9850' }} />
          <Typography>Strong Positive (≥0.7)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, backgroundColor: '#91cf60' }} />
          <Typography>Positive (≥0.3)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, backgroundColor: '#ffffbf' }} />
          <Typography>Neutral (-0.3 to 0.3)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, backgroundColor: '#fc8d59' }} />
          <Typography>Negative (≤-0.3)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, backgroundColor: '#d73027' }} />
          <Typography>Strong Negative (≤-0.7)</Typography>
        </Box>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Stock</TableCell>
              {stocks.map((stock) => (
                <TableCell key={stock.ticker} align="center">
                  <Tooltip 
                    title={`Avg: $${stats[stock.ticker]?.mean?.toFixed(2) || 0}\nStd Dev: $${stats[stock.ticker]?.stdDev?.toFixed(2) || 0}`}
                    arrow
                  >
                    <span>{stock.ticker}</span>
                  </Tooltip>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {stocks.map((stockX, i) => (
              <TableRow key={stockX.ticker}>
                <TableCell component="th" scope="row">
                  <Tooltip 
                    title={`Avg: $${stats[stockX.ticker]?.mean?.toFixed(2) || 0}\nStd Dev: $${stats[stockX.ticker]?.stdDev?.toFixed(2) || 0}`}
                    arrow
                  >
                    <span>{stockX.ticker}</span>
                  </Tooltip>
                </TableCell>
                {stocks.map((stockY, j) => (
                  <TableCell 
                    key={`${stockX.ticker}-${stockY.ticker}`}
                    align="center"
                    sx={{ 
                      backgroundColor: getColor(correlationMatrix[i]?.[j] || 0),
                      '&:hover': { opacity: 0.8 },
                    }}
                  >
                    <Tooltip title={`Correlation between ${stockX.ticker} and ${stockY.ticker}`} arrow>
                      <span>{(correlationMatrix[i]?.[j] || 0).toFixed(2)}</span>
                    </Tooltip>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HeatmapPage;