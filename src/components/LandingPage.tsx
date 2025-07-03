'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Heart, 
  Wind, 
  Activity,
  Shield,
  Zap,
  Award,
  ChevronRight,
  Star,
  Users,
  Clock,
  CheckCircle,
  Stethoscope,
  LogOut
} from 'lucide-react'
import { SignInButton, SignOutButton } from '@clerk/nextjs'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface LandingPageProps {
  onGetStarted?: () => void // Optional since we use Link navigation now
  isAuthenticated?: boolean
  user?: any
}

interface DoctorSession {
  email: string
  licenseNumber: string
  specialization: string
  loginTime: string
  lastActivity?: string
  role: string
  name: string
}

export default function LandingPage({ onGetStarted, isAuthenticated, user }: LandingPageProps) {
  const [doctorSession, setDoctorSession] = useState<DoctorSession | null>(null)

  useEffect(() => {
    // Check for doctor session on component mount
    const checkDoctorSession = () => {
      const sessionData = localStorage.getItem('doctorSession')
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData)
          setDoctorSession(session)
        } catch (error) {
          console.error('Error parsing doctor session:', error)
          localStorage.removeItem('doctorSession')
        }
      } else {
        setDoctorSession(null)
      }
    }

    checkDoctorSession()

    // Listen for storage changes (when doctor logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'doctorSession') {
        checkDoctorSession()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also check periodically in case of same-tab changes
    const interval = setInterval(checkDoctorSession, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const handleDoctorSignOut = () => {
    localStorage.removeItem('doctorSession')
    setDoctorSession(null)
    toast.success('Doctor signed out successfully')
  }
  const features = [
    {
      icon: Brain,
      title: "Brain Analysis",
      description: "Advanced AI detection of neurological anomalies and tumors"
    },
    {
      icon: Heart,
      title: "Cardiac Imaging",
      description: "Comprehensive heart condition analysis and risk assessment"
    },
    {
      icon: Wind,
      title: "Pulmonary Scan",
      description: "Detailed lung examination for respiratory conditions"
    },
    {
      icon: Activity,
      title: "Liver Function",
      description: "Hepatic analysis for liver health and disease detection"
    }
  ]

  const stats = [
    { number: "99.7%", label: "Accuracy Rate" },
    { number: "10K+", label: "Scans Analyzed" },
    { number: "500+", label: "Healthcare Partners" },
    { number: "24/7", label: "AI Availability" }
  ]

  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "Chief Radiologist",
      content: "LuxeHealth AI has revolutionized our diagnostic process. The accuracy and speed are unprecedented.",
      rating: 5
    },
    {
      name: "Dr. Michael Rodriguez",
      role: "Neurologist",
      content: "The brain tumor detection capabilities are remarkable. It's like having a specialist AI assistant.",
      rating: 5
    },
    {
      name: "Dr. Emily Watson",
      role: "Cardiologist",
      content: "The cardiac analysis features have significantly improved our patient outcomes.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-cream via-white to-luxury-platinum">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-luxury-gold to-yellow-500 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-luxury-navy" />
              </div>
              <span className="text-2xl font-luxury font-bold luxury-text-gradient">
                LuxeHealth AI
              </span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center space-x-8"
            >
              <a href="#features" className="text-luxury-navy hover:text-luxury-gold transition-colors">Features</a>
              <a href="#about" className="text-luxury-navy hover:text-luxury-gold transition-colors">About</a>
              <a href="#testimonials" className="text-luxury-navy hover:text-luxury-gold transition-colors">Reviews</a>
              
              {doctorSession ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-900 font-medium">
                      {doctorSession.name}
                    </span>
                  </div>
                  <Link href="/dashboard/doctor">
                    <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                      Doctor Dashboard
                    </button>
                  </Link>
                  <button
                    onClick={handleDoctorSignOut}
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-luxury-navy">
                    Welcome, {user?.firstName}!
                  </div>
                  <Link href="/dashboard/user">
                    <button className="luxury-button">
                      Patient Dashboard
                    </button>
                  </Link>
                  <SignOutButton>
                    <button className="px-4 py-2 text-luxury-navy border border-luxury-navy rounded-lg hover:bg-luxury-navy hover:text-white transition-colors">
                      Sign Out
                    </button>
                  </SignOutButton>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/doctor-login">
                    <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                      Doctor Login
                    </button>
                  </Link>
                  <Link href="/dashboard/user">
                    <button className="luxury-button">
                      Patient Login
                    </button>
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-7xl font-luxury font-bold leading-tight">
                <span className="luxury-text-gradient">Premium AI</span>
                <br />
                <span className="text-luxury-navy">Medical Analysis</span>
              </h1>
              <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                Experience the future of healthcare with our luxury AI-powered medical imaging platform. 
                Get instant, accurate analysis of MRI scans with the elegance you deserve.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                {doctorSession ? (
                  <>
                    <Link href="/dashboard/doctor">
                      <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center group">
                        <Stethoscope className="w-5 h-5 mr-2" />
                        Doctor Dashboard
                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                    <Link href="/dashboard/user">
                      <button className="px-8 py-3 border-2 border-luxury-gold text-luxury-navy font-semibold rounded-lg hover:bg-luxury-gold hover:text-white transition-all duration-300">
                        Patient Portal
                      </button>
                    </Link>
                  </>
                ) : isAuthenticated ? (
                  <Link href="/dashboard/user">
                    <button className="luxury-button flex items-center justify-center group">
                      Start Patient Analysis
                      <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link href="/dashboard/user">
                      <button className="luxury-button flex items-center justify-center group">
                        Patient Portal
                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                    <Link href="/doctor-login">
                      <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300">
                        Doctor Portal
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="luxury-card p-8">
                <div className="grid grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="text-center p-4 rounded-lg bg-gradient-to-br from-luxury-gold/10 to-luxury-navy/10 hover:from-luxury-gold/20 hover:to-luxury-navy/20 transition-all duration-300"
                    >
                      <feature.icon className="w-8 h-8 text-luxury-gold mx-auto mb-2" />
                      <h3 className="font-semibold text-luxury-navy text-sm">{feature.title}</h3>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-luxury-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-luxury font-bold text-luxury-gold mb-2">
                  {stat.number}
                </div>
                <div className="text-luxury-platinum text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-luxury font-bold luxury-text-gradient mb-6">
              Advanced AI Capabilities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our cutting-edge AI technology provides comprehensive analysis across multiple medical imaging modalities
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {features.map((feature, index) => (
                <div key={feature.title} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-luxury-gold to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-luxury-navy" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-luxury-navy mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="luxury-card"
            >
              <h3 className="text-2xl font-luxury font-bold text-luxury-navy mb-6">
                Why Choose LuxeHealth AI?
              </h3>
              <div className="space-y-4">
                {[
                  "99.7% accuracy in anomaly detection",
                  "Instant analysis and reporting",
                  "HIPAA compliant and secure",
                  "24/7 AI availability",
                  "Comprehensive PDF reports",
                  "Real-time analysis results"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-luxury-gold" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gradient-to-r from-luxury-cream to-luxury-platinum">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-luxury font-bold luxury-text-gradient mb-6">
              Trusted by Healthcare Professionals
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="luxury-card"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-luxury-gold fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-luxury-navy">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-r from-luxury-navy to-luxury-navy/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-luxury font-bold text-luxury-gold mb-6">
              About LuxeHealth AI
            </h2>
            <p className="text-xl text-luxury-platinum max-w-3xl mx-auto">
              We're revolutionizing healthcare through cutting-edge artificial intelligence and luxurious user experience.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-semibold text-luxury-gold mb-4">
                Our Mission
              </h3>
              <p className="text-luxury-platinum leading-relaxed">
                At LuxeHealth AI, we believe that premium healthcare technology should be accessible, 
                accurate, and elegantly designed. Our mission is to empower healthcare professionals 
                with AI-powered insights that save lives and improve patient outcomes.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Shield, text: "HIPAA Compliant & Secure" },
                  { icon: Zap, text: "Instant AI Analysis" },
                  { icon: Award, text: "99.7% Accuracy Rate" },
                  { icon: Users, text: "Trusted by 500+ Hospitals" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <item.icon className="w-6 h-6 text-luxury-gold" />
                    <span className="text-luxury-platinum">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8"
            >
              <h3 className="text-2xl font-semibold text-luxury-gold mb-6">
                Our Technology
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-luxury-gold rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-luxury-navy" />
                  </div>
                  <div>
                    <h4 className="text-luxury-gold font-semibold">Advanced AI Models</h4>
                    <p className="text-luxury-platinum text-sm">State-of-the-art deep learning algorithms trained on millions of medical images.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-luxury-gold rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-luxury-navy" />
                  </div>
                  <div>
                    <h4 className="text-luxury-gold font-semibold">Real-time Processing</h4>
                    <p className="text-luxury-platinum text-sm">Get analysis results in seconds, not hours or days.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-luxury-gold rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-luxury-navy" />
                  </div>
                  <div>
                    <h4 className="text-luxury-gold font-semibold">Enterprise Security</h4>
                    <p className="text-luxury-platinum text-sm">Bank-level encryption and HIPAA-compliant data handling.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Payments Section */}
      <section id="payments" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-luxury font-bold luxury-text-gradient mb-6">
              Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your healthcare needs. No hidden fees, no surprises.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Basic Analysis",
                price: "$29",
                period: "per scan",
                features: [
                  "Single medical image analysis",
                  "AI-powered diagnostics",
                  "Basic report generation",
                  "Email support"
                ],
                popular: false
              },
              {
                name: "Premium Package",
                price: "$99",
                period: "monthly",
                features: [
                  "Up to 10 analyses per month",
                  "Priority processing",
                  "Detailed PDF reports",
                  "Phone & email support",
                  "Advanced AI algorithms"
                ],
                popular: true
              },
              {
                name: "Enterprise",
                price: "$299",
                period: "monthly",
                features: [
                  "Unlimited analyses",
                  "Instant processing",
                  "Custom report templates",
                  "24/7 dedicated support",
                  "API access",
                  "Multi-user accounts"
                ],
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative luxury-card ${plan.popular ? 'ring-2 ring-luxury-gold scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-luxury-gold text-luxury-navy px-4 py-1 text-sm font-medium rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-luxury-navy mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-luxury-navy mb-1">{plan.price}</div>
                  <p className="text-gray-600 text-sm">{plan.period}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-luxury-gold text-luxury-navy hover:bg-luxury-gold/90'
                    : 'bg-luxury-navy text-white hover:bg-luxury-navy/90'
                }`}>
                  {isAuthenticated ? 'Select Plan' : 'Get Started'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-luxury-navy">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-luxury font-bold text-luxury-gold mb-6">
              Ready to Experience Premium Healthcare AI?
            </h2>
            <p className="text-xl text-luxury-platinum mb-8">
              Join thousands of healthcare professionals who trust LuxeHealth AI for accurate medical imaging analysis
            </p>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <button className="luxury-button text-lg px-12 py-4">
                  Start Your Analysis Today
                </button>
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="luxury-button text-lg px-12 py-4">
                  Start Your Analysis Today
                </button>
              </SignInButton>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-luxury-navy border-t border-luxury-gold/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-luxury-gold to-yellow-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-luxury-navy" />
                </div>
                <span className="text-xl font-luxury font-bold text-luxury-gold">
                  LuxeHealth AI
                </span>
              </div>
              <p className="text-luxury-platinum">
                Premium AI-powered medical imaging analysis for the modern healthcare professional.
              </p>
            </div>
            
            <div>
              <h3 className="text-luxury-gold font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-luxury-platinum">
                <li>Brain Analysis</li>
                <li>Cardiac Imaging</li>
                <li>Lung Scans</li>
                <li>Liver Function</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-luxury-gold font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-luxury-platinum">
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-luxury-gold font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-luxury-platinum">
                <li>support@luxehealth.ai</li>
                <li>+1 (555) 123-4567</li>
                <li>24/7 Support Available</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-luxury-gold/20 mt-8 pt-8 text-center text-luxury-platinum">
            <p>&copy; 2024 LuxeHealth AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}