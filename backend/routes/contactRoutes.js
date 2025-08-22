const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// @desc    Submit a contact form
// @route   POST /api/contact
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
      inquiryType = 'general'
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields: name, email, phone, and message'
      });
    }

    // Extract technical details from request
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    const referrerPage = req.headers.referer;

    // Determine priority based on inquiry type
    let priority = 'medium';
    if (inquiryType === 'technical-support' || inquiryType === 'complaint') {
      priority = 'high';
    } else if (inquiryType === 'billing') {
      priority = 'high';
    } else if (inquiryType === 'feedback') {
      priority = 'low';
    }

    // Create contact entry
    const contact = new Contact({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      subject: subject?.trim(),
      message: message.trim(),
      inquiryType,
      priority,
      userAgent,
      ipAddress,
      referrerPage,
      source: 'website',
      status: 'new'
    });

    await contact.save();

    // Send auto-response (in production, this would trigger an email)
    const autoResponseMessage = `
      Dear ${contact.name},
      
      Thank you for contacting Amrutam Doctor Portal. We have received your message and will get back to you within 24-48 hours.
      
      Your inquiry ID: ${contact._id}
      Subject: ${contact.subject || 'General Inquiry'}
      
      Best regards,
      Amrutam Support Team
    `;

    res.status(201).json({
      status: 'success',
      message: 'Your message has been sent successfully. We will get back to you soon.',
      data: {
        inquiryId: contact._id,
        name: contact.name,
        email: contact.email,
        inquiryType: contact.inquiryType,
        priority: contact.priority,
        estimatedResponseTime: priority === 'high' ? '4-8 hours' : '24-48 hours',
        autoResponse: autoResponseMessage
      }
    });

  } catch (error) {
    console.error('Submit contact form error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit your message. Please try again.',
      error: error.message
    });
  }
});

// @desc    Get all contact inquiries (admin)
// @route   GET /api/contact
// @access  Public (should be protected in production)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      inquiryType,
      assignedTo,
      search
    } = req.query;

    // Build filter
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (priority) {
      filter.priority = priority;
    }
    
    if (inquiryType) {
      filter.inquiryType = inquiryType;
    }
    
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1, priority: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-internalNotes -moderationNotes'); // Exclude sensitive fields from public API

    const total = await Contact.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        contacts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get contact inquiries error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch contact inquiries',
      error: error.message
    });
  }
});

// @desc    Get contact inquiry by ID
// @route   GET /api/contact/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact inquiry not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { contact }
    });

  } catch (error) {
    console.error('Get contact inquiry error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch contact inquiry',
      error: error.message
    });
  }
});

// @desc    Update contact inquiry status
// @route   PUT /api/contact/:id/status
// @access  Public (should be protected in production)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, notes } = req.body;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact inquiry not found'
      });
    }

    const validStatuses = ['new', 'assigned', 'in-progress', 'resolved', 'closed', 'escalated'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status'
      });
    }

    // Update contact
    if (status) contact.status = status;
    if (assignedTo) contact.assignedTo = assignedTo;
    
    // Add internal note if provided
    if (notes) {
      await contact.addInternalNote(notes, 'system');
    }

    await contact.save();

    res.status(200).json({
      status: 'success',
      message: 'Contact inquiry status updated successfully',
      data: { contact }
    });

  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update contact inquiry status',
      error: error.message
    });
  }
});

// @desc    Respond to contact inquiry
// @route   POST /api/contact/:id/respond
// @access  Public (should be protected in production)
router.post('/:id/respond', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, respondedBy = 'Support Team' } = req.body;

    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'Response message is required'
      });
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact inquiry not found'
      });
    }

    // Add response
    await contact.respond(message, respondedBy);

    res.status(200).json({
      status: 'success',
      message: 'Response sent successfully',
      data: { contact }
    });

  } catch (error) {
    console.error('Respond to contact error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send response',
      error: error.message
    });
  }
});

// @desc    Resolve contact inquiry
// @route   PUT /api/contact/:id/resolve
// @access  Public (should be protected in production)
router.put('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionSummary } = req.body;

    if (!resolutionSummary) {
      return res.status(400).json({
        status: 'error',
        message: 'Resolution summary is required'
      });
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact inquiry not found'
      });
    }

    // Resolve inquiry
    await contact.resolve(resolutionSummary);

    res.status(200).json({
      status: 'success',
      message: 'Contact inquiry resolved successfully',
      data: { contact }
    });

  } catch (error) {
    console.error('Resolve contact inquiry error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to resolve contact inquiry',
      error: error.message
    });
  }
});

// @desc    Get contact statistics
// @route   GET /api/contact/stats/summary
// @access  Public (should be protected in production)
router.get('/stats/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build filter for statistics
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const stats = await Contact.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalInquiries: { $sum: 1 },
          newInquiries: {
            $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] }
          },
          inProgressInquiries: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
          },
          resolvedInquiries: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          highPriorityInquiries: {
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
          },
          averageResolutionTime: { $avg: '$resolutionTime' },
          inquiryTypes: { $addToSet: '$inquiryType' }
        }
      }
    ]);

    // Get pending inquiries count
    const pendingCount = await Contact.countDocuments({
      status: { $in: ['new', 'assigned', 'in-progress'] },
      ...filter
    });

    const summary = stats[0] || {
      totalInquiries: 0,
      newInquiries: 0,
      inProgressInquiries: 0,
      resolvedInquiries: 0,
      highPriorityInquiries: 0,
      averageResolutionTime: 0,
      inquiryTypes: []
    };

    summary.pendingInquiries = pendingCount;
    summary.resolutionRate = summary.totalInquiries > 0 
      ? ((summary.resolvedInquiries / summary.totalInquiries) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      status: 'success',
      data: { summary }
    });

  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch contact statistics',
      error: error.message
    });
  }
});

// @desc    Get pending inquiries
// @route   GET /api/contact/pending
// @access  Public (should be protected in production)
router.get('/pending', async (req, res) => {
  try {
    const pendingInquiries = await Contact.getPendingInquiries()
      .limit(50)
      .select('name email subject inquiryType priority status createdAt');

    res.status(200).json({
      status: 'success',
      data: {
        pendingInquiries,
        count: pendingInquiries.length
      }
    });

  } catch (error) {
    console.error('Get pending inquiries error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pending inquiries',
      error: error.message
    });
  }
});

module.exports = router;
