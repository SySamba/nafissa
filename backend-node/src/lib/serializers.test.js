import { describe, expect, it } from 'vitest';
import { bookingForViewer, publicProvider, stripUser, withHiddenProvider, withPublicProvider } from './serializers.js';

describe('publicProvider', () => {
  const provider = {
    id: 7,
    name: 'Awa',
    role: 'artisan',
    verified: true,
    email: 'awa@x.com',
    phone: '+221770000000',
    address: 'Mermoz',
    password: 'hash',
    idCardRecto: 'id_cards/r.png',
    idCardVerso: 'id_cards/v.png',
    dateOfBirth: new Date('1990-01-01'),
    profile: { bio: 'Bio', rating: 4.5, status: 'active', documents: { x: 1 } },
  };

  it('never exposes contact details or identity documents', () => {
    const out = publicProvider(provider);
    for (const k of ['email', 'phone', 'address', 'password', 'idCardRecto', 'idCardVerso', 'dateOfBirth']) {
      expect(out[k]).toBeUndefined();
    }
    expect(out.profile.documents).toBeUndefined();
    expect(out).toMatchObject({ id: 7, name: 'Awa', verified: true, profile: { rating: 4.5, status: 'active' } });
  });

  it('wraps a service', () => {
    const out = withPublicProvider({ id: 1, title: 'T', provider });
    expect(out.title).toBe('T');
    expect(out.provider.email).toBeUndefined();
    expect(withPublicProvider(null)).toBe(null);
  });
});

describe('bookingForViewer', () => {
  const booking = {
    id: 5,
    providerId: 7,
    provider: {
      id: 7,
      name: 'Awa',
      role: 'artisan',
      verified: true,
      photo: null,
      phone: '+221770000000',
      email: 'awa@x.com',
      idCardRecto: 'x',
      profile: { rating: 4.5, status: 'active' },
    },
  };

  it('shows the public provider identity to the client, without contacts', () => {
    const out = bookingForViewer(booking, { id: 1, role: 'maman' });
    expect(out.provider.name).toBe('Awa');
    expect(out.provider.profile.rating).toBe(4.5);
    for (const k of ['phone', 'email', 'idCardRecto']) {
      expect(out.provider[k]).toBeUndefined();
    }
  });

  it('keeps the full provider for admin and the assigned provider', () => {
    expect(bookingForViewer(booking, { id: 9, role: 'admin' }).provider.phone).toBe('+221770000000');
    expect(bookingForViewer(booking, { id: 7, role: 'artisan' }).provider.phone).toBe('+221770000000');
  });

  it('passes through when no provider is assigned', () => {
    const unassigned = { id: 5, providerId: null, provider: null };
    expect(bookingForViewer(unassigned, { id: 1, role: 'maman' })).toBe(unassigned);
  });
});

describe('withHiddenProvider', () => {
  it('hides the provider and exposes an availability flag', () => {
    const service = {
      id: 1,
      title: 'T',
      providerId: 7,
      provider: { verified: true, name: 'Awa', profile: { status: 'active' } },
    };
    const out = withHiddenProvider(service);
    expect(out.provider).toBe(null);
    expect(out.provider_active).toBe(true);
    expect(out.providerId).toBe(7);
  });

  it('flags inactive provider listings', () => {
    const out = withHiddenProvider({ provider: { verified: false, profile: { status: 'pending' } } });
    expect(out.provider_active).toBe(false);
  });
});

describe('stripUser', () => {
  it('removes password and remember token', () => {
    const u = {
      id: 1,
      email: 'a@x.com',
      password: 'secret',
      rememberToken: 'tok',
      name: 'N',
    };

    const out = stripUser(u);

    expect(out.password).toBeUndefined();
    expect(out.rememberToken).toBeUndefined();
    expect(out.email).toBe('a@x.com');
    expect(out.id).toBe(1);
  });

  it('returns falsy unchanged', () => {
    expect(stripUser(null)).toBe(null);
    expect(stripUser(undefined)).toBe(undefined);
  });
});
