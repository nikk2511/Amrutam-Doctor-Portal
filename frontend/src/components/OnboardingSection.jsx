import React, { useState } from 'react';
import '../styles/OnboardingSection.css';

const OnboardingSection = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Get Started",
      subtitle: "Join the Amrutam Community",
      description: "Begin your journey to connect with patients and grow your practice through our comprehensive wellness platform.",
      icon: "🚀",
      action: "Get Referral Code"
    },
    {
      id: 2,
      title: "Register",
      subtitle: "Create Your Profile",
      description: "Download our app and register using your referral code. Set up your professional profile with your credentials and specializations.",
      icon: "📱",
      action: "Download App"
    },
    {
      id: 3,
      title: "Verify",
      subtitle: "Complete KYC Process",
      description: "Complete your KYC verification by submitting your medical credentials, licenses, and identity documents for verification.",
      icon: "✅",
      action: "Start KYC"
    },
    {
      id: 4,
      title: "Start Consulting",
      subtitle: "Begin Your Practice",
      description: "Once verified, set your availability, consultation fees, and start connecting with patients seeking Ayurvedic care.",
      icon: "🩺",
      action: "Start Practice"
    }
  ];

  const benefits = [
    {
      icon: "💰",
      title: "Flexible Earnings",
      description: "Set your own consultation fees and earn more through our pay-per-conversation model."
    },
    {
      icon: "⏰",
      title: "Flexible Schedule",
      description: "Work when you want. Set your availability and manage your time effectively."
    },
    {
      icon: "🌐",
      title: "Reach More Patients",
      description: "Connect with patients across India seeking authentic Ayurvedic treatment."
    },
    {
      icon: "📈",
      title: "Grow Your Practice",
      description: "Build your reputation and patient base through our trusted platform."
    },
    {
      icon: "🛡️",
      title: "Secure Platform",
      description: "HIPAA-compliant platform ensuring patient data privacy and security."
    },
    {
      icon: "🎓",
      title: "Continuous Learning",
      description: "Access to medical resources, forums, and continuing education opportunities."
    }
  ];

  return (
    <section id="onboarding-section" className="onboarding-section scroll-mt-[80px]">
      {/* Hero Section */}
      <div className="onboarding-hero">
        <div className="onboarding-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Join <span className="hero-highlight">Amrutam</span> Today
            </h1>
            <p className="hero-subtitle">
              Connect with thousands of patients seeking authentic Ayurvedic care. 
              Build your practice, set your schedule, and earn more with India's leading wellness platform.
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Active Patients</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Doctors</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4.8★</span>
                <span className="stat-label">Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="steps-section">
        <div className="onboarding-container">
          <h2 className="section-title">How to Join in 4 Simple Steps</h2>
          <p className="section-subtitle">
            Get started with Amrutam and begin your journey to help more patients
          </p>

          <div className="steps-nav">
            {steps.map((step, index) => (
              <button
                key={step.id}
                className={`step-nav-item ${currentStep === step.id ? 'active' : ''}`}
                onClick={() => setCurrentStep(step.id)}
                aria-label={`Step ${step.id}: ${step.title}`}
              >
                <span className="step-number">{step.id}</span>
                <span className="step-title">{step.title}</span>
              </button>
            ))}
          </div>

          <div className="step-content">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`step-card ${currentStep === step.id ? 'active' : ''}`}
              >
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-card-title">{step.subtitle}</h3>
                <p className="step-description">{step.description}</p>
                <button className="step-action-btn">
                  {step.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="benefits-section">
        <div className="onboarding-container">
          <h2 className="section-title">Why Choose Amrutam?</h2>
          <p className="section-subtitle">
            Discover the benefits of joining India's most trusted Ayurvedic platform
          </p>

          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <article key={index} className="benefit-card">
                <div className="benefit-icon">{benefit.icon}</div>
                <h3 className="benefit-title">{benefit.title}</h3>
                <p className="benefit-description">{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="onboarding-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Practice?</h2>
            <p className="cta-subtitle">
              Join thousands of doctors who have already started their journey with Amrutam
            </p>
            <div className="cta-buttons">
              <button className="cta-primary">
                Get Started Now
              </button>
              <button className="cta-secondary">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements Section */}
      <div className="requirements-section">
        <div className="onboarding-container">
          <h2 className="section-title">Requirements to Join</h2>
          <div className="requirements-grid">
            <div className="requirement-item">
              <span className="req-icon">🎓</span>
              <h4>Medical Degree</h4>
              <p>BAMS, MD (Ayurveda), or equivalent degree from recognized institution</p>
            </div>
            <div className="requirement-item">
              <span className="req-icon">📜</span>
              <h4>Valid License</h4>
              <p>Current medical license to practice Ayurveda in your state/region</p>
            </div>
            <div className="requirement-item">
              <span className="req-icon">💼</span>
              <h4>Experience</h4>
              <p>Minimum 2 years of clinical experience (preferred but not mandatory)</p>
            </div>
            <div className="requirement-item">
              <span className="req-icon">📱</span>
              <h4>Technology</h4>
              <p>Smartphone/computer with stable internet connection for consultations</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OnboardingSection;
