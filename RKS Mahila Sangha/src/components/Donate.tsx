import { Heart, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { settingsApi, donationApi } from '../services/api';

interface Settings {
  donationSuggestions: number[];
  organizationName: string;
}

export function Donate() {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsApi.getPublicSettings();
        if (response.success && response.settings) {
          setSettings(response.settings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings. Using default values.');
        // Set default values as fallback
        setSettings({
          donationSuggestions: [500, 1000, 2500, 5000, 10000],
          organizationName: 'Raju Kshatriya Mahila Sangha'
        });
      }
    };

    fetchSettings();
  }, []);

  const predefinedAmounts = settings?.donationSuggestions || [500, 1000, 2500, 5000, 10000];

  const handleDonate = async () => {
    const amount = selectedAmount || parseFloat(customAmount);

    if (!amount || amount <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    if (!donorName || !donorEmail || !donorPhone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Create order with backend
      const response = await donationApi.createOrder({
        amount,
        name: donorName,
        email: donorEmail,
      });

      if (response.success && response.order && response.razorpayKeyId) {
        const isSimulated = response.razorpayKeyId === 'SIMULATED_KEY' || !(window as any).Razorpay;
        if (isSimulated) {
          await verifyAndCreateDonation({
            razorpay_order_id: response.order.id || `SIM_ORDER_${Date.now()}`,
            razorpay_payment_id: `SIM_PAY_${Date.now()}`,
            razorpay_signature: 'SIMULATED_SIGNATURE',
            amount,
            name: donorName,
            email: donorEmail,
          });
          return;
        }

        // Initialize Razorpay
        const options = {
          key: response.razorpayKeyId,
          amount: response.order.amount,
          currency: 'INR',
          name: settings?.organizationName || 'Raju Kshatriya Mahila Sangha',
          description: 'Donation for Women Empowerment',
          order_id: response.order.id,
          handler: async function (razorpayResponse: any) {
            await verifyAndCreateDonation({
              ...razorpayResponse,
              amount,
              name: donorName,
              email: donorEmail,
            });
          },
          prefill: {
            name: donorName,
            email: donorEmail,
            contact: donorPhone,
          },
          theme: {
            color: '#EA580C',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        toast.error(response.message || 'Failed to create donation order');
      }
    } catch (error) {
      console.error('Donation error:', error);
      toast.error('Donation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndCreateDonation = async (paymentData: any) => {
    try {
      const response = await donationApi.verifyPayment({
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        amount: paymentData.amount,
        name: paymentData.name,
        email: paymentData.email,
      });

      if (response.success) {
        setShowReceipt(true);
        toast.success('Thank you for your generous donation!');
      } else {
        toast.error(response.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Payment verification failed. Please contact support.');
    }
  };

  if (showReceipt) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
            <p className="text-xl text-gray-700 mb-6">
              Your generous donation of ₹{selectedAmount || customAmount} has been received.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">Donation Details</h3>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-medium">Name:</span> {donorName}</p>
                <p><span className="font-medium">Email:</span> {donorEmail}</p>
                <p><span className="font-medium">Amount:</span> ₹{selectedAmount || customAmount}</p>
                <p><span className="font-medium">Date:</span> {new Date().toLocaleDateString()}</p>
                <p><span className="font-medium">Transaction ID:</span> TXN{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              A receipt has been sent to your email address. Your contribution will help us continue our mission to empower women and strengthen communities.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-[#E5C100] text-[#0A6C87] px-8 py-3 rounded-lg font-semibold hover:bg-[#CCA900] transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#0A6C87] to-cyan-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Support Our Mission</h1>
          <p className="text-xl max-w-3xl mx-auto text-cyan-50">
            Your donation helps us empower women and build stronger communities
          </p>
        </div>
      </section>

      {/* Main Donation Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Impact Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Impact</h2>
            <div className="space-y-4">
              {[
                { amount: '₹500', impact: 'Provides study materials for 5 women' },
                { amount: '₹1,000', impact: 'Sponsors skill training for 2 women' },
                { amount: '₹2,500', impact: 'Supports a complete workshop' },
                { amount: '₹5,000', impact: 'Funds a month-long training program' },
                { amount: '₹10,000', impact: 'Sponsors education for 10 women' },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 bg-cyan-50 p-4 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-cyan-700">{item.amount}</p>
                    <p className="text-gray-700">{item.impact}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Security Badge */}
            <div className="mt-8 bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">Secure Donation</h3>
              </div>
              <p className="text-sm text-gray-600">
                All donations are processed securely through Razorpay. Your information is protected with industry-standard encryption.
              </p>
            </div>
          </div>

          {/* Donation Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Make a Donation</h2>

            {/* Amount Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-3">Select Amount</label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {predefinedAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount(amount.toString());
                    }}
                    className={`py-3 rounded-lg font-semibold transition-colors ${
                      selectedAmount === amount
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ₹{amount.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  placeholder="Enter custom amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Donor Information */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Email Address *</label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Donate Button */}
            <button
              onClick={handleDonate}
              className="w-full bg-[#E5C100] text-[#0A6C87] py-4 rounded-lg font-semibold hover:bg-[#CCA900] transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Proceed to Payment
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              By donating, you agree to our terms and privacy policy. Tax exemption certificate available on request.
            </p>
          </div>
        </div>
      </section>

      {/* Why Donate Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Your Donation Matters</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Education & Training',
                description: '70% of donations fund educational programs and skill development courses',
              },
              {
                title: 'Community Support',
                description: '20% supports welfare programs and community development initiatives',
              },
              {
                title: 'Cultural Programs',
                description: '10% preserves our cultural heritage through events and activities',
              },
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}