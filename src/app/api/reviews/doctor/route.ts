import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorName = searchParams.get('doctorName')
    const doctorSpecialization = searchParams.get('doctorSpecialization')

    if (!doctorName || !doctorSpecialization) {
      return NextResponse.json({
        success: false,
        message: 'Doctor name and specialization are required'
      }, { status: 400 })
    }

    const mongoose = await connectDB()
    const db = mongoose.connection.db

    if (!db) {
      throw new Error('Database connection failed')
    }

    // Fetch reviews for the doctor
    const reviews = await db.collection('reviews')
      .find({
        doctorName,
        doctorSpecialization
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Fetch doctor stats
    const doctorStats = await db.collection('doctorStats')
      .findOne({
        doctorName,
        doctorSpecialization
      })

    // Calculate additional stats
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviews.filter(review => review.rating === rating).length,
      percentage: reviews.length > 0 ? Math.round((reviews.filter(review => review.rating === rating).length / reviews.length) * 100) : 0
    }))

    return NextResponse.json({
      success: true,
      data: {
        reviews: reviews.map(review => ({
          ...review,
          _id: review._id.toString()
        })),
        stats: {
          averageRating: doctorStats?.averageRating || 0,
          totalReviews: doctorStats?.totalReviews || 0,
          ratingDistribution
        }
      }
    })

  } catch (error) {
    console.error('Error fetching doctor reviews:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
