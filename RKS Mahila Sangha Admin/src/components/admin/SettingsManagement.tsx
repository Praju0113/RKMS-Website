import { useState, useEffect } from 'react';
import { Settings, CreditCard, Mail, DollarSign, Building } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../services/api';
import { AdminLayout } from './AdminLayout';

interface SettingsData {
  membershipFee: number;
  donationSuggestions: number[];
  contactEmail: string;
  organizationName: string;
  defaultEventPrice: number;
  razorpayKeyId: string;
  emailUser: string;
}

export function SettingsManagement() {
  const [settings, setSettings] = useState<SettingsData>({
    membershipFee: 1001,
    donationSuggestions: [500, 1000, 2500, 5000, 10000],
    contactEmail: 'info@rksmahilavedike.org',
    organizationName: 'Raju Kshatriya Mahila Sangha',
    defaultEventPrice: 0,
    razorpayKeyId: '',
    emailUser: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          toast.error('Admin token not found');
          return;
        }

        const response = await adminApi.getSettings(token);
        if (response.success && response.settings) {
          setSettings(response.settings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'membershipFee' || name === 'defaultEventPrice' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleDonationSuggestionChange = (index: number, value: string) => {
    const newSuggestions = [...settings.donationSuggestions];
    newSuggestions[index] = parseFloat(value) || 0;
    setSettings(prev => ({
      ...prev,
      donationSuggestions: newSuggestions
    }));
  };

  const addDonationSuggestion = () => {
    setSettings(prev => ({
      ...prev,
      donationSuggestions: [...prev.donationSuggestions, 0]
    }));
  };

  const removeDonationSuggestion = (index: number) => {
    if (settings.donationSuggestions.length > 1) {
      const newSuggestions = settings.donationSuggestions.filter((_, i) => i !== index);
      setSettings(prev => ({
        ...prev,
        donationSuggestions: newSuggestions
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Admin token not found');
        return;
      }

      const response = await adminApi.updateSettings(token, settings);
      if (response.success) {
        toast.success('Settings saved successfully!');
      } else {
        toast.error(response.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Global Settings
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Organization Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Organization
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                name="organizationName"
                value={settings.organizationName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Payment Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Configuration
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Membership Fee (₹)
              </label>
              <input
                type="number"
                name="membershipFee"
                value={settings.membershipFee}
                onChange={handleInputChange}
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Event Price (₹)
              </label>
              <input
                type="number"
                name="defaultEventPrice"
                value={settings.defaultEventPrice}
                onChange={handleInputChange}
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Donation Suggestions */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Donation Suggestions (₹)
          </h3>
          <div className="space-y-2">
            {settings.donationSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="number"
                  value={suggestion}
                  onChange={(e) => handleDonationSuggestionChange(index, e.target.value)}
                  min="0"
                  step="1"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <button
                  onClick={() => removeDonationSuggestion(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  disabled={settings.donationSuggestions.length <= 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addDonationSuggestion}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Add Suggestion
            </button>
          </div>
        </div>

        {/* API Configuration */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            API Configuration
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razorpay Key ID
              </label>
              <input
                type="text"
                name="razorpayKeyId"
                value={settings.razorpayKeyId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email User
              </label>
              <input
                type="email"
                name="emailUser"
                value={settings.emailUser}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
}
