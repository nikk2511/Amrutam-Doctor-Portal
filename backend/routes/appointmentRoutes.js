const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      doctorId,
      patientName,
      patientEmail,
      patientPhone,
      patientAge,
      appointmentDate,
      appointmentTime,
      consultationMode,
      reasonForVisit,
      symptoms,
      urgencyLevel
    } = req.body;

    // Verify doctor exists and is active
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isActive || !doctor.isVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Doctor not found or not available'
      });
    }

    // Check if the appointment slot is available
    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        status: 'error',
        message: 'This time slot is already booked'
      });
    }

    // Create appointment
    const appointment = new Appointment({
      doctorId,
      patientName,
      patientEmail,
      patientPhone,
      patientAge,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      consultationMode,
      reasonForVisit,
      symptoms: symptoms || [],
      urgencyLevel: urgencyLevel || 'medium',
      consultationFee: doctor.consultationFee,
      status: 'scheduled'
    });

    await appointment.save();

    // Generate meeting link for video/audio appointments
    if (consultationMode === 'video' || consultationMode === 'audio') {
      appointment.meetingId = `amrutam-${appointment._id.toString().slice(-8)}`;
      appointment.meetingLink = `https://meet.amrutam.com/${appointment.meetingId}`;
      await appointment.save();
    }

    res.status(201).json({
      status: 'success',
      message: 'Appointment scheduled successfully',
      data: {
        appointment: {
          id: appointment._id,
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.appointmentTime,
          consultationMode: appointment.consultationMode,
          status: appointment.status,
          consultationFee: appointment.consultationFee,
          meetingLink: appointment.meetingLink
        }
      }
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to schedule appointment',
      error: error.message
    });
  }
});

// @desc    Get appointments for a doctor
// @route   GET /api/appointments/doctor/:doctorId
// @access  Public (should be protected in production)
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      date,
      upcoming = false
    } = req.query;

    // Build filter
    const filter = { doctorId };
    
    if (status) {
      filter.status = status;
    }

    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.appointmentDate = {
        $gte: searchDate,
        $lt: nextDay
      };
    }

    if (upcoming === 'true') {
      filter.appointmentDate = { $gte: new Date() };
      filter.status = { $in: ['scheduled', 'confirmed'] };
    }

    const appointments = await Appointment.find(filter)
      .populate('doctorId', 'fullName specialization')
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        appointments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
});

// @desc    Get patient appointments
// @route   GET /api/appointments/patient/:email
// @access  Public
router.get('/patient/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { patientEmail: email.toLowerCase() };
    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate('doctorId', 'fullName specialization consultationFee')
      .sort({ appointmentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        appointments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch patient appointments',
      error: error.message
    });
  }
});

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctorId', 'fullName specialization qualification experience clinicAddress');

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { appointment }
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch appointment',
      error: error.message
    });
  }
});

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Public (should be protected in production)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    const validStatuses = ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status'
      });
    }

    appointment.status = status;
    if (notes) {
      appointment.doctorNotes = notes;
    }

    await appointment.save();

    res.status(200).json({
      status: 'success',
      message: 'Appointment status updated successfully',
      data: { appointment }
    });

  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update appointment status',
      error: error.message
    });
  }
});

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Public
router.put('/:id/reschedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newTime, reason, rescheduledBy } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    // Check if appointment can be rescheduled
    if (!appointment.canBeRescheduled()) {
      return res.status(400).json({
        status: 'error',
        message: 'Appointment cannot be rescheduled (too close to appointment time or maximum reschedules reached)'
      });
    }

    // Check if new slot is available
    const conflictingAppointment = await Appointment.findOne({
      doctorId: appointment.doctorId,
      appointmentDate: new Date(newDate),
      appointmentTime: newTime,
      status: { $in: ['scheduled', 'confirmed'] },
      _id: { $ne: id }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        status: 'error',
        message: 'The new time slot is already booked'
      });
    }

    // Save original date if not already saved
    if (!appointment.originalAppointmentDate) {
      appointment.originalAppointmentDate = appointment.appointmentDate;
    }

    // Update appointment
    appointment.appointmentDate = new Date(newDate);
    appointment.appointmentTime = newTime;
    appointment.status = 'rescheduled';
    appointment.reschedulingReason = reason;
    appointment.rescheduledBy = rescheduledBy;
    appointment.reschedulingCount += 1;

    await appointment.save();

    res.status(200).json({
      status: 'success',
      message: 'Appointment rescheduled successfully',
      data: { appointment }
    });

  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reschedule appointment',
      error: error.message
    });
  }
});

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Public
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, cancelledBy } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    // Check if appointment can be cancelled
    if (!appointment.canBeCancelled()) {
      return res.status(400).json({
        status: 'error',
        message: 'Appointment cannot be cancelled (too close to appointment time)'
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = reason;
    appointment.cancelledBy = cancelledBy;
    appointment.cancelledAt = new Date();

    await appointment.save();

    res.status(200).json({
      status: 'success',
      message: 'Appointment cancelled successfully',
      data: { appointment }
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to cancel appointment',
      error: error.message
    });
  }
});

// @desc    Get available time slots for a doctor
// @route   GET /api/appointments/slots/:doctorId/:date
// @access  Public
router.get('/slots/:doctorId/:date', async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    // Get doctor's availability for the day
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    const appointmentDate = new Date(date);
    const dayName = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Find doctor's availability for this day
    const dayAvailability = doctor.availability.find(av => av.day === dayName);
    if (!dayAvailability) {
      return res.status(200).json({
        status: 'success',
        data: { availableSlots: [] }
      });
    }

    // Get existing appointments for this date
    const existingAppointments = await Appointment.find({
      doctorId,
      appointmentDate,
      status: { $in: ['scheduled', 'confirmed'] }
    }).select('appointmentTime');

    const bookedTimes = existingAppointments.map(apt => apt.appointmentTime);

    // Generate available slots
    const availableSlots = dayAvailability.timeSlots
      .filter(slot => slot.isAvailable && !bookedTimes.includes(slot.startTime))
      .map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        available: true
      }));

    res.status(200).json({
      status: 'success',
      data: {
        date: appointmentDate,
        dayName,
        availableSlots,
        totalSlots: dayAvailability.timeSlots.length,
        bookedSlots: bookedTimes.length
      }
    });

  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch available slots',
      error: error.message
    });
  }
});

module.exports = router;
