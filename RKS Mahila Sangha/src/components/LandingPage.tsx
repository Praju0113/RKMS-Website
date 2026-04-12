import { Link } from 'react-router-dom';
import { Users, Heart, Calendar, Award } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#0A6C87] to-cyan-600 text-white py-16" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1678082310346-4299fb587084?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGVtcG93ZXJtZW50JTIwc3VjY2Vzc3xlbnwxfHx8fDE3NzAxMDY5MTh8MA&ixlib=rb-4.1.0&q=80&w=1080)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A6C87]/90 to-[#0A6C87]/70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Together we serve, Together we rise
              </h1>
              <p className="text-xl mb-8 text-cyan-50 text-justify">
                We work towards empowerment and welfare of women through various social and community activities.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/about"
                  className="bg-white text-[#0A6C87] px-8 py-3 rounded-lg font-semibold hover:bg-cyan-50 transition-colors"
                >
                  About Us
                </Link>
                <Link
                  to="/membership"
                  className="bg-[#E5C100] text-[#0A6C87] px-8 py-3 rounded-lg font-semibold hover:bg-[#CCA900] transition-colors"
                >
                  Become a Member
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, label: 'Members', value: '1000+' },
              { icon: Heart, label: 'Lives Impacted', value: '5000+' },
              { icon: Calendar, label: 'Events Organized', value: '200+' },
              { icon: Award, label: 'Years of Service', value: '15+' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-100 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-cyan-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0A6C87] to-cyan-700 text-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl font-bold mb-6">Join Us in Making a Difference</h2>
            <p className="text-xl mb-8 text-cyan-50">
              Your support helps us continue our mission to empower women and strengthen communities.
            </p>
            <Link
              to="/donate"
              className="inline-block bg-[#E5C100] text-[#0A6C87] px-8 py-3 rounded-lg font-semibold hover:bg-[#CCA900] transition-colors"
            >
              Donate Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}