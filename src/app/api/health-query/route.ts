import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { analyzeHealthQuery } from '@/lib/groqAIIntegrator'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { query } = body

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Health query is required' }, { status: 400 })
    }

    if (query.length > 1000) {
      return NextResponse.json({ error: 'Query too long. Please limit to 1000 characters.' }, { status: 400 })
    }

    console.log(`[HEALTH_QUERY] Processing query for user: ${userId}`)
    console.log(`[HEALTH_QUERY] Query: ${query.substring(0, 100)}...`)

    // Analyze the health query using AI
    const response = await analyzeHealthQuery(query, userId)

    console.log(`[HEALTH_QUERY] Response generated successfully`)

    return NextResponse.json({
      success: true,
      query: query,
      response: response,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[HEALTH_QUERY] Error processing health query:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process health query',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}