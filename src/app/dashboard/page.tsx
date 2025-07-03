'use client'

import { useUser, SignOutButton } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { User, FileText, Settings, LogOut, CreditCard, BarChart3, Menu, X, Home, ArrowLeft, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import Script from 'next/script'
import Dashboard from '@/components/Dashboard'
import ReportsPage from '@/components/ReportsPage'
import AnalyticsPage from '@/components/AnalyticsPage'
import PaymentsPage from '@/components/PaymentsPage'
import HealthQuery from '@/components/HealthQuery'
import { redirect } from 'next/navigation'

type TabType = 'analysis' | 'reports' | 'analytics' | 'payments' | 'health-query' | 'settings'

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [activeTab, setActiveTab] = useState<TabType>('analysis')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect('/sign-in')
    }
  }, [isLoaded, isSignedIn])

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-luxury-gold"></div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'analysis':
        return <Dashboard />
      case 'reports':
        return <ReportsPage />
      case 'analytics':
        return <AnalyticsPage />
      case 'payments':
        return <PaymentsPage />
      case 'health-query':
        return <HealthQuery />
      case 'settings':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-luxury-navy mb-6">Settings</h2>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.primaryEmailAddress?.emailAddress || 'N/A'}</p>
                </div>
                <div className="pt-4 border-t">
                  <SignOutButton>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                      Sign Out
                    </button>
                  </SignOutButton>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <>
      {/* Omnidimension Web Widget */}
      <Script
        id="omnidimension-web-widget"
        src="https://backend.omnidim.io/web_widget.js?secret_key=1125feacd5768202fd1d35fc37f62a87"
        strategy="afterInteractive"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-luxury-cream via-white to-luxury-platinum">
      {/* Top Navigation */}
      <nav className="bg-white shadow-lg border-b border-luxury-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-luxury-navy hover:bg-gray-100 mr-2"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Link href="/" className="flex items-center mr-4">
                <ArrowLeft className="h-5 w-5 text-luxury-navy mr-2" />
                <span className="text-luxury-navy hover:text-luxury-gold transition-colors">Back to Home</span>
              </Link>
              <h1 className="text-2xl font-bold text-luxury-navy font-luxury">
                LuxeHealth AI Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-luxury-navy" />
                <span className="text-luxury-navy font-medium">
                  {user?.firstName || 'User'}
                </span>
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
          w-64 bg-white shadow-lg border-r border-luxury-gold/20 flex-shrink-0
          lg:block lg:static lg:h-auto lg:translate-x-0
          fixed top-16 left-0 h-[calc(100vh-4rem)] z-50
          transition-transform duration-300 ease-in-out lg:transition-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}>
          <div className="p-6 h-full overflow-y-auto">
            <nav className="space-y-2">
              <button
                onClick={() => {
                  setActiveTab('analysis')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'analysis'
                    ? 'bg-luxury-gold text-luxury-navy font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="h-5 w-5 mr-3" />
                Analysis
              </button>
              <button
                onClick={() => {
                  setActiveTab('reports')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'reports'
                    ? 'bg-luxury-gold text-luxury-navy font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="h-5 w-5 mr-3" />
                Reports
              </button>
              <button
                onClick={() => {
                  setActiveTab('analytics')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-luxury-gold text-luxury-navy font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                Analytics
              </button>
              <button
                onClick={() => {
                  setActiveTab('payments')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'payments'
                    ? 'bg-luxury-gold text-luxury-navy font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CreditCard className="h-5 w-5 mr-3" />
                Payments
              </button>
              <button
                onClick={() => {
                  setActiveTab('health-query')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'health-query'
                    ? 'bg-luxury-gold text-luxury-navy font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MessageCircle className="h-5 w-5 mr-3" />
                Health Query
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-luxury-gold text-luxury-navy font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
