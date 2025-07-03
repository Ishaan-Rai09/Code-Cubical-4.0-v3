import mongoose, { Schema, Document } from 'mongoose'

export interface IPatient extends Document {
  name: string
  email: string
  phone: string
  encryptedData: string
  ipfsDataHash?: string
  createdAt: Date
  updatedAt: Date
}

const PatientSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  encryptedData: {
    type: String,
    required: true
  },
  ipfsDataHash: {
    type: String
  }
}, {
  timestamps: true
})

// Index for faster queries
PatientSchema.index({ email: 1 })
PatientSchema.index({ createdAt: -1 })

export default mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema)