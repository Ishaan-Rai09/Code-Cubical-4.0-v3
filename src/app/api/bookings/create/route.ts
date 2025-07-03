import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { googleCalendarAPI } from '@/lib/googleCalendarAPI'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      patientEmail, 
      patientName, 
      doctorSpecialization, 
      preferredDate, 
      preferredTime, 
      reason,
      analysisId 
    } = body
    
    console.log('[BOOKING_CREATE] Creating booking:', body)
    
    // Validate required fields
    if (!patientEmail || !patientName || !doctorSpecialization || !preferredDate || !preferredTime || !reason) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }
    
    // Create Google Calendar event
    const bookingRequest = {
      patientEmail,
      patientName,
      doctorSpecialization,
      preferredDate,
      preferredTime,
      reason,
      analysisId
    }
    
    const calendarEvent = await googleCalendarAPI.createEvent(bookingRequest)
    
    console.log('[BOOKING_CREATE] Created Google Calendar event:', calendarEvent.id)
    
    // Format booking response
    const newBooking = {
      id: calendarEvent.id,
      patientEmail,
      patientName,
      doctorSpecialization,
      date: preferredDate,
      time: preferredTime,
      reason,
      analysisId,
      status: calendarEvent.status,
      createdAt: calendarEvent.created,
      googleEventId: calendarEvent.id
    }
    
    return NextResponse.json({
      success: true,
      message: 'Booking request submitted successfully',
      booking: newBooking,
      googleEvent: calendarEvent
    })
    
  } catch (error) {
    console.error('[BOOKING_CREATE] Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create booking',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to convert 12-hour time to 24-hour format
function convertTo24Hour(time12h: string): string {
  const [time, modifier] = time12h.split(' ')
  let [hours, minutes] = time.split(':')
  
  if (hours === '12') {
    hours = '00'
  }
  
  if (modifier === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString()
  }
  
  return `${hours.padStart(2, '0')}:${minutes}`
}

// Helper function to add an hour to time
function addHour(time24h: string): string {
  const [hours, minutes] = time24h.split(':')
  const newHours = (parseInt(hours, 10) + 1) % 24
  return `${newHours.toString().padStart(2, '0')}:${minutes}`
}