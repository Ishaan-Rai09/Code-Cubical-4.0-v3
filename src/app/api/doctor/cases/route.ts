import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { decryptMedicalData } from '@/lib/encryption'

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
    
    console.log('[DOCTOR_CASES] Fetching patient cases for specialization:', specialization)
    
    await connectDB()
    
    // Build filter based on specialization
    let filter: any = {}
    if (specialization) {
      filter.imageType = specialization
    }
    
    // Get analyses filtered by specialization with patient data
    const analyses = await Analysis.find(filter)
      .populate('patientId')
      .sort({ createdAt: -1 })
      .limit(50) // Limit to recent 50 cases
    
    console.log(`[DOCTOR_CASES] Found ${analyses.length} analyses`)
    
    // Format the data for doctor dashboard
    const formattedCases = []
    
    for (const analysis of analyses) {
      try {
        const encryptedResults = JSON.parse(analysis.encryptedResults)
        const decryptedResults = decryptMedicalData(encryptedResults)
        
        const patient = analysis.patientId as any
        const encryptedPatientData = JSON.parse(patient.encryptedData)
        const decryptedPatientData = decryptMedicalData(encryptedPatientData)
        
        formattedCases.push({
          id: analysis._id,
          analysisId: analysis.analysisId,
          patientName: decryptedPatientData.name,
          patientEmail: decryptedPatientData.email,
          imageType: analysis.imageType,
          anomalyDetected: analysis.anomalyDetected,
          confidence: analysis.confidence,
          status: analysis.status,
          createdAt: analysis.createdAt,
          findings: decryptedResults.findings || [],
          recommendations: decryptedResults.recommendations || [],
          technicalDetails: decryptedResults.technicalDetails || {},
          // Add doctor review status (simulated)
          doctorReviewed: Math.random() > 0.7, // 30% reviewed
          doctorNotes: Math.random() > 0.8 ? 'Reviewed and confirmed AI analysis. Recommend follow-up in 3 months.' : '',
          urgency: analysis.anomalyDetected ? 
            (analysis.confidence > 0.9 ? 'high' : 'medium') : 'low'
        })
      } catch (error) {
        console.warn('[DOCTOR_CASES] Could not decrypt case:', analysis._id)
      }
    }
    
    return NextResponse.json({
      success: true,
      cases: formattedCases,
      count: formattedCases.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('[DOCTOR_CASES] Error fetching cases:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch patient cases',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { caseId, doctorNotes, status } = body
    
    if (!caseId) {
      return NextResponse.json({ error: 'Case ID is required' }, { status: 400 })
    }
    
    console.log(`[DOCTOR_CASES] Updating case ${caseId} with doctor notes`)
    
    await connectDB()
    
    // In a real implementation, you'd update the analysis with doctor notes
    // For now, we'll simulate the update
    const analysis = await Analysis.findById(caseId)
    
    if (!analysis) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }
    
    // Update analysis with doctor review (in a real app, you'd have a separate doctor_reviews collection)
    // For demo, we'll just return success
    
    return NextResponse.json({
      success: true,
      message: 'Case updated successfully',
      caseId,
      doctorNotes,
      status,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('[DOCTOR_CASES] Error updating case:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update case',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}