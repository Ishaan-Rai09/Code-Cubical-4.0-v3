import mongoose, { Schema, Document } from 'mongoose'

export interface IAnalysis extends Document {
  patientId: mongoose.Types.ObjectId
  analysisId: string
  imageType: 'brain' | 'heart' | 'lungs' | 'liver'
  originalImageHash: string
  encryptedResults: string
  reportPdfHash?: string
  pinataHash?: string
  anomalyDetected: boolean
  confidence: number
  status: 'pending' | 'completed' | 'failed'
  createdAt: Date
  updatedAt: Date
}

const AnalysisSchema: Schema = new Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  analysisId: {
    type: String,
    required: true,
    unique: true
  },
  imageType: {
    type: String,
    enum: ['brain', 'heart', 'lungs', 'liver'],
    required: true
  },
  originalImageHash: {
    type: String,
    required: true
  },
  encryptedResults: {
    type: String,
    required: true
  },
  reportPdfHash: {
    type: String
  },
  pinataHash: {
    type: String
  },
  anomalyDetected: {
    type: Boolean,
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
})

// Indexes for faster queries
AnalysisSchema.index({ patientId: 1 })
AnalysisSchema.index({ createdAt: -1 })
AnalysisSchema.index({ status: 1 })

export default mongoose.models.Analysis || mongoose.model<IAnalysis>('Analysis', AnalysisSchema)