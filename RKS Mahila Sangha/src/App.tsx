import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { LandingPage } from './components/LandingPage';
import { AboutUs } from './components/AboutUs';
import { Services } from './components/Services';
import { Events } from './components/Events';
import { Membership } from './components/Membership';
import { Donate } from './components/Donate';

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/services" element={<Services />} />
            <Route path="/events" element={<Events />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/donate" element={<Donate />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}