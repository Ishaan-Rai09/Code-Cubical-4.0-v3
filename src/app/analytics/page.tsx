'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { User, FileText, Settings, LogOut, CreditCard, BarChart3, ArrowLeft, TrendingUp, Activity, Brain, Heart, Wind, AlertCircle, CheckCircle } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function AnalyticsPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect('/sign-in')
    }
  }, [isLoaded, isSignedIn])

  useEffect(() => {
    if (isSignedIn) {
      fetchAnalytics()
    }
  }, [isSignedIn])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/reports/user')
      const data = await response.json()
      
      if (data.reports) {
        const reports = data.reports
        const analytics = {
          totalScans: reports.length,
          anomaliesDetected: reports.filter((r: any) => r.anomalyDetected).length,
          normalScans: reports.filter((r: any) => !r.anomalyDetected).length,
          averageConfidence: reports.reduce((acc: number, r: any) => acc + r.confidence, 0) / reports.length || 0,
          scansByType: {
            brain: reports.filter((r: any) => r.imageType === 'brain').length,
            heart: reports.filter((r: any) => r.imageType === 'heart').length,
            lungs: reports.filter((r: any) => r.imageType === 'lungs').length,
            liver: reports.filter((r: any) => r.imageType === 'liver').length,
          },
          recentActivity: reports.slice(0, 5)
        }
        setAnalytics(analytics)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-luxury-gold"></div>
      </div>
    )
  }

  const getImageTypeIcon = (type: string) => {
    switch (type) {
      case 'brain': return <Brain className="h-5 w-5" />
      case 'heart': return <Heart className="h-5 w-5" />
      case 'lungs': return <Wind className="h-5 w-5" />
      case 'liver': return <Activity className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-cream via-white to-luxury-platinum">
      {/* Top Navigation */}
      <nav className="bg-white shadow-lg border-b border-luxury-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center mr-4">
                <ArrowLeft className="h-5 w-5 text-luxury-navy mr-2" />
                <span className="text-luxury-navy">Back to Dashboard</span>
              </Link>
              <h1 className="text-2xl font-bold text-luxury-navy font-luxury">
                Analytics Dashboard
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
          </div>
        ) : analytics ? (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Scans</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalScans}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Anomalies Detected</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.anomaliesDetected}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Normal Scans</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.normalScans}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg. Confidence</p>
                    <p className="text-2xl font-bold text-gray-900">{(analytics.averageConfidence * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Scan Types Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Scans by Type</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analytics.scansByType).map(([type, count]) => (
                  <div key={type} className="text-center">
                    <div className="flex justify-center mb-2">
                      {getImageTypeIcon(type)}
                    </div>
                    <p className="text-sm font-medium text-gray-600 capitalize">{type}</p>
                    <p className="text-xl font-bold text-gray-900">{count as number}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {analytics.recentActivity.map((activity: any, index: number) => (
                  <div key={activity._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {getImageTypeIcon(activity.imageType)}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.imageType.charAt(0).toUpperCase() + activity.imageType.slice(1)} Scan
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {activity.anomalyDetected ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Anomaly
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Normal
                        </span>
                      )}
                      <span className="ml-2 text-sm text-gray-500">
                        {(activity.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
            <p className="text-gray-500">Start by performing some medical image analyses to see your analytics.</p>
            <Link
              href="/dashboard"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-luxury-gold hover:bg-luxury-gold/90"
            >
              Start Analysis
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}