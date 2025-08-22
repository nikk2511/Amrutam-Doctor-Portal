import React, { useState } from "react";
import doctorImg from "../assets/doctor.png";
import "../styles/Testimonials.css";

const testimonials = [
  {
    name: "Dr. Pooja Deshmukh, BAMS",
    text: "Amrutam’s formulations stay true to the ancient wisdom of Ayurveda. Their authentic, chemical-free products help restore balance and promote holistic well-being.",
    rating: "★★★★★",
  },
  {
    name: "Dr. Rajesh Iyer, Ayurvedic Practitioner",
    text: "Amrutam beautifully bridges the gap between traditional Ayurveda and modern wellness. Their high-quality ingredients and ethical practices make them a trustworthy choice.",
    rating: "★★★★☆",
  },
  {
    name: "Dr. Ananya Sharma, BAMS",
    text: "I appreciate Amrutam’s commitment to purity and efficacy. Their herbal blends are thoughtfully crafted for mind and body. I’ve seen positive results in patients.",
    rating: "★★★★★",
  },
];

const Testimonials = () => {
  const [selectedIndex, setSelectedIndex] = useState(1);

  return (
    <section className="testimonials-section">
      <h2 className="section-title">What other Ayurvedic Doctors are Saying</h2>
      <p className="section-subtitle">
        Trusted by experts — Hear what Ayurvedic doctors say about Amrutam!
      </p>

      <div className="testimonial-cards">
        {testimonials.map((t, index) => (
          <div
            key={index}
            className={`testimonial-card ${selectedIndex === index ? "active" : ""}`}
            onClick={() => setSelectedIndex(index)}
          >
            <div className="card-top">
              <img src={doctorImg} alt={t.name} className="doctor-img" />
              <div className="doctor-info">
                <h4>{t.name}</h4>
                <p className="stars">{t.rating}</p>
              </div>
            </div>
            <p className="testimonial-text">“{t.text}”</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
