'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Stethoscope, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Shield,
  Award,
  Users,
  Brain,
  Heart,
  Wind,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function DoctorLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    licenseNumber: '',
    specialization: ''
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate doctor authentication
      // In a real app, this would validate against a doctor database
      if (formData.email && formData.password && formData.licenseNumber && formData.specialization) {
        // Store doctor session info
        const sessionData = {
          email: formData.email,
          licenseNumber: formData.licenseNumber,
          specialization: formData.specialization,
          loginTime: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          role: 'doctor',
          name: 'Dr. ' + formData.email.split('@')[0]
        }
        
        localStorage.setItem('doctorSession', JSON.stringify(sessionData))
        console.log('Doctor session stored:', sessionData)
        
        toast.success('Doctor login successful!')
        
        // Add a small delay to ensure localStorage is set
        setTimeout(() => {
          console.log('Redirecting to doctor dashboard...')
          window.location.href = '/dashboard/doctor'
        }, 500)
      } else {
        toast.error('Please fill in all required fields')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-blue-900">
                LuxeHealth AI - Doctor Portal
              </span>
            </Link>
            
            <Link href="/" className="flex items-center space-x-2 text-blue-700 hover:text-blue-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Login Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-blue-900 mb-2">Doctor Login</h1>
                <p className="text-gray-600">Access your professional medical analysis dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="doctor@hospital.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical License Number
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="MD123456789"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization
                  </label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      required
                    >
                      <option value="">Select your specialization</option>
                      <option value="brain">Neurologist (Brain Specialist)</option>
                      <option value="heart">Cardiologist (Heart Specialist)</option>
                      <option value="lungs">Pulmonologist (Lung Specialist)</option>
                      <option value="liver">Hepatologist (Liver Specialist)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Authenticating...
                    </div>
                  ) : (
                    'Access Doctor Dashboard'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Need help accessing your account?{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    Contact IT Support
                  </a>
                </p>
              </div>
            </motion.div>

            {/* Right Side - Demo Credentials */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-4xl font-bold text-blue-900 mb-6">
                  Professional Medical Analysis Platform
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Access advanced AI-powered medical imaging analysis tools designed specifically for healthcare professionals.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">Professional Validation</h3>
                    <p className="text-gray-600">Review and validate AI analysis results with professional medical expertise.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">Patient Case Management</h3>
                    <p className="text-gray-600">Manage patient cases, track analysis history, and provide professional consultations.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">HIPAA Compliant</h3>
                    <p className="text-gray-600">Secure, encrypted platform ensuring patient data privacy and regulatory compliance.</p>
                  </div>
                </div>
              </div>

              {/* Demo Credentials Section */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">Demo Credentials</h4>
                <p className="text-sm text-blue-700 mb-4">For demonstration purposes, you can use any of these accounts:</p>
                
                <div className="space-y-4 text-sm">
                  {/* Cardiologist */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <h5 className="font-semibold text-blue-900">Cardiologist (Heart Specialist)</h5>
                    </div>
                    <div className="space-y-1 text-blue-700">
                      <p><strong>Email:</strong> cardiologist@demo.com</p>
                      <p><strong>License:</strong> MD123456789</p>
                      <p><strong>Password:</strong> demo123</p>
                    </div>
                  </div>

                  {/* Neurologist */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-4 h-4 text-purple-500" />
                      <h5 className="font-semibold text-blue-900">Neurologist (Brain Specialist)</h5>
                    </div>
                    <div className="space-y-1 text-blue-700">
                      <p><strong>Email:</strong> neurologist@demo.com</p>
                      <p><strong>License:</strong> MD987654321</p>
                      <p><strong>Password:</strong> demo123</p>
                    </div>
                  </div>

                  {/* Pulmonologist */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Wind className="w-4 h-4 text-blue-500" />
                      <h5 className="font-semibold text-blue-900">Pulmonologist (Lung Specialist)</h5>
                    </div>
                    <div className="space-y-1 text-blue-700">
                      <p><strong>Email:</strong> pulmonologist@demo.com</p>
                      <p><strong>License:</strong> MD456789123</p>
                      <p><strong>Password:</strong> demo123</p>
                    </div>
                  </div>

                  {/* Hepatologist */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="w-4 h-4 text-green-500" />
                      <h5 className="font-semibold text-blue-900">Hepatologist (Liver Specialist)</h5>
                    </div>
                    <div className="space-y-1 text-blue-700">
                      <p><strong>Email:</strong> hepatologist@demo.com</p>
                      <p><strong>License:</strong> MD789123456</p>
                      <p><strong>Password:</strong> demo123</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-xs text-blue-600">
                    <strong>Quick Tip:</strong> Each doctor will only see cases related to their specialization in the dashboard.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}