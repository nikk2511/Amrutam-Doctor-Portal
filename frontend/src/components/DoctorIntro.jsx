import React, { useState } from "react";
import doctorsImg from "../assets/DocHero.png";
import iconLeaf from "../assets/icon-leaf.png";
import iconYoga from "../assets/icon-yoga.png";
import iconCalendar from "../assets/icon-calendar.png";
import "../styles/global.css";
import { Link } from "react-router-dom";
import { doctorAPI, showSuccessMessage, showErrorMessage } from "../utils/api";

const DoctorIntro = () => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    medicalLicenseNumber: '',
    specialization: 'Ayurveda',
    experience: '',
    qualification: '',
    registrationBody: '',
    consultationFee: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleJoinNow = () => {
    setShowRegistrationForm(true);
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await doctorAPI.register({
        ...formData,
        experience: parseInt(formData.experience),
        consultationFee: parseInt(formData.consultationFee)
      });

      showSuccessMessage('Registration successful! Welcome to Amrutam!');
      setShowRegistrationForm(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        medicalLicenseNumber: '',
        specialization: 'Ayurveda',
        experience: '',
        qualification: '',
        registrationBody: '',
        consultationFee: ''
      });
    } catch (error) {
      showErrorMessage(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="intro-container">
      <div className="intro-content">
        <div className="text-area">
          <p className="greeting">Namaste, Welcome to Amrutam</p>
          <h1>
            Join Amrutam – <span className="highlight">Grow Your Practice</span>
          </h1>
          <p className="description">
            Connect with more patients, set your own schedule,
            <br /> and grow your Ayurvedic practice effortlessly.
          </p>
        <button onClick={handleJoinNow} className="join-btn">Join Now</button>
          <div className="stats">
            <div>
              <h3>500+</h3>
              <p>Average Active Users</p>
            </div>
            <div className="divider"></div> 
            <div>
              <h3>40+</h3>
              <p>Average Daily Free Calls</p>
            </div>
          </div>
        </div>

        <div className="image-area">
          <img src={doctorsImg} alt="Doctors" className="doctors-img" />
          <img src={iconLeaf} className="icon icon1" alt="Ayurveda Icon" />
          <img src={iconYoga} className="icon icon2" alt="Yoga Icon" />
          <img src={iconCalendar} className="icon icon3" alt="Calendar Icon" />
        </div>
      </div>

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <div className="modal-overlay" onClick={() => setShowRegistrationForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Join Amrutam as a Doctor</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowRegistrationForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitRegistration} className="registration-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="Dr. Your Name"
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+91 9876543210"
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Medical License Number *</label>
                  <input
                    type="text"
                    name="medicalLicenseNumber"
                    value={formData.medicalLicenseNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="License Number"
                  />
                </div>
                <div className="form-group">
                  <label>Specialization *</label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Ayurveda">Ayurveda</option>
                    <option value="Panchakarma">Panchakarma</option>
                    <option value="Rasayana">Rasayana</option>
                    <option value="Kayachikitsa">Kayachikitsa</option>
                    <option value="Shalya">Shalya</option>
                    <option value="Shalakya">Shalakya</option>
                    <option value="Kaumarbhritya">Kaumarbhritya</option>
                    <option value="General Ayurveda">General Ayurveda</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Experience (Years) *</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="Years of experience"
                  />
                </div>
                <div className="form-group">
                  <label>Consultation Fee (₹) *</label>
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="Fee per consultation"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Qualification *</label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    required
                    placeholder="BAMS, MD, etc."
                  />
                </div>
                <div className="form-group">
                  <label>Registration Body *</label>
                  <input
                    type="text"
                    name="registrationBody"
                    value={formData.registrationBody}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., State Medical Council"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registering...' : 'Register as Doctor'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default DoctorIntro;
