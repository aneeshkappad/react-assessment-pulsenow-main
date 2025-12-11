import { useEffect, useState } from 'react'
import { useNews } from '../contexts/AppContext'
import { Search, Newspaper, X, Calendar, ExternalLink } from 'lucide-react'

const News = () => {
  const { newsData, newsLoading: loading, newsError: error } = useNews()
  const [filteredNews, setFilteredNews] = useState([])
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter news based on category and search
  useEffect(() => {
    let filtered = [...newsData]

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.category?.toLowerCase() === categoryFilter.toLowerCase()
      )
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(query) ||
        item.summary?.toLowerCase().includes(query) ||
        item.source?.toLowerCase().includes(query)
      )
    }

    setFilteredNews(filtered)
  }, [categoryFilter, searchQuery, newsData])

  // Get unique categories from news
  const categories = ['all', ...new Set(newsData.map(item => item.category).filter(Boolean))]

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    // For older dates, show formatted date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
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

  // Get impact badge color
  const getImpactColor = (impact) => {
    switch (impact?.toLowerCase()) {
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

  // Capitalize category name
  const capitalizeCategory = (category) => {
    if (!category) return ''
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading news...</p>
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
            <h3 className="text-red-800 font-semibold">Error Loading News</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-down">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Newspaper className="w-8 h-8 text-gray-700 transition-transform duration-300 hover:scale-110" />
          News
        </h1>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search news by title, source, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 focus:shadow-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm transform hover:scale-105 active:scale-95 ${
                  categoryFilter === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                }`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                {category === 'all' ? 'All' : capitalizeCategory(category)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* News Grid */}
      {filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden flex flex-col animate-fade-in-up cursor-pointer"
              style={{ animationDelay: `${0.2 + index * 0.1}s`, animationFillMode: 'both' }}
            >
              {/* News Card Content */}
              <div className="p-5 flex flex-col flex-1">
                {/* Category and Impact Badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {item.category && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(item.category)}`}>
                      {capitalizeCategory(item.category)}
                    </span>
                  )}
                  {item.impact && (
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getImpactColor(item.impact)}`}>
                      {item.impact.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-all duration-200">
                  {item.title}
                </h3>

                {/* Summary/Description */}
                {item.summary && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                    {item.summary}
                  </p>
                )}

                {/* Source and Timestamp */}
                <div className="mt-auto pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.source}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatTimestamp(item.timestamp)}</span>
                    </div>
                  </div>

                  {/* Affected Assets */}
                  {item.affectedAssets && item.affectedAssets.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs text-gray-500">Affected:</span>
                      {item.affectedAssets.slice(0, 3).map((asset) => (
                        <span
                          key={asset}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                        >
                          {asset}
                        </span>
                      ))}
                      {item.affectedAssets.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{item.affectedAssets.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 border border-gray-200 text-center animate-fade-in">
          <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4 transition-transform duration-300 hover:scale-110" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No news found</h3>
          <p className="text-gray-600">
            {searchQuery || categoryFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No news available at the moment.'}
          </p>
        </div>
      )}

      {/* Summary */}
      {filteredNews.length > 0 && (
        <div className="text-sm text-gray-600 text-center">
          Showing <span className="font-semibold">{filteredNews.length}</span> news item{filteredNews.length !== 1 ? 's' : ''}
          {categoryFilter !== 'all' && ` in ${capitalizeCategory(categoryFilter)} category`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}
    </div>
  )
}

export default News
