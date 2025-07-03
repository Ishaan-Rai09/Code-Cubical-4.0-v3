import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, return a basic response. In a real implementation, 
    // you would check the database for the user's subscription status
    // This could be stored in a separate Subscription model or in the User model
    
    return NextResponse.json({ 
      plan: null, // No active subscription by default
      status: 'inactive',
      nextBillingDate: null 
    })

  } catch (error) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
