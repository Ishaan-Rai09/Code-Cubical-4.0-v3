'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { 
  Calendar,
  Clock,
  User,
  Mail,
  FileText,
  Send,
  ArrowLeft,
  Stethoscope,
  Brain,
  Heart,
  Wind,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface BookingFormData {
  doctorSpecialization: string
  preferredDate: string
  preferredTime: string
  reason: string
  analysisId?: string
}

export default function BookingPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [formData, setFormData] = useState<BookingFormData>({
    doctorSpecialization: '',
    preferredDate: '',
    preferredTime: '',
    reason: '',
    analysisId: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userAnalyses, setUserAnalyses] = useState<any[]>([])

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [isLoaded, user, router])

  useEffect(() => {
    // Fetch user's recent analyses to link with booking
    const fetchUserAnalyses = async () => {
      try {
        const response = await fetch('/api/reports/user')
        const data = await response.json()
        if (data.success) {
          setUserAnalyses(data.analyses.slice(0, 5)) // Show last 5 analyses
        }
      } catch (error) {
        console.error('Error fetching user analyses:', error)
      }
    }

    if (user) {
      fetchUserAnalyses()
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientEmail: user?.primaryEmailAddress?.emailAddress,
          patientName: user?.fullName,
          ...formData
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Booking request submitted successfully!')
        router.push('/dashboard/user')
      } else {
        toast.error(data.error || 'Failed to submit booking request')
      }
    } catch (error) {
      toast.error('Failed to submit booking request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSpecializationIcon = (specialization: string) => {
    switch (specialization) {
      case 'brain': return <Brain className="w-5 h-5" />
      case 'heart': return <Heart className="w-5 h-5" />
      case 'lungs': return <Wind className="w-5 h-5" />
      case 'liver': return <Activity className="w-5 h-5" />
      default: return <Stethoscope className="w-5 h-5" />
    }
  }

  const getSpecializationName = (specialization: string) => {
    switch (specialization) {
      case 'brain': return 'Neurologist (Brain Specialist)'
      case 'heart': return 'Cardiologist (Heart Specialist)'
      case 'lungs': return 'Pulmonologist (Lung Specialist)'
      case 'liver': return 'Hepatologist (Liver Specialist)'
      default: return specialization
    }
  }

  // Generate time slots
  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
  ]

  // Get minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-luxury-gold"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-cream via-white to-luxury-cream">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-luxury-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard/user" className="flex items-center space-x-2 text-luxury-navy hover:text-luxury-gold transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-luxury-navy" />
                <span className="text-luxury-navy font-medium">{user.fullName}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-luxury-navy mb-4">Book a Consultation</h1>
          <p className="text-xl text-gray-600">Schedule an appointment with our medical specialists</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Booking Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-luxury-navy mb-6">Consultation Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor Specialization
                </label>
                <select
                  name="doctorSpecialization"
                  value={formData.doctorSpecialization}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  required
                >
                  <option value="">Select a specialist</option>
                  <option value="brain">Neurologist (Brain Specialist)</option>
                  <option value="heart">Cardiologist (Heart Specialist)</option>
                  <option value="lungs">Pulmonologist (Lung Specialist)</option>
                  <option value="liver">Hepatologist (Liver Specialist)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  min={minDate}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <select
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  required
                >
                  <option value="">Select a time</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Consultation
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                  placeholder="Please describe the reason for your consultation..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Analysis (Optional)
                </label>
                <select
                  name="analysisId"
                  value={formData.analysisId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                >
                  <option value="">Select a related analysis</option>
                  {userAnalyses.map(analysis => (
                    <option key={analysis.id} value={analysis.id}>
                      {analysis.imageType} - {new Date(analysis.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full luxury-button flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Booking Request</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Information Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-luxury-navy mb-4">How it Works</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-luxury-gold rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Submit Request</h4>
                    <p className="text-gray-600 text-sm">Fill out the consultation form with your preferred date and time</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-luxury-gold rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Doctor Review</h4>
                    <p className="text-gray-600 text-sm">Our specialist will review your request and confirm availability</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-luxury-gold rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Confirmation</h4>
                    <p className="text-gray-600 text-sm">You'll receive a confirmation email with meeting details</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-luxury-gold/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-luxury-navy mb-3">Important Notes</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-luxury-gold rounded-full mt-2"></div>
                  <span>Consultations are typically 30-60 minutes long</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-luxury-gold rounded-full mt-2"></div>
                  <span>Please have your analysis results ready for discussion</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-luxury-gold rounded-full mt-2"></div>
                  <span>You can reschedule up to 24 hours before your appointment</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-luxury-gold rounded-full mt-2"></div>
                  <span>All consultations are conducted via secure video call</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}