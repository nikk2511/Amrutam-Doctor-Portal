const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  // Participants
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required']
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  patientEmail: {
    type: String,
    required: [true, 'Patient email is required'],
    trim: true,
    lowercase: true
  },
  patientPhone: {
    type: String,
    required: [true, 'Patient phone is required'],
    trim: true
  },
  patientAge: {
    type: Number,
    min: [0, 'Age cannot be negative'],
    max: [120, 'Age cannot exceed 120']
  },
  patientGender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  
  // Consultation Details
  consultationType: {
    type: String,
    enum: ['video', 'audio', 'chat', 'phone'],
    required: [true, 'Consultation type is required']
  },
  consultationDate: {
    type: Date,
    required: [true, 'Consultation date is required']
  },
  duration: {
    type: Number, // in minutes
    default: 30
  },
  
  // Medical Information
  chiefComplaint: {
    type: String,
    required: [true, 'Chief complaint is required'],
    maxlength: [1000, 'Chief complaint cannot exceed 1000 characters']
  },
  symptoms: [{
    type: String,
    trim: true
  }],
  medicalHistory: {
    type: String,
    maxlength: [2000, 'Medical history cannot exceed 2000 characters']
  },
  currentMedications: [{
    name: String,
    dosage: String,
    frequency: String
  }],
  allergies: [{
    type: String,
    trim: true
  }],
  
  // Ayurvedic Assessment
  prakriti: {
    type: String,
    enum: ['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Vata-Kapha', 'Pitta-Kapha', 'Tridosha']
  },
  vikriti: {
    type: String,
    enum: ['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Vata-Kapha', 'Pitta-Kapha', 'Tridosha']
  },
  pulse: {
    type: String,
    maxlength: [200, 'Pulse description cannot exceed 200 characters']
  },
  tongue: {
    type: String,
    maxlength: [200, 'Tongue examination cannot exceed 200 characters']
  },
  
  // Doctor's Assessment & Treatment
  diagnosis: {
    type: String,
    maxlength: [1000, 'Diagnosis cannot exceed 1000 characters']
  },
  treatment: {
    type: String,
    maxlength: [2000, 'Treatment plan cannot exceed 2000 characters']
  },
  prescriptions: [{
    medicineName: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    instructions: {
      type: String,
      default: 'Take as prescribed'
    }
  }],
  dietaryAdvice: {
    type: String,
    maxlength: [1000, 'Dietary advice cannot exceed 1000 characters']
  },
  lifestyleRecommendations: {
    type: String,
    maxlength: [1000, 'Lifestyle recommendations cannot exceed 1000 characters']
  },
  
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  followUpInstructions: {
    type: String,
    maxlength: [500, 'Follow-up instructions cannot exceed 500 characters']
  },
  
  // Consultation Status
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  
  // Payment & Billing
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: [0, 'Fee cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'cash']
  },
  transactionId: {
    type: String,
    trim: true
  },
  
  // Ratings & Feedback
  doctorRating: {
    type: Number,
    min: 1,
    max: 5
  },
  doctorFeedback: {
    type: String,
    maxlength: [500, 'Feedback cannot exceed 500 characters']
  },
  patientSatisfaction: {
    type: Number,
    min: 1,
    max: 5
  },
  
  // Technical Details
  meetingId: {
    type: String,
    trim: true
  },
  recordingUrl: {
    type: String,
    trim: true
  },
  
  // Additional Notes
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
consultationSchema.index({ doctorId: 1, consultationDate: 1 });
consultationSchema.index({ patientEmail: 1 });
consultationSchema.index({ status: 1, consultationDate: 1 });
consultationSchema.index({ paymentStatus: 1 });

// Virtual for actual duration
consultationSchema.virtual('actualDuration').get(function() {
  if (this.startTime && this.endTime) {
    return Math.round((this.endTime - this.startTime) / (1000 * 60)); // in minutes
  }
  return null;
});

// Pre-save middleware
consultationSchema.pre('save', function(next) {
  // Auto-set end time if status is completed and endTime is not set
  if (this.status === 'completed' && this.startTime && !this.endTime) {
    this.endTime = new Date();
  }
  next();
});

// Method to calculate consultation summary
consultationSchema.methods.getSummary = function() {
  return {
    consultationId: this._id,
    patientName: this.patientName,
    date: this.consultationDate,
    duration: this.actualDuration || this.duration,
    status: this.status,
    fee: this.consultationFee,
    diagnosis: this.diagnosis,
    followUpRequired: this.followUpRequired
  };
};

const Consultation = mongoose.model('Consultation', consultationSchema);

module.exports = Consultation;
