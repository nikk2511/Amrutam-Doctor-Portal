const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Doctor and Patient Information
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
  
  // Appointment Details
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required']
  },
  duration: {
    type: Number, // in minutes
    default: 30,
    min: [15, 'Minimum duration is 15 minutes'],
    max: [120, 'Maximum duration is 120 minutes']
  },
  appointmentType: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'routine-checkup'],
    default: 'consultation'
  },
  consultationMode: {
    type: String,
    enum: ['video', 'audio', 'chat', 'in-person'],
    required: [true, 'Consultation mode is required']
  },
  
  // Medical Information (Brief)
  reasonForVisit: {
    type: String,
    required: [true, 'Reason for visit is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  symptoms: [{
    type: String,
    trim: true
  }],
  urgencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  
  // Status and Scheduling
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'],
    default: 'scheduled'
  },
  confirmationStatus: {
    type: String,
    enum: ['pending', 'confirmed-by-doctor', 'confirmed-by-patient', 'auto-confirmed'],
    default: 'pending'
  },
  
  // Booking Information
  bookedAt: {
    type: Date,
    default: Date.now
  },
  bookedBy: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },
  
  // Payment Information
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: [0, 'Fee cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'waived'],
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
  
  // Reminders and Notifications
  remindersSent: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed'],
      default: 'sent'
    }
  }],
  
  // Rescheduling Information
  originalAppointmentDate: {
    type: Date
  },
  rescheduledBy: {
    type: String,
    enum: ['patient', 'doctor', 'admin']
  },
  reschedulingReason: {
    type: String,
    maxlength: [200, 'Rescheduling reason cannot exceed 200 characters']
  },
  reschedulingCount: {
    type: Number,
    default: 0
  },
  
  // Cancellation Information
  cancellationReason: {
    type: String,
    maxlength: [200, 'Cancellation reason cannot exceed 200 characters']
  },
  cancelledBy: {
    type: String,
    enum: ['patient', 'doctor', 'admin']
  },
  cancelledAt: {
    type: Date
  },
  
  // Technical Details
  meetingLink: {
    type: String,
    trim: true
  },
  meetingId: {
    type: String,
    trim: true
  },
  
  // Special Instructions
  specialInstructions: {
    type: String,
    maxlength: [300, 'Special instructions cannot exceed 300 characters']
  },
  doctorNotes: {
    type: String,
    maxlength: [500, 'Doctor notes cannot exceed 500 characters']
  },
  
  // Follow-up Information
  isFollowUp: {
    type: Boolean,
    default: false
  },
  parentConsultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation'
  },
  
  // Feedback and Rating
  patientFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [300, 'Feedback comment cannot exceed 300 characters']
    },
    submittedAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ patientEmail: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });
appointmentSchema.index({ confirmationStatus: 1 });
appointmentSchema.index({ paymentStatus: 1 });

// Virtual for formatted appointment datetime
appointmentSchema.virtual('appointmentDateTime').get(function() {
  if (this.appointmentDate && this.appointmentTime) {
    const [hours, minutes] = this.appointmentTime.split(':');
    const datetime = new Date(this.appointmentDate);
    datetime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return datetime;
  }
  return null;
});

// Virtual for appointment end time
appointmentSchema.virtual('appointmentEndTime').get(function() {
  const startTime = this.appointmentDateTime;
  if (startTime) {
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + this.duration);
    return endTime;
  }
  return null;
});

// Pre-save middleware
appointmentSchema.pre('save', function(next) {
  // Auto-set cancellation timestamp
  if (this.isModified('status') && this.status === 'cancelled' && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }
  
  // Increment rescheduling count
  if (this.isModified('appointmentDate') && this.originalAppointmentDate && this.status === 'rescheduled') {
    this.reschedulingCount += 1;
  }
  
  next();
});

// Method to check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const appointmentTime = this.appointmentDateTime;
  const hoursDifference = (appointmentTime - now) / (1000 * 60 * 60);
  
  return (
    this.status === 'scheduled' || this.status === 'confirmed'
  ) && hoursDifference > 2; // Can cancel if more than 2 hours before appointment
};

// Method to check if appointment can be rescheduled
appointmentSchema.methods.canBeRescheduled = function() {
  const now = new Date();
  const appointmentTime = this.appointmentDateTime;
  const hoursDifference = (appointmentTime - now) / (1000 * 60 * 60);
  
  return (
    this.status === 'scheduled' || this.status === 'confirmed'
  ) && hoursDifference > 4 && this.reschedulingCount < 2; // Can reschedule if more than 4 hours before and less than 2 reschedules
};

// Method to generate appointment summary
appointmentSchema.methods.getSummary = function() {
  return {
    appointmentId: this._id,
    patientName: this.patientName,
    date: this.appointmentDate,
    time: this.appointmentTime,
    duration: this.duration,
    status: this.status,
    consultationMode: this.consultationMode,
    fee: this.consultationFee,
    paymentStatus: this.paymentStatus
  };
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
