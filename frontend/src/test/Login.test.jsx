import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(),
  }),
}));

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('Login', () => {
  it('renders login form', () => {
    renderWithRouter(<Login />);
    expect(screen.getByRole('heading', { name: 'Connexion' })).toBeInTheDocument();
    expect(screen.getByLabelText(/email ou téléphone/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('renders register link', () => {
    renderWithRouter(<Login />);
    expect(screen.getByRole('link', { name: /créer un compte gratuit/i })).toBeInTheDocument();
  });

  it('renders brand NAFISSA', () => {
    renderWithRouter(<Login />);
    expect(screen.getAllByRole('link', { name: /NAFISSA/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('identifier input accepts email', () => {
    renderWithRouter(<Login />);
    const identifierInput = screen.getByLabelText(/email ou téléphone/i);
    expect(identifierInput).toHaveAttribute('required');
    expect(identifierInput.getAttribute('type')).not.toBe('password');
  });

  it('password input has password type initially', () => {
    renderWithRouter(<Login />);
    const passwordInput = screen.getByLabelText('Mot de passe');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
