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
    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('renders register link', () => {
    renderWithRouter(<Login />);
    expect(screen.getByText("S'inscrire")).toBeInTheDocument();
  });

  it('renders logo', () => {
    renderWithRouter(<Login />);
    const logos = screen.getAllByAltText('Nafissa');
    expect(logos.length).toBeGreaterThanOrEqual(1);
  });

  it('email input has correct type', () => {
    renderWithRouter(<Login />);
    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('password input has correct type', () => {
    renderWithRouter(<Login />);
    const passwordInput = screen.getByLabelText('Mot de passe');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
