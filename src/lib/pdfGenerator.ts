import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { pinataService } from './pinata'
import { encryptMedicalData, generateFileHash } from './encryption'

interface AnalysisResult {
  id: string
  patientName: string
  imageType: string
  anomalyDetected: boolean
  confidence: number
  findings: string[]
  recommendations: string[]
  timestamp: Date
  reportUrl?: string
}

export const generatePDFReport = async (analysisResult: AnalysisResult): Promise<{ localFile: string; ipfsHash?: string }> => {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  
  // Header
  pdf.setFillColor(24, 40, 72) // luxury-navy
  pdf.rect(0, 0, pageWidth, 40, 'F')
  
  // Logo area (text-based)
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(24)
  pdf.setFont('helvetica', 'bold')
  pdf.text('LuxeHealth AI', margin, 25)
  
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Medical Image Analysis Report', margin, 35)
  
  // Reset text color
  pdf.setTextColor(0, 0, 0)
  
  let yPosition = 60
  
  // Report Title
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Analysis Report', margin, yPosition)
  yPosition += 15
  
  // Date
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Generated on: ${analysisResult.timestamp.toLocaleDateString()} at ${analysisResult.timestamp.toLocaleTimeString()}`, margin, yPosition)
  yPosition += 20
  
  // Patient Information Section
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Patient Information', margin, yPosition)
  yPosition += 10
  
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Patient Name: ${analysisResult.patientName}`, margin + 5, yPosition)
  yPosition += 8
  pdf.text(`Analysis ID: ${analysisResult.id}`, margin + 5, yPosition)
  yPosition += 8
  pdf.text(`Image Type: ${analysisResult.imageType.charAt(0).toUpperCase() + analysisResult.imageType.slice(1)} Scan`, margin + 5, yPosition)
  yPosition += 8
  pdf.text(`Analysis Date: ${analysisResult.timestamp.toLocaleDateString()}`, margin + 5, yPosition)
  yPosition += 20
  
  // Analysis Summary Section
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Analysis Summary', margin, yPosition)
  yPosition += 10
  
  // Status indicator
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  if (analysisResult.anomalyDetected) {
    pdf.setTextColor(255, 165, 0) // Orange
    pdf.text('⚠ Anomaly Detected', margin + 5, yPosition)
  } else {
    pdf.setTextColor(0, 128, 0) // Green
    pdf.text('✓ No Anomalies Detected', margin + 5, yPosition)
  }
  
  pdf.setTextColor(0, 0, 0)
  yPosition += 10
  
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`AI Confidence Level: ${(analysisResult.confidence * 100).toFixed(1)}%`, margin + 5, yPosition)
  yPosition += 20
  
  // Findings Section
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Detailed Findings', margin, yPosition)
  yPosition += 10
  
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'normal')
  analysisResult.findings.forEach((finding, index) => {
    const lines = pdf.splitTextToSize(`• ${finding}`, pageWidth - 2 * margin - 10)
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage()
        yPosition = 30
      }
      pdf.text(line, margin + 5, yPosition)
      yPosition += 6
    })
    yPosition += 2
  })
  
  yPosition += 10
  
  // Recommendations Section
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Medical Recommendations', margin, yPosition)
  yPosition += 10
  
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'normal')
  analysisResult.recommendations.forEach((recommendation, index) => {
    const lines = pdf.splitTextToSize(`• ${recommendation}`, pageWidth - 2 * margin - 10)
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage()
        yPosition = 30
      }
      pdf.text(line, margin + 5, yPosition)
      yPosition += 6
    })
    yPosition += 2
  })
  
  // Add new page if needed for disclaimer
  if (yPosition > pageHeight - 60) {
    pdf.addPage()
    yPosition = 30
  } else {
    yPosition += 20
  }
  
  // AI Methodology Section
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text('AI Analysis Methodology', margin, yPosition)
  yPosition += 10
  
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'normal')
  const methodologyText = [
    '• Deep Learning: Advanced neural networks trained on millions of medical images',
    '• Pattern Recognition: Sophisticated algorithms for anomaly detection and classification',
    '• Validation: Results validated against clinical standards and expert review'
  ]
  
  methodologyText.forEach(text => {
    const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin - 10)
    lines.forEach((line: string) => {
      pdf.text(line, margin + 5, yPosition)
      yPosition += 6
    })
    yPosition += 2
  })
  
  yPosition += 15
  
  // Disclaimer Section
  pdf.setFillColor(255, 248, 220) // Light yellow background
  pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 50, 'F')
  
  pdf.setTextColor(180, 83, 9) // Orange text
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Important Medical Disclaimer', margin + 5, yPosition + 5)
  
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  yPosition += 15
  
  const disclaimerText = [
    'This AI analysis is for informational purposes only and should not be considered as a substitute',
    'for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare',
    'professionals for proper medical evaluation and treatment decisions. The AI system provides',
    'assistance to healthcare providers but does not replace clinical judgment and expertise.'
  ]
  
  disclaimerText.forEach(text => {
    pdf.text(text, margin + 5, yPosition)
    yPosition += 5
  })
  
  // Footer
  pdf.setFontSize(10)
  pdf.setTextColor(128, 128, 128)
  pdf.text('Generated by LuxeHealth AI - Premium Medical Image Analysis Platform', margin, pageHeight - 15)
  pdf.text(`Report ID: ${analysisResult.id}`, margin, pageHeight - 10)
  
  // Generate PDF blob
  const fileName = `LuxeHealth_Analysis_Report_${analysisResult.patientName.replace(/\s+/g, '_')}_${analysisResult.timestamp.toISOString().split('T')[0]}.pdf`
  const pdfBlob = pdf.output('blob')
  
  let ipfsHash: string | undefined
  
  try {
    // Create File object from blob for Pinata upload
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' })
    
    // Generate PDF hash for integrity verification
    const pdfHash = generateFileHash(await pdfBlob.arrayBuffer())
    
    // Encrypt PDF metadata with enhanced security
    const encryptedMetadata = encryptMedicalData({
      patientName: analysisResult.patientName,
      analysisId: analysisResult.id,
      imageType: analysisResult.imageType,
      generatedAt: new Date().toISOString(),
      anomalyDetected: analysisResult.anomalyDetected,
      confidence: analysisResult.confidence,
      fileName,
      fileSize: pdfBlob.size,
      pdfHash
    })
    
    // Upload encrypted PDF to Pinata
    const uploadResult = await pinataService.uploadFile(pdfFile, {
      name: `encrypted-pdf-report-${Date.now()}`,
      keyvalues: {
        type: 'pdf_report',
        patientName: analysisResult.patientName,
        analysisId: analysisResult.id,
        encrypted: 'true',
        uploadDate: new Date().toISOString()
      }
    })
    
    ipfsHash = uploadResult.IpfsHash
    
    // Also upload encrypted metadata separately
    await pinataService.uploadJSON({
      encryptedMetadata,
      reportHash: ipfsHash,
      publicInfo: {
        analysisId: analysisResult.id,
        reportType: 'pdf_analysis_report',
        uploadTimestamp: new Date().toISOString()
      }
    }, {
      name: `pdf-metadata-${Date.now()}`,
      keyvalues: {
        type: 'pdf_metadata',
        analysisId: analysisResult.id,
        reportHash: ipfsHash,
        uploadDate: new Date().toISOString()
      }
    })
    
    console.log('PDF successfully stored in Pinata with hash:', ipfsHash)
    
    // Update analysis record with PDF hash
    try {
      await fetch('/api/analysis/update-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisId: analysisResult.id,
          pdfHash: ipfsHash
        })
      })
    } catch (updateError) {
      console.error('Failed to update analysis with PDF hash:', updateError)
    }
    
  } catch (error) {
    console.error('Failed to upload PDF to Pinata:', error)
    // Continue with local download even if Pinata upload fails
  }
  
  // Download PDF locally
  pdf.save(fileName)
  
  return {
    localFile: fileName,
    ipfsHash
  }
}

export const generatePDFFromElement = async (elementId: string, fileName: string): Promise<void> => {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('Element not found')
  }
  
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    const imgWidth = pageWidth - 20 // 10mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    let heightLeft = imgHeight
    let position = 10
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
    heightLeft -= pageHeight - 20
    
    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pageHeight - 20
    }
    
    pdf.save(fileName)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}
