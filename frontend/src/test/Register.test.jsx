import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    register: vi.fn(),
  }),
}));

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('Register', () => {
  it('renders registration form', () => {
    renderWithRouter(<Register />);
    expect(screen.getByText('Créer un compte')).toBeInTheDocument();
    expect(screen.getByLabelText('Nom complet')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Téléphone')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
  });

  it('renders role selection with three options', () => {
    renderWithRouter(<Register />);
    expect(screen.getByText('Maman (Cliente)')).toBeInTheDocument();
    expect(screen.getByText('Étudiant(e)')).toBeInTheDocument();
    expect(screen.getByText('Artisan(e)')).toBeInTheDocument();
  });

  it('renders login link', () => {
    renderWithRouter(<Register />);
    expect(screen.getByText('Se connecter')).toBeInTheDocument();
  });

  it('maman role is selected by default', () => {
    renderWithRouter(<Register />);
    const mamanRadio = screen.getByDisplayValue('maman');
    expect(mamanRadio).toBeChecked();
  });

  it('renders submit button', () => {
    renderWithRouter(<Register />);
    expect(screen.getByRole('button', { name: /créer mon compte/i })).toBeInTheDocument();
  });
});
