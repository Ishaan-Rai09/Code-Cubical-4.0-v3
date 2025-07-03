'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { FileText, Download, Eye, Calendar, AlertCircle, BarChart3, TrendingUp, Activity, Clock, Users, Brain, Heart, Wind, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

interface PatientData {
  name: string
  email: string
  phone: string
  imageType: string
  additionalNotes: string
  originalFileName: string
  fileSize: number
  uploadTimestamp: string
  userId: string
}

interface Report {
  _id: string
  analysisId: string
  patientId: {
    _id: string
    encryptedData: string | PatientData
  }
  imageType: string
  anomalyDetected: boolean
  confidence: number
  status: string
  createdAt: string
  originalImageHash: string
}

export default function ReportsPage() {
  const { user } = useUser()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [activeTab, setActiveTab] = useState<'reports' | 'analytics'>('reports')

  const getPatientData = (report: Report): PatientData | null => {
    try {
      if (typeof report.patientId.encryptedData === 'string') {
        return JSON.parse(report.patientId.encryptedData) as PatientData
      }
      return report.patientId.encryptedData as PatientData
    } catch (error) {
      console.error('Error parsing patient data:', error)
      return null
    }
  }

  useEffect(() => {
    if (user) {
      fetchUserReports()
    }
  }, [user])

  const fetchUserReports = async () => {
    try {
      console.log('[REPORTS] Fetching real-time reports from MongoDB...')
      
      const response = await fetch('/api/reports/mongo', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`[REPORTS] Fetched ${data.reports?.length || 0} reports from MongoDB`)
        setReports(data.reports || [])
      } else {
        console.error('[REPORTS] Failed to fetch reports:', response.status)
        setReports([])
      }
    } catch (error) {
      console.error('[REPORTS] Error fetching reports:', error)
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async (analysisId: string) => {
    try {
      const response = await fetch(`/api/generate-pdf?analysisId=${analysisId}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `medical-report-${analysisId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading report:', error)
    }
  }

  const viewReport = async (analysisId: string) => {
    try {
      const response = await fetch(`/api/analysis/${analysisId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedReport(data)
      }
    } catch (error) {
      console.error('Error fetching report details:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
        </div>
      </div>
    )
  }

  // Calculate analytics
  const analytics = {
    totalReports: reports.length,
    anomaliesDetected: reports.filter(r => r.anomalyDetected).length,
    averageConfidence: reports.length > 0 ? (reports.reduce((sum, r) => sum + r.confidence, 0) / reports.length * 100).toFixed(1) : 0,
    imageTypeBreakdown: reports.reduce((acc, r) => {
      acc[r.imageType] = (acc[r.imageType] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    recentActivity: reports.slice(0, 5).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const getImageTypeIcon = (imageType: string) => {
    switch (imageType) {
      case 'brain': return Brain
      case 'heart': return Heart
      case 'lungs': return Wind
      default: return Activity
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-luxury-navy font-luxury mb-2">
            Medical Analysis Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time reports from Pinata IPFS storage
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true)
            fetchUserReports()
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
              <FileText className="h-4 w-4 mr-2" />
              Refresh Reports
            </>
          )}
        </button>
      </div>
      
      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-luxury-gold text-luxury-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              My Reports
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-luxury-gold text-luxury-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Analytics
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'reports' ? (
        reports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
            <p className="text-gray-500">
              Complete your first medical analysis to see reports here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reports.map((report) => (
              <motion.div
                key={report._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg border border-luxury-gold/20 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <FileText className="h-5 w-5 text-luxury-navy mr-2" />
                      <h3 className="text-lg font-semibold text-luxury-navy">
                        {report.imageType} Analysis
                      </h3>
                      {report.anomalyDetected && (
                        <AlertCircle className="h-5 w-5 text-red-500 ml-2" />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Analysis ID</p>
                        <p className="font-mono text-sm">{report.analysisId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="text-sm flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Confidence</p>
                        <p className="text-sm">{(report.confidence * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          report.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                    </div>

                    {report.anomalyDetected && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <div className="flex">
                          <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-red-800">
                              Potential Anomaly Detected
                            </h4>
                            <p className="text-sm text-red-700 mt-1">
                              This analysis detected potential anomalies. Please consult with a healthcare professional.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => viewReport(report.analysisId)}
                      className="flex items-center px-3 py-2 text-sm font-medium text-luxury-navy bg-luxury-gold/10 border border-luxury-gold/30 rounded-lg hover:bg-luxury-gold/20 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => downloadReport(report.analysisId)}
                      className="flex items-center px-3 py-2 text-sm font-medium text-white bg-luxury-navy hover:bg-luxury-navy/90 rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        /* Analytics Tab */
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg border border-luxury-gold/20 p-6"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-luxury-navy">{analytics.totalReports}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-lg border border-luxury-gold/20 p-6"
            >
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Anomalies Detected</p>
                  <p className="text-2xl font-bold text-luxury-navy">{analytics.anomaliesDetected}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-lg border border-luxury-gold/20 p-6"
            >
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                  <p className="text-2xl font-bold text-luxury-navy">{analytics.averageConfidence}%</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-lg border border-luxury-gold/20 p-6"
            >
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-luxury-navy">
                    {reports.filter(r => new Date(r.createdAt).getMonth() === new Date().getMonth()).length}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Image Type Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-lg border border-luxury-gold/20 p-6"
          >
            <h3 className="text-lg font-semibold text-luxury-navy mb-4">Analysis by Image Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(analytics.imageTypeBreakdown).map(([type, count], index) => {
                const Icon = getImageTypeIcon(type)
                return (
                  <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                    <Icon className="h-8 w-8 mx-auto mb-2 text-luxury-navy" />
                    <p className="text-sm font-medium text-gray-900 capitalize">{type}</p>
                    <p className="text-2xl font-bold text-luxury-navy">{count}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-lg border border-luxury-gold/20 p-6"
          >
            <h3 className="text-lg font-semibold text-luxury-navy mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {analytics.recentActivity.map((report, index) => {
                const patientData = getPatientData(report)
                return (
                  <div key={report._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${
                        report.anomalyDetected ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        {report.anomalyDetected ? (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <Activity className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {report.imageType.charAt(0).toUpperCase() + report.imageType.slice(1)} Analysis
                        </p>
                        <p className="text-xs text-gray-500">
                          {patientData?.name || 'Unknown Patient'} • {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{(report.confidence * 100).toFixed(1)}%</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-luxury-navy">
                  Analysis Report Details
                </h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Analysis ID</h3>
                  <p className="text-gray-600 font-mono">{selectedReport.analysisId}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Image Type</h3>
                  <p className="text-gray-600">{selectedReport.imageType}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Analysis Date</h3>
                  <p className="text-gray-600">
                    {format(new Date(selectedReport.createdAt), 'PPpp')}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Confidence Level</h3>
                  <p className="text-gray-600">{(selectedReport.confidence * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Status</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    selectedReport.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedReport.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
