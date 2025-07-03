import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard/user(.*)',
  '/api/upload',
  '/api/analysis(.*)',
  '/api/patients(.*)',
  '/api/reports(.*)',
  '/api/payments(.*)',
  '/api/subscription(.*)',
  '/api/generate-pdf',
  '/api/generate-pdf-pinata',
  '/api/user-data',
  '/api/reviews/create',
  '/api/bookings(.*)',
  '/api/health-query',
  '/api/health'
])

// Doctor routes that don't require Clerk authentication (use custom doctor auth)
const isDoctorRoute = createRouteMatcher([
  '/dashboard/doctor(.*)',
  '/api/doctor(.*)'
])

// Allow test routes without authentication
const isTestRoute = createRouteMatcher([
  '/api/test-db',
  '/api/test-upload',
  '/api/test-env'
])

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/api/reviews/doctor',
  '/api/leaderboard/doctors',
  '/leaderboard'
])

export default clerkMiddleware((auth, req) => {
  // Skip authentication for test routes
  if (isTestRoute(req)) {
    return
  }
  
  // Skip authentication for doctor routes (they use custom auth)
  if (isDoctorRoute(req)) {
    return
  }
  
  // Skip authentication for public routes
  if (isPublicRoute(req)) {
    return
  }
  
  // Handle protected routes
  if (isProtectedRoute(req)) {
    auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}