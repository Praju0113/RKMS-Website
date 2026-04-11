const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getApiOrigin = (): string => API_BASE_URL.replace(/\/api\/?$/, '');

export const resolveBackendAssetUrl = (url?: string | null): string => {
  if (!url) return '';
  const u = String(url).trim();
  if (!u) return '';
  if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('blob:')) return u;
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
  token?: string;
  admin?: { id: string; username: string };
  registrations?: T[];
}

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

  getEvents: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json() as Promise<ApiResponse<any>>;
  },

  createEvent: async (token: string, payload: FormData) => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: payload,
    });
    return response.json() as Promise<ApiResponse<any>>;
  },

  updateEvent: async (token: string, id: number, payload: FormData) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: payload,
    });
    return response.json() as Promise<ApiResponse<any>>;
  },

  deleteEvent: async (token: string, id: number) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json() as Promise<ApiResponse<any>>;
  },

  getEventRegistrations: async (token: string, eventId?: number) => {
    const query = eventId ? `?eventId=${eventId}` : '';
    const response = await fetch(`${API_BASE_URL}/admin/event-registrations${query}`, {
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
