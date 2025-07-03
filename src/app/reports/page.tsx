'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { User, FileText, Settings, LogOut, CreditCard, BarChart3, ArrowLeft } from 'lucide-react'
import ReportsPage from '@/components/ReportsPage'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default function ReportsPageRoute() {
  const { isLoaded, isSignedIn, user } = useUser()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect('/sign-in')
    }
  }, [isLoaded, isSignedIn])

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-luxury-gold"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-cream via-white to-luxury-platinum">
      {/* Top Navigation */}
      <nav className="bg-white shadow-lg border-b border-luxury-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center mr-4">
                <ArrowLeft className="h-5 w-5 text-luxury-navy mr-2" />
                <span className="text-luxury-navy">Back to Dashboard</span>
              </Link>
              <h1 className="text-2xl font-bold text-luxury-navy font-luxury">
                Reports & Analytics
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-luxury-navy" />
                <span className="text-luxury-navy font-medium">
                  {user?.firstName || 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        <ReportsPage />
      </div>
    </div>
  )
}