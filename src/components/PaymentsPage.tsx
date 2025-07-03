'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { CreditCard, Check, Crown, Star, Zap, FileText } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PricingPlan {
  id: string
  name: string
  price: number
  currency: string
  interval: string
  features: string[]
  icon: React.ReactNode
  popular?: boolean
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic Analysis',
    price: 29,
    currency: 'USD',
    interval: 'per analysis',
    features: [
      'Single medical image analysis',
      'AI-powered diagnostics',
      'Basic report generation',
      'Email support',
      'Standard processing time'
    ],
    icon: <FileText className="h-8 w-8" />
  },
  {
    id: 'premium',
    name: 'Premium Package',
    price: 99,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Up to 10 analyses per month',
      'Priority processing',
      'Detailed PDF reports',
      'Phone & email support',
      'Advanced AI algorithms',
      'Image enhancement'
    ],
    icon: <Star className="h-8 w-8" />,
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Unlimited analyses',
      'Instant processing',
      'Custom report templates',
      '24/7 dedicated support',
      'API access',
      'Multi-user accounts',
      'HIPAA compliance'
    ],
    icon: <Crown className="h-8 w-8" />
  }
]

export default function PaymentsPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      fetchUserSubscription()
      fetchPaymentHistory()
    }
  }, [user])

  const fetchUserSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/status')
      if (response.ok) {
        const data = await response.json()
        setCurrentPlan(data.plan)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch('/api/payments/history')
      if (response.ok) {
        const data = await response.json()
        setPaymentHistory(data.payments || [])
      }
    } catch (error) {
      console.error('Error fetching payment history:', error)
    }
  }

  const handleSubscribe = async (planId: string) => {
    if (!user) return

    setLoading(planId)
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress
        }),
      })

      if (response.ok) {
        const { sessionId } = await response.json()
        const stripe = await stripePromise
        
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId,
          })
          
          if (error) {
            console.error('Stripe error:', error)
          }
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleOneTimePayment = async (planId: string) => {
    if (!user) return

    setLoading(planId)
    
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress
        }),
      })

      if (response.ok) {
        const { sessionId } = await response.json()
        const stripe = await stripePromise
        
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId,
          })
          
          if (error) {
            console.error('Stripe error:', error)
          }
        }
      }
    } catch (error) {
      console.error('Error creating payment intent:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-luxury-navy font-luxury mb-2">
          Pricing & Payments
        </h1>
        <p className="text-gray-600">
          Choose the perfect plan for your medical analysis needs
        </p>
      </div>

      {/* Current Plan Status */}
      {currentPlan && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">
              Current Plan: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
            </span>
          </div>
        </div>
      )}

      {/* Pricing Plans */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-lg shadow-lg border p-8 ${
              plan.popular 
                ? 'border-luxury-gold ring-2 ring-luxury-gold/20 scale-105' 
                : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-luxury-gold text-luxury-navy px-4 py-1 text-sm font-medium rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <div className={`inline-flex p-3 rounded-full mb-4 ${
                plan.popular 
                  ? 'bg-luxury-gold/10 text-luxury-navy' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {plan.icon}
              </div>
              <h3 className="text-xl font-semibold text-luxury-navy mb-2">
                {plan.name}
              </h3>
              <div className="text-3xl font-bold text-luxury-navy mb-1">
                ${plan.price}
              </div>
              <p className="text-gray-600 text-sm">{plan.interval}</p>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-2">
              {plan.id === 'basic' ? (
                <button
                  onClick={() => handleOneTimePayment(plan.id)}
                  disabled={loading === plan.id || currentPlan === plan.id}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    currentPlan === plan.id
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-luxury-gold text-luxury-navy hover:bg-luxury-gold/90'
                      : 'bg-luxury-navy text-white hover:bg-luxury-navy/90'
                  }`}
                >
                  {loading === plan.id ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    </div>
                  ) : currentPlan === plan.id ? (
                    'Current Plan'
                  ) : (
                    'Pay Now'
                  )}
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id || currentPlan === plan.id}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    currentPlan === plan.id
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-luxury-gold text-luxury-navy hover:bg-luxury-gold/90'
                      : 'bg-luxury-navy text-white hover:bg-luxury-navy/90'
                  }`}
                >
                  {loading === plan.id ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    </div>
                  ) : currentPlan === plan.id ? (
                    'Current Plan'
                  ) : (
                    'Subscribe'
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-luxury-navy mb-4">
          Payment History
        </h2>
        
        {paymentHistory.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No payment history yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-900">{payment.plan}</td>
                    <td className="py-3 px-4 text-gray-900">${payment.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        payment.status === 'succeeded'
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
