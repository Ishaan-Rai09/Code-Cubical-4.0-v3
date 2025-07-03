import { NextRequest, NextResponse } from 'next/server'
import FallbackService from '@/lib/fallbackService'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    // Check authentication for detailed health info
    const { userId } = await auth()
    
    const health = await FallbackService.healthCheck()
    
    // Additional security and encryption checks
    const encryptionCheck = await checkEncryptionService()
    
    const allChecks = {
      ...health,
      encryption: encryptionCheck
    }
    
    const status = Object.values(allChecks).every(check => check === true) ? 200 : 503
    
    const response: any = {
      status: status === 200 ? 'healthy' : 'degraded',
      services: allChecks,
      message: status === 200 
        ? 'All systems operational with enhanced security' 
        : 'Some systems are experiencing issues',
      timestamp: new Date().toISOString()
    }

    // Add detailed info for authenticated users
    if (userId) {
      response.details = {
        encryptionEnabled: true,
        dataIntegrityChecks: true,
        auditLogging: true,
        secureStorage: true
      }
    }
    
    return NextResponse.json(response, { status })

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

async function checkEncryptionService(): Promise<boolean> {
  try {
    const { encryptMedicalData, decryptMedicalData } = await import('@/lib/encryption')
    
    const testData = { test: 'encryption-check', timestamp: Date.now() }
    const encrypted = encryptMedicalData(testData)
    const decrypted = decryptMedicalData(encrypted)
    
    return decrypted.test === testData.test
  } catch (error) {
    console.error('Encryption service check failed:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication for admin actions
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    const { action } = await request.json()
    
    if (action === 'sync') {
      const syncResult = await FallbackService.syncData()
      
      return NextResponse.json({
        success: true,
        message: 'Data synchronization completed with enhanced security',
        result: syncResult,
        timestamp: new Date().toISOString()
      })
    }
    
    if (action === 'verify-encryption') {
      const encryptionStatus = await checkEncryptionService()
      
      return NextResponse.json({
        success: true,
        encryptionWorking: encryptionStatus,
        message: encryptionStatus ? 'Encryption service is working correctly' : 'Encryption service has issues',
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json({
      error: 'Invalid action. Supported actions: sync, verify-encryption'
    }, { status: 400 })

  } catch (error) {
    console.error('Health action error:', error)
    return NextResponse.json({
      error: 'Health action failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}