import axios from 'axios';
import type { User, ApiKey, CreditTransaction, Agreement, DashboardStats } from '@/types';
import { useRouter } from 'next/router';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const router = useRouter();

apiClient.interceptors.request.use((config) => {
  //TODO: httpOnly cookie instead
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export const userApi = {
  getCurrentUser: (): Promise<User> =>
    apiClient.get('/users/me').then(res => res.data),
  updateUser: (data: Partial<User>): Promise<User> =>
    apiClient.put('/users/me', data).then(res => res.data),
};

export const apiKeyApi = {
  getApiKeys: (): Promise<ApiKey[]> =>
    apiClient.get('/api-keys').then(res => res.data),
  createApiKey: (name: string): Promise<ApiKey> =>
    apiClient.post('/api-keys', { name }).then(res => res.data),
  revokeApiKey: (id: string): Promise<void> =>
    apiClient.put(`/api-keys/${id}/revoke`).then(res => res.data),
  getUsage: (id: string): Promise<unknown> =>
    apiClient.get(`/api-keys/${id}/usage`).then(res => res.data),
};

export const creditApi = {
  getTransactions: (): Promise<CreditTransaction[]> =>
    apiClient.get('/credits/transactions').then(res => res.data),
  purchaseCredits: (amount: number): Promise<CreditTransaction> =>
    apiClient.post('/credits/purchase', { amount }).then(res => res.data),
};

export const agreementApi = {
  getAgreements: (): Promise<Agreement[]> =>
    apiClient.get('/agreements').then(res => res.data),
  createAgreement: (data: Partial<Agreement>): Promise<Agreement> =>
    apiClient.post('/agreements', data).then(res => res.data),
};

export const dashboardApi = {
  getStats: (): Promise<DashboardStats> =>
    apiClient.get('/dashboard/stats').then(res => res.data),
};

export default apiClient;