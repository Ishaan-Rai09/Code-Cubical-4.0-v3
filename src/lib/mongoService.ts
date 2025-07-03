import connectDB from './mongodb'
import Patient, { IPatient } from './models/Patient'
import Analysis, { IAnalysis } from './models/Analysis'
import { encryptMedicalData, decryptMedicalData } from './encryption'
import mongoose from 'mongoose'

export interface PatientData {
  name: string
  email: string
  phone: string
  imageType: string
  additionalNotes: string
  originalFileName: string
  fileSize: number
  uploadTimestamp: string
  userId: string
}

export interface AnalysisData {
  anomalyDetected: boolean
  confidence: number
  findings: string[]
  recommendations: string[]
  technicalDetails: any
}

export interface FullAnalysisData {
  patientData: PatientData
  analysisResult: AnalysisData
  analysisId: string
  imageHash: string
  reportPdfHash?: string
  pinataHash?: string
}

export class MongoService {
  
  // Initialize database connection
  async connect() {
    try {
      await connectDB()
      console.log('[MONGO] Database connected successfully')
      return true
    } catch (error) {
      console.error('[MONGO] Database connection failed:', error)
      return false
    }
  }

  // Store patient data and analysis results
  async storeAnalysis(data: FullAnalysisData): Promise<{ patientId: string, analysisId: string }> {
    try {
      await this.connect()
      
      console.log('[MONGO] Storing analysis for patient:', data.patientData.name)
      
      // Encrypt patient data
      const encryptedPatientData = encryptMedicalData(data.patientData)
      
      // Create or find patient
      let patient = await Patient.findOne({ email: data.patientData.email })
      
      if (!patient) {
        patient = new Patient({
          name: data.patientData.name,
          email: data.patientData.email,
          phone: data.patientData.phone,
          encryptedData: JSON.stringify(encryptedPatientData)
        })
        await patient.save()
        console.log('[MONGO] New patient created:', patient._id)
      } else {
        // Update patient data
        patient.encryptedData = JSON.stringify(encryptedPatientData)
        await patient.save()
        console.log('[MONGO] Patient updated:', patient._id)
      }
      
      // Encrypt analysis results
      const encryptedAnalysisData = encryptMedicalData({
        ...data.analysisResult,
        patientData: data.patientData,
        imageHash: data.imageHash,
        fileHash: data.imageHash,
        timestamp: new Date().toISOString()
      })
      
      // Create analysis record
      const analysis = new Analysis({
        patientId: patient._id,
        analysisId: data.analysisId,
        imageType: data.patientData.imageType,
        originalImageHash: data.imageHash,
        encryptedResults: JSON.stringify(encryptedAnalysisData),
        reportPdfHash: data.reportPdfHash,
        pinataHash: data.pinataHash,
        anomalyDetected: data.analysisResult.anomalyDetected,
        confidence: data.analysisResult.confidence,
        status: 'completed'
      })
      
      await analysis.save()
      console.log('[MONGO] Analysis stored:', analysis._id)
      
      return {
        patientId: patient._id.toString(),
        analysisId: analysis._id.toString()
      }
      
    } catch (error) {
      console.error('[MONGO] Error storing analysis:', error)
      throw error
    }
  }

  // Get all analyses for a user
  async getUserAnalyses(userId: string): Promise<any[]> {
    try {
      await this.connect()
      
      console.log('[MONGO] Fetching analyses for user:', userId)
      
      // Find all patients for this user (by userId in encrypted data)
      const patients = await Patient.find({})
      const userPatients = []
      
      for (const patient of patients) {
        try {
          const decryptedData = JSON.parse(patient.encryptedData)
          const patientData = decryptMedicalData(decryptedData)
          if (patientData.userId === userId) {
            userPatients.push(patient)
          }
        } catch (error) {
          console.warn('[MONGO] Could not decrypt patient data for:', patient._id)
        }
      }
      
      if (userPatients.length === 0) {
        console.log('[MONGO] No patients found for user:', userId)
        return []
      }
      
      // Get all analyses for these patients
      const patientIds = userPatients.map(p => p._id)
      const analyses = await Analysis.find({
        patientId: { $in: patientIds }
      }).populate('patientId').sort({ createdAt: -1 })
      
      console.log(`[MONGO] Found ${analyses.length} analyses for user`)
      
      // Decrypt and format the results
      const formattedAnalyses = []
      
      for (const analysis of analyses) {
        try {
          const encryptedResults = JSON.parse(analysis.encryptedResults)
          const decryptedResults = decryptMedicalData(encryptedResults)
          
          const patient = analysis.patientId as IPatient
          const encryptedPatientData = JSON.parse(patient.encryptedData)
          const decryptedPatientData = decryptMedicalData(encryptedPatientData)
          
          formattedAnalyses.push({
            _id: analysis._id,
            analysisId: analysis.analysisId,
            patientId: {
              _id: patient._id,
              encryptedData: decryptedPatientData
            },
            imageType: analysis.imageType,
            anomalyDetected: analysis.anomalyDetected,
            confidence: analysis.confidence,
            status: analysis.status,
            createdAt: analysis.createdAt,
            originalImageHash: analysis.originalImageHash,
            reportPdfHash: analysis.reportPdfHash,
            decryptedResults
          })
        } catch (error) {
          console.warn('[MONGO] Could not decrypt analysis:', analysis._id)
        }
      }
      
      return formattedAnalyses
      
    } catch (error) {
      console.error('[MONGO] Error fetching user analyses:', error)
      return []
    }
  }

