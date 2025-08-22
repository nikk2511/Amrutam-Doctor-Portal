const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper function to generate JWT token
const generateToken = (doctorId) => {
  return jwt.sign({ doctorId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register a new doctor
// @route   POST /api/doctors/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      medicalLicenseNumber,
      specialization,
      experience,
      qualification,
      registrationBody,
      consultationFee,
      languages
    } = req.body;

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({
      $or: [{ email }, { medicalLicenseNumber }]
    });

    if (existingDoctor) {
      return res.status(400).json({
        status: 'error',
        message: 'Doctor with this email or license number already exists'
      });
    }

    // Create new doctor
    const doctor = new Doctor({
      fullName,
      email,
      phone,
      password,
      medicalLicenseNumber,
      specialization,
      experience,
      qualification,
      registrationBody,
      consultationFee,
      languages: languages || ['Hindi', 'English']
    });

    await doctor.save();

    // Check profile completeness
    doctor.checkProfileComplete();
    await doctor.save();

    // Generate token
    const token = generateToken(doctor._id);

    res.status(201).json({
      status: 'success',
      message: 'Doctor registered successfully',
      data: {
        doctor: {
          id: doctor._id,
          fullName: doctor.fullName,
          email: doctor.email,
          specialization: doctor.specialization,
          isVerified: doctor.isVerified,
          profileComplete: doctor.profileComplete
        },
        token
      }
    });

  } catch (error) {
    console.error('Doctor registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      error: error.message
    });
  }
});

// @desc    Doctor login
// @route   POST /api/doctors/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if doctor exists and include password
    const doctor = await Doctor.findOne({ email }).select('+password');

    if (!doctor) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await doctor.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Update last login
    doctor.lastLoginAt = new Date();
    await doctor.save();

    // Generate token
    const token = generateToken(doctor._id);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        doctor: {
          id: doctor._id,
          fullName: doctor.fullName,
          email: doctor.email,
          specialization: doctor.specialization,
          isVerified: doctor.isVerified,
          profileComplete: doctor.profileComplete,
          consultationFee: doctor.consultationFee,
          totalEarnings: doctor.totalEarnings
        },
        token
      }
    });

  } catch (error) {
    console.error('Doctor login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: error.message
    });
  }
});

// @desc    Get all doctors (for listing)
// @route   GET /api/doctors
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      specialization,
      city,
      minFee,
      maxFee,
      language,
      sortBy = 'rating'
    } = req.query;

    // Build filter object
    const filter = {
      isVerified: true,
      isActive: true
    };

    if (specialization) {
      filter.specialization = specialization;
    }

    if (city) {
      filter['clinicAddress.city'] = new RegExp(city, 'i');
    }

    if (minFee || maxFee) {
      filter.consultationFee = {};
      if (minFee) filter.consultationFee.$gte = Number(minFee);
      if (maxFee) filter.consultationFee.$lte = Number(maxFee);
    }

    if (language) {
      filter.languages = language;
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'rating':
        sort = { rating: -1, reviewCount: -1 };
        break;
      case 'experience':
        sort = { experience: -1 };
        break;
      case 'fee-low':
        sort = { consultationFee: 1 };
        break;
      case 'fee-high':
        sort = { consultationFee: -1 };
        break;
      default:
        sort = { rating: -1 };
    }

    const doctors = await Doctor.find(filter)
      .select('-password -bankDetails -pendingWithdrawal')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Doctor.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        doctors,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch doctors',
      error: error.message
    });
  }
});

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .select('-password -bankDetails -pendingWithdrawal -totalEarnings');

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { doctor }
    });

  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch doctor',
      error: error.message
    });
  }
});

// @desc    Get doctor statistics
// @route   GET /api/doctors/stats/summary
// @access  Public
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Doctor.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: null,
          totalDoctors: { $sum: 1 },
          verifiedDoctors: {
            $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] }
          },
          averageExperience: { $avg: '$experience' },
          averageRating: { $avg: '$rating' },
          totalConsultations: { $sum: '$totalConsultations' },
          specializations: { $addToSet: '$specialization' }
        }
      }
    ]);

    const summary = stats[0] || {
      totalDoctors: 0,
      verifiedDoctors: 0,
      averageExperience: 0,
      averageRating: 0,
      totalConsultations: 0,
      specializations: []
    };

    res.status(200).json({
      status: 'success',
      data: { summary }
    });

  } catch (error) {
    console.error('Get doctor stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch doctor statistics',
      error: error.message
    });
  }
});

// @desc    Search doctors
// @route   GET /api/doctors/search
// @access  Public
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const searchFilter = {
      isVerified: true,
      isActive: true,
      $or: [
        { fullName: { $regex: query, $options: 'i' } },
        { specialization: { $regex: query, $options: 'i' } },
        { qualification: { $regex: query, $options: 'i' } },
        { 'clinicAddress.city': { $regex: query, $options: 'i' } },
        { languages: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    const doctors = await Doctor.find(searchFilter)
      .select('-password -bankDetails -pendingWithdrawal')
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Doctor.countDocuments(searchFilter);

    res.status(200).json({
      status: 'success',
      data: {
        doctors,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        query
      }
    });

  } catch (error) {
    console.error('Search doctors error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Search failed',
      error: error.message
    });
  }
});

module.exports = router;
