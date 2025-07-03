'use client'

import { useState, useEffect } from 'react'
import { 
  ClipboardList,
  Brain,
  Heart,
  Wind,
  Activity,
  Calendar,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Edit3,
  Save,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DoctorCase {
  id: string
  analysisId: string
  patientName: string
  patientEmail: string
  imageType: string
  anomalyDetected: boolean
  confidence: number
  status: string
  createdAt: string
  findings: string[]
  recommendations: string[]
  technicalDetails: any
  doctorReviewed: boolean
  doctorNotes: string
  urgency: 'low' | 'medium' | 'high'
}

interface DoctorCasesPageProps {
  specialization: string
  onTabChange?: (tab: string) => void
}

export default function DoctorCasesPage({ specialization, onTabChange }: DoctorCasesPageProps) {
  const [cases, setCases] = useState<DoctorCase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [editingCase, setEditingCase] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [filter, setFilter] = useState<'all' | 'reviewed' | 'pending'>('all')

  const fetchCases = async () => {
    try {
      setIsRefreshing(true)
      
      const response = await fetch(`/api/doctor/cases?specialization=${specialization}`)
      const data = await response.json()
      
      if (data.success) {
        setCases(data.cases)
      } else {
        toast.error('Failed to load cases')
      }
    } catch (error) {
      console.error('Error fetching cases:', error)
      toast.error('Failed to load cases')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCases()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchCases, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleUpdateNotes = async (caseId: string, notes: string) => {
    try {
      const response = await fetch('/api/doctor/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseId,
          doctorNotes: notes,
          status: 'reviewed'
        })
      })
      
      if (response.ok) {
        toast.success('Case notes updated successfully')
        setEditingCase(null)
        setEditNotes('')
        fetchCases() // Refresh data
      }
    } catch (error) {
      toast.error('Failed to update case notes')
    }
  }

  const handleCheckBooking = (patientEmail: string) => {
    // Redirect to bookings tab
    if (onTabChange) {
      onTabChange('bookings')
      toast.success(`Redirecting to patient bookings for ${patientEmail}`)
    } else {
      toast.success('Bookings feature is available in the Patient Bookings tab')
    }
  }

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      const response = await fetch('/api/bookings/doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          action: 'confirm',
          doctorSpecialization: specialization
        })
      })
      
      if (response.ok) {
        toast.success('Booking confirmed successfully')
        fetchCases() // Refresh data
      }
    } catch (error) {
      toast.error('Failed to confirm booking')
    }
  }

  const handleRejectBooking = async (bookingId: string) => {
    try {
      const response = await fetch('/api/bookings/doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          action: 'reject',
          doctorSpecialization: specialization
        })
      })
      
      if (response.ok) {
        toast.success('Booking rejected')
        fetchCases() // Refresh data
      }
    } catch (error) {
      toast.error('Failed to reject booking')
    }
  }

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

  const getStatusColor = (reviewed: boolean) => {
    return reviewed ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'
  }

  const filteredCases = cases.filter(case_ => {
    if (filter === 'reviewed') return case_.doctorReviewed
    if (filter === 'pending') return !case_.doctorReviewed
    return true
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading cases...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Patient Cases</h1>
          <p className="text-gray-600 mt-1">Manage and review patient medical analysis cases</p>
        </div>
        <button
          onClick={fetchCases}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All Cases', count: cases.length },
            { key: 'pending', label: 'Pending Review', count: cases.filter(c => !c.doctorReviewed).length },
            { key: 'reviewed', label: 'Reviewed', count: cases.filter(c => c.doctorReviewed).length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Cases List */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-blue-900">
            {filter === 'all' ? 'All Cases' : 
             filter === 'pending' ? 'Pending Review' : 'Reviewed Cases'}
          </h2>
          <p className="text-gray-600 mt-1">{filteredCases.length} cases found</p>
        </div>
        
        <div className="p-6">
          {filteredCases.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No cases found for the selected filter</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCases.map((case_) => (
                <div key={case_.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        {getImageTypeIcon(case_.imageType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{case_.patientName}</h3>
                          <span className="text-sm text-gray-500">{getImageTypeDisplayName(case_.imageType)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(case_.urgency)}`}>
                            {case_.urgency.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(case_.doctorReviewed)}`}>
                            {case_.doctorReviewed ? 'REVIEWED' : 'PENDING'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{case_.patientEmail}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Confidence: {(case_.confidence * 100).toFixed(1)}%</span>
                          <span>•</span>
                          <span>{new Date(case_.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className={case_.anomalyDetected ? 'text-red-600' : 'text-green-600'}>
                            {case_.anomalyDetected ? 'Anomaly Detected' : 'Normal'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Findings */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">AI Findings:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {case_.findings.map((finding, index) => (
                        <li key={index}>{finding}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">AI Recommendations:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {case_.recommendations.map((recommendation, index) => (
                        <li key={index}>{recommendation}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Doctor Notes */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Doctor Notes:</h4>
                      {!case_.doctorReviewed && (
                        <button
                          onClick={() => {
                            setEditingCase(case_.id)
                            setEditNotes(case_.doctorNotes || '')
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Add Notes</span>
                        </button>
                      )}
                    </div>
                    
                    {editingCase === case_.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                          placeholder="Add your professional notes and recommendations..."
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateNotes(case_.id, editNotes)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingCase(null)
                              setEditNotes('')
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center space-x-1"
                          >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">
                          {case_.doctorNotes || 'No notes added yet'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Created: {new Date(case_.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleCheckBooking(case_.patientEmail)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-1"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Check Booking</span>
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
