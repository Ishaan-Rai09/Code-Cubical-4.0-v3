import { pinataService } from './pinata'
import { decryptMedicalData } from './encryption'

interface PinataFile {
  id: string
  ipfs_pin_hash: string
  size: number
  user_id: string
  date_pinned: string
  date_unpinned?: string
  metadata: {
    name: string
    keyvalues: Record<string, string>
  }
  regions: any[]
  mime_type: string
  number_of_files: number
}

interface PatientData {
  patientId: string
  analysisId: string
  userId: string
  name: string
  email: string
  phone: string
  imageType: string
  additionalNotes: string
  originalFileName: string
  fileSize: number
  fileHash: string
  medicalImageHash: string
  analysisResult: {
    anomalyDetected: boolean
    confidence: number
    findings: string[]
    recommendations: string[]
    technicalDetails: any
  }
  uploadTimestamp: string
  status: string
}

interface PDFData {
  fileName: string
  fileSize: number
  reportId: string
  patientName: string
  userId: string
  generatedAt: string
  pdfData: number[]
}

export class PinataDataService {
  
  // Fetch all patient data files for a specific user
  async fetchUserPatientData(userId: string): Promise<PatientData[]> {
    try {
      console.log(`[PINATA_DATA] Fetching patient data for user: ${userId}`)
      
      // Note: Pinata doesn't have a direct search API, so we'll need to implement
      // a workaround. For now, we'll return empty array and log the limitation.
      
      console.warn('[PINATA_DATA] Pinata search functionality is limited. Consider implementing a metadata index.')
      
      // In a real implementation, you would need to:
      // 1. Maintain an index of file hashes for each user
      // 2. Use Pinata's pin list API with filters
      // 3. Or implement a separate metadata database
      
      return []
      
    } catch (error) {
      console.error('[PINATA_DATA] Error fetching patient data:', error)
      return []
    }
  }

  // Fetch and decrypt a specific patient data file
  async fetchAndDecryptPatientData(ipfsHash: string): Promise<PatientData | null> {
    try {
      console.log(`[PINATA_DATA] Fetching and decrypting patient data: ${ipfsHash}`)
      
      const encryptedData = await pinataService.getFile(ipfsHash)
      const decryptedData = decryptMedicalData(encryptedData) as PatientData
      
      return decryptedData
      
    } catch (error) {
      console.error(`[PINATA_DATA] Error fetching patient data ${ipfsHash}:`, error)
      return null
    }
  }

  // Fetch all PDF reports for a specific user
  async fetchUserPDFReports(userId: string): Promise<PDFData[]> {
    try {
      console.log(`[PINATA_DATA] Fetching PDF reports for user: ${userId}`)
      
      // Same limitation as above - Pinata search is limited
      console.warn('[PINATA_DATA] PDF report search functionality is limited.')
      
      return []
      
    } catch (error) {
      console.error('[PINATA_DATA] Error fetching PDF reports:', error)
      return []
    }
  }

  // Generate analytics from patient data
  generateAnalytics(patientDataList: PatientData[]) {
    const totalScans = patientDataList.length
    const anomaliesDetected = patientDataList.filter(p => p.analysisResult.anomalyDetected).length
    const normalScans = totalScans - anomaliesDetected
    const averageConfidence = totalScans > 0 
      ? patientDataList.reduce((acc, p) => acc + p.analysisResult.confidence, 0) / totalScans 
      : 0

    const scansByType = {
      brain: patientDataList.filter(p => p.imageType === 'brain').length,
      heart: patientDataList.filter(p => p.imageType === 'heart').length,
      lungs: patientDataList.filter(p => p.imageType === 'lungs').length,
      liver: patientDataList.filter(p => p.imageType === 'liver').length,
    }

    const recentActivity = patientDataList
      .sort((a, b) => new Date(b.uploadTimestamp).getTime() - new Date(a.uploadTimestamp).getTime())
      .slice(0, 5)
      .map(p => ({
        _id: p.analysisId,
        analysisId: p.analysisId,
        patientId: p.patientId,
        imageType: p.imageType,
        anomalyDetected: p.analysisResult.anomalyDetected,
        confidence: p.analysisResult.confidence,
        status: p.status,
        createdAt: p.uploadTimestamp,
        originalImageHash: p.medicalImageHash,
        patientName: p.name
      }))

    return {
      totalScans,
      anomaliesDetected,
      normalScans,
      averageConfidence,
      scansByType,
      recentActivity
    }
  }

  // Convert patient data to reports format
  convertToReportsFormat(patientDataList: PatientData[]) {
    return patientDataList.map(p => ({
      _id: p.analysisId,
      analysisId: p.analysisId,
      patientId: {
        _id: p.patientId,
        encryptedData: p // Include full patient data
      },
      imageType: p.imageType,
      anomalyDetected: p.analysisResult.anomalyDetected,
      confidence: p.analysisResult.confidence,
      status: p.status,
      createdAt: p.uploadTimestamp,
      originalImageHash: p.medicalImageHash
    }))
  }
}

export const pinataDataService = new PinataDataService()