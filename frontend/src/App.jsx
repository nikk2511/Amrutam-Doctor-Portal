import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DoctorIntroPage from './pages/DoctorIntroPage';
import DoctorFeaturesPage from './pages/DoctorFeaturesPage';
import HowToJoinPage from './pages/HowToJoinPage';
import TestimonialsPage from './pages/TestimonialsPage';
import FaqPage from './pages/FaqPage';
import DownloadAppPage from './pages/DownloadAppPage';
import WhyDoctorsPage from './pages/WhyDoctorsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/intro" element={<DoctorIntroPage />} />
        <Route path="/why-doctors" element={<WhyDoctorsPage />} />
        <Route path="/features" element={<DoctorFeaturesPage />} />
        <Route path="/join" element={<HowToJoinPage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/download" element={<DownloadAppPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
