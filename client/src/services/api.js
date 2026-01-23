import axios from 'axios';
import { supabase } from '../config/supabase';

const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5002/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    // If Supabase is not configured, continue without auth token
    console.warn('Failed to get session:', error.message);
  }
  return config;
});

export const shortenUrl = async (originalUrl, customAlias = null, expiresInDays = null) => {
  const response = await api.post('/url/shorten', {
    originalUrl,
    customAlias,
    expiresInDays,
  });
  return response.data;
};

export const getUrlInfo = async (shortCode) => {
  const response = await api.get(`/url/${shortCode}/info`);
  return response.data;
};

export const getAnalytics = async (shortCode) => {
  const response = await api.get(`/analytics/${shortCode}`);
  return response.data;
};

export const getDashboardAnalytics = async () => {
  const response = await api.get('/analytics/dashboard');
  return response.data;
};

export const getQRCodeUrl = (shortCode) => {
  // In production, use relative URLs; in development, use full URL
  if (process.env.NODE_ENV === 'production') {
    return `/api/url/${shortCode}/qr`;
  }
  const baseUrl = API_BASE_URL.replace('/api', '') || 'http://localhost:5002';
  return `${baseUrl}/api/url/${shortCode}/qr`;
};

export const deleteUrl = async (shortCode) => {
  const response = await api.delete(`/url/${shortCode}`);
  return response.data;
};

export const downloadQRCode = async (shortCode) => {
  // In production, use relative URLs; in development, use full URL
  const qrUrl = process.env.NODE_ENV === 'production' 
    ? `/api/url/${shortCode}/qr`
    : `${API_BASE_URL.replace('/api', '') || 'http://localhost:5002'}/api/url/${shortCode}/qr`;
  
  try {
    const response = await fetch(qrUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-code-${shortCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Failed to download QR code:', error);
    throw error;
  }
};

export default api;
