# Google Calendar API Integration Setup

This application integrates with Google Calendar API to manage patient bookings and doctor appointments. Here's how to set it up:

## Prerequisites

1. Google Cloud Console account
2. A Google Calendar where appointments will be managed

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API for your project

### 2. Create a Service Account

1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Give it a name like "calendar-service"
4. Grant it the "Editor" role (or create a custom role with Calendar permissions)
5. Create and download the JSON key file

### 3. Set Up Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Google Calendar API Configuration
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
```

### 4. Get Your Calendar ID

1. Go to [Google Calendar](https://calendar.google.com/)
2. Create a new calendar for appointments (or use an existing one)
3. Go to calendar settings
4. Find the "Calendar ID" in the "Integrate calendar" section
5. Copy this ID to your environment variables

### 5. Share Calendar with Service Account

1. In Google Calendar, go to your calendar settings
2. Under "Share with specific people", add your service account email
3. Give it "Make changes and manage sharing" permissions

## Features

### For Patients
- Book appointments with doctors
- View booking status and doctor responses
- Join video meetings when appointments are confirmed

### For Doctors
- View all patient booking requests
- Accept or reject bookings with optional remarks
- Manage appointment schedules
- Join video meetings for confirmed appointments

## API Endpoints

### Patient Bookings
- `GET /api/bookings/patient?patientEmail={email}` - Get patient's bookings
- `POST /api/bookings/create` - Create new booking

### Doctor Bookings
- `GET /api/bookings/doctor?specialization={spec}` - Get doctor's bookings
- `POST /api/bookings/doctor` - Accept/reject bookings

### Booking Management
- `GET /api/bookings/check` - Check booking status
- `POST /api/bookings/check` - Update booking with remarks

## Fallback Mode

If Google Calendar API credentials are not configured, the system will use mock data for demonstration purposes. You'll see a warning in the console:

```
[GOOGLE_CALENDAR] API credentials not found, using mock data
```

## Troubleshooting

### Common Issues

1. **Authentication Error**: Check that your service account email and private key are correct
2. **Calendar Not Found**: Verify the calendar ID and ensure the service account has access
3. **Permission Denied**: Make sure the service account has proper permissions on the calendar

### Testing the Integration

1. Check the browser console for initialization messages
2. Try creating a booking as a patient
3. Check if the appointment appears in your Google Calendar
4. Test accepting/rejecting bookings as a doctor

## Security Notes

- Keep your private key secure and never commit it to version control
- Use environment variables for all sensitive configuration
- Consider using Google Cloud Secret Manager for production deployments
- Regularly rotate your service account keys

## Production Deployment

For production deployment:

1. Use Google Cloud Secret Manager or similar service for secrets
2. Set up proper IAM roles and permissions
3. Monitor API usage and quotas
4. Implement proper error handling and logging
5. Consider using OAuth 2.0 for user authentication if needed