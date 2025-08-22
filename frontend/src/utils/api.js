const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-vercel-url.vercel.app/api'
  : 'http://localhost:3001/api';

// Generic API call function
async function apiCall(endpoint, options = {}) {
  const { method = 'GET', body, headers = {} } = options;
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API call failed');
    }
    
    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

// Doctor API functions
export const doctorAPI = {
  // Register a new doctor
  register: (doctorData) => apiCall('/doctors/register', {
    method: 'POST',
    body: doctorData
  }),

  // Doctor login
  login: (credentials) => apiCall('/doctors/login', {
    method: 'POST',
    body: credentials
  }),

  // Get all doctors
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/doctors${queryString ? '?' + queryString : ''}`);
  },

  // Get doctor by ID
  getById: (id) => apiCall(`/doctors/${id}`),

  // Search doctors
  search: (query, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/doctors/search/${query}${queryString ? '?' + queryString : ''}`);
  },

  // Get doctor statistics
  getStats: () => apiCall('/doctors/stats/summary')
};

// Contact API functions
export const contactAPI = {
  // Submit contact form
  submit: (contactData) => apiCall('/contact', {
    method: 'POST',
    body: contactData
  }),

  // Get all contact inquiries
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/contact${queryString ? '?' + queryString : ''}`);
  },

  // Get contact by ID
  getById: (id) => apiCall(`/contact/${id}`),

  // Get contact statistics
  getStats: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/contact/stats/summary${queryString ? '?' + queryString : ''}`);
  }
};

// Consultation API functions
export const consultationAPI = {
  // Create new consultation
  create: (consultationData) => apiCall('/consultations', {
    method: 'POST',
    body: consultationData
  }),

  // Get consultations for doctor
  getByDoctor: (doctorId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/consultations/doctor/${doctorId}${queryString ? '?' + queryString : ''}`);
  },

  // Get consultation by ID
  getById: (id) => apiCall(`/consultations/${id}`),

  // Update consultation
  update: (id, updates) => apiCall(`/consultations/${id}`, {
    method: 'PUT',
    body: updates
  }),

  // Add prescription
  addPrescription: (id, prescriptionData) => apiCall(`/consultations/${id}/prescription`, {
    method: 'POST',
    body: prescriptionData
  }),

  // Get consultation statistics
  getStats: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/consultations/stats/summary${queryString ? '?' + queryString : ''}`);
  }
};

// Appointment API functions
export const appointmentAPI = {
  // Create new appointment
  create: (appointmentData) => apiCall('/appointments', {
    method: 'POST',
    body: appointmentData
  }),

  // Get appointments for doctor
  getByDoctor: (doctorId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/appointments/doctor/${doctorId}${queryString ? '?' + queryString : ''}`);
  },

  // Get appointments for patient
  getByPatient: (email, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/appointments/patient/${email}${queryString ? '?' + queryString : ''}`);
  },

  // Get appointment by ID
  getById: (id) => apiCall(`/appointments/${id}`),

  // Update appointment status
  updateStatus: (id, statusData) => apiCall(`/appointments/${id}/status`, {
    method: 'PUT',
    body: statusData
  }),

  // Reschedule appointment
  reschedule: (id, rescheduleData) => apiCall(`/appointments/${id}/reschedule`, {
    method: 'PUT',
    body: rescheduleData
  }),

  // Cancel appointment
  cancel: (id, cancellationData) => apiCall(`/appointments/${id}/cancel`, {
    method: 'PUT',
    body: cancellationData
  }),

  // Get available slots
  getAvailableSlots: (doctorId, date) => apiCall(`/appointments/slots/${doctorId}/${date}`)
};

// Payment API functions
export const paymentAPI = {
  // Initiate payment
  initiate: (paymentData) => apiCall('/payments/initiate', {
    method: 'POST',
    body: paymentData
  }),

  // Complete payment
  complete: (paymentData) => apiCall('/payments/complete', {
    method: 'POST',
    body: paymentData
  }),

  // Get payment details
  getById: (transactionId) => apiCall(`/payments/${transactionId}`),

  // Get doctor payments
  getByDoctor: (doctorId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/payments/doctor/${doctorId}${queryString ? '?' + queryString : ''}`);
  },

  // Get patient payments
  getByPatient: (email, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/payments/patient/${email}${queryString ? '?' + queryString : ''}`);
  },

  // Get earnings summary
  getEarnings: (doctorId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/payments/earnings/${doctorId}${queryString ? '?' + queryString : ''}`);
  },

  // Request withdrawal
  withdraw: (doctorId, withdrawalData) => apiCall(`/payments/withdraw/${doctorId}`, {
    method: 'POST',
    body: withdrawalData
  })
};

// Health check
export const healthCheck = () => apiCall('/health');

// Utility functions
export const formatError = (error) => {
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};

export const showSuccessMessage = (message) => {
  // In a real app, you might use a toast library or state management
  alert(message);
};

export const showErrorMessage = (error) => {
  // In a real app, you might use a toast library or state management
  alert(formatError(error));
};

export default {
  doctorAPI,
  contactAPI,
  consultationAPI,
  appointmentAPI,
  paymentAPI,
  healthCheck,
  formatError,
  showSuccessMessage,
  showErrorMessage
};
