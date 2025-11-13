import axios from 'axios';

interface LoginDto {
  username: string;
  password: string;
}

interface RegisterDto {
  username: string;
  email: string;
  passwordHash: string;
  role: number;
}

export interface Media {
  mediaId: number;
  title: string;
  mediaType: number;
  url: string;
  durationInMinutes: number;
  genre?: number;
  releaseDate: string;
  composer?: string;
  album?: string;
  description?: string;
  creatorId?: number;
}

const API_BASE_URL = 'https://localhost:7192/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config.url !== '/auth/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('subscriptionPlan');
      localStorage.removeItem('currentPlanId');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: LoginDto) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData: RegisterDto) => {
    const payload = {
      Username: userData.username,
      Email: userData.email,
      PasswordHash: userData.passwordHash,
      Role: userData.role
    };
    const response = await api.post('/auth/register', payload);
    return response.data;
  }
};

export const mediaService = {
  getAll: async (): Promise<Media[]> => {
    const response = await api.get('/media');
    return response.data;
  },
  
  getById: async (id: number): Promise<Media> => {
    const response = await api.get(`/media/${id}`);
    return response.data;
  },
  
  upload: async (formData: FormData) => {
    const response = await api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  getMyUploads: async (): Promise<Media[]> => {
    const response = await api.get('/media/myuploads');
    return response.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/media/${id}`);
  },

  update: async (id: number, data: Partial<Media>) => {
    const response = await api.put(`/media/${id}`, data);
    return response.data;
  }
};

export default api;