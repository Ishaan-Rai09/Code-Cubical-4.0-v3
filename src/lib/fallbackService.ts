import connectDB from './mongodb'
import Patient from './models/Patient'
import Analysis from './models/Analysis'
import { pinataService } from './pinata'
import { encryptMedicalData, decryptMedicalData } from './encryption'

export class FallbackService {
  /**
   * Store data with Pinata as primary and MongoDB as fallback
   */
  static async storeWithFallback(data: any, metadata: any, type: 'patient' | 'analysis' | 'pdf') {
    let pinataHash: string | undefined
    let mongoRecord: any

    try {
      // Try Pinata first
      if (type === 'pdf') {
        const uploadResult = await pinataService.uploadFile(data, metadata)
        pinataHash = uploadResult.IpfsHash
      } else {
        const uploadResult = await pinataService.uploadJSON(data, metadata)
        pinataHash = uploadResult.IpfsHash
      }
      console.log(`Successfully stored ${type} in Pinata:`, pinataHash)
    } catch (pinataError) {
      console.error(`Pinata storage failed for ${type}:`, pinataError)
    }

    try {
      // Always store in MongoDB as backup
      await connectDB()
      
      if (type === 'patient') {
        mongoRecord = await this.storePatientInMongo(data, pinataHash)
      } else if (type === 'analysis') {
        mongoRecord = await this.storeAnalysisInMongo(data, pinataHash)
      }
      
      console.log(`Successfully stored ${type} in MongoDB`)
    } catch (mongoError) {
      console.error(`MongoDB storage failed for ${type}:`, mongoError)
      
      // If both fail, throw error
      if (!pinataHash) {
        throw new Error(`Both Pinata and MongoDB storage failed for ${type}`)
      }
    }

    return {
      pinataHash,
      mongoRecord,
      primaryStorage: pinataHash ? 'pinata' : 'mongodb'
    }
  }

  /**
   * Retrieve data with fallback mechanism
   */
  static async retrieveWithFallback(identifier: string, type: 'patient' | 'analysis') {
    let data: any

    try {
      // Try MongoDB first (faster for structured queries)
      await connectDB()
      
      if (type === 'patient') {
        data = await Patient.findById(identifier)
      } else if (type === 'analysis') {
        data = await Analysis.findOne({ analysisId: identifier })
      }

      if (data) {
        console.log(`Successfully retrieved ${type} from MongoDB`)
        
        // If we have IPFS hash, try to get additional data from Pinata
        if (data.ipfsDataHash) {
          try {
            const pinataData = await pinataService.getFile(data.ipfsDataHash)
            return {
              mongoData: data,
              pinataData,
              source: 'hybrid'
            }
          } catch (pinataError) {
            console.warn('Failed to retrieve from Pinata, using MongoDB data only:', pinataError)
            return {
              mongoData: data,
              source: 'mongodb'
            }
          }
        }

        return {
          mongoData: data,
          source: 'mongodb'
        }
      }
    } catch (mongoError) {
      console.error(`MongoDB retrieval failed for ${type}:`, mongoError)
    }

    throw new Error(`Failed to retrieve ${type} with identifier: ${identifier}`)
  }

  /**
   * Sync data between Pinata and MongoDB
   */
  static async syncData() {
    try {
      await connectDB()
      
      // Find records without IPFS hashes
      const patientsWithoutIPFS = await Patient.find({ ipfsDataHash: { $exists: false } })
      const analysesWithoutIPFS = await Analysis.find({ reportPdfHash: { $exists: false } })

      console.log(`Found ${patientsWithoutIPFS.length} patients and ${analysesWithoutIPFS.length} analyses without IPFS backup`)

      // Backup patients to IPFS
      for (const patient of patientsWithoutIPFS) {
        try {
          const encryptedData = {
            encryptedData: patient.encryptedData,
            publicInfo: {
              name: patient.name,
              email: patient.email,
              createdAt: patient.createdAt
            }
          }

          const uploadResult = await pinataService.uploadJSON(encryptedData, {
            name: `patient-backup-${Date.now()}`,
            keyvalues: {
              patientId: patient._id.toString(),
              type: 'patient_backup',
              syncDate: new Date().toISOString()
            }
          })

          await Patient.findByIdAndUpdate(patient._id, {
            ipfsDataHash: uploadResult.IpfsHash
          })

          console.log(`Backed up patient ${patient._id} to IPFS: ${uploadResult.IpfsHash}`)
        } catch (error) {
          console.error(`Failed to backup patient ${patient._id}:`, error)
        }
      }

      return {
        patientsSynced: patientsWithoutIPFS.length,
        analysesSynced: analysesWithoutIPFS.length
      }
    } catch (error) {
      console.error('Sync operation failed:', error)
      throw error
    }
  }

  private static async storePatientInMongo(data: any, ipfsHash?: string) {
    // Extract patient info from the data structure
    const publicInfo = data.publicInfo || {}
    const encryptedData = data.encryptedData
    
    const patient = new Patient({
      name: publicInfo.name,
      email: publicInfo.email,
      phone: publicInfo.phone || '', // Phone might not be in publicInfo
      encryptedData: encryptedData,
      ipfsDataHash: ipfsHash
    })
    
    return await patient.save()
  }

  private static async storeAnalysisInMongo(data: any, ipfsHash?: string) {
    const analysis = new Analysis({
      patientId: data.patientId,
      analysisId: data.analysisId,
      imageType: data.imageType,
      originalImageHash: data.originalImageHash,
      encryptedResults: data.encryptedResults,
      reportPdfHash: ipfsHash,
      anomalyDetected: data.anomalyDetected,
      confidence: data.confidence,
      status: data.status || 'completed'
    })
    
    return await analysis.save()
  }

  /**
   * Health check for storage systems
   */
  static async healthCheck() {
    const health = {
      pinata: false,
      mongodb: false,
      timestamp: new Date().toISOString()
    }

    // Check Pinata
    try {
      await pinataService.uploadJSON({ test: 'health-check' }, {
        name: 'health-check',
        keyvalues: { type: 'health_check' }
      })
      health.pinata = true
    } catch (error) {
      console.error('Pinata health check failed:', error)
    }

    // Check MongoDB
    try {
      await connectDB()
      health.mongodb = true
    } catch (error) {
      console.error('MongoDB health check failed:', error)
    }

    return health
  }
}

export default FallbackService