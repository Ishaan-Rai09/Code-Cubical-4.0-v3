import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { mongoService } from '@/lib/mongoService'

// User index storage on Pinata
const USER_INDEX_PREFIX = 'user-index-'

// In-memory cache for user file hashes (in production, this should be replaced with persistent storage)
const userDataIndex = new Map<string, string[]>()

// Helper function to get user index from Pinata
async function getUserIndex(userId: string): Promise<{ fileHashes: string[], indexHash?: string }> {
  try {
    // For now, we'll use a simple approach - store user index as encrypted JSON on Pinata
    // In a real implementation, you might want to use a more sophisticated indexing system
    
    console.log(`[USER_INDEX] Attempting to fetch user index for: ${userId}`)
    
    // Since Pinata doesn't have direct search, we'll need to implement a workaround
    // For now, return empty array - this will be populated as users upload data
    return { fileHashes: [] }
    
  } catch (error) {
    console.error(`[USER_INDEX] Error fetching user index:`, error)
    return { fileHashes: [] }
  }
}

// Helper function to update user index on Pinata
async function updateUserIndex(userId: string, newFileHash: string): Promise<void> {
  try {
    console.log(`[USER_INDEX] Updating user index for ${userId} with hash: ${newFileHash}`)
    
    // Get current index
    const currentIndex = await getUserIndex(userId)
    
    // Add new hash if not already present
    if (!currentIndex.fileHashes.includes(newFileHash)) {
      currentIndex.fileHashes.push(newFileHash)
      
      // Store updated index (for now, just log - in production, store on Pinata)
      console.log(`[USER_INDEX] User ${userId} now has ${currentIndex.fileHashes.length} files`)
    }
    
  } catch (error) {
    console.error(`[USER_INDEX] Error updating user index:`, error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`[USER_DATA] Fetching data for user from MongoDB: ${userId}`)

    // Fetch user analyses from MongoDB
    const analyses = await mongoService.getUserAnalyses(userId)
    
    console.log(`[USER_DATA] Successfully fetched ${analyses.length} patient records from MongoDB`)

    return NextResponse.json({
      success: true,
      patientData: analyses,
      count: analyses.length
    })

  } catch (error) {
    console.error('[USER_DATA] Error fetching user data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch user data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { patientDataHash } = body

    if (!patientDataHash) {
      return NextResponse.json({ error: 'Patient data hash is required' }, { status: 400 })
    }

    console.log(`[USER_DATA] Adding file hash ${patientDataHash} for user ${userId}`)

    // Add the file hash to user's index
    const userFileHashes = userDataIndex.get(userId) || []
    if (!userFileHashes.includes(patientDataHash)) {
      userFileHashes.push(patientDataHash)
      userDataIndex.set(userId, userFileHashes)
      console.log(`[USER_DATA] File hash added. User now has ${userFileHashes.length} files`)
    }

    return NextResponse.json({
      success: true,
      message: 'File hash added to user index',
      totalFiles: userFileHashes.length
    })

  } catch (error) {
    console.error('[USER_DATA] Error adding file hash:', error)
    return NextResponse.json(
      { 
        error: 'Failed to add file hash',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}