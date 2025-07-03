import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { mongoService } from '@/lib/mongoService'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    console.log(`[REPORTS_MONGO] User authentication - User ID: ${userId}`)
    
    if (!userId) {
      console.log(`[REPORTS_MONGO] Authentication failed - no user ID`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`[REPORTS_MONGO] Fetching reports for user: ${userId}`)
    
    // Fetch user analyses from MongoDB
    const analyses = await mongoService.getUserAnalyses(userId)
    
    console.log(`[REPORTS_MONGO] Found ${analyses.length} analyses`)
    
    return NextResponse.json({
      success: true,
      reports: analyses,
      count: analyses.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('[REPORTS_MONGO] Error fetching reports:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch reports',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}