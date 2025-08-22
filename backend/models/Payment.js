const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Transaction Details
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    trim: true
  },
  orderId: {
    type: String,
    required: [true, 'Order ID is required'],
    trim: true
  },
  
  // Parties Involved
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required']
  },
  patientEmail: {
    type: String,
    required: [true, 'Patient email is required'],
    trim: true,
    lowercase: true
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  
  // Related Services
  serviceType: {
    type: String,
    enum: ['consultation', 'appointment', 'prescription', 'follow-up', 'subscription'],
    required: [true, 'Service type is required']
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Service ID is required']
  },
  serviceModel: {
    type: String,
    enum: ['Consultation', 'Appointment'],
    required: [true, 'Service model is required']
  },
  
  // Payment Amount Details
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  
  // Fee Breakdown
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: [0, 'Consultation fee cannot be negative']
  },
  platformFee: {
    type: Number,
    default: 0,
    min: [0, 'Platform fee cannot be negative']
  },
  processingFee: {
    type: Number,
    default: 0,
    min: [0, 'Processing fee cannot be negative']
  },
  taxes: {
    gst: {
      type: Number,
      default: 0,
      min: [0, 'GST cannot be negative']
    },
    cgst: {
      type: Number,
      default: 0,
      min: [0, 'CGST cannot be negative']
    },
    sgst: {
      type: Number,
      default: 0,
      min: [0, 'SGST cannot be negative']
    },
    igst: {
      type: Number,
      default: 0,
      min: [0, 'IGST cannot be negative']
    }
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount cannot be negative']
  },
  
  // Payment Method
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['card', 'upi', 'netbanking', 'wallet', 'cash', 'bank-transfer']
  },
  paymentProvider: {
    type: String,
    enum: ['razorpay', 'paytm', 'phonepe', 'gpay', 'stripe', 'paypal', 'manual'],
    required: [true, 'Payment provider is required']
  },
  
  // Card Details (if applicable)
  cardDetails: {
    last4Digits: {
      type: String,
      maxlength: 4
    },
    cardType: {
      type: String,
      enum: ['visa', 'mastercard', 'amex', 'rupay', 'other']
    },
    bank: {
      type: String,
      trim: true
    }
  },
  
  // UPI Details (if applicable)
  upiDetails: {
    vpa: {
      type: String,
      trim: true
    },
    app: {
      type: String,
      enum: ['gpay', 'phonepe', 'paytm', 'bhim', 'other']
    }
  },
  
  // Payment Status
  status: {
    type: String,
    required: [true, 'Payment status is required'],
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially-refunded'],
    default: 'pending'
  },
  paymentDate: {
    type: Date
  },
  
  // Gateway Response
  gatewayResponse: {
    paymentId: String,
    signature: String,
    status: String,
    message: String,
    errorCode: String,
    errorDescription: String
  },
  
  // Refund Information
  refunds: [{
    refundId: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative']
    },
    reason: {
      type: String,
      enum: ['cancellation', 'technical-issue', 'doctor-unavailable', 'patient-request', 'quality-issue', 'other']
    },
    status: {
      type: String,
      enum: ['initiated', 'processing', 'completed', 'failed']
    },
    initiatedBy: {
      type: String,
      enum: ['patient', 'doctor', 'admin', 'system']
    },
    processedAt: Date,
    gatewayRefundId: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Doctor's Earnings
  doctorEarning: {
    grossAmount: {
      type: Number,
      min: [0, 'Gross amount cannot be negative']
    },
    platformCommission: {
      type: Number,
      min: [0, 'Platform commission cannot be negative']
    },
    netAmount: {
      type: Number,
      min: [0, 'Net amount cannot be negative']
    },
    commissionPercentage: {
      type: Number,
      min: [0, 'Commission percentage cannot be negative'],
      max: [100, 'Commission percentage cannot exceed 100']
    }
  },
  
  // Settlement Information
  settlementStatus: {
    type: String,
    enum: ['pending', 'processing', 'settled', 'hold', 'failed'],
    default: 'pending'
  },
  settlementDate: {
    type: Date
  },
  settlementId: {
    type: String,
    trim: true
  },
  
  // Billing Information
  billingAddress: {
    name: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  
  // Invoice Details
  invoiceNumber: {
    type: String,
    trim: true
  },
  invoiceUrl: {
    type: String,
    trim: true
  },
  
  // Reconciliation
  reconciled: {
    type: Boolean,
    default: false
  },
  reconciledAt: {
    type: Date
  },
  
  // Additional Information
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ doctorId: 1, createdAt: -1 });
paymentSchema.index({ patientEmail: 1, createdAt: -1 });
paymentSchema.index({ status: 1, paymentDate: -1 });
paymentSchema.index({ settlementStatus: 1 });
paymentSchema.index({ serviceId: 1, serviceModel: 1 });

// Virtual for total refunded amount
paymentSchema.virtual('totalRefundedAmount').get(function() {
  return this.refunds.reduce((total, refund) => {
    if (refund.status === 'completed') {
      return total + refund.amount;
    }
    return total;
  }, 0);
});

// Virtual for net payment amount
paymentSchema.virtual('netPaymentAmount').get(function() {
  return this.amount - this.totalRefundedAmount;
});

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  // Auto-calculate doctor earnings if not set
  if (!this.doctorEarning.grossAmount && this.consultationFee) {
    const commissionPercentage = this.doctorEarning.commissionPercentage || 15; // Default 15%
    const grossAmount = this.consultationFee;
    const platformCommission = (grossAmount * commissionPercentage) / 100;
    const netAmount = grossAmount - platformCommission;
    
    this.doctorEarning = {
      grossAmount,
      platformCommission,
      netAmount,
      commissionPercentage
    };
  }
  
  // Auto-set payment date when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.paymentDate) {
    this.paymentDate = new Date();
  }
  
  next();
});

// Method to initiate refund
paymentSchema.methods.initiateRefund = function(amount, reason, initiatedBy) {
  const refund = {
    amount,
    reason,
    initiatedBy,
    status: 'initiated',
    createdAt: new Date()
  };
  
  this.refunds.push(refund);
  return this.save();
};

// Method to complete refund
paymentSchema.methods.completeRefund = function(refundIndex, gatewayRefundId) {
  if (this.refunds[refundIndex]) {
    this.refunds[refundIndex].status = 'completed';
    this.refunds[refundIndex].processedAt = new Date();
    this.refunds[refundIndex].gatewayRefundId = gatewayRefundId;
    
    // Update payment status if fully refunded
    if (this.totalRefundedAmount >= this.amount) {
      this.status = 'refunded';
    } else if (this.totalRefundedAmount > 0) {
      this.status = 'partially-refunded';
    }
  }
  
  return this.save();
};

// Static method to get doctor earnings summary
paymentSchema.statics.getDoctorEarningsSummary = async function(doctorId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        doctorId: new mongoose.Types.ObjectId(doctorId),
        status: 'completed',
        paymentDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalGrossEarnings: { $sum: '$doctorEarning.grossAmount' },
        totalPlatformCommission: { $sum: '$doctorEarning.platformCommission' },
        totalNetEarnings: { $sum: '$doctorEarning.netAmount' },
        totalTransactions: { $sum: 1 },
        averageTransactionValue: { $avg: '$amount' }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalGrossEarnings: 0,
    totalPlatformCommission: 0,
    totalNetEarnings: 0,
    totalTransactions: 0,
    averageTransactionValue: 0
  };
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
