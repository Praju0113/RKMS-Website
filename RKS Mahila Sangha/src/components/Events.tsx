import { Calendar, MapPin, Clock, Users, ArrowRight, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { eventsApi, resolveBackendAssetUrl } from '../services/api';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image?: string;
  image_url?: string;
  category: 'upcoming' | 'past';
  attendees?: number;
  current_participants?: number;
  fee?: number;
}

export function Events() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    membershipId: ''
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await eventsApi.getEvents();
        if (response.success && response.events) {
          setEvents(response.events as Event[]);
        }
      } catch (error) {
        toast.error('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };
    loadEvents();
  }, []);

  const filteredEvents = events.filter(event => event.category === activeTab);

  const handleRegister = (event: Event) => {
    setSelectedEvent(event);
    setShowRegistrationModal(true);
  };

  const handleRegistrationSubmit = () => {
    if (!registrationData.name || !registrationData.email) {
      toast.error('Please fill in Name and Email');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registrationData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    const isPaid = !selectedEvent?.fee || selectedEvent.fee === 0;
    eventsApi.registerEvent(selectedEvent!.id, {
      name: registrationData.name,
      email: registrationData.email,
      membershipId: registrationData.membershipId || undefined,
      paymentStatus: isPaid ? 'completed' : 'pending',
      paymentAmount: selectedEvent?.fee || 0,
    }).then((response) => {
      if (response.success) {
        toast.success('Registration successful!');
        setShowRegistrationModal(false);
        setRegistrationData({ name: '', email: '', membershipId: '' });
      } else {
        toast.error(response.message || 'Registration failed');
      }
    }).catch(() => toast.error('Registration failed'));
  };

  const handlePayNow = () => {
    if (!registrationData.name || !registrationData.email) {
      toast.error('Please fill in Name and Email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registrationData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!selectedEvent?.fee) return;

    eventsApi.registerEvent(selectedEvent.id, {
      name: registrationData.name,
      email: registrationData.email,
      membershipId: registrationData.membershipId || undefined,
      paymentStatus: 'completed',
      paymentAmount: selectedEvent.fee,
      paymentId: `SIM_EVENT_PAY_${Date.now()}`
    }).then((response) => {
      if (response.success) {
        toast.success('Payment successful! You are now registered for the event.');
        setShowRegistrationModal(false);
        setRegistrationData({ name: '', email: '', membershipId: '' });
      } else {
        toast.error(response.message || 'Payment failed');
      }
    }).catch(() => toast.error('Payment failed'));
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#0A6C87] to-cyan-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Events</h1>
          <p className="text-xl max-w-3xl mx-auto text-cyan-50">
            Join us for exciting events, workshops, and cultural celebrations throughout the year
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'past'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Past Events
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl">Loading events...</p>
          </div>
        )}

        {/* Events Grid */}
        {!isLoading && <div className="grid md:grid-cols-2 gap-8">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <ImageWithFallback
                  src={
                    resolveBackendAssetUrl(event.image_url) ||
                    resolveBackendAssetUrl(event.image)
                  }
                  alt={event.title}
                  className="w-full h-56 object-cover"
                />
                {event.category === 'upcoming' && (
                  <div className="absolute top-4 right-4 bg-cyan-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Upcoming
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h3>
                <p className="text-gray-700 mb-6">{event.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Clock className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                    <span>{event.location}</span>
                  </div>
                  {(event.current_participants || event.attendees) && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Users className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                      <span>{event.current_participants || event.attendees}+ attendees</span>
                    </div>
                  )}
                </div>

                {event.category === 'upcoming' && (
                  <button className="w-full bg-[#E5C100] text-[#0A6C87] py-3 rounded-lg font-semibold hover:bg-[#CCA900] transition-colors flex items-center justify-center gap-2" onClick={() => handleRegister(event)}>
                    Register Now
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl">No events to display at this time.</p>
          </div>
        )}
      </section>

      {/* Call to Action */}
      {activeTab === 'upcoming' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-r from-[#0A6C87] to-cyan-600 rounded-2xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-6">Want to Stay Updated?</h2>
            <p className="text-xl mb-8 text-cyan-50 max-w-2xl mx-auto">
              Subscribe to our newsletter to receive updates about upcoming events and programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white text-gray-900"
              />
              <button className="bg-[#E5C100] text-[#0A6C87] px-8 py-3 rounded-lg font-semibold hover:bg-[#CCA900] transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Registration Modal */}
      {showRegistrationModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Register for {selectedEvent.title}</h2>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowRegistrationModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRegistrationSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={registrationData.name}
                    onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    value={registrationData.email}
                    onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Membership ID (Optional)</label>
                  <input
                    type="text"
                    value={registrationData.membershipId}
                    onChange={(e) => setRegistrationData({ ...registrationData, membershipId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Enter your membership ID if available"
                  />
                </div>
                {selectedEvent.fee && (
                  <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900">
                      Registration Fee: <span className="text-cyan-700">₹{selectedEvent.fee}</span>
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handleRegistrationSubmit}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Submit
                </button>
                {selectedEvent.fee && (
                  <button
                    type="button"
                    onClick={handlePayNow}
                    className="flex-1 bg-[#E5C100] text-[#0A6C87] py-3 rounded-lg font-semibold hover:bg-[#CCA900] transition-colors"
                  >
                    Pay Now - ₹{selectedEvent.fee}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}