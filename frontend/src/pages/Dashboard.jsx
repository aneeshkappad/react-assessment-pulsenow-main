import { useDashboard, usePortfolio } from '../contexts/AppContext'
import { TrendingUp, TrendingDown, Bell, Newspaper, Loader2, AlertCircle, RefreshCw, Clock, LayoutDashboard } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const Dashboard = () => {
  const {
    dashboardData,
    dashboardLoading: loading,
    dashboardError: error,
    dashboardRefreshing: refreshing,
    dashboardLastUpdated: lastUpdated,
    fetchDashboard
  } = useDashboard()

  const { portfolioData } = usePortfolio()

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchDashboard(true)
  }

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never'
    
    const now = new Date()
    const diffInSeconds = Math.floor((now - lastUpdated) / 1000)
    
    if (diffInSeconds < 10) return 'Just now'
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    
    return lastUpdated.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // Format currency with proper formatting
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  // Format percentage with proper formatting
  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  // Get severity badge color
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-600 text-white'
      case 'high':
        return 'bg-orange-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-white'
      case 'low':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  // Get category badge color
  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'macro':
        return 'bg-purple-100 text-purple-800'
      case 'technology':
        return 'bg-blue-100 text-blue-800'
      case 'crypto':
        return 'bg-yellow-100 text-yellow-800'
      case 'earnings':
        return 'bg-green-100 text-green-800'
      case 'regulatory':
        return 'bg-red-100 text-red-800'
      case 'market':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse-slow"></div>
        
        {/* Portfolio Summary Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-fade-in-up">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse-slow"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse-slow"></div>
                <div className="h-8 bg-gray-200 rounded w-32 animate-pulse-slow"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Gainers/Losers Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse-slow"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-20 bg-gray-100 rounded-lg animate-pulse-slow" style={{ animationDelay: `${j * 0.1}s` }}></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* News Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse-slow"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse-slow" style={{ animationDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state with retry button
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md w-full">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="text-red-600 w-12 h-12 mb-4" />
            <h3 className="text-red-800 font-semibold text-lg mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => fetchDashboard(false)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-all duration-200 transform hover:scale-105 active:scale-95 font-medium shadow-md hover:shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData || !portfolioData) {
    return null
  }

  const topGainers = dashboardData.topGainers?.slice(0, 3) || []
  const topLosers = dashboardData.topLosers?.slice(0, 3) || []
  const recentNews = dashboardData.recentNews?.slice(0, 5) || []
  const activeAlerts = dashboardData.activeAlerts?.slice(0, 5) || []

  const isPositive = portfolioData.totalChange >= 0

  // Generate portfolio value history for the last 30 days
  const generatePortfolioHistory = () => {
    const days = 30
    const history = []
    const currentValue = portfolioData.totalValue
    const changePercent = portfolioData.totalChangePercent
    
    // Calculate starting value based on current change
    const startingValue = currentValue / (1 + changePercent / 100)
    
    // Generate data points
    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      // Calculate value for this day with some realistic variation
      const progress = (days - i) / days
      const baseValue = startingValue + (currentValue - startingValue) * progress
      
      // Add some random variation (±2%)
      const variation = (Math.random() - 0.5) * 0.04
      const value = baseValue * (1 + variation)
      
      history.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.round(value * 100) / 100,
        fullDate: date.toISOString()
      })
    }
    
    return history
  }

  const portfolioHistory = generatePortfolioHistory()
  const chartColor = isPositive ? '#10b981' : '#ef4444' // green-500 or red-500

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600 mb-1">{payload[0].payload.date}</p>
          <p className="text-base font-semibold" style={{ color: chartColor }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Refresh Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-down">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <LayoutDashboard className="w-8 h-8 text-gray-700 transition-transform duration-300 hover:scale-110" />
          Dashboard
        </h1>
        
        <div className="flex items-center gap-4">
          {/* Refresh Indicator */}
          {refreshing && (
            <div className="flex items-center gap-2 text-sm text-gray-600 animate-fade-in">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="hidden sm:inline">Refreshing...</span>
            </div>
          )}
          
          {/* Last Updated Timestamp */}
          {lastUpdated && !refreshing && (
            <div className="flex items-center gap-2 text-sm text-gray-500 animate-fade-in">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Updated</span>
              <span>{formatLastUpdated()}</span>
            </div>
          )}
          
          {/* Manual Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 transform hover:scale-105 active:scale-95 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 transition-transform duration-200 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Portfolio Summary Card */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] animate-fade-in-up">
        <h2 className="text-heading text-lg mb-4">Portfolio Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <p className="text-label mb-1">Total Value</p>
            <p className="text-2xl text-price text-gray-900 animate-count-up">
              {formatCurrency(portfolioData.totalValue)}
            </p>
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <p className="text-label mb-1">Total Change</p>
            <p className={`text-2xl text-price animate-count-up ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{formatCurrency(portfolioData.totalChange)}
            </p>
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            <p className="text-label mb-1">Change Percentage</p>
            <p className={`text-2xl text-percentage animate-count-up ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(portfolioData.totalChangePercent)}
            </p>
          </div>
        </div>
      </div>

      {/* Portfolio Performance Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
        <h2 className="text-heading text-lg mb-4 flex items-center">
          <TrendingUp className="mr-2 w-5 h-5 text-gray-700" />
          Portfolio Performance (Last 30 Days)
        </h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={portfolioHistory} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={chartColor}
                strokeWidth={2}
                dot={{ fill: chartColor, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColor }}></div>
            <span>Portfolio Value</span>
          </div>
          <span className="text-gray-400">•</span>
          <span>
            {isPositive ? 'Trending Up' : 'Trending Down'} ({formatPercentage(portfolioData.totalChangePercent)})
          </span>
        </div>
      </div>

      {/* Top Gainers & Losers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <h2 className="text-heading text-lg mb-4 flex items-center">
            <TrendingUp className="text-green-600 mr-2 w-5 h-5" />
            Top Gainers
          </h2>
          {topGainers.length > 0 ? (
            <div className="space-y-3">
              {topGainers.map((asset, index) => (
                <div 
                  key={asset.symbol || index} 
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${0.4 + index * 0.1}s`, animationFillMode: 'both' }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{asset.symbol}</span>
                      <span className="text-sm text-gray-600">{asset.name}</span>
                    </div>
                    <div className="mt-1 text-sm text-body">
                      <span className="font-number">{formatCurrency(asset.price || asset.currentPrice)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg text-percentage text-green-600">
                      {formatPercentage(asset.changePercent)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No gainers data available</p>
          )}
        </div>

        {/* Top Losers */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
          <h2 className="text-heading text-lg mb-4 flex items-center">
            <TrendingDown className="text-red-600 mr-2 w-5 h-5" />
            Top Losers
          </h2>
          {topLosers.length > 0 ? (
            <div className="space-y-3">
              {topLosers.map((asset, index) => (
                <div 
                  key={asset.symbol || index} 
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200 transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${0.5 + index * 0.1}s`, animationFillMode: 'both' }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{asset.symbol}</span>
                      <span className="text-sm text-gray-600">{asset.name}</span>
                    </div>
                    <div className="mt-1 text-sm text-body">
                      <span className="font-number">{formatCurrency(asset.price || asset.currentPrice)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg text-percentage text-red-600">
                      {formatPercentage(asset.changePercent)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No losers data available</p>
          )}
        </div>
      </div>

      {/* Recent News Feed */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg animate-fade-in-up" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
        <h2 className="text-heading text-lg mb-4 flex items-center">
          <Newspaper className="mr-2 w-5 h-5 text-gray-700" />
          Recent News
        </h2>
        {recentNews.length > 0 ? (
          <div className="space-y-4">
            {recentNews.map((news, index) => (
              <div 
                key={news.id || index} 
                className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0 transition-all duration-200 hover:bg-gray-50 rounded-lg px-2 py-1 -mx-2 -my-1 animate-fade-in-up"
                style={{ animationDelay: `${0.6 + index * 0.1}s`, animationFillMode: 'both' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-semibold text-gray-900 flex-1 pr-4">
                    {news.title}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(news.category)}`}>
                    {news.category}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                  <span>{news.source}</span>
                  <span>•</span>
                  <span>{formatTimestamp(news.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No news available</p>
        )}
      </div>

      {/* Active Alerts Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg animate-fade-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
        <h2 className="text-heading text-lg mb-4 flex items-center">
          <Bell className="mr-2 w-5 h-5 text-gray-700" />
          Active Alerts
        </h2>
        {activeAlerts.length > 0 ? (
          <div className="space-y-3">
            {activeAlerts.map((alert, index) => (
              <div 
                key={alert.id || index} 
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md hover:scale-[1.01] animate-fade-in-up"
                style={{ animationDelay: `${0.7 + index * 0.1}s`, animationFillMode: 'both' }}
              >
                <span className={`px-3 py-1 rounded text-xs font-semibold ${getSeverityColor(alert.severity)}`}>
                  {alert.severity?.toUpperCase() || 'UNKNOWN'}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-medium">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatTimestamp(alert.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No active alerts</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard
