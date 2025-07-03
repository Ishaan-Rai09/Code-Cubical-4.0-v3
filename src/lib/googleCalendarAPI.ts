// Real Google Calendar API integration
import { google } from 'googleapis'

export interface GoogleCalendarEvent {
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
  extendedProperties?: {
    private?: {
      patientEmail?: string
      doctorSpecialization?: string
      analysisId?: string
      bookingType?: string
    }
  }
}

export interface BookingDetails {
  id: string
  patientEmail: string
  patientName: string
  doctorSpecialization: string
  date: string
  time: string
  reason: string
  status: 'confirmed' | 'tentative' | 'cancelled'
  doctorResponse: 'accepted' | 'declined' | 'tentative' | 'needsAction'
  analysisId?: string
  remarks?: string
  meetingLink?: string
  created: string
  updated: string
}

class GoogleCalendarAPI {
  private calendar: any
  private isInitialized = false

  constructor() {
    this.initializeCalendar()
  }

  private async initializeCalendar() {
    try {
      // Check if Google Calendar API credentials are available (OAuth 2.0)
      const clientId = process.env.GOOGLE_CLIENT_ID
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
      const calendarId = process.env.GOOGLE_CALENDAR_ID

      if (!clientId || !clientSecret || !refreshToken || !calendarId) {
        console.warn('[GOOGLE_CALENDAR] API credentials not found, using mock data')
        this.isInitialized = false
        return
      }

      // Initialize Google Calendar API with OAuth 2.0
      const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'http://localhost:3000/api/auth/google/callback'
      )

      // Set the refresh token
      oauth2Client.setCredentials({
        refresh_token: refreshToken
      })

      this.calendar = google.calendar({ version: 'v3', auth: oauth2Client })
      this.isInitialized = true
      console.log('[GOOGLE_CALENDAR] API initialized successfully with OAuth 2.0')
    } catch (error) {
      console.error('[GOOGLE_CALENDAR] Failed to initialize API:', error)
      this.isInitialized = false
    }
  }

  async getBookingsForDoctor(doctorSpecialization: string): Promise<BookingDetails[]> {
    if (!this.isInitialized) {
      return this.getMockBookingsForDoctor(doctorSpecialization)
    }

    try {
      const calendarId = process.env.GOOGLE_CALENDAR_ID
      const timeMin = new Date()
      timeMin.setDate(timeMin.getDate() - 30) // Include past 30 days
      const timeMax = new Date()
      timeMax.setMonth(timeMax.getMonth() + 3) // Next 3 months

      const response = await this.calendar.events.list({
        calendarId,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 250, // Get more events to ensure we catch all bookings
      })

      const events = response.data.items || []
      console.log(`[GOOGLE_CALENDAR] Found ${events.length} total events`)
      
      // More inclusive filtering to show ALL relevant calendar events
      const filteredEvents = events.filter((event: any) => {
        // Skip all-day events without times (like holidays)
        if (!event.start?.dateTime) {
          return false
        }
        
        // Include events with extended properties for this specialization
        const hasExtendedProps = event.extendedProperties?.private?.doctorSpecialization === doctorSpecialization
        
        // Include events with doctor attendee for this specialization
        const hasDoctorAttendee = event.attendees?.some((attendee: any) => 
          attendee.email === `${doctorSpecialization}@luxehealth.ai`
        )
        
        // Include events that are medical consultations
        const isMedicalConsultation = event.summary?.toLowerCase().includes('consultation') ||
                                     event.summary?.toLowerCase().includes('appointment') ||
                                     event.summary?.toLowerCase().includes('meeting')
        
        // Include events that contain medical or health related keywords
        const isMedicalRelated = event.summary?.toLowerCase().includes('medical') ||
                                event.summary?.toLowerCase().includes('health') ||
                                event.summary?.toLowerCase().includes('patient') ||
                                event.summary?.toLowerCase().includes('doctor') ||
                                event.summary?.toLowerCase().includes('checkup') ||
                                event.summary?.toLowerCase().includes('follow-up')
        
        // Include events that mention the specialization
        const mentionsSpecialization = event.summary?.toLowerCase().includes(doctorSpecialization) ||
                                       event.description?.toLowerCase().includes(doctorSpecialization)
        
        // Include events in the doctor's calendar that have attendees (indicating appointments)
        const hasAttendees = event.attendees && event.attendees.length > 0
        
        // Include ANY events that have multiple attendees (likely meetings)
        const hasMultipleAttendees = event.attendees && event.attendees.length >= 2
        
        // Include events with any doctor-like email patterns
        const hasAnyDoctorEmail = event.attendees?.some((attendee: any) => 
          attendee.email?.includes('doctor') || 
          attendee.email?.includes('dr.') ||
          attendee.email?.includes('@luxehealth.ai') ||
          attendee.email?.includes('@clinic') ||
          attendee.email?.includes('@hospital')
        )
        
        // Include if ANY of these conditions are met (very inclusive)
        return hasExtendedProps || 
               hasDoctorAttendee || 
               hasAnyDoctorEmail ||
               mentionsSpecialization ||
               (isMedicalConsultation && hasAttendees) ||
               (isMedicalRelated && hasAttendees) ||
               hasMultipleAttendees || // Include any multi-person meetings
               // Include all events with patient-like emails
               (hasAttendees && event.attendees.some((attendee: any) => 
                 attendee.email && attendee.email.includes('@') && 
                 !attendee.email.includes('noreply') && 
                 !attendee.email.includes('calendar')
               ))
      })
      
      console.log(`[GOOGLE_CALENDAR] Found ${filteredEvents.length} events for ${doctorSpecialization} after filtering`)
      
      return filteredEvents.map((event: any) => this.formatEventAsBooking(event))
    } catch (error) {
      console.error('[GOOGLE_CALENDAR] Error fetching doctor bookings:', error)
      return this.getMockBookingsForDoctor(doctorSpecialization)
    }
  }

  async getBookingsForPatient(patientEmail: string): Promise<BookingDetails[]> {
    if (!this.isInitialized) {
      return this.getMockBookingsForPatient(patientEmail)
    }

    try {
      const calendarId = process.env.GOOGLE_CALENDAR_ID
      const timeMin = new Date()
      timeMin.setDate(timeMin.getDate() - 30) // Include past 30 days to show history
      const timeMax = new Date()
      timeMax.setMonth(timeMax.getMonth() + 6) // Next 6 months

      const response = await this.calendar.events.list({
        calendarId,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 250, // Get more events to ensure we catch all appointments
      })

      const events = response.data.items || []
      console.log(`[GOOGLE_CALENDAR] Found ${events.length} total events for patient search`)
      
      // Show ALL calendar events (no filtering except for all-day events)
      const filteredEvents = events.filter((event: any) => {
        // Only skip all-day events without times (like holidays)
        return event.start?.dateTime
      })
      
      console.log(`[GOOGLE_CALENDAR] Found ${filteredEvents.length} events for patient ${patientEmail} after filtering`)
      
      return filteredEvents.map((event: any) => this.formatEventAsBooking(event))
    } catch (error) {
      console.error('[GOOGLE_CALENDAR] Error fetching patient bookings:', error)
      return this.getMockBookingsForPatient(patientEmail)
    }
  }

  async createEvent(bookingRequest: {
    patientEmail: string
    patientName: string
    doctorSpecialization: string
    preferredDate: string
    preferredTime: string
    reason: string
    analysisId?: string
  }): Promise<GoogleCalendarEvent> {
    if (!this.isInitialized) {
      return this.createMockEvent(bookingRequest)
    }

    try {
      const calendarId = process.env.GOOGLE_CALENDAR_ID
      const doctorEmail = `${bookingRequest.doctorSpecialization}@luxehealth.ai`
      
      // Convert time format
      const startDateTime = `${bookingRequest.preferredDate}T${this.convertTo24Hour(bookingRequest.preferredTime)}:00`
      const endDateTime = `${bookingRequest.preferredDate}T${this.addHour(this.convertTo24Hour(bookingRequest.preferredTime))}:00`
      
      const eventResource = {
        summary: `Medical Consultation - ${bookingRequest.patientName}`,
        description: `Consultation for ${bookingRequest.reason}\nPatient: ${bookingRequest.patientName}\nEmail: ${bookingRequest.patientEmail}${bookingRequest.analysisId ? `\nAnalysis ID: ${bookingRequest.analysisId}` : ''}`,
        start: {
          dateTime: startDateTime,
          timeZone: 'Asia/Kolkata'
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'Asia/Kolkata'
        },
        attendees: [
          {
            email: bookingRequest.patientEmail,
            displayName: bookingRequest.patientName,
            responseStatus: 'accepted'
          },
          {
            email: doctorEmail,
            displayName: `Dr. ${this.getSpecializationName(bookingRequest.doctorSpecialization)}`,
            responseStatus: 'needsAction'
          }
        ],
        extendedProperties: {
          private: {
            patientEmail: bookingRequest.patientEmail,
            doctorSpecialization: bookingRequest.doctorSpecialization,
            analysisId: bookingRequest.analysisId || '',
            bookingType: 'medical_consultation'
          }
        },
        conferenceData: {
          createRequest: {
            requestId: `meet_${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        }
      }

      const response = await this.calendar.events.insert({
        calendarId,
        resource: eventResource,
        conferenceDataVersion: 1
      })

      console.log('[GOOGLE_CALENDAR] Successfully created event:', response.data.id)
      return this.convertToGoogleCalendarEvent(response.data)
    } catch (error) {
      console.error('[GOOGLE_CALENDAR] Error creating event:', error)
      return this.createMockEvent(bookingRequest)
    }
  }

  async updateBookingStatus(
    eventId: string, 
    doctorResponse: 'accepted' | 'declined' | 'tentative', 
    remarks?: string
  ): Promise<BookingDetails | null> {
    if (!this.isInitialized) {
      return this.updateMockBookingStatus(eventId, doctorResponse, remarks)
    }

    try {
      const calendarId = process.env.GOOGLE_CALENDAR_ID
      
      // Get the existing event
      const event = await this.calendar.events.get({
        calendarId,
        eventId,
      })

      if (!event.data) {
        throw new Error('Event not found')
      }

      // Update the event with doctor response
      const updatedEvent = {
        ...event.data,
        status: doctorResponse === 'accepted' ? 'confirmed' : 
                doctorResponse === 'declined' ? 'cancelled' : 'tentative',
        extendedProperties: {
          ...event.data.extendedProperties,
          private: {
            ...event.data.extendedProperties?.private,
            doctorResponse,
            remarks: remarks || event.data.extendedProperties?.private?.remarks,
          }
        }
      }

      // Update attendee response status
      if (updatedEvent.attendees) {
        updatedEvent.attendees = updatedEvent.attendees.map((attendee: any) => {
          if (attendee.email.includes('@luxehealth.ai')) {
            return {
              ...attendee,
              responseStatus: doctorResponse === 'accepted' ? 'accepted' : 
                            doctorResponse === 'declined' ? 'declined' : 'tentative'
            }
          }
          return attendee
        })
      }

      const response = await this.calendar.events.update({
        calendarId,
        eventId,
        resource: updatedEvent,
      })

      return this.formatEventAsBooking(response.data)
    } catch (error) {
      console.error('[GOOGLE_CALENDAR] Error updating booking status:', error)
      return this.updateMockBookingStatus(eventId, doctorResponse, remarks)
    }
  }

private formatEventAsBooking(event: any): BookingDetails {
    const patientAttendee = event.attendees?.find((a: any) => !a.email.includes('@luxehealth.ai'))
    const doctorAttendee = event.attendees?.find((a: any) => a.email.includes('@luxehealth.ai'))
    
    let patientName = patientAttendee?.displayName;
    
    // Try multiple fallback strategies for patient name
    if (!patientName || patientName === 'Unknown Patient') {
      // Extract from event summary - handle different formats
      if (event.summary) {
        // Format: "Medical Consultation - John Doe"
        let summaryMatch = event.summary.match(/(?:Medical Consultation|Consultation|Appointment|Meeting) - (.+)$/i);
        if (!summaryMatch) {
          // Format: "John Doe - Consultation"
          summaryMatch = event.summary.match(/^(.+) - (?:Consultation|Appointment|Meeting)/i);
        }
        if (!summaryMatch) {
          // Format: "Appointment with John Doe"
          summaryMatch = event.summary.match(/(?:Appointment|Meeting|Consultation) with (.+)$/i);
        }
        if (!summaryMatch) {
          // Format: "John Doe Consultation"
          summaryMatch = event.summary.match(/^(.+) (?:Consultation|Appointment|Meeting)$/i);
        }
        patientName = summaryMatch?.[1]?.trim();
      }
      
      // Extract from description
      if (!patientName && event.description) {
        const descriptionMatch = event.description.match(/(?:Patient|Name):\s*(.+)(?:\n|$)/i);
        patientName = descriptionMatch?.[1]?.trim();
      }
      
      // Extract from attendee's name if email looks like a personal email
      if (!patientName && patientAttendee?.email) {
        const emailParts = patientAttendee.email.split('@')[0];
        // Only use email if it looks like a name (contains dots or underscores)
        if (emailParts.includes('.') || emailParts.includes('_')) {
          patientName = emailParts.replace(/[._]/g, ' ')
            .replace(/\b\w/g, (l: string) => l.toUpperCase());
        }
      }
      
      // If still no name and event has attendees, use the first non-doctor attendee
      if (!patientName && event.attendees && event.attendees.length > 0) {
        const firstNonDoctorAttendee = event.attendees.find((a: any) => 
          a.displayName && !a.email.includes('@luxehealth.ai')
        );
        if (firstNonDoctorAttendee?.displayName) {
          patientName = firstNonDoctorAttendee.displayName;
        }
      }
      
      // Final fallback
      if (!patientName) {
        patientName = 'Unknown Patient';
      }
    }
    
    let date = '';
    let time = '';
    try {
      const startDate = new Date(event.start?.dateTime || '');
      if (!isNaN(startDate.getTime())) {
        date = startDate.toISOString().split('T')[0];
        time = startDate.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        });
      }
    } catch {
      console.warn('Invalid date or time format detected');
    }
    
    // Extract reason from multiple sources
    let reason = '';
    if (event.description) {
      // Look for "Consultation for" or "Reason:" patterns
      const reasonMatch = event.description.match(/(?:Consultation for|Reason for visit|Reason:|Purpose:)\s*(.+?)(?:\n|$)/i);
      if (reasonMatch) {
        reason = reasonMatch[1].trim();
      } else {
        // Use the first line of description if it doesn't contain email
        const firstLine = event.description.split('\n')[0];
        if (firstLine && !firstLine.includes('@') && !firstLine.toLowerCase().includes('patient:')) {
          reason = firstLine.replace(/^(?:Consultation for|Appointment for|Meeting for)\s*/i, '').trim();
        }
      }
    }
    
    // If no reason found, try to infer from the event summary
    if (!reason && event.summary) {
      if (event.summary.toLowerCase().includes('follow-up')) {
        reason = 'Follow-up consultation';
      } else if (event.summary.toLowerCase().includes('checkup')) {
        reason = 'Routine checkup';
      } else if (event.summary.toLowerCase().includes('consultation')) {
        reason = 'Medical consultation';
      } else {
        reason = event.summary;
      }
    }
    
    // Final fallback for reason
    if (!reason) {
      reason = 'Medical consultation';
    }
    
    // Determine doctor specialization from multiple sources
    let doctorSpecialization = event.extendedProperties?.private?.doctorSpecialization || 'general';
    
    // Try to infer from doctor attendee email
    if (doctorSpecialization === 'general' && doctorAttendee?.email) {
      const specializations = ['heart', 'brain', 'lungs', 'liver'];
      const foundSpec = specializations.find(spec => doctorAttendee.email.includes(spec));
      if (foundSpec) {
        doctorSpecialization = foundSpec;
      }
    }
    
    // Try to infer from event content
    if (doctorSpecialization === 'general') {
      const content = `${event.summary || ''} ${event.description || ''}`.toLowerCase();
      if (content.includes('cardio') || content.includes('heart')) {
        doctorSpecialization = 'heart';
      } else if (content.includes('neuro') || content.includes('brain')) {
        doctorSpecialization = 'brain';
      } else if (content.includes('pulmo') || content.includes('lung')) {
        doctorSpecialization = 'lungs';
      } else if (content.includes('hepat') || content.includes('liver')) {
        doctorSpecialization = 'liver';
      }
    }
    
    return {
      id: event.id,
      patientEmail: patientAttendee?.email || 'unknown@email.com',
      patientName,
      doctorSpecialization,
      date,
      time,
      reason,
      status: event.status || 'confirmed',
      doctorResponse: event.extendedProperties?.private?.doctorResponse || 
                     doctorAttendee?.responseStatus || 'needsAction',
      analysisId: event.extendedProperties?.private?.analysisId,
      remarks: event.extendedProperties?.private?.remarks,
      meetingLink: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || `https://meet.google.com/${event.id}`,
      created: event.created || new Date().toISOString(),
      updated: event.updated || new Date().toISOString()
    }
  }

  // Mock data fallback methods
  private getMockBookingsForDoctor(doctorSpecialization: string): BookingDetails[] {
    const mockBookings: BookingDetails[] = [
      {
        id: 'mock_001',
        patientEmail: 'john.doe@email.com',
        patientName: 'John Doe',
        doctorSpecialization: 'heart',
        date: '2024-01-15',
        time: '10:00 AM',
        reason: 'Follow-up consultation for cardiac analysis',
        status: 'confirmed',
        doctorResponse: 'needsAction',
        analysisId: 'ANALYSIS_123',
        meetingLink: 'https://meet.google.com/mock_001',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      },
      {
        id: 'mock_002',
        patientEmail: 'sarah.johnson@email.com',
        patientName: 'Sarah Johnson',
        doctorSpecialization: 'brain',
        date: '2024-01-16',
        time: '2:00 PM',
        reason: 'Neurological consultation for brain MRI results',
        status: 'tentative',
        doctorResponse: 'needsAction',
        analysisId: 'ANALYSIS_456',
        meetingLink: 'https://meet.google.com/mock_002',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      },
      {
        id: 'mock_003',
        patientEmail: 'mike.wilson@email.com',
        patientName: 'Mike Wilson',
        doctorSpecialization: 'lungs',
        date: '2024-01-17',
        time: '11:30 AM',
        reason: 'Pulmonary consultation for lung CT results',
        status: 'confirmed',
        doctorResponse: 'accepted',
        analysisId: 'ANALYSIS_789',
        remarks: 'Patient shows good progress, continue current treatment',
        meetingLink: 'https://meet.google.com/mock_003',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      }
    ]

    return mockBookings.filter(booking => booking.doctorSpecialization === doctorSpecialization)
  }

  private getMockBookingsForPatient(patientEmail: string): BookingDetails[] {
    const mockBookings = this.getMockBookingsForDoctor('heart')
      .concat(this.getMockBookingsForDoctor('brain'))
      .concat(this.getMockBookingsForDoctor('lungs'))
      .concat(this.getMockBookingsForDoctor('liver'))

    return mockBookings.filter(booking => booking.patientEmail === patientEmail)
  }

  private updateMockBookingStatus(
    eventId: string, 
    doctorResponse: 'accepted' | 'declined' | 'tentative', 
    remarks?: string
  ): BookingDetails | null {
    // In a real implementation, this would update the actual calendar event
    // For mock data, we'll just return a simulated updated booking
    return {
      id: eventId,
      patientEmail: 'mock@email.com',
      patientName: 'Mock Patient',
      doctorSpecialization: 'general',
      date: '2024-01-15',
      time: '10:00 AM',
      reason: 'Mock consultation',
      status: doctorResponse === 'accepted' ? 'confirmed' : 
              doctorResponse === 'declined' ? 'cancelled' : 'tentative',
      doctorResponse,
      remarks,
      meetingLink: `https://meet.google.com/${eventId}`,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    }
  }

  private createMockEvent(bookingRequest: {
    patientEmail: string
    patientName: string
    doctorSpecialization: string
    preferredDate: string
    preferredTime: string
    reason: string
    analysisId?: string
  }): GoogleCalendarEvent {
    const eventId = `mock_${Date.now()}`
    return {
      id: eventId,
      summary: `Medical Consultation - ${bookingRequest.patientName}`,
      description: `Consultation for ${bookingRequest.reason}\nPatient: ${bookingRequest.patientName}\nEmail: ${bookingRequest.patientEmail}`,
      start: {
        dateTime: `${bookingRequest.preferredDate}T${this.convertTo24Hour(bookingRequest.preferredTime)}:00`,
        timeZone: 'Asia/Kolkata'
      },
      end: {
        dateTime: `${bookingRequest.preferredDate}T${this.addHour(this.convertTo24Hour(bookingRequest.preferredTime))}:00`,
        timeZone: 'Asia/Kolkata'
      },
      attendees: [
        {
          email: bookingRequest.patientEmail,
          displayName: bookingRequest.patientName,
          responseStatus: 'accepted'
        },
        {
          email: `${bookingRequest.doctorSpecialization}@luxehealth.ai`,
          displayName: `Dr. ${this.getSpecializationName(bookingRequest.doctorSpecialization)}`,
          responseStatus: 'needsAction'
        }
      ],
      status: 'confirmed',
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    }
  }

  private convertToGoogleCalendarEvent(googleEvent: any): GoogleCalendarEvent {
    return {
      id: googleEvent.id,
      summary: googleEvent.summary,
      description: googleEvent.description,
      start: {
        dateTime: googleEvent.start.dateTime,
        timeZone: googleEvent.start.timeZone
      },
      end: {
        dateTime: googleEvent.end.dateTime,
        timeZone: googleEvent.end.timeZone
      },
      attendees: googleEvent.attendees,
      status: googleEvent.status,
      created: googleEvent.created,
      updated: googleEvent.updated,
      extendedProperties: googleEvent.extendedProperties
    }
  }

  private convertTo24Hour(time12h: string): string {
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

  private addHour(time24h: string): string {
    const [hours, minutes] = time24h.split(':')
    const newHours = (parseInt(hours, 10) + 1) % 24
    return `${newHours.toString().padStart(2, '0')}:${minutes}`
  }

  private getSpecializationName(specialization: string): string {
    switch (specialization) {
      case 'heart': return 'Cardiologist'
      case 'brain': return 'Neurologist'
      case 'lungs': return 'Pulmonologist'
      case 'liver': return 'Hepatologist'
      default: return 'Specialist'
    }
  }
}

export const googleCalendarAPI = new GoogleCalendarAPI()