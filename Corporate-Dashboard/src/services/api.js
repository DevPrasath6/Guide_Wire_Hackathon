import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach Authorization Bearer token from sessionStorage
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: on 401 redirect to /login, on 500 show error toast
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
    } else if (error.response?.status === 500) {
      // In a real app, this would trigger a toast notification (e.g., react-hot-toast)
      console.error('Server Error (500): Something went wrong.');
    }
    return Promise.reject(error);
  }
);

export const login = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

export const getProfile = async () => {
  const response = await apiClient.get('/auth/profile');
  return response.data;
};

export const scoreClaim = async (claimData) => {
  const response = await apiClient.post('/claims/create', claimData);
  return response.data;
};

export const triggerCheck = async (zone, timestamp) => {
  const response = await apiClient.get('/dashboard/status', { params: { zone, timestamp } });
  return response.data;
};

export const getClaims = async (filters = {}) => {
  const response = await apiClient.get('/dashboard/live-claims', { params: filters });
  return response.data;
};

export const updateClaim = async (claimId, update) => {
  const response = await apiClient.patch(`/dashboard/claims/${claimId}/status`, update);
  return response.data;
};

export const getCircuitBreakerStatus = async () => {
  const response = await apiClient.get('/dashboard/status');
  return response.data;
};

export const getPolicies = async (filters = {}) => {
  const response = await apiClient.get('/dashboard/policies', { params: filters });
  return response.data;
};

export const updatePolicy = async (policyId, update) => {
  const response = await apiClient.patch(`/dashboard/policies/${policyId}`, update);
  return response.data;
};

export const triggerPayout = async (claimId, claimAmount) => {
  const response = await apiClient.patch(`/dashboard/claims/${claimId}/status`, {
    status: 'approved',
    reason: 'Instant payout triggered by operator',
    instantAmount: claimAmount || 0,
    heldAmount: 0
  });
  return response.data;
};

export const getAnalytics = async (dateRange) => {
  const response = await apiClient.get('/dashboard/analytics', { params: { range: dateRange } });
  return response.data;
};

export const getDashboardSummary = async () => {
  const response = await apiClient.get('/dashboard/summary');
  return response.data;
};

export const getNotifications = async () => {
  const response = await apiClient.get('/notifications');
  return response.data;
};

export const getUnreadNotificationCount = async () => {
  const response = await apiClient.get('/notifications/unread-count');
  return response.data;
};

export const getEmployees = async () => {
  const response = await apiClient.get('/iam/users');
  return response.data;
};

export const createEmployee = async (payload) => {
  const response = await apiClient.post('/iam/users', payload);
  return response.data;
};

export const updateEmployee = async (id, payload) => {
  const response = await apiClient.patch(`/iam/users/${id}`, payload);
  return response.data;
};

export const getUserGroups = async () => {
  const response = await apiClient.get('/iam/groups');
  return response.data;
};

export const createUserGroup = async (payload) => {
  const response = await apiClient.post('/iam/groups', payload);
  return response.data;
};

export const updateUserGroup = async (id, payload) => {
  const response = await apiClient.patch(`/iam/groups/${id}`, payload);
  return response.data;
};

export const deleteUserGroup = async (id) => {
  const response = await apiClient.delete(`/iam/groups/${id}`);
  return response.data;
};

export const getAccessPolicies = async () => {
  const response = await apiClient.get('/iam/policies');
  return response.data;
};

export const createAccessPolicy = async (payload) => {
  const response = await apiClient.post('/iam/policies', payload);
  return response.data;
};

export const updateAccessPolicy = async (id, payload) => {
  const response = await apiClient.patch(`/iam/policies/${id}`, payload);
  return response.data;
};

export const deleteAccessPolicy = async (id) => {
  const response = await apiClient.delete(`/iam/policies/${id}`);
  return response.data;
};

export const flagClaimFraud = async (claimId, reason) => {
  const response = await apiClient.patch(`/dashboard/claims/${claimId}/status`, {
    status: 'rejected',
    reason: reason || 'Flagged as fraud by operator',
    fraudFlag: true,
    fraudReason: reason || 'Manual fraud review'
  });
  return response.data;
};

export const getAuditLogs = async () => {
  const response = await apiClient.get('/iam/audit-logs');
  return response.data;
};

export const getAdminTickets = async () => {
  const response = await apiClient.get('/chat/admin/tickets');
  return response.data;
};

export const closeAdminTicket = async (ticketId) => {
  const response = await apiClient.post(`/chat/admin/tickets/${ticketId}/close`);
  return response.data;
};

export const reopenAdminTicket = async (ticketId) => {
  const response = await apiClient.post(`/chat/admin/tickets/${ticketId}/reopen`);
  return response.data;
};

export const sendAdminTicketMessage = async (ticketId, message) => {
  const response = await apiClient.post(`/chat/admin/tickets/${ticketId}/message`, { message });
  return response.data;
};

export const getAiHealth = async () => {
  const response = await apiClient.get('/ai/health');
  return response.data;
};

export const getAiSystemStatus = async () => {
  const response = await apiClient.get('/ai/system-status');
  return response.data;
};

export const getAiPrediction = async (payload) => {
  const response = await apiClient.post('/ai/predict', payload);
  return response.data;
};

export const getAiDataQuality = async (payload) => {
  const response = await apiClient.post('/ai/data-quality', payload);
  return response.data;
};

export const getAiHallucinationCheck = async (payload) => {
  const response = await apiClient.post('/ai/hallucination-check', payload);
  return response.data;
};

export const getAiConfidence = async (claimId) => {
  const response = await apiClient.get(`/ai/confidence/${claimId}`);
  return response.data;
};

export default apiClient;