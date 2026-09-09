import apiClient from './client';

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  }),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
};

export const serviceAPI = {
  list: (params) => apiClient.get('/services', { params }),
  show: (id) => apiClient.get(`/services/${id}`),
  categoryProviders: (id) => apiClient.get(`/services/${id}/category-providers`),
  create: (data) => apiClient.post('/services', data),
  update: (id, data) => apiClient.put(`/services/${id}`, data),
  remove: (id) => apiClient.delete(`/services/${id}`),
  mine: () => apiClient.get('/my-services'),
};

export const categoryAPI = {
  list: () => apiClient.get('/categories'),
};

/** Stats publiques (vivier prestataires / offres) pour le tableau de bord cliente */
export const marketAPI = {
  summary: () => apiClient.get('/market/summary'),
};

export const bookingAPI = {
  list: (params) => apiClient.get('/bookings', { params }),
  show: (id) => apiClient.get(`/bookings/${id}`),
  create: (data) => apiClient.post('/bookings', data),
  updateStatus: (id, status) => apiClient.patch(`/bookings/${id}/status`, { status }),
  rate: (id, data) => apiClient.post(`/bookings/${id}/rate`, data),
  dispute: (id, data) => apiClient.post(`/bookings/${id}/dispute`, data),
};

export const paymentAPI = {
  create: (data) => apiClient.post('/payments', data),
  release: (id) => apiClient.patch(`/payments/${id}/release`),
  history: (params) => apiClient.get('/payments/history', { params }),
};

export const notificationAPI = {
  list: (params) => apiClient.get('/notifications', { params }),
  unreadCount: () => apiClient.get('/notifications/unread-count'),
  markRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch('/notifications/read-all'),
};

export const adminAPI = {
  dashboard: () => apiClient.get('/admin/dashboard'),
  // Gestion des demandes (nouveau workflow)
  pendingBookings: () => apiClient.get('/admin/bookings/pending'),
  suggestProviders: (bookingId) => apiClient.get(`/admin/bookings/${bookingId}/providers`),
  assignProvider: (bookingId, providerId) => apiClient.patch(`/admin/bookings/${bookingId}/assign`, { provider_id: providerId }),
  // Gestion des comptes
  users: (params) => apiClient.get('/admin/users', { params }),
  pendingUsers: (params) => apiClient.get('/admin/users/pending', { params }),
  validateUser: (id) => apiClient.patch(`/admin/users/${id}/validate`),
  rejectUser: (id, reason) => apiClient.patch(`/admin/users/${id}/reject`, { reason }),
  suspendUser: (id) => apiClient.patch(`/admin/users/${id}/suspend`),
};
