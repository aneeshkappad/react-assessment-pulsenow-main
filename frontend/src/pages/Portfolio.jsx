import { usePortfolio, useAssets } from '../contexts/AppContext'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { TrendingUp, TrendingDown, Wallet, DollarSign, BarChart3, Package } from 'lucide-react'

const Portfolio = () => {
  const { portfolioData, portfolioLoading: loading, portfolioError: error } = usePortfolio()
  const { assetNames } = useAssets()

  // Calculate total invested
  const calculateTotalInvested = () => {
    if (!portfolioData?.assets) return 0
    return portfolioData.assets.reduce((total, asset) => {
      return total + (asset.avgBuyPrice * asset.quantity)
    }, 0)
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  // Format percentage
  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  // Prepare data for pie chart
  const prepareChartData = () => {
    if (!portfolioData?.assets) return []
    
    const colors = [
      '#3b82f6', // blue-500
      '#10b981', // green-500
      '#f59e0b', // amber-500
      '#ef4444', // red-500
      '#8b5cf6', // violet-500
      '#ec4899', // pink-500
      '#06b6d4', // cyan-500
      '#f97316', // orange-500
    ]
    
    return portfolioData.assets.map((asset, index) => ({
      name: assetNames[asset.assetId] || asset.assetId,
      symbol: asset.assetId,
      value: asset.value,
      percentage: ((asset.value / portfolioData.totalValue) * 100).toFixed(1),
      color: colors[index % colors.length]
    }))
  }

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900 mb-1">{data.name}</p>
          <p className="text-sm text-gray-600 mb-1">{data.payload.symbol}</p>
          <p className="text-base font-bold text-gray-900">
            {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-gray-500">
            {data.payload.percentage}% of portfolio
          </p>
        </div>
      )
    }
    return null
  }

  // Custom label for pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    // Only show label if percentage is > 5%
    if (percent < 0.05) return null

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading portfolio data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <span className="text-red-600 text-xl mr-3">⚠️</span>
          <div>
            <h3 className="text-red-800 font-semibold">Error Loading Portfolio</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!portfolioData) {
    return null
  }

  const totalInvested = calculateTotalInvested()
  const totalProfitLoss = portfolioData.totalValue - totalInvested
  const totalProfitLossPercent = totalInvested > 0 
    ? ((totalProfitLoss / totalInvested) * 100) 
    : 0
  const isPositive = totalProfitLoss >= 0
  const chartData = prepareChartData()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 animate-fade-in-down">
        <Wallet className="w-8 h-8 text-gray-700 transition-transform duration-300 hover:scale-110" />
        Portfolio
      </h1>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Value */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-label">Total Value</p>
            <DollarSign className="w-5 h-5 text-gray-400 transition-transform duration-300 hover:scale-110" />
          </div>
          <p className="text-2xl text-price text-gray-900 animate-count-up">
            {formatCurrency(portfolioData.totalValue)}
          </p>
        </div>

        {/* Total Invested */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-label">Total Invested</p>
            <BarChart3 className="w-5 h-5 text-gray-400 transition-transform duration-300 hover:scale-110" />
          </div>
          <p className="text-2xl text-price text-gray-900 animate-count-up">
            {formatCurrency(totalInvested)}
          </p>
        </div>

        {/* Total Profit/Loss */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-label">Total P/L</p>
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </div>
          <p className={`text-2xl text-price animate-count-up ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{formatCurrency(totalProfitLoss)}
          </p>
          <p className={`text-sm mt-1 text-percentage animate-count-up ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(totalProfitLossPercent)}
          </p>
        </div>

        {/* Number of Assets */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-label">Assets</p>
            <Package className="w-5 h-5 text-gray-400 transition-transform duration-300 hover:scale-110" />
          </div>
          <p className="text-2xl font-bold font-number text-gray-900 animate-count-up">
            {portfolioData.assets?.length || 0}
          </p>
        </div>
      </div>

      {/* Chart and Holdings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Allocation Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg animate-fade-in-up" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
          <h2 className="text-heading text-lg mb-4">Portfolio Allocation</h2>
          {chartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry) => (
                      <span style={{ color: entry.color, fontSize: '12px' }}>
                        {value} ({entry.payload.percentage}%)
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No assets in portfolio
            </div>
          )}
        </div>

        {/* Holdings Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg animate-fade-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-heading text-lg">Holdings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P/L
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {portfolioData.assets && portfolioData.assets.length > 0 ? (
                  portfolioData.assets.map((asset) => {
                    const isPositive = asset.change >= 0
                    const assetName = assetNames[asset.assetId] || asset.assetId
                    
                    return (
                      <tr key={asset.assetId} className="hover:bg-gray-50 transition-all duration-200 hover:shadow-sm animate-fade-in-up" style={{ animationDelay: `${0.05 * (portfolioData.assets.indexOf(asset) % 20)}s`, animationFillMode: 'both' }}>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {asset.assetId}
                            </div>
                            <div className="text-xs text-gray-500">{assetName}</div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {asset.quantity.toLocaleString(undefined, {
                            minimumFractionDigits: asset.quantity % 1 !== 0 ? 4 : 0,
                            maximumFractionDigits: 4
                          })}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          <div className="font-number">{formatCurrency(asset.currentPrice)}</div>
                          <div className="text-xs text-gray-500 font-number">
                            Avg: {formatCurrency(asset.avgBuyPrice)}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm text-price text-gray-900">
                          {formatCurrency(asset.value)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-sm text-price ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}{formatCurrency(asset.change)}
                          </div>
                          <div className={`text-xs text-percentage ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercentage(asset.changePercent)}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No holdings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Additional Portfolio Stats */}
      {portfolioData.assets && portfolioData.assets.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg animate-fade-in-up" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
          <h2 className="text-heading text-lg mb-4">Portfolio Performance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Overall Change</p>
              <p className={`text-xl text-percentage ${portfolioData.totalChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(portfolioData.totalChangePercent)}
              </p>
              <p className={`text-sm mt-1 text-price ${portfolioData.totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {portfolioData.totalChange >= 0 ? '+' : ''}{formatCurrency(portfolioData.totalChange)}
              </p>
            </div>
            <div>
                    <p className="text-label mb-1">Best Performer</p>
              {portfolioData.assets.length > 0 && (() => {
                const best = portfolioData.assets.reduce((best, asset) => 
                  asset.changePercent > best.changePercent ? asset : best
                )
                return (
                  <>
                    <p className="text-xl font-semibold text-gray-900">{best.assetId}</p>
                    <p className="text-sm text-percentage text-green-600 mt-1">
                      {formatPercentage(best.changePercent)}
                    </p>
                  </>
                )
              })()}
            </div>
            <div>
              <p className="text-label mb-1">Worst Performer</p>
              {portfolioData.assets.length > 0 && (() => {
                const worst = portfolioData.assets.reduce((worst, asset) => 
                  asset.changePercent < worst.changePercent ? asset : worst
                )
                return (
                  <>
                    <p className="text-xl font-semibold text-gray-900">{worst.assetId}</p>
                    <p className="text-sm text-percentage text-red-600 mt-1">
                      {formatPercentage(worst.changePercent)}
                    </p>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Portfolio
