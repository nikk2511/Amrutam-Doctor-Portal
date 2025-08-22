const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');
const Doctor = require('../models/Doctor');
const Payment = require('../models/Payment');

// @desc    Create a new consultation
// @route   POST /api/consultations
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      doctorId,
      patientName,
      patientEmail,
      patientPhone,
      patientAge,
      patientGender,
      consultationType,
      consultationDate,
      chiefComplaint,
      symptoms,
      medicalHistory,
      allergies,
      currentMedications
    } = req.body;

    // Verify doctor exists and is active
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isActive || !doctor.isVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Doctor not found or not available'
      });
    }

    // Create consultation
    const consultation = new Consultation({
      doctorId,
      patientName,
      patientEmail,
      patientPhone,
      patientAge,
      patientGender,
      consultationType,
      consultationDate: new Date(consultationDate),
      chiefComplaint,
      symptoms: symptoms || [],
      medicalHistory,
      allergies: allergies || [],
      currentMedications: currentMedications || [],
      consultationFee: doctor.consultationFee,
      status: 'scheduled'
    });

    await consultation.save();

    // Generate meeting ID for video/audio consultations
    if (consultationType === 'video' || consultationType === 'audio') {
      consultation.meetingId = `amrutam-${consultation._id.toString().slice(-8)}`;
      await consultation.save();
    }

    res.status(201).json({
      status: 'success',
      message: 'Consultation scheduled successfully',
      data: {
        consultation: {
          id: consultation._id,
          consultationDate: consultation.consultationDate,
          consultationType: consultation.consultationType,
          status: consultation.status,
          consultationFee: consultation.consultationFee,
          meetingId: consultation.meetingId
        }
      }
    });

  } catch (error) {
    console.error('Create consultation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to schedule consultation',
      error: error.message
    });
  }
});

// @desc    Get consultations for a doctor
// @route   GET /api/consultations/doctor/:doctorId
// @access  Public (should be protected in production)
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      sortBy = 'consultationDate'
    } = req.query;

    // Build filter
    const filter = { doctorId };
    
    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.consultationDate = {};
      if (startDate) filter.consultationDate.$gte = new Date(startDate);
      if (endDate) filter.consultationDate.$lte = new Date(endDate);
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'date-asc':
        sort = { consultationDate: 1 };
        break;
      case 'date-desc':
        sort = { consultationDate: -1 };
        break;
      case 'status':
        sort = { status: 1, consultationDate: -1 };
        break;
      default:
        sort = { consultationDate: -1 };
    }

    const consultations = await Consultation.find(filter)
      .populate('doctorId', 'fullName specialization')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Consultation.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        consultations,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get doctor consultations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch consultations',
      error: error.message
    });
  }
});

// @desc    Get consultation by ID
// @route   GET /api/consultations/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('doctorId', 'fullName specialization qualification experience');

    if (!consultation) {
      return res.status(404).json({
        status: 'error',
        message: 'Consultation not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { consultation }
    });

  } catch (error) {
    console.error('Get consultation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch consultation',
      error: error.message
    });
  }
});

// @desc    Update consultation (start, complete, etc.)
// @route   PUT /api/consultations/:id
// @access  Public (should be protected in production)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({
        status: 'error',
        message: 'Consultation not found'
      });
    }

    // Handle status changes
    if (updates.status) {
      if (updates.status === 'in-progress' && !consultation.startTime) {
        consultation.startTime = new Date();
      }
      if (updates.status === 'completed' && !consultation.endTime) {
        consultation.endTime = new Date();
      }
    }

    // Update consultation
    Object.assign(consultation, updates);
    await consultation.save();

    // If consultation is completed, update doctor's consultation count
    if (updates.status === 'completed') {
      await Doctor.findByIdAndUpdate(consultation.doctorId, {
        $inc: { totalConsultations: 1 }
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Consultation updated successfully',
      data: { consultation }
    });

  } catch (error) {
    console.error('Update consultation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update consultation',
      error: error.message
    });
  }
});

// @desc    Add prescription to consultation
// @route   POST /api/consultations/:id/prescription
// @access  Public (should be protected in production)
router.post('/:id/prescription', async (req, res) => {
  try {
    const { id } = req.params;
    const { prescriptions, diagnosis, treatment, dietaryAdvice, lifestyleRecommendations } = req.body;

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({
        status: 'error',
        message: 'Consultation not found'
      });
    }

    // Update consultation with prescription details
    if (prescriptions) consultation.prescriptions = prescriptions;
    if (diagnosis) consultation.diagnosis = diagnosis;
    if (treatment) consultation.treatment = treatment;
    if (dietaryAdvice) consultation.dietaryAdvice = dietaryAdvice;
    if (lifestyleRecommendations) consultation.lifestyleRecommendations = lifestyleRecommendations;

    await consultation.save();

    res.status(200).json({
      status: 'success',
      message: 'Prescription added successfully',
      data: { consultation }
    });

  } catch (error) {
    console.error('Add prescription error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add prescription',
      error: error.message
    });
  }
});

// @desc    Add Ayurvedic assessment
// @route   POST /api/consultations/:id/assessment
// @access  Public (should be protected in production)
router.post('/:id/assessment', async (req, res) => {
  try {
    const { id } = req.params;
    const { prakriti, vikriti, pulse, tongue } = req.body;

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({
        status: 'error',
        message: 'Consultation not found'
      });
    }

    // Update Ayurvedic assessment
    if (prakriti) consultation.prakriti = prakriti;
    if (vikriti) consultation.vikriti = vikriti;
    if (pulse) consultation.pulse = pulse;
    if (tongue) consultation.tongue = tongue;

    await consultation.save();

    res.status(200).json({
      status: 'success',
      message: 'Ayurvedic assessment added successfully',
      data: { consultation }
    });

  } catch (error) {
    console.error('Add assessment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add assessment',
      error: error.message
    });
  }
});

// @desc    Get consultation statistics
// @route   GET /api/consultations/stats/summary
// @access  Public
router.get('/stats/summary', async (req, res) => {
  try {
    const { doctorId, startDate, endDate } = req.query;

    // Build filter for statistics
    const filter = {};
    if (doctorId) filter.doctorId = doctorId;
    if (startDate || endDate) {
      filter.consultationDate = {};
      if (startDate) filter.consultationDate.$gte = new Date(startDate);
      if (endDate) filter.consultationDate.$lte = new Date(endDate);
    }

    const stats = await Consultation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalConsultations: { $sum: 1 },
          completedConsultations: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          scheduledConsultations: {
            $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
          },
          cancelledConsultations: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalRevenue: { $sum: '$consultationFee' },
          averageConsultationFee: { $avg: '$consultationFee' },
          averageRating: { $avg: '$doctorRating' }
        }
      }
    ]);

    const summary = stats[0] || {
      totalConsultations: 0,
      completedConsultations: 0,
      scheduledConsultations: 0,
      cancelledConsultations: 0,
      totalRevenue: 0,
      averageConsultationFee: 0,
      averageRating: 0
    };

    res.status(200).json({
      status: 'success',
      data: { summary }
    });

  } catch (error) {
    console.error('Get consultation stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch consultation statistics',
      error: error.message
    });
  }
});

module.exports = router;
