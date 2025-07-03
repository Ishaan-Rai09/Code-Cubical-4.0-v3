'use client'

import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-luxury-cream via-white to-luxury-platinum">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-luxury-navy font-luxury">
            Join LuxeHealth AI
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to access premium medical analysis
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <SignUp 
            redirectUrl="/dashboard/user"
            fallbackRedirectUrl="/dashboard/user"
            appearance={{
              elements: {
                formButtonPrimary: 
                  'bg-luxury-gold hover:bg-luxury-gold/90 text-luxury-navy',
                card: 'bg-white/80 backdrop-blur-sm border border-luxury-gold/30 shadow-xl',
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
