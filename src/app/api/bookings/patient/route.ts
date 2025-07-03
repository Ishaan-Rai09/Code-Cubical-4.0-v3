import { NextRequest, NextResponse } from 'next/server'
import { googleCalendarAPI } from '@/lib/googleCalendarAPI'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientEmail = searchParams.get('patientEmail')
    
    console.log('[PATIENT_BOOKINGS] Fetching bookings for patient:', patientEmail)
    
    if (!patientEmail) {
      return NextResponse.json(
        { success: false, error: 'Patient email is required' },
        { status: 400 }
      )
    }
    
    // Get all calendar events for the patient
    const patientBookings = await googleCalendarAPI.getBookingsForPatient(patientEmail)
    
    // The bookings are already formatted by the API
    const bookings = patientBookings.map(booking => ({
      id: booking.id,
      patientEmail: booking.patientEmail,
      patientName: booking.patientName,
      doctorSpecialization: booking.doctorSpecialization,
      doctorName: booking.doctorSpecialization === 'heart' ? 'Dr. Cardiologist' :
                  booking.doctorSpecialization === 'brain' ? 'Dr. Neurologist' :
                  booking.doctorSpecialization === 'lungs' ? 'Dr. Pulmonologist' :
                  booking.doctorSpecialization === 'liver' ? 'Dr. Hepatologist' :
                  `Dr. ${booking.doctorSpecialization}`,
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
    console.error('[PATIENT_BOOKINGS] Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch patient bookings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}