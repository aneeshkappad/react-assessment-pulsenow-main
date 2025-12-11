import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import MetaMaskButton from './MetaMaskButton'

const Layout = ({ children }) => {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitionStage, setTransitionStage] = useState('fadeIn')

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut')
    }
  }, [location, displayLocation])

  useEffect(() => {
    if (transitionStage === 'fadeOut') {
      const timer = setTimeout(() => {
        setDisplayLocation(location)
        setTransitionStage('fadeIn')
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [transitionStage, location])

  const navigation = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Assets', path: '/assets', icon: '💰' },
    { name: 'News', path: '/news', icon: '📰' },
    { name: 'Alerts', path: '/alerts', icon: '🔔' },
    { name: 'Portfolio', path: '/portfolio', icon: '💼' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 transition-shadow duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center animate-fade-in">
              <h1 className="text-2xl font-bold text-pulse-primary transition-colors duration-300">Pulse</h1>
              <span className="ml-2 text-sm text-gray-500">Market Monitoring Engine</span>
            </div>
            <MetaMaskButton />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out`}>
          <nav className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <li key={item.path} className="animate-fade-in">
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 font-medium ${
                        isActive
                          ? 'bg-pulse-primary text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                      }`}
                    >
                      <span className="text-xl transition-transform duration-200">{item.icon}</span>
                      {sidebarOpen && <span className="transition-opacity duration-200">{item.name}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content with Page Transition */}
        <main className={`flex-1 p-8 transition-opacity duration-300 ${
          transitionStage === 'fadeOut' ? 'opacity-0' : 'opacity-100 animate-fade-in'
        }`}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
