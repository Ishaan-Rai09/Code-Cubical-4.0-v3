'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  Target,
  Award,
  Calendar,
  Users,
  Brain,
  Heart,
  Wind,
  Activity,
  Loader2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DoctorAnalytics {
  overview: {
    totalCases: number
    anomaliesDetected: number
    normalCases: number
    averageConfidence: number
    totalPatients: number
  }
  casesByType: {
    brain: number
    heart: number
    lungs: number
    liver: number
  }
  monthlyTrends: Array<{
    month: string
    totalCases: number
    anomalies: number
    normal: number
  }>
  performance: {
    highConfidence: number
    mediumConfidence: number
    lowConfidence: number
  }
  urgencyDistribution: {
    urgent: number
    moderate: number
    routine: number
  }
  doctorMetrics: {
    casesReviewed: number
    averageReviewTime: string
    accuracyRate: number
    patientsHelped: number
    consultationsProvided: number
  }
}

interface DoctorAnalyticsPageProps {
  specialization: string
}

export default function DoctorAnalyticsPage({ specialization }: DoctorAnalyticsPageProps) {
  const [analytics, setAnalytics] = useState<DoctorAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchAnalytics = async () => {
    try {
      setIsRefreshing(true)
      
      const response = await fetch(`/api/doctor/analytics?specialization=${specialization}`)
      const data = await response.json()
      
      if (data.success) {
        setAnalytics(data.analytics)
      } else {
        toast.error('Failed to load analytics data')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    
    // Refresh data every 60 seconds
    const interval = setInterval(fetchAnalytics, 60000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Cases Handled',
      value: analytics.overview.totalCases.toString(),
      change: `${analytics.doctorMetrics.casesReviewed} reviewed`,
      changeType: 'positive',
      icon: BarChart3,
      color: 'bg-blue-500'
    },
    {
      title: 'Accuracy Rate',
      value: `${(analytics.doctorMetrics.accuracyRate * 100).toFixed(1)}%`,
      change: `Avg confidence: ${(analytics.overview.averageConfidence * 100).toFixed(1)}%`,
      changeType: 'positive',
      icon: Target,
      color: 'bg-green-500'
    },
    {
      title: 'Patients Helped',
      value: analytics.doctorMetrics.patientsHelped.toString(),
      change: `${analytics.doctorMetrics.consultationsProvided} consultations`,
      changeType: 'positive',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Avg Review Time',
      value: analytics.doctorMetrics.averageReviewTime,
      change: `${analytics.overview.anomaliesDetected} anomalies found`,
      changeType: 'neutral',
      icon: Clock,
      color: 'bg-orange-500'
    }
  ]

  const scanTypeBreakdown = [
    { 
      type: 'Brain MRI', 
      count: analytics.casesByType.brain, 
      percentage: Math.round((analytics.casesByType.brain / analytics.overview.totalCases) * 100), 
      icon: Brain, 
      color: 'bg-purple-500' 
    },
    { 
      type: 'Cardiac Scan', 
      count: analytics.casesByType.heart, 
      percentage: Math.round((analytics.casesByType.heart / analytics.overview.totalCases) * 100), 
      icon: Heart, 
      color: 'bg-red-500' 
    },
    { 
      type: 'Lung CT', 
      count: analytics.casesByType.lungs, 
      percentage: Math.round((analytics.casesByType.lungs / analytics.overview.totalCases) * 100), 
      icon: Wind, 
      color: 'bg-blue-500' 
    },
    { 
      type: 'Liver Scan', 
      count: analytics.casesByType.liver, 
      percentage: Math.round((analytics.casesByType.liver / analytics.overview.totalCases) * 100), 
      icon: Activity, 
      color: 'bg-green-500' 
    }
  ]

  const confidenceBreakdown = [
    {
      title: 'High Confidence',
      count: analytics.performance.highConfidence,
      percentage: Math.round((analytics.performance.highConfidence / analytics.overview.totalCases) * 100),
      color: 'bg-green-500',
      description: '90%+ confidence'
    },
    {
      title: 'Medium Confidence',
      count: analytics.performance.mediumConfidence,
      percentage: Math.round((analytics.performance.mediumConfidence / analytics.overview.totalCases) * 100),
      color: 'bg-yellow-500',
      description: '70-90% confidence'
    },
    {
      title: 'Low Confidence',
      count: analytics.performance.lowConfidence,
      percentage: Math.round((analytics.performance.lowConfidence / analytics.overview.totalCases) * 100),
      color: 'bg-red-500',
      description: 'Below 70% confidence'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Doctor Analytics</h1>
          <p className="text-gray-600 mt-1">Track your performance and insights across all medical reviews</p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 
                stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-600">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trends */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-6">Monthly Trends</h2>
          <div className="space-y-4">
            {analytics.monthlyTrends.map((month, index) => (
              <div key={month.month} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-600 w-12">{month.month}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.max((month.totalCases / 50) * 100, 10)}%`, minWidth: '20px' }}
                      ></div>
                      <span className="text-sm text-gray-700">{month.totalCases} cases</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Anomalies: {month.anomalies}</div>
                  <div className="text-sm text-green-600">Normal: {month.normal}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scan Type Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-6">Scan Type Distribution</h2>
          <div className="space-y-4">
            {scanTypeBreakdown.map((scanType, index) => (
              <div key={scanType.type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`${scanType.color} p-2 rounded-lg`}>
                    <scanType.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{scanType.type}</div>
                    <div className="text-sm text-gray-600">{scanType.count} cases</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">{scanType.percentage}%</div>
                  <div 
                    className={`h-2 w-16 ${scanType.color} rounded-full opacity-20`}
                    style={{ opacity: scanType.percentage / 100 }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confidence Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-6">AI Confidence Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {confidenceBreakdown.map((confidence, index) => (
            <div key={confidence.title} className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
              <div className={`w-16 h-16 ${confidence.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className="text-2xl font-bold text-white">{confidence.percentage}%</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{confidence.title}</h3>
              <p className="text-2xl font-bold text-gray-700 mb-1">{confidence.count}</p>
              <p className="text-sm text-gray-600">{confidence.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Urgency Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-6">Case Urgency Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Urgent Cases</h3>
            <p className="text-3xl font-bold text-red-600 mb-1">{analytics.urgencyDistribution.urgent}</p>
            <p className="text-sm text-gray-600">High priority anomalies</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Moderate Cases</h3>
            <p className="text-3xl font-bold text-yellow-600 mb-1">{analytics.urgencyDistribution.moderate}</p>
            <p className="text-sm text-gray-600">Medium priority review</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Routine Cases</h3>
            <p className="text-3xl font-bold text-green-600 mb-1">{analytics.urgencyDistribution.routine}</p>
            <p className="text-sm text-gray-600">Standard follow-up</p>
          </div>
        </div>
      </div>

      {/* Doctor Performance Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">{analytics.doctorMetrics.casesReviewed}</div>
            <div className="text-blue-100">Cases Reviewed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">{(analytics.doctorMetrics.accuracyRate * 100).toFixed(0)}%</div>
            <div className="text-blue-100">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">{analytics.doctorMetrics.averageReviewTime}</div>
            <div className="text-blue-100">Avg Review Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">{analytics.doctorMetrics.consultationsProvided}</div>
            <div className="text-blue-100">Consultations Given</div>
          </div>
        </div>
      </div>
    </div>
  )
}
