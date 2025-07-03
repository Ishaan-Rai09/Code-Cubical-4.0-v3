import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { mongoService } from '@/lib/mongoService'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    console.log(`[ANALYTICS_MONGO] User authentication - User ID: ${userId}`)
    
    if (!userId) {
      console.log(`[ANALYTICS_MONGO] Authentication failed - no user ID`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`[ANALYTICS_MONGO] Generating analytics for user: ${userId}`)
    
    // Generate analytics from MongoDB
    const analytics = await mongoService.getUserAnalytics(userId)
    
    console.log(`[ANALYTICS_MONGO] Analytics generated:`, {
      totalScans: analytics.totalScans,
      anomaliesDetected: analytics.anomaliesDetected,
      normalScans: analytics.normalScans
    })
    
    return NextResponse.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('[ANALYTICS_MONGO] Error generating analytics:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}