import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

const mockUseAuth = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('ProtectedRoute', () => {
  it('shows spinner when loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true, isAdmin: false });
    render(
      <MemoryRouter>
        <ProtectedRoute><div>Protected</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({ user: { id: 1, role: 'maman' }, loading: false, isAdmin: false });
    render(
      <MemoryRouter>
        <ProtectedRoute><div>Protected</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText('Protected')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false, isAdmin: false });
    render(
      <MemoryRouter>
        <ProtectedRoute><div>Protected</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
  });

  it('redirects non-admin from admin route', () => {
    mockUseAuth.mockReturnValue({ user: { id: 1, role: 'maman' }, loading: false, isAdmin: false });
    render(
      <MemoryRouter>
        <ProtectedRoute adminOnly><div>Admin Page</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByText('Admin Page')).not.toBeInTheDocument();
  });

  it('allows admin to access admin route', () => {
    mockUseAuth.mockReturnValue({ user: { id: 1, role: 'admin' }, loading: false, isAdmin: true });
    render(
      <MemoryRouter>
        <ProtectedRoute adminOnly><div>Admin Page</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText('Admin Page')).toBeInTheDocument();
  });
});
