import { useEffect, useState } from 'react'
import { useAssets } from '../contexts/AppContext'
import { Search, ArrowUpDown, ArrowUp, ArrowDown, X, Coins } from 'lucide-react'

const Assets = () => {
  const { assetsData, assetsLoading: loading, assetsError: error, assetNames } = useAssets()
  const [filteredAssets, setFilteredAssets] = useState([])
  const [filter, setFilter] = useState('all') // 'all', 'stocks', 'crypto'
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [selectedAsset, setSelectedAsset] = useState(null)

  // Filter and search assets
  useEffect(() => {
    let filtered = [...assetsData]

    // Apply type filter
    if (filter === 'stocks') {
      filtered = filtered.filter(asset => asset.assetType === 'stock')
    } else if (filter === 'crypto') {
      filtered = filtered.filter(asset => asset.assetType === 'crypto')
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(asset => 
        asset.symbol?.toLowerCase().includes(query) ||
        asset.name?.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField]
        let bValue = b[sortField]

        // Handle nested properties
        if (sortField === 'price') {
          aValue = a.currentPrice || a.price
          bValue = b.currentPrice || b.price
        }

        // Handle numeric values
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
        }

        // Handle string values
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }

        return 0
      })
    }

    setFilteredAssets(filtered)
  }, [filter, searchQuery, sortField, sortDirection, assetsData])

  // Handle column sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new field with ascending direction
      setSortField(field)
      setSortDirection('asc')
    }
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

  // Format volume (large numbers)
  const formatVolume = (value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)}B`
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`
    }
    return value.toLocaleString()
  }

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading assets data...</p>
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
            <h3 className="text-red-800 font-semibold">Error Loading Assets</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-down">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Coins className="w-8 h-8 text-gray-700 transition-transform duration-300 hover:scale-110" />
          Assets
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 sm:max-w-xs animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search by symbol or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 focus:shadow-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm transform hover:scale-105 active:scale-95 ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-sm'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('stocks')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm transform hover:scale-105 active:scale-95 ${
                filter === 'stocks'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-sm'
              }`}
            >
              Stocks
            </button>
            <button
              onClick={() => setFilter('crypto')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm transform hover:scale-105 active:scale-95 ${
                filter === 'crypto'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-sm'
              }`}
            >
              Crypto
            </button>
          </div>
        </div>
      </div>

      {/* Assets Table - Responsive */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-4 sm:px-6 py-3 text-left text-label cursor-pointer hover:bg-gray-100 transition-all duration-200 active:bg-gray-200"
                  onClick={() => handleSort('symbol')}
                >
                  <div className="flex items-center gap-2">
                    Symbol
                    {getSortIcon('symbol')}
                  </div>
                </th>
                <th 
                  className="px-4 sm:px-6 py-3 text-left text-label cursor-pointer hover:bg-gray-100 transition-all duration-200 active:bg-gray-200"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Name
                    {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="px-4 sm:px-6 py-3 text-right text-label cursor-pointer hover:bg-gray-100 transition-all duration-200 active:bg-gray-200"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Price
                    {getSortIcon('price')}
                  </div>
                </th>
                <th 
                  className="px-4 sm:px-6 py-3 text-right text-label cursor-pointer hover:bg-gray-100 transition-all duration-200 active:bg-gray-200"
                  onClick={() => handleSort('changePercent')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Change %
                    {getSortIcon('changePercent')}
                  </div>
                </th>
                <th 
                  className="px-4 sm:px-6 py-3 text-right text-label cursor-pointer hover:bg-gray-100 transition-all duration-200 active:bg-gray-200"
                  onClick={() => handleSort('volume')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Volume
                    {getSortIcon('volume')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => {
                  const isPositive = asset.changePercent >= 0
                  return (
                    <tr 
                      key={asset.symbol || asset.id} 
                      className="hover:bg-gray-50 transition-all duration-200 cursor-pointer hover:shadow-sm animate-fade-in-up"
                      style={{ animationDelay: `${0.05 * (filteredAssets.indexOf(asset) % 20)}s`, animationFillMode: 'both' }}
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-gray-900">
                            {asset.symbol}
                          </span>
                          {asset.assetType === 'crypto' && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                              CRYPTO
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm text-body">{asset.name}</div>
                        {asset.sector && (
                          <div className="text-xs text-gray-500">{asset.sector}</div>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm text-price text-gray-900">
                        {formatCurrency(asset.currentPrice || asset.price)}
                      </td>
                      <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm text-percentage ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(asset.changePercent)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-number text-gray-500">
                        {formatVolume(asset.volume)}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    {searchQuery ? 'No assets found matching your search' : 'No assets found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {filteredAssets.length > 0 && (
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredAssets.length}</span> asset{filteredAssets.length !== 1 ? 's' : ''}
          {filter !== 'all' && ` (${filter === 'stocks' ? 'Stocks' : 'Cryptocurrencies'} only)`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}

      {/* Asset Details Modal */}
      {selectedAsset && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in" 
          onClick={() => setSelectedAsset(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Asset Details</h2>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedAsset.symbol}</h3>
                  {selectedAsset.assetType === 'crypto' && (
                    <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded">
                      CRYPTO
                    </span>
                  )}
                </div>
                <p className="text-lg text-gray-700 mb-2">{assetNames[selectedAsset.symbol] || selectedAsset.name}</p>
                {selectedAsset.sector && (
                  <p className="text-sm text-gray-500">Sector: {selectedAsset.sector}</p>
                )}
              </div>

              {/* Price Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Current Price</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(selectedAsset.currentPrice || selectedAsset.price)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Change</p>
                  <p className={`text-xl font-bold ${selectedAsset.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(selectedAsset.changePercent)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Volume</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatVolume(selectedAsset.volume)}
                  </p>
                </div>
                {selectedAsset.marketCap && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Market Cap</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatVolume(selectedAsset.marketCap)}
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Details */}
              {selectedAsset.keyMetrics && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedAsset.keyMetrics.peRatio && (
                      <div>
                        <p className="text-sm text-gray-500">P/E Ratio</p>
                        <p className="text-base font-medium text-gray-900">{selectedAsset.keyMetrics.peRatio}</p>
                      </div>
                    )}
                    {selectedAsset.keyMetrics.eps && (
                      <div>
                        <p className="text-sm text-gray-500">EPS</p>
                        <p className="text-base font-medium text-gray-900">{selectedAsset.keyMetrics.eps}</p>
                      </div>
                    )}
                    {selectedAsset.keyMetrics.dividendYield !== undefined && (
                      <div>
                        <p className="text-sm text-gray-500">Dividend Yield</p>
                        <p className="text-base font-medium text-gray-900">
                          {selectedAsset.keyMetrics.dividendYield}%
                        </p>
                      </div>
                    )}
                    {selectedAsset.keyMetrics.beta && (
                      <div>
                        <p className="text-sm text-gray-500">Beta</p>
                        <p className="text-base font-medium text-gray-900">{selectedAsset.keyMetrics.beta}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sentiment */}
              {selectedAsset.sentiment && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Sentiment</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Overall Sentiment</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(selectedAsset.sentiment.overall || 0) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {(selectedAsset.sentiment.overall || 0) * 100}% positive
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Assets
