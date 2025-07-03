import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Patient from '@/lib/models/Patient'
import Analysis from '@/lib/models/Analysis'
import { decryptMedicalData } from '@/lib/encryption'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Build search query
    let query = {}
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }
    }

    // Get patients with pagination
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Patient.countDocuments(query)

    // Get analysis counts for each patient
    const patientsWithAnalysis = await Promise.all(
      patients.map(async (patient) => {
        const analysisCount = await Analysis.countDocuments({ patientId: patient._id })
        const latestAnalysis = await Analysis.findOne({ patientId: patient._id })
          .sort({ createdAt: -1 })

        return {
          id: patient._id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          createdAt: patient.createdAt,
          analysisCount,
          latestAnalysis: latestAnalysis?.createdAt || null
        }
      })
    )

    return NextResponse.json({
      patients: patientsWithAnalysis,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Patients retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}