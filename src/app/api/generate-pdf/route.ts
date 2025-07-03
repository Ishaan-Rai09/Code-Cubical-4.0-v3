import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Analysis from '@/lib/models/Analysis'
import Patient from '@/lib/models/Patient'
import { pinataService } from '@/lib/pinata'
import { decryptObject } from '@/lib/encryption'
import jsPDF from 'jspdf'

export async function GET(request: NextRequest) {
  const requestId = `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  console.log(`[${requestId}] PDF generation requested at ${new Date().toISOString()}`)
  
  try {
    console.log(`[${requestId}] Connecting to database...`)
    await connectDB()
    console.log(`[${requestId}] Database connected successfully`)

    const { searchParams } = new URL(request.url)
    const analysisId = searchParams.get('analysisId')
    console.log(`[${requestId}] Analysis ID: ${analysisId}`)

    if (!analysisId) {
      console.log(`[${requestId}] Error: Analysis ID is required`)
      return NextResponse.json({ error: 'Analysis ID is required' }, { status: 400 })
    }

    // Find analysis
    console.log(`[${requestId}] Finding analysis with ID: ${analysisId}`)
    const analysis = await Analysis.findOne({ analysisId }).populate('patientId')
    console.log(`[${requestId}] Analysis found:`, analysis ? 'Yes' : 'No')
    if (analysis) {
      console.log(`[${requestId}] Analysis details:`, {
        id: analysis._id,
        analysisId: analysis.analysisId,
        imageType: analysis.imageType,
        patientId: analysis.patientId ? 'Present' : 'Missing',
        anomalyDetected: analysis.anomalyDetected,
        confidence: analysis.confidence
      })
    }
    
    if (!analysis) {
      console.log(`[${requestId}] Error: Analysis not found for ID ${analysisId}`)
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    // Check if PDF already exists
    if (analysis.reportPdfHash) {
      return NextResponse.json({
        success: true,
        pdfHash: analysis.reportPdfHash,
        downloadUrl: pinataService.getGatewayUrl(analysis.reportPdfHash)
      })
    }

    // Handle both encrypted and plain data
    console.log(`[${requestId}] Processing patient and analysis data...`)
    const patient = analysis.patientId as any
    console.log(`[${requestId}] Patient data type:`, typeof patient.encryptedData)
    console.log(`[${requestId}] Analysis results type:`, typeof analysis.encryptedResults)
    
    let patientData, analysisResults
    
    try {
      console.log(`[${requestId}] Attempting to parse patient data...`)
      // Try to decrypt if data is encrypted
      if (typeof patient.encryptedData === 'string') {
        console.log(`[${requestId}] Patient data is string, parsing JSON...`)
        patientData = JSON.parse(patient.encryptedData)
        console.log(`[${requestId}] Patient data parsed successfully:`, {
          name: patientData.name,
          email: patientData.email,
          imageType: patientData.imageType,
          hasUserId: !!patientData.userId
        })
      } else {
        console.log(`[${requestId}] Patient data is object, attempting decryption...`)
        patientData = decryptObject(patient.encryptedData)
        console.log(`[${requestId}] Patient data decrypted successfully`)
      }
      
      console.log(`[${requestId}] Attempting to parse analysis results...`)
      if (typeof analysis.encryptedResults === 'string') {
        console.log(`[${requestId}] Analysis results is string, parsing JSON...`)
        analysisResults = JSON.parse(analysis.encryptedResults)
        console.log(`[${requestId}] Analysis results parsed successfully:`, {
          hasFindings: !!analysisResults.findings,
          hasRecommendations: !!analysisResults.recommendations,
          hasTechnicalDetails: !!analysisResults.technicalDetails
        })
      } else {
        console.log(`[${requestId}] Analysis results is object, attempting decryption...`)
        analysisResults = decryptObject(analysis.encryptedResults)
        console.log(`[${requestId}] Analysis results decrypted successfully`)
      }
    } catch (error) {
      console.log(`[${requestId}] Error in data parsing/decryption:`, error instanceof Error ? error.message : error)
      console.log(`[${requestId}] Falling back to plain data handling...`)
      
      // If decryption fails, assume data is already plain
      patientData = typeof patient.encryptedData === 'string' 
        ? JSON.parse(patient.encryptedData) 
        : patient.encryptedData
      analysisResults = typeof analysis.encryptedResults === 'string'
        ? JSON.parse(analysis.encryptedResults)
        : analysis.encryptedResults
        
      console.log(`[${requestId}] Fallback parsing completed`)
    }

    // Generate PDF
    console.log(`[${requestId}] Generating PDF report...`)
    const pdfBuffer = await generateAnalysisReport({
      analysisId: analysis.analysisId,
      patientName: patientData.name,
      imageType: analysis.imageType,
      anomalyDetected: analysis.anomalyDetected,
      confidence: analysis.confidence,
      findings: analysisResults.findings,
      recommendations: analysisResults.recommendations,
      technicalDetails: analysisResults.technicalDetails,
      timestamp: analysis.createdAt
    })
    console.log(`[${requestId}] PDF generated successfully, size: ${pdfBuffer.length} bytes`)
    
    // Try to upload to Pinata if credentials are available
    try {
      console.log(`[${requestId}] Attempting to upload PDF to Pinata...`)
      const pdfFile = new File([pdfBuffer], `analysis-report-${analysis.analysisId}.pdf`, {
        type: 'application/pdf'
      })
      
      const uploadResult = await pinataService.uploadFile(pdfFile, {
        name: `analysis-report-${analysis.analysisId}`,
        keyvalues: {
          analysisId: analysis.analysisId,
          patientName: patientData.name,
          reportType: 'medical-analysis',
          generatedAt: new Date().toISOString()
        }
      })
      
      console.log(`[${requestId}] PDF uploaded to Pinata successfully!`)
      console.log(`[${requestId}] IPFS Hash: ${uploadResult.IpfsHash}`)
      
      // Update analysis with PDF hash
      analysis.reportPdfHash = uploadResult.IpfsHash
      await analysis.save()
      console.log(`[${requestId}] Analysis updated with PDF hash`)
      
    } catch (pinataError) {
      console.warn(`[${requestId}] Pinata upload failed (continuing without cloud storage):`, pinataError instanceof Error ? pinataError.message : pinataError)
      console.warn(`[${requestId}] PDF will be returned directly without cloud storage`)
    }

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="medical-report-${analysisId}.pdf"`
      }
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF report' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { analysisId } = await request.json()

    if (!analysisId) {
      return NextResponse.json({ error: 'Analysis ID is required' }, { status: 400 })
    }

    // Find analysis
    const analysis = await Analysis.findOne({ analysisId }).populate('patientId')
    
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    // Decrypt data
    const patient = analysis.patientId as any
    const decryptedPatientData = decryptObject(patient.encryptedData)
    const decryptedResults = decryptObject(analysis.encryptedResults)

    // Generate PDF
    const pdfBuffer = await generateAnalysisReport({
      analysisId: analysis.analysisId,
      patientName: decryptedPatientData.name,
      imageType: analysis.imageType,
      anomalyDetected: analysis.anomalyDetected,
      confidence: analysis.confidence,
      findings: decryptedResults.findings,
      recommendations: decryptedResults.recommendations,
      technicalDetails: decryptedResults.technicalDetails,
      timestamp: analysis.createdAt
    })

    // Convert buffer to File for Pinata upload
    const pdfFile = new File([pdfBuffer], `analysis-report-${analysisId}.pdf`, {
      type: 'application/pdf'
    })

    // Upload PDF to Pinata
    const uploadResult = await pinataService.uploadFile(pdfFile, {
      name: `analysis-report-${analysisId}`,
      keyvalues: {
        analysisId,
        patientName: decryptedPatientData.name,
        reportType: 'medical-analysis',
        generatedAt: new Date().toISOString()
      }
    })

    // Update analysis with PDF hash
    analysis.reportPdfHash = uploadResult.IpfsHash
    await analysis.save()

    return NextResponse.json({
      success: true,
      pdfHash: uploadResult.IpfsHash,
      downloadUrl: pinataService.getGatewayUrl(uploadResult.IpfsHash)
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF report' },
      { status: 500 }
    )
  }
}

