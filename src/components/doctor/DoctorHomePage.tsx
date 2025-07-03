'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  Users, 
  Clock, 
  Star, 
  Brain, 
  Heart, 
  Wind, 
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

interface AIReport {
  id: string
  patientName: string
  imageType: string
  findings: string[]
  urgency: 'low' | 'medium' | 'high'
  confidence: number
  createdAt: string
  anomalyDetected: boolean
  doctorReviewed: boolean
  doctorNotes: string
}

interface DoctorStats {
  totalCases: number
  pendingReview: number
  casesReviewed: number
  averageConfidence: number
}

interface DoctorHomePageProps {
  specialization: string
}

export default function DoctorHomePage({ specialization }: DoctorHomePageProps) {
  const [reports, setReports] = useState<AIReport[]>([])
  const [stats, setStats] = useState<DoctorStats>({
    totalCases: 0,
    pendingReview: 0,
    casesReviewed: 0,
    averageConfidence: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchDoctorData = async () => {
    try {
      setIsRefreshing(true)
      
      // Fetch cases filtered by specialization
      const casesResponse = await fetch(`/api/doctor/cases?specialization=${specialization}`)
      const casesData = await casesResponse.json()
      
      if (casesData.success) {
        const recentCases = casesData.cases.slice(0, 10) // Show recent 10 cases
        setReports(recentCases)
        
        // Calculate stats
        const totalCases = casesData.cases.length
        const pendingReview = casesData.cases.filter((c: AIReport) => !c.doctorReviewed).length
        const casesReviewed = casesData.cases.filter((c: AIReport) => c.doctorReviewed).length
        const averageConfidence = totalCases > 0 
          ? casesData.cases.reduce((acc: number, c: AIReport) => acc + c.confidence, 0) / totalCases 
          : 0
        
        setStats({
          totalCases,
          pendingReview,
          casesReviewed,
          averageConfidence
        })
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error)
      toast.error('Failed to load doctor dashboard data')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDoctorData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDoctorData, 30000)
    return () => clearInterval(interval)
  }, [])


  const getImageTypeIcon = (imageType: string) => {
    switch (imageType) {
      case 'brain': return <Brain className="w-5 h-5" />
      case 'heart': return <Heart className="w-5 h-5" />
      case 'lungs': return <Wind className="w-5 h-5" />
      case 'liver': return <Activity className="w-5 h-5" />
      default: return <Activity className="w-5 h-5" />
    }
  }

  const getImageTypeDisplayName = (imageType: string) => {
    switch (imageType) {
      case 'brain': return 'Brain MRI'
      case 'heart': return 'Cardiac Scan'
      case 'lungs': return 'Lung CT'
      case 'liver': return 'Liver Scan'
      default: return imageType
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading doctor dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Doctor Dashboard</h1>
          <p className="text-gray-600 mt-1">Review AI analysis reports and manage patient cases</p>
        </div>
        <button
          onClick={fetchDoctorData}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cases</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalCases}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingReview}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cases Reviewed</p>
              <p className="text-2xl font-bold text-green-600">{stats.casesReviewed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
              <p className="text-2xl font-bold text-purple-600">{(stats.averageConfidence * 100).toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent AI Reports */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-blue-900">Recent AI Analysis Reports</h2>
          <p className="text-gray-600 mt-1">Latest patient scans requiring medical review</p>
        </div>
        
        <div className="p-6">
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent reports available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        {getImageTypeIcon(report.imageType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{report.patientName}</h3>
                          <span className="text-sm text-gray-500">{getImageTypeDisplayName(report.imageType)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(report.urgency)}`}>
                            {report.urgency.toUpperCase()}
                          </span>
                          {report.doctorReviewed && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              REVIEWED
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {report.findings.length > 0 ? report.findings[0] : 'Analysis completed'}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Confidence: {(report.confidence * 100).toFixed(1)}%</span>
                          <span>•</span>
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className={report.anomalyDetected ? 'text-red-600' : 'text-green-600'}>
                            {report.anomalyDetected ? 'Anomaly Detected' : 'Normal'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
