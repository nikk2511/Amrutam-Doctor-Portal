const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Doctor = require('../models/Doctor');
const Consultation = require('../models/Consultation');
const Appointment = require('../models/Appointment');

// @desc    Initiate payment for consultation/appointment
// @route   POST /api/payments/initiate
// @access  Public
router.post('/initiate', async (req, res) => {
  try {
    const {
      doctorId,
      patientEmail,
      patientName,
      serviceType,
      serviceId,
      paymentMethod = 'card',
      billingAddress
    } = req.body;

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    // Verify service exists
    let service;
    let serviceModel;
    
    if (serviceType === 'consultation') {
      service = await Consultation.findById(serviceId);
      serviceModel = 'Consultation';
    } else if (serviceType === 'appointment') {
      service = await Appointment.findById(serviceId);
      serviceModel = 'Appointment';
    }

    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: 'Service not found'
      });
    }

    // Calculate fees and taxes
    const consultationFee = service.consultationFee || doctor.consultationFee;
    const platformFee = Math.round(consultationFee * 0.05); // 5% platform fee
    const processingFee = Math.round(consultationFee * 0.02); // 2% processing fee
    
    // Calculate GST (18% on platform fee)
    const gstRate = 0.18;
    const gstOnPlatform = Math.round(platformFee * gstRate);
    
    const totalAmount = consultationFee + platformFee + processingFee + gstOnPlatform;

    // Generate transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Create payment record
    const payment = new Payment({
      transactionId,
      orderId,
      doctorId,
      patientEmail: patientEmail.toLowerCase(),
      patientName,
      serviceType,
      serviceId,
      serviceModel,
      amount: totalAmount,
      consultationFee,
      platformFee,
      processingFee,
      taxes: {
        gst: gstOnPlatform,
        cgst: Math.round(gstOnPlatform / 2),
        sgst: Math.round(gstOnPlatform / 2)
      },
      paymentMethod,
      paymentProvider: 'razorpay', // Default provider
      billingAddress,
      status: 'pending'
    });

    await payment.save();

    // In a real implementation, you would integrate with payment gateway here
    // For demo purposes, we'll simulate the payment gateway response
    const paymentGatewayResponse = {
      paymentId: `pay_${Math.random().toString(36).substr(2, 14)}`,
      orderId: orderId,
      status: 'created',
      amount: totalAmount,
      currency: 'INR',
      description: `${serviceType} with Dr. ${doctor.fullName}`,
      notes: {
        doctorId: doctorId,
        serviceType: serviceType,
        serviceId: serviceId
      }
    };

    res.status(201).json({
      status: 'success',
      message: 'Payment initiated successfully',
      data: {
        payment: {
          transactionId: payment.transactionId,
          orderId: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status
        },
        gatewayResponse: paymentGatewayResponse,
        breakdown: {
          consultationFee,
          platformFee,
          processingFee,
          taxes: payment.taxes,
          totalAmount
        }
      }
    });

  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to initiate payment',
      error: error.message
    });
  }
});

// @desc    Complete payment (webhook simulation)
// @route   POST /api/payments/complete
// @access  Public
router.post('/complete', async (req, res) => {
  try {
    const {
      transactionId,
      paymentId,
      signature,
      status = 'completed'
    } = req.body;

    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found'
      });
    }

    // Update payment status
    payment.status = status;
    payment.paymentDate = new Date();
    payment.gatewayResponse = {
      paymentId,
      signature,
      status,
      message: 'Payment completed successfully'
    };

    await payment.save();

    // If payment is successful, update related service
    if (status === 'completed') {
      if (payment.serviceModel === 'Consultation') {
        await Consultation.findByIdAndUpdate(payment.serviceId, {
          paymentStatus: 'paid',
          transactionId: payment.transactionId
        });
      } else if (payment.serviceModel === 'Appointment') {
        await Appointment.findByIdAndUpdate(payment.serviceId, {
          paymentStatus: 'paid',
          transactionId: payment.transactionId
        });
      }

      // Update doctor's earnings
      const doctor = await Doctor.findById(payment.doctorId);
      if (doctor) {
        await doctor.updateEarnings(payment.doctorEarning.netAmount);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Payment completed successfully',
      data: { payment }
    });

  } catch (error) {
    console.error('Complete payment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to complete payment',
      error: error.message
    });
  }
});

// @desc    Get payment details
// @route   GET /api/payments/:transactionId
// @access  Public
router.get('/:transactionId', async (req, res) => {
  try {
    const payment = await Payment.findOne({ transactionId: req.params.transactionId })
      .populate('doctorId', 'fullName specialization')
      .populate('serviceId');

    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { payment }
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch payment details',
      error: error.message
    });
  }
});

