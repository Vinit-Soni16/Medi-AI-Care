import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'image/jpg'],
    },
    fileSize: {
      type: Number,
    },
    // Raw OCR output
    extractedText: {
      type: String,
      default: '',
    },
    // Structured AI-parsed data
    parsedData: {
      patientName: String,
      date: String,
      doctorName: String,
      diagnosis: [String],
      medications: [
        {
          name: String,
          dosage: String,
          frequency: String,
          duration: String,
        },
      ],
      labResults: [
        {
          test: String,
          value: String,
          unit: String,
          referenceRange: String,
        },
      ],
      notes: String,
    },
    documentType: {
      type: String,
      enum: ['prescription', 'lab_report', 'discharge_summary', 'radiology', 'other'],
      default: 'other',
    },
    // Stored as base64 or URL
    fileData: {
      type: String,
    },
    isProcessed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Document', documentSchema);
