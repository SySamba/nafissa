import { describe, expect, it } from 'vitest';
import { hideProviderForClient, publicProvider, stripUser, withPublicProvider } from './serializers.js';

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

describe('hideProviderForClient', () => {
  const booking = {
    id: 5,
    providerId: 7,
    provider: { id: 7, name: 'Awa', phone: '+221770000000', email: 'awa@x.com', idCardRecto: 'x' },
  };

  it('masks the provider identity for the client', () => {
    const out = hideProviderForClient(booking, { id: 1, role: 'maman' });
    expect(out.provider).toEqual({ id: 7, name: 'Attribué' });
    expect(out.provider.phone).toBeUndefined();
    expect(out.provider.email).toBeUndefined();
  });

  it('keeps the full provider for admin and the assigned provider', () => {
    expect(hideProviderForClient(booking, { id: 9, role: 'admin' }).provider.name).toBe('Awa');
    expect(hideProviderForClient(booking, { id: 7, role: 'artisan' }).provider.name).toBe('Awa');
  });

  it('passes through when no provider is assigned', () => {
    const unassigned = { id: 5, providerId: null, provider: null };
    expect(hideProviderForClient(unassigned, { id: 1, role: 'maman' })).toBe(unassigned);
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
