import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Navbar from './components/Navbar'
import StockPage from './components/StockPage'
import HeatmapPage from './components/HeatmapPage'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<StockPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/heatmap" element={<HeatmapPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App