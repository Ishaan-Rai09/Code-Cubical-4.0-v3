'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { 
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Video,
  RefreshCw,
  Plus,
  Star
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import ReviewModal from './ReviewModal'

interface Booking {
  id: string
  patientEmail: string
  doctorSpecialization: string
  doctorName: string
  date: string
  time: string
  status: 'confirmed' | 'tentative' | 'cancelled'
  reason: string
  summary: string
  doctorResponse: 'accepted' | 'declined' | 'tentative' | 'needsAction'
  created: string
  updated: string
  meetingLink: string
}

export default function PatientBookings() {
  const { user } = useUser()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean
    booking?: Booking
  }>({ isOpen: false })

  const fetchBookings = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return

    try {
      setIsRefreshing(true)
      
      const response = await fetch(`/api/bookings/patient?patientEmail=${user.primaryEmailAddress.emailAddress}`)
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
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50'
      case 'cancelled': return 'text-red-600 bg-red-50'
      case 'tentative': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
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
      case 'heart': return 'Cardiologist'
      case 'brain': return 'Neurologist'
      case 'lungs': return 'Pulmonologist'
      case 'liver': return 'Hepatologist'
      default: return 'Specialist'
    }
  }

  const isMeetingCompleted = (booking: Booking) => {
    const appointmentDateTime = new Date(`${booking.date} ${booking.time}`)
    const currentTime = new Date()
    // Consider meeting completed if it's 1 hour past the appointment time
    const oneHourAfter = new Date(appointmentDateTime.getTime() + 60 * 60 * 1000)
    return currentTime > oneHourAfter && booking.status === 'confirmed' && booking.doctorResponse === 'accepted'
  }

  const openReviewModal = (booking: Booking) => {
    setReviewModal({ isOpen: true, booking })
  }

  const closeReviewModal = () => {
    setReviewModal({ isOpen: false })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-luxury-navy">Your Appointments</h2>
          <p className="text-gray-600 mt-3">Manage your medical consultations</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={fetchBookings}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link href="/dashboard/user/booking">
            <button className="flex items-center space-x-2 luxury-button">
              <Plus className="w-4 h-4" />
              <span>Book New Appointment</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Appointments Yet</h3>
          <p className="text-gray-600 mb-6">You haven't booked any medical consultations yet.</p>
          <Link href="/dashboard/user/booking">
            <button className="luxury-button">
              Book Your First Appointment
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-200">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-14 h-14 bg-luxury-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-7 h-7 text-luxury-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-luxury-navy mb-2">
                      {getSpecializationDisplayName(booking.doctorSpecialization)} Consultation
                    </h3>
                    <p className="text-gray-600 font-medium mb-3">{booking.doctorName}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{booking.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColor(booking.status)}`}>
                    {booking.status.toUpperCase()}
                  </span>
                  <span className={`text-sm font-medium whitespace-nowrap ${getDoctorResponseColor(booking.doctorResponse)}`}>
                    Doctor: {booking.doctorResponse.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="font-medium text-gray-900 mb-3">Consultation Reason:</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{booking.reason}</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 mt-6 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  <p>Booked: {new Date(booking.created).toLocaleDateString()}</p>
                  {booking.updated !== booking.created && (
                    <p>Updated: {new Date(booking.updated).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {booking.status === 'confirmed' && booking.doctorResponse === 'accepted' && !isMeetingCompleted(booking) && (
                    <a
                      href={booking.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Meeting</span>
                    </a>
                  )}
                  {isMeetingCompleted(booking) && (
                    <button
                      onClick={() => openReviewModal(booking)}
                      className="flex items-center space-x-1 px-4 py-2 bg-luxury-gold text-luxury-navy rounded-lg hover:bg-luxury-gold/90 transition-colors text-sm"
                    >
                      <Star className="w-4 h-4" />
                      <span>Write Review</span>
                    </button>
                  )}
                  {booking.doctorResponse === 'needsAction' && (
                    <div className="flex items-center space-x-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Awaiting Doctor Response</span>
                    </div>
                  )}
                  {booking.status === 'cancelled' && (
                    <div className="flex items-center space-x-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm">
                      <XCircle className="w-4 h-4" />
                      <span>Cancelled</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Review Modal */}
      {reviewModal.isOpen && reviewModal.booking && (
        <ReviewModal
          isOpen={reviewModal.isOpen}
          onClose={closeReviewModal}
          doctorName={reviewModal.booking.doctorName}
          doctorSpecialization={reviewModal.booking.doctorSpecialization}
          bookingId={reviewModal.booking.id}
          patientEmail={user?.primaryEmailAddress?.emailAddress || ''}
        />
      )}
    </div>
  )
}
