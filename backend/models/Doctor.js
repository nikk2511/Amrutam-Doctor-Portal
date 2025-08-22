const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const doctorSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return /^[\+]?[0-9]{10,15}$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  
  // Professional Information
  medicalLicenseNumber: {
    type: String,
    required: [true, 'Medical license number is required'],
    unique: true,
    trim: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    enum: [
      'Ayurveda',
      'Panchakarma',
      'Rasayana',
      'Kayachikitsa',
      'Shalya',
      'Shalakya',
      'Kaumarbhritya',
      'Agadtantra',
      'Bhutavidya',
      'General Ayurveda'
    ]
  },
  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Experience cannot be negative']
  },
  qualification: {
    type: String,
    required: [true, 'Qualification is required'],
    trim: true
  },
  registrationBody: {
    type: String,
    required: [true, 'Registration body is required'],
    trim: true
  },
  
  // Practice Information
  clinicName: {
    type: String,
    trim: true
  },
  clinicAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: [0, 'Fee cannot be negative']
  },
  languages: [{
    type: String,
    enum: ['Hindi', 'English', 'Sanskrit', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi']
  }],
  
  // Platform Status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profileComplete: {
    type: Boolean,
    default: false
  },
  
  // Availability
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    timeSlots: [{
      startTime: String,
      endTime: String,
      isAvailable: { type: Boolean, default: true }
    }]
  }],
  
  // Profile & Media
  profilePhoto: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  
  // Financial
  totalEarnings: {
    type: Number,
    default: 0
  },
  pendingWithdrawal: {
    type: Number,
    default: 0
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String
  },
  
  // Statistics
  totalConsultations: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
doctorSchema.index({ email: 1, medicalLicenseNumber: 1 });
doctorSchema.index({ specialization: 1, isVerified: 1, isActive: 1 });
doctorSchema.index({ 'clinicAddress.city': 1, 'clinicAddress.state': 1 });

// Virtual for consultation count today
doctorSchema.virtual('consultationsToday').get(function() {
  // This would be calculated in actual implementation
  return 0;
});

// Pre-save middleware to hash password
doctorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if profile is complete
doctorSchema.methods.checkProfileComplete = function() {
  const requiredFields = [
    'fullName', 'email', 'phone', 'medicalLicenseNumber', 
    'specialization', 'experience', 'qualification', 'consultationFee'
  ];
  
  const isComplete = requiredFields.every(field => this[field]);
  this.profileComplete = isComplete;
  return isComplete;
};

// Method to compare password
doctorSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update earnings
doctorSchema.methods.updateEarnings = function(amount) {
  this.totalEarnings += amount;
  this.pendingWithdrawal += amount;
  return this.save();
};

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
