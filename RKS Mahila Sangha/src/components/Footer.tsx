import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/293c5d14ec8562ce9015186982fdd8d01c49cd35.png';

export function Footer() {
  return (
    <footer className="bg-[#0A6C87] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="RKS Logo" className="w-12 h-12 bg-white rounded-full p-1" />
              <h3 className="text-lg font-bold">Raju Kshatriya Mahila Sangha</h3>
            </div>
            <p className="text-cyan-100 text-sm">
              Empowering women through community support, cultural preservation, and social development initiatives.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-cyan-100 hover:text-[#f4a430] transition-colors">About Us</Link></li>
              <li><Link to="/services" className="text-cyan-100 hover:text-[#f4a430] transition-colors">Our Services</Link></li>
              <li><Link to="/events" className="text-cyan-100 hover:text-[#f4a430] transition-colors">Events</Link></li>
              <li><Link to="/membership" className="text-cyan-100 hover:text-[#f4a430] transition-colors">Membership</Link></li>
              <li><Link to="/donate" className="text-cyan-100 hover:text-[#f4a430] transition-colors">Donate</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-1 text-[#E5C100] flex-shrink-0" />
                <span className="text-cyan-100">Bangalore, Karnataka, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-[#E5C100] flex-shrink-0" />
                <span className="text-cyan-100">+91 XXXXX XXXXX</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[#E5C100] flex-shrink-0" />
                <span className="text-cyan-100">info@rksmahilavedike.org</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex gap-4 mt-4">
              <a href="#" className="w-8 h-8 bg-cyan-700 rounded-full flex items-center justify-center hover:bg-[#E5C100] transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-8 h-8 bg-cyan-700 rounded-full flex items-center justify-center hover:bg-[#E5C100] transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-8 h-8 bg-cyan-700 rounded-full flex items-center justify-center hover:bg-[#E5C100] transition-colors">
                <Instagram size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-cyan-800 mt-8 pt-8 text-center text-sm text-cyan-100">
          <p>&copy; {new Date().getFullYear()} Raju Kshatriya Mahila Sangha. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}