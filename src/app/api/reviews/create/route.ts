import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const { bookingId, patientEmail, doctorName, doctorSpecialization, rating, comment } = await request.json()

    // Validate required fields
    if (!bookingId || !patientEmail || !doctorName || !doctorSpecialization || !rating || !comment) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 })
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json({
        success: false,
        message: 'Rating must be between 1 and 5'
      }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if review already exists for this booking
    const existingReview = await db.collection('reviews').findOne({ bookingId })
    if (existingReview) {
      return NextResponse.json({
        success: false,
        message: 'Review already exists for this booking'
      }, { status: 400 })
    }

    // Create the review
    const review = {
      bookingId,
      patientEmail,
      doctorName,
      doctorSpecialization,
      rating: parseInt(rating),
      comment: comment.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('reviews').insertOne(review)

    // Update doctor's average rating
    const doctorReviews = await db.collection('reviews').find({
      doctorName,
      doctorSpecialization
    }).toArray()

    const averageRating = doctorReviews.reduce((sum, review) => sum + review.rating, 0) / doctorReviews.length
    const totalReviews = doctorReviews.length

    // Update or create doctor stats
    await db.collection('doctorStats').updateOne(
      { doctorName, doctorSpecialization },
      {
        $set: {
          averageRating: parseFloat(averageRating.toFixed(1)),
          totalReviews,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      reviewId: result.insertedId
    })

  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
