import { NextRequest, NextResponse } from 'next/server'
import { mongoService } from '@/lib/mongoService'

export async function GET() {
  try {
    console.log('Testing MongoDB connection and operations...')
    
    const testResult = await mongoService.testConnection()
    
    return NextResponse.json({
      success: testResult.success,
      message: testResult.message,
      timestamp: new Date().toISOString(),
      mongoUri: process.env.MONGODB_URI ? 'Configured' : 'Not configured'
    })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}