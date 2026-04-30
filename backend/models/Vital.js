import mongoose from 'mongoose';

const vitalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['heartRate', 'bloodSugar', 'bloodPressure', 'weight', 'oxygenLevel', 'temperature', 'steps'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    // For blood pressure: systolic/diastolic
    valueSystolic: { type: Number },
    valueDiastolic: { type: Number },
    unit: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: 300,
    },
    // Reference ranges for alerting
    isAbnormal: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

vitalSchema.index({ userId: 1, type: 1, date: -1 });

// Auto-set unit based on type
vitalSchema.pre('save', function (next) {
  const units = {
    heartRate: 'bpm',
    bloodSugar: 'mg/dL',
    bloodPressure: 'mmHg',
    weight: 'kg',
    oxygenLevel: '%',
    temperature: '°C',
    steps: 'steps',
  };
  if (!this.unit) this.unit = units[this.type] || '';
  
  // Mark as abnormal if outside reference ranges
  const ranges = {
    heartRate: { min: 60, max: 100 },
    bloodSugar: { min: 70, max: 140 },
    oxygenLevel: { min: 95, max: 100 },
    temperature: { min: 36.1, max: 37.2 },
  };
  const range = ranges[this.type];
  if (range) {
    this.isAbnormal = this.value < range.min || this.value > range.max;
  }
  next();
});

export default mongoose.model('Vital', vitalSchema);
