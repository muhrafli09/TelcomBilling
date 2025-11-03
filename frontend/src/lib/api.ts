import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const customerApi = {
  login: (accountCode: string, password: string) =>
    api.post('/customer/login', { account_code: accountCode, password }),
  
  getDashboard: () => api.get('/customer/dashboard'),
  
  getBilling: (days?: number) => 
    api.get('/customer/billing', { params: { days } }),
  
  getActiveCalls: () => api.get('/customer/active-calls'),
};

export default api;