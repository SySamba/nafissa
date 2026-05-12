import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('nafissa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = typeof error.config?.url === 'string' ? error.config.url : '';

    /** 401 sur connexion/inscription ≠ session expirée : ne pas vider ni recharger la page */
    const isAuthPublic =
      url.includes('/auth/login') ||
      url.includes('/auth/register');

    if (status === 401 && !isAuthPublic) {
      localStorage.removeItem('nafissa_token');
      localStorage.removeItem('nafissa_user');
      const path = window.location.pathname || '';
      if (!path.includes('/login') && !path.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
