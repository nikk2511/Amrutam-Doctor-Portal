import React, { useState, useEffect } from 'react';
import "../styles/global.css";
import consultImg from '../assets/consultation.png';
import healingImg from '../assets/appointments.png';
import detailsImg from '../assets/details.png';
import { doctorAPI, consultationAPI, appointmentAPI } from '../utils/api';

const DoctorFeatures = () => {
  const [activeTab, setActiveTab] = useState('consultations');
  const [stats, setStats] = useState({
    totalDoctors: 0,
    verifiedDoctors: 0,
    totalConsultations: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [doctorStats, consultationStats] = await Promise.all([
        doctorAPI.getStats(),
        consultationAPI.getStats()
      ]);

      setStats({
        totalDoctors: doctorStats.data?.summary?.totalDoctors || 0,
        verifiedDoctors: doctorStats.data?.summary?.verifiedDoctors || 0,
        totalConsultations: consultationStats.data?.summary?.totalConsultations || 0,
        averageRating: doctorStats.data?.summary?.averageRating || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'consultations':
        return (
          <div className="doctor-features-images">
            <div className="feature-block side-phone">
              <h3>Value Your Practice</h3>
              <img src={consultImg} alt="Consultations" />
              <div className="feature-stats">
                <p><strong>{loading ? '...' : stats.totalConsultations}</strong> Total Consultations</p>
                <p><strong>{loading ? '...' : stats.averageRating.toFixed(1)}</strong> Average Rating</p>
              </div>
            </div>
            <div className="feature-block center-phone">
              <img src={healingImg} alt="Healing Journey" />
              <h3>Today's Healing Journey</h3>
              <p>Connect with patients seeking authentic Ayurvedic care</p>
            </div>
            <div className="feature-block side-phone">
              <h3>Consultation Details</h3>
              <img src={detailsImg} alt="Consultation Details" />
              <div className="feature-stats">
                <p>Video & Audio Consultations</p>
                <p>Digital Prescriptions</p>
                <p>Follow-up Management</p>
              </div>
            </div>
          </div>
        );
      
      case 'payments':
        return (
          <div className="doctor-features-images">
            <div className="feature-block side-phone">
              <h3>Secure Payments</h3>
              <img src={consultImg} alt="Payments" />
              <div className="feature-stats">
                <p>Multiple Payment Options</p>
                <p>Instant Transaction Processing</p>
                <p>15% Platform Fee</p>
              </div>
            </div>
            <div className="feature-block center-phone">
              <img src={healingImg} alt="Earnings" />
              <h3>Track Your Earnings</h3>
              <p>Real-time earnings dashboard with detailed analytics</p>
            </div>
            <div className="feature-block side-phone">
              <h3>Quick Withdrawals</h3>
              <img src={detailsImg} alt="Withdrawals" />
              <div className="feature-stats">
                <p>Daily Withdrawal Options</p>
                <p>Bank Transfer Support</p>
                <p>No Hidden Charges</p>
              </div>
            </div>
          </div>
        );
      
      case 'schedule':
        return (
          <div className="doctor-features-images">
            <div className="feature-block side-phone">
              <h3>Flexible Schedule</h3>
              <img src={consultImg} alt="Schedule" />
              <div className="feature-stats">
                <p>Set Your Own Hours</p>
                <p>Block Unavailable Times</p>
                <p>Auto Appointment Management</p>
              </div>
            </div>
            <div className="feature-block center-phone">
              <img src={healingImg} alt="Calendar" />
              <h3>Smart Calendar</h3>
              <p>Intelligent scheduling system that works around your availability</p>
            </div>
            <div className="feature-block side-phone">
              <h3>Patient Management</h3>
              <img src={detailsImg} alt="Management" />
              <div className="feature-stats">
                <p>Patient History Access</p>
                <p>Appointment Reminders</p>
                <p>Follow-up Scheduling</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <section className="doctor-features-section">
      <div className="doctor-features-tabs">
        <button 
          className={`tab ${activeTab === 'consultations' ? 'active' : ''}`}
          onClick={() => setActiveTab('consultations')}
        >
          Consultations
        </button>
        <button 
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payment & Withdrawal
        </button>
        <button 
          className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule Management
        </button>
      </div>

      {renderTabContent()}

      <div className="platform-stats">
        <div className="stat-card">
          <h4>{loading ? '...' : stats.totalDoctors}</h4>
          <p>Registered Doctors</p>
        </div>
        <div className="stat-card">
          <h4>{loading ? '...' : stats.verifiedDoctors}</h4>
          <p>Verified Practitioners</p>
        </div>
        <div className="stat-card">
          <h4>{loading ? '...' : stats.totalConsultations}</h4>
          <p>Successful Consultations</p>
        </div>
        <div className="stat-card">
          <h4>{loading ? '...' : `${stats.averageRating.toFixed(1)}/5`}</h4>
          <p>Average Doctor Rating</p>
        </div>
      </div>
    </section>
  );
};

export default DoctorFeatures;
