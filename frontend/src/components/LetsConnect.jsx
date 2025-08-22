import React, { useState } from 'react';
import '../styles/global.css'; // Make sure this path is correct
import connectImage from '../assets/connect-img.png'; // Replace with your actual image
import FooterImage from './FooterImage';
import { contactAPI, showSuccessMessage, showErrorMessage } from '../utils/api';

const ConnectSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    subject: '',
    inquiryType: 'general'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await contactAPI.submit(formData);
      showSuccessMessage(response.message || 'Message sent successfully! We will get back to you soon.');
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        message: '',
        subject: '',
        inquiryType: 'general'
      });
    } catch (error) {
      showErrorMessage(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <section className="connect-section" id="connect">
      <div className="connect-container">
        <div className="connect-left">
          <img src={connectImage} alt="Connect Visual" />
        </div>
        <div className="connect-right">
          <h2>Let's Connect</h2>
          <p>
            We're here to help you on your wellness journey. Reach out to us for any questions,
            product inquiries, or personalized advice.
          </p>
          <form className="connect-form" onSubmit={handleSubmit}>
            <div className="input-row">
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your Name" 
                className="connect-input"
                required
              />
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Contact Number" 
                className="connect-input"
                required
              />
            </div>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email" 
              className="connect-input full-width"
              required
            />
            <input 
              type="text" 
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Subject (Optional)" 
              className="connect-input full-width"
            />
            <select 
              name="inquiryType"
              value={formData.inquiryType}
              onChange={handleInputChange}
              className="connect-input full-width"
            >
              <option value="general">General Inquiry</option>
              <option value="doctor-registration">Doctor Registration</option>
              <option value="patient-inquiry">Patient Support</option>
              <option value="technical-support">Technical Support</option>
              <option value="billing">Billing Question</option>
              <option value="partnership">Partnership</option>
              <option value="feedback">Feedback</option>
              <option value="complaint">Complaint</option>
            </select>
            <textarea 
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Your Message" 
              className="connect-textarea full-width"
              required
            />
            <button 
              type="submit" 
              className="connect-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </section>
    
  );
};

export default ConnectSection;
