import React from "react";
import featuredLogos from "../assets/featured-logos.png"; // Update path as per your folder

export default function FeaturedIn() {
  return (
    <section className="featured-section">
      <h2 className="featured-heading">Featured</h2>
      <p className="featured-subtext">
        Recognized and celebrated by leading publications – Amrutam in the spotlight!
      </p>

      <div className="featured-image-container">
        <img
          src={featuredLogos}
          alt="Featured Logos"
          className="featured-logos"
        />
      </div>
    </section>
  );
}
