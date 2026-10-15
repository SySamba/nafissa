import { afterEach, describe, expect, it, vi } from 'vitest';
import { geocodeAddress } from './geocode.js';

describe('geocodeAddress', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('résout un quartier connu localement sans appel réseau', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const out = await geocodeAddress('Sacré-Cœur');

    expect(out).toMatchObject({ source: 'local' });
    expect(out.lat).toBeCloseTo(14.718, 2);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('interroge Nominatim pour une adresse inconnue de la carte locale', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ lat: '14.7001', lon: '-17.4501', display_name: 'Quelque part, Dakar' }],
    }));

    const out = await geocodeAddress('Adresse Imaginaire 12345');

    expect(out).toMatchObject({ source: 'nominatim', lat: 14.7001, lng: -17.4501 });
  });

  it('renvoie null si Nominatim échoue (pas d’exception)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(geocodeAddress('Adresse Imaginaire 12345')).resolves.toBeNull();
  });

  it('renvoie null si Nominatim ne trouve rien', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));

    await expect(geocodeAddress('zzzzzzzz')).resolves.toBeNull();
  });

  it('renvoie null pour une adresse vide', async () => {
    await expect(geocodeAddress('')).resolves.toBeNull();
    await expect(geocodeAddress(null)).resolves.toBeNull();
  });
});
