'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { TrendingUp, Activity, Brain, Heart, Wind, AlertCircle, CheckCircle, FileText, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AnalyticsPage() {
  const { user } = useUser()
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      console.log('[ANALYTICS] Fetching real-time analytics from MongoDB...')
      
      const response = await fetch('/api/analytics/mongo', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('[ANALYTICS] Analytics fetched from MongoDB:', data.analytics)
        setAnalytics(data.analytics)
      } else {
        console.error('[ANALYTICS] Failed to fetch analytics:', response.status)
        setAnalytics({
          totalScans: 0,
          anomaliesDetected: 0,
          normalScans: 0,
          averageConfidence: 0,
          scansByType: { brain: 0, heart: 0, lungs: 0, liver: 0 },
          recentActivity: []
        })
      }
    } catch (error) {
      console.error('[ANALYTICS] Error fetching analytics:', error)
      setAnalytics({
        totalScans: 0,
        anomaliesDetected: 0,
        normalScans: 0,
        averageConfidence: 0,
        scansByType: { brain: 0, heart: 0, lungs: 0, liver: 0 },
        recentActivity: []
      })
    } finally {
      setLoading(false)
    }
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

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-luxury-navy mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time analytics from Pinata IPFS storage</p>
        </div>
        <button
          onClick={() => {
            setLoading(true)
            fetchAnalytics()
          }}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-luxury-gold hover:bg-luxury-gold/90 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Refreshing...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4 mr-2" />
              Refresh Data
            </>
          )}
        </button>
      </div>

      {analytics ? (
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
          {analytics.recentActivity.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {analytics.recentActivity.map((activity: any, index: number) => (
                  <div key={activity._id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-lg p-6 text-center"
            >
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data Yet</h3>
              <p className="text-gray-500 mb-4">Start by performing some medical image analyses to see your analytics.</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-luxury-gold hover:bg-luxury-gold/90"
              >
                Refresh Analytics
              </button>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-500">Start by performing some medical image analyses to see your analytics.</p>
        </div>
      )}
    </div>
  )
}