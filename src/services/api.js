const API_BASE_URL = 'http://20.244.56.144/evaluation-service'
let authToken = ''

export const setAuthToken = (token) => {
  authToken = token
}

export const getAuthToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientID: 'd9cb6699-6a27-44a5-8d59-8b1befa816da',
        clientSecret: 'tVJaaaRBSeXCRXeM'
      })
    })
    const data = await response.json()
    setAuthToken(data.access_token)
    return data.access_token
  } catch (error) {
    console.error('Error fetching auth token:', error)
    return ''
  }
}

export const getStocks = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    const data = await response.json()
    return Object.entries(data.stocks).map(([name, ticker]) => ({ name, ticker }))
  } catch (error) {
    console.error('Error fetching stocks:', error)
    return []
  }
}

export const getStockPrices = async (ticker, minutes = 50) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/stocks/${ticker}?minutes=${minutes}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    )
    return await response.json()
  } catch (error) {
    console.error('Error fetching stock prices:', error)
    return []
  }
}