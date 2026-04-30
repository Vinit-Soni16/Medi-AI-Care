export const VITAL_TYPES = [
  { value: 'heartRate',     label: 'Heart Rate',     unit: 'bpm',    icon: '❤️', color: '#ef4444', min: 60,  max: 100 },
  { value: 'bloodSugar',   label: 'Blood Sugar',    unit: 'mg/dL',  icon: '🩸', color: '#f59e0b', min: 70,  max: 140 },
  { value: 'bloodPressure',label: 'Blood Pressure', unit: 'mmHg',   icon: '🫀', color: '#8b5cf6', min: 90,  max: 130 },
  { value: 'oxygenLevel',  label: 'Oxygen Level',   unit: '%',      icon: '💨', color: '#06b6d4', min: 95,  max: 100 },
  { value: 'weight',       label: 'Weight',         unit: 'kg',     icon: '⚖️', color: '#10b981', min: 0,   max: 300 },
  { value: 'temperature',  label: 'Temperature',    unit: '°C',     icon: '🌡️', color: '#f97316', min: 36.1,max: 37.2 },
  { value: 'steps',        label: 'Steps',          unit: 'steps',  icon: '🚶', color: '#3b82f6', min: 0,   max: 50000 },
] as const;

export const APPOINTMENT_TYPES = ['consultation', 'follow-up', 'emergency', 'routine'] as const;

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;

export const SPECIALIZATIONS = [
  'General Medicine', 'Cardiology', 'Neurology', 'Orthopedics',
  'Pediatrics', 'Dermatology', 'Gynecology', 'Ophthalmology',
  'Psychiatry', 'ENT', 'Oncology', 'Radiology', 'Urology',
] as const;

export const TIME_SLOTS = [
  '09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','12:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM',
  '04:00 PM','04:30 PM','05:00 PM',
] as const;

export const STATUS_COLORS: Record<string, string> = {
  pending:   'badge-pending',
  confirmed: 'badge-confirmed',
  cancelled: 'badge-cancelled',
  completed: 'badge-completed',
};
