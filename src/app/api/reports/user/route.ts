import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { mongoService } from '@/lib/mongoService'

export async function GET(request: NextRequest) {
  try {
    // Get user authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`[REPORTS] Fetching reports for user from MongoDB: ${userId}`)

    // Fetch user analyses from MongoDB
    const reports = await mongoService.getUserAnalyses(userId)
    
    console.log(`[REPORTS] Fetched ${reports.length} reports from MongoDB`)

    return NextResponse.json({ 
      reports,
      success: true,
      count: reports.length
    })

  } catch (error) {
    console.error('Error fetching user reports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
