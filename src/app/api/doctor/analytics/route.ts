import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

// Import models properly to ensure they're registered
import '@/lib/models/Patient'
import '@/lib/models/Analysis'

import mongoose from 'mongoose'

// Get models after ensuring they're imported
const Analysis = mongoose.models.Analysis || mongoose.model('Analysis', require('@/lib/models/Analysis').default.schema)
const Patient = mongoose.models.Patient || mongoose.model('Patient', require('@/lib/models/Patient').default.schema)

export async function GET(request: NextRequest) {
  try {
    // Get doctor specialization from query params
    const { searchParams } = new URL(request.url)
    const specialization = searchParams.get('specialization')
    
    console.log('[DOCTOR_ANALYTICS] Generating analytics for specialization:', specialization)
    
    await connectDB()
    
    // Build filter based on specialization
    let filter: any = {}
    if (specialization) {
      filter.imageType = specialization
    }
    
    // Get analyses filtered by specialization for analytics
    const analyses = await Analysis.find(filter).sort({ createdAt: -1 })
    const patients = await Patient.find({})
    
    console.log(`[DOCTOR_ANALYTICS] Processing ${analyses.length} analyses and ${patients.length} patients`)
    
    // Calculate analytics
    const totalCases = analyses.length
    const anomaliesDetected = analyses.filter(a => a.anomalyDetected).length
    const normalCases = totalCases - anomaliesDetected
    const averageConfidence = totalCases > 0 
      ? analyses.reduce((acc, a) => acc + a.confidence, 0) / totalCases 
      : 0
    
    // Cases by type
    const casesByType = {
      brain: analyses.filter(a => a.imageType === 'brain').length,
      heart: analyses.filter(a => a.imageType === 'heart').length,
      lungs: analyses.filter(a => a.imageType === 'lungs').length,
      liver: analyses.filter(a => a.imageType === 'liver').length,
    }
    
    // Monthly trends (last 6 months)
    const monthlyData = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthCases = analyses.filter(a => {
        const caseDate = new Date(a.createdAt)
        return caseDate >= monthStart && caseDate <= monthEnd
      })
      
      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        totalCases: monthCases.length,
        anomalies: monthCases.filter(c => c.anomalyDetected).length,
        normal: monthCases.filter(c => !c.anomalyDetected).length
      })
    }
    
    // Recent activity (last 10 cases)
    const recentActivity = analyses.slice(0, 10).map(a => ({
      id: a._id,
      analysisId: a.analysisId,
      imageType: a.imageType,
      anomalyDetected: a.anomalyDetected,
      confidence: a.confidence,
      createdAt: a.createdAt,
      status: a.status
    }))
    
    // Performance metrics
    const highConfidenceCases = analyses.filter(a => a.confidence > 0.9).length
    const mediumConfidenceCases = analyses.filter(a => a.confidence > 0.7 && a.confidence <= 0.9).length
    const lowConfidenceCases = analyses.filter(a => a.confidence <= 0.7).length
    
    // Urgency distribution
    const urgentCases = analyses.filter(a => a.anomalyDetected && a.confidence > 0.9).length
    const moderateCases = analyses.filter(a => a.anomalyDetected && a.confidence > 0.7 && a.confidence <= 0.9).length
    const routineCases = totalCases - urgentCases - moderateCases
    
    const analytics = {
      overview: {
        totalCases,
        anomaliesDetected,
        normalCases,
        averageConfidence: Math.round(averageConfidence * 100) / 100,
        totalPatients: patients.length
      },
      casesByType,
      monthlyTrends: monthlyData,
      recentActivity,
      performance: {
        highConfidence: highConfidenceCases,
        mediumConfidence: mediumConfidenceCases,
        lowConfidence: lowConfidenceCases
      },
      urgencyDistribution: {
        urgent: urgentCases,
        moderate: moderateCases,
        routine: routineCases
      },
      // Simulated doctor-specific metrics
      doctorMetrics: {
        casesReviewed: Math.floor(totalCases * 0.3), // 30% reviewed
        averageReviewTime: '12 minutes',
        accuracyRate: 0.96,
        patientsHelped: patients.length,
        consultationsProvided: Math.floor(totalCases * 0.15) // 15% consultations
      }
    }
    
    return NextResponse.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('[DOCTOR_ANALYTICS] Error generating analytics:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate doctor analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}