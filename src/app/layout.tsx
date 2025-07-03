import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ClerkProvider } from '@clerk/nextjs'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-modern'
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-luxury'
})

export const metadata: Metadata = {
  title: 'LuxeHealth AI - Premium Medical Image Analysis',
  description: 'Advanced AI-powered medical imaging analysis with luxury healthcare experience',
  keywords: ['healthcare', 'AI', 'medical imaging', 'MRI', 'diagnosis', 'luxury healthcare'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if Clerk keys are available
  const hasClerkKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  
  if (!hasClerkKeys) {
    return (
      <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
        <body className={`${inter.className} antialiased bg-gradient-to-br from-red-50 via-white to-red-100 min-h-screen`}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
              <p className="text-gray-600 mb-4">
                Clerk authentication keys are missing. Please check your environment variables.
              </p>
              <div className="text-left bg-gray-100 p-4 rounded text-sm">
                <p>Required variables:</p>
                <ul className="list-disc list-inside mt-2">
                  <li>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</li>
                  <li>CLERK_SECRET_KEY</li>
                </ul>
              </div>
            </div>
          </div>
          <Toaster />
          <Analytics />
        </body>
      </html>
    )
  }

  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/dashboard/user"
      signUpFallbackRedirectUrl="/dashboard/user"
      afterSignInUrl="/dashboard/user"
      afterSignUpUrl="/dashboard/user"
    >
      <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
        <body className={`${inter.className} antialiased bg-white min-h-screen`}>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1B2951',
                color: '#F8F6F0',
                border: '1px solid #D4AF37',
              },
            }}
          />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
