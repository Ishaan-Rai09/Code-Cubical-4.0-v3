# LuxeHealth AI - Demo Credentials

## Doctor Login Credentials

Use these credentials to test different doctor specializations. Each doctor will only see cases related to their specific specialization.

### 🫀 Cardiologist (Heart Specialist)
- **Email:** `cardiologist@demo.com`
- **License Number:** `MD123456789`
- **Specialization:** `Cardiologist (Heart Specialist)`
- **Password:** `demo123`
- **Cases Shown:** Heart-related medical analyses only

### 🧠 Neurologist (Brain Specialist)
- **Email:** `neurologist@demo.com`
- **License Number:** `MD987654321`
- **Specialization:** `Neurologist (Brain Specialist)`
- **Password:** `demo123`
- **Cases Shown:** Brain-related medical analyses only

### 🫁 Pulmonologist (Lung Specialist)
- **Email:** `pulmonologist@demo.com`
- **License Number:** `MD456789123`
- **Specialization:** `Pulmonologist (Lung Specialist)`
- **Password:** `demo123`
- **Cases Shown:** Lung-related medical analyses only

### 🫘 Hepatologist (Liver Specialist)
- **Email:** `hepatologist@demo.com`
- **License Number:** `MD789123456`
- **Specialization:** `Hepatologist (Liver Specialist)`
- **Password:** `demo123`
- **Cases Shown:** Liver-related medical analyses only

## How to Test

1. **Go to Doctor Login:** Navigate to `/doctor-login`
2. **Select Credentials:** Choose any of the above credential sets
3. **Fill Form:** Enter the email, license number, select the matching specialization, and enter password
4. **Login:** Click "Access Doctor Dashboard"
5. **Verify Filtering:** Check that only relevant cases appear in the dashboard

## Features to Test

### Specialization-Specific Features:
- **Dashboard Home:** Shows only cases for the doctor's specialization
- **Patient Cases:** Filtered case list with specialization-specific data
- **Analytics:** Statistics and charts filtered by organ type
- **Booking System:** Patients can book with specific specialists

### Session Persistence:
- **Navigation:** Doctor stays logged in when navigating between pages
- **Home Page:** Shows doctor status when returning to landing page
- **Auto-Logout:** Session expires after 24 hours or manual logout

### Booking Integration:
- **Patient Booking:** Patients can book consultations with specific specialists
- **Doctor Review:** Doctors can check bookings from their cases page
- **Google Calendar:** Simulated calendar integration for appointments

## Patient Login

For patient testing, use the standard Clerk authentication system:
- Click "Patient Login" on the landing page
- Sign up or sign in with any email
- Access patient dashboard with booking functionality

## Notes

- All demo data is simulated for demonstration purposes
- In production, these would connect to real medical databases
- Google Calendar integration is currently simulated
- All patient data is encrypted and HIPAA-compliant in design