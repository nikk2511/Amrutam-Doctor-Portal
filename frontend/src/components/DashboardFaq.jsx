import React, { useState } from 'react';
import '../styles/global.css';

const faqData = [
  {
    question: "What is Amrutam?",
    answer: "Amrutam is a wellness platform offering Ayurvedic health solutions including doctor consultations, wellness products, and more."
  },
  {
    question: "How do I join as a doctor?",
    answer: "To join, simply get a referral code, register on the app, complete KYC, and start consulting patients."
  },
  {
    question: "Is there a consultation fee?",
    answer: "Consultation fees depend on the nature of the service. Some consultations may be free, others paid."
  },
  {
    question: "How are patients assigned?",
    answer: "Patients are assigned based on availability, specialization, and user preference on the Amrutam platform."
  },
  {
    question: "Can I set my own schedule?",
    answer: "Yes, doctors have complete flexibility to set and manage their consultation schedules."
  }
];

const DashboardFaq = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAnswer = (index) => {
    setActiveIndex(prev => (prev === index ? null : index));
  };

  return (
    <section className="dashboard-faq-section">
      <h2 className="dashboard-faq-heading">Frequently Asked Questions</h2>
      <p className="dashboard-faq-subtext">
        Find quick answers to common questions to help you navigate the app and its features easily.
      </p>
      <div className="dashboard-faq-list">
        {faqData.map((item, index) => (
          <div key={index} style={{ width: '1030px' }}>
            <div
              className="dashboard-faq-item"
              onClick={() => toggleAnswer(index)}
            >
              {item.question}
            </div>
            {activeIndex === index && (
              <div className="dashboard-faq-answer">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
       <button className="faq-see-more-btn">See More</button>
    </section>
  );
};

export default DashboardFaq;
