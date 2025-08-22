import React from 'react';
import Header from '../components/Header';
import DoctorIntro from '../components/DoctorIntro';
import FeaturedIn from '../components/FeaturedIn';
import HowToJoinPage from './HowToJoinPage';
import Testimonials from '../components/Testimonials';
import DashboardFaq from '../components/DashboardFaq'; // Correct import
import DownloadAppPage from './DownloadAppPage';
import LetsConnect from '../components/LetsConnect';
import FooterImage from '../components/FooterImage';
import WhyDoctors from '../components/WhyDoctors';
import DoctorFeatures from '../components/DoctorFeatures';
export default function Dashboard() {
  return (
    <div className="bg-[#E1FFF1] min-h-screen">
      <Header />
      <DoctorIntro />
      <FeaturedIn />
      <WhyDoctors />
      <HowToJoinPage />
      <DoctorFeatures/>
      <Testimonials />
      <DashboardFaq /> {/* Corrected usage */}
      <DownloadAppPage />
      <LetsConnect/>
      
      <FooterImage/>
    </div>
  );
}
