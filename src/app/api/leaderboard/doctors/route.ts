import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const specialization = searchParams.get('specialization')
    const limit = parseInt(searchParams.get('limit') || '10')

    const mongoose = await connectDB()
    const db = mongoose.connection.db

    if (!db) {
      throw new Error('Database connection failed')
    }

    let query = {}
    if (specialization && specialization !== 'all') {
      query = { doctorSpecialization: specialization }
    }

    // Fetch doctor stats and sort by average rating and total reviews
    const doctorStats = await db.collection('doctorStats')
      .find(query)
      .sort({ 
        averageRating: -1, 
        totalReviews: -1 
      })
      .limit(limit)
      .toArray()

    // Enrich with recent reviews
    const enrichedStats = await Promise.all(
      doctorStats.map(async (doctor, index) => {
        const recentReviews = await db.collection('reviews')
          .find({
            doctorName: doctor.doctorName,
            doctorSpecialization: doctor.doctorSpecialization
          })
          .sort({ createdAt: -1 })
          .limit(3)
          .toArray()

        return {
          ...doctor,
          _id: doctor._id.toString(),
          rank: index + 1,
          recentReviews: recentReviews.map(review => ({
            rating: review.rating,
            comment: review.comment.substring(0, 100) + (review.comment.length > 100 ? '...' : ''),
            patientEmail: review.patientEmail.replace(/(.{2}).*(@.*)/, '$1****$2'), // Mask email for privacy
            createdAt: review.createdAt
          }))
        }
      })
    )

    // Get available specializations for filter
    const specializations = await db.collection('doctorStats')
      .distinct('doctorSpecialization')

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: enrichedStats,
        specializations: specializations.sort(),
        currentFilter: specialization || 'all'
      }
    })

  } catch (error) {
    console.error('Error fetching doctor leaderboard:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
