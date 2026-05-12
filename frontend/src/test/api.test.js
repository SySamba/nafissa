import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from '../api/client';
import { authAPI, serviceAPI, bookingAPI, paymentAPI, adminAPI } from '../api/services';

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authAPI', () => {
    it('calls register endpoint', () => {
      const data = { name: 'Test', email: 'test@test.com' };
      authAPI.register(data);
      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', data, { headers: {} });
    });

    it('calls login endpoint', () => {
      const data = { email: 'test@test.com', password: 'pass' };
      authAPI.login(data);
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', data);
    });

    it('calls logout endpoint', () => {
      authAPI.logout();
      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
    });

    it('calls me endpoint', () => {
      authAPI.me();
      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
    });
  });

  describe('serviceAPI', () => {
    it('calls list with params', () => {
      serviceAPI.list({ search: 'test' });
      expect(apiClient.get).toHaveBeenCalledWith('/services', { params: { search: 'test' } });
    });

    it('calls show endpoint', () => {
      serviceAPI.show(1);
      expect(apiClient.get).toHaveBeenCalledWith('/services/1');
    });

    it('calls create endpoint', () => {
      const data = { title: 'Test' };
      serviceAPI.create(data);
      expect(apiClient.post).toHaveBeenCalledWith('/services', data);
    });

    it('calls mine endpoint', () => {
      serviceAPI.mine();
      expect(apiClient.get).toHaveBeenCalledWith('/my-services');
    });
  });

  describe('bookingAPI', () => {
    it('calls list endpoint', () => {
      bookingAPI.list({ page: 1 });
      expect(apiClient.get).toHaveBeenCalledWith('/bookings', { params: { page: 1 } });
    });

    it('calls create endpoint', () => {
      const data = { service_id: 1 };
      bookingAPI.create(data);
      expect(apiClient.post).toHaveBeenCalledWith('/bookings', data);
    });

    it('calls updateStatus endpoint', () => {
      bookingAPI.updateStatus(1, 'acceptee');
      expect(apiClient.patch).toHaveBeenCalledWith('/bookings/1/status', { status: 'acceptee' });
    });
  });

  describe('paymentAPI', () => {
    it('calls create endpoint', () => {
      const data = { booking_id: 1, method: 'wave' };
      paymentAPI.create(data);
      expect(apiClient.post).toHaveBeenCalledWith('/payments', data);
    });

    it('calls release endpoint', () => {
      paymentAPI.release(1);
      expect(apiClient.patch).toHaveBeenCalledWith('/payments/1/release');
    });

    it('calls history endpoint', () => {
      paymentAPI.history({ page: 1 });
      expect(apiClient.get).toHaveBeenCalledWith('/payments/history', { params: { page: 1 } });
    });
  });

  describe('adminAPI', () => {
    it('calls dashboard endpoint', () => {
      adminAPI.dashboard();
      expect(apiClient.get).toHaveBeenCalledWith('/admin/dashboard');
    });

    it('calls validateUser endpoint', () => {
      adminAPI.validateUser(5);
      expect(apiClient.patch).toHaveBeenCalledWith('/admin/users/5/validate');
    });

    it('calls rejectUser endpoint', () => {
      adminAPI.rejectUser(5, 'Bad docs');
      expect(apiClient.patch).toHaveBeenCalledWith('/admin/users/5/reject', { reason: 'Bad docs' });
    });

    it('calls suspendUser endpoint', () => {
      adminAPI.suspendUser(5);
      expect(apiClient.patch).toHaveBeenCalledWith('/admin/users/5/suspend');
    });
  });
});
