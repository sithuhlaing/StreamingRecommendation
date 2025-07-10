// src/services/api.ts
import axios from 'axios';
import { Campaign, Advertiser, CampaignPerformance } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const campaignAPI = {
  getCampaigns: async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
    advertiser_id?: string;
  }) => {
    const response = await apiClient.get('/api/v1/campaigns', { params });
    return response.data;
  },

  getCampaign: async (id: string): Promise<Campaign> => {
    const response = await apiClient.get(`/api/v1/campaigns/${id}`);
    return response.data;
  },

  createCampaign: async (campaign: Partial<Campaign>): Promise<Campaign> => {
    const response = await apiClient.post('/api/v1/campaigns', campaign);
    return response.data;
  },

  updateCampaignStatus: async (id: string, status: string) => {
    const response = await apiClient.put(`/api/v1/campaigns/${id}/status`, { status });
    return response.data;
  },

  getCampaignPerformance: async (
    id: string,
    startDate?: string,
    endDate?: string
  ): Promise<CampaignPerformance> => {
    const params = { start_date: startDate, end_date: endDate };
    const response = await apiClient.get(`/api/v1/campaigns/${id}/performance`, { params });
    return response.data;
  },
};

export const advertiserAPI = {
  getAdvertisers: async (): Promise<Advertiser[]> => {
    const response = await apiClient.get('/api/v1/advertisers');
    return response.data;
  },

  getAdvertiser: async (id: string): Promise<Advertiser> => {
    const response = await apiClient.get(`/api/v1/advertisers/${id}`);
    return response.data;
  },
};