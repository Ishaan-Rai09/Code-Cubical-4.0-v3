import { NextRequest, NextResponse } from 'next/server'
import { googleCalendarAPI } from '@/lib/googleCalendarAPI'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorSpecialization = searchParams.get('specialization')
    
    console.log('[DOCTOR_BOOKINGS] Fetching bookings for doctor specialization:', doctorSpecialization)
    
    if (!doctorSpecialization) {
      return NextResponse.json(
        { success: false, error: 'Doctor specialization is required' },
        { status: 400 }
      )
    }
    
    // Get all calendar events for the doctor's specialization
    const doctorBookings = await googleCalendarAPI.getBookingsForDoctor(doctorSpecialization)
    
    // The bookings are already formatted by the API
    const bookings = doctorBookings.map(booking => ({
      id: booking.id,
      patientEmail: booking.patientEmail,
      patientName: booking.patientName,
      doctorSpecialization: booking.doctorSpecialization,
      date: booking.date,
      time: booking.time,
      status: booking.status,
      reason: booking.reason,
      doctorResponse: booking.doctorResponse,
      analysisId: booking.analysisId,
      remarks: booking.remarks,
      meetingLink: booking.meetingLink,
      created: booking.created,
      updated: booking.updated
    }))
    
    // Sort by date (newest first)
    bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    return NextResponse.json({
      success: true,
      bookings: bookings,
      count: bookings.length
    })
    
  } catch (error) {
    console.error('[DOCTOR_BOOKINGS] Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch doctor bookings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, action, doctorSpecialization, remarks } = body
    
    console.log('[DOCTOR_BOOKINGS] Processing booking action:', { bookingId, action, remarks })
    
    if (!bookingId || !action || !doctorSpecialization) {
      return NextResponse.json(
        { success: false, error: 'Booking ID, action, and doctor specialization are required' },
        { status: 400 }
      )
    }
    
    // Update the Google Calendar event
    const doctorResponse = action === 'confirm' ? 'accepted' : 
                          action === 'reject' ? 'declined' : 'tentative'
    
    const updatedBooking = await googleCalendarAPI.updateBookingStatus(bookingId, doctorResponse, remarks)
    
    if (!updatedBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `Booking ${action}ed successfully`,
      booking: updatedBooking
    })
    
  } catch (error) {
    console.error('[DOCTOR_BOOKINGS] Error processing action:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process booking action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}