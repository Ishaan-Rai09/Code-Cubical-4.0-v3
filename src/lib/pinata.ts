import axios from 'axios'

const PINATA_API_KEY = process.env.PINATA_API_KEY
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY
const PINATA_JWT = process.env.PINATA_JWT

interface PinataResponse {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

interface PinataMetadata {
  name: string
  keyvalues?: Record<string, string>
}

export class PinataService {
  private apiKey: string | null = null
  private secretApiKey: string | null = null
  private jwt: string | null = null
  private initialized = false

  private initialize() {
    if (this.initialized) {
      console.log('[PINATA] Service already initialized')
      return
    }

    console.log('[PINATA] Initializing Pinata service...')
    console.log('[PINATA] Checking environment variables:')
    console.log('[PINATA] - PINATA_API_KEY:', PINATA_API_KEY ? 'Present' : 'Missing')
    console.log('[PINATA] - PINATA_SECRET_API_KEY:', PINATA_SECRET_API_KEY ? 'Present' : 'Missing')
    console.log('[PINATA] - PINATA_JWT:', PINATA_JWT ? 'Present' : 'Missing')

    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      console.warn('[PINATA] Pinata API credentials not found in environment variables - Pinata features will be disabled')
      console.warn('[PINATA] Please set PINATA_API_KEY and PINATA_SECRET_API_KEY in your environment')
      return
    }
    
    this.apiKey = PINATA_API_KEY
    this.secretApiKey = PINATA_SECRET_API_KEY
    this.jwt = PINATA_JWT || null
    this.initialized = true
    console.log('[PINATA] Service initialized successfully')
  }

  private checkCredentials() {
    this.initialize()
    if (!this.apiKey || !this.secretApiKey) {
      throw new Error('Pinata API credentials not available - please check environment variables')
    }
  }

  async uploadFile(file: File, metadata: PinataMetadata): Promise<PinataResponse> {
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log(`[PINATA][${uploadId}] Starting file upload at ${new Date().toISOString()}`)
    console.log(`[PINATA][${uploadId}] File details:`, {
      name: file.name,
      size: file.size,
      type: file.type
    })
    console.log(`[PINATA][${uploadId}] Metadata:`, metadata)
    
    this.checkCredentials()
    
    try {
      console.log(`[PINATA][${uploadId}] Creating FormData...`)
      const formData = new FormData()
      formData.append('file', file)
      
      const pinataMetadata = JSON.stringify({
        name: metadata.name,
        keyvalues: metadata.keyvalues || {}
      })
      console.log(`[PINATA][${uploadId}] Pinata metadata:`, pinataMetadata)
      formData.append('pinataMetadata', pinataMetadata)

      console.log(`[PINATA][${uploadId}] Making API request to Pinata...`)
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'pinata_api_key': this.apiKey!,
            'pinata_secret_api_key': this.secretApiKey!,
          },
        }
      )

      console.log(`[PINATA][${uploadId}] Upload successful!`)
      console.log(`[PINATA][${uploadId}] Response:`, {
        IpfsHash: response.data.IpfsHash,
        PinSize: response.data.PinSize,
        Timestamp: response.data.Timestamp
      })
      console.log(`[PINATA][${uploadId}] Gateway URL: https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`)
      
      return response.data
    } catch (error) {
      console.error(`[PINATA][${uploadId}] Upload failed!`)
      console.error(`[PINATA][${uploadId}] Error details:`, {
        message: error instanceof Error ? error.message : String(error),
        response: (error as any).response?.data,
        status: (error as any).response?.status,
        statusText: (error as any).response?.statusText
      })
      
      if ((error as any).response) {
        console.error(`[PINATA][${uploadId}] Response headers:`, (error as any).response.headers)
        console.error(`[PINATA][${uploadId}] Response data:`, (error as any).response.data)
      }
      
      throw new Error(`Failed to upload file to Pinata: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async uploadJSON(jsonData: any, metadata: PinataMetadata): Promise<PinataResponse> {
    this.checkCredentials()
    
    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        {
          pinataContent: jsonData,
          pinataMetadata: {
            name: metadata.name,
            keyvalues: metadata.keyvalues || {}
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': this.apiKey!,
            'pinata_secret_api_key': this.secretApiKey!,
          },
        }
      )

      return response.data
    } catch (error) {
      console.error('Pinata JSON upload error:', error)
      throw new Error('Failed to upload JSON to Pinata')
    }
  }

  async getFile(ipfsHash: string): Promise<any> {
    try {
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`)
      return response.data
    } catch (error) {
      console.error('Pinata file retrieval error:', error)
      throw new Error('Failed to retrieve file from Pinata')
    }
  }

  async unpinFile(ipfsHash: string): Promise<void> {
    this.checkCredentials()
    
    try {
      await axios.delete(`https://api.pinata.cloud/pinning/unpin/${ipfsHash}`, {
        headers: {
          'pinata_api_key': this.apiKey!,
          'pinata_secret_api_key': this.secretApiKey!,
        },
      })
    } catch (error) {
      console.error('Pinata unpin error:', error)
      throw new Error('Failed to unpin file from Pinata')
    }
  }

  getGatewayUrl(ipfsHash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
  }
}

// Lazy instantiation to avoid environment variable issues
let _pinataService: PinataService | null = null

export const pinataService = {
  get instance(): PinataService {
    if (!_pinataService) {
      _pinataService = new PinataService()
    }
    return _pinataService
  },
  
  // Proxy methods to the instance
  async uploadFile(file: File, metadata: PinataMetadata): Promise<PinataResponse> {
    return this.instance.uploadFile(file, metadata)
  },
  
  async uploadJSON(jsonData: any, metadata: PinataMetadata): Promise<PinataResponse> {
    return this.instance.uploadJSON(jsonData, metadata)
  },
  
  async getFile(ipfsHash: string): Promise<any> {
    return this.instance.getFile(ipfsHash)
  },
  
  async unpinFile(ipfsHash: string): Promise<void> {
    return this.instance.unpinFile(ipfsHash)
  },
  
  getGatewayUrl(ipfsHash: string): string {
    return this.instance.getGatewayUrl(ipfsHash)
  }
}