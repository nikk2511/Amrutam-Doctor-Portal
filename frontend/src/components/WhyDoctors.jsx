import React from 'react';
import './WhyDoctors.css';
import chooseImg from '../assets/WhyDoctors.png';

export default function WhyDoctors() {
  return (
    <section className="why-doctors-container">
      <h2 className="why-title">Why Doctors Choose Us</h2>
      
      <p className="why-subtitle">
        Unlock the Benefits of Smarter Healthcare Management and Patient Care
      </p>

      <img src={chooseImg} alt="Why Doctors Choose Us" className="why-image" />
    </section>
  );
}
