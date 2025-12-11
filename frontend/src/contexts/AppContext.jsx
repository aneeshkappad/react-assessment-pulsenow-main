import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { getDashboard, getPortfolio, getStocks, getCrypto, getNews } from '../services/api'

const AppContext = createContext(undefined)

export const AppProvider = ({ children }) => {
  // Portfolio State
  const [portfolioData, setPortfolioData] = useState(null)
  const [portfolioLoading, setPortfolioLoading] = useState(true)
  const [portfolioError, setPortfolioError] = useState(null)

  // Dashboard State
  const [dashboardData, setDashboardData] = useState(null)
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState(null)
  const [dashboardRefreshing, setDashboardRefreshing] = useState(false)
  const [dashboardLastUpdated, setDashboardLastUpdated] = useState(null)

  // Assets State
  const [assetsData, setAssetsData] = useState([])
  const [assetsLoading, setAssetsLoading] = useState(true)
  const [assetsError, setAssetsError] = useState(null)
  const [assetNames, setAssetNames] = useState({})

  // News State
  const [newsData, setNewsData] = useState([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [newsError, setNewsError] = useState(null)

  // Refs for polling
  const dashboardIntervalRef = useRef(null)
  const isPageVisibleRef = useRef(true)

  // Fetch Portfolio Data
  const fetchPortfolio = useCallback(async () => {
    try {
      setPortfolioLoading(true)
      setPortfolioError(null)
      
      const response = await getPortfolio()
      setPortfolioData(response.data.data)
    } catch (err) {
      console.error('Error fetching portfolio:', err)
      setPortfolioError('Failed to load portfolio data.')
    } finally {
      setPortfolioLoading(false)
    }
  }, [])

  // Fetch Dashboard Data
  const fetchDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setDashboardLoading(true)
      } else {
        setDashboardRefreshing(true)
      }
      setDashboardError(null)
      
      const response = await getDashboard()
      setDashboardData(response.data.data)
      setDashboardLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching dashboard:', err)
      setDashboardError('Failed to load dashboard data.')
    } finally {
      setDashboardLoading(false)
      setDashboardRefreshing(false)
    }
  }, [])

  // Fetch Assets Data
  const fetchAssets = useCallback(async () => {
    try {
      setAssetsLoading(true)
      setAssetsError(null)
      
      const [stocksResponse, cryptoResponse] = await Promise.all([
        getStocks(),
        getCrypto()
      ])
      
      // Handle both wrapped and direct responses
      const stocks = Array.isArray(stocksResponse.data) 
        ? stocksResponse.data 
        : stocksResponse.data?.data || []
      const crypto = Array.isArray(cryptoResponse.data) 
        ? cryptoResponse.data 
        : cryptoResponse.data?.data || []
      
      // Build asset names map
      const namesMap = {}
      stocks.forEach(stock => {
        namesMap[stock.symbol] = stock.name
      })
      crypto.forEach(c => {
        namesMap[c.symbol] = c.name
      })
      setAssetNames(namesMap)
      
      // Combine both arrays and add type identifier
      const combinedAssets = [
        ...stocks.map(stock => ({ ...stock, assetType: 'stock' })),
        ...crypto.map(crypto => ({ ...crypto, assetType: 'crypto' }))
      ]
      
      setAssetsData(combinedAssets)
    } catch (err) {
      console.error('Error fetching assets:', err)
      setAssetsError('Failed to load assets data.')
    } finally {
      setAssetsLoading(false)
    }
  }, [])

  // Fetch News Data
  const fetchNews = useCallback(async () => {
    try {
      setNewsLoading(true)
      setNewsError(null)
      
      const response = await getNews()
      const newsData = Array.isArray(response.data?.data) 
        ? response.data.data 
        : Array.isArray(response.data) 
        ? response.data 
        : []
      
      // Sort by timestamp (most recent first)
      const sortedNews = newsData.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )
      
      setNewsData(sortedNews)
    } catch (err) {
      console.error('Error fetching news:', err)
      setNewsError('Failed to load news data.')
    } finally {
      setNewsLoading(false)
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchPortfolio()
    fetchDashboard(false)
    fetchAssets()
    fetchNews()
  }, [fetchPortfolio, fetchDashboard, fetchAssets, fetchNews])

  // Dashboard auto-refresh with Page Visibility API
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisibleRef.current = !document.hidden
      
      if (document.hidden) {
        // Pause polling when tab is hidden
        if (dashboardIntervalRef.current) {
          clearInterval(dashboardIntervalRef.current)
          dashboardIntervalRef.current = null
        }
      } else {
        // Resume polling when tab becomes visible
        fetchDashboard(true)
        
        // Set up interval again
        if (!dashboardIntervalRef.current) {
          dashboardIntervalRef.current = setInterval(() => {
            if (isPageVisibleRef.current) {
              fetchDashboard(true)
            }
          }, 30000) // 30 seconds
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchDashboard])

  // Set up dashboard polling interval
  useEffect(() => {
    if (!dashboardLoading && isPageVisibleRef.current) {
      dashboardIntervalRef.current = setInterval(() => {
        if (isPageVisibleRef.current) {
          fetchDashboard(true)
        }
      }, 30000) // 30 seconds
    }

    return () => {
      if (dashboardIntervalRef.current) {
        clearInterval(dashboardIntervalRef.current)
        dashboardIntervalRef.current = null
      }
    }
  }, [dashboardLoading, fetchDashboard])

  const value = {
    // Portfolio
    portfolioData,
    portfolioLoading,
    portfolioError,
    fetchPortfolio,
    
    // Dashboard
    dashboardData,
    dashboardLoading,
    dashboardError,
    dashboardRefreshing,
    dashboardLastUpdated,
    fetchDashboard,
    
    // Assets
    assetsData,
    assetsLoading,
    assetsError,
    assetNames,
    fetchAssets,
    
    // News
    newsData,
    newsLoading,
    newsError,
    fetchNews,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Custom Hooks
export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const usePortfolio = () => {
  const { portfolioData, portfolioLoading, portfolioError, fetchPortfolio } = useApp()
  return { portfolioData, portfolioLoading, portfolioError, fetchPortfolio }
}

export const useDashboard = () => {
  const { 
    dashboardData, 
    dashboardLoading, 
    dashboardError, 
    dashboardRefreshing,
    dashboardLastUpdated,
    fetchDashboard 
  } = useApp()
  return { 
    dashboardData, 
    dashboardLoading, 
    dashboardError, 
    dashboardRefreshing,
    dashboardLastUpdated,
    fetchDashboard 
  }
}

export const useAssets = () => {
  const { assetsData, assetsLoading, assetsError, assetNames, fetchAssets } = useApp()
  return { assetsData, assetsLoading, assetsError, assetNames, fetchAssets }
}

export const useNews = () => {
  const { newsData, newsLoading, newsError, fetchNews } = useApp()
  return { newsData, newsLoading, newsError, fetchNews }
}

export default AppContext

