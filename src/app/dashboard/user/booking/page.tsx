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
  Activity,
  AlertTriangle,
  CheckCircle,
  Phone,
  MapPin,
  Shield
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
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-luxury-gold/10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-luxury-gold/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-luxury-gold" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-luxury-navy">Consultation Details</h2>
                <p className="text-gray-600">Fill in your appointment preferences</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <Stethoscope className="w-4 h-4 text-luxury-gold" />
                  <span>Doctor Specialization</span>
                </label>
                <div className="relative">
                  <select
                    name="doctorSpecialization"
                    value={formData.doctorSpecialization}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-all duration-200 bg-white appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Choose your specialist</option>
                    <option value="brain">🧠 Neurologist (Brain Specialist)</option>
                    <option value="heart">❤️ Cardiologist (Heart Specialist)</option>
                    <option value="lungs">🫁 Pulmonologist (Lung Specialist)</option>
                    <option value="liver">🍀 Hepatologist (Liver Specialist)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="w-4 h-4 text-luxury-gold" />
                    <span>Preferred Date</span>
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    min={minDate}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <Clock className="w-4 h-4 text-luxury-gold" />
                    <span>Preferred Time</span>
                  </label>
                  <div className="relative">
                    <select
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-all duration-200 bg-white appearance-none cursor-pointer"
                      required
                    >
                      <option value="">Select a time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <FileText className="w-4 h-4 text-luxury-gold" />
                  <span>Reason for Consultation</span>
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-all duration-200 resize-none"
                  placeholder="Please describe your symptoms, concerns, or reason for consultation..."
                  required
                />
                <div className="mt-1 text-xs text-gray-500">
                  Be as detailed as possible to help the doctor prepare for your consultation.
                </div>
              </div>

              {userAnalyses.length > 0 && (
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                    <Activity className="w-4 h-4 text-luxury-gold" />
                    <span>Related Analysis (Optional)</span>
                  </label>
                  <div className="relative">
                    <select
                      name="analysisId"
                      value={formData.analysisId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-all duration-200 bg-white appearance-none cursor-pointer"
                    >
                      <option value="">Select a related analysis</option>
                      {userAnalyses.map(analysis => (
                        <option key={analysis.id} value={analysis.id}>
                          📊 {analysis.imageType} - {new Date(analysis.createdAt).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Link this consultation to a previous analysis for better context.
                  </div>
                </div>
              )}

              {/* Form Summary */}
              {formData.doctorSpecialization && formData.preferredDate && formData.preferredTime && (
                <div className="bg-luxury-gold/5 border border-luxury-gold/20 rounded-xl p-4">
                  <h4 className="font-semibold text-luxury-navy mb-2 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-luxury-gold" />
                    <span>Booking Summary</span>
                  </h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><span className="font-medium">Specialist:</span> {getSpecializationName(formData.doctorSpecialization)}</p>
                    <p><span className="font-medium">Date:</span> {new Date(formData.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><span className="font-medium">Time:</span> {formData.preferredTime}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full luxury-button flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg py-4 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Booking Request</span>
                  </>
                )}
              </button>

              <div className="text-center text-xs text-gray-500">
                By submitting this request, you agree to our terms of service and privacy policy.
              </div>
            </form>
          </div>

          {/* Information Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-luxury-gold/10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-luxury-gold/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-luxury-gold" />
                </div>
                <h3 className="text-xl font-bold text-luxury-navy">How it Works</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-luxury-gold to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">1</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Submit Request</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">Fill out the consultation form with your preferred date, time, and medical concerns</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-luxury-gold to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">2</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Doctor Review</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">Our specialist will review your request and confirm availability within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-luxury-gold to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">3</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Confirmation</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">You'll receive a confirmation email with secure meeting link and instructions</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-luxury-navy to-luxury-navy/90 rounded-2xl p-6 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold">Important Notes</h3>
              </div>
              <ul className="space-y-3 text-sm text-luxury-cream/90">
                <li className="flex items-start space-x-3">
                  <Clock className="w-4 h-4 text-luxury-gold flex-shrink-0 mt-0.5" />
                  <span>Consultations are typically 30-60 minutes long</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FileText className="w-4 h-4 text-luxury-gold flex-shrink-0 mt-0.5" />
                  <span>Please have your analysis results ready for discussion</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Calendar className="w-4 h-4 text-luxury-gold flex-shrink-0 mt-0.5" />
                  <span>You can reschedule up to 24 hours before your appointment</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Shield className="w-4 h-4 text-luxury-gold flex-shrink-0 mt-0.5" />
                  <span>All consultations are conducted via secure video call</span>
                </li>
              </ul>
            </div>

            {/* Quick Contact Info */}
            <div className="bg-luxury-cream/50 rounded-2xl p-6 border border-luxury-gold/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-luxury-gold/10 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-luxury-gold" />
                </div>
                <h3 className="text-lg font-bold text-luxury-navy">Need Help?</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-luxury-gold" />
                  <span>Call us: (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-luxury-gold" />
                  <span>Email: support@medicalcenter.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-luxury-gold" />
                  <span>Available 24/7 for emergencies</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}