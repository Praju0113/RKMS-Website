import { Target, Eye, Award, Users } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

export function AboutUs() {
  const [activeTab, setActiveTab] = useState("current");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#0A6C87] to-cyan-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Raju Kshatriya Mahila Sangha</h1>
          <p className="text-xl max-w-3xl mx-auto text-cyan-50">
            A pioneering organization dedicated to women's empowerment and community development
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
            <p className="text-gray-700 mb-4">
              Raju Kshatriya Mahila Sangha is a dynamic women's organization committed to creating positive change 
              in our community. Founded on the principles of empowerment, equality, and cultural preservation, 
              we have been serving our community for over 15 years.
            </p>
            <p className="text-gray-700 mb-4">
              We bring together women from diverse backgrounds to create a supportive network that fosters 
              personal growth, skill development, and community engagement. Through our various programs 
              and initiatives, we strive to make a meaningful impact in the lives of women and their families.
            </p>
            <p className="text-gray-700">
              Our organization is built on the foundation of traditional values while embracing modern 
              approaches to women's empowerment and social development.
            </p>
          </div>
          <div>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1764751024389-857d08396423?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aHJlZSUyMHdvbWVuJTIwbGF1Z2hpbmclMjBkaXNjdXNzaW5nJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzAxMTE5NDd8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Women community gathering"
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </section>

      {/*

      {/* Mission, Vision, Objectives 
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Mission 
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-700">
                Our mission is to empower women through collective efforts, to encourage active participation of women, 
                to encourage women to step forward, and to provide a platform to express themselves to help develop their full potential, 
                where every woman can grow, and lead. 
              </p>
            </div>

            {/* Vision 
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-[#E5C10033] rounded-full flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-[#E5C100]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-700">
                Our vision is to build a community where women become confident and empowered.
              </p>
            </div>

            {/* Objectives 
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-[#0A6C87]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Objectives</h3>
              {/*
              <ul className="text-gray-700 space-y-2">
                <li>• Promote women's education and skill development</li>
                <li>• Foster cultural preservation and awareness</li>
                <li>• Build supportive community networks</li>
                <li>• Organize social and cultural events</li>
                <li>• Support women in need</li>
              </ul>
              
              <p className="text-gray-700">
                To Promote  Social, Cultural, Educational, Recreational, Charitable cause and to encourage women entrepreneurs.
              </p>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* committee Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Committees
            </h2>
            <p className="text-xl text-gray-600">
              Our dedicated committees working towards community empowerment
            </p>
          </div>
          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'current'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Current Committees
            </button>
            <button
              onClick={() => setActiveTab('former')}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'former'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Former Committees
            </button>
          </div>

          {/* Current Committees */}
          {activeTab === 'current' && (
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Education & Skill Development',
                  description: 'Focuses on organizing workshops, training programs, and educational initiatives to enhance skills and knowledge.',
                  
                },
                {
                  name: 'Cultural & Events',
                  description: 'Organizes cultural programs, festivals, and community events to preserve traditions and foster unity.',
                  
                },
                {
                  name: 'Welfare & Support',
                  description: 'Provides assistance and support to women in need, including healthcare, counseling, and emergency aid.',
                  
                }
              ].map((committee, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-t-4 border-cyan-600">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{committee.name}</h3>
                  <p className="text-gray-700 mb-4">{committee.description}</p>
                  
                </div>
              ))}
            </div>
          )}

          {/* Former Committees */}
          {activeTab === 'former' && (
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Education & Skill Development',
                  description: 'Successfully conducted over 50 training programs and workshops during their tenure.',
                  
                },
                {
                  name: 'Cultural & Events',
                  description: 'Organized 30+ major cultural events and celebrations that brought the community together.',
                  
                },
                {
                  name: 'Welfare & Support',
                  description: 'Provided assistance to over 200 families and individuals during their service period.',
                  
                }
              ].map((committee, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-t-4 border-gray-400">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{committee.name}</h3>
                    
                  </div>
                  <p className="text-gray-700 mb-4">{committee.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Find answers to common questions about our organization
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              question: "How can I become a member of Raju Kshatriya Mahila Sangha?",
              answer: "You can become a member by visiting our Membership page and completing the registration form. The membership fee is ₹1,001, and you'll receive a unique membership ID after successful payment. Membership is open to all women from the Raju Kshatriya community."
            },
            {
              question: "What programs and services does the organization offer?",
              answer: "We offer a wide range of programs including skill development workshops, cultural events, educational seminars, health awareness camps, counseling services, and community welfare programs. Our committees organize various activities throughout the year to support women's empowerment and community development."
            },
            {
              question: "How are committee members selected?",
              answer: "Committee members are elected through a democratic process during our annual general meeting. Members can nominate themselves or be nominated by other members. Elections are conducted transparently, and committee members serve a tenure of 3 years."
            },
            {
              question: "Can I volunteer without being a member?",
              answer: "While we encourage membership for regular participation, we welcome volunteers for specific events and programs. You can contact us through our website or attend our events to learn more about volunteer opportunities. However, certain benefits and voting rights are reserved for registered members."
            },
            {
              question: "How are donations utilized by the organization?",
              answer: "All donations are used transparently for our community welfare programs, educational initiatives, event organization, and supporting women in need. We maintain detailed financial records and provide regular updates to our members about fund utilization. Donations are tax-deductible under applicable laws."
            },
            {
              question: "How often does the organization conduct events?",
              answer: "We organize events throughout the year, including monthly meetings, quarterly cultural programs, annual celebrations, and special workshops. Members receive regular updates about upcoming events through email, SMS, and our social media channels."
            }
          ].map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <span className="text-2xl text-cyan-600">
                  {openFaq === index ? '−' : '+'}
                </span>
              </button>
              {openFaq === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Event Photography Section 
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Events & Moments</h2>
          <p className="text-xl text-gray-600">
            Capturing memorable moments from our community gatherings and celebrations
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600',
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
            'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600',
            'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600',
            'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600',
            'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600',
          ].map((img, index) => (
            <div key={index} className="relative overflow-hidden rounded-lg shadow-lg group">
              <ImageWithFallback
                src={img}
                alt={`Event photo ${index + 1}`}
                className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Leadership/Team Section 
      <section className="bg-gradient-to-b from-white to-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Users className="w-16 h-16 text-cyan-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We are guided by principles of integrity, compassion, and community service
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: 'Empowerment', description: 'Enabling women to reach their full potential' },
              { title: 'Unity', description: 'Building strong community bonds' },
              { title: 'Tradition', description: 'Preserving our cultural heritage' },
              { title: 'Progress', description: 'Embracing positive change' },
            ].map((value, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      */}
    </div>
  );
}