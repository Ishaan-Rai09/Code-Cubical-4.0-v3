'use client'

import { motion } from 'framer-motion'
import { 
  Calendar,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  Brain,
  Heart,
  Wind,
  Activity,
  Download,
  Printer
} from 'lucide-react'
// Lazy import to avoid loading Pinata service on page load
// import { generatePDFReport } from '../lib/pdfGenerator'
import toast from 'react-hot-toast'

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

interface AnalysisReportProps {
  analysisResult: AnalysisResult
}

export default function AnalysisReport({ analysisResult }: AnalysisReportProps) {
  const handleDownloadPDF = async () => {
    try {
      toast.loading('Generating and storing encrypted PDF report on Pinata...', { id: 'pdf-download' })
      
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
      
      if (result.success && result.ipfsHash) {
        // Download PDF locally
        if (result.pdfBase64) {
          const pdfBlob = new Blob([Uint8Array.from(atob(result.pdfBase64), c => c.charCodeAt(0))], { type: 'application/pdf' })
          const url = URL.createObjectURL(pdfBlob)
          const a = document.createElement('a')
          a.href = url
          a.download = result.fileName
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
        
        toast.success(`PDF report downloaded and stored securely on Pinata IPFS: ${result.ipfsHash}`, { id: 'pdf-download' })
      } else {
        toast.success('PDF report generated successfully!', { id: 'pdf-download' })
      }
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF report. Please try again.', { id: 'pdf-download' })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getImageTypeIcon = (type: string) => {
    switch (type) {
      case 'brain': return Brain
      case 'heart': return Heart
      case 'lungs': return Wind
      case 'liver': return Activity
      default: return FileText
    }
  }

  const getImageTypeColor = (type: string) => {
    switch (type) {
      case 'brain': return 'from-purple-500 to-pink-500'
      case 'heart': return 'from-red-500 to-rose-500'
      case 'lungs': return 'from-blue-500 to-cyan-500'
      case 'liver': return 'from-green-500 to-emerald-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const IconComponent = getImageTypeIcon(analysisResult.imageType)

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center border-b border-gray-200 pb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-luxury-gold to-yellow-500 rounded-lg flex items-center justify-center mr-3">
            <Activity className="w-6 h-6 text-luxury-navy" />
          </div>
          <h1 className="text-3xl font-luxury font-bold luxury-text-gradient">
            LuxeHealth AI
          </h1>
        </div>
        <h2 className="text-2xl font-semibold text-luxury-navy mb-2">
          Medical Image Analysis Report
        </h2>
        <p className="text-gray-600">
          Generated on {analysisResult.timestamp.toLocaleDateString()} at {analysisResult.timestamp.toLocaleTimeString()}
        </p>
      </div>

      {/* Patient Information */}
      <div className="luxury-card">
        <h3 className="text-xl font-semibold text-luxury-navy mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Patient Information
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Patient Name</label>
            <p className="text-lg font-semibold text-luxury-navy">{analysisResult.patientName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Analysis ID</label>
            <p className="text-lg font-mono text-luxury-navy">{analysisResult.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Image Type</label>
            <div className="flex items-center space-x-2 mt-1">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getImageTypeColor(analysisResult.imageType)} flex items-center justify-center`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-luxury-navy capitalize">
                {analysisResult.imageType} Scan
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Analysis Date</label>
            <p className="text-lg font-semibold text-luxury-navy">
              {analysisResult.timestamp.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Analysis Summary */}
      <div className="luxury-card">
        <h3 className="text-xl font-semibold text-luxury-navy mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Analysis Summary
        </h3>
        
        <div className="flex items-center space-x-4 mb-6 p-4 rounded-lg bg-gradient-to-r from-luxury-cream to-luxury-platinum">
          {analysisResult.anomalyDetected ? (
            <AlertTriangle className="w-12 h-12 text-orange-500" />
          ) : (
            <CheckCircle className="w-12 h-12 text-green-500" />
          )}
          <div>
            <h4 className="text-2xl font-bold text-luxury-navy">
              {analysisResult.anomalyDetected ? 'Anomaly Detected' : 'No Anomalies Detected'}
            </h4>
            <p className="text-lg text-gray-600">
              AI Confidence Level: <span className="font-semibold text-luxury-gold">
                {(analysisResult.confidence * 100).toFixed(1)}%
              </span>
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-luxury-navy mb-3 flex items-center">
              <div className="w-2 h-2 bg-luxury-gold rounded-full mr-2" />
              Detailed Findings
            </h4>
            <div className="space-y-3">
              {analysisResult.findings.map((finding, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-gray-50 rounded-lg border-l-4 border-luxury-gold"
                >
                  <p className="text-gray-700">{finding}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-luxury-navy mb-3 flex items-center">
              <div className="w-2 h-2 bg-luxury-gold rounded-full mr-2" />
              Medical Recommendations
            </h4>
            <div className="space-y-3">
              {analysisResult.recommendations.map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400"
                >
                  <p className="text-gray-700">{recommendation}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Details */}
      <div className="luxury-card">
        <h3 className="text-xl font-semibold text-luxury-navy mb-4">
          AI Analysis Methodology
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-purple-700 mb-2">Deep Learning</h4>
            <p className="text-sm text-purple-600">Advanced neural networks trained on millions of medical images</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-blue-700 mb-2">Pattern Recognition</h4>
            <p className="text-sm text-blue-600">Sophisticated algorithms for anomaly detection and classification</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-green-700 mb-2">Validation</h4>
            <p className="text-sm text-green-600">Results validated against clinical standards and expert review</p>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="luxury-card bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <h3 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Important Medical Disclaimer
        </h3>
        <div className="space-y-3 text-amber-700">
          <p>
            <strong>This AI analysis is for informational purposes only</strong> and should not be considered as a substitute for professional medical advice, diagnosis, or treatment.
          </p>
          <p>
            Always consult with qualified healthcare professionals for proper medical evaluation and treatment decisions.
          </p>
          <p>
            The AI system provides assistance to healthcare providers but does not replace clinical judgment and expertise.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-6 text-center text-gray-600">
        <p className="mb-2">
          Generated by LuxeHealth AI - Premium Medical Image Analysis Platform
        </p>
        <p className="text-sm">
          For questions about this report, please contact your healthcare provider or our support team.
        </p>
        <div className="flex justify-center space-x-4 mt-4">
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-luxury-navy text-white rounded-lg hover:bg-luxury-navy/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 border border-luxury-navy text-luxury-navy rounded-lg hover:bg-luxury-navy hover:text-white transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>
    </div>
  )
}