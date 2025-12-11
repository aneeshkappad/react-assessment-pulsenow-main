import { useState, useMemo } from 'react'
import { useDashboard } from '../contexts/AppContext'
import { Bell, X, Check, AlertCircle, AlertTriangle, Info, Clock } from 'lucide-react'

const Alerts = () => {
  const { dashboardData, dashboardLoading: loading, dashboardError: error } = useDashboard()
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set())

  // Get alerts from dashboard data
  const alerts = useMemo(() => {
    if (!dashboardData?.activeAlerts) return []
    return dashboardData.activeAlerts.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    )
  }, [dashboardData])

  // Group alerts by severity
  const groupAlertsBySeverity = () => {
    const grouped = {
      critical: [],
      high: [],
      medium: [],
      low: []
    }

    alerts.forEach(alert => {
      if (!dismissedAlerts.has(alert.id)) {
        const severity = alert.severity?.toLowerCase() || 'low'
        if (grouped[severity]) {
          grouped[severity].push(alert)
        } else {
          grouped.low.push(alert)
        }
      }
    })

    return grouped
  }

  const groupedAlerts = groupAlertsBySeverity()

  // Dismiss alert
  const handleDismiss = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]))
  }

  // Mark as read (same as dismiss for UI purposes)
  const handleMarkAsRead = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]))
  }

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
      hour: '2-digit',
      minute: '2-digit',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  // Get severity configuration
  const getSeverityConfig = (severity) => {
    const severityLower = severity?.toLowerCase() || 'low'
    
    switch (severityLower) {
      case 'critical':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          headerBg: 'bg-red-600',
          textColor: 'text-red-800',
          badgeColor: 'bg-red-600 text-white',
          icon: AlertCircle,
          iconColor: 'text-red-600'
        }
      case 'high':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          headerBg: 'bg-red-500',
          textColor: 'text-red-800',
          badgeColor: 'bg-red-500 text-white',
          icon: AlertCircle,
          iconColor: 'text-red-600'
        }
      case 'medium':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          headerBg: 'bg-yellow-500',
          textColor: 'text-yellow-800',
          badgeColor: 'bg-yellow-500 text-white',
          icon: AlertTriangle,
          iconColor: 'text-yellow-600'
        }
      case 'low':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          headerBg: 'bg-blue-500',
          textColor: 'text-blue-800',
          badgeColor: 'bg-blue-500 text-white',
          icon: Info,
          iconColor: 'text-blue-600'
        }
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          headerBg: 'bg-gray-500',
          textColor: 'text-gray-800',
          badgeColor: 'bg-gray-500 text-white',
          icon: Info,
          iconColor: 'text-gray-600'
        }
    }
  }

  // Capitalize severity
  const capitalizeSeverity = (severity) => {
    if (!severity) return 'Low'
    return severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading alerts...</p>
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
            <h3 className="text-red-800 font-semibold">Error Loading Alerts</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const totalAlerts = alerts.length - dismissedAlerts.size
  const severityOrder = ['critical', 'high', 'medium', 'low']

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-down">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-8 h-8 text-gray-700 transition-transform duration-300 hover:scale-110" />
          Alerts
        </h1>
        {totalAlerts > 0 && (
          <div className="text-sm text-gray-600 animate-fade-in">
            <span className="font-semibold">{totalAlerts}</span> active alert{totalAlerts !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Alerts by Severity */}
      {totalAlerts === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 border border-gray-200 text-center animate-fade-in">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4 transition-transform duration-300 hover:scale-110" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Alerts</h3>
          <p className="text-gray-600">All alerts have been dismissed or there are no alerts at the moment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {severityOrder.map((severity, severityIndex) => {
            const alertsInSeverity = groupedAlerts[severity] || []
            if (alertsInSeverity.length === 0) return null

            const config = getSeverityConfig(severity)
            const IconComponent = config.icon

            return (
              <div
                key={severity}
                className={`${config.bgColor} rounded-lg border-2 ${config.borderColor} overflow-hidden transition-all duration-300 hover:shadow-lg animate-fade-in-up`}
                style={{ animationDelay: `${0.1 * severityIndex}s`, animationFillMode: 'both' }}
              >
                {/* Severity Header */}
                <div className={`${config.headerBg} px-6 py-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-5 h-5 text-white" />
                    <h2 className="text-lg font-semibold text-white">
                      {capitalizeSeverity(severity)} Severity
                    </h2>
                    <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium text-white">
                      {alertsInSeverity.length} alert{alertsInSeverity.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Alerts List */}
                <div className="p-6 space-y-4">
                  {alertsInSeverity.map((alert, alertIndex) => (
                    <div
                      key={alert.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:scale-[1.01] transition-all duration-200 animate-fade-in-up"
                      style={{ animationDelay: `${0.2 + alertIndex * 0.05}s`, animationFillMode: 'both' }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Alert Message */}
                          <div className="flex items-start gap-3 mb-3">
                            <span className={`px-3 py-1 rounded text-xs font-semibold ${config.badgeColor} whitespace-nowrap`}>
                              {capitalizeSeverity(alert.severity)}
                            </span>
                            <p className="text-base font-medium text-gray-900 flex-1">
                              {alert.message}
                            </p>
                          </div>

                          {/* Alert Metadata */}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatTimestamp(alert.timestamp)}</span>
                            </div>
                            {alert.type && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{alert.type.replace('_', ' ')}</span>
                              </>
                            )}
                            {alert.impact && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{alert.impact}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleMarkAsRead(alert.id)}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-sm hover:shadow-md"
                            title="Mark as Read"
                          >
                            <Check className="w-4 h-4" />
                            <span className="hidden sm:inline">Read</span>
                          </button>
                          <button
                            onClick={() => handleDismiss(alert.id)}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-sm hover:shadow-md"
                            title="Dismiss"
                          >
                            <X className="w-4 h-4" />
                            <span className="hidden sm:inline">Dismiss</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Summary Stats */}
      {totalAlerts > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg animate-fade-in-up" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {severityOrder.map((severity, index) => {
              const count = groupedAlerts[severity]?.length || 0
              const config = getSeverityConfig(severity)
              
              return (
                <div 
                  key={severity} 
                  className="text-center transition-all duration-300 hover:scale-105 animate-fade-in-up"
                  style={{ animationDelay: `${0.6 + index * 0.1}s`, animationFillMode: 'both' }}
                >
                  <div className={`${config.badgeColor} rounded-lg px-4 py-3 mb-2 transition-all duration-200 hover:shadow-md`}>
                    <p className="text-2xl font-bold text-white animate-count-up">{count}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {capitalizeSeverity(severity)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Alerts
