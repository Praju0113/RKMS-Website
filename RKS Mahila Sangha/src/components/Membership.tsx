import { UserPlus, CreditCard, CheckCircle, Download, Shield, IdCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { settingsApi, membershipApi } from '../services/api';
import logo from '../assets/RKMS Logo.png';

interface MembershipData {
  memberId: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  registrationDate: string;
}

interface Settings {
  membershipFee: number;
  organizationName: string;
}

export function Membership() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    guardianName: '',
    gotraName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    educationalQualification: '',
    profession: '',
    maritalStatus: '',
    bloodGroup: '',
    photo: null as File | null,
    address: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
    aadharNumber: '',
  });

  const [showMembershipCard, setShowMembershipCard] = useState(false);
  const [membershipData, setMembershipData] = useState<MembershipData | null>(null);
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
          membershipFee: 1001,
          organizationName: 'Raju Kshatriya Mahila Sangha'
        });
      }
    };

    fetchSettings();
  }, []);

  // Generate unique membership ID
  const generateMembershipId = (): string => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `RKSM${timestamp}${random}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        photo: e.target.files[0],
      });
    }
  };

  const validateForm = (): boolean => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.dateOfBirth) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
      toast.error('Please complete your address details');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await proceedWithPayment();
  };

  const proceedWithPayment = async () => {
    if (!settings) {
      toast.error('Settings not loaded. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      // Create order with backend
      const response = await membershipApi.createOrder({
        name: formData.fullName,
        guardianName: formData.guardianName,
        gotraName: formData.gotraName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        educationalQualification: formData.educationalQualification,
        profession: formData.profession,
        maritalStatus: formData.maritalStatus,
        bloodGroup: formData.bloodGroup,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        aadharNumber: formData.aadharNumber || undefined,
      });

      const validationErrors = (response as any).errors as Array<{ msg?: string }> | undefined;
      if (validationErrors?.length) {
        toast.error(validationErrors[0].msg || 'Please check the membership form');
        return;
      }

      if ((response as any).message && !response.success) {
        toast.error((response as any).message);
        return;
      }

      if (response.success && response.order && response.razorpayKeyId) {
        const isSimulated = response.razorpayKeyId === 'SIMULATED_KEY' || !(window as any).Razorpay;

        if (isSimulated) {
          await verifyAndCreateMembership({
            razorpay_order_id: response.order.id || `SIM_ORDER_${Date.now()}`,
            razorpay_payment_id: `SIM_PAY_${Date.now()}`,
            razorpay_signature: 'SIMULATED_SIGNATURE',
            ...formData
          });
          return;
        }

        // Skip payment if amount is 0
        if (response.amount === 0) {
          // Directly create membership without payment
          await verifyAndCreateMembership({
            razorpay_order_id: 'free_order',
            razorpay_payment_id: 'free_payment',
            razorpay_signature: 'free_signature',
            ...formData
          });
          return;
        }

        // Initialize Razorpay (only when live gateway is configured)
        const options = {
          key: response.razorpayKeyId,
          amount: response.order.amount,
          currency: 'INR',
          name: settings.organizationName,
          description: 'Membership Registration Fee',
          image: logo,
          order_id: response.order.id,
          handler: async function (razorpayResponse: any) {
            await verifyAndCreateMembership({
              ...razorpayResponse,
              ...formData
            });
          },
          prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#EA580C',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        toast.error(response.message || 'Failed to create payment order');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndCreateMembership = async (paymentData: any) => {
    try {
      const response = await membershipApi.verifyPayment({
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        name: formData.fullName,
        guardianName: formData.guardianName,
        gotraName: formData.gotraName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        educationalQualification: formData.educationalQualification,
        profession: formData.profession,
        maritalStatus: formData.maritalStatus,
        bloodGroup: formData.bloodGroup,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        aadharNumber: formData.aadharNumber,
        photo: formData.photo || undefined,
      });

      if (response.success && response.membership_id) {
        const memberData: MembershipData = {
          memberId: response.membership_id,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          registrationDate: new Date().toISOString().split('T')[0],
        };

        setMembershipData(memberData);
        setShowMembershipCard(true);
        toast.success('Membership registration successful!');
      } else {
        toast.error(response.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Payment verification failed. Please contact support.');
    }
  };

  const downloadMembershipCard = () => {
    toast.success('Membership card download initiated. In production, this would generate a PDF.');
  };

  if (showMembershipCard && membershipData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Message */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Raju Kshatriya Mahila Sangha!</h2>
            <p className="text-xl text-gray-700 mb-2">
              Your membership has been successfully registered.
            </p>
            <p className="text-lg text-orange-600 font-semibold">
              Membership ID: {membershipData.memberId}
            </p>
          </div>

          {/* Membership Card */}
          <div className="bg-gradient-to-br from-[#0A6C87] via-cyan-600 to-[#0A6C87] rounded-2xl shadow-2xl overflow-hidden mb-8">
            <div className="p-8 text-white">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-8">
                <img src={logo} alt="RKS Logo" className="w-20 h-20 bg-white rounded-full p-2" />
                <div className="text-right">
                  <h3 className="text-2xl font-bold">Raju Kshatriya Mahila Sangha</h3>
                  <p className="text-cyan-100">Membership Card</p>
                </div>
              </div>

              {/* Member Details */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-cyan-100 text-sm mb-1">Member Name</p>
                    <p className="text-xl font-bold">{membershipData.fullName}</p>
                  </div>
                  <div>
                    <p className="text-cyan-100 text-sm mb-1">Membership ID</p>
                    <p className="text-xl font-bold">{membershipData.memberId}</p>
                  </div>
                  <div>
                    <p className="text-cyan-100 text-sm mb-1">Date of Birth</p>
                    <p className="font-semibold">{new Date(membershipData.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-cyan-100 text-sm mb-1">Registration Date</p>
                    <p className="font-semibold">{new Date(membershipData.registrationDate).toLocaleDateString()}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-cyan-100 text-sm mb-1">Contact</p>
                    <p className="font-semibold">{membershipData.phone} | {membershipData.email}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-cyan-100 text-sm mb-1">Address</p>
                    <p className="font-semibold">
                      {membershipData.address}, {membershipData.city}, {membershipData.state} - {membershipData.pincode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">Valid for Life</span>
                </div>
                <div className="text-sm">Est. 2022</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={downloadMembershipCard}
              className="bg-[#E5C100] text-[#0A6C87] px-8 py-3 rounded-lg font-semibold hover:bg-[#CCA900] transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Membership Card
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Return to Home
            </button>
          </div>

          {/* Important Note */}
          <div className="mt-8 bg-cyan-50 border border-cyan-200 rounded-lg p-6">
            <h3 className="font-semibold text-[#0A6C87] mb-2">Important Information</h3>
            <ul className="text-sm text-[#0A6C87] space-y-2">
              <li>• Your membership ID is unique and should be kept safe for all future interactions</li>
              <li>• A confirmation email with membership details has been sent to {membershipData.email}</li>
              <li>• Please bring your membership card to all RKS events and programs</li>
              <li>• For any queries, contact us at info@rksmahilavedike.org</li>
            </ul>
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
          <IdCard className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Become a Member</h1>
          <p className="text-xl max-w-3xl mx-auto text-cyan-50">
            Join the Raju Kshatriya Mahila Sangha family and be part of our mission to empower women
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Membership Benefits</h2>
          <p className="text-xl text-gray-600">
            Exclusive privileges and opportunities for all members
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: UserPlus,
              title: 'Community Access',
              description: 'Join a supportive network of women dedicated to empowerment and growth',
            },
            {
              icon: CheckCircle,
              title: 'Event Priority',
              description: 'Get priority registration and discounts for all workshops and events',
            },
            {
              icon: Shield,
              title: 'Lifetime Membership',
              description: 'One-time fee of ₹1,001 for lifetime membership with all benefits',
            },
          ].map((benefit, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Registration Form */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Membership Registration</h2>
            <p className="text-gray-600">
              Fill in your details to register for membership
            </p>
            <div className="inline-block bg-amber-50 border border-amber-200 rounded-lg px-6 py-3 mt-4">
              <p className="text-amber-700 font-semibold">
                Registration Fee: ₹{settings?.membershipFee || 1001}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Father's/Husband's/Guardian's Name *
                  </label>
                  <input
                    type="text"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleInputChange}
                    placeholder="Enter guardian's name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Gotra/Family Name *
                  </label>
                  <input
                    type="text"
                    name="gotraName"
                    value={formData.gotraName}
                    onChange={handleInputChange}
                    placeholder="Enter gotra/family name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Educational Qualification *
                  </label>
                  <select
                    name="educationalQualification"
                    value={formData.educationalQualification}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select qualification</option>
                    <option value="No Schooling">No Schooling</option>
                    <option value="Not completed 10th Std / SSLC">Not completed 10th Std / SSLC</option>
                    <option value="Not completed 12th Std / II PUC">Not completed 12th Std / II PUC</option>
                    <option value="Graduate (Bachelor's)">Graduate (Bachelor's)</option>
                    <option value="Post Graduate (Master's)">Post Graduate (Master's)</option>
                    <option value="Any Other">Any Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Profession *
                  </label>
                  <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleInputChange}
                    placeholder="Enter your profession"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Marital Status *
                  </label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Blood Group *
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">
                    Upload Passport Size Photo *
                  </label>
                  <input
                    type="file"
                    name="photo"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-50 file:text-cyan-600 hover:file:bg-cyan-100"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">Please upload a recent passport size photograph (JPG, PNG)</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">
                    Aadhar Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleInputChange}
                    placeholder="XXXX XXXX XXXX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Address Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your complete address"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      State *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                    >
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="560001"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I confirm that I belong to the Raju Kshatriya community and agree to the terms and conditions \n                  of Raju Kshatriya Mahila Sangha. I understand that the membership fee of ₹1,001 is non-refundable and \n                  provides lifetime membership benefits.
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#E5C100] text-[#0A6C87] py-4 rounded-lg font-semibold hover:bg-[#CCA900] transition-colors flex items-center justify-center gap-2 text-lg"
            >
              <CreditCard className="w-6 h-6" />
              Proceed to Payment - ₹{settings?.membershipFee || 1001}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Secure payment powered by Razorpay. Your information is encrypted and protected.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}