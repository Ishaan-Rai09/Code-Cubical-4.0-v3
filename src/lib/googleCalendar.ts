// Google Calendar API integration
// In a real implementation, you would use the Google Calendar API
// For demo purposes, we'll simulate calendar events

export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction'
  }>
  status: 'confirmed' | 'tentative' | 'cancelled'
  created: string
  updated: string
}

export interface BookingRequest {
  patientEmail: string
  patientName: string
  doctorSpecialization: string
  preferredDate: string
  preferredTime: string
  reason: string
  analysisId?: string
}

// Mock calendar events for demonstration
const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'event_001',
    summary: 'Medical Consultation - John Doe',
    description: 'Consultation for cardiac analysis results\nPatient: John Doe\nEmail: john.doe@email.com\nAnalysis ID: ANALYSIS_123',
    start: {
      dateTime: '2024-01-15T10:00:00',
      timeZone: 'America/New_York'
    },
    end: {
      dateTime: '2024-01-15T11:00:00',
      timeZone: 'America/New_York'
    },
    attendees: [
      {
        email: 'john.doe@email.com',
        displayName: 'John Doe',
        responseStatus: 'accepted'
      },
      {
        email: 'cardiologist@luxehealth.ai',
        displayName: 'Dr. Smith (Cardiologist)',
        responseStatus: 'needsAction'
      }
    ],
    status: 'confirmed',
    created: '2024-01-10T09:00:00Z',
    updated: '2024-01-10T09:00:00Z'
  },
  {
    id: 'event_002',
    summary: 'Medical Consultation - Sarah Johnson',
    description: 'Consultation for brain MRI results\nPatient: Sarah Johnson\nEmail: sarah.johnson@email.com\nAnalysis ID: ANALYSIS_456',
    start: {
      dateTime: '2024-01-16T14:00:00',
      timeZone: 'America/New_York'
    },
    end: {
      dateTime: '2024-01-16T15:00:00',
      timeZone: 'America/New_York'
    },
    attendees: [
      {
        email: 'sarah.johnson@email.com',
        displayName: 'Sarah Johnson',
        responseStatus: 'accepted'
      },
      {
        email: 'neurologist@luxehealth.ai',
        displayName: 'Dr. Brown (Neurologist)',
        responseStatus: 'tentative'
      }
    ],
    status: 'tentative',
    created: '2024-01-11T10:00:00Z',
    updated: '2024-01-11T10:00:00Z'
  },
  {
    id: 'event_003',
    summary: 'Medical Consultation - Mike Wilson',
    description: 'Consultation for lung CT results\nPatient: Mike Wilson\nEmail: mike.wilson@email.com\nAnalysis ID: ANALYSIS_789',
    start: {
      dateTime: '2024-01-17T11:30:00',
      timeZone: 'America/New_York'
    },
    end: {
      dateTime: '2024-01-17T12:30:00',
      timeZone: 'America/New_York'
    },
    attendees: [
      {
        email: 'mike.wilson@email.com',
        displayName: 'Mike Wilson',
        responseStatus: 'needsAction'
      },
      {
        email: 'pulmonologist@luxehealth.ai',
        displayName: 'Dr. Davis (Pulmonologist)',
        responseStatus: 'needsAction'
      }
    ],
    status: 'confirmed',
    created: '2024-01-12T08:00:00Z',
    updated: '2024-01-12T08:00:00Z'
  },
  {
    id: 'event_004',
    summary: 'Medical Consultation - Emma Thompson',
    description: 'Consultation for liver scan results\nPatient: Emma Thompson\nEmail: emma.thompson@email.com\nAnalysis ID: ANALYSIS_101',
    start: {
      dateTime: '2024-01-18T15:00:00',
      timeZone: 'America/New_York'
    },
    end: {
      dateTime: '2024-01-18T16:00:00',
      timeZone: 'America/New_York'
    },
    attendees: [
      {
        email: 'emma.thompson@email.com',
        displayName: 'Emma Thompson',
        responseStatus: 'accepted'
      },
      {
        email: 'hepatologist@luxehealth.ai',
        displayName: 'Dr. Garcia (Hepatologist)',
        responseStatus: 'accepted'
      }
    ],
    status: 'confirmed',
    created: '2024-01-13T12:00:00Z',
    updated: '2024-01-13T12:00:00Z'
  }
]