// @desc    Get doctor's payment history
// @route   GET /api/payments/doctor/:doctorId
// @access  Public (should be protected in production)
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate
    } = req.query;

    // Build filter
    const filter = { doctorId };
    
    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    const payments = await Payment.find(filter)
      .populate('serviceId')
      .sort({ paymentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get doctor payments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
});

// @desc    Get patient's payment history
// @route   GET /api/payments/patient/:email
// @access  Public
router.get('/patient/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const payments = await Payment.find({ patientEmail: email.toLowerCase() })
      .populate('doctorId', 'fullName specialization')
      .populate('serviceId')
      .sort({ paymentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments({ patientEmail: email.toLowerCase() });

    res.status(200).json({
      status: 'success',
      data: {
        payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get patient payments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
});

// @desc    Initiate refund
// @route   POST /api/payments/:transactionId/refund
// @access  Public (should be protected in production)
router.post('/:transactionId/refund', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { amount, reason, initiatedBy = 'admin' } = req.body;

    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot refund a payment that is not completed'
      });
    }

    const refundAmount = amount || payment.amount;
    if (refundAmount > payment.netPaymentAmount) {
      return res.status(400).json({
        status: 'error',
        message: 'Refund amount cannot exceed the net payment amount'
      });
    }

    // Initiate refund
    await payment.initiateRefund(refundAmount, reason, initiatedBy);

    // Simulate refund processing (in real implementation, this would call payment gateway)
    const gatewayRefundId = `ref_${Math.random().toString(36).substr(2, 14)}`;
    const refundIndex = payment.refunds.length - 1;
    await payment.completeRefund(refundIndex, gatewayRefundId);

    res.status(200).json({
      status: 'success',
      message: 'Refund processed successfully',
      data: {
        refund: {
          amount: refundAmount,
          refundId: gatewayRefundId,
          status: 'completed',
          reason
        },
        payment
      }
    });

  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process refund',
      error: error.message
    });
  }
});

// @desc    Get doctor earnings summary
// @route   GET /api/payments/earnings/:doctorId
// @access  Public (should be protected in production)
router.get('/earnings/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { startDate, endDate, period = 'month' } = req.query;

    // Calculate date range
    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = new Date();
      start = new Date();
      
      if (period === 'week') {
        start.setDate(start.getDate() - 7);
      } else if (period === 'month') {
        start.setMonth(start.getMonth() - 1);
      } else if (period === 'year') {
        start.setFullYear(start.getFullYear() - 1);
      }
    }

    // Get earnings summary
    const summary = await Payment.getDoctorEarningsSummary(doctorId, start, end);

    // Get pending settlement amount
    const pendingSettlement = await Payment.aggregate([
      {
        $match: {
          doctorId: doctorId,
          status: 'completed',
          settlementStatus: 'pending'
        }
      },
      {
        $group: {
          _id: null,
          totalPending: { $sum: '$doctorEarning.netAmount' }
        }
      }
    ]);

    summary.pendingSettlement = pendingSettlement[0]?.totalPending || 0;

    res.status(200).json({
      status: 'success',
      data: {
        doctorId,
        period: { start, end },
        summary
      }
    });

  } catch (error) {
    console.error('Get earnings summary error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch earnings summary',
      error: error.message
    });
  }
});

// @desc    Request withdrawal
// @route   POST /api/payments/withdraw/:doctorId
// @access  Public (should be protected in production)
router.post('/withdraw/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { amount, bankDetails } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    if (amount > doctor.pendingWithdrawal) {
      return res.status(400).json({
        status: 'error',
        message: 'Withdrawal amount exceeds pending balance'
      });
    }

    // Update bank details if provided
    if (bankDetails) {
      doctor.bankDetails = bankDetails;
    }

    // Process withdrawal (in real implementation, this would integrate with banking API)
    doctor.pendingWithdrawal -= amount;
    await doctor.save();

    // Create withdrawal record (you might want a separate Withdrawal model)
    const withdrawalId = `WD_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    res.status(200).json({
      status: 'success',
      message: 'Withdrawal request processed successfully',
      data: {
        withdrawalId,
        amount,
        status: 'processed',
        processedAt: new Date(),
        remainingBalance: doctor.pendingWithdrawal
      }
    });

  } catch (error) {
    console.error('Process withdrawal error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process withdrawal',
      error: error.message
    });
  }
});

module.exports = router;