async function generateAnalysisReport(data: any): Promise<Buffer> {
  const doc = new jsPDF()
  
  // Set up fonts and colors
  doc.setFont('helvetica')
  
  // Header
  doc.setFontSize(20)
  doc.setTextColor(27, 41, 81) // luxury-navy
  doc.text('LuxeHealth AI', 20, 30)
  doc.text('Medical Analysis Report', 20, 45)
  
  // Patient Information
  doc.setFontSize(14)
  doc.text('Patient Information', 20, 70)
  doc.setFontSize(12)
  doc.text(`Name: ${data.patientName}`, 20, 85)
  doc.text(`Analysis ID: ${data.analysisId}`, 20, 95)
  doc.text(`Image Type: ${data.imageType.charAt(0).toUpperCase() + data.imageType.slice(1)} Scan`, 20, 105)
  doc.text(`Date: ${new Date(data.timestamp).toLocaleDateString()}`, 20, 115)
  
  // Analysis Summary
  doc.setFontSize(14)
  doc.text('Analysis Summary', 20, 140)
  doc.setFontSize(12)
  doc.text(`Result: ${data.anomalyDetected ? 'Anomaly Detected' : 'No Anomalies Detected'}`, 20, 155)
  doc.text(`Confidence: ${(data.confidence * 100).toFixed(1)}%`, 20, 165)
  
  // Findings
  doc.setFontSize(14)
  doc.text('Detailed Findings', 20, 190)
  doc.setFontSize(10)
  let yPosition = 205
  data.findings.forEach((finding: string, index: number) => {
    const lines = doc.splitTextToSize(`${index + 1}. ${finding}`, 170)
    doc.text(lines, 20, yPosition)
    yPosition += lines.length * 5 + 5
  })
  
  // Recommendations
  yPosition += 10
  doc.setFontSize(14)
  doc.text('Medical Recommendations', 20, yPosition)
  yPosition += 15
  doc.setFontSize(10)
  data.recommendations.forEach((recommendation: string, index: number) => {
    const lines = doc.splitTextToSize(`${index + 1}. ${recommendation}`, 170)
    doc.text(lines, 20, yPosition)
    yPosition += lines.length * 5 + 5
  })
  
  // Technical Details
  if (yPosition < 250) {
    yPosition += 10
    doc.setFontSize(14)
    doc.text('Technical Details', 20, yPosition)
    yPosition += 15
    doc.setFontSize(10)
    doc.text(`Processing Time: ${data.technicalDetails.processingTime}`, 20, yPosition)
    doc.text(`Model Version: ${data.technicalDetails.modelVersion}`, 20, yPosition + 10)
    doc.text(`Image Quality: ${data.technicalDetails.imageQuality}`, 20, yPosition + 20)
    doc.text(`Analysis Method: ${data.technicalDetails.analysisMethod}`, 20, yPosition + 30)
  }
  
  // Footer
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text('This report is generated by LuxeHealth AI and should be reviewed by a qualified healthcare professional.', 20, 280)
  doc.text(`Generated on ${new Date().toLocaleString()}`, 20, 290)
  
  return Buffer.from(doc.output('arraybuffer'))
}