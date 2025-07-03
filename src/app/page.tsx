'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import LandingPage from '@/components/LandingPage'

export default function Home() {
  const [clerkError, setClerkError] = useState<string | null>(null)
  
  // Safely use Clerk with error handling
  let isSignedIn = false
  let user = null
  let isLoaded = false
  
  try {
    const clerkData = useUser()
    isSignedIn = clerkData.isSignedIn || false
    user = clerkData.user
    isLoaded = clerkData.isLoaded || false
  } catch (error) {
    console.error('Clerk error:', error)
    setClerkError('Authentication service unavailable')
    isLoaded = true // Treat as loaded to continue
  }

  // Show error state if Clerk fails
  if (clerkError) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Service Unavailable</h1>
          <p className="text-gray-600 mb-4">{clerkError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </main>
    )
  }

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading LuxeHealth AI...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <LandingPage 
        isAuthenticated={isSignedIn}
        user={user}
      />
    </main>
  )
}