  // Get analytics for a user
  async getUserAnalytics(userId: string): Promise<any> {
    try {
      const analyses = await this.getUserAnalyses(userId)
      
      const totalScans = analyses.length
      const anomaliesDetected = analyses.filter(a => a.anomalyDetected).length
      const normalScans = totalScans - anomaliesDetected
      const averageConfidence = totalScans > 0 
        ? analyses.reduce((acc, a) => acc + a.confidence, 0) / totalScans 
        : 0

      const scansByType = {
        brain: analyses.filter(a => a.imageType === 'brain').length,
        heart: analyses.filter(a => a.imageType === 'heart').length,
        lungs: analyses.filter(a => a.imageType === 'lungs').length,
        liver: analyses.filter(a => a.imageType === 'liver').length,
      }

      const recentActivity = analyses
        .slice(0, 5)
        .map(a => ({
          _id: a._id,
          analysisId: a.analysisId,
          imageType: a.imageType,
          anomalyDetected: a.anomalyDetected,
          confidence: a.confidence,
          createdAt: a.createdAt,
          patientName: a.patientId.encryptedData.name
        }))

      return {
        totalScans,
        anomaliesDetected,
        normalScans,
        averageConfidence,
        scansByType,
        recentActivity
      }
      
    } catch (error) {
      console.error('[MONGO] Error generating analytics:', error)
      return {
        totalScans: 0,
        anomaliesDetected: 0,
        normalScans: 0,
        averageConfidence: 0,
        scansByType: { brain: 0, heart: 0, lungs: 0, liver: 0 },
        recentActivity: []
      }
    }
  }

  // Update analysis with PDF report hash
  async updateAnalysisWithPDF(analysisId: string, pdfHash: string): Promise<boolean> {
    try {
      await this.connect()
      
      const analysis = await Analysis.findOne({ analysisId })
      if (analysis) {
        analysis.reportPdfHash = pdfHash
        await analysis.save()
        console.log('[MONGO] Analysis updated with PDF hash:', analysisId)
        return true
      }
      
      return false
    } catch (error) {
      console.error('[MONGO] Error updating analysis with PDF:', error)
      return false
    }
  }

  // Update analysis with Pinata hash
  async updateAnalysisWithPinata(analysisId: string, pinataHash: string): Promise<boolean> {
    try {
      await this.connect()
      
      const analysis = await Analysis.findOne({ analysisId })
      if (analysis) {
        analysis.pinataHash = pinataHash
        await analysis.save()
        console.log('[MONGO] Analysis updated with Pinata hash:', analysisId)
        return true
      }
      
      return false
    } catch (error) {
      console.error('[MONGO] Error updating analysis with Pinata hash:', error)
      return false
    }
  }

  // Get specific analysis by ID
  async getAnalysisById(analysisId: string): Promise<any | null> {
    try {
      await this.connect()
      
      const analysis = await Analysis.findOne({ analysisId }).populate('patientId')
      if (!analysis) {
        return null
      }
      
      const encryptedResults = JSON.parse(analysis.encryptedResults)
      const decryptedResults = decryptMedicalData(encryptedResults)
      
      const patient = analysis.patientId as IPatient
      const encryptedPatientData = JSON.parse(patient.encryptedData)
      const decryptedPatientData = decryptMedicalData(encryptedPatientData)
      
      return {
        _id: analysis._id,
        analysisId: analysis.analysisId,
        patientId: {
          _id: patient._id,
          encryptedData: decryptedPatientData
        },
        imageType: analysis.imageType,
        anomalyDetected: analysis.anomalyDetected,
        confidence: analysis.confidence,
        status: analysis.status,
        createdAt: analysis.createdAt,
        originalImageHash: analysis.originalImageHash,
        reportPdfHash: analysis.reportPdfHash,
        decryptedResults
      }
      
    } catch (error) {
      console.error('[MONGO] Error fetching analysis by ID:', error)
      return null
    }
  }

  // Test database connection
  async testConnection(): Promise<{ success: boolean, message: string }> {
    try {
      await this.connect()
      
      // Test basic operations
      const testPatient = {
        name: 'Test Patient',
        email: `test_${Date.now()}@example.com`,
        phone: '1234567890',
        encryptedData: JSON.stringify(encryptMedicalData({ test: 'data' }))
      }
      
      const patient = new Patient(testPatient)
      await patient.save()
      
      const found = await Patient.findById(patient._id)
      await Patient.findByIdAndDelete(patient._id)
      
      if (found) {
        return { success: true, message: 'Database connection and operations working correctly' }
      } else {
        return { success: false, message: 'Database operations failed' }
      }
      
    } catch (error) {
      console.error('[MONGO] Connection test failed:', error)
      return { 
        success: false, 
        message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }
    }
  }
}

export const mongoService = new MongoService()