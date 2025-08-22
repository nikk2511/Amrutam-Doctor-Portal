// src/pages/FaqPage.jsx
import React, { useState } from 'react';
import '../styles/FaqPage.css';
import appPromo from '../assets/FaqLm.png';
import leafBg from '../assets/bkgrndleafy.png';
import footerImage from '../assets/faqfooter.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaSearch } from 'react-icons/fa';
import amrutamLogo from '../assets/logo.png';

const tabs = ["Consultation", "Wallet", "Forum", "Shop"];

const faqData = {
  Consultation: [
    "What types of consultations are available?",
    "Can I get refund for the wallet money?",
    "What is the Amrutam Forum?",
    "Can I pause the audio consultation?",
    "Is there a minimum duration for an audio consultation?",
  ],
  Wallet: ["Can I get refund for the wallet money?"],
  Forum: ["What is the Amrutam Forum?"],
  Shop: ["Is there a minimum duration for an audio consultation?"],
};

function FaqPage() {
  const [activeTab, setActiveTab] = useState("Consultation");
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="faq-page">
      {/* Header Section */}
      <div className="faq-main-header">
        <div className="faq-logo-container">
          <img src={amrutamLogo} alt="Amrutam Logo" className="faq-logo" />
        </div>
        <div className="faq-nav-links">
          <a href="/">Home</a>
          <a href="/">Find Doctors</a>
          <a href="/">Lab Tests</a>
          <a href="/">Ayurveda</a>
          <a href="/">About Us</a>
        </div>
      </div>

      {/* Hero Section */}
      <div
        className="faq-hero"
        style={{ backgroundImage: `url(${leafBg})` }}>
        <h1 className="faq-title">FAQ</h1>
        <div className="faq-search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for any queries that you have"
            className="faq-search"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="faq-tabs">
        <div className="faq-tabs-inner">
          {tabs.map((tab) => (
            <div
              key={tab}
              className={`faq-tab-text ${activeTab === tab ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab);
                setExpanded(null);
              }}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Questions */}
      <div className="faq-list">
        <div className="faq-list-inner">
          {faqData[activeTab].map((question, index) => (
            <div
              key={index}
              className={`faq-item ${expanded === index ? "open" : ""}`}
              onClick={() => setExpanded(expanded === index ? null : index)}
            >
              <div className="faq-question">{question}</div>
              <div className="faq-answer">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="load-more">Load More →</button>

      {/* Download Section */}
      <div className="faq-download-section">
        <img src={appPromo} alt="Download Amrutam App" className="faq-download-img" />
      </div>

      {/* Footer Image */}
      <div className="faq-footer-img">
        <img src={footerImage} alt="Footer" />
      </div>
    </div>
  );
}

export default FaqPage;
