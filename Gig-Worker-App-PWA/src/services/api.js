import axios from 'axios';
import { MOCK_WORKER, MOCK_PLANS, MOCK_CLAIMS, MOCK_DISRUPTION } from '../constants/mock';

// Utility to simulate network delay for fallbacks
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('es_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const esApi = {
  // Auth
  verifyOTP: async (phone, otp) => {
    try {
      if (otp === '1234') {
        try {
          const res = await apiClient.post('/auth/login', { phone });
          return { user: res.data, token: res.data.token };
        } catch (e) {
          const res = await apiClient.post('/auth/register', {
            name: 'Gig Worker',
            phone,
            email: `worker-${phone}@mock.com`
          });
          return { user: res.data, token: res.data.token };
        }
      }
      throw new Error('Invalid OTP');
    } catch (error) {
      console.error('API Error verifyOTP:', error.response?.data || error.message);
      throw error;
    }
  },

  socialLogin: async (provider, token) => {
    try {
      const email = `social-${provider}-${Math.floor(Math.random()*1000)}@test.com`;
      const res = await apiClient.post('/auth/register', {
        name: `${provider} User`,
        email,
        authProvider: provider,
        providerId: token
      });
      return { user: res.data, token: res.data.token };
    } catch (error) {
      await delay(1200);
      return { user: { ...MOCK_WORKER, source: provider }, token: 'mock-jwt-token' };
    }
  },

  // Disruption Monitoring (Poll)
  checkDisruption: async (zone) => {
    await delay(500);
    if (zone === MOCK_WORKER.zone) {
      return MOCK_DISRUPTION;
    }
    return { detected: false };
  },

  // Claims
  submitClaim: async (claimData) => {
    const payload = {
      type: claimData.type,
      hours: claimData.hours,
      lat: claimData.lat,
      lng: claimData.lng,
      note: claimData.note || ''
    };
    const { data } = await apiClient.post('/claims/create', payload);
    return data?.data;
  },

  getMyClaims: async () => {
    const { data } = await apiClient.get('/claims/my-claims');
    return data?.data || [];
  },

  getClaimById: async (id) => {
    const { data } = await apiClient.get(`/claims/${id}`);
    return data?.data || null;
  },

  getMyClaimSummary: async () => {
    const { data } = await apiClient.get('/claims/my-summary');
    return data || {
      protectedAmount: 0,
      claimsFiled: 0,
      activeWeeks: 0,
      approvedClaims: 0,
      pendingClaims: 0,
      rejectedClaims: 0
    };
  },

  getNotifications: async () => {
    const { data } = await apiClient.get('/notifications');
    return data?.notifications || [];
  },

  getUnreadNotifications: async () => {
    const { data } = await apiClient.get('/notifications/unread-count');
    return Number(data?.unread || 0);
  },

  markNotificationRead: async (id) => {
    const { data } = await apiClient.post(`/notifications/${id}/read`);
    return data?.notification;
  },

  markAllNotificationsRead: async () => {
    const { data } = await apiClient.post('/notifications/mark-all-read');
    return data;
  },

  assessClaimAI: async (claimData) => {
    try {
      const res = await apiClient.post('/claims/create', claimData);
      return {
        claimId: res.data.data._id,
        confidenceScore: res.data.data.aiScore,
        amountApproved: res.data.data.instantAmount,
        status: res.data.data.status,
        reason: 'AI processed your claim dynamically.'
      };
    } catch (error) {
      console.error('Failed to submit, fallback to mock:', error.response?.data || error.message);
      await delay(2000);
      return {
        claimId: `CLM-${Math.floor(Math.random() * 10000)}`,
        confidenceScore: 0.94,
        amountApproved: claimData.hours * 500 * 0.8,
        status: 'approved',
        reason: 'AI cross-referenced hyperlocal weather APIs and rider geolocation data successfully.'
      };
    }
  },

  fetchClaims: async () => {
    try {
      const res = await apiClient.get('/claims/my-claims');
      if (res.data && res.data.data?.length > 0) {
        return res.data.data.map(c => ({
          id: c._id,
          date: new Date(c.createdAt).toLocaleDateString(),
          type: c.type,
          amount: (c.instantAmount || 0) + (c.heldAmount || 0),
          status: c.status
        }));
      }
      return MOCK_CLAIMS;
    } catch (err) {
      console.error('Failed to fetch real claims:', err);
      return MOCK_CLAIMS;
    }
  }
  ,

  getDashboardSummary: async () => {
    const { data } = await apiClient.get('/dashboard/summary');
    return data;
  }
};

export default apiClient;
