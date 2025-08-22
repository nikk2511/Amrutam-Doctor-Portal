import React from 'react';
import '../styles/global.css';

import mobileImg from '../assets/phoneframe.png';
import doc1 from '../assets/doc1.png';
import doc2 from '../assets/doc2.png';
import doc3 from '../assets/doc3.png';
import doc4 from '../assets/doc4.png';
import googlePlay from '../assets/google-play.png';
import appStore from '../assets/app-store.png';
import forumIcon from '../assets/leaf-download.png';
import payIcon from '../assets/dollardownload.png';
import callIcon from '../assets/calldownload.png';
import walletIcon from '../assets/walletdownload.png';

const DownloadAppPage = () => {
  return (
    <div className="outer-card">
    <div className="download-app-section">
      <div className="download-app-container">
        <div className="download-app-left">
          <h2>Get Started Today – <br />Download the App Now!</h2>
          <p>
            Simplify consultations, manage patients, and grow your practice—all in one place.
          </p>

          <div className="features">
            <div className="feature-box">
              <img src={forumIcon} alt="Forum Icon" />
              <span>Build Trust and Community with Forum</span>
            </div>
            <div className="feature-box">
              <img src={payIcon} alt="Pay Icon" />
              <span>Earn More with Pay Per Conversation</span>
            </div>
            <div className="feature-box">
              <img src={callIcon} alt="Call Icon" />
              <span>Attract Patients with 5–Minute Free Call</span>
            </div>
            <div className="feature-box">
              <img src={walletIcon} alt="Wallet Icon" />
              <span>Instant Access to Your Earnings with Wallet</span>
            </div>
          </div>

          <div className="app-buttons">
            <a
              href="https://play.google.com/store/apps/details?id=com.amrutamdoctor&hl=en_IN"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={googlePlay} alt="Get it on Google Play" />
            </a>
            <a
              href="https://apps.apple.com/in/app/amrutam-doc/id1608000095"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={appStore} alt="Download on the App Store" />
            </a>
          </div>
        </div>

        <div className="download-app-right">
          <img src={mobileImg} alt="Mobile Frame" className="mobile-img" />
          <img src={doc1} alt="Doctor 1" className="doc-img doc1" />
          <img src={doc2} alt="Doctor 2" className="doc-img doc2" />
          <img src={doc3} alt="Doctor 3" className="doc-img doc3" />
          <img src={doc4} alt="Doctor 4" className="doc-img doc4" />
        </div>
      </div>
    </div>
    </div>
  );
};

export default DownloadAppPage;
