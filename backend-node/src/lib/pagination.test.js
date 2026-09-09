import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { laravelPaginated, appUrl, fullResourcePath } from './pagination.js';

describe('laravelPaginated', () => {
  it('returns Laravel-like payload for page 2', () => {
    const out = laravelPaginated([{ id: 1 }, { id: 2 }], 25, 2, 10, '/api/services');

    expect(out.current_page).toBe(2);
    expect(out.data).toHaveLength(2);
    expect(out.total).toBe(25);
    expect(out.last_page).toBe(3);
    expect(out.next_page_url).toBe('/api/services?page=3');
    expect(out.prev_page_url).toBe('/api/services?page=1');
  });

  it('uses minimum page and per_page of 1', () => {
    const out = laravelPaginated([], 0, 0, -5, '/x');

    expect(out.current_page).toBe(1);
    expect(out.per_page).toBe(1);
    expect(out.first_page_url).toBe('/x?page=1');
    expect(out.from).toBeNull();
    expect(out.next_page_url).toBeNull();
  });
});

describe('appUrl', () => {
  const prevUrl = process.env.APP_URL;

  afterEach(() => {
    process.env.APP_URL = prevUrl;
  });

  it('prefers APP_URL when set', () => {
    process.env.APP_URL = 'https://api.example.com/';

    const req = {
      hostname: 'localhost',
      headers: {},
    };

    expect(appUrl(req)).toBe('https://api.example.com');
  });

  it('builds from request when APP_URL absent', () => {
    delete process.env.APP_URL;

    const req = {
      hostname: 'app.test',
      headers: {},
    };

    expect(appUrl(req)).toBe('http://app.test');
  });

  it('respects forwarded headers', () => {
    delete process.env.APP_URL;

    const req = {
      hostname: 'internal',
      headers: {
        'x-forwarded-host': 'public.host',
        'x-forwarded-proto': 'https',
      },
    };

    expect(appUrl(req)).toBe('https://public.host');
  });
});

describe('fullResourcePath', () => {
  beforeEach(() => {
    delete process.env.APP_URL;
  });

  it('concatenates appUrl with path sans query string', () => {
    const req = {
      hostname: 'srv.local',
      url: '/bookings?page=3',
      headers: {},
    };

    expect(fullResourcePath(req)).toBe('http://srv.local/bookings');
  });
});
