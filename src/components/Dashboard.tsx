'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload,
  Brain,
  Heart,
  Wind,
  Activity,
  User,
  Phone,
  Mail,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  X
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import AnalysisReport from './AnalysisReport'

interface DashboardProps {
  onBack?: () => void
}

interface FormData {
  name: string
  email: string
  phone: string
  imageType: 'brain' | 'heart' | 'lungs' | 'liver'
  additionalNotes?: string
}

interface AnalysisResult {
  id: string
  patientName: string
  imageType: string
  anomalyDetected: boolean
  confidence: number
  findings: string[]
  recommendations: string[]
  timestamp: Date
  reportUrl?: string
}

export default function Dashboard({ onBack }: DashboardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [showReport, setShowReport] = useState(false)

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>()
  const imageType = watch('imageType')

  const imageTypeOptions = [
    { value: 'brain', label: 'Brain MRI', icon: Brain, color: 'from-purple-500 to-pink-500' },
    { value: 'heart', label: 'Cardiac Scan', icon: Heart, color: 'from-red-500 to-rose-500' },
    { value: 'lungs', label: 'Lung CT', icon: Wind, color: 'from-blue-500 to-cyan-500' },
    { value: 'liver', label: 'Liver Scan', icon: Activity, color: 'from-green-500 to-emerald-500' }
  ]

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      toast.success('Image uploaded successfully!')
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.dicom', '.dcm']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024 // 50MB
  })


  const onSubmit = async (data: FormData) => {
    if (!uploadedFile) {
      toast.error('Please upload an image first')
      return
    }

    setIsAnalyzing(true)
    
    try {
      // Create FormData for backend upload
      const formData = new FormData()
      formData.append('file', uploadedFile)
      formData.append('patientData', JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        imageType: data.imageType,
        additionalNotes: data.additionalNotes
      }))

      // Upload to backend (which handles Pinata storage and AI analysis)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Upload failed with status:', response.status, 'Error:', errorText)
        throw new Error(`Upload failed: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('Upload result:', result)
      
      // Transform backend result to match our interface
      const analysisResult: AnalysisResult = {
        id: result.analysisId,
        patientName: data.name,
        imageType: data.imageType,
        anomalyDetected: result.result.anomalyDetected,
        confidence: result.result.confidence,
        findings: result.result.findings,
        recommendations: result.result.recommendations,
        timestamp: new Date()
      }
      
      setAnalysisResult(analysisResult)
      setCurrentStep(3)
      
      // Data is now stored in MongoDB automatically
      console.log('Analysis completed and stored in MongoDB:', {
        analysisId: result.analysisId,
        patientId: result.patientId,
        mongoAnalysisId: result.mongoAnalysisId
      })
      
      toast.success('Analysis completed and stored securely in MongoDB!')
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDownloadReport = async () => {
    if (analysisResult) {
      try {
        toast.loading('Generating PDF report...', { id: 'pdf-generation' })
        
        // Call server-side PDF generation API
        const response = await fetch('/api/generate-pdf-pinata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            analysisResult
          })
        })

        if (!response.ok) {
          throw new Error('Failed to generate PDF')
        }

        const result = await response.json()
        
        if (result.success && result.pdfBase64) {
          // Download PDF locally
          const pdfBlob = new Blob([Uint8Array.from(atob(result.pdfBase64), c => c.charCodeAt(0))], { type: 'application/pdf' })
          const url = URL.createObjectURL(pdfBlob)
          const a = document.createElement('a')
          a.href = url
          a.download = result.fileName
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          
          toast.success('PDF report downloaded successfully!', { id: 'pdf-generation' })
        } else {
          toast.success('PDF report generated successfully!', { id: 'pdf-generation' })
        }
      } catch (error) {
        console.error('PDF generation error:', error)
        toast.error('Failed to generate PDF report. Please try again.', { id: 'pdf-generation' })
      }
    }
  }


  const resetForm = () => {
    setCurrentStep(1)
    setUploadedFile(null)
    setAnalysisResult(null)
    setShowReport(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AnimatePresence mode="wait">
          {/* Step 1: Upload Image */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h1 className="text-4xl font-luxury font-bold luxury-text-gradient mb-4">
                  Upload Medical Image
                </h1>
                <p className="text-xl text-gray-600">
                  Upload your MRI, CT, or medical scan for AI-powered analysis
                </p>
              </div>

              <div className="luxury-card">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive
                      ? 'border-luxury-gold bg-luxury-gold/5'
                      : 'border-gray-300 hover:border-luxury-gold hover:bg-luxury-gold/5'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-16 h-16 text-luxury-gold mx-auto mb-4" />
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-luxury-navy">
                        {uploadedFile.name}
                      </p>
                      <p className="text-gray-600">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <div className="flex items-center justify-center space-x-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span>File uploaded successfully</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-luxury-navy">
                        {isDragActive ? 'Drop your image here' : 'Drag & drop your medical image'}
                      </p>
                      <p className="text-gray-600">
                        or click to browse files
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports JPEG, PNG, DICOM (max 50MB)
                      </p>
                    </div>
                  )}
                </div>

                {uploadedFile && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="luxury-button"
                    >
                      Continue to Patient Details
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Patient Information */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h1 className="text-4xl font-luxury font-bold luxury-text-gradient mb-4">
                  Patient Information
                </h1>
                <p className="text-xl text-gray-600">
                  Please provide patient details for the analysis
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="luxury-card space-y-6">
                  {/* Personal Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-luxury-navy mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name
                      </label>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                        placeholder="Enter patient's full name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-luxury-navy mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address
                      </label>
                      <input
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        type="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                        placeholder="Enter email address"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-luxury-navy mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number
                    </label>
                    <input
                      {...register('phone', { required: 'Phone number is required' })}
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Image Type Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-luxury-navy mb-4">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Type of Medical Image
                    </label>
                    <div className="grid md:grid-cols-2 gap-4">
                      {imageTypeOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-300 ${
                            imageType === option.value
                              ? 'border-luxury-gold bg-luxury-gold/5'
                              : 'border-gray-300 hover:border-luxury-gold/50'
                          }`}
                        >
                          <input
                            {...register('imageType', { required: 'Please select image type' })}
                            type="radio"
                            value={option.value}
                            className="sr-only"
                          />
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center`}>
                              <option.icon className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-semibold text-luxury-navy">{option.label}</span>
                          </div>
                          {imageType === option.value && (
                            <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-luxury-gold" />
                          )}
                        </label>
                      ))}
                    </div>
                    {errors.imageType && (
                      <p className="text-red-500 text-sm mt-1">{errors.imageType.message}</p>
                    )}
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-luxury-navy mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      {...register('additionalNotes')}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                      placeholder="Any additional information or symptoms..."
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 border-2 border-luxury-gold text-luxury-navy font-semibold rounded-lg hover:bg-luxury-gold hover:text-white transition-all duration-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="luxury-button flex items-center"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Start AI Analysis'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 3: Analysis Results */}
          {currentStep === 3 && analysisResult && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h1 className="text-4xl font-luxury font-bold luxury-text-gradient mb-4">
                  Analysis Complete
                </h1>
                <p className="text-xl text-gray-600">
                  AI analysis has been completed for {analysisResult.patientName}
                </p>
              </div>

              <div className="luxury-card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    {analysisResult.anomalyDetected ? (
                      <AlertCircle className="w-8 h-8 text-orange-500" />
                    ) : (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-luxury-navy">
                        {analysisResult.anomalyDetected ? 'Anomaly Detected' : 'No Anomalies Detected'}
                      </h3>
                      <p className="text-gray-600">
                        Confidence: {(analysisResult.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReport(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-luxury-navy text-white rounded-lg hover:bg-luxury-navy/90 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Full Report</span>
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-luxury-navy mb-3">Key Findings</h4>
                    <ul className="space-y-2">
                      {analysisResult.findings.map((finding, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-luxury-gold rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-luxury-navy mb-3">Recommendations</h4>
                    <ul className="space-y-2">
                      {analysisResult.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-luxury-gold rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button
                    onClick={handleDownloadReport}
                    className="luxury-button flex items-center justify-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF Report
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    New Analysis
                  </button>
                </div>
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* Full Report Modal */}
      {showReport && analysisResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-luxury font-bold text-luxury-navy">
                Detailed Analysis Report
              </h2>
              <button
                onClick={() => setShowReport(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <AnalysisReport analysisResult={analysisResult} />
            </div>
          </motion.div>
        </div>
      )}

    </div>
  )
}