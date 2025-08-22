const mongoose = require('mongoose');
const validator = require('validator');

const contactSchema = new mongoose.Schema({
  // Contact Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\+]?[0-9]{10,15}$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  
  // Message Details
  subject: {
    type: String,
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  
  // Categorization
  inquiryType: {
    type: String,
    enum: [
      'general', 
      'technical-support', 
      'doctor-registration', 
      'patient-inquiry', 
      'billing', 
      'partnership', 
      'complaint', 
      'feedback',
      'other'
    ],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Status and Assignment
  status: {
    type: String,
    enum: ['new', 'assigned', 'in-progress', 'resolved', 'closed', 'escalated'],
    default: 'new'
  },
  assignedTo: {
    type: String,
    trim: true
  },
  assignedAt: {
    type: Date
  },
  
  // Response Information
  response: {
    message: {
      type: String,
      maxlength: [2000, 'Response cannot exceed 2000 characters']
    },
    respondedBy: {
      type: String,
      trim: true
    },
    respondedAt: {
      type: Date
    }
  },
  
  // Follow-up Information
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  followUpNotes: {
    type: String,
    maxlength: [500, 'Follow-up notes cannot exceed 500 characters']
  },
  
  // Technical Details
  userAgent: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  referrerPage: {
    type: String,
    trim: true
  },
  
  // Attachments (if any)
  attachments: [{
    fileName: {
      type: String,
      trim: true
    },
    fileUrl: {
      type: String,
      trim: true
    },
    fileType: {
      type: String,
      trim: true
    },
    fileSize: {
      type: Number
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Internal Notes
  internalNotes: [{
    note: {
      type: String,
      maxlength: [500, 'Internal note cannot exceed 500 characters']
    },
    addedBy: {
      type: String,
      trim: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Resolution Information
  resolutionSummary: {
    type: String,
    maxlength: [500, 'Resolution summary cannot exceed 500 characters']
  },
  resolvedAt: {
    type: Date
  },
  resolutionTime: {
    type: Number // in hours
  },
  
  // Customer Satisfaction
  satisfactionRating: {
    type: Number,
    min: 1,
    max: 5
  },
  satisfactionFeedback: {
    type: String,
    maxlength: [300, 'Satisfaction feedback cannot exceed 300 characters']
  },
  
  // Source Information
  source: {
    type: String,
    enum: ['website', 'mobile-app', 'email', 'phone', 'social-media', 'other'],
    default: 'website'
  },
  
  // Spam and Moderation
  isSpam: {
    type: Boolean,
    default: false
  },
  moderationNotes: {
    type: String,
    maxlength: [200, 'Moderation notes cannot exceed 200 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ status: 1, priority: 1 });
contactSchema.index({ inquiryType: 1 });
contactSchema.index({ assignedTo: 1, status: 1 });
contactSchema.index({ createdAt: -1 });

// Virtual for response time
contactSchema.virtual('responseTime').get(function() {
  if (this.response?.respondedAt && this.createdAt) {
    const diffInHours = (this.response.respondedAt - this.createdAt) / (1000 * 60 * 60);
    return Math.round(diffInHours * 100) / 100; // Round to 2 decimal places
  }
  return null;
});

// Virtual for is overdue
contactSchema.virtual('isOverdue').get(function() {
  if (this.status === 'resolved' || this.status === 'closed') {
    return false;
  }
  
  const now = new Date();
  const hoursSinceCreated = (now - this.createdAt) / (1000 * 60 * 60);
  
  // Define SLA based on priority
  const slaHours = {
    urgent: 2,
    high: 8,
    medium: 24,
    low: 72
  };
  
  return hoursSinceCreated > (slaHours[this.priority] || 24);
});

// Pre-save middleware
contactSchema.pre('save', function(next) {
  // Auto-set resolved timestamp
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
    
    // Calculate resolution time
    if (this.createdAt) {
      this.resolutionTime = (this.resolvedAt - this.createdAt) / (1000 * 60 * 60);
    }
  }
  
  // Auto-set assignment timestamp
  if (this.isModified('assignedTo') && this.assignedTo && !this.assignedAt) {
    this.assignedAt = new Date();
  }
  
  next();
});

// Method to add internal note
contactSchema.methods.addInternalNote = function(note, addedBy) {
  this.internalNotes.push({
    note,
    addedBy,
    addedAt: new Date()
  });
  return this.save();
};

// Method to respond to inquiry
contactSchema.methods.respond = function(responseMessage, respondedBy) {
  this.response = {
    message: responseMessage,
    respondedBy,
    respondedAt: new Date()
  };
  
  if (this.status === 'new' || this.status === 'assigned') {
    this.status = 'in-progress';
  }
  
  return this.save();
};

// Method to resolve inquiry
contactSchema.methods.resolve = function(resolutionSummary) {
  this.status = 'resolved';
  this.resolutionSummary = resolutionSummary;
  this.resolvedAt = new Date();
  
  if (this.createdAt) {
    this.resolutionTime = (this.resolvedAt - this.createdAt) / (1000 * 60 * 60);
  }
  
  return this.save();
};

// Static method to get pending inquiries
contactSchema.statics.getPendingInquiries = function() {
  return this.find({
    status: { $in: ['new', 'assigned', 'in-progress'] }
  }).sort({ priority: -1, createdAt: 1 });
};

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
