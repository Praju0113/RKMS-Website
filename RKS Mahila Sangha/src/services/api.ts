const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/** API host only (no `/api`), for static files like `/uploads/...` */
export const getApiOrigin = (): string => API_BASE_URL.replace(/\/api\/?$/, '');

/** Turn stored DB paths into full URLs when needed */
export const resolveBackendAssetUrl = (url?: string | null): string => {
  if (!url) return '';
  const u = String(url).trim();
  if (!u) return '';
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  return u.startsWith('/') ? `${getApiOrigin()}${u}` : `${getApiOrigin()}/${u}`;
};

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  settings?: T;
  member?: T;
  payment?: T;
  order?: any;
  razorpayKeyId?: string;
  amount?: number;
  memberData?: any;
  donorData?: any;
  events?: T[];
  members?: T[];
  payments?: T[];
  stats?: any;
  recentMembers?: any[];
  recentPayments?: any[];
  pagination?: any;
  membership_id?: string;
}

// Settings API
export const settingsApi = {
  getPublicSettings: async () => {
    const response = await fetch(`${API_BASE_URL}/settings/public`);
    return response.json() as Promise<ApiResponse<{
      membershipFee: number;
      donationSuggestions: number[];
      contactEmail: string;
      organizationName: string;
    }>>;
  },
};

// Membership API
export const membershipApi = {
  createOrder: async (memberData: {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    aadharNumber?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/membership/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    });
    return response.json() as Promise<ApiResponse<any>>;
  },

  verifyPayment: async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    aadharNumber?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/membership/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    return response.json() as Promise<ApiResponse<any>>;
  },
};

// Donation API
export const donationApi = {
  createOrder: async (donorData: {
    amount: number;
    name: string;
    email: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/donation/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(donorData),
    });
    return response.json() as Promise<ApiResponse<any>>;
  },

  verifyPayment: async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    amount: number;
    name: string;
    email: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/donation/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    return response.json() as Promise<ApiResponse<any>>;
  },
};

// Events API
export const eventsApi = {
  getEvents: async () => {
    const response = await fetch(`${API_BASE_URL}/events`);
    return response.json() as Promise<ApiResponse<any[]>>;
  },
  registerEvent: async (eventId: number, payload: {
    name: string;
    email: string;
    membershipId?: string;
    paymentStatus?: 'pending' | 'completed' | 'failed';
    paymentAmount?: number;
    paymentId?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response.json() as Promise<ApiResponse<any>>;
  },
};

// Contact API
export const contactApi = {
  submitContact: async (contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });
    return response.json() as Promise<ApiResponse<any>>;
  },
};

// Admin API
export const adminApi = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return response.json() as Promise<ApiResponse<{
      token: string;
      admin: { id: string; username: string };
    }>>;
  },

  getDashboard: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json() as Promise<ApiResponse<any>>;
  },

  getMembers: async (token: string, page = 1, limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/admin/members?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json() as Promise<ApiResponse<any>>;
  },

  getPayments: async (token: string, page = 1, limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/admin/payments?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json() as Promise<ApiResponse<any>>;
  },

  getSettings: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json() as Promise<ApiResponse<any>>;
  },

  updateSettings: async (token: string, settings: any) => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });
    return response.json() as Promise<ApiResponse<any>>;
  },
};
