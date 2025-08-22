import React from 'react';
import './Header.css';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom'; // 👈 import this

export default function Header() {
  return (
    <header className="dashboard-header">
      <div className="dashboard-logo-container">
        <img src={logo} alt="Amrutam Logo" className="dashboard-logo" />
      </div>
      <nav className="dashboard-nav">
        <Link to="/why-doctors">Why Amrutam</Link>
         <a href="#onboarding">About us</a>
        <Link to="/join">
  <div className="join-now-button">Onboarding</div>
</Link>
        <Link to="/faq">FAQ</Link> 
        <Link to="/testimonials">
  <div className="btn">Testimonials</div>
</Link>
      </nav>
    </header>
  );
}
