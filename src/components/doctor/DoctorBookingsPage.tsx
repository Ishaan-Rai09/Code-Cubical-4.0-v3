'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Video,
  RefreshCw,
  MessageSquare,
  Loader2,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DoctorBooking {
  id: string
  patientEmail: string
  patientName: string
  doctorSpecialization: string
  date: string
  time: string
  status: 'confirmed' | 'tentative' | 'cancelled'
  reason: string
  summary: string
  doctorResponse: 'accepted' | 'declined' | 'tentative' | 'needsAction'
  patientResponse: string
  created: string
  updated: string
  meetingLink: string
  analysisId?: string
  remarks?: string
}

interface DoctorBookingsPageProps {
  specialization: string
}

export default function DoctorBookingsPage({ specialization }: DoctorBookingsPageProps) {
  const [bookings, setBookings] = useState<DoctorBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<DoctorBooking | null>(null)
  const [remarks, setRemarks] = useState('')
  const [showRemarksModal, setShowRemarksModal] = useState(false)
  const [actionType, setActionType] = useState<'accept' | 'reject'>('accept')

  const fetchBookings = async () => {
    try {
      setIsRefreshing(true)
      
      const response = await fetch(`/api/bookings/doctor?specialization=${specialization}`)
      const data = await response.json()
      
      if (data.success) {
        setBookings(data.bookings)
      } else {
        toast.error('Failed to load bookings')
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchBookings()
    
    // Refresh bookings every 30 seconds
    const interval = setInterval(fetchBookings, 30000)
    return () => clearInterval(interval)
  }, [specialization])

  const handleBookingAction = async (booking: DoctorBooking, action: 'accept' | 'reject') => {
    setSelectedBooking(booking)
    setActionType(action)
    setRemarks('')
    setShowRemarksModal(true)
  }

  const confirmBookingAction = async () => {
    if (!selectedBooking) return

    try {
      const response = await fetch('/api/bookings/doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          action: actionType === 'accept' ? 'confirm' : 'reject',
          doctorSpecialization: specialization,
          remarks: remarks.trim() || undefined
        })
      })
      
      if (response.ok) {
        toast.success(`Booking ${actionType}ed successfully`)
        setShowRemarksModal(false)
        setSelectedBooking(null)
        setRemarks('')
        fetchBookings() // Refresh data
      } else {
        toast.error(`Failed to ${actionType} booking`)
      }
    } catch (error) {
      toast.error(`Failed to ${actionType} booking`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'tentative': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDoctorResponseColor = (response: string) => {
    switch (response) {
      case 'accepted': return 'text-green-600'
      case 'declined': return 'text-red-600'
      case 'tentative': return 'text-yellow-600'
      case 'needsAction': return 'text-blue-600'
      default: return 'text-gray-600'
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Patient Bookings</h1>
          <p className="text-gray-600 mt-1">Manage your patient appointments and consultations</p>
        </div>
        <button
          onClick={fetchBookings}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-blue-900">Upcoming Appointments</h2>
          <p className="text-gray-600 mt-1">Review and manage patient booking requests</p>
        </div>
        
        <div className="p-6">
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No bookings available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{booking.patientName || 'Unknown Patient'}</h3>
                          <span className="text-sm text-gray-500">{booking.patientEmail}</span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(booking.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{booking.time}</span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <h4 className="font-medium text-gray-900 mb-1">Consultation Reason:</h4>
                          <p className="text-gray-600 text-sm">{booking.reason}</p>
                          {booking.analysisId && (
                            <p className="text-blue-600 text-sm mt-1">Analysis ID: {booking.analysisId}</p>
                          )}
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status.toUpperCase()}
                          </span>
                          <span className={`text-xs font-medium ${getDoctorResponseColor(booking.doctorResponse)}`}>
                            Your Response: {booking.doctorResponse.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>

                        {booking.remarks && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-gray-900 mb-1">Your Remarks:</h5>
                            <p className="text-gray-600 text-sm">{booking.remarks}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {booking.doctorResponse === 'needsAction' && (
                        <>
                          <button
                            onClick={() => handleBookingAction(booking, 'accept')}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleBookingAction(booking, 'reject')}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                      
                      {booking.status === 'confirmed' && booking.doctorResponse === 'accepted' && (
                        <a
                          href={booking.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Meeting</span>
                        </a>
                      )}

                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Booked: {new Date(booking.created).toLocaleDateString()}</span>
                      {booking.updated !== booking.created && (
                        <span>Updated: {new Date(booking.updated).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Remarks Modal */}
      {showRemarksModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {actionType === 'accept' ? 'Accept' : 'Reject'} Booking
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Patient: <span className="font-medium">{selectedBooking.patientName}</span>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Date: <span className="font-medium">{new Date(selectedBooking.date).toLocaleDateString()}</span>
              </p>
              <p className="text-sm text-gray-600">
                Time: <span className="font-medium">{selectedBooking.time}</span>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks (Optional)
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={`Add any remarks for ${actionType}ing this booking...`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={confirmBookingAction}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                  actionType === 'accept' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm {actionType === 'accept' ? 'Accept' : 'Reject'}
              </button>
              <button
                onClick={() => {
                  setShowRemarksModal(false)
                  setSelectedBooking(null)
                  setRemarks('')
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}