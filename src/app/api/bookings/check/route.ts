import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { GoogleCalendarService } from '@/lib/googleCalendar'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientEmail = searchParams.get('patientEmail')
    const doctorSpecialization = searchParams.get('doctorSpecialization')
    
    console.log('[BOOKING_CHECK] Checking bookings for:', { patientEmail, doctorSpecialization })
    
    if (!patientEmail || !doctorSpecialization) {
      return NextResponse.json(
        { success: false, error: 'Patient email and doctor specialization are required' },
        { status: 400 }
      )
    }
    
    // Get calendar events for the doctor's specialization
    const doctorEvents = await GoogleCalendarService.getEventsForDoctor(doctorSpecialization)
    
    // Filter events by patient email
    const patientBookings = doctorEvents.filter(event => 
      event.attendees?.some(attendee => attendee.email === patientEmail)
    ).map(event => ({
      id: event.id,
      patientEmail: patientEmail,
      doctorSpecialization: doctorSpecialization,
      date: event.start.dateTime.split('T')[0],
      time: new Date(event.start.dateTime).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      status: event.status,
      reason: event.description?.split('\n')[0]?.replace('Consultation for ', '') || 'Medical consultation',
      googleEventId: event.id,
      summary: event.summary,
      doctorResponse: event.attendees?.find(a => a.email.includes(doctorSpecialization))?.responseStatus || 'needsAction'
    }))
    
    return NextResponse.json({
      success: true,
      bookings: patientBookings,
      count: patientBookings.length
    })
    
  } catch (error) {
    console.error('[BOOKING_CHECK] Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check bookings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, action, doctorNotes } = body
    
    console.log('[BOOKING_ACTION] Processing booking action:', { bookingId, action })
    
    if (!bookingId || !action) {
      return NextResponse.json(
        { success: false, error: 'Booking ID and action are required' },
        { status: 400 }
      )
    }
    
    // Update the Google Calendar event
    const doctorEmail = `${doctorSpecialization || 'general'}@luxehealth.ai`
    const eventStatus = action === 'confirm' ? 'confirmed' : 
                       action === 'reject' ? 'cancelled' : 'tentative'
    
    const updatedEvent = await GoogleCalendarService.updateEventStatus(bookingId, eventStatus, doctorEmail)
    
    if (!updatedEvent) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `Booking ${action}ed successfully`,
      booking: {
        id: updatedEvent.id,
        status: updatedEvent.status,
        summary: updatedEvent.summary,
        doctorResponse: updatedEvent.attendees?.find(a => a.email === doctorEmail)?.responseStatus
      }
    })
    
  } catch (error) {
    console.error('[BOOKING_ACTION] Error:', error)
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