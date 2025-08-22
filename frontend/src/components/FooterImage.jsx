import React from 'react';
import footerImg from '../assets/Footer.png';
import "../styles/global.css"

const FooterImage = () => {
  return (
    <div className="footer-image-wrapper">
      <img src={footerImg} alt="Footer Banner" className="footer-image" />
    </div>
  );
};

export default FooterImage;