export class GoogleCalendarService {
  // In a real implementation, this would use Google Calendar API
  // For now, we'll simulate the functionality

  static async getEventsForDoctor(doctorSpecialization: string): Promise<CalendarEvent[]> {
    // Filter events by doctor specialization
    const doctorEmail = `${doctorSpecialization}@luxehealth.ai`
    
    return mockCalendarEvents.filter(event => 
      event.attendees?.some(attendee => attendee.email === doctorEmail)
    )
  }

  static async getEventsForPatient(patientEmail: string): Promise<CalendarEvent[]> {
    // Filter events by patient email
    return mockCalendarEvents.filter(event => 
      event.attendees?.some(attendee => attendee.email === patientEmail)
    )
  }

  static async createEvent(bookingRequest: BookingRequest): Promise<CalendarEvent> {
    // In a real implementation, this would create an event in Google Calendar
    const eventId = `event_${Date.now()}`
    const doctorEmail = `${bookingRequest.doctorSpecialization}@luxehealth.ai`
    
    const newEvent: CalendarEvent = {
      id: eventId,
      summary: `Medical Consultation - ${bookingRequest.patientName}`,
      description: `Consultation for ${bookingRequest.reason}\nPatient: ${bookingRequest.patientName}\nEmail: ${bookingRequest.patientEmail}${bookingRequest.analysisId ? `\nAnalysis ID: ${bookingRequest.analysisId}` : ''}`,
      start: {
        dateTime: `${bookingRequest.preferredDate}T${this.convertTo24Hour(bookingRequest.preferredTime)}:00`,
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: `${bookingRequest.preferredDate}T${this.addHour(this.convertTo24Hour(bookingRequest.preferredTime))}:00`,
        timeZone: 'America/New_York'
      },
      attendees: [
        {
          email: bookingRequest.patientEmail,
          displayName: bookingRequest.patientName,
          responseStatus: 'accepted'
        },
        {
          email: doctorEmail,
          displayName: `Dr. ${bookingRequest.doctorSpecialization} (${this.getSpecializationName(bookingRequest.doctorSpecialization)})`,
          responseStatus: 'needsAction'
        }
      ],
      status: 'confirmed',
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    }

    // Add to mock events (in real implementation, this would be saved to Google Calendar)
    mockCalendarEvents.push(newEvent)
    
    return newEvent
  }

  static async updateEventStatus(eventId: string, status: 'confirmed' | 'tentative' | 'cancelled', doctorEmail: string, remarks?: string): Promise<CalendarEvent | null> {
    const event = mockCalendarEvents.find(e => e.id === eventId)
    if (!event) return null

    // Update event status
    event.status = status
    event.updated = new Date().toISOString()

    // Update doctor's response status
    const doctorAttendee = event.attendees?.find(a => a.email === doctorEmail)
    if (doctorAttendee) {
      doctorAttendee.responseStatus = status === 'confirmed' ? 'accepted' : 
                                     status === 'cancelled' ? 'declined' : 'tentative'
    }

    // Add remarks to event description if provided
    if (remarks) {
      event.description = event.description + `\n\nDoctor's Remarks: ${remarks}`
    }

    return event
  }

  private static convertTo24Hour(time12h: string): string {
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

  private static addHour(time24h: string): string {
    const [hours, minutes] = time24h.split(':')
    const newHours = (parseInt(hours, 10) + 1) % 24
    return `${newHours.toString().padStart(2, '0')}:${minutes}`
  }

  private static getSpecializationName(specialization: string): string {
    switch (specialization) {
      case 'heart': return 'Cardiologist'
      case 'brain': return 'Neurologist'
      case 'lungs': return 'Pulmonologist'
      case 'liver': return 'Hepatologist'
      default: return 'Specialist'
    }
  }
}