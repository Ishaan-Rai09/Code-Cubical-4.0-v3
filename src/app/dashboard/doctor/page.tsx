'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  FileText, 
  Settings, 
  LogOut, 
  BarChart3, 
  Menu, 
  X, 
  Home, 
  ArrowLeft, 
  Star,
  ClipboardList,
  MessageSquare,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DoctorHomePage from '@/components/doctor/DoctorHomePage'
import DoctorCasesPage from '@/components/doctor/DoctorCasesPage'
import DoctorBookingsPage from '@/components/doctor/DoctorBookingsPage'
import DoctorReviewsPage from '@/components/doctor/DoctorReviewsPage'
import toast from 'react-hot-toast'

type TabType = 'home' | 'cases' | 'bookings' | 'reviews' | 'settings'

interface DoctorSession {
  email: string
  licenseNumber: string
  specialization: string
  loginTime: string
  lastActivity?: string
  role: string
  name: string
}

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [doctorSession, setDoctorSession] = useState<DoctorSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for doctor session in localStorage
    console.log('Doctor dashboard: Checking for session...')
    
    // Add a small delay to ensure localStorage is available
    const checkSession = () => {
      const sessionData = localStorage.getItem('doctorSession')
      console.log('Session data found:', sessionData)
      
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData)
          console.log('Parsed session:', session)
          
          // Check if session is expired (24 hours)
          const loginTime = new Date(session.loginTime)
          const now = new Date()
          const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)
          
          if (hoursDiff > 24) {
            console.log('Session expired, removing and redirecting')
            localStorage.removeItem('doctorSession')
            window.location.href = '/doctor-login'
            return
          }
          
          setDoctorSession(session)
          setIsLoading(false)
        } catch (error) {
          console.error('Error parsing doctor session:', error)
          localStorage.removeItem('doctorSession')
          window.location.href = '/doctor-login'
        }
      } else {
        console.log('No session found, redirecting to login')
        window.location.href = '/doctor-login'
      }
    }
    
    // Small delay to ensure localStorage is ready
    setTimeout(checkSession, 100)

    // Refresh session timestamp on activity
    const refreshSession = () => {
      const sessionData = localStorage.getItem('doctorSession')
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData)
          session.lastActivity = new Date().toISOString()
          localStorage.setItem('doctorSession', JSON.stringify(session))
        } catch (error) {
          console.error('Error refreshing session:', error)
        }
      }
    }

    // Add activity listeners to refresh session
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    const activityHandler = () => refreshSession()
    
    events.forEach(event => {
      document.addEventListener(event, activityHandler, true)
    })

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, activityHandler, true)
      })
    }
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('doctorSession')
    toast.success('Signed out successfully')
    router.push('/')
  }

  const getSpecializationDisplayName = (specialization: string) => {
    switch (specialization) {
      case 'brain': return 'Neurologist'
      case 'heart': return 'Cardiologist'
      case 'lungs': return 'Pulmonologist'
      case 'liver': return 'Hepatologist'
      default: return specialization
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-900 font-semibold">Loading Doctor Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!doctorSession) {
    return null // Will redirect to login
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <DoctorHomePage specialization={doctorSession.specialization} />
      case 'cases':
        return <DoctorCasesPage specialization={doctorSession.specialization} onTabChange={setActiveTab} />
      case 'bookings':
        return <DoctorBookingsPage specialization={doctorSession.specialization} />
      case 'reviews':
        return <DoctorReviewsPage />
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">Doctor Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{doctorSession.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{doctorSession.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">License Number</label>
                  <p className="mt-1 text-sm text-gray-900">{doctorSession.licenseNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialization</label>
                  <p className="mt-1 text-sm text-gray-900">Radiology & AI Analysis</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Login Time</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(doctorSession.loginTime).toLocaleString()}</p>
                </div>
                <div className="pt-4 border-t">
                  <button 
                    onClick={handleSignOut}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return <DoctorHomePage />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-xl border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-700 mr-3 transition-colors"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Link href="/" className="flex items-center mr-6 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-700 mr-2" />
                <span className="text-gray-700 hover:text-blue-700 transition-colors font-medium">Back to Home</span>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-blue-900">
                  Doctor Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-blue-50 px-3 py-2 rounded-lg max-w-xs">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-right min-w-0 flex-1">
                  <p className="text-sm font-medium text-blue-900 truncate">
                    {doctorSession.name}
                  </p>
                  <p className="text-xs text-blue-600 truncate">
                    {getSpecializationDisplayName(doctorSession.specialization)}
                  </p>
                  <div className="flex items-center justify-end mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          w-80 lg:w-72 bg-white shadow-xl border-r border-blue-200 flex-shrink-0
          lg:block lg:static lg:h-auto lg:translate-x-0
          fixed top-16 left-0 h-[calc(100vh-4rem)] z-50
          transition-transform duration-300 ease-in-out lg:transition-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}>
          <div className="p-6 h-full overflow-y-auto">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Navigation</h2>
              <p className="text-sm text-gray-600">Manage your medical practice</p>
            </div>
            <nav className="space-y-3">
              <button
                onClick={() => {
                  setActiveTab('home')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                  activeTab === 'home'
                    ? 'bg-blue-600 text-white font-medium shadow-lg'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <Home className="h-5 w-5 mr-3" />
                Home
              </button>
              <button
                onClick={() => {
                  setActiveTab('cases')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                  activeTab === 'cases'
                    ? 'bg-blue-600 text-white font-medium shadow-lg'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <ClipboardList className="h-5 w-5 mr-3" />
                Patient Cases
              </button>
              <button
                onClick={() => {
                  setActiveTab('bookings')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                  activeTab === 'bookings'
                    ? 'bg-blue-600 text-white font-medium shadow-lg'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <Calendar className="h-5 w-5 mr-3" />
                Patient Bookings
              </button>
              <button
                onClick={() => {
                  setActiveTab('reviews')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                  activeTab === 'reviews'
                    ? 'bg-blue-600 text-white font-medium shadow-lg'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <MessageSquare className="h-5 w-5 mr-3" />
                Patient Reviews
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                  activeTab === 'settings'
                    ? 'bg-blue-600 text-white font-medium shadow-lg'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </button>
            </nav>
            
            {/* Sidebar Footer */}
            <div className="mt-auto pt-6 border-t border-gray-200">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-6 lg:p-8 max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
