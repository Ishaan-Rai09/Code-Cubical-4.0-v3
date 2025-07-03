import CryptoJS from 'crypto-js'

const SECRET_KEY = process.env.AES_SECRET_KEY || 'default-secret-key-change-in-production'

// Validate that we have a proper secret key in production
if (process.env.NODE_ENV === 'production' && SECRET_KEY === 'default-secret-key-change-in-production') {
  throw new Error('AES_SECRET_KEY environment variable must be set in production')
}

export const encrypt = (text: string): string => {
  try {
    // Generate a random IV for each encryption
    const iv = CryptoJS.lib.WordArray.random(16)
    const encrypted = CryptoJS.AES.encrypt(text, SECRET_KEY, { iv }).toString()
    
    // Combine IV and encrypted data
    const combined = iv.toString() + ':' + encrypted
    return combined
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

export const decrypt = (encryptedText: string): string => {
  try {
    // Check if the encrypted text contains IV (new format)
    if (encryptedText.includes(':')) {
      const [ivString, encrypted] = encryptedText.split(':')
      const iv = CryptoJS.enc.Hex.parse(ivString)
      const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY, { iv })
      const decrypted = bytes.toString(CryptoJS.enc.Utf8)
      return decrypted
    } else {
      // Legacy format without IV (for backward compatibility)
      const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY)
      const decrypted = bytes.toString(CryptoJS.enc.Utf8)
      return decrypted
    }
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

export const encryptObject = (obj: any): string => {
  try {
    const jsonString = JSON.stringify(obj)
    return encrypt(jsonString)
  } catch (error) {
    console.error('Object encryption error:', error)
    throw new Error('Failed to encrypt object')
  }
}

export const decryptObject = (encryptedText: string): any => {
  try {
    const decryptedString = decrypt(encryptedText)
    return JSON.parse(decryptedString)
  } catch (error) {
    console.error('Object decryption error:', error)
    throw new Error('Failed to decrypt object')
  }
}

// Enhanced encryption for sensitive medical data
export const encryptMedicalData = (data: any): string => {
  try {
    // Add timestamp and data integrity hash
    const enhancedData = {
      ...data,
      _timestamp: new Date().toISOString(),
      _checksum: CryptoJS.SHA256(JSON.stringify(data)).toString()
    }
    
    return encryptObject(enhancedData)
  } catch (error) {
    console.error('Medical data encryption error:', error)
    throw new Error('Failed to encrypt medical data')
  }
}

// Enhanced decryption for sensitive medical data with integrity check
export const decryptMedicalData = (encryptedText: string): any => {
  try {
    const decryptedData = decryptObject(encryptedText)
    
    // Verify data integrity if checksum exists
    if (decryptedData._checksum) {
      const { _checksum, _timestamp, ...originalData } = decryptedData
      const calculatedChecksum = CryptoJS.SHA256(JSON.stringify(originalData)).toString()
      
      if (calculatedChecksum !== _checksum) {
        throw new Error('Data integrity check failed - data may have been tampered with')
      }
      
      return {
        ...originalData,
        _decryptedAt: new Date().toISOString(),
        _originalTimestamp: _timestamp
      }
    }
    
    // Return data as-is if no checksum (legacy data)
    return decryptedData
  } catch (error) {
    console.error('Medical data decryption error:', error)
    throw new Error('Failed to decrypt medical data')
  }
}

// Generate secure hash for file integrity
export const generateFileHash = (fileContent: string | ArrayBuffer): string => {
  try {
    const hash = CryptoJS.SHA256(fileContent.toString()).toString()
    return hash
  } catch (error) {
    console.error('File hash generation error:', error)
    throw new Error('Failed to generate file hash')
  }
}